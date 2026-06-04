// handlers/hospitals.mjs
import { getCrmSupa, supa } from '../config/supabase.mjs'
import { json } from '../utils/response.mjs'
import { normalizeLocale } from '../utils/locale.mjs'
import { getQuery, getRequestedLocale } from '../utils/query.mjs'

const debugLog = (...args) => {
  if (process.env.DEBUG_LOGS === 'true') console.log(...args)
}

// 数据转换函数：将 city_translated 映射到 city 字段以保持前端兼容性
const transformHospitalData = (hospital) => {
  if (!hospital) return hospital

  const facilitiesInfo = hospital.facilities_info && typeof hospital.facilities_info === 'object'
    ? hospital.facilities_info
    : null
  const promotionalVideos = Array.isArray(hospital.promotional_videos)
    ? hospital.promotional_videos
    : Array.isArray(facilitiesInfo?.promotionalVideos)
      ? facilitiesInfo.promotionalVideos
      : undefined
  
  return {
    ...hospital,
    // 保持 city 字段为英文（用于筛选和URL）
    // 保持 city_translated 字段为翻译后的城市名（用于显示）
    // 不做任何转换，让前端决定显示哪个字段
    ...(promotionalVideos ? { promotional_videos: promotionalVideos } : {}),
  }
}

const getOwnershipPriority = (ownershipType) => {
  const normalized = typeof ownershipType === 'string'
    ? ownershipType.trim().toLowerCase()
    : ''

  if (normalized.includes('private') || normalized.includes('私立')) {
    return 0
  }

  if (normalized.includes('public') || normalized.includes('公立')) {
    return 1
  }

  return 2
}

const sortHospitalsByOwnershipPriority = (hospitals = []) =>
  hospitals
    .map((hospital, index) => ({ hospital, index }))
    .sort((left, right) => {
      const priorityDifference =
        getOwnershipPriority(left.hospital?.ownership_type)
        - getOwnershipPriority(right.hospital?.ownership_type)

      if (priorityDifference !== 0) {
        return priorityDifference
      }

      return left.index - right.index
    })
    .map(({ hospital }) => hospital)

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const findHospitalDetail = async (identifier, locale, select = '*') => {
  const bySlug = await supa
    .from('v_hospital_details')
    .select(select)
    .eq('slug', identifier)
    .eq('locale', locale)
    .single()

  if (bySlug.data || bySlug.error?.code !== 'PGRST116' || !UUID_REGEX.test(identifier)) {
    return bySlug
  }

  return supa
    .from('v_hospital_details')
    .select(select)
    .eq('id', identifier)
    .eq('locale', locale)
    .single()
}

// ========== 翻译解析函数 ==========

/**
 * 解析医生的翻译内容
 * @param {Object} surgeon - 原始医生数据（包含 translations JSONB）
 * @param {string} locale - 目标语言 (zh/en/kr/jp/ar/th/es/ru/fr/de)
 * @returns {Object} 解析后的医生数据
 */
const resolveSurgeonTranslations = (surgeon, locale) => {
  if (!surgeon || !surgeon.translations || !surgeon.translations[locale]) {
    return surgeon
  }

  const translated = surgeon.translations[locale]

  return {
    ...surgeon,
    // 覆盖可翻译字段 - 注意 specialties/languages/education/certifications 是 TEXT[] 类型
    name: translated.name || surgeon.name,
    title: translated.title || surgeon.title,
    specialties: translated.specialties || surgeon.specialties,
    languages: translated.languages || surgeon.languages,
    education: translated.education || surgeon.education,
    certifications: translated.certifications || surgeon.certifications,
    bio: translated.bio || surgeon.bio,
  }
}

/**
 * 解析案例的翻译内容
 * @param {Object} procedureCase - 原始案例数据（包含 translations JSONB）
 * @param {string} locale - 目标语言
 * @returns {Object} 解析后的案例数据
 */
const resolveCaseTranslations = (procedureCase, locale) => {
  if (!procedureCase || !procedureCase.translations || !procedureCase.translations[locale]) {
    return procedureCase
  }

  const translated = procedureCase.translations[locale]

  return {
    ...procedureCase,
    // 覆盖可翻译字段
    description: translated.description || procedureCase.description,
    procedure_name: translated.procedure_name || procedureCase.procedure_name,
  }
}

/**
 * Merge equipment translations into hospitals.equipment array.
 * - Base: data.equipment (array of {name, image_url, description, ...})
 * - Translations: data.equipment_translated (array of {idx, name, description})
 */
const resolveEquipmentTranslations = (hospital, locale) => {
  if (!hospital || locale === 'zh') return hospital
  if (!Array.isArray(hospital.equipment) || hospital.equipment.length === 0) return hospital
  if (!Array.isArray(hospital.equipment_translated) || hospital.equipment_translated.length === 0) return hospital

  const byIdx = new Map()
  for (const t of hospital.equipment_translated) {
    if (t && typeof t.idx === 'number') byIdx.set(t.idx, t)
  }

  const merged = hospital.equipment.map((item, idx) => {
    const t = byIdx.get(idx)
    if (!t) return item
    return {
      ...item,
      name: t.name || item.name,
      description: t.description || item.description,
    }
  })

  return { ...hospital, equipment: merged }
}

/**
 * Merge video_testimonials_translated into hospitals.video_testimonials array.
 * - Base: data.video_testimonials (array of {id, procedureName, patientCountry, ...})
 * - Translations: data.video_testimonials_translated (array of {id, procedure_name, patient_country})
 */
const resolveVideoTestimonialsTranslations = (hospital, locale) => {
  if (!hospital || locale === 'zh') return hospital
  if (!Array.isArray(hospital.video_testimonials) || hospital.video_testimonials.length === 0) return hospital
  if (!Array.isArray(hospital.video_testimonials_translated) || hospital.video_testimonials_translated.length === 0) return hospital

  const byId = new Map()
  for (const t of hospital.video_testimonials_translated) {
    if (t && t.id) byId.set(String(t.id), t)
  }

  const merged = hospital.video_testimonials.map((item) => {
    const id = item?.id ? String(item.id) : ''
    const t = id ? byId.get(id) : null
    if (!t) return item
    return {
      ...item,
      procedureName: t.procedure_name || item.procedureName,
      patientCountry: t.patient_country || item.patientCountry,
    }
  })

  return { ...hospital, video_testimonials: merged }
}

const getLocaleTranslation = (translations, locale) => {
  if (
    !translations
    || typeof translations !== 'object'
    || !locale
    || locale === 'zh'
  ) {
    return null
  }

  const normalizedLocale = normalizeLocale(locale)
  const candidates = [
    normalizedLocale,
    normalizedLocale.split('-')[0],
    normalizedLocale !== 'zh' ? 'zh' : null,
    normalizedLocale !== 'en' ? 'en' : null,
  ].filter((value, index, list) => value && list.indexOf(value) === index)

  for (const candidate of candidates) {
    const entry = Object.entries(translations).find(([translationLocale]) => normalizeLocale(translationLocale) === candidate)?.[1]
    if (entry && typeof entry === 'object') {
      return entry
    }
  }

  return null
}

const pickTranslatedString = (translation, keys, fallback = '') => {
  if (translation && typeof translation === 'object') {
    for (const key of keys) {
      const value = translation[key]
      if (typeof value === 'string' && value.trim()) {
        return value.trim()
      }
    }
  }

  return fallback
}

const normalizeStringList = (value) => {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim()
      }
      if (item && typeof item === 'object') {
        const label = typeof item.label === 'string'
          ? item.label
          : typeof item.text === 'string'
            ? item.text
            : ''
        return label.trim()
      }
      return ''
    })
    .filter(Boolean)
}

const slugifyPackageTitle = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const resolvePackageIdentifier = (row, title = '') => {
  const slug = typeof row?.slug === 'string' ? row.slug.trim() : ''
  if (slug) return slug

  const id = typeof row?.id === 'string' ? row.id.trim() : ''
  if (id) return id

  return slugifyPackageTitle(title || row?.title || '')
}

const normalizeObjectList = (value) => (
  Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : []
)

const normalizeTagList = (baseTags, translatedTags) => {
  const base = normalizeObjectList(baseTags)
  const translated = Array.isArray(translatedTags) ? translatedTags : []

  if (base.length === 0 && translated.length === 0) return []

  if (base.length === 0) {
    return translated
      .map((item) => {
        if (typeof item === 'string') {
          return { label: item.trim(), category: '' }
        }
        if (item && typeof item === 'object') {
          const label = typeof item.label === 'string'
            ? item.label.trim()
            : typeof item.text === 'string'
              ? item.text.trim()
              : ''
          const category = typeof item.category === 'string' ? item.category.trim() : ''
          return { label, category }
        }
        return null
      })
      .filter((item) => item?.label)
  }

  return base
    .map((item, index) => {
      const translatedItem = translated[index]
      const translatedLabel = typeof translatedItem === 'string'
        ? translatedItem.trim()
        : translatedItem && typeof translatedItem === 'object'
          ? typeof translatedItem.label === 'string'
            ? translatedItem.label.trim()
            : typeof translatedItem.text === 'string'
              ? translatedItem.text.trim()
              : ''
          : ''
      const translatedCategory = translatedItem && typeof translatedItem === 'object' && typeof translatedItem.category === 'string'
        ? translatedItem.category.trim()
        : ''
      const baseLabel = typeof item.label === 'string'
        ? item.label.trim()
        : typeof item.text === 'string'
          ? item.text.trim()
          : ''
      const baseCategory = typeof item.category === 'string' ? item.category.trim() : ''
      return {
        label: translatedLabel || baseLabel,
        category: translatedCategory || baseCategory,
      }
    })
    .filter((item) => item.label)
}

const normalizeIncludesList = (baseIncludes, translatedIncludes) => {
  const translated = Array.isArray(translatedIncludes) ? translatedIncludes : []

  if (translated.length > 0) {
    return translated
      .map((item) => {
        if (typeof item === 'string') return item.trim()
        if (item && typeof item === 'object') {
          const text = typeof item.text === 'string'
            ? item.text
            : typeof item.label === 'string'
              ? item.label
              : ''
          return text.trim()
        }
        return ''
      })
      .filter(Boolean)
  }

  return normalizeStringList(baseIncludes)
}

const mapTranslatedItems = (baseItems, translatedItems) => {
  const base = normalizeObjectList(baseItems)
  const translated = Array.isArray(translatedItems) ? translatedItems : []

  if (base.length === 0) {
    return translated.map((item) => (item && typeof item === 'object' ? item : null)).filter(Boolean)
  }

  const translatedById = new Map(
    translated
      .filter((item) => item && typeof item === 'object' && typeof item.id === 'string' && item.id)
      .map((item) => [item.id, item]),
  )

  return base.map((item, index) => {
    const translatedItem = typeof item.id === 'string' && item.id
      ? translatedById.get(item.id)
      : translated[index]

    return translatedItem && typeof translatedItem === 'object'
      ? { ...item, ...translatedItem }
      : item
  })
}

const formatPriceLabel = (price, currency) => {
  if (price == null || price === '') return ''

  const numeric = typeof price === 'number' ? price : Number(String(price).trim())
  const formattedPrice = Number.isFinite(numeric)
    ? new Intl.NumberFormat('en-US', {
      maximumFractionDigits: Number.isInteger(numeric) ? 0 : 2,
      minimumFractionDigits: Number.isInteger(numeric) ? 0 : 2,
    }).format(numeric)
    : String(price)

  const normalizedCurrency = typeof currency === 'string' && currency.trim() ? currency.trim() : ''
  return normalizedCurrency ? `${normalizedCurrency} ${formattedPrice}` : formattedPrice
}

const shapePublicReview = (row, locale) => {
  if (!row || typeof row !== 'object') return null

  const translation = getLocaleTranslation(row.translations, locale)
  const review = {
    id: row.id,
    patient_name: pickTranslatedString(translation, ['patientName', 'patient_name'], row.patient_name || ''),
    patient_country: pickTranslatedString(translation, ['patientCountry', 'patient_country'], row.patient_country || ''),
    treatment_name: pickTranslatedString(
      translation,
      ['treatmentName', 'treatment_name', 'procedureName', 'procedure_name'],
      row.treatment_name || '',
    ),
    review_title: pickTranslatedString(translation, ['reviewTitle', 'review_title', 'title'], row.review_title || ''),
    review_comment: pickTranslatedString(
      translation,
      ['reviewComment', 'review_comment', 'comment', 'body'],
      row.review_comment || '',
    ),
    rating: row.rating ?? null,
    review_date: row.review_date || null,
    patient_avatar_url: row.patient_avatar_url || '',
    media: Array.isArray(row.media) ? row.media : [],
  }

  if (!review.patient_name && !review.review_title && !review.review_comment) {
    return null
  }

  return review
}

const shapePublicPackage = (row, locale) => {
  if (!row || typeof row !== 'object') return null

  const translation = getLocaleTranslation(row.translations, locale)
  const tags = normalizeTagList(row.tags, translation?.tags).map((item) => item.label)
  const includes = normalizeIncludesList(row.includes, translation?.includes)
  const title = pickTranslatedString(translation, ['title', 'name'], row.title || '')
  const pkg = {
    id: row.id,
    slug: resolvePackageIdentifier(row, title),
    title,
    subtitle: pickTranslatedString(translation, ['subtitle', 'tagline'], row.subtitle || ''),
    image_url: row.cover_image_url || '',
    duration: pickTranslatedString(translation, ['duration'], row.duration || ''),
    price_label: formatPriceLabel(row.price, row.currency),
    summary: pickTranslatedString(translation, ['summary', 'description'], row.summary || ''),
    tags,
    includes,
  }

  if (!pkg.title && !pkg.summary && !pkg.image_url) {
    return null
  }

  return pkg
}

const shapePublicPackageDetail = ({ hospital, row, locale }) => {
  if (!hospital || !row || typeof row !== 'object') return null

  const translation = getLocaleTranslation(row.translations, locale)
  const gallery = normalizeObjectList(row.gallery)
    .map((item) => {
      const imageUrl = typeof item.imageUrl === 'string'
        ? item.imageUrl.trim()
        : typeof item.url === 'string'
          ? item.url.trim()
          : ''
      return imageUrl
    })
    .filter(Boolean)
  const tags = normalizeTagList(row.tags, translation?.tags)
  const includes = normalizeIncludesList(row.includes, translation?.includes)
  const process = mapTranslatedItems(row.process, translation?.process)
    .map((item) => ({
      step: typeof item.stepTitle === 'string' ? item.stepTitle.trim() : '',
      desc: typeof item.description === 'string' ? item.description.trim() : '',
    }))
    .filter((item) => item.step || item.desc)
  const cases = mapTranslatedItems(row.cases, translation?.cases)
    .map((item) => ({
      name: typeof item.patientName === 'string' ? item.patientName.trim() : '',
      age: typeof item.patientAge === 'number'
        ? item.patientAge
        : typeof item.patientAge === 'string' && item.patientAge.trim()
          ? Number(item.patientAge)
          : null,
      country: typeof item.patientCountry === 'string' ? item.patientCountry.trim() : '',
      story: typeof item.story === 'string' ? item.story.trim() : '',
      result: typeof item.result === 'string' ? item.result.trim() : '',
    }))
    .filter((item) => item.name || item.story || item.result)
  const reviews = mapTranslatedItems(row.reviews, translation?.reviews)
    .filter((item) => item.isActive !== false)
    .map((item) => ({
      name: typeof item.reviewerName === 'string' ? item.reviewerName.trim() : '',
      country: typeof item.reviewerCountry === 'string' ? item.reviewerCountry.trim() : '',
      rating: item.rating ?? null,
      date: typeof item.reviewDate === 'string' ? item.reviewDate.trim() : '',
      comment: typeof item.comment === 'string' ? item.comment.trim() : '',
    }))
    .filter((item) => item.name || item.comment)
  const location = [hospital.city, hospital.province].filter(Boolean).join(', ')
  const title = pickTranslatedString(translation, ['title', 'name'], row.title || '')
  const summary = pickTranslatedString(translation, ['summary', 'description'], row.summary || '')
  const subtitle = pickTranslatedString(translation, ['subtitle', 'tagline'], row.subtitle || '')
  const duration = pickTranslatedString(translation, ['duration'], row.duration || '')
  const coverImageUrl = row.cover_image_url || gallery[0] || ''

  if (!title && !summary && !coverImageUrl) {
    return null
  }

  return {
    id: row.id,
    slug: resolvePackageIdentifier(row, title),
    title,
    subtitle,
    cover_image_url: coverImageUrl,
    gallery,
    duration,
    price_label: formatPriceLabel(row.price, row.currency),
    summary,
    tags,
    includes,
    process,
    cases,
    reviews,
    hospital: {
      id: hospital.id || '',
      slug: hospital.slug || '',
      name: hospital.name || hospital.display_name || '',
      location,
    },
  }
}

const fetchHospitalMaterials = async (hospitalId, locale) => {
  if (!hospitalId) {
    return { packages: [], patientReviews: [] }
  }

  let crmSupa
  try {
    crmSupa = getCrmSupa()
  } catch (error) {
    console.warn('Skipping CRM hospital materials in migration bundle:', error?.message || error)
    return { packages: [], patientReviews: [] }
  }

  const [reviewsResult, packagesResult] = await Promise.all([
    crmSupa
      .from('hospital_material_reviews')
      .select('id, patient_name, patient_country, patient_avatar_url, treatment_name, review_title, review_comment, rating, review_date, media, translations')
      .eq('hospital_id', hospitalId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    crmSupa
      .from('hospital_material_packages')
      .select('id, title, subtitle, cover_image_url, duration, price, currency, summary, tags, includes, translations')
      .eq('hospital_id', hospitalId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
  ])

  if (reviewsResult.error) {
    console.error('Error fetching hospital material reviews:', reviewsResult.error)
  }
  if (packagesResult.error) {
    console.error('Error fetching hospital material packages:', packagesResult.error)
  }

  return {
    patientReviews: (reviewsResult.data || [])
      .map((row) => shapePublicReview(row, locale))
      .filter(Boolean),
    packages: (packagesResult.data || [])
      .map((row) => shapePublicPackage(row, locale))
      .filter(Boolean),
  }
}

// 获取医院列表
export const getHospitals = async (event) => {
  const q = getQuery(event)
  const requestedLocale = getRequestedLocale(event, 'zh')
  const locale = normalizeLocale(requestedLocale)
  const limit = parseInt(q.limit || '24')  // 默认改为24
  const offset = parseInt(q.offset || '0')
  const city = q.city
  const search = q.search || q.q

  debugLog('Query params:', q)
  debugLog('Parsed limit:', limit, 'offset:', offset)
  
  let query = supa
    .from('v_hospital_summary')
    .select('*', { count: 'exact' })
    .eq('locale', locale)
    .eq('status', 'approved')
  
  // 按城市筛选 - 直接使用英文城市名筛选
  if (city) {
    debugLog('Filtering by city:', city);
    debugLog('Query before filter:', query);
    query = query.eq('city', city);
    debugLog('Query after filter:', query);
  }
  
  // 搜索功能 - 搜索医院名、类型和翻译后的城市名
  if (search) {
    // v_hospital_summary no longer contains hospital_type (since 2026-03-04 view update).
    // Search across fields that are present in the summary view.
    query = query.or(
      `name.ilike.%${search}%,display_name.ilike.%${search}%,short_description.ilike.%${search}%,city_translated.ilike.%${search}%,city.ilike.%${search}%`
    )
  }
  
  // 先按原有业务排序取全量结果，再按 ownership 做分组。
  // 这里必须在分页前完成 private/public 分组，否则跨页顺序会不稳定。
  const { data, error, count } = await query
    .order('tier', { ascending: false })
    .order('bed_count', { ascending: false, nullsLast: true })
    .order('name')
  
  if (error) {
    console.error('Error fetching hospitals:', error)
    return json(400, { error: error.message })
  }
  
  debugLog(`Query returned ${data?.length || 0} hospitals, total count: ${count}`);
  debugLog('First few hospitals:', data?.slice(0, 3)?.map(h => ({ name: h.name, city: h.city, city_translated: h.city_translated })));
  
  // 转换数据：将 city_translated 映射到 city 字段
  const transformedData = sortHospitalsByOwnershipPriority(data?.map(transformHospitalData) || [])
  const paginatedData = transformedData.slice(offset, offset + limit)
  
  return json(200, {
    data: paginatedData,
    meta: {
      requested_locale: requestedLocale,
      resolved_locale: locale,
      filters: { city, search },
      pagination: {
        limit,
        offset,
        returned: paginatedData.length,
        total: count || 0
      },
      generated_at: new Date().toISOString()
    }
  })
}

// 根据slug获取医院详情
export const getHospitalBySlug = async (event) => {
  const slug = event.pathParameters?.slug
  const requestedLocale = getRequestedLocale(event, 'zh')
  const locale = normalizeLocale(requestedLocale)
  
  if (!slug) {
    return json(400, { error: 'Hospital slug is required' })
  }
  
  const { data, error } = await findHospitalDetail(slug, locale)
  
  if (error) {
    console.error('Error fetching hospital:', error)
    if (error.code === 'PGRST116') {
      return json(404, { error: 'Hospital not found' })
    }
    return json(400, { error: error.message })
  }

  // 转换数据：将 city_translated 映射到 city 字段
  const transformedData = transformHospitalData(data)

  return json(200, {
    data: transformedData,
    meta: {
      requested_locale: requestedLocale,
      resolved_locale: locale,
      slug,
      generated_at: new Date().toISOString()
    }
  })
}

// 根据slug获取医院扩展详情（包含翻译解析）
export const getHospitalExtendedBySlug = async (event) => {
  const slug = event.pathParameters?.slug
  const requestedLocale = getRequestedLocale(event, 'zh')
  const locale = normalizeLocale(requestedLocale)

  if (!slug) {
    return json(400, { error: 'Hospital slug is required' })
  }

  const { data, error } = await findHospitalDetail(slug, locale)

  if (error) {
    console.error('Error fetching hospital:', error)
    if (error.code === 'PGRST116') {
      return json(404, { error: 'Hospital not found' })
    }
    return json(400, { error: error.message })
  }

  // ========== 关键：解析医生和案例的翻译 ==========
  let resolvedData = { ...data }
  const materials = await fetchHospitalMaterials(data.id, locale)

  // Provide compatibility alias for frontends that expect "reviews"
  if (resolvedData.user_reviews && !resolvedData.reviews) {
    resolvedData.reviews = resolvedData.user_reviews
  }

  if (materials.packages.length > 0) {
    resolvedData.packages = materials.packages
  }

  if (materials.patientReviews.length > 0) {
    resolvedData.patient_reviews = materials.patientReviews
    resolvedData.reviews = materials.patientReviews
  }

  // 解析医生翻译（surgeons.translations JSONB）
  if (resolvedData.surgeons && Array.isArray(resolvedData.surgeons)) {
    resolvedData.surgeons = resolvedData.surgeons.map(surgeon =>
      resolveSurgeonTranslations(surgeon, locale)
    )
  }

  // 解析案例翻译（procedure_cases.translations JSONB）
  if (resolvedData.procedure_cases && Array.isArray(resolvedData.procedure_cases)) {
    resolvedData.procedure_cases = resolvedData.procedure_cases.map(caseItem =>
      resolveCaseTranslations(caseItem, locale)
    )
  }

  // 解析设备/视频翻译（hospital_i18n.*_translated）
  resolvedData = resolveEquipmentTranslations(resolvedData, locale)
  resolvedData = resolveVideoTestimonialsTranslations(resolvedData, locale)

  // 转换数据
  const transformedData = transformHospitalData(resolvedData)

  return json(200, {
    data: transformedData,
    meta: {
      requested_locale: requestedLocale,
      resolved_locale: locale,
      slug,
      translations_resolved: true,  // 标记已解析翻译
      generated_at: new Date().toISOString()
    }
  })
}

export const getHospitalPackageDetailBySlug = async (event) => {
  const slug = event.pathParameters?.slug
  const packageSlug = event.pathParameters?.packageSlug
  const requestedLocale = getRequestedLocale(event, 'zh')
  const locale = normalizeLocale(requestedLocale)

  if (!slug || !packageSlug) {
    return json(400, { error: 'Hospital slug and package slug are required' })
  }

  const { data: hospital, error: hospitalError } = await findHospitalDetail(
    slug,
    locale,
    'id, slug, name, display_name, city, province',
  )

  if (hospitalError) {
    console.error('Error fetching hospital shell for package detail:', hospitalError)
    if (hospitalError.code === 'PGRST116') {
      return json(404, { error: 'Hospital not found' })
    }
    return json(400, { error: hospitalError.message })
  }

  let crmSupa
  try {
    crmSupa = getCrmSupa()
  } catch (error) {
    console.warn('Hospital package detail unavailable without CRM materials env:', error?.message || error)
    return json(503, {
      error: 'Hospital package details require CRM material credentials',
      code: 'CRM_MATERIALS_UNAVAILABLE',
    })
  }

  const identifier = String(packageSlug).trim()

  const buildPackageQuery = () => crmSupa
    .from('hospital_material_packages')
    .select('id, slug, title, subtitle, cover_image_url, gallery, price, currency, duration, summary, tags, includes, process, cases, reviews, translations, is_active')
    .eq('hospital_id', hospital.id)
    .eq('is_active', true)

  const slugLookup = await buildPackageQuery().eq('slug', identifier).single()
  const shouldRetryById = !slugLookup.data && slugLookup.error?.code === 'PGRST116'
  const { data: row, error: packageError } = shouldRetryById
    ? await buildPackageQuery().eq('id', identifier).single()
    : slugLookup

  if (packageError) {
    console.error('Error fetching hospital material package detail:', packageError)
    if (packageError.code === 'PGRST116' || packageError.code === '22P02') {
      return json(404, { error: 'Package not found' })
    }
    return json(400, { error: packageError.message })
  }

  const detail = shapePublicPackageDetail({ hospital, row, locale })
  if (!detail) {
    return json(404, { error: 'Package not found' })
  }

  return json(200, {
    data: detail,
    meta: {
      requested_locale: requestedLocale,
      resolved_locale: locale,
      slug,
      package_slug: packageSlug,
      generated_at: new Date().toISOString(),
    },
  })
}

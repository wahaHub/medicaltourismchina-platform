#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_PUBLIC_MEDIA_BASE_URL = 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev'
const DEFAULT_LOCALE = 'zh'
const LEGACY_MEDIA_HOSTS = new Set([
  'd1wwcixye6at8o.cloudfront.net',
  'medchina-cloudfront.s3.amazonaws.com',
])
const R2_HOST_PATTERNS = [
  /\.r2\.dev$/i,
  /pub-364cedbcf5a84cd38214f731bce112c0\.r2\.dev$/i,
]

const args = process.argv.slice(2)
const getArg = (name, fallback = null) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}
const hasFlag = (name) => args.includes(name)

const locale = getArg('--locale', DEFAULT_LOCALE)
const outPath = getArg('--out')
const limit = Number.parseInt(getArg('--limit', '500'), 10)
const checkImages = hasFlag('--check-images')
const imageSampleLimit = Number.parseInt(getArg('--image-sample-limit', '5'), 10)

const fail = (message) => {
  console.error(message)
  process.exit(1)
}

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceRoleKey) {
  fail('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const crmSupabaseUrl = process.env.CRM_SUPABASE_URL
const crmServiceRoleKey = process.env.CRM_SUPABASE_SERVICE_ROLE_KEY
const hasCrm = Boolean(crmSupabaseUrl && crmServiceRoleKey)
const publicMediaBaseUrl = (process.env.PUBLIC_MEDIA_BASE_URL || DEFAULT_PUBLIC_MEDIA_BASE_URL).replace(/\/+$/, '')

const headersFor = (key) => ({
  apikey: key,
  authorization: `Bearer ${key}`,
  accept: 'application/json',
})

const restFetch = async (baseUrl, key, table, query) => {
  const url = `${baseUrl.replace(/\/+$/, '')}/rest/v1/${table}?${query}`
  const response = await fetch(url, { headers: headersFor(key) })
  if (!response.ok) {
    throw new Error(`${table} query failed with ${response.status}: ${await response.text()}`)
  }
  return response.json()
}

const chinaFetch = (table, params) => restFetch(
  supabaseUrl,
  serviceRoleKey,
  table,
  new URLSearchParams(params).toString(),
)

const crmFetch = (table, params) => {
  if (!hasCrm) return Promise.resolve([])
  return restFetch(
    crmSupabaseUrl,
    crmServiceRoleKey,
    table,
    new URLSearchParams(params).toString(),
  )
}

const normalizeMediaUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null
  const raw = value.trim()
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('/')) return `${publicMediaBaseUrl}${raw}`
  if (
    raw.startsWith('crm/')
    || raw.startsWith('hospital_photos/')
    || raw.startsWith('low/')
  ) {
    return `${publicMediaBaseUrl}/${raw}`
  }
  return null
}

const classifyUrl = (value) => {
  const normalized = normalizeMediaUrl(value)
  if (!normalized) {
    return { normalized: null, source: 'unknown_or_unusable', host: '', path: '' }
  }

  try {
    const url = new URL(normalized)
    const host = url.hostname
    const pathname = url.pathname
    let source = 'other_http'
    if (LEGACY_MEDIA_HOSTS.has(host)) source = 'legacy_s3_cloudfront'
    else if (R2_HOST_PATTERNS.some((pattern) => pattern.test(host))) source = 'r2_public'
    else if (pathname.includes('/low/hospitals/')) source = 'low_fallback'
    else if (pathname.includes('/hospital_photos/public/')) source = 'hospital_photos_public'
    else if (pathname.includes('/crm/')) source = 'crm_storage_key_public_base'

    if (source === 'r2_public') {
      if (pathname.includes('/low/hospitals/')) source = 'r2_low_fallback'
      else if (pathname.includes('/hospital_photos/public/')) source = 'r2_hospital_photos'
      else if (pathname.includes('/crm/')) source = 'r2_crm_storage'
    }

    return { normalized, source, host, path: pathname }
  } catch {
    return { normalized, source: 'invalid_url', host: '', path: '' }
  }
}

const addMedia = (items, value, kind, owner = '') => {
  const classified = classifyUrl(value)
  if (!classified.normalized) return
  items.push({ kind, owner, ...classified })
}

const collectDetailMedia = (detail) => {
  const items = []
  addMedia(items, detail?.hero_image_url, 'hero')
  addMedia(items, detail?.logo_url, 'logo')

  for (const [index, item] of (Array.isArray(detail?.gallery) ? detail.gallery : []).entries()) {
    addMedia(items, item?.url || item, 'gallery', String(index))
  }
  for (const [index, item] of (Array.isArray(detail?.equipment) ? detail.equipment : []).entries()) {
    addMedia(items, item?.image_url || item?.image, 'equipment', item?.name || String(index))
  }
  for (const item of Array.isArray(detail?.surgeons) ? detail.surgeons : []) {
    addMedia(items, item?.image_url, 'surgeon', item?.id || item?.name || '')
    addMedia(items, item?.images?.profile, 'surgeon_profile', item?.id || item?.name || '')
    addMedia(items, item?.images?.hero, 'surgeon_hero', item?.id || item?.name || '')
  }
  for (const item of Array.isArray(detail?.procedure_cases) ? detail.procedure_cases : []) {
    for (const [index, imageUrl] of (Array.isArray(item?.image_urls) ? item.image_urls : []).entries()) {
      addMedia(items, imageUrl, 'case_image', item?.id ? `${item.id}:${index}` : String(index))
    }
    for (const [index, mediaItem] of (Array.isArray(item?.media) ? item.media : []).entries()) {
      addMedia(items, mediaItem?.url, 'case_media', item?.id ? `${item.id}:${index}` : String(index))
      addMedia(items, mediaItem?.thumbnailUrl, 'case_media_thumbnail', item?.id ? `${item.id}:${index}` : String(index))
    }
  }
  for (const item of Array.isArray(detail?.patient_reviews || detail?.reviews || detail?.user_reviews)
    ? (detail.patient_reviews || detail.reviews || detail.user_reviews)
    : []) {
    addMedia(items, item?.patient_avatar_url, 'review_avatar', item?.id || '')
    for (const mediaItem of Array.isArray(item?.media) ? item.media : []) {
      addMedia(items, mediaItem?.url, 'review_media', item?.id || '')
      addMedia(items, mediaItem?.thumbnailUrl, 'review_media_thumbnail', item?.id || '')
    }
  }

  return items
}

const summarizeMedia = (items) => {
  const bySource = {}
  const byHost = {}
  const byKind = {}
  for (const item of items) {
    bySource[item.source] = (bySource[item.source] || 0) + 1
    byHost[item.host] = (byHost[item.host] || 0) + 1
    byKind[item.kind] = (byKind[item.kind] || 0) + 1
  }
  return { total: items.length, bySource, byHost, byKind }
}

const countArray = (value) => Array.isArray(value) ? value.length : 0

const checkUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'manual' })
    return { url, status: response.status, ok: response.status >= 200 && response.status < 400 }
  } catch (error) {
    return { url, status: 0, ok: false, error: error.message }
  }
}

const summaries = await chinaFetch('v_hospital_summary', {
  locale: `eq.${locale}`,
  status: 'eq.approved',
  select: 'id,slug,name,display_name,city,ownership_type,status,hero_image_url',
  order: 'name.asc',
  limit: String(Number.isFinite(limit) ? limit : 500),
})

const output = {
  generatedAt: new Date().toISOString(),
  locale,
  source: {
    chinaSupabaseUrl: supabaseUrl,
    crmSupabaseConfigured: hasCrm,
    publicMediaBaseUrl,
  },
  totals: {
    hospitals: summaries.length,
    withChinaDetail: 0,
    withCrmHospital: 0,
    withCrmMaterials: 0,
    mediaBySource: {},
  },
  hospitals: [],
}

for (const summary of summaries) {
  const [detailRows, chinaHospitalRows, crmHospitalRows, crmPackageRows, crmReviewRows] = await Promise.all([
    chinaFetch('v_hospital_details', {
      id: `eq.${summary.id}`,
      locale: `eq.${locale}`,
      select: '*',
      limit: '1',
    }),
    chinaFetch('hospitals', {
      id: `eq.${summary.id}`,
      select: 'id,slug,name,name_en,display_name,status,updated_at,data_source',
      limit: '1',
    }),
    crmFetch('hospitals', {
      id: `eq.${summary.id}`,
      select: 'id,name,name_en,status,type,updated_at',
      limit: '1',
    }),
    crmFetch('hospital_material_packages', {
      hospital_id: `eq.${summary.id}`,
      select: 'id,slug,is_active,cover_image_url,gallery',
      order: 'sort_order.asc,created_at.asc',
    }),
    crmFetch('hospital_material_reviews', {
      hospital_id: `eq.${summary.id}`,
      select: 'id,is_active,patient_avatar_url,media',
      order: 'sort_order.asc,created_at.asc',
    }),
  ])

  const detail = detailRows[0] || null
  const chinaHospital = chinaHospitalRows[0] || null
  const crmHospital = crmHospitalRows[0] || null
  const crmPackages = crmPackageRows || []
  const crmReviews = crmReviewRows || []

  const media = collectDetailMedia(detail || {})
  addMedia(media, summary.hero_image_url, 'summary_hero')
  for (const pkg of crmPackages) {
    addMedia(media, pkg.cover_image_url, 'crm_package_cover', pkg.id)
    for (const [index, item] of (Array.isArray(pkg.gallery) ? pkg.gallery : []).entries()) {
      addMedia(media, item?.url || item, 'crm_package_gallery', `${pkg.id}:${index}`)
    }
  }
  for (const review of crmReviews) {
    addMedia(media, review.patient_avatar_url, 'crm_review_avatar', review.id)
    for (const item of (Array.isArray(review.media) ? review.media : [])) {
      addMedia(media, item?.url, 'crm_review_media', review.id)
      addMedia(media, item?.thumbnailUrl, 'crm_review_media_thumbnail', review.id)
    }
  }

  const mediaSummary = summarizeMedia(media)
  const hasCrmMaterials = crmPackages.length > 0 || crmReviews.length > 0
  if (detail) output.totals.withChinaDetail += 1
  if (crmHospital) output.totals.withCrmHospital += 1
  if (hasCrmMaterials) output.totals.withCrmMaterials += 1
  for (const [source, count] of Object.entries(mediaSummary.bySource)) {
    output.totals.mediaBySource[source] = (output.totals.mediaBySource[source] || 0) + count
  }

  const expectedLowFallbackBase = `${publicMediaBaseUrl}/low/hospitals/public`
  const row = {
    hospitalId: summary.id,
    slug: summary.slug,
    name: summary.name,
    displayName: summary.display_name,
    city: summary.city,
    ownershipType: summary.ownership_type,
    sources: {
      chinaSummary: true,
      chinaDetail: Boolean(detail),
      chinaHospital: Boolean(chinaHospital),
      crmHospital: Boolean(crmHospital),
      crmMaterials: hasCrmMaterials,
      chinaHospitalDataSource: chinaHospital?.data_source || null,
    },
    counts: {
      gallery: countArray(detail?.gallery),
      surgeons: countArray(detail?.surgeons),
      equipment: countArray(detail?.equipment),
      procedureCases: countArray(detail?.procedure_cases),
      reviews: countArray(detail?.patient_reviews || detail?.reviews || detail?.user_reviews),
      crmPackages: crmPackages.length,
      crmReviews: crmReviews.length,
    },
    media: {
      summary: mediaSummary,
      samples: media.slice(0, imageSampleLimit),
      expectedLowFallbackSamples: [
        `${expectedLowFallbackBase}/${summary.id}_1.png`,
        `${expectedLowFallbackBase}/${summary.id}_2.png`,
      ],
    },
    warnings: [],
  }

  if (!detail) row.warnings.push('Missing v_hospital_details row')
  if (!crmHospital) row.warnings.push('Missing CRM hospitals row')
  if (mediaSummary.bySource.legacy_s3_cloudfront) row.warnings.push('Still references legacy S3/CloudFront media')
  if (mediaSummary.total === 0) row.warnings.push('No media URLs found in detail/material sources')
  if (!hasCrmMaterials && (countArray(detail?.gallery) > 0 || countArray(detail?.surgeons) > 0 || countArray(detail?.equipment) > 0)) {
    row.warnings.push('Rich detail exists outside CRM materials tables')
  }

  if (checkImages) {
    const urls = [
      ...media.slice(0, imageSampleLimit).map((item) => item.normalized),
      ...row.media.expectedLowFallbackSamples,
    ]
    row.media.imageChecks = await Promise.all(urls.map(checkUrl))
  }

  output.hospitals.push(row)
}

const serialized = `${JSON.stringify(output, null, 2)}\n`
if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, serialized)
}
process.stdout.write(serialized)

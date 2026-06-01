// handlers/procedures_updated.mjs
// Updated version to support many-to-many relationship between procedures and diseases

import { supa } from '../config/supabase.mjs'
import { json } from '../utils/response.mjs'
import { normalizeLocale } from '../utils/locale.mjs'
import { getQuery, getRequestedLocale } from '../utils/query.mjs'

const LOW_MEDIA_BASE = `${(process.env.PUBLIC_MEDIA_BASE_URL || 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev').replace(/\/+$/, '')}/low`
const debugLog = (...args) => {
  if (process.env.DEBUG_LOGS === 'true') console.log(...args)
}

// Build locale fallback candidates, e.g., en -> [en, en-us], zh -> [zh, zh-cn, zh_cn, cn]
const buildLocaleCandidates = (loc) => {
  const x = (loc || '').toLowerCase()
  if (!x) return ['en']
  switch (x) {
    case 'zh':
      return ['zh', 'zh-cn', 'zh_cn', 'cn']
    case 'en':
      return ['en', 'en-us', 'en_us']
    case 'es':
      return ['es', 'es-es', 'es_419']
    case 'fr':
      return ['fr', 'fr-fr']
    case 'de':
      return ['de', 'de-de']
    default:
      return [x]
  }
}

// Get single procedure detail with all associated diseases
export const getProcedureBySlug = async (event) => {
  const slug = event.pathParameters?.slug
  if (!slug) {
    return json(400, { error: 'Slug is required' })
  }

  const q = getQuery(event)
  // Use query param if present; fallback to Accept-Language; then default en
  const requestedLocale = getRequestedLocale(event, 'en')
  const locale = normalizeLocale(requestedLocale)
  const localeCandidates = [...new Set([...buildLocaleCandidates(locale), 'en'])]
  
  debugLog(`[DEBUG] Procedures request: ${JSON.stringify({
    queryStringParameters: q,
    requestedLocale,
    normalizedLocale: locale,
    localeCandidates,
    slug
  }, null, 2)}`)
  
  // Try to match by short-id suffix first, then full slug; fallback to EN locale if locale row missing
  // Support both full slugs with suffix and bare short-id (8 hex chars)
  const shortIdFromSuffix = slug.match(/-([0-9a-fA-F]{8})$/)
  const shortIdBare = slug.match(/^[0-9a-fA-F]{8}$/)
  const tryFetch = async (loc) => {
    // by short id from suffix
    if (shortIdFromSuffix) {
      const { data, error } = await supa
        .from('v_procedure_detail')
        .select('*')
        .ilike('slug', `%-${shortIdFromSuffix[1]}`)
        .eq('locale', loc)
        .single()
      if (!error) return { data }
    }
    // by bare short id
    if (shortIdBare) {
      const { data, error } = await supa
        .from('v_procedure_detail')
        .select('*')
        .ilike('slug', `%-${shortIdBare[0]}`)
        .eq('locale', loc)
        .single()
      if (!error) return { data }
    }
    // by full slug
    const { data, error } = await supa
      .from('v_procedure_detail')
      .select('*')
      .eq('slug', slug)
      .eq('locale', loc)
      .single()
    if (!error) return { data }
    return { error }
  }

  let data, error, resolved = null
  for (const loc of localeCandidates) {
    const res = await tryFetch(loc)
    if (res?.data) { data = res.data; resolved = loc; error = null; break }
    error = res?.error
  }
  
  if (error) {
    if (error.code === 'PGRST116') {
      return json(404, { error: 'Procedure not found' })
    }
    return json(400, { error: error.message })
  }
  
  // Transform data to include image URLs and maintain backward compatibility
  const transformedData = {
    ...data,
    // Maintain backward compatibility with single disease_id field
    disease_id: data.primary_disease_id || (data.associated_diseases?.[0]?.disease_id || null),
    
    // Add new many-to-many disease relationships
    diseases: data.associated_diseases || [],
    primary_disease: data.associated_diseases?.find(d => d.is_primary) || null,
    
    // Add CloudFront URLs for all three types of images
    image_url: `${LOW_MEDIA_BASE}/disease-illustrations/${data.id}_x2.png`,
    surgery_image_url: `${LOW_MEDIA_BASE}/surgery-illustrations/${data.id}_x2.png`,
    recovery_image_url: `${LOW_MEDIA_BASE}/recovery-illustrations/${data.id}_x2.png`
  }
  
  return json(200, {
    data: [transformedData], // Return as array to maintain consistency with frontend
    meta: {
      requested_locale: requestedLocale,
      resolved_locale: resolved || locale,
      total: 1,
      generated_at: new Date().toISOString()
    }
  })
}

// Get procedures list with disease filtering support
export const getProcedures = async (event) => {
  const q = getQuery(event)
  // Use query param if present; fallback to Accept-Language; then default en
  const requestedLocale = getRequestedLocale(event, 'en')
  const locale = normalizeLocale(requestedLocale)
  const localeCandidates = [...new Set([...buildLocaleCandidates(locale), 'en'])]
  const limit = parseInt(q.limit || '24')
  const offset = parseInt(q.offset || '0')
  const diseaseId = q.disease_id
  
  const baseQuery = () => supa
    .from('v_procedure_list')
    .select('*', { count: 'exact' })
    
  let data, error, count, resolved = null
  for (const loc of localeCandidates) {
    let q1 = baseQuery().eq('locale', loc)
    if (diseaseId) {
      q1 = q1.filter('associated_diseases', 'cs', JSON.stringify([{ disease_id: diseaseId }]))
    }
    const res = await q1.order('updated_at', { ascending: false }).range(offset, offset + limit - 1)
    if (!res.error && res.data && res.data.length > 0) {
      data = res.data; count = res.count; error = null; resolved = loc; break
    }
    if (res.error) error = res.error
  }
  
  if (error) return json(400, { error: error.message })
  
  // Transform data to include image URLs and maintain backward compatibility
  const transformedData = data?.map(item => ({
    ...item,
    // Maintain backward compatibility with single disease_id field
    disease_id: item.primary_disease_id || (item.associated_diseases?.[0]?.disease_id || null),
    
    // Add new many-to-many disease relationships
    diseases: item.associated_diseases || [],
    primary_disease: item.associated_diseases?.find(d => d.is_primary) || null,
    
    // Add image URLs
    image_url: `${LOW_MEDIA_BASE}/disease-illustrations/${item.id}_x2.png`,
    surgery_image_url: `${LOW_MEDIA_BASE}/surgery-illustrations/${item.id}_x2.png`,
    recovery_image_url: `${LOW_MEDIA_BASE}/recovery-illustrations/${item.id}_x2.png`
  })) || []
  
  return json(200, {
    data: transformedData,
    meta: {
      requested_locale: requestedLocale,
      resolved_locale: resolved || locale,
      pagination: {
        limit,
        offset,
        returned: transformedData.length,
        total: count || 0
      },
      generated_at: new Date().toISOString()
    }
  })
}

// Get procedures by disease (support for many-to-many relationship)
export const getProceduresByDisease = async (event) => {
  const diseaseId = event.pathParameters?.diseaseId
  if (!diseaseId) {
    return json(400, { error: 'Disease ID is required' })
  }

  const q = getQuery(event)
  // Use query param if present; fallback to Accept-Language; then default en
  const requestedLocale = getRequestedLocale(event, 'en')
  const locale = normalizeLocale(requestedLocale)
  const localeCandidates = [...new Set([...buildLocaleCandidates(locale), 'en'])]
  const limit = parseInt(q.limit || '24')
  const offset = parseInt(q.offset || '0')
  
  // Query the updated v_procedures_by_disease view
  let data, error, count, resolved = null
  for (const loc of localeCandidates) {
    const res = await supa
      .from('v_procedures_by_disease')
      .select('*', { count: 'exact' })
      .eq('disease_id', diseaseId)
      .eq('locale', loc)
      .order('is_primary', { ascending: false })
      .order('procedure_name', { ascending: true })
      .range(offset, offset + limit - 1)
    if (!res.error && res.data && res.data.length > 0) {
      data = res.data; count = res.count; error = null; resolved = loc; break
    }
    if (res.error) error = res.error
  }
  
  if (error) return json(400, { error: error.message })
  
  // Transform data to include image URLs
  const transformedData = data?.map(item => ({
    ...item,
    image_url: `${LOW_MEDIA_BASE}/disease-illustrations/${item.procedure_id}_x2.png`,
    surgery_image_url: `${LOW_MEDIA_BASE}/surgery-illustrations/${item.procedure_id}_x2.png`,
    recovery_image_url: `${LOW_MEDIA_BASE}/recovery-illustrations/${item.procedure_id}_x2.png`
  })) || []
  
  return json(200, {
    data: transformedData,
    meta: {
      requested_locale: requestedLocale,
      resolved_locale: resolved || locale,
      disease_id: diseaseId,
      pagination: {
        limit,
        offset,
        returned: transformedData.length,
        total: count || 0
      },
      generated_at: new Date().toISOString()
    }
  })
}

// Add procedure-disease relationship (for admin operations)
export const addProcedureDisease = async (event) => {
  const body = JSON.parse(event.body || '{}')
  const { procedure_id, disease_id, is_primary } = body
  
  if (!procedure_id || !disease_id) {
    return json(400, { error: 'procedure_id and disease_id are required' })
  }
  
  // Use the helper function from the database
  const { data, error } = await supa
    .rpc('add_procedure_disease_relationship', {
      p_procedure_id: procedure_id,
      p_disease_id: disease_id,
      p_is_primary: is_primary || false
    })
  
  if (error) return json(400, { error: error.message })
  
  return json(200, {
    data: { id: data },
    meta: {
      message: 'Procedure-disease relationship added successfully',
      generated_at: new Date().toISOString()
    }
  })
}

// Remove procedure-disease relationship (for admin operations)
export const removeProcedureDisease = async (event) => {
  const procedureId = event.pathParameters?.procedureId
  const diseaseId = event.pathParameters?.diseaseId
  
  if (!procedureId || !diseaseId) {
    return json(400, { error: 'procedure_id and disease_id are required' })
  }
  
  const { error } = await supa
    .from('procedure_diseases')
    .delete()
    .eq('procedure_id', procedureId)
    .eq('disease_id', diseaseId)
  
  if (error) return json(400, { error: error.message })
  
  return json(200, {
    meta: {
      message: 'Procedure-disease relationship removed successfully',
      generated_at: new Date().toISOString()
    }
  })
}

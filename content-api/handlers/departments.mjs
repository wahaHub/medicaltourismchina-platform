// handlers/departments.mjs
import { supa } from '../config/supabase.mjs'
import { json } from '../utils/response.mjs'
import { normalizeLocale } from '../utils/locale.mjs'
import { getQuery, getRequestedLocale } from '../utils/query.mjs'
import { debugLog } from '../middleware/logging.mjs'

// 获取科室列表
export const getDepartments = async (event) => {
  const q = getQuery(event)
  const requestedLocale = getRequestedLocale(event, 'en')
  const locale = normalizeLocale(requestedLocale)
  
  debugLog('Departments request', {
    queryStringParameters: q,
    requestedLocale,
    normalizedLocale: locale,
    headers: event.headers ? Object.keys(event.headers).reduce((acc, key) => {
      acc[key] = key.toLowerCase().includes('secret') ? '[REDACTED]' : event.headers[key]
      return acc
    }, {}) : {}
  })
  
  const query = supa
    .from('v_department_list')
    .select('id,slug,name,name_en,short_desc')
    .eq('locale', locale)
    .order('name')
  
  debugLog('Supabase query', {
    table: 'v_department_list',
    select: 'id,slug,name,name_en,short_desc',
    filter: `locale = '${locale}'`,
    order: 'name'
  })
  
  const { data, error } = await query
  
  if (error) {
    debugLog('Supabase error', { error: error.message, details: error })
    return json(400, { error: error.message })
  }
  
  debugLog('Departments response', {
    dataCount: data?.length || 0,
    sampleRecord: data?.[0] ? {
      id: data[0].id,
      slug: data[0].slug,
      name: data[0].name,
      name_en: data[0].name_en
    } : null
  })
  
  return json(200, {
    data,
    meta: {
      requested_locale: requestedLocale,
      resolved_locale: locale,
      total: data?.length || 0,
      generated_at: new Date().toISOString()
    }
  })
}

// 获取科室专业能力
export const getDepartmentCapability = async (event) => {
  const path = event.rawPath || event.path || ''
  const deptSlug = path.split('/')[2]
  const q = getQuery(event)
  const requestedLocale = getRequestedLocale(event, 'en')
  const locale = normalizeLocale(requestedLocale)
  
  const { data, error } = await supa
    .from('v_department_capability')
    .select('*')
    .eq('department_slug', deptSlug)
    .eq('locale', locale)
    .maybeSingle()
    
  if (error) return json(400, { error: error.message })
  if (!data) return json(400, { error: 'Department capability not found' })  // 改为 400 避免触发 SPA 错误页
  
  return json(200, {
    data,
    meta: {
      requested_locale: requestedLocale,
      resolved_locale: locale,
      generated_at: new Date().toISOString()
    }
  })
}

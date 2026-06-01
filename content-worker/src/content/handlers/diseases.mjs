// handlers/diseases_updated.mjs
// Updated version to support many-to-many relationship between departments and diseases

import { supa } from '../config/supabase.mjs'
import { json } from '../utils/response.mjs'
import { normalizeLocale } from '../utils/locale.mjs'
import { getQuery, getRequestedLocale } from '../utils/query.mjs'

const LOW_MEDIA_BASE = `${(process.env.PUBLIC_MEDIA_BASE_URL || 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev').replace(/\/+$/, '')}/low`

// Get diseases by department (supports many-to-many)
export const getDiseasesByDepartment = async (event) => {
  const path = event.rawPath || event.path || ''
  const deptSlug = path.split('/')[2]
  const q = getQuery(event)
  const requestedLocale = getRequestedLocale(event, 'en')
  const locale = normalizeLocale(requestedLocale)
  
  const { data, error } = await supa
    .from('v_diseases_by_department')
    .select('*')
    .eq('department_slug', deptSlug)
    .eq('locale', locale)
    .order('is_primary', { ascending: false }) // Primary diseases first
    .order('disease_name')
    
  if (error) return json(400, { error: error.message })
  
  // Transform data to match frontend expectations with backward compatibility
  const transformedData = data?.map(item => ({
    id: item.disease_id,
    slug: item.disease_slug,
    name: item.disease_name,
    name_en: item.disease_name,
    
    // Maintain backward compatibility with single dept_id field
    dept_id: item.department_id,
    department_slug: item.department_slug,
    department_name: item.department_name,
    
    // Add new many-to-many department relationships
    departments: item.associated_departments || [],
    primary_department: item.associated_departments?.find(d => d.is_primary) || null,
    is_primary: item.is_primary,
    
    procedure_count: item.procedure_count,
    wait_time_min_days: item.wait_time_min_days,
    wait_time_max_days: item.wait_time_max_days,
    updated_at: item.updated_at
  })) || []
  
  return json(200, {
    data: transformedData,
    meta: {
      requested_locale: requestedLocale,
      resolved_locale: locale,
      total: transformedData.length,
      generated_at: new Date().toISOString()
    }
  })
}

// Get procedures by disease (supports both many-to-many relationships)
export const getProceduresByDisease = async (event) => {
  const path = event.rawPath || event.path || ''
  const diseaseSlug = path.split('/')[2]
  const q = getQuery(event)
  const requestedLocale = getRequestedLocale(event, 'en')
  const locale = normalizeLocale(requestedLocale)
  
  const { data, error } = await supa
    .from('v_procedures_by_disease')
    .select('*')
    .eq('disease_slug', diseaseSlug)
    .eq('locale', locale)
    .order('is_primary_procedure', { ascending: false }) // Primary procedures first
    .order('procedure_name')
    
  if (error) return json(400, { error: error.message })
  
  // Transform data to match frontend expectations for ProcedureCard
  const transformedData = data?.map(item => ({
    id: item.procedure_id,
    slug: item.procedure_slug,
    name: item.procedure_name,
    
    // Backward compatibility
    disease_id: item.disease_id,
    disease_slug: item.disease_slug,
    disease_name: item.disease_name,
    
    // Many-to-many indicators
    is_primary_procedure: item.is_primary_procedure,
    is_primary_department: item.is_primary_department,
    
    department_id: item.department_id,
    department_slug: item.department_slug,
    department_name: item.department_name,
    
    waiting_time: item.waiting_time,
    avg_wait_days: item.waiting_time,
    price_min: item.cost_usd ? parseInt(item.cost_usd * 0.8) : 22000,
    price_max: item.cost_usd || 65000,
    cost_usd: item.cost_usd,
    stay_at_hospital: item.stay_at_hospital,
    stay_at_hotel: item.stay_at_hotel,
    stay_in_china: item.stay_in_china,
    description: item.surgery_detailed_description,
    summary: item.when_is_needed,
    preparation_before_surgery: item.preparation_before_surgery,
    recovery_process: item.recovery_process,
    surgery_options: item.surgery_options,
    faqs: item.faqs,
    surgery_steps: item.surgery_steps,
    recovery_steps: item.recovery_steps,
    image_url: `${LOW_MEDIA_BASE}/disease-illustrations/${item.procedure_id}_x2.png`,
    updated_at: item.updated_at
  })) || []
  
  return json(200, {
    data: transformedData,
    meta: {
      requested_locale: requestedLocale,
      resolved_locale: locale,
      total: transformedData.length,
      generated_at: new Date().toISOString()
    }
  })
}

// Get all diseases (with their associated departments)
export const getAllDiseases = async (event) => {
  const q = getQuery(event)
  const requestedLocale = getRequestedLocale(event, 'en')
  const locale = normalizeLocale(requestedLocale)
  const limit = parseInt(q.limit || '100')
  const offset = parseInt(q.offset || '0')
  
  const { data, error, count } = await supa
    .from('v_diseases_by_department')
    .select('*', { count: 'exact' })
    .eq('locale', locale)
    .order('disease_name')
    .range(offset, offset + limit - 1)
    
  if (error) return json(400, { error: error.message })
  
  // Group by disease to handle multiple departments
  const diseaseMap = new Map()
  
  data?.forEach(item => {
    const diseaseId = item.disease_id
    
    if (!diseaseMap.has(diseaseId)) {
      diseaseMap.set(diseaseId, {
        id: item.disease_id,
        slug: item.disease_slug,
        name: item.disease_name,
        wait_time_min_days: item.wait_time_min_days,
        wait_time_max_days: item.wait_time_max_days,
        procedure_count: item.procedure_count,
        departments: [],
        primary_department: null,
        updated_at: item.updated_at
      })
    }
    
    const disease = diseaseMap.get(diseaseId)
    
    // Add department to list if it has departments info
    if (item.associated_departments) {
      disease.departments = item.associated_departments
      disease.primary_department = item.associated_departments.find(d => d.is_primary)
    } else {
      // Fallback for single department
      disease.departments.push({
        department_id: item.department_id,
        department_slug: item.department_slug,
        department_name: item.department_name,
        is_primary: item.is_primary
      })
      
      if (item.is_primary) {
        disease.primary_department = {
          department_id: item.department_id,
          department_slug: item.department_slug,
          department_name: item.department_name,
          is_primary: true
        }
      }
    }
  })
  
  const transformedData = Array.from(diseaseMap.values())
  
  return json(200, {
    data: transformedData,
    meta: {
      requested_locale: requestedLocale,
      resolved_locale: locale,
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

// Add department-disease relationship (for admin operations)
export const addDepartmentDisease = async (event) => {
  const body = JSON.parse(event.body || '{}')
  const { department_id, disease_id, is_primary } = body
  
  if (!department_id || !disease_id) {
    return json(400, { error: 'department_id and disease_id are required' })
  }
  
  // Use the helper function from the database
  const { data, error } = await supa
    .rpc('add_department_disease_relationship', {
      p_department_id: department_id,
      p_disease_id: disease_id,
      p_is_primary: is_primary || false
    })
  
  if (error) return json(400, { error: error.message })
  
  return json(200, {
    data: { id: data },
    meta: {
      message: 'Department-disease relationship added successfully',
      generated_at: new Date().toISOString()
    }
  })
}

// Remove department-disease relationship (for admin operations)
export const removeDepartmentDisease = async (event) => {
  const departmentId = event.pathParameters?.departmentId
  const diseaseId = event.pathParameters?.diseaseId
  
  if (!departmentId || !diseaseId) {
    return json(400, { error: 'department_id and disease_id are required' })
  }
  
  const { error } = await supa
    .from('department_diseases')
    .delete()
    .eq('department_id', departmentId)
    .eq('disease_id', diseaseId)
  
  if (error) return json(400, { error: error.message })
  
  return json(200, {
    meta: {
      message: 'Department-disease relationship removed successfully',
      generated_at: new Date().toISOString()
    }
  })
}

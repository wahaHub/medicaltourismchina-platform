// handlers/featured-treatments.mjs
// Handler for featured treatments (special treatment recommendations)

import { supa } from '../config/supabase.mjs'
import { json } from '../utils/response.mjs'
import { normalizeLocale } from '../utils/locale.mjs'
import { getQuery, getRequestedLocale } from '../utils/query.mjs'

/**
 * Get list of featured treatments
 * No authentication required - public endpoint
 */
export const getFeaturedTreatments = async (event) => {
  try {
    const q = getQuery(event)
    // Prefer locale query; fallback to Accept-Language; default en
    const requestedLocale = getRequestedLocale(event, 'en')
    const locale = normalizeLocale(requestedLocale)
    const limit = parseInt(q.limit || '50')
    const offset = parseInt(q.offset || '0')
    const treatmentType = q.type // Optional filter by treatment type
    
    // Use the basic view, no fallback - if data doesn't exist for locale, return empty
    let query = supa
      .from('featured_treatments_view')
      .select('*', { count: 'exact' })
      .eq('locale', locale)
    
    // Apply type filter if provided
    if (treatmentType) {
      query = query.eq('treatment_type', treatmentType)
    }
    
    const { data, error, count } = await query
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Database error:', error)
      return json(500, { 
        error: 'Failed to fetch featured treatments',
        details: error.message 
      })
    }
    
    // Transform data for API response
    const transformedData = (data || []).map(item => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      treatment_type: item.treatment_type,
      display_order: item.display_order,
      
      // Pricing - Legacy fields
      price_locally: item.price_locally,
      price_range: item.price_range,

      // Pricing - Multi-currency fields
      price_cny: item.price_cny,
      price_cny_min: item.price_cny_min,
      price_cny_max: item.price_cny_max,
      price_usd: item.price_usd,
      price_usd_min: item.price_usd_min,
      price_usd_max: item.price_usd_max,
      price_eur: item.price_eur,
      price_eur_min: item.price_eur_min,
      price_eur_max: item.price_eur_max,
      
      // Hero content
      hero: {
        title: item.hero_title,
        subtitle: item.hero_subtitle,
        description: item.hero_description
      },
      
      // Core content (already in JSON format from database)
      key_benefits: item.key_benefits,
      problem_section: item.problem_section,
      solution_section: item.solution_section,
      why_choose_us: item.why_choose_us,
      patient_stories: item.patient_stories,
      process_flow: item.process_flow,
      faqs: item.faqs,
      suitable_conditions: item.suitable_conditions,
      hospital_partners: item.hospital_partners,
      
      // SEO
      meta: {
        title: item.meta_title,
        description: item.meta_description
      },
      
      // Statistics
      inquiry_count: item.inquiry_count,
      
      // Timestamps
      created_at: item.created_at,
      updated_at: item.updated_at
    }))
    
    return json(200, {
      data: transformedData,
      meta: {
        total: count || 0,
        limit,
        offset,
        requested_locale: requestedLocale,
        resolved_locale: locale,
        generated_at: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Handler error:', error)
    return json(500, { 
      error: 'Internal server error',
      details: error.message 
    })
  }
}

/**
 * Get single featured treatment by slug
 * No authentication required - public endpoint
 */
export const getFeaturedTreatmentBySlug = async (event) => {
  try {
    const slug = event.pathParameters?.slug
    if (!slug) {
      return json(400, { error: 'Slug is required' })
    }
    
    const q = getQuery(event)
    // Prefer locale query; fallback to Accept-Language; default en
    const requestedLocale = getRequestedLocale(event, 'en')
    const locale = normalizeLocale(requestedLocale)
    
    // First, get the featured treatment to find its procedure_id
    const { data: featuredTreatment, error: featuredError } = await supa
      .from('featured_treatments')
      .select('procedure_id')
      .eq('slug', slug)
      .single()
    
    if (featuredError) {
      if (featuredError.code === 'PGRST116') {
        return json(404, { error: 'Featured treatment not found' })
      }
      console.error('Database error:', featuredError)
      return json(500, { 
        error: 'Failed to fetch featured treatment',
        details: featuredError.message 
      })
    }
    
    // If no procedure_id is linked, return the original featured treatment data
    if (!featuredTreatment.procedure_id) {
      // Fallback to original featured treatment view
      const { data, error } = await supa
        .from('featured_treatments_view')
        .select('*')
        .eq('slug', slug)
        .eq('locale', locale)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return json(404, { error: 'Featured treatment not found' })
        }
        return json(500, { 
          error: 'Failed to fetch featured treatment',
          details: error.message 
        })
      }
      
      // Return original featured treatment data (existing logic continues here...)
      const transformedData = {
        id: data.id,
        slug: data.slug,
        name: data.name,
        treatment_type: data.treatment_type,
        display_order: data.display_order,
        
        // Pricing - Legacy fields
        price_locally: data.price_locally,
        price_range: data.price_range,

        // Pricing - Multi-currency fields
        price_cny: data.price_cny,
        price_cny_min: data.price_cny_min,
        price_cny_max: data.price_cny_max,
        price_usd: data.price_usd,
        price_usd_min: data.price_usd_min,
        price_usd_max: data.price_usd_max,
        price_eur: data.price_eur,
        price_eur_min: data.price_eur_min,
        price_eur_max: data.price_eur_max,
        
        // Hero content
        hero: {
          title: data.hero_title,
          subtitle: data.hero_subtitle,
          description: data.hero_description
        },
        
        // Core content (already in JSON format from database)
        key_benefits: data.key_benefits,
        problem_section: data.problem_section,
        solution_section: data.solution_section,
        why_choose_us: data.why_choose_us,
        patient_stories: data.patient_stories,
        process_flow: data.process_flow,
        faqs: data.faqs,
        suitable_conditions: data.suitable_conditions,
        hospital_partners: data.hospital_partners,
        
        // SEO
        meta: {
          title: data.meta_title,
          description: data.meta_description
        },
        
        // Statistics
        inquiry_count: data.inquiry_count,
        
        // Timestamps
        created_at: data.created_at,
        updated_at: data.updated_at
      }
      
      return json(200, {
        data: transformedData,
        meta: {
          requested_locale: requestedLocale,
          resolved_locale: locale,
          generated_at: new Date().toISOString()
        }
      })
    }
    
    // Get the procedure slug for redirection
    const { data: procedure, error: procedureError } = await supa
      .from('procedures')
      .select('slug')
      .eq('id', featuredTreatment.procedure_id)
      .single()
    
    if (procedureError) {
      console.error('Failed to fetch procedure:', procedureError)
      return json(500, { 
        error: 'Failed to fetch associated procedure',
        details: procedureError.message 
      })
    }
    
    // Choose response mode: JSON hint (for SPA) or HTTP redirect (for direct navigation)
    // Prefer short-id redirect: extract trailing 8-hex from procedure.slug if present
    const m = (procedure.slug || '').match(/([0-9a-fA-F]{8})$/)
    const procedureUrl = m ? `/procedures/${m[1]}` : `/procedures/${procedure.slug}`
    const preferJson = q?.no302 === '1' || q?.client === 'spa' || q?.redirect === 'client'

    if (preferJson) {
      return json(200, {
        redirect_url: procedureUrl
      })
    }

    // Return a 302 redirect to the procedures page
    return {
      statusCode: 302,
      headers: {
        'Location': procedureUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        // Note: CORS headers are handled by Lambda Function URL config
      },
      body: JSON.stringify({
        message: 'Redirecting to procedure page',
        redirect_url: procedureUrl
      })
    }
  } catch (error) {
    console.error('Handler error:', error)
    return json(500, { 
      error: 'Internal server error',
      details: error.message 
    })
  }
}

/**
 * Track user interaction with featured treatment
 * No authentication required - public endpoint
 */
export const trackFeaturedTreatment = async (event) => {
  try {
    const slug = event.pathParameters?.slug
    if (!slug) {
      return json(400, { error: 'Slug is required' })
    }
    
    const body = JSON.parse(event.body || '{}')
    const action = body.action || 'view' // view, inquiry, share
    
    // Only track inquiry actions to the database
    if (action === 'inquiry') {
      // Call the increment function
      const { error } = await supa
        .rpc('increment_featured_treatment_inquiry', { p_slug: slug })
      
      if (error) {
        console.error('Failed to track inquiry:', error)
        // Don't return error to user, just log it
      }
    }
    
    // For other actions (view, share), you might want to send to analytics service
    // e.g., Google Analytics, Mixpanel, etc.
    
    return json(200, {
      success: true,
      action,
      slug,
      tracked_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Tracking error:', error)
    // Don't fail the request for tracking errors
    return json(200, {
      success: false,
      error: 'Tracking failed but request processed'
    })
  }
}

/**
 * Get featured treatments by type
 * Convenience method for filtering by treatment type
 */
export const getFeaturedTreatmentsByType = async (event) => {
  const treatmentType = event.pathParameters?.type
  if (!treatmentType) {
    return json(400, { error: 'Treatment type is required' })
  }
  
  // Add type to query parameters and call the main function
  event.queryStringParameters = {
    ...event.queryStringParameters,
    type: treatmentType
  }
  
  return getFeaturedTreatments(event)
}

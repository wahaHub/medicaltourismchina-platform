// config/supabase.mjs
import { createClient } from '@supabase/supabase-js'

export const supa = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

let crmSupa = null

export const getCrmSupa = () => {
  if (crmSupa) {
    return crmSupa
  }

  const crmSupabaseUrl = process.env.CRM_SUPABASE_URL
  const crmSupabaseServiceRoleKey = process.env.CRM_SUPABASE_SERVICE_ROLE_KEY

  if (!crmSupabaseUrl || !crmSupabaseServiceRoleKey) {
    throw new Error('Missing CRM_SUPABASE_URL or CRM_SUPABASE_SERVICE_ROLE_KEY for hospital materials')
  }

  crmSupa = createClient(
    crmSupabaseUrl,
    crmSupabaseServiceRoleKey
  )

  return crmSupa
}

export const ORIGIN_SECRET = process.env.ORIGIN_SECRET
export const EA_WEBHOOK_SECRET = process.env.EA_WEBHOOK_SECRET

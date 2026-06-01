import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
)

let client: SupabaseClient | null = null

const createSupabaseClient = (): SupabaseClient => {
  if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured for this environment.')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // 自动检测认证状态变化
      autoRefreshToken: true,
      // 持久化认证状态
      persistSession: true,
      // 检测存储变化
      detectSessionInUrl: true
    }
  })
}

export const getSupabaseClient = (): SupabaseClient => {
  if (!client) {
    client = createSupabaseClient()
  }

  return client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const resolvedClient = getSupabaseClient()
    const value = Reflect.get(resolvedClient, prop, receiver)

    return typeof value === 'function' ? value.bind(resolvedClient) : value
  }
})

// 导出类型用于 TypeScript
export type { User, Session } from '@supabase/supabase-js'

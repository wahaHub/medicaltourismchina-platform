import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('supabaseClient', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('does not throw during import when supabase env vars are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    await expect(import('../supabaseClient')).resolves.toMatchObject({
      isSupabaseConfigured: false,
    })
  })
})

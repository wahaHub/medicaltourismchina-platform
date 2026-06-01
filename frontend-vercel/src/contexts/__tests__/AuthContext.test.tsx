import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('gracefully treats missing supabase config as logged out', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    const { AuthProvider, useAuth } = await import('../AuthContext')

    function Probe() {
      const { isLoading, isAuthenticated, user } = useAuth()

      return (
        <div data-testid="auth-state">
          {JSON.stringify({
            isLoading,
            isAuthenticated,
            hasUser: Boolean(user),
          })}
        </div>
      )
    }

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('auth-state').textContent).toBe(
        JSON.stringify({
          isLoading: false,
          isAuthenticated: false,
          hasUser: false,
        }),
      )
    })
  })
})

import { describe, expect, it, vi } from 'vitest';
import { resolveUnifiedSiteAuth } from '../site-auth';

describe('resolveUnifiedSiteAuth', () => {
  it('prefers patient auth when a patient session exists', () => {
    const patientLogout = vi.fn();
    const legacyLogout = vi.fn();

    const result = resolveUnifiedSiteAuth({
      patient: {
        isAuthenticated: true,
        patient: {
          name: 'Rosie',
          email: 'rosie@example.com',
        },
        logout: patientLogout,
      },
      legacy: {
        isAuthenticated: true,
        user: {
          name: 'Legacy User',
          email: 'legacy@example.com',
        },
        logout: legacyLogout,
      },
    });

    expect(result).toEqual({
      isAuthenticated: true,
      userLabel: 'Rosie',
      userEmail: 'rosie@example.com',
      logout: patientLogout,
      source: 'patient',
    });
  });

  it('falls back to legacy auth when no patient session exists', () => {
    const legacyLogout = vi.fn();

    const result = resolveUnifiedSiteAuth({
      patient: {
        isAuthenticated: false,
        patient: null,
        logout: vi.fn(),
      },
      legacy: {
        isAuthenticated: true,
        user: {
          name: 'Legacy User',
          email: 'legacy@example.com',
        },
        logout: legacyLogout,
      },
    });

    expect(result).toEqual({
      isAuthenticated: true,
      userLabel: 'Legacy User',
      userEmail: 'legacy@example.com',
      logout: legacyLogout,
      source: 'legacy',
    });
  });
});

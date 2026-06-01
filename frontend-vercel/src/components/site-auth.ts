type LegacyAuthUser = {
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
} | null;

type PatientAuthUser = {
  name?: string;
  email?: string;
} | null;

export type UnifiedSiteAuth = {
  isAuthenticated: boolean;
  userLabel: string | null;
  userEmail: string | null;
  logout: (() => Promise<void>) | (() => void) | null;
  source: 'patient' | 'legacy' | null;
};

export function resolveUnifiedSiteAuth(input: {
  legacy: {
    isAuthenticated: boolean;
    user: LegacyAuthUser;
    logout: (() => Promise<void>) | (() => void);
  };
  patient: {
    isAuthenticated: boolean;
    patient: PatientAuthUser;
    logout: (() => Promise<void>) | (() => void);
  };
}): UnifiedSiteAuth {
  if (input.patient.isAuthenticated) {
    return {
      isAuthenticated: true,
      userLabel: input.patient.patient?.name ?? input.patient.patient?.email ?? null,
      userEmail: input.patient.patient?.email ?? null,
      logout: input.patient.logout,
      source: 'patient',
    };
  }

  if (input.legacy.isAuthenticated) {
    const legacyName = input.legacy.user?.name
      ?? [input.legacy.user?.firstName, input.legacy.user?.lastName].filter(Boolean).join(' ')
      ?? input.legacy.user?.email
      ?? null;

    return {
      isAuthenticated: true,
      userLabel: legacyName,
      userEmail: input.legacy.user?.email ?? null,
      logout: input.legacy.logout,
      source: 'legacy',
    };
  }

  return {
    isAuthenticated: false,
    userLabel: null,
    userEmail: null,
    logout: null,
    source: null,
  };
}

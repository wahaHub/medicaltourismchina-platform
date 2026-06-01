import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  clearStoredRestoreToken,
  crmApi,
  getStoredRestoreToken,
  setStoredRestoreToken,
  shouldClearStoredRestoreToken,
  type PatientSessionJourneySnapshot,
  type PatientSessionBootstrap,
  type PatientSessionChatbotOrchestrationState,
  type PatientSessionFormalConversationState,
  type PatientSessionWidgetChatTarget,
  type PatientSessionProfile,
} from '@/services/api/crmApiClient';
import { useQueryClient } from '@tanstack/react-query';

export interface PatientProfile {
  id: string;
  caseId?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  age?: string | null;
  gender?: string | null;
  country?: string | null;
  whatsapp?: string | null;
  messenger?: string | null;
  department?: string | null;
  departmentCode?: string | null;
  disease?: string | null;
  consultationContext?: string | null;
  destination?: string | null;
  treatmentTime?: string | null;
  patientCode?: string | null;
  preferredLanguage?: string;
  nextStep?: 'select-hospitals' | 'messages-ready';
  selectedHospitalId?: string | null;
  selectedHospitalIds?: string[];
  customHospitalRequest?: string | null;
  widgetChatTarget?: PatientSessionWidgetChatTarget;
  formalConversationState?: PatientSessionFormalConversationState;
  chatbotOrchestrationState?: PatientSessionChatbotOrchestrationState;
  journeySnapshot?: PatientSessionJourneySnapshot;
}

const SESSION_REFRESH_SUPERSEDED_ERROR = 'Patient session refresh superseded';

function shouldBootstrapPatientSession(pathname: string, search: string): boolean {
  if (pathname === '/dashboard' || pathname === '/patient-login') {
    return true;
  }

  if (pathname.startsWith('/medical-case-intake') || pathname.startsWith('/case-intake')) {
    return true;
  }

  const params = new URLSearchParams(search);
  if (pathname === '/dashboard' && params.has('token')) {
    return true;
  }

  return Boolean(getStoredRestoreToken());
}

export function isPatientSessionRefreshSuperseded(error: unknown): boolean {
  return error instanceof Error && error.message === SESSION_REFRESH_SUPERSEDED_ERROR;
}

interface PatientAuthContextValue {
  patient: PatientProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastSessionValidatedAt: number | null;
  bootstrapSession: (session: PatientSessionBootstrap) => Promise<PatientSessionProfile>;
  refreshPatientSession: () => Promise<PatientProfile>;
  expirePatientSession: (message?: string) => Promise<void>;
  requestMagicLink: (email: string) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const PatientAuthContext = createContext<PatientAuthContextValue | undefined>(undefined);

function toPatientProfile(profile: PatientSessionProfile): PatientProfile {
  const id = profile.id ?? profile.patientId;

  if (!id) {
    throw new Error('Patient profile is missing an id');
  }

  return {
    id,
    caseId: profile.caseId,
    name: profile.name,
    email: profile.email,
    phone: profile.phone ?? null,
    age: profile.age ?? null,
    gender: profile.gender ?? null,
    country: profile.country ?? null,
    whatsapp: profile.whatsapp ?? null,
    messenger: profile.messenger ?? null,
    department: profile.department ?? null,
    departmentCode: profile.departmentCode ?? null,
    disease: profile.disease ?? null,
    consultationContext: profile.consultationContext ?? null,
    destination: profile.destination ?? null,
    treatmentTime: profile.treatmentTime ?? null,
    patientCode: profile.patientCode,
    preferredLanguage: profile.preferredLanguage,
    nextStep: profile.nextStep,
    selectedHospitalId: profile.selectedHospitalId,
    selectedHospitalIds: profile.selectedHospitalIds,
    customHospitalRequest: profile.customHospitalRequest ?? null,
    widgetChatTarget: profile.widgetChatTarget,
    formalConversationState: profile.formalConversationState,
    chatbotOrchestrationState: profile.chatbotOrchestrationState,
    journeySnapshot: profile.journeySnapshot,
  };
}

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const sessionStateRef = useRef({
    initialBootstrapActive: false,
    lastVerifiedToken: null as string | null,
    tokenVerificationInFlight: false,
    sessionEpoch: 0,
    lastSessionValidatedAt: null as number | null,
  });
  const patientRef = useRef<PatientProfile | null>(null);

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    patientRef.current = patient;
  }, [patient]);

  const applyPatientSession = useCallback((session: PatientSessionProfile) => {
    const nextPatient = toPatientProfile(session);
    sessionStateRef.current.lastSessionValidatedAt = Date.now();
    patientRef.current = nextPatient;
    setPatient(nextPatient);

    if (session.restoreToken) {
      setStoredRestoreToken(session.restoreToken);
    }

    return nextPatient;
  }, []);

  const applyPatientSessionForEpoch = useCallback((session: PatientSessionProfile, epoch: number) => {
    if (sessionStateRef.current.sessionEpoch !== epoch) {
      throw new Error(SESSION_REFRESH_SUPERSEDED_ERROR);
    }

    return applyPatientSession(session);
  }, [applyPatientSession]);

  const recoverPatientSession = useCallback(async (): Promise<PatientSessionProfile | null> => {
    const restoreToken = getStoredRestoreToken();

    try {
      return await crmApi.getMe();
    } catch (meError) {
      console.warn('Patient /me check failed, trying restore token:', meError);
    }

    if (!restoreToken) {
      return null;
    }

    try {
      return await crmApi.restoreSession(restoreToken);
    } catch (restoreError) {
      if (shouldClearStoredRestoreToken(restoreError)) {
        clearStoredRestoreToken();
      }
      console.warn('Patient restore session failed:', restoreError);
      return null;
    }
  }, [applyPatientSession]);

  const handleDashboardToken = useCallback(async (token: string): Promise<boolean> => {
    if (sessionStateRef.current.tokenVerificationInFlight) {
      return false;
    }

    const tokenEpoch = sessionStateRef.current.sessionEpoch;
    sessionStateRef.current.tokenVerificationInFlight = true;
    setError(null);

    try {
      const verified = await crmApi.verifyToken(token);
      applyPatientSessionForEpoch(verified, tokenEpoch);
      sessionStateRef.current.lastVerifiedToken = token;
      return true;
    } catch (tokenError) {
      if (isPatientSessionRefreshSuperseded(tokenError)) {
        return Boolean(patientRef.current);
      }
      clearStoredRestoreToken();
      patientRef.current = null;
      sessionStateRef.current.lastVerifiedToken = null;
      sessionStateRef.current.lastSessionValidatedAt = null;
      setPatient(null);
      setError(tokenError instanceof Error ? tokenError.message : 'Failed to verify patient login link');
      return false;
    } finally {
      sessionStateRef.current.tokenVerificationInFlight = false;
    }
  }, [applyPatientSessionForEpoch]);

  const requestMagicLink = useCallback(async (email: string) => {
    await crmApi.sendMagicLink(email);
  }, []);

  const loginWithPassword = useCallback(async (email: string, password: string) => {
    const loginEpoch = sessionStateRef.current.sessionEpoch;
    setError(null);
    const session = await crmApi.loginWithPassword(email, password);
    applyPatientSessionForEpoch(session, loginEpoch);
    setIsLoading(false);
  }, [applyPatientSessionForEpoch]);

  const bootstrapSession = useCallback(async (session: PatientSessionBootstrap): Promise<PatientSessionProfile> => {
    sessionStateRef.current.sessionEpoch += 1;
    const bootstrapEpoch = sessionStateRef.current.sessionEpoch;
    setError(null);
    setIsLoading(true);

    try {
      try {
        const verified = await crmApi.getMe();
        console.info('[patient-auth/bootstrap] verified via /me', {
          patientId: verified.id ?? verified.patientId ?? null,
          caseId: verified.caseId ?? null,
        });
        const verifiedWithRestoreToken = session.restoreToken
          ? { ...verified, restoreToken: session.restoreToken }
          : verified;
        applyPatientSessionForEpoch(verifiedWithRestoreToken, bootstrapEpoch);
        return verifiedWithRestoreToken;
      } catch (meError) {
        console.warn('[patient-auth/bootstrap] /me failed after onboarding; trying restore token', meError);
      }

      if (!session.restoreToken) {
        throw new Error('Patient session cookie was not available after onboarding, and no restore token was returned.');
      }

      const restored = await crmApi.restoreSession(session.restoreToken);
      console.info('[patient-auth/bootstrap] restored via restore token', {
        patientId: restored.id ?? restored.patientId ?? null,
        caseId: restored.caseId ?? null,
      });
      applyPatientSessionForEpoch(restored, bootstrapEpoch);
      return restored;
    } catch (bootstrapError) {
      if (isPatientSessionRefreshSuperseded(bootstrapError)) {
        throw bootstrapError;
      }
      const message = bootstrapError instanceof Error
        ? bootstrapError.message
        : 'Failed to bootstrap patient session';
      console.error('[patient-auth/bootstrap] failed to establish a real patient session', {
        error: message,
        onboardingPatientId: session.patientId,
        onboardingCaseId: session.caseId,
        hasRestoreToken: Boolean(session.restoreToken),
      });
      clearStoredRestoreToken();
      patientRef.current = null;
      sessionStateRef.current.lastSessionValidatedAt = null;
      setPatient(null);
      setError(message);
      throw bootstrapError instanceof Error ? bootstrapError : new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [applyPatientSessionForEpoch]);

  const refreshPatientSession = useCallback(async (): Promise<PatientProfile> => {
    const refreshEpoch = sessionStateRef.current.sessionEpoch;
    const applyIfCurrent = (session: PatientSessionProfile) => {
      setError(null);
      return applyPatientSessionForEpoch(session, refreshEpoch);
    };

    try {
      const session = await crmApi.getMe();
      return applyIfCurrent(session);
    } catch (refreshError) {
      console.warn('Patient session refresh failed:', refreshError);

      const restoreToken = getStoredRestoreToken();
      if (restoreToken) {
        try {
          const restored = await crmApi.restoreSession(restoreToken);
          return applyIfCurrent(restored);
        } catch (restoreError) {
          console.warn('Patient restore-session refresh fallback failed:', restoreError);
          if (
            sessionStateRef.current.sessionEpoch === refreshEpoch
            && shouldClearStoredRestoreToken(restoreError)
          ) {
            clearStoredRestoreToken();
          }
        }
      }

      const message = refreshError instanceof Error
        ? refreshError.message
        : 'Failed to refresh patient session';
      if (
        sessionStateRef.current.sessionEpoch === refreshEpoch
        && message.includes('Unauthorized')
      ) {
        clearStoredRestoreToken();
        patientRef.current = null;
        sessionStateRef.current.lastVerifiedToken = null;
        sessionStateRef.current.lastSessionValidatedAt = null;
        setPatient(null);
      }
      setError(message);
      throw refreshError instanceof Error ? refreshError : new Error(message);
    }
  }, [applyPatientSession]);

  const expirePatientSession = useCallback(async (message?: string) => {
    sessionStateRef.current.sessionEpoch += 1;
    clearStoredRestoreToken();
    patientRef.current = null;
    sessionStateRef.current.lastVerifiedToken = null;
    sessionStateRef.current.lastSessionValidatedAt = null;
    setPatient(null);
    setIsLoading(false);
    setError(message ?? 'Your patient session expired. Please sign in again.');

    await Promise.all([
      queryClient.removeQueries({ queryKey: ['patient-phase2'] }),
      queryClient.removeQueries({ queryKey: ['patient-dashboard'] }),
      queryClient.removeQueries({ queryKey: ['patient-conversations'] }),
    ]);
  }, [queryClient]);

  const logout = useCallback(async () => {
    sessionStateRef.current.sessionEpoch += 1;
    setIsLoading(true);
    setError(null);
    clearStoredRestoreToken();
    patientRef.current = null;
    sessionStateRef.current.lastVerifiedToken = null;
    sessionStateRef.current.lastSessionValidatedAt = null;
    setPatient(null);

    try {
      await crmApi.logout();
    } catch (logoutError) {
      console.warn('Patient logout request failed, clearing local session anyway:', logoutError);
    } finally {
      await Promise.all([
        queryClient.removeQueries({ queryKey: ['patient-phase2'] }),
        queryClient.removeQueries({ queryKey: ['patient-dashboard'] }),
        queryClient.removeQueries({ queryKey: ['patient-conversations'] }),
      ]);
      setIsLoading(false);
      navigate('/patient-login', { replace: true });
    }
  }, [navigate, queryClient]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (sessionStateRef.current.initialBootstrapActive) {
        return;
      }

      if (!shouldBootstrapPatientSession(location.pathname, location.search)) {
        setIsLoading(false);
        return;
      }

      const bootstrapEpoch = sessionStateRef.current.sessionEpoch;
      sessionStateRef.current.initialBootstrapActive = true;
      setIsLoading(true);
      setError(null);

      try {
        const token = location.pathname === '/dashboard'
          ? new URLSearchParams(location.search).get('token')
          : null;

        if (token) {
          const tokenResolved = await handleDashboardToken(token);
          if (cancelled) return;

          navigate(tokenResolved ? '/dashboard' : '/patient-login', tokenResolved
            ? { replace: true }
            : { replace: true, state: { error: 'invalid-token' } });
          return;
        }

        const recovered = await recoverPatientSession();
        if (cancelled) return;
        if (sessionStateRef.current.sessionEpoch !== bootstrapEpoch) {
          return;
        }

        if (recovered) {
          applyPatientSession(recovered);
          return;
        }

        patientRef.current = null;
        sessionStateRef.current.lastSessionValidatedAt = null;
        setPatient(null);
      } finally {
        sessionStateRef.current.initialBootstrapActive = false;
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [handleDashboardToken, location.pathname, location.search, navigate, recoverPatientSession]);

  useEffect(() => {
    if (location.pathname !== '/dashboard') {
      return;
    }

    const token = new URLSearchParams(location.search).get('token');

    if (!token) {
      return;
    }

    if (sessionStateRef.current.initialBootstrapActive) {
      return;
    }

    if (sessionStateRef.current.lastVerifiedToken === token || sessionStateRef.current.tokenVerificationInFlight) {
      return;
    }

    let cancelled = false;

    const verifyDashboardToken = async () => {
      setIsLoading(true);
      const tokenResolved = await handleDashboardToken(token);

      if (cancelled) return;

      navigate(tokenResolved ? '/dashboard' : '/patient-login', tokenResolved
        ? { replace: true }
        : { replace: true, state: { error: 'invalid-token' } });

      if (!tokenResolved && !patientRef.current) {
        setPatient(null);
      }

      setIsLoading(false);
    };

    void verifyDashboardToken();

    return () => {
      cancelled = true;
    };
  }, [handleDashboardToken, location.pathname, location.search, navigate]);

  const value = useMemo<PatientAuthContextValue>(() => ({
    patient,
    isAuthenticated: Boolean(patient),
    isLoading,
    error,
    lastSessionValidatedAt: sessionStateRef.current.lastSessionValidatedAt,
    bootstrapSession,
    refreshPatientSession,
    expirePatientSession,
    requestMagicLink,
    loginWithPassword,
    logout,
  }), [patient, isLoading, error, bootstrapSession, refreshPatientSession, expirePatientSession, requestMagicLink, loginWithPassword, logout]);

  return (
    <PatientAuthContext.Provider value={value}>
      {children}
    </PatientAuthContext.Provider>
  );
}

export function usePatientAuth() {
  const context = useContext(PatientAuthContext);

  if (!context) {
    throw new Error('usePatientAuth must be used within a PatientAuthProvider');
  }

  return context;
}

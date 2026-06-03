import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { isUnauthorizedApiError } from '@/services/api/crmApiClient';
import type { PatientSessionDetail } from '@/services/api/patient-messages';
import {
  buildFallbackPatientSessions,
  mergePatientSessionsWithFallback,
  type PatientSessionItem,
} from './session-model';
import { useActivePatientSessionController } from './useActivePatientSessionController';
import {
  useDefaultPatientSessionId,
  usePatientSessions,
} from './usePatientSessions';

const HIDDEN_PATTERNS = [
  '/login',
  '/patient-login',
  '/auth',
  '/auth/callback',
  '/hospital',
  '/hospital/',
  '/dashboard/case-intake',
  '/medical-case-intake',
  '/case-intake/',
] as const;

type PatientSessionRuntimeValue = {
  sessions: PatientSessionItem[];
  sessionsLoading: boolean;
  sessionsError: string | null;
  activeSessionId: string | null;
  activeSession: PatientSessionItem | null;
  setActiveSessionId: (sessionId: string | null) => void;
  detail: PatientSessionDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  refreshActiveSession: () => Promise<unknown>;
  connectionState: 'idle' | 'ws' | 'polling';
  isRuntimeEnabled: boolean;
  canShowSessions: boolean;
};

type ManualSessionOverride = {
  caseId: string;
  sessionId: string;
};

const PatientSessionRuntimeContext = createContext<PatientSessionRuntimeValue | undefined>(undefined);

function shouldHideRuntime(pathname: string): boolean {
  return HIDDEN_PATTERNS.some((pattern) =>
    pattern.endsWith('/') ? pathname.startsWith(pattern) : pathname === pattern || pathname.startsWith(`${pattern}/`),
  );
}

export function PatientSessionRuntimeProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  const { patient, isAuthenticated, expirePatientSession } = usePatientAuth();
  const {
    caseId,
    phase,
    isPanelOpen,
    isWidgetOpen,
    activeConversationId,
    setActiveConversationId,
    questionnaireHistoryRefreshNonce,
  } = usePatientEntry();
  const canShowSessions = phase === 'select-hospitals' || phase === 'messages-ready';
  const isHiddenRoute = shouldHideRuntime(location.pathname);
  const isDashboardPath = location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/');
  const shouldEnableRuntime = isAuthenticated
    && canShowSessions
    && !isHiddenRoute
    && (isWidgetOpen || isPanelOpen || isDashboardPath);
  const sessionScopeCaseId = shouldEnableRuntime ? (caseId ?? patient?.caseId ?? null) : null;
  const [manualSessionOverride, setManualSessionOverride] = useState<ManualSessionOverride | null>(null);
  const sessionsQuery = usePatientSessions(sessionScopeCaseId, { enabled: shouldEnableRuntime });
  const fallbackSessions = useMemo(
    () => buildFallbackPatientSessions(patient?.formalConversationState),
    [patient?.formalConversationState],
  );
  const sessions = useMemo(
    () => mergePatientSessionsWithFallback(sessionsQuery.data?.sessions, fallbackSessions),
    [fallbackSessions, sessionsQuery.data?.sessions],
  );
  const backendActiveSessionId = typeof patient?.formalConversationState?.activeConversationId === 'string'
    && patient.formalConversationState.activeConversationId.length > 0
    ? patient.formalConversationState.activeConversationId
    : null;
  const localActiveSessionId = typeof activeConversationId === 'string' && activeConversationId.length > 0
    ? activeConversationId
    : null;
  const effectiveManualOverrideId = manualSessionOverride
    && sessionScopeCaseId
    && manualSessionOverride.caseId === sessionScopeCaseId
    && sessions.some((session) => session.id === manualSessionOverride.sessionId)
    ? manualSessionOverride.sessionId
    : null;
  const authoritativeActiveSessionId = effectiveManualOverrideId ?? backendActiveSessionId ?? localActiveSessionId;
  const defaultSessionId = useDefaultPatientSessionId(sessions, authoritativeActiveSessionId);
  const selectedSessionId = effectiveManualOverrideId ?? defaultSessionId ?? authoritativeActiveSessionId;
  const activeSession = sessions.find((session) => session.id === selectedSessionId) ?? null;
  const controller = useActivePatientSessionController({
    sessionId: selectedSessionId,
    enabled: shouldEnableRuntime && Boolean(selectedSessionId),
    limit: 50,
    locale: currentLanguage.code === 'zh' ? 'zh' : 'en',
  });

  useEffect(() => {
    if (!manualSessionOverride) {
      return;
    }

    if (
      sessionScopeCaseId
      && (
        manualSessionOverride.caseId !== sessionScopeCaseId
        || !sessions.some((session) => session.id === manualSessionOverride.sessionId)
      )
    ) {
      setManualSessionOverride(null);
      return;
    }

    if (backendActiveSessionId === manualSessionOverride.sessionId) {
      setManualSessionOverride(null);
    }
  }, [backendActiveSessionId, manualSessionOverride, sessionScopeCaseId, sessions]);

  useEffect(() => {
    if (!shouldEnableRuntime) {
      return;
    }

    if (isUnauthorizedApiError(sessionsQuery.error) || isUnauthorizedApiError(controller.error)) {
      void expirePatientSession();
    }
  }, [controller.error, expirePatientSession, sessionsQuery.error, shouldEnableRuntime]);

  useEffect(() => {
    if (!shouldEnableRuntime || !selectedSessionId || questionnaireHistoryRefreshNonce === 0) {
      return;
    }

    void controller.refresh();
  }, [controller, questionnaireHistoryRefreshNonce, selectedSessionId, shouldEnableRuntime]);

  useEffect(() => {
    if (effectiveManualOverrideId && effectiveManualOverrideId !== activeConversationId) {
      setActiveConversationId(effectiveManualOverrideId);
      return;
    }

    if (defaultSessionId && defaultSessionId !== activeConversationId) {
      setActiveConversationId(defaultSessionId);
      return;
    }

    if (!defaultSessionId && authoritativeActiveSessionId && authoritativeActiveSessionId !== activeConversationId) {
      setActiveConversationId(authoritativeActiveSessionId);
      return;
    }

    if (!effectiveManualOverrideId && !sessionsQuery.isLoading && !sessionsQuery.error && sessions.length === 0 && activeConversationId) {
      setActiveConversationId(null);
    }
  }, [
    activeConversationId,
    authoritativeActiveSessionId,
    defaultSessionId,
    effectiveManualOverrideId,
    sessions.length,
    sessionsQuery.error,
    sessionsQuery.isLoading,
    setActiveConversationId,
  ]);

  const refreshActiveSession = useCallback(async () => {
    if (!selectedSessionId) {
      return null;
    }

    return controller.refresh();
  }, [controller, selectedSessionId]);

  const handleSetActiveSessionId = useCallback((sessionId: string | null) => {
    const normalizedSessionId = typeof sessionId === 'string' && sessionId.length > 0
      ? sessionId
      : null;
    setManualSessionOverride(
      normalizedSessionId && sessionScopeCaseId
        ? { caseId: sessionScopeCaseId, sessionId: normalizedSessionId }
        : null,
    );
    setActiveConversationId(normalizedSessionId);
  }, [sessionScopeCaseId, setActiveConversationId]);

  const value = useMemo<PatientSessionRuntimeValue>(() => ({
    sessions,
    sessionsLoading: sessionsQuery.isLoading,
    sessionsError: sessionsQuery.error instanceof Error ? sessionsQuery.error.message : null,
    activeSessionId: selectedSessionId,
    activeSession,
    setActiveSessionId: handleSetActiveSessionId,
    detail: controller.data ?? null,
    detailLoading: controller.isLoading,
    detailError: controller.error instanceof Error ? controller.error.message : null,
    refreshActiveSession,
    connectionState: controller.connectionState,
    isRuntimeEnabled: shouldEnableRuntime,
    canShowSessions,
  }), [
    activeSession,
    canShowSessions,
    controller.connectionState,
    controller.data,
    controller.error,
    controller.isLoading,
    refreshActiveSession,
    selectedSessionId,
    sessions,
    sessionsQuery.error,
    sessionsQuery.isLoading,
    handleSetActiveSessionId,
    shouldEnableRuntime,
  ]);

  return (
    <PatientSessionRuntimeContext.Provider value={value}>
      {children}
    </PatientSessionRuntimeContext.Provider>
  );
}

export function usePatientSessionRuntime() {
  const context = useContext(PatientSessionRuntimeContext);
  if (!context) {
    throw new Error('usePatientSessionRuntime must be used within a PatientSessionRuntimeProvider');
  }
  return context;
}

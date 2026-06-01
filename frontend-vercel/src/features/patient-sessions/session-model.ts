import type {
  PatientConversationAssistantMode,
  PatientSessionFormalConversationState,
} from '@/services/api/crmApiClient';
import type {
  PatientSessionListMeta,
  PatientSessionSummary,
  PatientSessionType,
} from '@/services/api/patient-messages';

export type PatientSessionItem = PatientSessionSummary & {
  id: string;
  displayTitle: string;
  assistantMode: PatientConversationAssistantMode;
  sessionKind: 'care-team' | 'hospital';
};

export type PatientSessionList = {
  sessions: PatientSessionItem[];
  meta: PatientSessionListMeta;
};

function isCareTeamSessionId(sessionId: string): boolean {
  return sessionId.startsWith('widget-chat:');
}

function isHospitalSessionId(sessionId: string): boolean {
  return sessionId.startsWith('hospital:');
}

export function getSessionDisplayTitle(session: Pick<PatientSessionSummary, 'type' | 'title' | 'hospitalName'>): string {
  if (session.title?.trim()) {
    return session.title.trim();
  }

  if (session.type === 'CARE_TEAM') {
    return 'Medora Care Team';
  }

  if (session.hospitalName?.trim()) {
    return session.hospitalName.trim();
  }

  return 'Hospital Conversation';
}

function toAssistantMode(
  sessionType: PatientSessionType,
  meta: PatientSessionListMeta,
  isAiAvailable: boolean,
): PatientConversationAssistantMode {
  if (sessionType === 'HOSPITAL') {
    return 'HUMAN_TAKEOVER';
  }

  return meta.chatAuthority ?? (isAiAvailable ? 'AI_ACTIVE' : 'HUMAN_TAKEOVER');
}

function sortPatientSessions(left: PatientSessionItem, right: PatientSessionItem): number {
  if (left.sessionKind !== right.sessionKind) {
    return left.sessionKind === 'hospital' ? -1 : 1;
  }

  const leftDate = left.lastMessageAt ?? left.updatedAt;
  const rightDate = right.lastMessageAt ?? right.updatedAt;
  return new Date(rightDate).getTime() - new Date(leftDate).getTime();
}

export function normalizePatientSessions(input: {
  sessions: PatientSessionSummary[];
  meta: PatientSessionListMeta;
}): PatientSessionItem[] {
  return input.sessions
    .map((session) => ({
      ...session,
      id: session.sessionId,
      displayTitle: getSessionDisplayTitle(session),
      assistantMode: toAssistantMode(session.type, input.meta, session.isAiAvailable),
      sessionKind: session.type === 'CARE_TEAM' ? 'care-team' as const : 'hospital' as const,
    }))
    .sort(sortPatientSessions);
}

export function buildFallbackPatientSessions(
  state: PatientSessionFormalConversationState | null | undefined,
): PatientSessionItem[] {
  if (!state) {
    return [];
  }

  const now = new Date(0).toISOString();
  const fallbackIds = new Set<string>();

  if (Array.isArray(state.conversationIds)) {
    for (const sessionId of state.conversationIds) {
      if (typeof sessionId === 'string' && sessionId.length > 0) {
        fallbackIds.add(sessionId);
      }
    }
  }

  if (typeof state.activeConversationId === 'string' && state.activeConversationId.length > 0) {
    fallbackIds.add(state.activeConversationId);
  }

  if (fallbackIds.size === 0) {
    return [];
  }

  return Array.from(fallbackIds)
    .map((sessionId) => {
      const isCareTeam = isCareTeamSessionId(sessionId);
      const isHospital = isHospitalSessionId(sessionId);
      const type: PatientSessionType = isCareTeam ? 'CARE_TEAM' : 'HOSPITAL';
      const assistantMode = isCareTeam
        ? (state.activeAssistantMode ?? 'HUMAN_TAKEOVER')
        : 'HUMAN_TAKEOVER';

      return {
        sessionId,
        id: sessionId,
        caseId: null,
        type,
        title: isCareTeam ? 'Medora Care Team' : 'Hospital Conversation',
        hospitalId: null,
        hospitalName: null,
        isAiAvailable: isCareTeam && state.activeAssistantMode === 'AI_ACTIVE',
        unreadCount: 0,
        lastMessagePreview: null,
        lastMessageAt: null,
        updatedAt: now,
        displayTitle: isCareTeam ? 'Medora Care Team' : 'Hospital Conversation',
        assistantMode,
        sessionKind: type === 'CARE_TEAM' ? 'care-team' : 'hospital',
      };
    })
    .sort(sortPatientSessions);
}

export function mergePatientSessionsWithFallback(
  sessions: PatientSessionItem[] | undefined,
  fallbackSessions: PatientSessionItem[],
): PatientSessionItem[] {
  const baseSessions = sessions ?? [];

  if (baseSessions.length === 0) {
    return fallbackSessions;
  }

  if (fallbackSessions.length === 0) {
    return baseSessions;
  }

  const merged = new Map<string, PatientSessionItem>();

  for (const session of baseSessions) {
    merged.set(session.id, session);
  }

  for (const session of fallbackSessions) {
    if (!merged.has(session.id)) {
      merged.set(session.id, session);
    }
  }

  return Array.from(merged.values()).sort(sortPatientSessions);
}

export function getPreferredPatientSessionId(
  sessions: PatientSessionItem[] | undefined,
  activeSessionId: string | null,
): string | null {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  if (activeSessionId && sessions.some((session) => session.id === activeSessionId)) {
    return activeSessionId;
  }

  return sessions.find((session) => session.sessionKind === 'hospital')?.id
    ?? sessions[0]?.id
    ?? null;
}

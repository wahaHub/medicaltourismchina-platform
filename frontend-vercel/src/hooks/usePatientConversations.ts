import { useMemo } from 'react';
import { patientMessagesApi, type PatientConversationMessageList, type PatientConversationRecord } from '@/services/api/patient-messages';
import {
  patientSessionKeys,
  useDefaultPatientSessionId,
  usePatientSessionDetail,
  usePatientSessions,
  useSendPatientSessionMessage,
} from '@/features/patient-sessions/usePatientSessions';
import type { PatientSessionItem } from '@/features/patient-sessions/session-model';

export type PatientConversationItem = PatientSessionItem & {
  type: 'patient-admin' | 'patient-hospital';
};

export const patientConversationKeys = {
  all: patientSessionKeys.all,
  list: patientSessionKeys.list,
  messages: patientSessionKeys.detail,
};

export function toConversationType(category: string): 'patient-admin' | 'patient-hospital' {
  return category === 'ADMIN_PATIENT' ? 'patient-admin' : 'patient-hospital';
}

export function getConversationDisplayTitle(conversation: PatientConversationRecord | PatientSessionItem): string {
  if ('displayTitle' in conversation && conversation.displayTitle) {
    return conversation.displayTitle;
  }

  if ('category' in conversation && conversation.title?.trim()) {
    return conversation.title;
  }

  if ('category' in conversation && conversation.category === 'ADMIN_PATIENT') {
    return 'Medora Care Team';
  }

  if (conversation.hospitalName?.trim()) {
    return conversation.hospitalName;
  }

  if ('type' in conversation && conversation.type === 'CARE_TEAM') {
    return 'Medora Care Team';
  }

  return 'Hospital Conversation';
}

export function normalizePatientConversations(
  conversations: Array<PatientConversationRecord | PatientSessionItem>,
  caseId?: string | null,
): PatientConversationItem[] {
  return conversations
    .filter((conversation) => !caseId || conversation.caseId === caseId)
    .map((conversation) => {
      if ('sessionKind' in conversation) {
        return {
          ...conversation,
          type: conversation.sessionKind === 'care-team' ? 'patient-admin' as const : 'patient-hospital' as const,
          displayTitle: conversation.displayTitle,
        };
      }

      return {
        ...conversation,
        type: toConversationType(conversation.category),
        displayTitle: getConversationDisplayTitle(conversation),
        sessionKind: conversation.category === 'ADMIN_PATIENT' ? 'care-team' as const : 'hospital' as const,
        id: conversation.sessionId || conversation.id,
        sessionId: conversation.sessionId || conversation.id,
        isAiAvailable: conversation.isAiAvailable ?? conversation.assistantMode === 'AI_ACTIVE',
      };
    })
    .sort((left, right) => {
      if (left.type !== right.type) {
        return left.type === 'patient-hospital' ? -1 : 1;
      }

      const leftDate = left.lastMessageAt ?? left.updatedAt;
      const rightDate = right.lastMessageAt ?? right.updatedAt;
      return new Date(rightDate).getTime() - new Date(leftDate).getTime();
    });
}

export function getPreferredConversationId(
  conversations: PatientConversationItem[] | undefined,
  activeConversationId: string | null,
): string | null {
  return getPreferredPatientSessionId(conversations, activeConversationId);
}

function getPreferredPatientSessionId(
  conversations: PatientConversationItem[] | undefined,
  activeConversationId: string | null,
): string | null {
  return conversations?.find((conversation) => conversation.id === activeConversationId)?.id
    ?? conversations?.find((conversation) => conversation.type === 'patient-hospital')?.id
    ?? conversations?.[0]?.id
    ?? null;
}

export function usePatientConversations(caseId?: string | null, options?: { enabled?: boolean }) {
  const query = usePatientSessions(caseId, options);

  return useMemo(() => ({
    ...query,
    data: query.data ? normalizePatientConversations(query.data.sessions, caseId) : undefined,
  }), [caseId, query]);
}

export function useConversationMessages(conversationId: string | null, limit = 100) {
  const query = usePatientSessionDetail(conversationId, limit);

  return useMemo(() => ({
    ...query,
    data: query.data
      ? {
          sessionId: query.data.sessionId,
          assistantMode: query.data.chatAuthority ?? (query.data.isAiAvailable ? 'AI_ACTIVE' : 'HUMAN_TAKEOVER'),
          data: query.data.data.filter((message) => message.source !== 'CHATBOT'),
          total: query.data.data.filter((message) => message.source !== 'CHATBOT').length,
          page: query.data.page,
          limit: query.data.limit,
          totalPages: query.data.totalPages,
          hasMore: query.data.hasMore,
          title: query.data.title,
          type: query.data.type,
        } satisfies PatientConversationMessageList
      : undefined,
  }), [query]);
}

export function useSendConversationMessage(conversationId: string | null) {
  return useSendPatientSessionMessage(conversationId);
}

export function useDefaultConversationId(
  conversations: PatientConversationItem[] | undefined,
  activeConversationId: string | null,
) {
  return useDefaultPatientSessionId(conversations, activeConversationId);
}

export { patientMessagesApi };

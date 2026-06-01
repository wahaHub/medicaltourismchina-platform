import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  patientMessagesApi,
  type PatientConversationMessage,
  type PatientSessionDetail,
} from '@/services/api/patient-messages';
import {
  getPreferredPatientSessionId,
  normalizePatientSessions,
  type PatientSessionItem,
} from './session-model';

export const patientSessionKeys = {
  all: ['patient-sessions'] as const,
  list: (caseId?: string | null) => ['patient-sessions', 'list', caseId ?? 'all'] as const,
  detail: (sessionId: string) => ['patient-sessions', 'detail', sessionId] as const,
};

function mergeMessageIntoDetail(
  current: PatientSessionDetail | undefined,
  message: PatientConversationMessage,
): PatientSessionDetail | undefined {
  if (!current) {
    return current;
  }

  const existing = current.data.find((item) => item.id === message.id);
  const nextData = existing
    ? current.data.map((item) => (item.id === message.id ? { ...item, ...message } : item))
    : [...current.data, message];

  nextData.sort((left, right) =>
    new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );

  return {
    ...current,
    data: nextData,
    total: existing ? current.total : current.total + 1,
  };
}

export function usePatientSessions(caseId?: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: patientSessionKeys.list(caseId),
    queryFn: () => patientMessagesApi.listSessions({ caseId }),
    enabled: options?.enabled ?? true,
    select: (response) => ({
      ...response,
      sessions: normalizePatientSessions(response),
    }),
  });
}

export function usePatientSessionDetail(sessionId: string | null, limit = 100, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: sessionId ? patientSessionKeys.detail(sessionId) : ['patient-sessions', 'detail', 'idle'],
    queryFn: async () => {
      if (!sessionId) {
        throw new Error('Session id is required');
      }

      return patientMessagesApi.getSessionMessages({
        sessionId,
        limit,
      });
    },
    enabled: Boolean(sessionId) && (options?.enabled ?? true),
    select: (result) => ({
      ...result,
      data: [...result.data].sort((left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
      ),
    }),
  });
}

export function useDefaultPatientSessionId(
  sessions: PatientSessionItem[] | undefined,
  activeSessionId: string | null,
) {
  return useMemo(() => getPreferredPatientSessionId(sessions, activeSessionId), [activeSessionId, sessions]);
}

export function useSendPatientSessionMessage(sessionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      content: string;
      messageType?: 'TEXT' | 'IMAGE' | 'FILE';
      attachments?: Array<{
        fileName: string;
        mimeType: string;
        fileSize: number;
        storageKey: string;
      }>;
    }) => {
      if (!sessionId) {
        throw new Error('Session id is required');
      }

      return patientMessagesApi.sendSessionMessage({
        sessionId,
        ...input,
      });
    },
    onSuccess: (message) => {
      if (!sessionId) {
        return;
      }

      queryClient.setQueryData<PatientSessionDetail | undefined>(
        patientSessionKeys.detail(sessionId),
        (current) => mergeMessageIntoDetail(current, message),
      );
      void queryClient.invalidateQueries({ queryKey: patientSessionKeys.all });
    },
  });
}

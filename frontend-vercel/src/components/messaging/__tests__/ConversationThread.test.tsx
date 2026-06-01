import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ConversationThread from '../ConversationThread';
import { usePatientSessionRuntime } from '@/features/patient-sessions/PatientSessionRuntimeProvider';
import { useSendPatientSessionMessage } from '@/features/patient-sessions/usePatientSessions';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/features/patient-sessions/PatientSessionRuntimeProvider', () => ({
  usePatientSessionRuntime: vi.fn(),
}));

vi.mock('@/features/patient-sessions/usePatientSessions', () => ({
  useSendPatientSessionMessage: vi.fn(),
}));

describe('ConversationThread', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useSendPatientSessionMessage).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);
  });

  it('prefers live detail authority over the stale session list for care-team gating', () => {
    vi.mocked(usePatientSessionRuntime).mockReturnValue({
      detail: {
        sessionId: 'widget-chat:patient-1:case-1',
        caseId: 'case-1',
        type: 'CARE_TEAM',
        title: 'Medora Care Team',
        hospitalId: null,
        hospitalName: null,
        isAiAvailable: false,
        chatAuthority: 'HUMAN_TAKEOVER',
        data: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 1,
        hasMore: false,
      },
      detailLoading: false,
      detailError: null,
      refreshActiveSession: vi.fn(),
    } as never);

    render(
      <ConversationThread
        conversation={{
          id: 'widget-chat:patient-1:case-1',
          sessionId: 'widget-chat:patient-1:case-1',
          caseId: 'case-1',
          type: 'CARE_TEAM',
          title: 'Medora Care Team',
          hospitalId: null,
          hospitalName: null,
          isAiAvailable: true,
          unreadCount: 0,
          lastMessagePreview: null,
          lastMessageAt: null,
          updatedAt: '2026-04-18T00:00:00.000Z',
          displayTitle: 'Medora Care Team',
          assistantMode: 'AI_ACTIVE',
          sessionKind: 'care-team',
        }}
      />,
    );

    expect(screen.getByText('Coordinate next steps with Medora AI and the Medora care team.')).toBeTruthy();
    expect(screen.queryByText('Medora AI is still active in the main care-team session. Continue the conversation from the patient chat widget until a human takes over.')).toBeNull();
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).disabled).toBe(false);
  });
});

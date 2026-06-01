import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PatientMessagePanel from '../PatientMessagePanel';
import { useLocation } from 'react-router-dom';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { usePatientSessionRuntime } from '@/features/patient-sessions/PatientSessionRuntimeProvider';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

vi.mock('@/hooks/usePatientAuth', () => ({
  usePatientAuth: vi.fn(),
}));

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: vi.fn(),
}));

vi.mock('@/features/patient-sessions/PatientSessionRuntimeProvider', () => ({
  usePatientSessionRuntime: vi.fn(),
}));

vi.mock('../ConversationList', () => ({
  default: ({ activeConversationId }: { activeConversationId: string | null }) => (
    <div
      data-testid="conversation-list"
      data-active-conversation-id={activeConversationId ?? ''}
    />
  ),
}));

vi.mock('../ConversationThread', () => ({
  default: ({ conversation }: { conversation: { id: string; displayTitle: string } | null }) => (
    <div
      data-testid="conversation-thread"
      data-conversation-id={conversation?.id ?? ''}
      data-conversation-title={conversation?.displayTitle ?? ''}
    />
  ),
}));

describe('PatientMessagePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLocation).mockReturnValue({
      pathname: '/dashboard',
    } as never);

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        id: 'patient-1',
        caseId: 'case-1',
      },
      isAuthenticated: true,
    } as never);

    vi.mocked(usePatientEntry).mockReturnValue({
      phase: 'messages-ready',
      isPanelOpen: true,
      closePanel: vi.fn(),
    } as never);

    vi.mocked(usePatientSessionRuntime).mockReturnValue({
      sessions: [
        {
          id: 'widget-chat:patient-1:case-1',
          sessionId: 'widget-chat:patient-1:case-1',
          caseId: 'case-1',
          type: 'CARE_TEAM',
          sessionKind: 'care-team',
          title: 'Medora Care Team',
          displayTitle: 'Medora Care Team',
          hospitalId: null,
          hospitalName: null,
          assistantMode: 'AI_ACTIVE',
          isAiAvailable: true,
          unreadCount: 0,
          lastMessagePreview: 'Care team ready',
          lastMessageAt: '2026-04-18T00:02:00.000Z',
          updatedAt: '2026-04-18T00:02:00.000Z',
        },
      ],
      sessionsLoading: false,
      sessionsError: null,
      activeSessionId: 'widget-chat:patient-1:case-1',
      activeSession: {
        id: 'widget-chat:patient-1:case-1',
        sessionId: 'widget-chat:patient-1:case-1',
        caseId: 'case-1',
        type: 'CARE_TEAM',
        sessionKind: 'care-team',
        title: 'Medora Care Team',
        displayTitle: 'Medora Care Team',
        hospitalId: null,
        hospitalName: null,
        assistantMode: 'AI_ACTIVE',
        isAiAvailable: true,
        unreadCount: 0,
        lastMessagePreview: 'Care team ready',
        lastMessageAt: '2026-04-18T00:02:00.000Z',
        updatedAt: '2026-04-18T00:02:00.000Z',
      },
      setActiveSessionId: vi.fn(),
      detail: null,
      detailLoading: false,
      detailError: null,
      refreshActiveSession: vi.fn(),
      connectionState: 'ws',
      isRuntimeEnabled: true,
      canShowSessions: true,
    } as never);
  });

  it('renders the runtime-backed conversation shell and active session', () => {
    render(<PatientMessagePanel />);

    expect(screen.getByTestId('conversation-list').getAttribute('data-active-conversation-id')).toBe(
      'widget-chat:patient-1:case-1',
    );
    expect(screen.getByTestId('conversation-thread').getAttribute('data-conversation-id')).toBe(
      'widget-chat:patient-1:case-1',
    );
    expect(screen.getByTestId('conversation-thread').getAttribute('data-conversation-title')).toBe(
      'Medora Care Team',
    );
  });

  it('shows a setup gate before formal sessions are unlocked', () => {
    vi.mocked(usePatientEntry).mockReturnValue({
      phase: 'collect-profile',
      isPanelOpen: true,
      closePanel: vi.fn(),
    } as never);

    render(<PatientMessagePanel />);

    expect(screen.getByText('Complete patient setup first')).toBeDefined();
    expect(screen.queryByTestId('conversation-list')).toBeNull();
    expect(screen.queryByTestId('conversation-thread')).toBeNull();
  });

  it('does not render anything when the patient is unauthenticated', () => {
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: null,
      isAuthenticated: false,
    } as never);

    const { container } = render(<PatientMessagePanel />);

    expect(container.firstChild).toBeNull();
  });

  it('shows the empty runtime placeholder when no active session exists yet', () => {
    vi.mocked(usePatientSessionRuntime).mockReturnValue({
      sessions: [],
      sessionsLoading: false,
      sessionsError: null,
      activeSessionId: null,
      activeSession: null,
      setActiveSessionId: vi.fn(),
      detail: null,
      detailLoading: false,
      detailError: null,
      refreshActiveSession: vi.fn(),
      connectionState: 'idle',
      isRuntimeEnabled: true,
      canShowSessions: true,
    } as never);

    render(<PatientMessagePanel />);

    expect(screen.getByText('No active conversation')).toBeDefined();
  });
});

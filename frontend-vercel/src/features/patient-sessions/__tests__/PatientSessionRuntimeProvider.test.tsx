import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/services/api/crmApiClient';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { PatientSessionRuntimeProvider, usePatientSessionRuntime } from '../PatientSessionRuntimeProvider';
import { useActivePatientSessionController } from '../useActivePatientSessionController';
import { useDefaultPatientSessionId, usePatientSessions } from '../usePatientSessions';

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(() => ({ pathname: '/dashboard' })),
}));

vi.mock('@/hooks/usePatientAuth', () => ({
  usePatientAuth: vi.fn(),
}));

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: vi.fn(),
}));

vi.mock('../usePatientSessions', () => ({
  usePatientSessions: vi.fn(),
  useDefaultPatientSessionId: vi.fn(),
}));

vi.mock('../useActivePatientSessionController', () => ({
  useActivePatientSessionController: vi.fn(),
}));

function RuntimeProbe() {
  const runtime = usePatientSessionRuntime();
  return (
    <div>
      <div data-testid="connection-state">{runtime.connectionState}</div>
      <div data-testid="active-session-id">{runtime.activeSessionId ?? ''}</div>
      <div data-testid="session-count">{runtime.sessions.length}</div>
      <button type="button" onClick={() => runtime.setActiveSessionId('hospital:hospital-1:case-1')}>
        Switch to hospital
      </button>
    </div>
  );
}

function SelectSessionOnMount({ sessionId }: { sessionId: string }) {
  const { activeSessionId, setActiveSessionId } = usePatientSessionRuntime();

  useEffect(() => {
    setActiveSessionId(sessionId);
  }, [sessionId, setActiveSessionId]);

  return <div data-testid="active-session-id">{activeSessionId ?? ''}</div>;
}

describe('PatientSessionRuntimeProvider', () => {
  let patientEntryState: Record<string, unknown>;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: { caseId: 'case-1' },
      isAuthenticated: true,
      expirePatientSession: vi.fn(),
    } as never);

    patientEntryState = {
      caseId: 'case-1',
      phase: 'messages-ready',
      isPanelOpen: false,
      isWidgetOpen: true,
      activeConversationId: 'widget-chat:patient-1:case-1',
      setActiveConversationId: vi.fn(),
      questionnaireHistoryRefreshNonce: 0,
    };

    vi.mocked(usePatientEntry).mockImplementation(() => patientEntryState as never);

    vi.mocked(usePatientSessions).mockReturnValue({
      data: {
        sessions: [{
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
        }],
      },
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useDefaultPatientSessionId).mockReturnValue('widget-chat:patient-1:case-1');
    vi.mocked(useActivePatientSessionController).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      connectionState: 'ws',
      refresh: vi.fn(),
    } as never);
  });

  function renderProvider(children: ReactNode = <RuntimeProbe />) {
    return render(
      <PatientSessionRuntimeProvider>
        {children}
      </PatientSessionRuntimeProvider>,
    );
  }

  it('expires the patient session when the sessions query returns 401', async () => {
    const expirePatientSession = vi.fn();
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: { caseId: 'case-1' },
      isAuthenticated: true,
      expirePatientSession,
    } as never);

    vi.mocked(usePatientSessions).mockReturnValue({
      data: { sessions: [] },
      isLoading: false,
      error: new ApiError('Unauthorized', 401),
    } as never);

    renderProvider();

    await waitFor(() => {
      expect(expirePatientSession).toHaveBeenCalledTimes(1);
    });
  });

  it('expires the patient session when the active detail query returns 401', async () => {
    const expirePatientSession = vi.fn();
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: { caseId: 'case-1' },
      isAuthenticated: true,
      expirePatientSession,
    } as never);

    vi.mocked(useActivePatientSessionController).mockReturnValue({
      data: null,
      isLoading: false,
      error: new ApiError('Unauthorized', 401),
      connectionState: 'idle',
      refresh: vi.fn(),
    } as never);

    renderProvider();

    await waitFor(() => {
      expect(expirePatientSession).toHaveBeenCalledTimes(1);
    });
  });

  it('refreshes the active session when questionnaire history requests a refresh', async () => {
    const refresh = vi.fn();
    vi.mocked(useActivePatientSessionController).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      connectionState: 'ws',
      refresh,
    } as never);

    const { rerender } = renderProvider();

    expect(refresh).not.toHaveBeenCalled();

    patientEntryState = {
      ...patientEntryState,
      questionnaireHistoryRefreshNonce: 1,
    };

    rerender(
      <PatientSessionRuntimeProvider>
        <RuntimeProbe />
      </PatientSessionRuntimeProvider>,
    );

    await waitFor(() => {
      expect(refresh).toHaveBeenCalledTimes(1);
    });
  });

  it('falls back to authoritative patient session state when the session list is temporarily empty', async () => {
    const setActiveConversationId = vi.fn();
    patientEntryState = {
      ...patientEntryState,
      activeConversationId: null,
      setActiveConversationId,
    };

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        caseId: 'case-1',
        formalConversationState: {
          activeConversationId: 'widget-chat:patient-1:case-1',
          conversationIds: [
            'widget-chat:patient-1:case-1',
            'hospital:hospital-1:case-1',
          ],
          activeAssistantMode: 'HUMAN_TAKEOVER',
        },
      },
      isAuthenticated: true,
      expirePatientSession: vi.fn(),
    } as never);

    vi.mocked(usePatientSessions).mockReturnValue({
      data: {
        sessions: [],
      },
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useDefaultPatientSessionId).mockImplementation((sessions, activeSessionId) => {
      if (sessions && sessions.length > 0) {
        return activeSessionId ?? sessions[0]?.id ?? null;
      }
      return activeSessionId ?? null;
    });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('active-session-id').textContent).toBe('widget-chat:patient-1:case-1');
      expect(screen.getByTestId('session-count').textContent).toBe('2');
    });

    expect(useActivePatientSessionController).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 'widget-chat:patient-1:case-1',
      enabled: true,
      limit: 50,
    }));
    expect(setActiveConversationId).toHaveBeenCalledWith('widget-chat:patient-1:case-1');
  });

  it('merges the authoritative active session when the query returns a partial session list', async () => {
    const setActiveConversationId = vi.fn();
    patientEntryState = {
      ...patientEntryState,
      activeConversationId: null,
      setActiveConversationId,
    };

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        caseId: 'case-1',
        formalConversationState: {
          activeConversationId: 'widget-chat:patient-1:case-1',
          conversationIds: [
            'widget-chat:patient-1:case-1',
            'hospital:hospital-1:case-1',
          ],
          activeAssistantMode: 'HUMAN_TAKEOVER',
        },
      },
      isAuthenticated: true,
      expirePatientSession: vi.fn(),
    } as never);

    vi.mocked(usePatientSessions).mockReturnValue({
      data: {
        sessions: [{
          id: 'hospital:hospital-1:case-1',
          sessionId: 'hospital:hospital-1:case-1',
          caseId: 'case-1',
          type: 'HOSPITAL',
          title: 'Ruijin Hospital',
          hospitalId: 'hospital-1',
          hospitalName: 'Ruijin Hospital',
          isAiAvailable: false,
          unreadCount: 0,
          lastMessagePreview: null,
          lastMessageAt: null,
          updatedAt: '2026-04-18T00:00:00.000Z',
          displayTitle: 'Ruijin Hospital',
          assistantMode: 'HUMAN_TAKEOVER',
          sessionKind: 'hospital',
        }],
      },
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useDefaultPatientSessionId).mockImplementation((sessions, activeSessionId) => {
      if (sessions && sessions.length > 0) {
        return activeSessionId && sessions.some((session) => session.id === activeSessionId)
          ? activeSessionId
          : sessions.find((session) => session.sessionKind === 'hospital')?.id ?? sessions[0]?.id ?? null;
      }
      return activeSessionId ?? null;
    });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('active-session-id').textContent).toBe('widget-chat:patient-1:case-1');
      expect(screen.getByTestId('session-count').textContent).toBe('2');
    });

    expect(useActivePatientSessionController).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 'widget-chat:patient-1:case-1',
      enabled: true,
      limit: 50,
    }));
    expect(setActiveConversationId).toHaveBeenCalledWith('widget-chat:patient-1:case-1');
  });

  it('prefers the backend active session over a stale local activeConversationId', async () => {
    const setActiveConversationId = vi.fn();
    patientEntryState = {
      ...patientEntryState,
      activeConversationId: 'hospital:hospital-1:case-1',
      setActiveConversationId,
    };

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        caseId: 'case-1',
        formalConversationState: {
          activeConversationId: 'widget-chat:patient-1:case-1',
          conversationIds: [
            'widget-chat:patient-1:case-1',
            'hospital:hospital-1:case-1',
          ],
          activeAssistantMode: 'HUMAN_TAKEOVER',
        },
      },
      isAuthenticated: true,
      expirePatientSession: vi.fn(),
    } as never);

    vi.mocked(usePatientSessions).mockReturnValue({
      data: {
        sessions: [
          {
            id: 'widget-chat:patient-1:case-1',
            sessionId: 'widget-chat:patient-1:case-1',
            caseId: 'case-1',
            type: 'CARE_TEAM',
            title: 'Medora Care Team',
            hospitalId: null,
            hospitalName: null,
            isAiAvailable: false,
            unreadCount: 0,
            lastMessagePreview: null,
            lastMessageAt: null,
            updatedAt: '2026-04-18T00:00:00.000Z',
            displayTitle: 'Medora Care Team',
            assistantMode: 'HUMAN_TAKEOVER',
            sessionKind: 'care-team',
          },
          {
            id: 'hospital:hospital-1:case-1',
            sessionId: 'hospital:hospital-1:case-1',
            caseId: 'case-1',
            type: 'HOSPITAL',
            title: 'Ruijin Hospital',
            hospitalId: 'hospital-1',
            hospitalName: 'Ruijin Hospital',
            isAiAvailable: false,
            unreadCount: 0,
            lastMessagePreview: null,
            lastMessageAt: null,
            updatedAt: '2026-04-18T00:01:00.000Z',
            displayTitle: 'Ruijin Hospital',
            assistantMode: 'HUMAN_TAKEOVER',
            sessionKind: 'hospital',
          },
        ],
      },
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useDefaultPatientSessionId).mockImplementation((sessions, activeSessionId) => {
      if (sessions && sessions.length > 0) {
        return activeSessionId && sessions.some((session) => session.id === activeSessionId)
          ? activeSessionId
          : sessions.find((session) => session.sessionKind === 'hospital')?.id ?? sessions[0]?.id ?? null;
      }
      return activeSessionId ?? null;
    });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('active-session-id').textContent).toBe('widget-chat:patient-1:case-1');
    });

    expect(useActivePatientSessionController).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 'widget-chat:patient-1:case-1',
      enabled: true,
      limit: 50,
    }));
    expect(setActiveConversationId).toHaveBeenCalledWith('widget-chat:patient-1:case-1');
  });

  it('keeps an explicit local hospital selection even while backend activeConversationId still points at the bootstrap session', async () => {
    const setActiveConversationId = vi.fn();
    patientEntryState = {
      ...patientEntryState,
      activeConversationId: 'widget-chat:patient-1:case-1',
      setActiveConversationId,
    };

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        caseId: 'case-1',
        formalConversationState: {
          activeConversationId: 'widget-chat:patient-1:case-1',
          conversationIds: [
            'widget-chat:patient-1:case-1',
            'hospital:hospital-1:case-1',
          ],
          activeAssistantMode: 'HUMAN_TAKEOVER',
        },
      },
      isAuthenticated: true,
      expirePatientSession: vi.fn(),
    } as never);

    vi.mocked(usePatientSessions).mockReturnValue({
      data: {
        sessions: [
          {
            id: 'widget-chat:patient-1:case-1',
            sessionId: 'widget-chat:patient-1:case-1',
            caseId: 'case-1',
            type: 'CARE_TEAM',
            title: 'Medora Care Team',
            hospitalId: null,
            hospitalName: null,
            isAiAvailable: false,
            unreadCount: 0,
            lastMessagePreview: null,
            lastMessageAt: null,
            updatedAt: '2026-04-18T00:00:00.000Z',
            displayTitle: 'Medora Care Team',
            assistantMode: 'HUMAN_TAKEOVER',
            sessionKind: 'care-team',
          },
          {
            id: 'hospital:hospital-1:case-1',
            sessionId: 'hospital:hospital-1:case-1',
            caseId: 'case-1',
            type: 'HOSPITAL',
            title: 'Ruijin Hospital',
            hospitalId: 'hospital-1',
            hospitalName: 'Ruijin Hospital',
            isAiAvailable: false,
            unreadCount: 0,
            lastMessagePreview: null,
            lastMessageAt: null,
            updatedAt: '2026-04-18T00:01:00.000Z',
            displayTitle: 'Ruijin Hospital',
            assistantMode: 'HUMAN_TAKEOVER',
            sessionKind: 'hospital',
          },
        ],
      },
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useDefaultPatientSessionId).mockImplementation((sessions, activeSessionId) => {
      if (sessions && sessions.length > 0) {
        return activeSessionId && sessions.some((session) => session.id === activeSessionId)
          ? activeSessionId
          : sessions.find((session) => session.sessionKind === 'hospital')?.id ?? sessions[0]?.id ?? null;
      }
      return activeSessionId ?? null;
    });

    renderProvider(<SelectSessionOnMount sessionId="hospital:hospital-1:case-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('active-session-id').textContent).toBe('hospital:hospital-1:case-1');
    });

    expect(useActivePatientSessionController).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 'hospital:hospital-1:case-1',
      enabled: true,
      limit: 50,
    }));
    expect(setActiveConversationId).toHaveBeenCalledWith('hospital:hospital-1:case-1');
  });

  it('selects the backend active session even when conversationIds omit it', async () => {
    const setActiveConversationId = vi.fn();
    patientEntryState = {
      ...patientEntryState,
      activeConversationId: null,
      setActiveConversationId,
    };

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        caseId: 'case-1',
        formalConversationState: {
          activeConversationId: 'widget-chat:patient-1:case-1',
          conversationIds: ['hospital:hospital-1:case-1'],
          activeAssistantMode: 'AI_ACTIVE',
        },
      },
      isAuthenticated: true,
      expirePatientSession: vi.fn(),
    } as never);

    vi.mocked(usePatientSessions).mockReturnValue({
      data: {
        sessions: [
          {
            id: 'hospital:hospital-1:case-1',
            sessionId: 'hospital:hospital-1:case-1',
            caseId: 'case-1',
            type: 'HOSPITAL',
            title: 'Ruijin Hospital',
            hospitalId: 'hospital-1',
            hospitalName: 'Ruijin Hospital',
            isAiAvailable: false,
            unreadCount: 0,
            lastMessagePreview: null,
            lastMessageAt: null,
            updatedAt: '2026-04-18T00:01:00.000Z',
            displayTitle: 'Ruijin Hospital',
            assistantMode: 'HUMAN_TAKEOVER',
            sessionKind: 'hospital',
          },
        ],
      },
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useDefaultPatientSessionId).mockImplementation((sessions, activeSessionId) => {
      if (sessions && sessions.length > 0) {
        return activeSessionId && sessions.some((session) => session.id === activeSessionId)
          ? activeSessionId
          : sessions.find((session) => session.sessionKind === 'hospital')?.id ?? sessions[0]?.id ?? null;
      }
      return activeSessionId ?? null;
    });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('active-session-id').textContent).toBe('widget-chat:patient-1:case-1');
      expect(screen.getByTestId('session-count').textContent).toBe('2');
    });

    expect(useActivePatientSessionController).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 'widget-chat:patient-1:case-1',
      enabled: true,
      limit: 50,
    }));
    expect(setActiveConversationId).toHaveBeenCalledWith('widget-chat:patient-1:case-1');
  });

  it('ignores an empty backend activeConversationId and keeps a valid local active session', async () => {
    const setActiveConversationId = vi.fn();
    patientEntryState = {
      ...patientEntryState,
      activeConversationId: 'widget-chat:patient-1:case-1',
      setActiveConversationId,
    };

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        caseId: 'case-1',
        formalConversationState: {
          activeConversationId: '',
          conversationIds: ['hospital:hospital-1:case-1'],
          activeAssistantMode: 'HUMAN_TAKEOVER',
        },
      },
      isAuthenticated: true,
      expirePatientSession: vi.fn(),
    } as never);

    vi.mocked(usePatientSessions).mockReturnValue({
      data: {
        sessions: [
          {
            id: 'widget-chat:patient-1:case-1',
            sessionId: 'widget-chat:patient-1:case-1',
            caseId: 'case-1',
            type: 'CARE_TEAM',
            title: 'Medora Care Team',
            hospitalId: null,
            hospitalName: null,
            isAiAvailable: false,
            unreadCount: 0,
            lastMessagePreview: null,
            lastMessageAt: null,
            updatedAt: '2026-04-18T00:00:00.000Z',
            displayTitle: 'Medora Care Team',
            assistantMode: 'HUMAN_TAKEOVER',
            sessionKind: 'care-team',
          },
          {
            id: 'hospital:hospital-1:case-1',
            sessionId: 'hospital:hospital-1:case-1',
            caseId: 'case-1',
            type: 'HOSPITAL',
            title: 'Ruijin Hospital',
            hospitalId: 'hospital-1',
            hospitalName: 'Ruijin Hospital',
            isAiAvailable: false,
            unreadCount: 0,
            lastMessagePreview: null,
            lastMessageAt: null,
            updatedAt: '2026-04-18T00:01:00.000Z',
            displayTitle: 'Ruijin Hospital',
            assistantMode: 'HUMAN_TAKEOVER',
            sessionKind: 'hospital',
          },
        ],
      },
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useDefaultPatientSessionId).mockImplementation((sessions, activeSessionId) => {
      if (sessions && sessions.length > 0) {
        return activeSessionId && sessions.some((session) => session.id === activeSessionId)
          ? activeSessionId
          : sessions.find((session) => session.sessionKind === 'hospital')?.id ?? sessions[0]?.id ?? null;
      }
      return activeSessionId ?? null;
    });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('active-session-id').textContent).toBe('widget-chat:patient-1:case-1');
    });

    expect(useActivePatientSessionController).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 'widget-chat:patient-1:case-1',
      enabled: true,
      limit: 50,
    }));
    expect(setActiveConversationId).not.toHaveBeenCalled();
  });

  it('lets an explicit hospital-session selection override the backend bootstrap active session', async () => {
    const setActiveConversationId = vi.fn();
    patientEntryState = {
      ...patientEntryState,
      activeConversationId: 'widget-chat:patient-1:case-1',
      setActiveConversationId,
    };

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        caseId: 'case-1',
        formalConversationState: {
          activeConversationId: 'widget-chat:patient-1:case-1',
          conversationIds: [
            'widget-chat:patient-1:case-1',
            'hospital:hospital-1:case-1',
          ],
          activeAssistantMode: 'HUMAN_TAKEOVER',
        },
      },
      isAuthenticated: true,
      expirePatientSession: vi.fn(),
    } as never);

    vi.mocked(usePatientSessions).mockReturnValue({
      data: {
        sessions: [
          {
            id: 'widget-chat:patient-1:case-1',
            sessionId: 'widget-chat:patient-1:case-1',
            caseId: 'case-1',
            type: 'CARE_TEAM',
            title: 'Medora Care Team',
            hospitalId: null,
            hospitalName: null,
            isAiAvailable: false,
            unreadCount: 0,
            lastMessagePreview: null,
            lastMessageAt: null,
            updatedAt: '2026-04-18T00:00:00.000Z',
            displayTitle: 'Medora Care Team',
            assistantMode: 'HUMAN_TAKEOVER',
            sessionKind: 'care-team',
          },
          {
            id: 'hospital:hospital-1:case-1',
            sessionId: 'hospital:hospital-1:case-1',
            caseId: 'case-1',
            type: 'HOSPITAL',
            title: 'Ruijin Hospital',
            hospitalId: 'hospital-1',
            hospitalName: 'Ruijin Hospital',
            isAiAvailable: false,
            unreadCount: 0,
            lastMessagePreview: null,
            lastMessageAt: null,
            updatedAt: '2026-04-18T00:01:00.000Z',
            displayTitle: 'Ruijin Hospital',
            assistantMode: 'HUMAN_TAKEOVER',
            sessionKind: 'hospital',
          },
        ],
      },
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useDefaultPatientSessionId).mockImplementation((sessions, activeSessionId) => {
      if (sessions && sessions.length > 0) {
        return activeSessionId && sessions.some((session) => session.id === activeSessionId)
          ? activeSessionId
          : sessions.find((session) => session.sessionKind === 'hospital')?.id ?? sessions[0]?.id ?? null;
      }
      return activeSessionId ?? null;
    });

    renderProvider();

    expect(screen.getByTestId('active-session-id').textContent).toBe('widget-chat:patient-1:case-1');

    fireEvent.click(screen.getByRole('button', { name: 'Switch to hospital' }));

    await waitFor(() => {
      expect(screen.getByTestId('active-session-id').textContent).toBe('hospital:hospital-1:case-1');
    });

    expect(useActivePatientSessionController).toHaveBeenLastCalledWith(expect.objectContaining({
      sessionId: 'hospital:hospital-1:case-1',
      enabled: true,
      limit: 50,
    }));
    expect(setActiveConversationId).toHaveBeenCalledWith('hospital:hospital-1:case-1');
  });

  it('preserves an explicit hospital-session override across close and reopen for the same case', async () => {
    const setActiveConversationId = vi.fn();
    patientEntryState = {
      ...patientEntryState,
      activeConversationId: 'widget-chat:patient-1:case-1',
      setActiveConversationId,
    };

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        caseId: 'case-1',
        formalConversationState: {
          activeConversationId: 'widget-chat:patient-1:case-1',
          conversationIds: [
            'widget-chat:patient-1:case-1',
            'hospital:hospital-1:case-1',
          ],
          activeAssistantMode: 'HUMAN_TAKEOVER',
        },
      },
      isAuthenticated: true,
      expirePatientSession: vi.fn(),
    } as never);

    vi.mocked(usePatientSessions).mockReturnValue({
      data: {
        sessions: [
          {
            id: 'widget-chat:patient-1:case-1',
            sessionId: 'widget-chat:patient-1:case-1',
            caseId: 'case-1',
            type: 'CARE_TEAM',
            title: 'Medora Care Team',
            hospitalId: null,
            hospitalName: null,
            isAiAvailable: false,
            unreadCount: 0,
            lastMessagePreview: null,
            lastMessageAt: null,
            updatedAt: '2026-04-18T00:00:00.000Z',
            displayTitle: 'Medora Care Team',
            assistantMode: 'HUMAN_TAKEOVER',
            sessionKind: 'care-team',
          },
          {
            id: 'hospital:hospital-1:case-1',
            sessionId: 'hospital:hospital-1:case-1',
            caseId: 'case-1',
            type: 'HOSPITAL',
            title: 'Ruijin Hospital',
            hospitalId: 'hospital-1',
            hospitalName: 'Ruijin Hospital',
            isAiAvailable: false,
            unreadCount: 0,
            lastMessagePreview: null,
            lastMessageAt: null,
            updatedAt: '2026-04-18T00:01:00.000Z',
            displayTitle: 'Ruijin Hospital',
            assistantMode: 'HUMAN_TAKEOVER',
            sessionKind: 'hospital',
          },
        ],
      },
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useDefaultPatientSessionId).mockImplementation((sessions, activeSessionId) => {
      if (sessions && sessions.length > 0) {
        return activeSessionId && sessions.some((session) => session.id === activeSessionId)
          ? activeSessionId
          : sessions.find((session) => session.sessionKind === 'hospital')?.id ?? sessions[0]?.id ?? null;
      }
      return activeSessionId ?? null;
    });

    const { rerender } = renderProvider(<SelectSessionOnMount sessionId="hospital:hospital-1:case-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('active-session-id').textContent).toBe('hospital:hospital-1:case-1');
    });

    patientEntryState = {
      ...patientEntryState,
      isWidgetOpen: false,
      isPanelOpen: false,
    };

    rerender(
      <PatientSessionRuntimeProvider>
        <RuntimeProbe />
      </PatientSessionRuntimeProvider>,
    );

    patientEntryState = {
      ...patientEntryState,
      isWidgetOpen: true,
    };

    rerender(
      <PatientSessionRuntimeProvider>
        <RuntimeProbe />
      </PatientSessionRuntimeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-session-id').textContent).toBe('hospital:hospital-1:case-1');
    });
  });

  it('clears the manual override when reopening on a different case after being closed', async () => {
    const setActiveConversationId = vi.fn();
    const currentPatient = {
      caseId: 'case-1',
      formalConversationState: {
        activeConversationId: 'widget-chat:patient-1:case-1',
        conversationIds: [
          'widget-chat:patient-1:case-1',
          'hospital:shared-session',
        ],
        activeAssistantMode: 'HUMAN_TAKEOVER' as const,
      },
    };
    const currentSessions = {
      sessions: [
        {
          id: 'widget-chat:patient-1:case-1',
          sessionId: 'widget-chat:patient-1:case-1',
          caseId: 'case-1',
          type: 'CARE_TEAM' as const,
          title: 'Medora Care Team',
          hospitalId: null,
          hospitalName: null,
          isAiAvailable: false,
          unreadCount: 0,
          lastMessagePreview: null,
          lastMessageAt: null,
          updatedAt: '2026-04-18T00:00:00.000Z',
          displayTitle: 'Medora Care Team',
          assistantMode: 'HUMAN_TAKEOVER' as const,
          sessionKind: 'care-team' as const,
        },
        {
          id: 'hospital:shared-session',
          sessionId: 'hospital:shared-session',
          caseId: 'case-1',
          type: 'HOSPITAL' as const,
          title: 'Ruijin Hospital',
          hospitalId: 'hospital-1',
          hospitalName: 'Ruijin Hospital',
          isAiAvailable: false,
          unreadCount: 0,
          lastMessagePreview: null,
          lastMessageAt: null,
          updatedAt: '2026-04-18T00:01:00.000Z',
          displayTitle: 'Ruijin Hospital',
          assistantMode: 'HUMAN_TAKEOVER' as const,
          sessionKind: 'hospital' as const,
        },
      ],
    };

    patientEntryState = {
      ...patientEntryState,
      caseId: 'case-1',
      activeConversationId: 'widget-chat:patient-1:case-1',
      setActiveConversationId,
    };

    vi.mocked(usePatientAuth).mockImplementation(() => ({
      patient: currentPatient,
      isAuthenticated: true,
      expirePatientSession: vi.fn(),
    }) as never);

    vi.mocked(usePatientSessions).mockImplementation(() => ({
      data: currentSessions,
      isLoading: false,
      error: null,
    }) as never);

    vi.mocked(useDefaultPatientSessionId).mockImplementation((sessions, activeSessionId) => {
      if (sessions && sessions.length > 0) {
        return activeSessionId && sessions.some((session) => session.id === activeSessionId)
          ? activeSessionId
          : sessions.find((session) => session.sessionKind === 'hospital')?.id ?? sessions[0]?.id ?? null;
      }
      return activeSessionId ?? null;
    });

    const { rerender } = renderProvider(<SelectSessionOnMount sessionId="hospital:shared-session" />);

    await waitFor(() => {
      expect(screen.getByTestId('active-session-id').textContent).toBe('hospital:shared-session');
    });

    patientEntryState = {
      ...patientEntryState,
      isWidgetOpen: false,
      isPanelOpen: false,
    };

    rerender(
      <PatientSessionRuntimeProvider>
        <RuntimeProbe />
      </PatientSessionRuntimeProvider>,
    );

    currentPatient.caseId = 'case-2';
    currentPatient.formalConversationState = {
      activeConversationId: 'widget-chat:patient-1:case-2',
      conversationIds: [
        'widget-chat:patient-1:case-2',
        'hospital:shared-session',
      ],
      activeAssistantMode: 'HUMAN_TAKEOVER',
    };
    currentSessions.sessions = [
      {
        id: 'widget-chat:patient-1:case-2',
        sessionId: 'widget-chat:patient-1:case-2',
        caseId: 'case-2',
        type: 'CARE_TEAM',
        title: 'Medora Care Team',
        hospitalId: null,
        hospitalName: null,
        isAiAvailable: false,
        unreadCount: 0,
        lastMessagePreview: null,
        lastMessageAt: null,
        updatedAt: '2026-04-18T00:02:00.000Z',
        displayTitle: 'Medora Care Team',
        assistantMode: 'HUMAN_TAKEOVER',
        sessionKind: 'care-team',
      },
      {
        id: 'hospital:shared-session',
        sessionId: 'hospital:shared-session',
        caseId: 'case-2',
        type: 'HOSPITAL',
        title: 'Ruijin Hospital',
        hospitalId: 'hospital-1',
        hospitalName: 'Ruijin Hospital',
        isAiAvailable: false,
        unreadCount: 0,
        lastMessagePreview: null,
        lastMessageAt: null,
        updatedAt: '2026-04-18T00:03:00.000Z',
        displayTitle: 'Ruijin Hospital',
        assistantMode: 'HUMAN_TAKEOVER',
        sessionKind: 'hospital',
      },
    ];
    patientEntryState = {
      ...patientEntryState,
      caseId: 'case-2',
      isWidgetOpen: true,
      activeConversationId: 'widget-chat:patient-1:case-2',
    };
    vi.mocked(useActivePatientSessionController).mockClear();

    rerender(
      <PatientSessionRuntimeProvider>
        <RuntimeProbe />
      </PatientSessionRuntimeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-session-id').textContent).toBe('widget-chat:patient-1:case-2');
    });

    expect(useActivePatientSessionController).not.toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 'hospital:shared-session',
      enabled: true,
      limit: 50,
    }));
    expect(useActivePatientSessionController).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 'widget-chat:patient-1:case-2',
      enabled: true,
      limit: 50,
    }));
  });
});

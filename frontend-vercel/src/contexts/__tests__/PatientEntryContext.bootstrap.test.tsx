import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PatientEntryProvider } from '../PatientEntryContext';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { patientMessagesApi } from '@/services/api/patient-messages';

vi.mock('@/hooks/usePatientAuth', () => ({
  usePatientAuth: vi.fn(),
}));

vi.mock('@/services/api/patient-messages', () => ({
  patientMessagesApi: {
    listSessions: vi.fn(),
    getConversationMessages: vi.fn(),
    initConversationAttachmentUpload: vi.fn(),
    sendConversationMessage: vi.fn(),
  },
}));

function PreBootstrapProbe() {
  const context = usePatientEntry() as Record<string, unknown>;
  const preBootstrapMessages = Array.isArray(context.preBootstrapMessages)
    ? context.preBootstrapMessages
    : [];

  return (
    <div>
      <div data-testid="message-count">{preBootstrapMessages.length}</div>
      <button
        type="button"
        onClick={(context.openWidget as (() => void) | undefined) ?? (() => {})}
      >
        open-widget
      </button>
    </div>
  );
}

function ContextShapeProbe() {
  const context = usePatientEntry() as Record<string, unknown>;
  const keys = [
    'preBootstrapMessages',
    'importStatus',
    'appendPreBootstrapMessage',
    'replacePreBootstrapMessages',
    'getStableImportKey',
    'markImportSucceeded',
    'hasImportedHistory',
    'setSelectedHospitalIds',
    'toggleHospitalSelection',
  ];

  return (
    <div>
      {keys.map((key) => (
        <div key={key} data-testid={`has-${key}`}>
          {Object.prototype.hasOwnProperty.call(context, key) ? 'yes' : 'no'}
        </div>
      ))}
    </div>
  );
}

function RestoreProbe() {
  const context = usePatientEntry() as Record<string, unknown>;

  return (
    <div>
      <div data-testid="phase">{String(context.phase ?? '')}</div>
      <div data-testid="bootstrap-error">{String(context.bootstrapError ?? '')}</div>
      <div data-testid="active-conversation">{String(context.activeConversationId ?? '')}</div>
      <button
        type="button"
        onClick={() => {
          (context.applyRestoreResult as ((input: {
            patientId: string;
            caseId: string;
            nextStep: 'select-hospitals' | 'messages-ready';
            conversations?: Array<{
              id: string;
              type: 'patient-admin' | 'patient-hospital';
              category?: string;
            }>;
          }) => boolean | undefined) | undefined)?.({
            patientId: 'patient-1',
            caseId: 'case-1',
            nextStep: 'messages-ready',
            conversations: [
              {
                id: 'conversation-admin-1',
                type: 'patient-admin',
                category: 'ADMIN_PATIENT',
              },
            ],
          });
        }}
      >
        restore
      </button>
    </div>
  );
}

function RestoreWithConversationsProbe() {
  const context = usePatientEntry() as Record<string, unknown>;

  return (
    <div>
      <div data-testid="phase">{String(context.phase ?? '')}</div>
      <div data-testid="active-conversation">{String(context.activeConversationId ?? '')}</div>
      <button
        type="button"
        onClick={() => {
          (context.applyRestoreResult as ((input: {
            patientId: string;
            caseId: string;
            nextStep: 'select-hospitals' | 'messages-ready';
            conversations?: Array<{
              id: string;
              type: 'patient-admin' | 'patient-hospital';
              category?: string;
            }>;
          }) => boolean | undefined) | undefined)?.({
            patientId: 'patient-1',
            caseId: 'case-1',
            nextStep: 'select-hospitals',
            conversations: [
              {
                id: 'conversation-admin-1',
                type: 'patient-admin',
                category: 'ADMIN_PATIENT',
              },
            ],
          });
        }}
      >
        restore-select-hospitals-with-conversations
      </button>
    </div>
  );
}

function RestoreWithHospitalProbe() {
  const context = usePatientEntry() as Record<string, unknown>;

  return (
    <div>
      <div data-testid="phase">{String(context.phase ?? '')}</div>
      <div data-testid="active-conversation">{String(context.activeConversationId ?? '')}</div>
      <button
        type="button"
        onClick={() => {
          (context.applyRestoreResult as ((input: {
            patientId: string;
            caseId: string;
            nextStep: 'select-hospitals' | 'messages-ready';
            conversations?: Array<{
              id: string;
              type: 'patient-admin' | 'patient-hospital';
              category?: string;
            }>;
          }) => boolean | undefined) | undefined)?.({
            patientId: 'patient-1',
            caseId: 'case-1',
            nextStep: 'messages-ready',
            conversations: [
              {
                id: 'conversation-admin-1',
                type: 'patient-admin',
                category: 'ADMIN_PATIENT',
              },
              {
                id: 'conversation-hospital-1',
                type: 'patient-hospital',
                category: 'HOSPITAL_PATIENT',
              },
            ],
          });
        }}
      >
        restore-with-hospital
      </button>
    </div>
  );
}

function BackendRestoreProbe() {
  const context = usePatientEntry() as Record<string, unknown>;

  return (
    <div>
      <div data-testid="phase">{String(context.phase ?? '')}</div>
      <div data-testid="active-conversation">{String(context.activeConversationId ?? '')}</div>
      <div data-testid="widget-chat-target">{String((context.widgetChatTarget as { sessionId?: string } | null)?.sessionId ?? '')}</div>
      <div data-testid="selected-hospital-ids">{JSON.stringify(context.selectedHospitalIds ?? [])}</div>
      <div data-testid="chatbot-v3-journey-stage">{String((context.chatbotV3Journey as { stage?: string } | null)?.stage ?? '')}</div>
    </div>
  );
}

function ReturnToProfileProbe() {
  const context = usePatientEntry() as Record<string, unknown>;

  return (
    <div>
      <div data-testid="phase">{String(context.phase ?? '')}</div>
      <div data-testid="widget-open">{String(context.isWidgetOpen ?? '')}</div>
      <div data-testid="panel-open">{String(context.isPanelOpen ?? '')}</div>
      <button
        type="button"
        onClick={() => {
          (context.openWidget as (() => void) | undefined)?.();
          (context.openPanel as (() => void) | undefined)?.();
        }}
      >
        open-panel
      </button>
      <button
        type="button"
        onClick={() => {
          (context.returnToProfileForm as (() => void) | undefined)?.();
        }}
      >
        return-to-profile
      </button>
    </div>
  );
}

describe('PatientEntryProvider bootstrap flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('does not hydrate or retain pre-bootstrap local messages', () => {
    window.localStorage.setItem(
      'patient-entry:anonymous:history',
      JSON.stringify([
        {
          clientId: 'local-1',
          role: 'patient',
          content: 'Hello before bootstrap',
          createdAt: '2026-04-05T00:00:00.000Z',
        },
      ]),
    );

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      bootstrapSession: vi.fn(),
      expirePatientSession: vi.fn(),
      refreshPatientSession: vi.fn(),
      loginWithPassword: vi.fn(),
      requestMagicLink: vi.fn(),
      logout: vi.fn(),
    } as never);

    render(
      <PatientEntryProvider>
        <PreBootstrapProbe />
      </PatientEntryProvider>,
    );

    expect(screen.getByTestId('message-count').textContent).toBe('0');

    fireEvent.click(screen.getByRole('button', { name: 'open-widget' }));

    expect(screen.getByTestId('message-count').textContent).toBe('0');
  });

  it('keeps bootstrap journeySnapshot truth separate from chatbot v3 turn state on restore', async () => {
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        id: 'patient-1',
        caseId: 'case-1',
        nextStep: 'select-hospitals',
        widgetChatTarget: {
          kind: 'CHATBOT_SESSION',
          sessionId: 'widget-chat:patient-1:case-1',
        },
        journeySnapshot: {
          currentStage: 'EXPLAIN_PROCESS',
          currentPhase: 'active',
        },
        formalConversationState: {
          activeConversationId: 'conversation-admin-1',
          conversationIds: ['conversation-admin-1'],
        },
        chatbotOrchestrationState: {
          conversationSummary: '',
        },
      },
      isLoading: false,
      isAuthenticated: true,
      error: null,
      bootstrapSession: vi.fn(),
      expirePatientSession: vi.fn(),
      refreshPatientSession: vi.fn(),
      loginWithPassword: vi.fn(),
      requestMagicLink: vi.fn(),
      logout: vi.fn(),
    } as never);

    render(
      <PatientEntryProvider>
        <BackendRestoreProbe />
      </PatientEntryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('phase').textContent).toBe('select-hospitals');
      expect(screen.getByTestId('chatbot-v3-journey-stage').textContent).toBe('');
    });
  });

  it('no longer exposes temporary-history/import bookkeeping on the public context value', () => {
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      bootstrapSession: vi.fn(),
      expirePatientSession: vi.fn(),
      refreshPatientSession: vi.fn(),
      loginWithPassword: vi.fn(),
      requestMagicLink: vi.fn(),
      logout: vi.fn(),
    } as never);

    render(
      <PatientEntryProvider>
        <ContextShapeProbe />
      </PatientEntryProvider>,
    );

    expect(screen.getByTestId('has-preBootstrapMessages').textContent).toBe('no');
    expect(screen.getByTestId('has-importStatus').textContent).toBe('no');
    expect(screen.getByTestId('has-appendPreBootstrapMessage').textContent).toBe('no');
    expect(screen.getByTestId('has-replacePreBootstrapMessages').textContent).toBe('no');
    expect(screen.getByTestId('has-getStableImportKey').textContent).toBe('no');
    expect(screen.getByTestId('has-markImportSucceeded').textContent).toBe('no');
    expect(screen.getByTestId('has-hasImportedHistory').textContent).toBe('no');
    expect(screen.getByTestId('has-setSelectedHospitalIds').textContent).toBe('no');
    expect(screen.getByTestId('has-toggleHospitalSelection').textContent).toBe('no');
  });

  it('clears stale widget state when the authenticated patient session disappears', async () => {
    const authReturn = {
      patient: {
        id: 'patient-1',
        caseId: 'case-1',
        nextStep: 'messages-ready',
        selectedHospitalId: 'hospital-1',
        selectedHospitalIds: ['hospital-1'],
        widgetChatTarget: {
          kind: 'CHATBOT_SESSION',
          sessionId: 'widget-chat:patient-1:case-1',
        },
        formalConversationState: {
          activeConversationId: 'conversation-admin-1',
          conversationIds: ['conversation-admin-1'],
        },
        chatbotOrchestrationState: {
          conversationSummary: '',
        },
      },
      isLoading: false,
      isAuthenticated: true,
      error: null,
      bootstrapSession: vi.fn(),
      expirePatientSession: vi.fn(),
      refreshPatientSession: vi.fn(),
      loginWithPassword: vi.fn(),
      requestMagicLink: vi.fn(),
      logout: vi.fn(),
    };

    vi.mocked(usePatientAuth).mockReturnValue(authReturn as never);

    const view = render(
      <PatientEntryProvider>
        <BackendRestoreProbe />
      </PatientEntryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('phase').textContent).toBe('messages-ready');
      expect(screen.getByTestId('widget-chat-target').textContent).toBe('widget-chat:patient-1:case-1');
    });

    vi.mocked(usePatientAuth).mockReturnValue({
      ...authReturn,
      patient: null,
      isAuthenticated: false,
    } as never);

    view.rerender(
      <PatientEntryProvider>
        <BackendRestoreProbe />
      </PatientEntryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('phase').textContent).toBe('collect-profile');
      expect(screen.getByTestId('widget-chat-target').textContent).toBe('');
      expect(screen.getByTestId('selected-hospital-ids').textContent).toBe('[]');
    });
  });

  it('restores backend truth even when stale local bootstrap error state exists', async () => {
    window.localStorage.setItem(
      'patient-entry:patient:patient-1:case:case-1:bootstrap-error',
      'stale bootstrap error',
    );

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        id: 'patient-1',
        caseId: 'case-1',
        nextStep: 'messages-ready',
      },
      isLoading: false,
      isAuthenticated: true,
      error: null,
      bootstrapSession: vi.fn(),
      expirePatientSession: vi.fn(),
      refreshPatientSession: vi.fn(),
      loginWithPassword: vi.fn(),
      requestMagicLink: vi.fn(),
      logout: vi.fn(),
    } as never);

    render(
      <PatientEntryProvider>
        <RestoreProbe />
      </PatientEntryProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'restore' }));

    await waitFor(() => {
      expect(screen.getByTestId('phase').textContent).toBe('messages-ready');
      expect(screen.getByTestId('bootstrap-error').textContent).toBe('');
      expect(screen.getByTestId('active-conversation').textContent).toBe('conversation-admin-1');
    });
  });

  it('restores the active formal conversation for select-hospitals when conversations are available', async () => {
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        id: 'patient-1',
        caseId: 'case-1',
        nextStep: 'select-hospitals',
      },
      isLoading: false,
      isAuthenticated: true,
      error: null,
      bootstrapSession: vi.fn(),
      expirePatientSession: vi.fn(),
      refreshPatientSession: vi.fn(),
      loginWithPassword: vi.fn(),
      requestMagicLink: vi.fn(),
      logout: vi.fn(),
    } as never);

    render(
      <PatientEntryProvider>
        <RestoreWithConversationsProbe />
      </PatientEntryProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'restore-select-hospitals-with-conversations' }));

    await waitFor(() => {
      expect(screen.getByTestId('phase').textContent).toBe('select-hospitals');
      expect(screen.getByTestId('active-conversation').textContent).toBe('conversation-admin-1');
    });
  });

  it('prefers a hospital conversation over the admin thread when restore metadata has no active conversation', async () => {
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        id: 'patient-1',
        caseId: 'case-1',
        nextStep: 'messages-ready',
      },
      isLoading: false,
      isAuthenticated: true,
      error: null,
      bootstrapSession: vi.fn(),
      expirePatientSession: vi.fn(),
      refreshPatientSession: vi.fn(),
      loginWithPassword: vi.fn(),
      requestMagicLink: vi.fn(),
      logout: vi.fn(),
    } as never);

    render(
      <PatientEntryProvider>
        <RestoreWithHospitalProbe />
      </PatientEntryProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'restore-with-hospital' }));

    await waitFor(() => {
      expect(screen.getByTestId('phase').textContent).toBe('messages-ready');
    });
    expect(screen.getByTestId('active-conversation').textContent).toBe('conversation-hospital-1');
  });

  it('prefers backend restore state over recomputing conversations when the session already includes orchestration state', async () => {
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        id: 'patient-1',
        caseId: 'case-1',
        name: 'Hao Wang',
        email: 'hao@example.com',
        preferredLanguage: 'en',
        nextStep: 'select-hospitals',
        selectedHospitalId: 'hospital-2',
        selectedHospitalIds: ['hospital-2'],
        widgetChatTarget: {
          kind: 'CHATBOT_SESSION',
          sessionId: 'widget-chat:patient-1:case-1',
        },
        formalConversationState: {
          activeConversationId: 'conversation-backend-1',
          conversationIds: ['conversation-backend-1', 'conversation-hospital-1'],
          activeAssistantMode: 'AI_ACTIVE',
        },
        chatbotOrchestrationState: {
          conversationSummary: 'Backend summary',
        },
      },
      isLoading: false,
      isAuthenticated: true,
      error: null,
      bootstrapSession: vi.fn(),
      requestMagicLink: vi.fn(),
      logout: vi.fn(),
    } as never);

    vi.mocked(patientMessagesApi.listSessions).mockResolvedValue({
      sessions: [
        {
          sessionId: 'conversation-admin-stale',
          caseId: 'case-1',
          type: 'CARE_TEAM',
          title: 'Medora Care Team',
          hospitalId: null,
          hospitalName: null,
          isAiAvailable: true,
          unreadCount: 0,
          lastMessagePreview: null,
          lastMessageAt: null,
          updatedAt: '2026-04-05T00:00:00.000Z',
        },
      ],
      meta: {
        caseId: 'case-1',
        chatAuthority: 'AI_ACTIVE',
      },
    } as never);

    render(
      <PatientEntryProvider>
        <BackendRestoreProbe />
      </PatientEntryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('phase').textContent).toBe('select-hospitals');
      expect(screen.getByTestId('active-conversation').textContent).toBe('conversation-backend-1');
      expect(screen.getByTestId('selected-hospital-ids').textContent).toBe('["hospital-2"]');
    });

    expect(vi.mocked(patientMessagesApi.listSessions)).not.toHaveBeenCalled();
  });

  it('treats missing formal conversation state as a bootstrap error even when a widget chat target exists', async () => {
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        id: 'patient-1',
        caseId: 'case-1',
        name: 'Hao Wang',
        email: 'hao@example.com',
        preferredLanguage: 'en',
        nextStep: 'messages-ready',
        selectedHospitalId: 'hospital-2',
        selectedHospitalIds: ['hospital-2'],
        widgetChatTarget: {
          kind: 'CHATBOT_SESSION',
          sessionId: 'widget-chat:patient-1:case-1',
        },
        chatbotOrchestrationState: {
          conversationSummary: 'Backend summary',
        },
      },
      isLoading: false,
      isAuthenticated: true,
      error: null,
      bootstrapSession: vi.fn(),
      requestMagicLink: vi.fn(),
      logout: vi.fn(),
    } as never);

    vi.mocked(patientMessagesApi.listSessions).mockResolvedValue({
      sessions: [],
      meta: {
        caseId: 'case-1',
        chatAuthority: null,
      },
    } as never);

    render(
      <PatientEntryProvider>
        <BackendRestoreProbe />
      </PatientEntryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('phase').textContent).toBe('bootstrap-error');
      expect(screen.getByTestId('active-conversation').textContent).toBe('');
      expect(screen.getByTestId('widget-chat-target').textContent).toBe('widget-chat:patient-1:case-1');
      expect(screen.getByTestId('selected-hospital-ids').textContent).toBe('[]');
    });

    expect(vi.mocked(patientMessagesApi.listSessions)).toHaveBeenCalledTimes(1);
  });

  it('re-syncs backend restore state when the same patient session receives a newer authoritative payload', async () => {
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        id: 'patient-1',
        caseId: 'case-1',
        name: 'Hao Wang',
        email: 'hao@example.com',
        preferredLanguage: 'en',
        nextStep: 'messages-ready',
        selectedHospitalId: 'hospital-old',
        selectedHospitalIds: ['hospital-old'],
        widgetChatTarget: {
          kind: 'CHATBOT_SESSION',
          sessionId: 'widget-chat:patient-1:case-1',
        },
        formalConversationState: {
          activeConversationId: 'conversation-old',
          conversationIds: ['conversation-old'],
          activeAssistantMode: 'AI_ACTIVE',
        },
        chatbotOrchestrationState: {
          conversationSummary: 'Old summary',
        },
      },
      isLoading: false,
      isAuthenticated: true,
      error: null,
      bootstrapSession: vi.fn(),
      requestMagicLink: vi.fn(),
      logout: vi.fn(),
    } as never);

    const { rerender } = render(
      <PatientEntryProvider>
        <BackendRestoreProbe />
      </PatientEntryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('phase').textContent).toBe('messages-ready');
      expect(screen.getByTestId('active-conversation').textContent).toBe('conversation-old');
      expect(screen.getByTestId('selected-hospital-ids').textContent).toBe('["hospital-old"]');
    });

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        id: 'patient-1',
        caseId: 'case-1',
        name: 'Hao Wang',
        email: 'hao@example.com',
        preferredLanguage: 'en',
        nextStep: 'messages-ready',
        selectedHospitalId: 'hospital-new',
        selectedHospitalIds: ['hospital-new'],
        widgetChatTarget: {
          kind: 'CHATBOT_SESSION',
          sessionId: 'widget-chat:patient-1:case-1',
        },
        formalConversationState: {
          activeConversationId: 'conversation-new',
          conversationIds: ['conversation-new'],
          activeAssistantMode: 'HUMAN_TAKEOVER',
        },
        chatbotOrchestrationState: {
          conversationSummary: 'New summary',
        },
      },
      isLoading: false,
      isAuthenticated: true,
      error: null,
      bootstrapSession: vi.fn(),
      requestMagicLink: vi.fn(),
      logout: vi.fn(),
    } as never);

    rerender(
      <PatientEntryProvider>
        <BackendRestoreProbe />
      </PatientEntryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-conversation').textContent).toBe('conversation-new');
      expect(screen.getByTestId('widget-chat-target').textContent).toBe('widget-chat:patient-1:case-1');
      expect(screen.getByTestId('selected-hospital-ids').textContent).toBe('["hospital-new"]');
    });
  });

  it('returnToProfileForm closes the panel and reopens the widget shell', async () => {
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      bootstrapSession: vi.fn(),
      requestMagicLink: vi.fn(),
      logout: vi.fn(),
    } as never);

    render(
      <PatientEntryProvider>
        <ReturnToProfileProbe />
      </PatientEntryProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'open-panel' }));

    await waitFor(() => {
      expect(screen.getByTestId('widget-open').textContent).toBe('false');
      expect(screen.getByTestId('panel-open').textContent).toBe('true');
    });

    fireEvent.click(screen.getByRole('button', { name: 'return-to-profile' }));

    await waitFor(() => {
      expect(screen.getByTestId('phase').textContent).toBe('collect-profile');
      expect(screen.getByTestId('widget-open').textContent).toBe('true');
      expect(screen.getByTestId('panel-open').textContent).toBe('false');
    });
  });
});

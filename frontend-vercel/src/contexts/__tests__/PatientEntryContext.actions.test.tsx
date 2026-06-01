import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PatientEntryProvider } from '../PatientEntryContext';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { patientEntryApi } from '@/services/api/patient-entry';

vi.mock('@/hooks/usePatientAuth', () => ({
  usePatientAuth: vi.fn(),
}));

vi.mock('@/services/api/patient-entry', () => ({
  patientEntryApi: {
    selectHospitals: vi.fn(),
    convertConsultation: vi.fn(),
    getQuestionnaireTemplate: vi.fn(),
  },
}));

function ActionsProbe() {
  const context = usePatientEntry() as Record<string, unknown>;
  latestContext = context;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          void (context.submitHospitalSelection as ((caseId: string, hospitalIds: string[], customHospitalRequest?: string) => Promise<void>) | undefined)?.(
            'case-1',
            ['hospital-1', 'hospital-2'],
            'Ruijin Hospital',
          );
        }}
      >
        submit-hospital-selection
      </button>
      <button
        type="button"
        onClick={() => {
          void (context.requestConsultConversion as ((block: {
            convertPath: string;
            requestedAction: 'INVITE_ONLINE_CONSULT';
            conversionDraft: {
              sessionId: string;
              name: string;
              email: string;
              country: string;
              conditionSummary: string;
              budget: string;
            };
          }) => Promise<void>) | undefined)?.({
            convertPath: '/api/v2/chatbot/convert',
            requestedAction: 'INVITE_ONLINE_CONSULT',
            conversionDraft: {
              sessionId: 'session-1',
              name: 'Alice',
              email: 'alice@example.com',
              country: 'China',
              conditionSummary: 'Eye pain',
              budget: 'Flexible',
            },
          });
        }}
      >
        request-consult
      </button>
      <button
        type="button"
        onClick={() => {
          void (context.requestQuestionnaireTemplate as ((templateId: string) => Promise<unknown>) | undefined)?.('template-1');
        }}
      >
        request-questionnaire
      </button>
      <button
        type="button"
        onClick={() => {
          const applyChatbotV3TurnState = context.applyChatbotV3TurnState as ((input: {
            journey: { stage: string; phase: string } | null;
            handoff: { required: boolean; ticketId: string | null } | null;
            cards: Array<{ kind: string }>;
            uiIntent: string;
          }) => void) | undefined;
          applyChatbotV3TurnState?.({
            journey: {
              stage: 'COLLECT_MEDICAL_INPUTS',
              phase: 'active',
            },
            handoff: {
              required: false,
              ticketId: null,
            },
            cards: [{
              kind: 'UPLOAD_RECORDS',
            }],
            uiIntent: 'SUPPORTING_DOCUMENT_UPLOAD',
          });
        }}
      >
        apply-v3-stage
      </button>
      <button
        type="button"
        onClick={() => {
          const applyChatbotV3TurnState = context.applyChatbotV3TurnState as ((input: {
            journey: { stage: string; phase: string } | null;
            handoff: { required: boolean; ticketId: string | null } | null;
            cards: Array<{ kind: string }>;
            uiIntent: string;
          }) => void) | undefined;
          applyChatbotV3TurnState?.({
            journey: {
              stage: 'EXPLAIN_PROCESS',
              phase: 'active',
            },
            handoff: {
              required: false,
              ticketId: null,
            },
            cards: [],
            uiIntent: 'EXPLAIN_PROCESS',
          });
        }}
      >
        apply-v3-explain-process
      </button>
      <button
        type="button"
        onClick={() => {
          const applyChatbotV3TurnState = context.applyChatbotV3TurnState as ((input: {
            journey: { stage: string; phase: string } | null;
            handoff: { required: boolean; ticketId: string | null } | null;
            cards: Array<{ kind: string }>;
            uiIntent: string;
          }) => void) | undefined;
          applyChatbotV3TurnState?.({
            journey: {
              stage: 'COLLECT_MEDICAL_INPUTS',
              phase: 'active',
            },
            handoff: {
              required: false,
              ticketId: null,
            },
            cards: [],
            uiIntent: 'FAQ_DETOUR',
          });
        }}
      >
        apply-v3-faq-detour
      </button>
      <button
        type="button"
        onClick={() => {
          const applyChatbotV3TurnState = context.applyChatbotV3TurnState as ((input: {
            journey: { stage: string; phase: string } | null;
            handoff: { required: boolean; ticketId: string | null } | null;
            cards: Array<{ kind: string }>;
            uiIntent: string;
            source?: 'fresh' | 'history';
          }) => void) | undefined;
          applyChatbotV3TurnState?.({
            journey: {
              stage: 'RECOMMENDATION',
              phase: 'active',
            },
            handoff: {
              required: false,
              ticketId: null,
            },
            cards: [],
            uiIntent: 'FAQ_DETOUR',
          });
        }}
      >
        apply-v3-progressed-faq-detour
      </button>
      <button
        type="button"
        onClick={() => {
          const applyChatbotV3TurnState = context.applyChatbotV3TurnState as ((input: {
            journey: { stage: string; phase: string } | null;
            handoff: { required: boolean; ticketId: string | null } | null;
            cards: Array<{ kind: string }>;
            uiIntent: string;
          }) => void) | undefined;
          applyChatbotV3TurnState?.({
            journey: {
              stage: 'RECOMMENDATION',
              phase: 'active',
            },
            handoff: {
              required: false,
              ticketId: null,
            },
            cards: [],
            uiIntent: 'RECOMMENDATION',
          });
        }}
      >
        apply-v3-regressed-recommendation
      </button>
      <button
        type="button"
        onClick={() => {
          const applyChatbotV3TurnState = context.applyChatbotV3TurnState as ((input: {
            journey: { stage: string; phase: string } | null;
            handoff: { required: boolean; ticketId: string | null } | null;
            cards: Array<{ kind: string }>;
            uiIntent: string;
            source?: 'fresh' | 'history';
          }) => void) | undefined;
          applyChatbotV3TurnState?.({
            journey: {
              stage: 'EXPLAIN_PROCESS',
              phase: 'active',
            },
            handoff: {
              required: false,
              ticketId: null,
            },
            cards: [],
            uiIntent: 'EXPLAIN_PROCESS',
            source: 'history',
          });
        }}
      >
        apply-history-explain-process
      </button>
      <div data-testid="questionnaire-modal-open">{String(context.isQuestionnaireModalOpen ?? false)}</div>
      <div data-testid="questionnaire-template-id">{String(context.questionnaireTemplateId ?? '')}</div>
      <div data-testid="chatbot-v3-journey-stage">{String((context.chatbotV3Journey as { stage?: string } | null)?.stage ?? '')}</div>
      <div data-testid="chatbot-v3-handoff-required">{String((context.chatbotV3Handoff as { required?: boolean } | null)?.required ?? '')}</div>
      <div data-testid="chatbot-v3-card-count">{String(Array.isArray(context.chatbotV3Cards) ? context.chatbotV3Cards.length : 0)}</div>
    </div>
  );
}

let latestContext: Record<string, unknown> | undefined;

describe('PatientEntryProvider action handlers', () => {
  const refreshPatientSession = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        id: 'patient-1',
        caseId: 'case-1',
        nextStep: 'messages-ready',
        widgetChatTarget: {
          kind: 'CHATBOT_SESSION',
          sessionId: 'widget-chat:patient-1:case-1',
        },
        formalConversationState: {
          activeConversationId: 'conversation-1',
          conversationIds: ['conversation-1'],
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
      refreshPatientSession,
      loginWithPassword: vi.fn(),
      requestMagicLink: vi.fn(),
      logout: vi.fn(),
    } as never);

    vi.mocked(patientEntryApi.selectHospitals).mockResolvedValue({
      nextStep: 'messages-ready',
      conversations: [],
      contacts: [],
    } as never);

    vi.mocked(patientEntryApi.convertConsultation).mockResolvedValue({ ok: true } as never);
    vi.mocked(patientEntryApi.getQuestionnaireTemplate).mockResolvedValue({
      caseId: 'case-1',
      questions: [],
    } as never);
  });

  it('posts hospital selection through the formal backend API and refreshes backend truth', async () => {
    render(
      <MemoryRouter>
        <PatientEntryProvider>
          <ActionsProbe />
        </PatientEntryProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'submit-hospital-selection' }));

    await waitFor(() => {
      expect(patientEntryApi.selectHospitals).toHaveBeenCalledWith({
        caseId: 'case-1',
        hospitalIds: ['hospital-1', 'hospital-2'],
        customHospitalRequest: 'Ruijin Hospital',
      });
      expect(refreshPatientSession).toHaveBeenCalledTimes(1);
    });
  });

  it('posts consult conversion through the formal backend API and refreshes backend truth', async () => {
    render(
      <MemoryRouter>
        <PatientEntryProvider>
          <ActionsProbe />
        </PatientEntryProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'request-consult' }));

    await waitFor(() => {
      expect(patientEntryApi.convertConsultation).toHaveBeenCalledWith({
        convertPath: '/api/v2/chatbot/convert',
        requestedAction: 'INVITE_ONLINE_CONSULT',
        conversionDraft: {
          sessionId: 'session-1',
          name: 'Alice',
          email: 'alice@example.com',
          country: 'China',
          conditionSummary: 'Eye pain',
          budget: 'Flexible',
        },
      });
      expect(refreshPatientSession).toHaveBeenCalledTimes(1);
    });
  });

  it('surfaces backend refresh failures after hospital selection so callers can react to stale truth', async () => {
    refreshPatientSession.mockRejectedValueOnce(new Error('refresh failed'));

    render(
      <MemoryRouter>
        <PatientEntryProvider>
          <ActionsProbe />
        </PatientEntryProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(latestContext).toBeDefined();
    });

    await expect((latestContext?.submitHospitalSelection as ((caseId: string, hospitalIds: string[], customHospitalRequest?: string) => Promise<void>) | undefined)?.(
      'case-1',
      ['hospital-1'],
      undefined,
    )).rejects.toThrow('refresh failed');
  });

  it('opens the questionnaire modal for the active case after requesting the template', async () => {
    render(
      <MemoryRouter>
        <PatientEntryProvider>
          <ActionsProbe />
        </PatientEntryProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'request-questionnaire' }));

    await waitFor(() => {
      expect(screen.getByTestId('questionnaire-modal-open').textContent).toBe('true');
      expect(screen.getByTestId('questionnaire-template-id').textContent).toBe('template-1');
    });
  });

  it('stores chatbot v3 journey state without depending on legacy resource state', async () => {
    render(
      <MemoryRouter>
        <PatientEntryProvider>
          <ActionsProbe />
        </PatientEntryProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'apply-v3-stage' }));

    await waitFor(() => {
      expect(screen.getByTestId('chatbot-v3-journey-stage').textContent).toBe('COLLECT_MEDICAL_INPUTS');
      expect(screen.getByTestId('chatbot-v3-handoff-required').textContent).toBe('false');
      expect(screen.getByTestId('chatbot-v3-card-count').textContent).toBe('1');
    });
  });

  it('does not let FAQ detours overwrite the persisted primary chatbot v3 stage', async () => {
    render(
      <MemoryRouter>
        <PatientEntryProvider>
          <ActionsProbe />
        </PatientEntryProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'apply-v3-stage' }));
    fireEvent.click(screen.getByRole('button', { name: 'apply-v3-faq-detour' }));

    await waitFor(() => {
      expect(screen.getByTestId('chatbot-v3-journey-stage').textContent).toBe('COLLECT_MEDICAL_INPUTS');
      expect(screen.getByTestId('chatbot-v3-handoff-required').textContent).toBe('false');
      expect(screen.getByTestId('chatbot-v3-card-count').textContent).toBe('1');
    });
  });

  it('accepts FAQ-detour turns when they carry a newer primary journey stage', async () => {
    render(
      <MemoryRouter>
        <PatientEntryProvider>
          <ActionsProbe />
        </PatientEntryProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'apply-v3-explain-process' }));
    fireEvent.click(screen.getByRole('button', { name: 'apply-v3-progressed-faq-detour' }));

    await waitFor(() => {
      expect(screen.getByTestId('chatbot-v3-journey-stage').textContent).toBe('RECOMMENDATION');
      expect(screen.getByTestId('chatbot-v3-handoff-required').textContent).toBe('false');
      expect(screen.getByTestId('chatbot-v3-card-count').textContent).toBe('0');
    });
  });

  it('accepts recommendation turns that replace stale explain-process state', async () => {
    render(
      <MemoryRouter>
        <PatientEntryProvider>
          <ActionsProbe />
        </PatientEntryProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'apply-v3-explain-process' }));
    fireEvent.click(screen.getByRole('button', { name: 'apply-v3-regressed-recommendation' }));

    await waitFor(() => {
      expect(screen.getByTestId('chatbot-v3-journey-stage').textContent).toBe('RECOMMENDATION');
      expect(screen.getByTestId('chatbot-v3-handoff-required').textContent).toBe('false');
      expect(screen.getByTestId('chatbot-v3-card-count').textContent).toBe('0');
    });
  });

  it('does not let an older primary journey stage overwrite the newer persisted state', async () => {
    render(
      <MemoryRouter>
        <PatientEntryProvider>
          <ActionsProbe />
        </PatientEntryProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'apply-v3-stage' }));
    fireEvent.click(screen.getByRole('button', { name: 'apply-v3-regressed-recommendation' }));

    await waitFor(() => {
      expect(screen.getByTestId('chatbot-v3-journey-stage').textContent).toBe('COLLECT_MEDICAL_INPUTS');
      expect(screen.getByTestId('chatbot-v3-handoff-required').textContent).toBe('false');
      expect(screen.getByTestId('chatbot-v3-card-count').textContent).toBe('1');
    });
  });

  it('does not let stale history explain-process state overwrite a newer recommendation', async () => {
    render(
      <MemoryRouter>
        <PatientEntryProvider>
          <ActionsProbe />
        </PatientEntryProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'apply-v3-regressed-recommendation' }));
    fireEvent.click(screen.getByRole('button', { name: 'apply-history-explain-process' }));

    await waitFor(() => {
      expect(screen.getByTestId('chatbot-v3-journey-stage').textContent).toBe('RECOMMENDATION');
      expect(screen.getByTestId('chatbot-v3-handoff-required').textContent).toBe('false');
      expect(screen.getByTestId('chatbot-v3-card-count').textContent).toBe('0');
    });
  });
});

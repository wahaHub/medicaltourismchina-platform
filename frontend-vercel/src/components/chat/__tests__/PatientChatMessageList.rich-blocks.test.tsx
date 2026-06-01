import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PatientChatMessageList, { type CompactChatMessage } from '../PatientChatMessageList';
import { useLanguage } from '@/contexts/LanguageContext';
import { PatientEntryContext, type PatientEntryContextValue } from '@/contexts/PatientEntryContext';
import type {
  PatientChatbotHistoryJourneySnapshot,
  PatientChatbotHistoryResourceDescriptor,
} from '@/services/api/patient-chatbot';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

function makeMessage(overrides: Partial<CompactChatMessage>): CompactChatMessage {
  return {
    id: 'msg-1',
    role: 'assistant',
    messageSource: 'chatbot',
    content: 'Hello!',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeJourneySnapshot(
  overrides: Partial<PatientChatbotHistoryJourneySnapshot> = {},
): PatientChatbotHistoryJourneySnapshot {
  return {
    currentStage: 'RECOMMENDATION',
    currentPhase: 'active',
    ...overrides,
  };
}

function makeResource(
  overrides: Partial<PatientChatbotHistoryResourceDescriptor> = {},
): PatientChatbotHistoryResourceDescriptor {
  return {
    resourceType: 'QUESTIONNAIRE',
    resourceId: 'resource-1',
    status: 'available',
    visibility: {
      mode: 'journey',
    },
    payload: {
      title: 'Complete your questionnaire',
      templateId: 'template-1',
    },
    actions: ['open'],
    ...overrides,
  };
}

function renderWithPatientEntryContext(
  ui: ReactElement,
  overrides: Partial<PatientEntryContextValue> = {},
) {
  const value = {
    isWidgetOpen: true,
    widgetDisplayMode: 'panel',
    phase: 'messages-ready',
    profileDraft: {
      name: '',
      email: '',
      phone: '',
      age: '',
      gender: '',
      country: '',
      whatsapp: '',
      messenger: '',
      department: '',
      departmentCode: '',
      disease: '',
      destination: '',
      treatmentTime: '',
    },
    caseId: 'case-1',
    widgetChatTarget: null,
    journeySnapshot: null,
    chatbotV3Journey: null,
    chatbotV3Handoff: null,
    chatbotV3Cards: [],
    matchedHospitals: [],
    selectedHospitalIds: [],
    customHospitalRequest: '',
    canAutoMatchHospitals: false,
    isPanelOpen: false,
    bootstrapError: null,
    activeConversationId: 'conversation-admin-1',
    questionnaireTemplateId: null,
    isQuestionnaireModalOpen: false,
    questionnaireHistoryRefreshNonce: 0,
    openComposerAttachmentPicker: vi.fn(),
    registerComposerAttachmentPicker: vi.fn(),
    openWidget: vi.fn(),
    openWidgetModal: vi.fn(),
    closeWidget: vi.fn(),
    toggleWidget: vi.fn(),
    setProfileDraft: vi.fn(),
    patchProfileDraft: vi.fn(),
    setMatchedHospitals: vi.fn(),
    openPanel: vi.fn(),
    closePanel: vi.fn(),
    setActiveConversationId: vi.fn(),
    setBootstrapError: vi.fn(),
    clearBootstrapError: vi.fn(),
    returnToProfileForm: vi.fn(),
    openQuestionnaireModal: vi.fn(),
    closeQuestionnaireModal: vi.fn(),
    requestQuestionnaireHistoryRefresh: vi.fn(),
    applyChatbotV3TurnState: vi.fn(),
    clearChatbotV3TurnState: vi.fn(),
    applyOnboardingResult: vi.fn(),
    applyRestoreResult: vi.fn(),
    resolveMessagesReadyState: vi.fn(),
    resetEntryState: vi.fn(),
    submitHospitalSelection: vi.fn(),
    requestConsultConversion: vi.fn(),
    requestQuestionnaireTemplate: vi.fn(),
    ...overrides,
  } satisfies PatientEntryContextValue;

  return render(
    <PatientEntryContext.Provider value={value}>
      {ui}
    </PatientEntryContext.Provider>,
  );
}

describe('PatientChatMessageList — rich blocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        apiCode: 'en',
      },
    } as never);
  });

  it('renders a typing state with the default AI label', () => {
    renderWithPatientEntryContext(<PatientChatMessageList messages={[
      makeMessage({ id: 'typing', content: '', senderType: 'ai', messageState: 'typing' }),
    ]} />);

    expect(screen.getByText('AI Bot')).toBeTruthy();
    expect(screen.getByTestId('assistant-typing-bubble')).toBeTruthy();
    expect(screen.getAllByTestId(/assistant-typing-dot-/)).toHaveLength(3);
  });

  it('renders formal conversation blocks unchanged', () => {
    render(<PatientChatMessageList messages={[
      makeMessage({
        messageSource: 'formal',
        content: 'Here is the process',
        blocks: [{
          id: 'block-process',
          type: 'PROCESS_MODAL_TRIGGER',
          modalKey: 'MEDICAL_TRAVEL_PROCESS',
          title: 'Medical Travel Process',
        }],
      }),
    ]} />);

    expect(document.querySelector('[data-block-type="PROCESS_MODAL_TRIGGER"]')).toBeTruthy();
    expect(screen.getByText('Medical Travel Process')).toBeTruthy();
    expect(screen.getByText('Here is the process')).toBeTruthy();
  });

  it('bridges questionnaire history resources into the existing questionnaire block', () => {
    renderWithPatientEntryContext(<PatientChatMessageList messages={[{
      ...makeMessage({
        messageSource: 'chatbot',
        content: 'Here is your next step',
      }),
      resources: [
        makeResource({
          resourceType: 'QUESTIONNAIRE',
          resourceId: 'questionnaire-1',
          payload: {
            title: 'Complete your questionnaire',
            templateId: 'template-1',
          },
        }),
      ],
      journeySnapshot: makeJourneySnapshot(),
    }]} />);

    expect(document.querySelector('[data-block-type="QUESTIONNAIRE_MODAL_TRIGGER"]')).toBeTruthy();
    expect(screen.getByText('Complete your questionnaire')).toBeTruthy();
  });

  it('keeps malformed questionnaire history resources inert when templateId is missing', () => {
    renderWithPatientEntryContext(<PatientChatMessageList messages={[{
      ...makeMessage({
        messageSource: 'chatbot',
        content: 'Here is your next step',
      }),
      resources: [
        makeResource({
          resourceType: 'QUESTIONNAIRE',
          resourceId: 'questionnaire-missing-template',
          payload: {
            title: 'Incomplete questionnaire payload',
          },
        }),
      ],
      journeySnapshot: makeJourneySnapshot(),
    }]} />);

    expect(document.querySelector('[data-block-type="QUESTIONNAIRE_MODAL_TRIGGER"]')).toBeNull();
    const shell = document.querySelector('[data-history-resource-id="questionnaire-missing-template"]');
    expect(shell).toBeTruthy();
    expect(shell?.getAttribute('data-history-resource-type')).toBe('QUESTIONNAIRE');
  });

  it('routes the supporting-document widget CTA into the composer attachment picker bridge', () => {
    const openComposerAttachmentPicker = vi.fn();

    renderWithPatientEntryContext(<PatientChatMessageList messages={[makeMessage({
      content: '',
      blocks: [{
        id: 'upload-block',
        type: 'SUPPORTING_DOCUMENT_UPLOAD_PROMPT',
        title: 'Upload your medical records',
        description: 'Please attach at least one supporting document.',
        required: true,
        uploadedCount: 0,
      }],
    })]} />, {
      openComposerAttachmentPicker,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Upload supporting documents' }));
    expect(openComposerAttachmentPicker).toHaveBeenCalledTimes(1);
  });

  it('renders HOSPITAL_RECOMMENDATION resources locally without chat-v2 renderers', () => {
    renderWithPatientEntryContext(<PatientChatMessageList messages={[{
      ...makeMessage({
        content: 'Recommended hospitals',
      }),
      resources: [
        makeResource({
          resourceType: 'HOSPITAL_RECOMMENDATION',
          resourceId: 'hospital-resource-1',
          payload: {
            title: 'Top Hospitals For You',
            caseId: 'case-1',
            selectPath: '/select-hospitals',
            hospitals: [
              {
                hospitalId: 'hospital-1',
                name: 'Beijing Hospital',
              },
            ],
          },
        }),
      ],
      journeySnapshot: makeJourneySnapshot(),
    }]} />);

    expect(document.querySelector('[data-block-type="HOSPITAL_RECOMMENDATION_CARDS"]')).toBeTruthy();
    expect(screen.getByText('Top Hospitals For You')).toBeTruthy();
    expect(screen.getByText('Beijing Hospital')).toBeTruthy();
  });

  it('keeps malformed hospital recommendation history resources inert when required fields are missing', () => {
    renderWithPatientEntryContext(<PatientChatMessageList messages={[{
      ...makeMessage({
        content: 'Recommended hospitals',
      }),
      resources: [
        makeResource({
          resourceType: 'HOSPITAL_RECOMMENDATION',
          resourceId: 'hospital-resource-invalid',
          payload: {
            title: 'Broken hospital payload',
            hospitals: [],
          },
        }),
      ],
      journeySnapshot: makeJourneySnapshot(),
    }]} />);

    expect(document.querySelector('[data-block-type="HOSPITAL_RECOMMENDATION_CARDS"]')).toBeNull();
    const shell = document.querySelector('[data-history-resource-id="hospital-resource-invalid"]');
    expect(shell).toBeTruthy();
    expect(shell?.getAttribute('data-history-resource-type')).toBe('HOSPITAL_RECOMMENDATION');
  });

  it('prefers legacy history bridge blocks over older chatbot blocks when both are present', () => {
    renderWithPatientEntryContext(<PatientChatMessageList messages={[{
      ...makeMessage({
        messageSource: 'chatbot',
        content: 'Use the newer resource UI',
        blocks: [{
          id: 'legacy-block-2',
          type: 'QUESTIONNAIRE_MODAL_TRIGGER',
          templateId: '11111111-1111-4111-8111-111111111111',
          title: 'Legacy questionnaire block',
        }],
      }),
      resources: [
        makeResource({
          resourceType: 'QUESTIONNAIRE',
          resourceId: 'questionnaire-2',
          payload: {
            title: 'V3 questionnaire resource',
            templateId: 'template-2',
          },
        }),
      ],
      journeySnapshot: makeJourneySnapshot(),
    }]} />);

    expect(document.querySelector('[data-block-type="QUESTIONNAIRE_MODAL_TRIGGER"]')).toBeTruthy();
    expect(screen.getByText('V3 questionnaire resource')).toBeTruthy();
    expect(screen.queryByText('Legacy questionnaire block')).toBeNull();
  });

  it('renders unknown history resource shells when unsupported payloads arrive alongside supported ones', () => {
    renderWithPatientEntryContext(<PatientChatMessageList messages={[{
      ...makeMessage({
        messageSource: 'chatbot',
        content: 'Legacy fallback should stay usable',
      }),
      resources: [
        makeResource({
          resourceType: 'QUESTIONNAIRE',
          resourceId: 'questionnaire-3',
          payload: {
            title: 'Visible questionnaire resource',
            templateId: 'template-3',
          },
        }),
        {
          resourceType: 'UNSUPPORTED_FUTURE_RESOURCE' as never,
          resourceId: 'unknown-resource-1',
          status: 'available',
          visibility: { mode: 'journey' },
          payload: {
            title: 'Invitation status',
          },
          actions: ['open'],
        },
      ],
      journeySnapshot: makeJourneySnapshot(),
    }]} />);

    expect(document.querySelector('[data-block-type="QUESTIONNAIRE_MODAL_TRIGGER"]')).toBeTruthy();
    const resource = document.querySelector('[data-history-resource-type="UNKNOWN"]');
    expect(resource).toBeTruthy();
    expect(resource?.getAttribute('data-history-resource-id')).toBe('unknown-resource-1');
  });

  it('renders restored chatbot-v3 assistant text when the legacy content is empty', () => {
    renderWithPatientEntryContext(<PatientChatMessageList messages={[makeMessage({
      content: '',
      v3Turn: {
        assistantText: 'This answer came from chatbotV3 metadata.',
        attachments: [],
        cards: [],
        journey: {
          stage: 'RECOMMENDATION',
          phase: 'active',
        },
        handoff: {
          required: false,
          ticketId: null,
        },
        turnOutcome: {
          status: 'ok',
          recoverableErrorCode: null,
        },
        uiIntent: 'FAQ_DETOUR',
      },
    })]} />);

    expect(screen.getByText('This answer came from chatbotV3 metadata.')).toBeTruthy();
  });

  it('renders pending attachments without empty links when optimistic chatbot attachments have no url yet', () => {
    render(<PatientChatMessageList messages={[{
      id: 'msg-patient',
      role: 'patient',
      messageSource: 'chatbot',
      content: 'Please review these uploads',
      createdAt: '2026-01-01T00:00:00Z',
      attachments: [
        {
          fileName: 'report.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024,
          storageKey: 'crm/dev/chatbot/report.pdf',
          name: 'report.pdf',
          type: 'application/pdf',
          size: 1024,
          url: '',
        },
        {
          fileName: 'scan.jpg',
          mimeType: 'image/jpeg',
          fileSize: 2048,
          storageKey: 'crm/dev/chatbot/scan.jpg',
          name: 'scan.jpg',
          type: 'image/jpeg',
          size: 2048,
          url: '',
        },
      ],
    }]} />);

    expect(screen.getByText('report.pdf')).toBeTruthy();
    expect(screen.getByText('scan.jpg')).toBeTruthy();
    expect(screen.getAllByText('Upload syncing')).toHaveLength(2);
  });
});

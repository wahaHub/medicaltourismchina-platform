import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { usePatientSessionRuntime } from '@/features/patient-sessions/PatientSessionRuntimeProvider';
import { patientChatbotV3Api } from '@/services/api/patient-chatbot-v3';
import { patientMessagesApi, type PatientChatState } from '@/services/api/patient-messages';
import PatientEntryWindow from '../PatientEntryWindow';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

vi.mock('@/hooks/usePatientAuth', () => ({
  usePatientAuth: vi.fn(),
}));

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: vi.fn(),
}));

vi.mock('@/features/patient-sessions/PatientSessionRuntimeProvider', () => ({
  usePatientSessionRuntime: vi.fn(),
}));

vi.mock('@/services/api/patient-chatbot-v3', () => ({
  patientChatbotV3Api: {
    sendMessage: vi.fn(),
    initAttachmentUpload: vi.fn(),
  },
}));

vi.mock('@/services/api/patient-messages', () => ({
  patientMessagesApi: {
    sendSessionChatEvent: vi.fn(),
    requestOnlineConsultBooking: vi.fn(),
  },
}));

vi.mock('../PatientQuestionnaireModal', () => ({
  default: ({ templateId }: { templateId: string | null }) => (
    <div data-testid="questionnaire-modal" data-template-id={templateId ?? ''} />
  ),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderWithQueryClient(ui: ReactElement) {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      {ui}
    </QueryClientProvider>,
  );
}

const backendMechanicalState: PatientChatState = {
  botMode: 'mechanical',
  availableActions: [
    { id: 'VIEW_PROCESS', label: '了解就医流程', icon: 'route' },
    { id: 'UPLOAD_RECORDS', label: '上传医疗资料', icon: 'upload' },
    { id: 'CONTACT_ADVISOR', label: '联系顾问', icon: 'handshake' },
    { id: 'OPEN_QUESTIONNAIRE', label: '填写病情表', icon: 'clipboard' },
    { id: 'BOOK_ONLINE_CONSULT', label: '预约在线问诊', icon: 'calendar' },
  ],
  composerPolicy: {
    textEnabled: false,
    attachmentsEnabled: true,
    sendEnabledWhen: 'attachment_only',
    placeholder: '请使用上方菜单继续。',
  },
};

const careTeamSession = {
  id: 'widget-chat:patient-1:case-1',
  sessionId: 'widget-chat:patient-1:case-1',
  caseId: 'case-1',
  type: 'CARE_TEAM' as const,
  sessionKind: 'care-team' as const,
  title: 'Medora Care Team',
  displayTitle: 'Medora Care Team',
  hospitalId: null,
  hospitalName: null,
  assistantMode: 'AI_ACTIVE' as const,
  isAiAvailable: true,
  unreadCount: 0,
  lastMessagePreview: null,
  lastMessageAt: null,
  updatedAt: '2026-06-01T00:00:00.000Z',
};

function buildPatientEntryState(overrides: Record<string, unknown> = {}) {
  return {
    phase: 'messages-ready',
    caseId: 'case-1',
    widgetDisplayMode: 'panel',
    widgetChatTarget: {
      kind: 'CHATBOT_SESSION',
      sessionId: 'widget-session-1',
    },
    isQuestionnaireModalOpen: false,
    questionnaireTemplateId: null,
    closeQuestionnaireModal: vi.fn(),
    requestQuestionnaireTemplate: vi.fn(),
    openComposerAttachmentPicker: vi.fn(),
    processConfirmed: false,
    markProcessConfirmed: vi.fn(),
    profileDraft: {
      name: 'Alice Zhang',
      email: 'alice@example.com',
      phone: '+86 13800000000',
      age: '',
      gender: '',
      country: '',
      whatsapp: '',
      messenger: '',
      department: 'Oncology',
      departmentCode: '',
      disease: 'Lung cancer',
      destination: '',
      treatmentTime: '',
    },
    bootstrapError: null,
    clearBootstrapError: vi.fn(),
    ...overrides,
  };
}

function buildRuntimeState(overrides: Record<string, unknown> = {}) {
  return {
    sessions: [careTeamSession],
    sessionsLoading: false,
    sessionsError: null,
    activeSessionId: 'widget-chat:patient-1:case-1',
    activeSession: careTeamSession,
    setActiveSessionId: vi.fn(),
    detail: {
      sessionId: 'widget-chat:patient-1:case-1',
      caseId: 'case-1',
      type: 'CARE_TEAM',
      title: 'Medora Care Team',
      hospitalId: null,
      hospitalName: null,
      isAiAvailable: true,
      chatAuthority: 'AI_ACTIVE',
      chatState: backendMechanicalState,
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
    connectionState: 'ws',
    isRuntimeEnabled: true,
    canShowSessions: true,
    ...overrides,
  };
}

describe('PatientEntryWindow backend-owned mechanical chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'zh',
      },
      t: (key: string) => key,
    } as never);

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        formalConversationState: {
          activeAssistantMode: 'AI_ACTIVE',
        },
      },
    } as never);

    vi.mocked(usePatientEntry).mockReturnValue(buildPatientEntryState() as never);
    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState() as never);
    vi.mocked(patientMessagesApi.sendSessionChatEvent).mockResolvedValue({} as never);
  });

  it('renders backend-provided mechanical actions after profile onboarding', () => {
    renderWithQueryClient(<PatientEntryWindow />);

    expect(screen.getByRole('button', { name: '了解就医流程' })).toBeDefined();
    expect(screen.getByRole('button', { name: '上传医疗资料' })).toBeDefined();
    expect(screen.getByRole('button', { name: '联系顾问' })).toBeDefined();
    expect(screen.getByRole('button', { name: '填写病情表' })).toBeDefined();
    expect(screen.getByRole('button', { name: '预约在线问诊' })).toBeDefined();
    expect(screen.getByPlaceholderText('请使用上方菜单继续。')).toBeDefined();
  });

  it('does not render the mechanical menu unless the backend chatState says mechanical', () => {
    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState({
      detail: {
        ...buildRuntimeState().detail,
        chatState: {
          ...backendMechanicalState,
          botMode: 'human',
          availableActions: [],
          composerPolicy: {
            textEnabled: true,
            attachmentsEnabled: true,
            sendEnabledWhen: 'text_or_attachment',
            placeholder: '给医疗团队发送消息...',
          },
        },
      },
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    expect(screen.queryByTestId('mechanical-chat-menu')).toBeNull();
    expect(screen.getByPlaceholderText('给医疗团队发送消息...')).toBeDefined();
  });

  it('sends backend action events instead of calling chatbot v3', async () => {
    const refreshActiveSession = vi.fn();
    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState({
      refreshActiveSession,
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    fireEvent.click(screen.getByRole('button', { name: '上传医疗资料' }));

    await waitFor(() => {
      expect(patientMessagesApi.sendSessionChatEvent).toHaveBeenCalledWith({
        sessionId: 'widget-chat:patient-1:case-1',
        eventType: 'ACTION_SELECTED',
        actionKey: 'UPLOAD_RECORDS',
        clientMessageId: 'ma:widget-chat:patient-1:case-1:ur',
        locale: 'zh',
      });
      expect(refreshActiveSession).toHaveBeenCalled();
    });
    expect(patientChatbotV3Api.sendMessage).not.toHaveBeenCalled();
  });

  it('requests human handoff through the backend state machine', async () => {
    renderWithQueryClient(<PatientEntryWindow />);

    fireEvent.click(screen.getByRole('button', { name: '联系顾问' }));

    await waitFor(() => {
      expect(patientMessagesApi.sendSessionChatEvent).toHaveBeenCalledWith({
        sessionId: 'widget-chat:patient-1:case-1',
        eventType: 'ACTION_SELECTED',
        actionKey: 'CONTACT_ADVISOR',
        clientMessageId: 'ma:widget-chat:patient-1:case-1:ca',
        locale: 'zh',
      });
    });
    expect(patientMessagesApi.sendSessionChatEvent).toHaveBeenCalledTimes(1);
  });

  it('keeps mechanical action client ids within backend validation limits', async () => {
    const uuidSessionId = 'widget-chat:00000000-0000-4000-8000-000000000001:00000000-0000-4000-8000-000000000002';
    const uuidSession = {
      ...careTeamSession,
      id: uuidSessionId,
      sessionId: uuidSessionId,
    };
    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState({
      sessions: [uuidSession],
      activeSessionId: uuidSessionId,
      activeSession: uuidSession,
      detail: {
        ...buildRuntimeState().detail,
        sessionId: uuidSessionId,
      },
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    fireEvent.click(screen.getByRole('button', { name: '填写病情表' }));

    await waitFor(() => {
      expect(patientMessagesApi.sendSessionChatEvent).toHaveBeenCalledWith(expect.objectContaining({
        actionKey: 'OPEN_QUESTIONNAIRE',
        clientMessageId: expect.any(String),
      }));
    });
    const payload = vi.mocked(patientMessagesApi.sendSessionChatEvent).mock.calls[0]?.[0];
    expect(payload?.clientMessageId?.length).toBeLessThanOrEqual(120);
  });
});

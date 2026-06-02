import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { usePatientSessionRuntime } from '@/features/patient-sessions/PatientSessionRuntimeProvider';
import { patientChatbotV3Api } from '@/services/api/patient-chatbot-v3';
import { patientMessagesApi } from '@/services/api/patient-messages';
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
    confirmProcessGuide: vi.fn(),
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

describe('PatientEntryWindow mechanical chat', () => {
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
    vi.mocked(patientMessagesApi.confirmProcessGuide).mockResolvedValue({
      ok: true,
      status: 'confirmed',
    });
  });

  it('renders the fixed intro and compact action bar after profile onboarding', () => {
    renderWithQueryClient(<PatientEntryWindow />);

    expect(screen.getByText(/您好，我是 Medora 医疗旅程助手/)).toBeDefined();
    expect(screen.getByRole('button', { name: '了解就医流程' })).toBeDefined();
    expect(screen.getByRole('button', { name: '上传医疗资料' })).toBeDefined();
    expect(screen.getByRole('button', { name: '联系顾问' })).toBeDefined();
    expect(screen.getByRole('button', { name: '填写病情表' })).toBeDefined();
  });

  it('localizes the mechanical menu after profile onboarding', () => {
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'en',
      },
      t: (key: string) => key,
    } as never);

    renderWithQueryClient(<PatientEntryWindow />);

    expect(screen.getByText(/Hello, I am your Medora care journey assistant/)).toBeDefined();
    expect(screen.getByRole('button', { name: 'Review care journey' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Upload medical records' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Contact coordinator' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Complete medical form' })).toBeDefined();
    expect(screen.getByPlaceholderText('Use the menu above to continue. This flow will not send free text to AI.')).toBeDefined();
  });

  it('also honors the explicit CRM mechanicalChat flag when it is present', () => {
    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState({
      detail: {
        ...buildRuntimeState().detail,
        mechanicalChat: {
          enabled: true,
          introShown: true,
          actions: {},
          events: [],
        },
      },
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    expect(screen.getByTestId('mechanical-chat-menu')).toBeDefined();
  });

  it('does not crash while the active session detail is still loading', () => {
    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState({
      detail: null,
      detailLoading: true,
    }) as never);

    expect(() => renderWithQueryClient(<PatientEntryWindow />)).not.toThrow();
    expect(screen.getByText('正在加载医疗团队消息...')).toBeDefined();
  });

  it('shows the retry state when active session detail fails before any detail is cached', () => {
    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState({
      detail: null,
      detailLoading: false,
      detailError: 'Unable to load conversation',
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    expect(screen.getByText('Unable to load conversation')).toBeDefined();
    expect(screen.queryByText('正在加载医疗团队消息...')).toBeNull();
  });

  it('hides the action bar while a selected turn is in progress and does not call chatbot v3', async () => {
    renderWithQueryClient(<PatientEntryWindow />);

    fireEvent.click(screen.getByRole('button', { name: '上传医疗资料' }));

    expect(screen.queryByRole('button', { name: '上传医疗资料' })).toBeNull();
    expect(screen.getByText('请您先同意赴华就医流程和服务规则，然后我们才能继续引导您上传医疗资料。')).toBeDefined();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '自由输入不应发送给 AI' },
    });
    fireEvent.click(screen.getByRole('button', { name: '发送' }));

    await waitFor(() => {
      expect(patientChatbotV3Api.sendMessage).not.toHaveBeenCalled();
    });
  });

  it('persists process confirmation before unlocking gated actions', async () => {
    const markProcessConfirmed = vi.fn();
    const refreshActiveSession = vi.fn();
    vi.mocked(usePatientEntry).mockReturnValue(buildPatientEntryState({
      markProcessConfirmed,
    }) as never);
    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState({
      refreshActiveSession,
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    fireEvent.click(screen.getByRole('button', { name: '上传医疗资料' }));
    fireEvent.click(screen.getByRole('button', { name: '打开并确认流程' }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'processConfirm.confirm' }));

    await waitFor(() => {
      expect(patientMessagesApi.confirmProcessGuide).toHaveBeenCalledWith({
        sessionId: 'widget-chat:patient-1:case-1',
      });
      expect(markProcessConfirmed).toHaveBeenCalled();
      expect(refreshActiveSession).toHaveBeenCalled();
    });

    expect(screen.getByText('好的，请直接上传已有的检查报告、影像、化验单或病历摘要。文件会进入您的 Medora case，顾问和医疗团队可以继续查看。')).toBeDefined();
  });

  it('persists legacy process-guide resource confirmations', async () => {
    const markProcessConfirmed = vi.fn();
    const refreshActiveSession = vi.fn();
    vi.mocked(usePatientEntry).mockReturnValue(buildPatientEntryState({
      markProcessConfirmed,
      widgetChatTarget: null,
    }) as never);
    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState({
      detail: {
        ...buildRuntimeState().detail,
        data: [
          {
            id: 'history-process-message',
            source: 'CHATBOT',
            senderRole: 'ASSISTANT',
            content: '',
            createdAt: '2026-06-01T00:00:00.000Z',
            attachments: [],
            metadata: {
              resources: [
                {
                  resourceId: 'process-resource-1',
                  resourceType: 'PROCESS_GUIDE',
                  status: 'ready',
                  payload: {
                    title: '赴华就医流程和服务规则',
                    description: '请阅读并确认赴华就医流程和服务规则。',
                    ctaLabel: '打开流程说明',
                  },
                },
              ],
            },
          },
        ],
      },
      refreshActiveSession,
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    fireEvent.click(screen.getByRole('button', { name: '打开流程说明' }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'processConfirm.confirm' }));

    await waitFor(() => {
      expect(patientMessagesApi.confirmProcessGuide).toHaveBeenCalledWith({
        sessionId: 'widget-chat:patient-1:case-1',
      });
      expect(markProcessConfirmed).toHaveBeenCalled();
      expect(refreshActiveSession).toHaveBeenCalled();
    });
  });

  it('marks questionnaire complete only after the form submit refreshes history', async () => {
    const requestQuestionnaireTemplate = vi.fn();
    const entryState = buildPatientEntryState({
      requestQuestionnaireTemplate,
      questionnaireHistoryRefreshNonce: 0,
    });
    vi.mocked(usePatientEntry).mockReturnValue(entryState as never);

    const { rerender } = renderWithQueryClient(<PatientEntryWindow />);

    fireEvent.click(screen.getByRole('button', { name: '填写病情表' }));
    fireEvent.click(screen.getByRole('button', { name: '打开并确认流程' }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'processConfirm.confirm' }));
    await waitFor(() => {
      expect(patientMessagesApi.confirmProcessGuide).toHaveBeenCalled();
    });
    fireEvent.click(screen.getByRole('button', { name: '填写病情表' }));

    expect(requestQuestionnaireTemplate).toHaveBeenCalledWith('DEFAULT');
    expect(screen.queryByText('我们已收到您的病情表。Medora 医疗团队会结合您的资料继续评估。')).toBeNull();

    vi.mocked(usePatientEntry).mockReturnValue({
      ...entryState,
      questionnaireHistoryRefreshNonce: 1,
    } as never);
    rerender(
      <QueryClientProvider client={createTestQueryClient()}>
        <PatientEntryWindow />
      </QueryClientProvider>,
    );

    expect(screen.getByText('我们已收到您的病情表。Medora 医疗团队会结合您的资料继续评估。')).toBeDefined();
    expect(screen.getByRole('button', { name: '修改病情表' })).toBeDefined();
  });

  it('opens the attachment picker for medical-record uploads without completing when no file is selected', async () => {
    const openComposerAttachmentPicker = vi.fn();
    vi.mocked(usePatientEntry).mockReturnValue(buildPatientEntryState({
      openComposerAttachmentPicker,
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    fireEvent.click(screen.getByRole('button', { name: '上传医疗资料' }));
    fireEvent.click(screen.getByRole('button', { name: '打开并确认流程' }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'processConfirm.confirm' }));
    await waitFor(() => {
      expect(patientMessagesApi.confirmProcessGuide).toHaveBeenCalled();
    });

    expect(screen.getByText('好的，请直接上传已有的检查报告、影像、化验单或病历摘要。文件会进入您的 Medora case，顾问和医疗团队可以继续查看。')).toBeDefined();
    expect(screen.queryByText(/当前机械菜单不会在本页面直接收集文件/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '选择文件上传' }));

    expect(openComposerAttachmentPicker).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('您的医疗资料已上传到您的 Medora case。')).toBeNull();
    expect(screen.queryByText('已完成')).toBeNull();
    expect(screen.queryByRole('button', { name: '上传医疗资料' })).toBeNull();
  });

  it('does not claim handoff completed while backend handoff action is not wired', () => {
    vi.mocked(usePatientEntry).mockReturnValue(buildPatientEntryState({
      processConfirmed: true,
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    fireEvent.click(screen.getByRole('button', { name: '联系顾问' }));
    expect(screen.getAllByText('我们会根据您已提交的基本信息安排人工团队跟进。请注意查收邮箱，Medora 顾问会继续联系您。').length).toBeGreaterThan(0);
    expect(screen.queryByText(/已为您把整个 case 转交/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '确认需要顾问联系' }));

    expect(screen.getAllByText('我们会根据您已提交的基本信息安排人工团队跟进。请注意查收邮箱，Medora 顾问会继续联系您。').length).toBeGreaterThan(0);
    expect(screen.queryByText(/case 已转交/)).toBeNull();
  });
});

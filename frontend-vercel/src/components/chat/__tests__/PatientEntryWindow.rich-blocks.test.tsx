import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { usePatientSessionRuntime } from '@/features/patient-sessions/PatientSessionRuntimeProvider';
import { patientChatbotApi } from '@/services/api/patient-chatbot';
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

vi.mock('@/services/api/patient-chatbot', () => ({
  patientChatbotApi: {
    getHistory: vi.fn(),
    sendMessage: vi.fn(),
    initAttachmentUpload: vi.fn(),
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

const baseSessions = [
  {
    id: 'widget-chat:patient-1:case-1',
    sessionId: 'widget-chat:patient-1:case-1',
    caseId: 'case-1',
    type: 'CARE_TEAM' as const,
    sessionKind: 'care-team' as const,
    title: 'Medora Care Team',
    displayTitle: 'Medora Care Team',
    hospitalId: null,
    hospitalName: null,
    assistantMode: 'HUMAN_TAKEOVER' as const,
    isAiAvailable: false,
    unreadCount: 0,
    lastMessagePreview: 'Human reply',
    lastMessageAt: '2026-04-18T00:01:00.000Z',
    updatedAt: '2026-04-18T00:01:00.000Z',
  },
  {
    id: 'hospital:hospital-1:case-1',
    sessionId: 'hospital:hospital-1:case-1',
    caseId: 'case-1',
    type: 'HOSPITAL' as const,
    sessionKind: 'hospital' as const,
    title: 'Ruijin Hospital',
    displayTitle: 'Ruijin Hospital',
    hospitalId: 'hospital-1',
    hospitalName: 'Ruijin Hospital',
    assistantMode: 'HUMAN_TAKEOVER' as const,
    isAiAvailable: false,
    unreadCount: 0,
    lastMessagePreview: 'Hospital reply',
    lastMessageAt: '2026-04-18T00:02:00.000Z',
    updatedAt: '2026-04-18T00:02:00.000Z',
  },
];

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
    profileDraft: {
      name: 'Alice Zhang',
      email: 'alice@example.com',
      phone: '+86 13800000000',
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
    bootstrapError: null,
    clearBootstrapError: vi.fn(),
    matchedHospitals: [],
    selectedHospitalIds: [],
    canAutoMatchHospitals: false,
    ...overrides,
  };
}

function buildRuntimeState(overrides: Record<string, unknown> = {}) {
  return {
    sessions: baseSessions,
    sessionsLoading: false,
    sessionsError: null,
    activeSessionId: 'widget-chat:patient-1:case-1',
    activeSession: baseSessions[0],
    setActiveSessionId: vi.fn(),
    detail: {
      sessionId: 'widget-chat:patient-1:case-1',
      caseId: 'case-1',
      type: 'CARE_TEAM',
      title: 'Medora Care Team',
      hospitalId: null,
      hospitalName: null,
      isAiAvailable: false,
      chatAuthority: 'HUMAN_TAKEOVER',
      data: [
        {
          id: 'msg-ai',
          sessionId: 'widget-chat:patient-1:case-1',
          source: 'CHATBOT',
          conversationId: null,
          senderId: null,
          senderRole: 'AI',
          senderName: 'Medora AI',
          content: 'AI reply',
          originalLanguage: null,
          translatedContent: null,
          messageType: 'TEXT',
          moderationStatus: null,
          attachments: [],
          createdAt: '2026-04-18T00:00:00.000Z',
          metadata: {},
        },
        {
          id: 'msg-admin',
          sessionId: 'widget-chat:patient-1:case-1',
          source: 'FORMAL',
          conversationId: 'conv-1',
          senderId: 'admin-1',
          senderRole: 'ADMIN',
          senderName: 'Medora Care Team',
          content: 'Human reply',
          originalLanguage: null,
          translatedContent: null,
          messageType: 'TEXT',
          moderationStatus: 'ALLOWED',
          attachments: [],
          createdAt: '2026-04-18T00:01:00.000Z',
        },
      ],
      total: 2,
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

describe('PatientEntryWindow runtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'en',
      },
      t: (key: string) => ({
        'patientConversations.medoraCareTeam': 'Medora Care Team',
        'patientConversations.hospitalConversation': 'Hospital Conversation',
        'patientConversations.title': 'Conversations',
        'patientConversations.subtitle': 'Switch between hospital and Medora care-team conversations.',
        'patientConversations.loading': 'Loading conversations...',
        'patientConversations.empty': 'No conversations yet.',
        'patientConversations.noMessages': 'No messages yet',
        'patientConversations.hospital': 'Hospital',
        'patientConversations.careTeam': 'Care team',
      }[key] ?? key),
    } as never);

    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        formalConversationState: {
          activeAssistantMode: 'HUMAN_TAKEOVER',
        },
      },
    } as never);

    vi.mocked(usePatientEntry).mockReturnValue(buildPatientEntryState() as never);

    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState() as never);
  });

  it('renders a merged care-team timeline without fetching separate chatbot history', () => {
    renderWithQueryClient(<PatientEntryWindow />);

    expect(screen.getByText('AI reply')).toBeDefined();
    expect(screen.getByText('Human reply')).toBeDefined();
    expect(vi.mocked(patientChatbotApi.getHistory)).not.toHaveBeenCalled();
  });

  it('shows the compact session switcher in panel mode', () => {
    renderWithQueryClient(<PatientEntryWindow />);

    const compactSwitcher = screen.getByTestId('compact-session-switcher');
    const header = screen.getByTestId('patient-entry-header');

    expect(compactSwitcher).toBeDefined();
    expect(header.contains(compactSwitcher)).toBe(true);
    expect(screen.queryByTestId('sidebar-session-list')).toBeNull();
  });

  it('hides the compact switcher when only the care-team session exists', () => {
    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState({
      sessions: [baseSessions[0]],
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    expect(screen.queryByTestId('compact-session-switcher')).toBeNull();
  });

  it('shows the sidebar session list in modal mode', () => {
    vi.mocked(usePatientEntry).mockReturnValue(buildPatientEntryState({
      widgetDisplayMode: 'modal',
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    expect(screen.getByTestId('sidebar-session-list')).toBeDefined();
  });

  it('keeps the compact switcher available in modal mode for small-screen layouts', () => {
    vi.mocked(usePatientEntry).mockReturnValue(buildPatientEntryState({
      widgetDisplayMode: 'modal',
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    expect(screen.getByTestId('compact-session-switcher')).toBeDefined();
    expect(screen.getByTestId('patient-entry-header').contains(screen.getByTestId('compact-session-switcher'))).toBe(true);
  });

  it('shows a loading notice immediately when the selected session changes before the new detail arrives', () => {
    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState({
      activeSessionId: 'hospital:hospital-1:case-1',
      activeSession: baseSessions[1],
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
      detailLoading: true,
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    expect(screen.getAllByText('Ruijin Hospital').length).toBeGreaterThan(0);
    expect(screen.getByText('Loading care team messages...')).toBeDefined();
  });

  it('shows the reconnecting banner while runtime fallback polling is active', () => {
    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState({
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
      connectionState: 'polling',
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    expect(screen.getByText('Reconnecting to the care team chat...')).toBeDefined();
  });

  it('does not expose fallback polling as a flashing header badge', () => {
    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState({
      connectionState: 'polling',
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    expect(screen.queryByText('Polling fallback')).toBeNull();
  });

  it('prefers live detail authority over the stale session list when care-team ownership changes', () => {
    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState({
      activeSession: {
        ...baseSessions[0],
        assistantMode: 'AI_ACTIVE',
      },
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
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    const composer = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(composer.disabled).toBe(false);
  });

  it('keeps hospital sessions on the formal path even when case authority remains AI_ACTIVE', () => {
    vi.mocked(usePatientSessionRuntime).mockReturnValue(buildRuntimeState({
      activeSessionId: 'hospital:hospital-1:case-1',
      activeSession: {
        ...baseSessions[1],
        assistantMode: 'HUMAN_TAKEOVER',
      },
      detail: {
        sessionId: 'hospital:hospital-1:case-1',
        caseId: 'case-1',
        type: 'HOSPITAL',
        title: 'Ruijin Hospital',
        hospitalId: 'hospital-1',
        hospitalName: 'Ruijin Hospital',
        isAiAvailable: false,
        chatAuthority: 'AI_ACTIVE',
        data: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 1,
        hasMore: false,
      },
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    const composer = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(composer.disabled).toBe(false);
  });

  it('renders the questionnaire modal inline when requested', () => {
    vi.mocked(usePatientEntry).mockReturnValue(buildPatientEntryState({
      isQuestionnaireModalOpen: true,
      questionnaireTemplateId: 'template-1',
    }) as never);

    renderWithQueryClient(<PatientEntryWindow />);

    expect(screen.getByTestId('questionnaire-modal').getAttribute('data-template-id')).toBe('template-1');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PatientProfileForm from '../PatientProfileForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { departmentApi } from '@/services/api/department';
import { patientEntryApi } from '@/services/api/patient-entry';

vi.mock('@/hooks/usePatientAuth', () => ({
  usePatientAuth: vi.fn(),
}));

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: vi.fn(),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

vi.mock('@/services/api/patient-entry', () => ({
  patientEntryApi: {
    initOnboarding: vi.fn(),
  },
}));

vi.mock('@/services/api/department', () => ({
  departmentApi: {
    getDept: vi.fn(),
  },
}));

describe('PatientProfileForm', () => {
  let bootstrapSession: ReturnType<typeof vi.fn>;
  let applyOnboardingResult: ReturnType<typeof vi.fn>;
  const onboardingBootstrap = {
    patientId: 'patient-1',
    caseId: 'case-1',
    restoreToken: 'restore-token-1',
    nextStep: 'messages-ready' as const,
    name: 'Alice Zhang',
    email: 'alice@example.com',
    selectedHospitalId: 'hospital-1',
    selectedHospitalIds: ['hospital-1'],
    widgetChatTarget: {
      kind: 'CHATBOT_SESSION' as const,
      sessionId: 'widget-session-1',
    },
    formalConversationState: {
      activeConversationId: 'conversation-admin-1',
      conversationIds: ['conversation-admin-1'],
    },
    chatbotOrchestrationState: {
      conversationSummary: 'Summary',
    },
  };
  beforeEach(() => {
    vi.clearAllMocks();
    bootstrapSession = vi.fn(async (session) => session);
    applyOnboardingResult = vi.fn();

    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        apiCode: 'en',
      },
      setLanguage: vi.fn(),
      getApiLocale: () => 'en',
      t: ((key: string) => key) as never,
      isLanguageLoading: false,
      detectionMethod: 'default',
    } as never);

    vi.mocked(usePatientAuth).mockReturnValue({
      bootstrapSession,
    } as never);

    vi.mocked(usePatientEntry).mockReturnValue({
      profileDraft: {
        name: 'Alice Zhang',
        email: 'alice@example.com',
        phone: '+86 13800000000',
        gender: 'female',
        country: 'China',
        department: 'Cardiology',
        departmentCode: 'cardiology',
        disease: 'Eye pain',
        destination: 'Shanghai',
        treatmentTime: 'ASAP',
      },
      patchProfileDraft: vi.fn(),
      applyOnboardingResult,
      setBootstrapError: vi.fn(),
    } as never);

    vi.mocked(patientEntryApi.initOnboarding).mockResolvedValue(onboardingBootstrap);
    vi.mocked(departmentApi.getDept).mockResolvedValue({
      data: [
        { id: 'dept-1', slug: 'cardiology', name: 'Cardiology', name_en: 'Cardiology' },
      ],
    } as never);
  });

  it('boots the formal onboarding flow without importing temporary history', async () => {
    vi.mocked(patientEntryApi.initOnboarding).mockResolvedValue({
      ...onboardingBootstrap,
      formalConversationState: {
        activeConversationId: null,
        conversationIds: [],
      },
    });

    render(<PatientProfileForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit details' }));

    await waitFor(() => {
      expect(patientEntryApi.initOnboarding).toHaveBeenCalledTimes(1);
    });

    expect(bootstrapSession).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: 'patient-1',
        caseId: 'case-1',
        nextStep: 'messages-ready',
        widgetChatTarget: {
          kind: 'CHATBOT_SESSION',
          sessionId: 'widget-session-1',
        },
        formalConversationState: {
          activeConversationId: null,
          conversationIds: [],
        },
      }),
    );

    expect(applyOnboardingResult).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: 'patient-1',
        caseId: 'case-1',
        nextStep: 'messages-ready',
        widgetChatTarget: {
          kind: 'CHATBOT_SESSION',
          sessionId: 'widget-session-1',
        },
        backendRestoreState: expect.objectContaining({
          activeConversationId: null,
          selectedHospitalId: 'hospital-1',
          selectedHospitalIds: ['hospital-1'],
        }),
      }),
    );
  });

  it('renders the richer destination multi-select control', () => {
    render(<PatientProfileForm />);

    const destinationControl = screen.getByRole('button', { name: 'Destination' });
    expect(destinationControl).toBeDefined();
    expect(destinationControl.textContent).toContain('Shanghai');
  });

  it('lets patients choose multiple destinations', () => {
    const patchProfileDraft = vi.fn();
    vi.mocked(usePatientEntry).mockReturnValue({
      profileDraft: {
        name: 'Alice Zhang',
        email: 'alice@example.com',
        phone: '+86 13800000000',
        gender: 'female',
        country: 'China',
        department: 'Cardiology',
        departmentCode: 'cardiology',
        disease: 'Eye pain',
        destination: 'Shanghai',
        treatmentTime: 'ASAP',
      },
      patchProfileDraft,
      applyOnboardingResult,
      setBootstrapError: vi.fn(),
    } as never);

    render(<PatientProfileForm />);

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Destination' }));
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Beijing' }));

    expect(patchProfileDraft).toHaveBeenCalledWith({ destination: 'Shanghai, Beijing' });
  });

  it('clears concrete destinations when no preference is selected', () => {
    const patchProfileDraft = vi.fn();
    vi.mocked(usePatientEntry).mockReturnValue({
      profileDraft: {
        name: 'Alice Zhang',
        email: 'alice@example.com',
        phone: '+86 13800000000',
        gender: 'female',
        country: 'China',
        department: 'Cardiology',
        departmentCode: 'cardiology',
        disease: 'Eye pain',
        destination: 'Shanghai, Beijing',
        treatmentTime: 'ASAP',
      },
      patchProfileDraft,
      applyOnboardingResult,
      setBootstrapError: vi.fn(),
    } as never);

    render(<PatientProfileForm />);

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Destination' }));
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'No preference' }));

    expect(patchProfileDraft).toHaveBeenCalledWith({ destination: 'No preference' });
  });

  it('removes no preference when a concrete destination is selected', () => {
    const patchProfileDraft = vi.fn();
    vi.mocked(usePatientEntry).mockReturnValue({
      profileDraft: {
        name: 'Alice Zhang',
        email: 'alice@example.com',
        phone: '+86 13800000000',
        gender: 'female',
        country: 'China',
        department: 'Cardiology',
        departmentCode: 'cardiology',
        disease: 'Eye pain',
        destination: 'No preference',
        treatmentTime: 'ASAP',
      },
      patchProfileDraft,
      applyOnboardingResult,
      setBootstrapError: vi.fn(),
    } as never);

    render(<PatientProfileForm />);

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Destination' }));
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Shanghai' }));

    expect(patchProfileDraft).toHaveBeenCalledWith({ destination: 'Shanghai' });
  });

  it('renders richer onboarding fields beyond the old five-field form', () => {
    render(<PatientProfileForm />);

    expect(screen.getByLabelText('Gender')).toBeDefined();
    expect(screen.getByLabelText('Country')).toBeDefined();
    expect(screen.getByLabelText('Department')).toBeDefined();
    expect(screen.getByLabelText('Disease')).toBeDefined();
    expect(screen.getByLabelText('Treatment timeline')).toBeDefined();
    expect(screen.queryByLabelText('Age')).toBeNull();
    expect(screen.queryByLabelText('WhatsApp')).toBeNull();
    expect(screen.queryByLabelText('Messenger')).toBeNull();
  });

  it('submits richer onboarding fields through initOnboarding', async () => {
    render(<PatientProfileForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit details' }));

    await waitFor(() => {
      expect(patientEntryApi.initOnboarding).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Alice Zhang',
        email: 'alice@example.com',
        phone: '+86 13800000000',
        gender: 'female',
        country: 'China',
        department: 'Cardiology',
        departmentCode: 'cardiology',
        disease: 'Eye pain',
        destination: 'Shanghai',
        treatmentTime: 'ASAP',
        preferredLanguage: 'en',
      }));
    });
  });

  it('uses the richer submit CTA copy', () => {
    render(<PatientProfileForm />);

    expect(screen.getByRole('button', { name: 'Submit details' })).toBeDefined();
  });

  it('falls back to manual department entry when department lookup fails', async () => {
    vi.mocked(departmentApi.getDept).mockRejectedValueOnce(new Error('temporary outage'));
    vi.mocked(usePatientEntry).mockReturnValue({
      profileDraft: {
        name: 'Alice Zhang',
        email: 'alice@example.com',
        phone: '+86 13800000000',
        gender: 'female',
        country: 'China',
        department: '',
        departmentCode: '',
        disease: 'Eye pain',
        destination: 'Shanghai',
        treatmentTime: 'ASAP',
      },
      patchProfileDraft: vi.fn(),
      applyOnboardingResult,
      setBootstrapError: vi.fn(),
    } as never);

    render(<PatientProfileForm />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your department')).toBeDefined();
    });

    expect(screen.getByText('Department list is temporarily unavailable. You can type it manually and continue.')).toBeDefined();
  });

  it('loads departments using the current language locale and keeps the localized department label', async () => {
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳',
        apiCode: 'zh',
      },
      setLanguage: vi.fn(),
      getApiLocale: () => 'zh',
      t: ((key: string) => key) as never,
      isLanguageLoading: false,
      detectionMethod: 'saved',
    } as never);
    vi.mocked(departmentApi.getDept).mockResolvedValueOnce({
      data: [
        { id: 'dept-1', slug: 'cardiology', name: '心内科', name_en: 'Cardiology' },
      ],
    } as never);
    vi.mocked(usePatientEntry).mockReturnValue({
      profileDraft: {
        name: 'Alice Zhang',
        email: 'alice@example.com',
        phone: '+86 13800000000',
        age: '32',
        gender: 'female',
        country: 'China',
        whatsapp: '+86 13800000000',
        messenger: 'alice-wechat',
        department: 'Cardiology',
        departmentCode: 'cardiology',
        disease: 'Eye pain',
        destination: 'Shanghai',
        treatmentTime: 'ASAP',
      },
      patchProfileDraft: vi.fn(),
      applyOnboardingResult,
      setBootstrapError: vi.fn(),
    } as never);

    render(<PatientProfileForm />);

    await waitFor(() => {
      expect(departmentApi.getDept).toHaveBeenCalledWith('zh');
    });

    expect(screen.getByRole('combobox', { name: '科室' }).textContent).toContain('心内科');
  });

  it('advances into select-hospitals from backend-owned target state without conversation discovery', async () => {
    vi.mocked(patientEntryApi.initOnboarding).mockResolvedValue({
      ...onboardingBootstrap,
      nextStep: 'select-hospitals',
    });

    render(<PatientProfileForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit details' }));

    await waitFor(() => {
      expect(patientEntryApi.initOnboarding).toHaveBeenCalledTimes(1);
    });

    expect(applyOnboardingResult).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: 'patient-1',
        caseId: 'case-1',
        nextStep: 'select-hospitals',
        widgetChatTarget: {
          kind: 'CHATBOT_SESSION',
          sessionId: 'widget-session-1',
        },
        backendRestoreState: expect.objectContaining({
          activeConversationId: 'conversation-admin-1',
          selectedHospitalId: 'hospital-1',
          selectedHospitalIds: ['hospital-1'],
        }),
      }),
    );
  });

  it('renders the onboarding shell in Chinese when the current locale is zh', async () => {
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳',
        apiCode: 'zh',
      },
      setLanguage: vi.fn(),
      getApiLocale: () => 'zh',
      t: ((key: string) => key) as never,
      isLanguageLoading: false,
      detectionMethod: 'saved',
    } as never);
    vi.mocked(departmentApi.getDept).mockResolvedValueOnce({
      data: [
        { id: 'dept-1', slug: 'cardiology', name: '心内科', name_en: 'Cardiology' },
      ],
    } as never);

    render(<PatientProfileForm />);

    await waitFor(() => {
      expect(screen.getByText('开始建立您的患者档案')).toBeDefined();
    });

    expect(screen.getByLabelText('姓名')).toBeDefined();
    expect(screen.getByLabelText('邮箱')).toBeDefined();
    expect(screen.getByLabelText('电话')).toBeDefined();
    expect(screen.getByLabelText('性别')).toBeDefined();
    expect(screen.getByLabelText('国家/地区')).toBeDefined();
    expect(screen.getByLabelText('科室')).toBeDefined();
    expect(screen.getByLabelText('疾病或症状')).toBeDefined();
    expect(screen.getByRole('button', { name: '意向城市' })).toBeDefined();
    expect(screen.getByLabelText('治疗时间')).toBeDefined();
    expect(screen.getByRole('button', { name: '提交资料' })).toBeDefined();
  });

  it('still advances into select-hospitals when formal conversation lookup fails', async () => {
    vi.mocked(patientEntryApi.initOnboarding).mockResolvedValue({
      ...onboardingBootstrap,
      nextStep: 'select-hospitals',
    });

    render(<PatientProfileForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit details' }));

    await waitFor(() => {
      expect(patientEntryApi.initOnboarding).toHaveBeenCalledTimes(1);
    });

    expect(bootstrapSession).toHaveBeenCalledWith(
      expect.objectContaining({
        ...onboardingBootstrap,
        nextStep: 'select-hospitals',
      }),
    );
    expect(applyOnboardingResult).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: 'patient-1',
        caseId: 'case-1',
        nextStep: 'select-hospitals',
      }),
    );
  });

  it('does not attempt frontend conversation discovery for select-hospitals when backend has not provisioned a target yet', async () => {
    vi.mocked(patientEntryApi.initOnboarding).mockResolvedValue({
      ...onboardingBootstrap,
      nextStep: 'select-hospitals',
      widgetChatTarget: null,
      formalConversationState: {
        activeConversationId: null,
        conversationIds: [],
      },
    });

    render(<PatientProfileForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit details' }));

    await waitFor(() => {
      expect(applyOnboardingResult).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: 'patient-1',
          caseId: 'case-1',
          nextStep: 'select-hospitals',
          widgetChatTarget: null,
          backendRestoreState: expect.objectContaining({
            activeConversationId: null,
            selectedHospitalId: 'hospital-1',
            selectedHospitalIds: ['hospital-1'],
          }),
        }),
      );
    });
  });
});

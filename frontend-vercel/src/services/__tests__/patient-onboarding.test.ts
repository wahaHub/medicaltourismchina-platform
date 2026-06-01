import { describe, expect, it, vi } from 'vitest';
import { buildConsultationOnboardingDraft, startPatientOnboarding } from '../patient-onboarding';
import { patientEntryApi } from '../api/patient-entry';

vi.mock('../api/patient-entry', () => ({
  patientEntryApi: {
    initOnboarding: vi.fn(),
  },
}));

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

describe('buildConsultationOnboardingDraft', () => {
  it('maps the homepage consultation modal fields into the shared patient onboarding draft', () => {
    const result = buildConsultationOnboardingDraft({
      preferredLanguage: 'fr',
      procedureName: 'Peking Union Medical College Hospital',
      formData: {
        name: 'Alice Zhang',
        phone: '+86 13800000000',
        email: 'alice@example.com',
        age: '32',
        gender: 'female',
        country: 'Singapore',
        whatsapp: '+65 8123 4567',
        messenger: '',
        procedure: 'Cardiology consultation',
        destination: 'Shanghai',
        treatmentTime: 'ASAP',
        message: 'Need a second opinion for recurrent palpitations.',
        password: '',
        confirmPassword: '',
      },
    });

    expect(result).toEqual({
      name: 'Alice Zhang',
      email: 'alice@example.com',
      phone: '+86 13800000000',
      age: '32',
      gender: 'female',
      country: 'Singapore',
      whatsapp: '+65 8123 4567',
      messenger: '',
      department: '',
      departmentCode: '',
      disease: 'Need a second opinion for recurrent palpitations.',
      destination: 'Shanghai',
      treatmentTime: 'ASAP',
      preferredLanguage: 'fr',
      consultationContext: [
        'Hospital: Peking Union Medical College Hospital',
        'Consultation topic: Cardiology consultation',
      ].join('\n'),
    });
  });

  it('falls back to consultation context when the patient note is blank', () => {
    const result = buildConsultationOnboardingDraft({
      preferredLanguage: 'zh',
      procedureName: '',
      formData: {
        name: 'Li Hua',
        phone: '+86 13900000000',
        email: 'lihua@example.com',
        age: '45',
        gender: 'male',
        country: 'China',
        whatsapp: '',
        messenger: 'lihua-wechat',
        procedure: 'Neurology consultation',
        destination: '',
        treatmentTime: 'Flexible',
        message: '   ',
        password: '',
        confirmPassword: '',
      },
    });

    expect(result.disease).toBe('Neurology consultation');
    expect(result.consultationContext).toBe('Consultation topic: Neurology consultation');
    expect(result.preferredLanguage).toBe('zh');
  });

  it('applies onboarding state immediately, then reapplies the verified bootstrap state later', async () => {
    const onboarding = {
      patientId: 'patient-1',
      caseId: 'case-1',
      nextStep: 'messages-ready' as const,
      restoreToken: 'restore-token-1',
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
      journeySnapshot: {
        currentStage: 'RECOMMENDATION' as const,
        currentPhase: 'active' as const,
      },
    };
    const bootstrapDeferred = createDeferred<{
      id: string;
      patientId: string;
      caseId: string;
      nextStep: 'messages-ready';
      selectedHospitalId: string;
      selectedHospitalIds: string[];
      widgetChatTarget: {
        kind: 'CHATBOT_SESSION';
        sessionId: string;
      };
      formalConversationState: {
        activeConversationId: string;
        conversationIds: string[];
      };
      journeySnapshot: {
        currentStage: 'RECOMMENDATION';
        currentPhase: 'post';
      };
    }>();
    const applyOnboardingResult = vi.fn(() => true);
    vi.mocked(patientEntryApi.initOnboarding).mockResolvedValueOnce(onboarding as never);

    const result = await startPatientOnboarding({
      draft: {
        name: 'Alice',
        email: 'alice@example.com',
        phone: '+86 13800000000',
        age: '32',
        gender: 'female',
        country: 'China',
        whatsapp: '',
        messenger: '',
        department: 'Cardiology',
        departmentCode: 'cardiology',
        disease: 'Eye pain',
        destination: 'Shanghai',
        treatmentTime: 'ASAP',
        preferredLanguage: 'en',
      },
      bootstrapSession: vi.fn(() => bootstrapDeferred.promise),
      applyOnboardingResult,
    });

    expect(result.onboarding).toEqual(onboarding);
    expect(applyOnboardingResult).toHaveBeenNthCalledWith(1, {
      patientId: 'patient-1',
      caseId: 'case-1',
      nextStep: 'messages-ready',
      widgetChatTarget: {
        kind: 'CHATBOT_SESSION',
        sessionId: 'widget-session-1',
      },
      journeySnapshot: {
        currentStage: 'RECOMMENDATION',
        currentPhase: 'active',
      },
      backendRestoreState: {
        activeConversationId: 'conversation-admin-1',
        selectedHospitalId: 'hospital-1',
        selectedHospitalIds: ['hospital-1'],
        customHospitalRequest: null,
      },
    });

    bootstrapDeferred.resolve({
      id: 'patient-1',
      patientId: 'patient-1',
      caseId: 'case-1',
      nextStep: 'messages-ready',
      selectedHospitalId: 'hospital-2',
      selectedHospitalIds: ['hospital-2'],
      widgetChatTarget: {
        kind: 'CHATBOT_SESSION',
        sessionId: 'widget-session-1',
      },
      formalConversationState: {
        activeConversationId: 'conversation-admin-2',
        conversationIds: ['conversation-admin-2'],
      },
      journeySnapshot: {
        currentStage: 'RECOMMENDATION',
        currentPhase: 'post',
      },
    });

    await expect(result.bootstrapPromise).resolves.toMatchObject({
      id: 'patient-1',
      formalConversationState: {
        activeConversationId: 'conversation-admin-2',
      },
    });
    expect(applyOnboardingResult).toHaveBeenNthCalledWith(2, {
      patientId: 'patient-1',
      caseId: 'case-1',
      nextStep: 'messages-ready',
      widgetChatTarget: {
        kind: 'CHATBOT_SESSION',
        sessionId: 'widget-session-1',
      },
      journeySnapshot: {
        currentStage: 'RECOMMENDATION',
        currentPhase: 'post',
      },
      backendRestoreState: {
        activeConversationId: 'conversation-admin-2',
        selectedHospitalId: 'hospital-2',
        selectedHospitalIds: ['hospital-2'],
        customHospitalRequest: null,
      },
    });
  });

  it('reports background bootstrap failures without suppressing the initial onboarding success', async () => {
    const onboarding = {
      patientId: 'patient-1',
      caseId: 'case-1',
      nextStep: 'select-hospitals' as const,
      restoreToken: 'restore-token-1',
      widgetChatTarget: {
        kind: 'CHATBOT_SESSION' as const,
        sessionId: 'widget-session-1',
      },
    };
    const bootstrapError = new Error('bootstrap failed');
    const applyOnboardingResult = vi.fn(() => true);
    const onBootstrapError = vi.fn();
    vi.mocked(patientEntryApi.initOnboarding).mockResolvedValueOnce(onboarding as never);

    const result = await startPatientOnboarding({
      draft: {
        name: 'Alice',
        email: 'alice@example.com',
        phone: '+86 13800000000',
        age: '32',
        gender: 'female',
        country: 'China',
        whatsapp: '',
        messenger: '',
        department: 'Cardiology',
        departmentCode: 'cardiology',
        disease: 'Eye pain',
        destination: 'Shanghai',
        treatmentTime: 'ASAP',
        preferredLanguage: 'en',
      },
      bootstrapSession: vi.fn(async () => {
        throw bootstrapError;
      }),
      applyOnboardingResult,
      onBootstrapError,
    });

    expect(applyOnboardingResult).toHaveBeenCalledTimes(1);
    expect(applyOnboardingResult).toHaveBeenCalledWith(expect.objectContaining({
      patientId: 'patient-1',
      caseId: 'case-1',
      nextStep: 'select-hospitals',
    }));
    await expect(result.bootstrapPromise).rejects.toThrow('bootstrap failed');
    expect(onBootstrapError).toHaveBeenCalledWith(bootstrapError);
  });
});

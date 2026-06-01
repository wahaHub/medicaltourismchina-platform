import { patientEntryApi, type PatientOnboardingDraft } from './api/patient-entry';
import type {
  PatientSessionBootstrap,
  PatientSessionProfile,
  PatientSessionWidgetChatTarget,
  PatientSessionJourneySnapshot,
} from './api/crmApiClient';

type ConsultationOnboardingFormData = {
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  country: string;
  whatsapp: string;
  messenger: string;
  procedure: string;
  destination: string;
  treatmentTime: string;
  message: string;
  password: string;
  confirmPassword: string;
};

type ApplyOnboardingResultInput = {
  patientId: string;
  caseId: string;
  nextStep: 'select-hospitals' | 'messages-ready';
  widgetChatTarget?: PatientSessionWidgetChatTarget | null;
  journeySnapshot?: PatientSessionJourneySnapshot | null;
  backendRestoreState?: {
    activeConversationId?: string | null;
    selectedHospitalId?: string | null;
    selectedHospitalIds?: string[];
    customHospitalRequest?: string | null;
  };
};

type CompletePatientOnboardingInput = {
  draft: PatientOnboardingDraft;
  bootstrapSession: (session: PatientSessionBootstrap) => Promise<PatientSessionProfile>;
  applyOnboardingResult: (input: ApplyOnboardingResultInput) => boolean;
};

type StartPatientOnboardingInput = CompletePatientOnboardingInput & {
  onBootstrapError?: (error: unknown) => void;
};

function trimOptionalText(value: string | undefined) {
  return value?.trim() ?? '';
}

function buildConsultationContext(input: {
  procedureName?: string;
  procedure: string;
}) {
  const lines = [
    trimOptionalText(input.procedureName) ? `Hospital: ${trimOptionalText(input.procedureName)}` : '',
    trimOptionalText(input.procedure) ? `Consultation topic: ${trimOptionalText(input.procedure)}` : '',
  ].filter(Boolean);

  return lines.join('\n');
}

export function buildConsultationOnboardingDraft(input: {
  preferredLanguage: string;
  procedureName?: string;
  formData: ConsultationOnboardingFormData;
}): PatientOnboardingDraft {
  const message = trimOptionalText(input.formData.message);
  const procedure = trimOptionalText(input.formData.procedure);
  const procedureName = trimOptionalText(input.procedureName);
  const consultationContext = buildConsultationContext({
    procedureName,
    procedure,
  });

  return {
    name: input.formData.name,
    email: input.formData.email,
    phone: input.formData.phone,
    age: input.formData.age,
    gender: input.formData.gender,
    country: input.formData.country,
    whatsapp: input.formData.whatsapp,
    messenger: input.formData.messenger,
    department: '',
    departmentCode: '',
    disease: message || procedure || procedureName,
    destination: input.formData.destination,
    treatmentTime: input.formData.treatmentTime,
    preferredLanguage: input.preferredLanguage,
    consultationContext,
  };
}

export function buildBackendRestoreState(input: PatientSessionProfile) {
  return {
    activeConversationId: input.formalConversationState?.activeConversationId ?? null,
    selectedHospitalId: input.selectedHospitalId ?? null,
    selectedHospitalIds: input.selectedHospitalIds,
    customHospitalRequest: input.customHospitalRequest ?? null,
  };
}

export async function completePatientOnboarding(input: CompletePatientOnboardingInput) {
  const onboarding = await patientEntryApi.initOnboarding(input.draft);
  const verifiedSession = await input.bootstrapSession(onboarding);

  input.applyOnboardingResult({
    patientId: verifiedSession.id ?? verifiedSession.patientId ?? onboarding.patientId,
    caseId: verifiedSession.caseId ?? onboarding.caseId,
    nextStep: verifiedSession.nextStep ?? onboarding.nextStep,
    widgetChatTarget: verifiedSession.widgetChatTarget ?? null,
    journeySnapshot: verifiedSession.journeySnapshot ?? null,
    backendRestoreState: buildBackendRestoreState(verifiedSession),
  });

  return {
    onboarding,
    verifiedSession,
  };
}

export async function startPatientOnboarding(input: StartPatientOnboardingInput) {
  const onboarding = await patientEntryApi.initOnboarding(input.draft);

  input.applyOnboardingResult({
    patientId: onboarding.patientId,
    caseId: onboarding.caseId,
    nextStep: onboarding.nextStep,
    widgetChatTarget: onboarding.widgetChatTarget ?? null,
    journeySnapshot: onboarding.journeySnapshot ?? null,
    backendRestoreState: buildBackendRestoreState(onboarding),
  });

  const bootstrapPromise = input.bootstrapSession(onboarding)
    .then((verifiedSession) => {
      input.applyOnboardingResult({
        patientId: verifiedSession.id ?? verifiedSession.patientId ?? onboarding.patientId,
        caseId: verifiedSession.caseId ?? onboarding.caseId,
        nextStep: verifiedSession.nextStep ?? onboarding.nextStep,
        widgetChatTarget: verifiedSession.widgetChatTarget ?? onboarding.widgetChatTarget ?? null,
        journeySnapshot: verifiedSession.journeySnapshot ?? onboarding.journeySnapshot ?? null,
        backendRestoreState: buildBackendRestoreState(verifiedSession),
      });

      return verifiedSession;
    })
    .catch((error) => {
      input.onBootstrapError?.(error);
      throw error;
    });

  return {
    onboarding,
    bootstrapPromise,
  };
}

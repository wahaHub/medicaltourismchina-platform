import { crmApiRequest } from './crmApiClient';
import type { PatientSessionBootstrap } from './crmApiClient';
import type {
  MatchedHospital,
  PatientProfileDraft,
  SelectHospitalsResult,
} from '@/types/patient-entry';
export type PatientOnboardingDraft = PatientProfileDraft & {
  preferredLanguage?: string;
  consultationContext?: string;
  procedureId?: string;
  category?: 'face' | 'body' | 'non-surgical';
  registerToken?: string;
  captchaToken?: string;
};

export type QuestionnaireTemplateQuestion = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date';
  required: boolean;
  options?: string[];
};

export type QuestionnaireTemplate = {
  caseId: string;
  templateId?: string;
  questions: QuestionnaireTemplateQuestion[];
};

export type PatientMedicalFormTemplateQuestion = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'textarea' | 'text_with_file' | 'multiselect_with_file';
  required: boolean;
  options?: string[];
};

export type PatientMedicalFormTemplate = {
  id: string;
  templateName: string;
  category: string;
  procedureTypes: string[];
  questions: unknown;
  translations: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type PatientMedicalFormTemplateResponse = {
  template: PatientMedicalFormTemplate;
  customization?: {
    customizedQuestions: unknown;
  } | null;
};

export async function initOnboarding(input: PatientOnboardingDraft): Promise<PatientSessionBootstrap> {
  return crmApiRequest('/onboarding/init', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function matchHospitals(input: {
  caseId: string;
  profile: PatientProfileDraft;
}): Promise<{
  hospitals: MatchedHospital[];
}> {
  return crmApiRequest('/match-hospitals', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function selectHospitals(input: {
  caseId: string;
  hospitalIds: string[];
  customHospitalRequest?: string;
}): Promise<SelectHospitalsResult> {
  return crmApiRequest('/select-hospitals', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getQuestionnaireTemplate(input: {
  caseId: string;
  templateId?: string;
}): Promise<QuestionnaireTemplate> {
  const templateIdQuery = input.templateId
    ? `?templateId=${encodeURIComponent(input.templateId)}`
    : '';

  const template = await crmApiRequest<QuestionnaireTemplate>(`/intake/${input.caseId}/template${templateIdQuery}`, {
    method: 'GET',
  });

  if (input.templateId && template.templateId && template.templateId !== input.templateId) {
    throw new Error(`Questionnaire template mismatch: expected ${input.templateId} but received ${template.templateId}`);
  }

  return input.templateId && !template.templateId
    ? { ...template, templateId: input.templateId }
    : template;
}

export async function fetchMedicalFormTemplate(disease: string): Promise<PatientMedicalFormTemplate> {
  const params = new URLSearchParams({ disease });
  const response = await crmApiRequest<{ template: PatientMedicalFormTemplate }>(
    `/qc-templates/by-disease?${params.toString()}`,
    {
      method: 'GET',
    },
  );

  return response.template;
}

function mergeCustomizedQuestions(
  template: PatientMedicalFormTemplate,
  customization: PatientMedicalFormTemplateResponse['customization'],
): PatientMedicalFormTemplate {
  if (!customization || customization.customizedQuestions === null || customization.customizedQuestions === undefined) {
    return template;
  }

  return {
    ...template,
    questions: customization.customizedQuestions,
  };
}

export async function fetchMedicalFormTemplateById(
  templateId: string,
  caseId: string,
): Promise<PatientMedicalFormTemplate> {
  const params = new URLSearchParams();
  params.set('caseId', caseId.trim());
  const response = await crmApiRequest<PatientMedicalFormTemplateResponse>(
    `/qc-templates/${encodeURIComponent(templateId)}?${params.toString()}`,
    {
      method: 'GET',
    },
  );

  return mergeCustomizedQuestions(response.template, response.customization);
}

export async function submitQuestionnaireResponse(input: {
  caseId: string;
  templateId: string;
  responses: Record<string, unknown>;
}): Promise<{ ok: true }> {
  return crmApiRequest(`/intake/${input.caseId}/response`, {
    method: 'POST',
    body: JSON.stringify({
      templateId: input.templateId,
      responses: input.responses,
    }),
  });
}

export async function submitMedicalFormResponse(input: {
  caseId: string;
  templateId: string;
  responses: Record<string, unknown>;
}): Promise<{ ok: true }> {
  await crmApiRequest<{ ok: true }>(`/intake/${input.caseId}/response`, {
    method: 'POST',
    body: JSON.stringify({
      templateId: input.templateId,
      responses: input.responses,
    }),
  });

  return { ok: true };
}

export async function getQuestionnaireResponse(input: {
  caseId: string;
}): Promise<{
  response: null | {
    id: string;
    caseId: string;
    templateId: string;
    responses: Record<string, unknown>;
    completionStatus: string;
    submittedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
}> {
  return crmApiRequest(`/intake/${input.caseId}/response`, {
    method: 'GET',
  });
}

export async function convertConsultation(input: {
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
}): Promise<{ ok: true }> {
  const sessionId = input.conversionDraft.sessionId.trim();

  if (!sessionId) {
    throw new Error('Cannot submit consultation request: no active session ID');
  }

  const payload = {
    requestedAction: input.requestedAction,
    sessionId,
    name: input.conversionDraft.name.trim(),
    email: input.conversionDraft.email.trim(),
    country: input.conversionDraft.country.trim(),
    conditionSummary: input.conversionDraft.conditionSummary.trim(),
    budget: input.conversionDraft.budget.trim(),
  };

  if (!payload.name || !payload.email || !payload.country || !payload.conditionSummary || !payload.budget) {
    throw new Error('Please complete the consultation details before requesting consultation.');
  }

  return crmApiRequest(input.convertPath, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export const patientEntryApi = {
  initOnboarding,
  matchHospitals,
  selectHospitals,
  getQuestionnaireTemplate,
  getQuestionnaireResponse,
  submitQuestionnaireResponse,
  fetchMedicalFormTemplate,
  fetchMedicalFormTemplateById,
  submitMedicalFormResponse,
  convertConsultation,
};

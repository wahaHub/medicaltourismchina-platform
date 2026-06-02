import { crmApiRequest } from './crmApiClient';
import { patientMessagesApi, type PatientMessageAttachment } from './patient-messages';

export type PatientDashboardCase = {
  id: string;
  caseNumber: string;
  patientName: string;
  patientCountry: string | null;
  patientLanguage: string;
  patientEmail: string | null;
  patientPhone: string | null;
  assignedHospitalId: string | null;
  hospitalName: string | null;
  primaryDiagnosis: string | null;
  status: string;
  stage: string;
  assignmentStatus: string;
  treatmentStage: string | null;
  riskLevel: string | null;
  aiSummary: string | null;
  assignedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PatientDashboardQuote = {
  id: string;
  caseId: string;
  hospitalId: string;
  hospitalName?: string;
  quoteNumber: string;
  version: number;
  status: string;
  isDraft: boolean;
  totalAmount: string;
  currency: string;
  validUntil: string;
  treatmentPlan: string | null;
  lineItems: unknown;
  notes: string | null;
  sentAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PatientCaseQuoteList = {
  data: PatientDashboardQuote[];
  total: number;
  page: number;
  limit: number;
};

export type PatientDashboardHomeSummary = {
  patientName: string;
  patientEmail: string | null;
  caseCount: number;
  activeCase: PatientDashboardCase | null;
  pendingQuoteCount: number;
  totalQuoteCount: number;
};

export type PatientDashboardQuoteGroup = {
  caseId: string;
  caseNumber: string;
  caseSummary: string | null;
  assignmentStatus: string;
  treatmentStage: string | null;
  quotes: PatientDashboardQuote[];
  pendingQuoteCount: number;
};

export type PatientCaseDocument = PatientMessageAttachment & {
  id: string;
  source: 'PATIENT_UPLOAD' | 'CARE_TEAM_REPLY';
  sessionId: string;
  sessionTitle: string;
  hospitalName: string | null;
  messageId: string;
  messageCreatedAt: string;
};

function appendLocale(path: string, locale?: string) {
  if (!locale) return path;
  const params = new URLSearchParams({ locale });
  return `${path}?${params.toString()}`;
}

async function listCases(locale?: string) {
  return crmApiRequest<PatientDashboardCase[]>(appendLocale('/cases', locale), {
    method: 'GET',
  });
}

async function getCaseQuotes(caseId: string, locale?: string) {
  return crmApiRequest<PatientCaseQuoteList>(appendLocale(`/cases/${caseId}/quote`, locale), {
    method: 'GET',
  });
}

export async function getPatientDashboardHomeSummary(preferredCaseId?: string | null, locale?: string): Promise<PatientDashboardHomeSummary> {
  const cases = await listCases(locale);

  if (cases.length === 0) {
    return {
      patientName: '',
      patientEmail: null,
      caseCount: 0,
      activeCase: null,
      pendingQuoteCount: 0,
      totalQuoteCount: 0,
    };
  }

  const quoteLists = await Promise.all(
    cases.map(async (caseItem) => ({
      caseId: caseItem.id,
      quotes: (await getCaseQuotes(caseItem.id, locale)).data,
    })),
  );

  const activeCase = (
    (preferredCaseId ? cases.find((caseItem) => caseItem.id === preferredCaseId) : null)
    ?? [...cases].sort((left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    )[0]
    ?? null
  );

  const totalQuoteCount = quoteLists.reduce((sum, item) => sum + item.quotes.length, 0);
  const pendingQuoteCount = quoteLists.reduce(
    (sum, item) => sum + item.quotes.filter((quote) => quote.status === 'PENDING' && !quote.isDraft).length,
    0,
  );

  return {
    patientName: activeCase?.patientName ?? '',
    patientEmail: activeCase?.patientEmail ?? null,
    caseCount: cases.length,
    activeCase,
    pendingQuoteCount,
    totalQuoteCount,
  };
}

export async function listPatientDashboardQuotes(locale?: string): Promise<PatientDashboardQuoteGroup[]> {
  const cases = await listCases(locale);

  const groupedQuotes = await Promise.all(
    cases.map(async (caseItem) => {
      const result = await getCaseQuotes(caseItem.id, locale);
      const quotes = [...result.data].sort((left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );

      return {
        caseId: caseItem.id,
        caseNumber: caseItem.caseNumber,
        caseSummary: caseItem.primaryDiagnosis || caseItem.aiSummary,
        assignmentStatus: caseItem.assignmentStatus,
        treatmentStage: caseItem.treatmentStage,
        quotes,
        pendingQuoteCount: quotes.filter((quote) => quote.status === 'PENDING' && !quote.isDraft).length,
      };
    }),
  );

  return groupedQuotes
    .filter((group) => group.quotes.length > 0)
    .sort((left, right) => {
      if (left.pendingQuoteCount !== right.pendingQuoteCount) {
        return right.pendingQuoteCount - left.pendingQuoteCount;
      }

      return right.quotes.length - left.quotes.length;
    });
}

export async function listPatientCaseDocuments(caseId: string, locale?: string): Promise<{
  uploadedDocuments: PatientCaseDocument[];
  hospitalReplyDocuments: PatientCaseDocument[];
}> {
  const { sessions } = await patientMessagesApi.listSessions({ caseId, locale });
  const details = await Promise.all(
    sessions.map((session) =>
      patientMessagesApi.getSessionMessages({ sessionId: session.sessionId, limit: 100, locale }),
    ),
  );

  const documents = details.flatMap((detail) =>
    detail.data.flatMap((message) => {
      const attachments = message.attachments ?? [];
      if (attachments.length === 0) return [];

      const source = String(message.senderRole).toUpperCase() === 'PATIENT'
        ? 'PATIENT_UPLOAD'
        : 'CARE_TEAM_REPLY';

      return attachments.map((attachment, index) => ({
        ...attachment,
        id: `${message.id}:${attachment.storageKey || attachment.fileName || index}`,
        source,
        sessionId: detail.sessionId,
        sessionTitle: detail.title ?? (detail.type === 'HOSPITAL' ? 'Hospital conversation' : 'Care team conversation'),
        hospitalName: detail.hospitalName,
        messageId: message.id,
        messageCreatedAt: message.createdAt,
      }));
    }),
  );

  documents.sort((left, right) =>
    new Date(right.messageCreatedAt).getTime() - new Date(left.messageCreatedAt).getTime(),
  );

  return {
    uploadedDocuments: documents.filter((document) => document.source === 'PATIENT_UPLOAD'),
    hospitalReplyDocuments: documents.filter((document) => document.source === 'CARE_TEAM_REPLY'),
  };
}

export async function acceptPatientDashboardQuote(input: {
  caseId: string;
  quoteId: string;
}): Promise<{ ok: true }> {
  return crmApiRequest(`/cases/${input.caseId}/quote/accept`, {
    method: 'POST',
    body: JSON.stringify({ quoteId: input.quoteId }),
  });
}

export async function rejectPatientDashboardQuote(input: {
  caseId: string;
  quoteId: string;
}): Promise<{ ok: true }> {
  return crmApiRequest(`/cases/${input.caseId}/quote/reject`, {
    method: 'POST',
    body: JSON.stringify({ quoteId: input.quoteId }),
  });
}

export const patientDashboardApi = {
  getPatientDashboardHomeSummary,
  listPatientDashboardQuotes,
  listPatientCaseDocuments,
  acceptPatientDashboardQuote,
  rejectPatientDashboardQuote,
};

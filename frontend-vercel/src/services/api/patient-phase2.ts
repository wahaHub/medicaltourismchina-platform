import { crmApiRequest } from './crmApiClient';
import type {
  CreatePatientOrderInput,
  CreatePatientTicketInput,
  PaginatedResult,
  PatientCaseSummary,
  PatientAiSummary,
  PatientJourney,
  PatientJourneyMilestone,
  PatientOrder,
  PatientPackage,
  PatientTicket,
  PatientTicketDetail,
  PatientTicketStatus,
  PatientTicketType,
  PaymentIntentResult,
  ReplyToPatientTicketInput,
} from '@/types/patient-phase2';

type TicketListParams = {
  page?: number;
  limit?: number;
  status?: PatientTicketStatus;
  type?: PatientTicketType;
  locale?: string;
};

type OrderListParams = {
  page?: number;
  limit?: number;
  locale?: string;
};

type PackageListParams = {
  page?: number;
  limit?: number;
  locale?: string;
};

function toQueryString(input: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();

  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      return;
    }

    params.set(key, String(value));
  });

  return params.toString();
}

export async function listPatientTickets(params: TicketListParams = {}) {
  const query = toQueryString(params);
  const suffix = query ? `?${query}` : '';
  return crmApiRequest<PaginatedResult<PatientTicket>>(`/tickets${suffix}`, {
    method: 'GET',
  });
}

function localeSuffix(locale?: string) {
  const query = toQueryString({ locale });
  return query ? `?${query}` : '';
}

export async function listPatientCases(locale?: string) {
  return crmApiRequest<PatientCaseSummary[]>(`/cases${localeSuffix(locale)}`, {
    method: 'GET',
  });
}

export async function getPatientTicket(ticketId: string, locale?: string) {
  return crmApiRequest<PatientTicketDetail>(`/tickets/${ticketId}${localeSuffix(locale)}`, {
    method: 'GET',
  });
}

export async function createPatientTicket(input: CreatePatientTicketInput) {
  return crmApiRequest<PatientTicket>('/tickets', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function replyToPatientTicket(input: ReplyToPatientTicketInput) {
  return crmApiRequest<PatientTicketDetail['replies'][number]>(`/tickets/${input.ticketId}/replies`, {
    method: 'POST',
    body: JSON.stringify({
      content: input.content,
    }),
  });
}

export async function listPatientOrders(params: OrderListParams = {}) {
  const query = toQueryString(params);
  const suffix = query ? `?${query}` : '';
  return crmApiRequest<PaginatedResult<PatientOrder>>(`/orders${suffix}`, {
    method: 'GET',
  });
}

export async function getPatientOrder(orderId: string, locale?: string) {
  return crmApiRequest<PatientOrder>(`/orders/${orderId}${localeSuffix(locale)}`, {
    method: 'GET',
  });
}

export async function createPatientOrder(input: CreatePatientOrderInput) {
  return crmApiRequest<PatientOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function createPatientPaymentIntent(orderId: string) {
  return crmApiRequest<PaymentIntentResult>(`/orders/${orderId}/payment-intents`, {
    method: 'POST',
  });
}

export async function listPatientPackages(params: PackageListParams = {}) {
  const query = toQueryString(params);
  const suffix = query ? `?${query}` : '';
  return crmApiRequest<PaginatedResult<PatientPackage>>(`/packages${suffix}`, {
    method: 'GET',
  });
}

export async function getPatientPackage(packageId: string, locale?: string) {
  return crmApiRequest<PatientPackage>(`/packages/${packageId}${localeSuffix(locale)}`, {
    method: 'GET',
  });
}

export async function getPatientJourney(caseId: string, locale?: string) {
  return crmApiRequest<PatientJourney>(`/cases/${caseId}/journey${localeSuffix(locale)}`, {
    method: 'GET',
  });
}

export async function listPatientMilestones(caseId: string, locale?: string) {
  return crmApiRequest<PatientJourneyMilestone[]>(`/cases/${caseId}/milestones${localeSuffix(locale)}`, {
    method: 'GET',
  });
}

export async function getPatientAiSummary(caseId: string, locale?: string) {
  return crmApiRequest<PatientAiSummary>(`/cases/${caseId}/ai-summary${localeSuffix(locale)}`, {
    method: 'GET',
  });
}

export const patientPhase2Api = {
  listPatientCases,
  listPatientTickets,
  getPatientTicket,
  createPatientTicket,
  replyToPatientTicket,
  listPatientOrders,
  getPatientOrder,
  createPatientOrder,
  createPatientPaymentIntent,
  listPatientPackages,
  getPatientPackage,
  getPatientJourney,
  listPatientMilestones,
  getPatientAiSummary,
};

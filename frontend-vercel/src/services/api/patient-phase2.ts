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
};

type OrderListParams = {
  page?: number;
  limit?: number;
};

type PackageListParams = {
  page?: number;
  limit?: number;
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

export async function listPatientCases() {
  return crmApiRequest<PatientCaseSummary[]>('/cases', {
    method: 'GET',
  });
}

export async function getPatientTicket(ticketId: string) {
  return crmApiRequest<PatientTicketDetail>(`/tickets/${ticketId}`, {
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

export async function getPatientOrder(orderId: string) {
  return crmApiRequest<PatientOrder>(`/orders/${orderId}`, {
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

export async function getPatientPackage(packageId: string) {
  return crmApiRequest<PatientPackage>(`/packages/${packageId}`, {
    method: 'GET',
  });
}

export async function getPatientJourney(caseId: string) {
  return crmApiRequest<PatientJourney>(`/cases/${caseId}/journey`, {
    method: 'GET',
  });
}

export async function listPatientMilestones(caseId: string) {
  return crmApiRequest<PatientJourneyMilestone[]>(`/cases/${caseId}/milestones`, {
    method: 'GET',
  });
}

export async function getPatientAiSummary(caseId: string) {
  return crmApiRequest<PatientAiSummary>(`/cases/${caseId}/ai-summary`, {
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

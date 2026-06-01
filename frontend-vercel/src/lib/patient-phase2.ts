import type {
  PatientJourneyMilestone,
  PatientTicketPriority,
  PatientTicketStatus,
  PatientTicketType,
} from '@/types/patient-phase2';

export function formatMoney(amount: string, currency: string) {
  const numeric = Number(amount);

  if (Number.isFinite(numeric)) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(numeric);
  }

  return `${amount} ${currency}`;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDateOnly(value: string | null | undefined) {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function ticketTypeLabel(type: PatientTicketType) {
  switch (type) {
    case 'GENERAL_SUPPORT':
      return 'General support';
    case 'MEDICAL_QUESTION':
      return 'Medical question';
    case 'QUOTE_PRICING':
      return 'Quote & pricing';
    case 'PACKAGE_ORDER':
      return 'Package & order';
    case 'PAYMENT_REFUND':
      return 'Payment & refund';
    case 'TRAVEL_JOURNEY':
      return 'Travel & journey';
    case 'ACCOUNT_TECHNICAL':
      return 'Account & technical';
  }
}

export function ticketStatusTone(status: PatientTicketStatus) {
  switch (status) {
    case 'OPEN':
      return 'bg-teal-100 text-teal-800';
    case 'ASSIGNED':
      return 'bg-cyan-100 text-cyan-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'PENDING_INFO':
      return 'bg-amber-100 text-amber-800';
    case 'RESOLVED':
      return 'bg-emerald-100 text-emerald-800';
    case 'CLOSED':
      return 'bg-slate-100 text-slate-700';
  }
}

export function ticketPriorityTone(priority: PatientTicketPriority) {
  switch (priority) {
    case 'HIGH':
      return 'bg-rose-100 text-rose-800';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-800';
    case 'LOW':
      return 'bg-slate-100 text-slate-700';
  }
}

export function orderStatusTone(status: string) {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'bg-amber-100 text-amber-800';
    case 'PAID':
      return 'bg-emerald-100 text-emerald-800';
    case 'IN_PROGRESS':
      return 'bg-cyan-100 text-cyan-800';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800';
    case 'REFUNDED':
      return 'bg-fuchsia-100 text-fuchsia-800';
    case 'CANCELLED':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function createOrderIdempotencyKey(packageId: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `pkg-${packageId}-${crypto.randomUUID()}`;
  }

  return `pkg-${packageId}-${Date.now()}`;
}

export function sortMilestones(milestones: PatientJourneyMilestone[]) {
  return [...milestones].sort((left, right) =>
    new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime(),
  );
}

export function renderStructuredValue(value: unknown) {
  if (value === null || value === undefined) {
    return 'Not set yet';
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'Not set yet';
    }

    return value.map((item) => renderStructuredValue(item)).join(' • ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

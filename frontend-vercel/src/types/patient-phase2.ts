export type PatientTicketType =
  | 'GENERAL_SUPPORT'
  | 'MEDICAL_QUESTION'
  | 'QUOTE_PRICING'
  | 'PACKAGE_ORDER'
  | 'PAYMENT_REFUND'
  | 'TRAVEL_JOURNEY'
  | 'ACCOUNT_TECHNICAL';

export type PatientTicketPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type PatientTicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING_INFO'
  | 'RESOLVED'
  | 'CLOSED';

export type PatientTicket = {
  id: string;
  ticketNumber: string;
  caseId: string | null;
  type: PatientTicketType;
  source: string;
  priority: PatientTicketPriority;
  status: PatientTicketStatus;
  subject: string | null;
  description: string;
  sourcePage: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PatientTicketReply = {
  id: string;
  ticketId: string;
  authorRole: string;
  content: string;
  attachments: unknown;
  createdAt: string;
};

export type PatientTicketDetail = {
  ticket: PatientTicket;
  replies: PatientTicketReply[];
};

export type PatientOrder = {
  id: string;
  orderNumber: string;
  caseId: string | null;
  packageId: string | null;
  type: string;
  amount: string;
  currency: string;
  status: string;
  paymentMethod: string | null;
  paidAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PatientCaseSummary = {
  id: string;
  caseNumber: string;
  primaryDiagnosis: string | null;
  aiSummary: string | null;
  assignmentStatus: string;
  treatmentStage: string | null;
  updatedAt: string;
};

export type PatientPackage = {
  id: string;
  nameEn: string;
  nameZh: string | null;
  type: string;
  price: string;
  currency: string;
  descriptionEn: string | null;
  descriptionZh: string | null;
  inclusions: unknown;
  coverImageUrl: string | null;
};

export type PatientJourney = {
  id: string;
  caseId: string;
  visa: unknown | null;
  insurance: unknown | null;
  accommodation: unknown | null;
  transportation: unknown | null;
  postCare: unknown | null;
  createdAt: string;
  updatedAt: string;
} | null;

export type PatientJourneyMilestone = {
  id: string;
  caseId: string;
  eventType: string;
  eventDate: string;
  note: string | null;
  isVisibleToPatient: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PatientAiSummary = {
  caseId: string;
  status: 'EMPTY' | 'PENDING' | 'READY' | 'FAILED';
  summary: string | null;
  language: string | null;
  updatedAt: string | null;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export type CreatePatientTicketInput = {
  caseId?: string;
  type: PatientTicketType;
  priority?: PatientTicketPriority;
  subject?: string;
  description: string;
  sourcePage?: string;
};

export type ReplyToPatientTicketInput = {
  ticketId: string;
  content: string;
};

export type CreatePatientOrderInput = {
  packageId: string;
  caseId?: string;
  idempotencyKey?: string;
};

export type PaymentIntentResult = {
  clientSecret: string;
  orderId: string;
};

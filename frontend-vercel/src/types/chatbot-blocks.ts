// 4 MVP block types only

export interface ProcessModalTriggerBlock {
  id: string;
  type: 'PROCESS_MODAL_TRIGGER';
  modalKey: 'MEDICAL_TRAVEL_PROCESS';
  title: string;
  description?: string;
  ctaLabel?: string;
}

export interface QuestionnaireModalTriggerBlock {
  id: string;
  type: 'QUESTIONNAIRE_MODAL_TRIGGER';
  templateId: string;
  title: string;
  description?: string;
  ctaLabel?: string;
}

export interface HospitalRecommendationItem {
  hospitalId: string;
  name?: string;
  reason?: string;
  summary?: string;
  ctaUrl?: string;
  thumbnailUrl?: string;
  thumbnailFallbackUrls?: string[];
  slug?: string;
  city?: string;
  matchType?: string;
  reasonCodes?: string[];
}

export interface HospitalRecommendationCardsBlock {
  id: string;
  type: 'HOSPITAL_RECOMMENDATION_CARDS';
  title: string;
  description?: string;
  caseId: string;
  selectPath: '/select-hospitals';
  hospitals: HospitalRecommendationItem[];
}

export interface OnlineConsultBookingCardBlock {
  id: string;
  type: 'ONLINE_CONSULT_BOOKING_CARD';
  title: string;
  description?: string;
  requestedAction: 'INVITE_ONLINE_CONSULT';
  convertPath: string;
  consultationStatus?: string;
  requestState?: 'idle' | 'submitted' | 'failed';
  conversionDraft: {
    sessionId: string;
    name: string;
    email: string;
    country: string;
    conditionSummary: string;
    budget: string;
  };
}

export interface SupportingDocumentUploadPromptBlock {
  id: string;
  type: 'SUPPORTING_DOCUMENT_UPLOAD_PROMPT';
  title: string;
  description?: string;
  uploadedCount?: number;
  required?: boolean;
}

export interface HandoffStatusCardBlock {
  id: string;
  type: 'HANDOFF_STATUS_CARD';
  title: string;
  description?: string;
  ticketId?: string;
  statusLabel?: string;
}

export interface OnlineConsultStatusCardBlock {
  id: string;
  type: 'ONLINE_CONSULT_STATUS_CARD';
  title: string;
  description?: string;
  statusLabel?: string;
  helperText?: string;
}

// Unknown block passthrough — frontend ignores unknown types
export interface UnknownBlock {
  id?: string;
  type: string;
  [key: string]: unknown;
}

export type ChatbotMessageBlock =
  | ProcessModalTriggerBlock
  | QuestionnaireModalTriggerBlock
  | HospitalRecommendationCardsBlock
  | OnlineConsultBookingCardBlock
  | SupportingDocumentUploadPromptBlock
  | HandoffStatusCardBlock
  | OnlineConsultStatusCardBlock
  | UnknownBlock;

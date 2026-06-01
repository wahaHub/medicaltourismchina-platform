import type { PatientMessageAttachment } from './patient-messages';
import { crmApiRequest } from './crmApiClient';

export type PatientChatbotHospitalType = 'COSMETIC' | 'REGULAR';

export type PatientChatbotHistoryJourneyStage =
  | 'EXPLAIN_PROCESS'
  | 'COLLECT_MEDICAL_INPUTS'
  | 'RECOMMENDATION'
  | 'ONLINE_CONSULT'
  | 'HUMAN_HANDOFF';

export type PatientChatbotHistoryJourneyPhase = 'active' | 'pre' | 'post';
export type PatientChatbotHistoryResourceStatus = 'available' | 'submitted' | 'failed';
export type PatientChatbotHistoryResourceType =
  | 'PROCESS_GUIDE'
  | 'MEDICAL_DOC_UPLOAD'
  | 'QUESTIONNAIRE'
  | 'HOSPITAL_RECOMMENDATION'
  | 'PACKAGE_RECOMMENDATION'
  | 'ONLINE_CONSULT_BOOKING'
  | 'HUMAN_HANDOFF'
  | 'MEDICAL_INVITATION_STATUS';

export type PatientChatbotHistoryJourneySnapshot = {
  currentStage: PatientChatbotHistoryJourneyStage;
  currentPhase: PatientChatbotHistoryJourneyPhase;
};

export type PatientChatbotHistoryResourceDescriptor = {
  resourceType: PatientChatbotHistoryResourceType;
  resourceId: string;
  status: PatientChatbotHistoryResourceStatus;
  stageBinding?: {
    stage: PatientChatbotHistoryJourneyStage;
    phase?: PatientChatbotHistoryJourneyPhase;
  };
  visibility: {
    mode: 'journey' | 'global';
    allowedStages?: PatientChatbotHistoryJourneyStage[];
  };
  payload: Record<string, unknown>;
  actions: string[];
};

export type PatientChatbotMessageMetadata = Record<string, unknown> & {
  journeySnapshot?: PatientChatbotHistoryJourneySnapshot;
  resources?: PatientChatbotHistoryResourceDescriptor[];
};

export type PatientChatbotHistoryResponse = {
  session: {
    sessionId: string;
    hospitalType: PatientChatbotHospitalType;
    status: 'ACTIVE' | 'ESCALATED' | 'CLOSED';
    patientId: string | null;
    createdAt: string;
    updatedAt: string;
  };
  messages: Array<{
    id: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    citations: Array<Record<string, unknown>>;
    metadata: PatientChatbotMessageMetadata;
    attachments?: PatientMessageAttachment[];
    createdAt: string;
    journeySnapshot?: PatientChatbotHistoryJourneySnapshot;
    resources?: PatientChatbotHistoryResourceDescriptor[];
  }>;
};

export async function getHistory(input: {
  sessionId: string;
  limit?: number;
}): Promise<PatientChatbotHistoryResponse> {
  const searchParams = new URLSearchParams();
  if (typeof input.limit === 'number') {
    searchParams.set('limit', String(input.limit));
  }
  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : '';

  return crmApiRequest(`/api/v2/chatbot/history/${input.sessionId}${suffix}`, {
    method: 'GET',
  });
}

export const patientChatbotApi = {
  getHistory,
};

import { crmApiRequest } from './crmApiClient';

const CHATBOT_REQUEST_TIMEOUT_MS = 10_000;

export type PatientChatbotV3Attachment = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
};

export type PatientChatbotV3PageContext =
  | {
      type: 'HOSPITAL_DETAIL';
      hospitalId: string;
    };

export type PatientChatbotV3Action =
  | {
      type: 'TRIAGE_SUBMITTED';
    }
  | {
      type: 'TRIAGE_SKIPPED';
    }
  | {
      type: 'RECOMMENDATION_SELECTED';
      hospitalId: string;
    }
  | {
      type: 'RECOMMENDATION_SKIPPED';
    };

export type PatientChatbotV3SendRequest = {
  sessionId: string;
  locale?: string;
  message?: string;
  action?: PatientChatbotV3Action;
  attachments?: PatientChatbotV3Attachment[];
  pageContext?: PatientChatbotV3PageContext;
};

export type PatientChatbotV3Message = {
  role: 'assistant';
  text: string;
};

export type PatientChatbotV3TurnOutcome = {
  status: 'ok' | 'degraded';
  recoverableErrorCode: 'TIMEOUT' | 'UPSTREAM_UNAVAILABLE' | 'UNKNOWN' | null;
};

export type PatientChatbotV3Journey = {
  stage: 'EXPLAIN_PROCESS' | 'COLLECT_MINIMAL_MEDICAL_FACTS' | 'COLLECT_MEDICAL_INPUTS' | 'RECOMMENDATION' | 'ONLINE_CONSULT' | 'HUMAN_HANDOFF';
  phase: 'pre' | 'active' | 'post';
};

export type PatientChatbotV3Handoff = {
  required: boolean;
  ticketId: string | null;
};

type PatientChatbotV3OpenModalAction = {
  actionType: 'OPEN_MODAL';
  label: string;
  params: {
    modalKey: 'MEDICAL_TRAVEL_PROCESS';
  };
};

type PatientChatbotV3UploadRecordsAction =
  | {
      actionType: 'SUBMIT';
      label: string;
      params: {
        actionKey: 'UPLOAD_RECORDS';
      };
    }
  | {
      actionType: 'REFRESH_STATUS';
      label: string;
      params: {
        actionKey: 'UPLOAD_RECORDS';
      };
    };

type PatientChatbotV3RecommendationAction =
  | {
      actionType: 'SUBMIT';
      label: string;
      params: {
        hospitalId: string;
      };
    }
  | {
      actionType: 'SUBMIT';
      label: string;
      params: {
        actionKey: 'RECOMMENDATION_SKIPPED';
      };
    };

type PatientChatbotV3ConsultBookingAction =
  | {
      actionType: 'SUBMIT';
      label: string;
      params: {
        actionKey: 'CONSULT_BOOKING';
      };
    }
  | {
      actionType: 'REFRESH_STATUS';
      label: string;
      params: {
        actionKey: 'CONSULT_BOOKING';
      };
    };

type PatientChatbotV3OpenUrlAction = {
  actionType: 'OPEN_URL';
  label: string;
  params: {
    actionKey: 'HANDOFF_PORTAL';
  };
};

export type PatientChatbotV3Card =
  | {
      cardId: string;
      cardType: 'PROCESS_GUIDE';
      payload: {
        guideId: string;
        title: string;
      };
      actions: PatientChatbotV3OpenModalAction[];
    }
  | {
      cardId: string;
      cardType: 'UPLOAD_RECORDS';
      payload: {
        required: boolean;
        uploadedCount: number;
      };
      actions: PatientChatbotV3UploadRecordsAction[];
    }
  | {
      cardId: string;
      cardType: 'RECOMMENDATION_LIST';
      payload: {
        candidates: Array<{
          hospitalId: string;
          name: string;
          reason?: string;
        }>;
      };
      actions: PatientChatbotV3RecommendationAction[];
    }
  | {
      cardId: string;
      cardType: 'CONSULT_BOOKING';
      payload: {
        status: 'idle' | 'scheduled' | 'failed';
      };
      actions: PatientChatbotV3ConsultBookingAction[];
    }
  | {
      cardId: string;
      cardType: 'HANDOFF_STATUS';
      payload: {
        required: boolean;
        ticketId?: string;
      };
      actions: PatientChatbotV3OpenUrlAction[];
    };

export type PatientChatbotV3ChatResponse = {
  messages: PatientChatbotV3Message[];
  turnOutcome: PatientChatbotV3TurnOutcome;
  cards: PatientChatbotV3Card[];
  journey: PatientChatbotV3Journey;
  handoff: PatientChatbotV3Handoff;
  runtimeDebug?: {
    traceId: string;
    idempotencyKey: string;
    lastDispatchSource?: 'journey-runtime-authority';
    replayLineage?: {
      matchedRuleId?: string;
      supervisorReadDomainRequests?: Array<Array<'records.status' | 'recommendation.status' | 'consult.status' | 'handoff.status'>>;
      supervisorReadDomainsResolved?: Array<'records.status' | 'recommendation.status' | 'consult.status' | 'handoff.status'>;
      bootstrapOverride?: 'direct_human_request_handoff' | 'direct_human_request_faq_fallback' | 'attachments_to_minimal_triage';
    };
  };
};

export type PatientChatbotV3UploadInitResponse = {
  upload: {
    uploadUrl: string;
    storageKey: string;
    expiresIn: number;
  };
  asset: PatientChatbotV3Attachment;
};

export async function sendMessage(input: PatientChatbotV3SendRequest): Promise<PatientChatbotV3ChatResponse> {
  return crmApiRequest('/api/v3/chatbot/chat', {
    method: 'POST',
    timeoutMs: CHATBOT_REQUEST_TIMEOUT_MS,
    body: JSON.stringify({
      sessionId: input.sessionId,
      ...(input.locale ? { locale: input.locale } : {}),
      ...(typeof input.message === 'string' ? { message: input.message } : {}),
      ...(input.action ? { action: input.action } : {}),
      ...(input.attachments ? { attachments: input.attachments } : {}),
      ...(input.pageContext ? { pageContext: input.pageContext } : {}),
    }),
  });
}

export async function initAttachmentUpload(input: {
  sessionId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}): Promise<PatientChatbotV3UploadInitResponse> {
  return crmApiRequest('/api/v3/chatbot/uploads/init', {
    method: 'POST',
    timeoutMs: CHATBOT_REQUEST_TIMEOUT_MS,
    body: JSON.stringify({
      sessionId: input.sessionId,
      fileName: input.fileName,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
    }),
  });
}

export const patientChatbotV3Api = {
  initAttachmentUpload,
  sendMessage,
};

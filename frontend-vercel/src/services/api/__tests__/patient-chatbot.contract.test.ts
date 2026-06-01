import { describe, expect, it } from 'vitest';
import type { PatientConversationAssistantMode, PatientSessionProfile } from '../crmApiClient';
import { patientChatbotApi } from '../patient-chatbot';
import type {
  PatientConversationMessage,
  PatientConversationMessageList,
  PatientConversationRecord,
} from '../patient-messages';
import type { PatientChatbotHistoryResponse } from '../patient-chatbot';
import type {
  PatientChatbotV3Action,
  PatientChatbotV3Attachment,
  PatientChatbotV3Card,
  PatientChatbotV3ChatResponse,
  PatientChatbotV3PageContext,
  PatientChatbotV3SendRequest,
  PatientChatbotV3UploadInitResponse,
} from '../patient-chatbot-v3';

type ExpectAssignable<T extends U, U> = true;

type _PatientProfileAssistantMode = ExpectAssignable<
  NonNullable<PatientSessionProfile['formalConversationState']>['activeAssistantMode'],
  PatientConversationAssistantMode | null
>;
type _ConversationRecordAssistantMode = ExpectAssignable<
  PatientConversationRecord['assistantMode'],
  PatientConversationAssistantMode
>;
type _ConversationMessagesAssistantMode = ExpectAssignable<
  PatientConversationMessageList['assistantMode'],
  PatientConversationAssistantMode
>;

const aiActive: PatientConversationAssistantMode = 'AI_ACTIVE';
const humanTakeover: PatientConversationAssistantMode = 'HUMAN_TAKEOVER';
void aiActive;
void humanTakeover;

// @ts-expect-error assistantMode must stay on the shared frontend union
const invalidAssistantMode: PatientConversationAssistantMode = 'BOT_ONLY';
void invalidAssistantMode;

// @ts-expect-error history messages must not expose public nextAction
type _RemovedHistoryNextAction = PatientChatbotHistoryResponse['messages'][number]['nextAction'];
// @ts-expect-error history messages must not expose public blocks
type _RemovedHistoryBlocks = PatientChatbotHistoryResponse['messages'][number]['blocks'];
// @ts-expect-error legacy chatbot bridge must no longer expose sendMessage
patientChatbotApi.sendMessage;
// @ts-expect-error legacy chatbot bridge must no longer expose initAttachmentUpload
patientChatbotApi.initAttachmentUpload;

const v3Attachment: PatientChatbotV3Attachment = {
  fileName: 'report.pdf',
  fileSize: 1024,
  mimeType: 'application/pdf',
  storageKey: 'crm/dev/chatbot/report.pdf',
};
void v3Attachment;

const v3PageContext: PatientChatbotV3PageContext = {
  type: 'HOSPITAL_DETAIL',
  hospitalId: 'hospital-123',
};
void v3PageContext;

const v3SendRequest: PatientChatbotV3SendRequest = {
  sessionId: 'widget-session-1',
  message: 'Please review this document',
};
void v3SendRequest;

const v3Action: PatientChatbotV3Action = {
  type: 'RECOMMENDATION_SELECTED',
  hospitalId: 'hospital-123',
};
void v3Action;

const processGuideCard: Extract<PatientChatbotV3Card, { cardType: 'PROCESS_GUIDE' }> = {
  cardId: 'card-process-1',
  cardType: 'PROCESS_GUIDE',
  payload: {
    guideId: 'guide-1',
    title: 'How the process works',
  },
  actions: [{
    actionType: 'OPEN_MODAL',
    label: 'See the steps',
    params: {
      modalKey: 'MEDICAL_TRAVEL_PROCESS',
    },
  }],
};
void processGuideCard;

const v3ChatResponse: PatientChatbotV3ChatResponse = {
  messages: [{
    role: 'assistant',
    text: 'I can walk you through the next steps.',
  }],
  turnOutcome: {
    status: 'ok',
    recoverableErrorCode: null,
  },
  cards: [processGuideCard],
  journey: {
    stage: 'EXPLAIN_PROCESS',
    phase: 'active',
  },
  handoff: {
    required: false,
    ticketId: null,
  },
  runtimeDebug: {
    traceId: 'trace-1',
    idempotencyKey: 'idempotency-1',
    lastDispatchSource: 'journey-runtime-authority',
  },
};
void v3ChatResponse;

const v3UploadInitResponse: PatientChatbotV3UploadInitResponse = {
  upload: {
    uploadUrl: 'https://upload.example.com/chatbot/file-1',
    storageKey: 'crm/dev/chatbot/report.pdf',
    expiresIn: 300,
  },
  asset: v3Attachment,
};
void v3UploadInitResponse;

// @ts-expect-error v3 chat response must not expose legacy top-level answer
type _RemovedV3Answer = PatientChatbotV3ChatResponse['answer'];
// @ts-expect-error v3 chat response must not expose legacy intent
type _RemovedV3Intent = PatientChatbotV3ChatResponse['intent'];
// @ts-expect-error v3 chat response must not expose legacy topic
type _RemovedV3Topic = PatientChatbotV3ChatResponse['topic'];
// @ts-expect-error v3 chat response must not expose legacy resources
type _RemovedV3Resources = PatientChatbotV3ChatResponse['resources'];
// @ts-expect-error v3 chat response must not expose legacy journeySnapshot
type _RemovedV3JourneySnapshot = PatientChatbotV3ChatResponse['journeySnapshot'];

const mirroredFormalMessage: PatientConversationMessage = {
  id: 'message-system-1',
  conversationId: 'conversation-1',
  senderId: null,
  senderRole: 'SYSTEM',
  senderName: 'Medora Assistant',
  content: 'AI resumed this conversation.',
  originalLanguage: null,
  translatedContent: null,
  messageType: 'SYSTEM',
  moderationStatus: 'APPROVED',
  attachments: [],
  aiSummary: null,
  createdAt: '2026-04-18T00:00:00.000Z',
};
void mirroredFormalMessage;

describe('patient assistant-mode contract', () => {
  it('keeps the shared assistantMode union exposed only on formal conversation APIs', () => {
    expect(true).toBe(true);
  });
});

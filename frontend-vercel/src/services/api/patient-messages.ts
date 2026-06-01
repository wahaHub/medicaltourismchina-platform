import { crmApiRequest } from './crmApiClient';
import type { ChatbotMessageBlock } from '../../types/chatbot-blocks';
import type { PatientConversationAssistantMode } from './crmApiClient';

type PatientSessionSummaryResponse = {
  sessions: Array<{
    sessionId: string;
    caseId: string | null;
    type: 'CARE_TEAM' | 'HOSPITAL';
    title: string;
    hospitalId: string | null;
    hospitalName: string | null;
    isAiAvailable: boolean;
    unreadCount: number;
    lastMessagePreview: string | null;
    lastMessageAt: string | null;
    updatedAt: string;
  }>;
  meta: {
    caseId: string | null;
    chatAuthority: PatientConversationAssistantMode | null;
  };
};

export type PatientSessionType = 'CARE_TEAM' | 'HOSPITAL';

export type PatientSessionListMeta = PatientSessionSummaryResponse['meta'];

export type PatientSessionSummary = PatientSessionSummaryResponse['sessions'][number];

export type PatientMessageAttachment = {
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  name: string;
  type: string;
  size: number;
  url: string;
};

export type PatientConversationRecord = {
  id: string;
  sessionId: string;
  caseId: string | null;
  category: 'ADMIN_PATIENT' | 'HOSPITAL_PATIENT' | string;
  title: string | null;
  hospitalId: string | null;
  hospitalName?: string | null;
  assistantMode: PatientConversationAssistantMode;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastSenderId: string | null;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  isAiAvailable?: boolean;
};

export type PatientConversationMessage = {
  id: string;
  sessionId: string;
  conversationId: string | null;
  source?: 'FORMAL' | 'CHATBOT';
  senderId: string | null;
  senderRole: string | null;
  senderName: string | null;
  content: string;
  originalLanguage: string | null;
  translatedContent: string | null;
  messageType: string;
  moderationStatus: string;
  attachments: PatientMessageAttachment[];
  aiSummary: string | null;
  blocks?: ChatbotMessageBlock[];
  metadata?: Record<string, unknown>;
  citations?: Array<Record<string, unknown>>;
  createdAt: string;
};

export type PatientConversationMessageList = {
  sessionId?: string;
  assistantMode: PatientConversationAssistantMode;
  data: PatientConversationMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  title?: string;
  type?: 'CARE_TEAM' | 'HOSPITAL';
};

type PatientSessionDetailResponse = {
  sessionId: string;
  caseId: string | null;
  type: PatientSessionType;
  title: string;
  hospitalId: string | null;
  hospitalName: string | null;
  isAiAvailable: boolean;
  chatAuthority: PatientConversationAssistantMode | null;
  data: PatientConversationMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
};

export type PatientSessionMessage = PatientSessionDetailResponse['data'][number];
export type PatientSessionDetail = PatientSessionDetailResponse;

function toLegacyConversationRecord(
  summary: PatientSessionSummaryResponse['sessions'][number],
  meta: PatientSessionSummaryResponse['meta'],
): PatientConversationRecord {
  const category = summary.type === 'CARE_TEAM' ? 'ADMIN_PATIENT' : 'HOSPITAL_PATIENT';
  const assistantMode = summary.type === 'CARE_TEAM'
    ? (meta.chatAuthority ?? (summary.isAiAvailable ? 'AI_ACTIVE' : 'HUMAN_TAKEOVER'))
    : 'HUMAN_TAKEOVER';

  return {
    id: summary.sessionId,
    sessionId: summary.sessionId,
    caseId: summary.caseId,
    category,
    title: summary.title,
    hospitalId: summary.hospitalId,
    hospitalName: summary.hospitalName,
    assistantMode,
    lastMessageAt: summary.lastMessageAt,
    lastMessagePreview: summary.lastMessagePreview,
    lastSenderId: null,
    createdAt: summary.updatedAt,
    updatedAt: summary.updatedAt,
    unreadCount: summary.unreadCount,
    isAiAvailable: summary.isAiAvailable,
  };
}

function toLegacyMessageList(
  response: PatientSessionDetailResponse,
): PatientConversationMessageList {
  const formalMessages = response.data.filter((message) => message.source !== 'CHATBOT');
  const fallbackAssistantMode = response.type === 'CARE_TEAM' && response.isAiAvailable
    ? 'AI_ACTIVE'
    : 'HUMAN_TAKEOVER';
  const assistantMode = response.type === 'CARE_TEAM'
    ? (response.chatAuthority ?? fallbackAssistantMode)
    : 'HUMAN_TAKEOVER';

  return {
    sessionId: response.sessionId,
    assistantMode,
    data: formalMessages,
    total: formalMessages.length,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
    hasMore: response.hasMore,
    title: response.title,
    type: response.type,
  };
}

export async function listConversations(input?: { caseId?: string | null }): Promise<PatientConversationRecord[]> {
  const response = await listSessions(input);
  return response.sessions.map((session) => toLegacyConversationRecord(session, response.meta));
}

export async function listSessions(input?: { caseId?: string | null }): Promise<{
  sessions: PatientSessionSummary[];
  meta: PatientSessionListMeta;
}> {
  const searchParams = new URLSearchParams();
  if (input?.caseId) {
    searchParams.set('caseId', input.caseId);
  }
  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : '';
  return crmApiRequest<PatientSessionSummaryResponse>(`/conversations${suffix}`, {
    method: 'GET',
  });
}

export async function getConversationMessages(input: {
  conversationId: string;
  limit?: number;
}): Promise<PatientConversationMessageList> {
  const response = await getSessionMessages({
    sessionId: input.conversationId,
    limit: input.limit,
  });
  return toLegacyMessageList(response);
}

export async function getSessionMessages(input: {
  sessionId: string;
  limit?: number;
}): Promise<PatientSessionDetail> {
  const searchParams = new URLSearchParams();
  if (typeof input.limit === 'number') {
    searchParams.set('limit', String(input.limit));
  }
  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : '';

  return crmApiRequest<PatientSessionDetailResponse>(`/sessions/${input.sessionId}/messages${suffix}`, {
    method: 'GET',
  });
}

export async function sendConversationMessage(input: {
  conversationId: string;
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE';
  attachments?: Array<{
    fileName: string;
    mimeType: string;
    fileSize: number;
    storageKey: string;
  }>;
}): Promise<PatientConversationMessage> {
  return sendSessionMessage({
    sessionId: input.conversationId,
    content: input.content,
    messageType: input.messageType,
    attachments: input.attachments,
  });
}

export async function sendSessionMessage(input: {
  sessionId: string;
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE';
  attachments?: Array<{
    fileName: string;
    mimeType: string;
    fileSize: number;
    storageKey: string;
  }>;
}): Promise<PatientConversationMessage> {
  return crmApiRequest(`/sessions/${input.sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      content: input.content,
      messageType: input.messageType,
      attachments: input.attachments,
    }),
  });
}

export async function confirmProcessGuide(input: {
  sessionId: string;
}): Promise<{
  ok: boolean;
  status: 'confirmed';
}> {
  return crmApiRequest(`/sessions/${input.sessionId}/process-confirmation`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function initConversationAttachmentUpload(input: {
  conversationId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}): Promise<{
  upload: {
    uploadUrl: string;
    storageKey: string;
    expiresIn: number;
  };
  asset: {
    fileName: string;
    mimeType: string;
    fileSize: number;
    storageKey: string;
  };
}> {
  return initSessionAttachmentUpload({
    sessionId: input.conversationId,
    fileName: input.fileName,
    fileSize: input.fileSize,
    mimeType: input.mimeType,
  });
}

export async function initSessionAttachmentUpload(input: {
  sessionId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}): Promise<{
  upload: {
    uploadUrl: string;
    storageKey: string;
    expiresIn: number;
  };
  asset: {
    fileName: string;
    mimeType: string;
    fileSize: number;
    storageKey: string;
  };
}> {
  return crmApiRequest(`/sessions/${input.sessionId}/attachments/upload`, {
    method: 'POST',
    body: JSON.stringify({
      fileName: input.fileName,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
    }),
  });
}

export const patientMessagesApi = {
  listConversations,
  listSessions,
  getConversationMessages,
  getSessionMessages,
  sendConversationMessage,
  sendSessionMessage,
  confirmProcessGuide,
  initConversationAttachmentUpload,
  initSessionAttachmentUpload,
};

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, BotMessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConversationList from '@/components/messaging/ConversationList';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import {
  type PatientChatbotHistoryJourneySnapshot,
  type PatientChatbotHistoryResourceDescriptor,
  type PatientChatbotMessageMetadata,
} from '@/services/api/patient-chatbot';
import { patientMessagesApi, type PatientConversationMessage } from '@/services/api/patient-messages';
import type { PatientConversationAssistantMode } from '@/services/api/crmApiClient';
import type { PatientProfileDraft } from '@/types/patient-entry';
import type { PatientChatbotV3ChatResponse } from '@/services/api/patient-chatbot-v3';
import {
  normalizeChatbotV3Turn,
  type ChatbotV3TurnViewModel,
} from '@/services/chatbot-v3-normalizer';
import { usePatientSessionRuntime } from '@/features/patient-sessions/PatientSessionRuntimeProvider';
import PatientChatComposer from './PatientChatComposer';
import {
  createChatWidgetTranslator,
  getPhaseLabel,
  localizeCountry,
  localizeDestination,
  localizeGender,
  localizeTreatmentTime,
  type ChatWidgetTranslate,
} from './chat-widget-i18n';
import PatientChatMessageList, {
  type CompactChatMessage,
  type CompactChatMessageMutation,
  type CompactChatSenderType,
} from './PatientChatMessageList';
import { buildChatbotBlocksFromV3Turn } from './chatbot-v3-blocks';
import { buildLegacyBlockFromHistoryResource } from './patient-chat-legacy-resources';
import { resolveSyntheticStageWidgetMessage } from './patient-chat-stage-widgets';
import PatientQuestionnaireModal from './PatientQuestionnaireModal';
import PatientProfileForm from './PatientProfileForm';
import MechanicalChatMenu from './MechanicalChatMenu';
import { BRAND_LOGO_URL } from '@/config/brandAssets';

function mergeChatMessages(
  current: CompactChatMessage[],
  incoming: CompactChatMessage[],
): CompactChatMessage[] {
  const byId = new Map<string, CompactChatMessage>();

  for (const message of current) {
    byId.set(message.id, message);
  }

  for (const message of incoming) {
    byId.set(message.id, message);
  }

  return Array.from(byId.values()).sort((left, right) =>
    new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

function toCompactFormalMessage(message: PatientConversationMessage): CompactChatMessage {
  const normalizedSenderRole = message.senderRole?.toUpperCase() ?? null;
  const senderType: CompactChatSenderType | undefined = normalizedSenderRole === 'PATIENT'
    ? 'patient'
    : normalizedSenderRole === 'SYSTEM' || message.messageType === 'SYSTEM'
      ? 'system'
      : normalizedSenderRole === 'HOSPITAL'
        ? 'hospital'
        : 'admin';

  return {
    id: message.id,
    role: message.senderRole === 'PATIENT'
      ? 'patient'
      : (message.senderRole === 'SYSTEM' || message.messageType === 'SYSTEM' ? 'system-ui' : 'assistant'),
    messageSource: 'formal',
    content: message.content,
    blocks: message.blocks,
    attachments: message.attachments,
    createdAt: message.createdAt,
    senderType,
    senderLabel: message.senderName,
    messageState: 'sent',
  };
}

function preferMessageArray<T>(primary: T[] | undefined, fallback: T[] | undefined): T[] | undefined {
  if (Array.isArray(primary)) {
    return primary;
  }

  if (Array.isArray(fallback)) {
    return fallback;
  }

  return primary ?? fallback;
}

const JOURNEY_STAGE_ORDER = {
  COLLECT_MINIMAL_MEDICAL_FACTS: 0,
  RECOMMENDATION: 1,
  EXPLAIN_PROCESS: 2,
  COLLECT_MEDICAL_INPUTS: 3,
  ONLINE_CONSULT: 4,
  HUMAN_HANDOFF: 5,
} satisfies Record<NonNullable<ChatbotV3TurnViewModel['journey']>['stage'], number>;

const JOURNEY_PHASE_ORDER = {
  pre: 0,
  active: 1,
  post: 2,
} satisfies Record<NonNullable<ChatbotV3TurnViewModel['journey']>['phase'], number>;

function compareChatbotTurnJourneys(
  nextJourney: ChatbotV3TurnViewModel['journey'],
  currentJourney: ChatbotV3TurnViewModel['journey'],
): number | null {
  if (!nextJourney || !currentJourney) {
    return null;
  }

  const nextStageOrder = JOURNEY_STAGE_ORDER[nextJourney.stage];
  const currentStageOrder = JOURNEY_STAGE_ORDER[currentJourney.stage];

  if (nextStageOrder !== currentStageOrder) {
    return nextStageOrder - currentStageOrder;
  }

  return JOURNEY_PHASE_ORDER[nextJourney.phase] - JOURNEY_PHASE_ORDER[currentJourney.phase];
}

function getChatbotTurnSignature(turn: ChatbotV3TurnViewModel): string {
  return JSON.stringify({
    assistantText: turn.assistantText,
    journey: turn.journey,
    handoff: turn.handoff,
    uiIntent: turn.uiIntent,
    cards: turn.cards,
    attachments: turn.attachments,
  });
}

function createPendingChatbotTurnCreatedAt(messages: CompactChatMessage[]): string {
  const latestMessage = messages.reduce<CompactChatMessage | null>((latest, message) => {
    if (!latest) {
      return message;
    }

    return new Date(message.createdAt).getTime() > new Date(latest.createdAt).getTime()
      ? message
      : latest;
  }, null);

  if (!latestMessage) {
    return new Date().toISOString();
  }

  return new Date(new Date(latestMessage.createdAt).getTime() + 1).toISOString();
}

function buildPendingChatbotAssistantMessage(
  turn: ChatbotV3TurnViewModel,
  existingMessages: CompactChatMessage[],
  conversationId: string,
): CompactChatMessage {
  return {
    id: `pending-chatbot-v3:${conversationId}`,
    role: 'assistant',
    messageSource: 'chatbot',
    content: turn.assistantText ?? '',
    v3Turn: turn,
    createdAt: createPendingChatbotTurnCreatedAt(existingMessages),
    senderType: 'ai',
    messageState: 'sent',
  };
}

function hasHistoryCaughtUpToPendingTurn(
  historyTurn: ChatbotV3TurnViewModel | null,
  pendingTurn: ChatbotV3TurnViewModel | null,
): boolean {
  if (!historyTurn || !pendingTurn) {
    return false;
  }

  if (
    historyTurn.journey?.stage === 'EXPLAIN_PROCESS'
    && pendingTurn.journey?.stage === 'RECOMMENDATION'
  ) {
    return false;
  }

  const journeyDelta = compareChatbotTurnJourneys(historyTurn.journey, pendingTurn.journey);
  if (journeyDelta !== null) {
    if (journeyDelta > 0) {
      return true;
    }

    if (journeyDelta < 0) {
      return false;
    }
  }

  return getChatbotTurnSignature(historyTurn) === getChatbotTurnSignature(pendingTurn);
}

function readChatbotV2Envelope(metadata: PatientChatbotMessageMetadata): {
  resources?: PatientChatbotHistoryResourceDescriptor[];
  journeySnapshot?: PatientChatbotHistoryJourneySnapshot;
} {
  const chatbotV2 = (metadata as Record<string, unknown>)['chatbotV2'];
  if (!chatbotV2 || typeof chatbotV2 !== 'object') {
    return {};
  }

  const envelope = chatbotV2 as Record<string, unknown>;
  return {
    resources: Array.isArray(envelope.resources)
      ? envelope.resources as PatientChatbotHistoryResourceDescriptor[]
      : undefined,
    journeySnapshot: envelope.journeySnapshot as PatientChatbotHistoryJourneySnapshot | undefined,
  };
}

function readChatbotV3Envelope(metadata: PatientChatbotMessageMetadata): PatientChatbotV3ChatResponse | null {
  const chatbotV3 = (metadata as Record<string, unknown>)['chatbotV3'];
  if (!chatbotV3 || typeof chatbotV3 !== 'object') {
    return null;
  }

  const envelope = chatbotV3 as Partial<PatientChatbotV3ChatResponse>;
  if (
    !Array.isArray(envelope.messages)
    || !Array.isArray(envelope.cards)
    || !envelope.journey
    || typeof envelope.journey !== 'object'
    || !envelope.handoff
    || typeof envelope.handoff !== 'object'
    || !envelope.turnOutcome
    || typeof envelope.turnOutcome !== 'object'
  ) {
    return null;
  }

  return envelope as PatientChatbotV3ChatResponse;
}

function tryNormalizeChatbotV3Envelope(
  metadata: PatientChatbotMessageMetadata,
): CompactChatMessage['v3Turn'] | undefined {
  const envelope = readChatbotV3Envelope(metadata);
  if (!envelope) {
    return undefined;
  }

  try {
    return normalizeChatbotV3Turn(envelope);
  } catch {
    return undefined;
  }
}

function resolveCoveredHistoryResourceTypes(
  chatbotV3Turn: CompactChatMessage['v3Turn'],
): Set<PatientChatbotHistoryResourceDescriptor['resourceType']> {
  if (!chatbotV3Turn) {
    return new Set();
  }

  const coveredTypes = new Set<PatientChatbotHistoryResourceDescriptor['resourceType']>();
  for (const block of buildChatbotBlocksFromV3Turn(chatbotV3Turn)) {
    switch (block.type) {
      case 'PROCESS_MODAL_TRIGGER':
        coveredTypes.add('PROCESS_GUIDE');
        break;
      case 'SUPPORTING_DOCUMENT_UPLOAD_PROMPT':
        coveredTypes.add('MEDICAL_DOC_UPLOAD');
        break;
      case 'HOSPITAL_RECOMMENDATION_CARDS':
        coveredTypes.add('HOSPITAL_RECOMMENDATION');
        break;
      case 'HANDOFF_STATUS_CARD':
        coveredTypes.add('HUMAN_HANDOFF');
        break;
      case 'ONLINE_CONSULT_STATUS_CARD':
        coveredTypes.add('ONLINE_CONSULT_BOOKING');
        break;
      default:
        break;
    }
  }

  return coveredTypes;
}

function toCompactChatbotMessage(message: {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  resources?: PatientChatbotHistoryResourceDescriptor[];
  journeySnapshot?: PatientChatbotHistoryJourneySnapshot;
  metadata?: PatientChatbotMessageMetadata;
  attachments?: CompactChatMessage['attachments'];
  createdAt: string;
}): CompactChatMessage {
  const metadata = message.metadata ?? {};
  const chatbotV2 = readChatbotV2Envelope(metadata);
  const chatbotV3Turn = tryNormalizeChatbotV3Envelope(metadata);
  const coveredResourceTypes = resolveCoveredHistoryResourceTypes(chatbotV3Turn);
  const legacyResources = preferMessageArray(
    message.resources,
    preferMessageArray(metadata.resources, chatbotV2.resources),
  ) ?? [];
  const legacyBlocks = legacyResources
    .filter((resource) => !coveredResourceTypes.has(resource.resourceType))
    .map((resource) => buildLegacyBlockFromHistoryResource(resource))
    .filter((block): block is NonNullable<typeof block> => block !== null);
  const draftState = typeof metadata.draftState === 'string' ? metadata.draftState : null;
  const isPendingAssistantDraft = message.role === 'ASSISTANT'
    && message.content.trim().length === 0
    && draftState === 'pending';

  return {
    id: message.id,
    role: message.role === 'USER'
      ? 'patient'
      : message.role === 'SYSTEM'
        ? 'system-ui'
        : 'assistant',
    messageSource: 'chatbot',
    content: message.content || chatbotV3Turn?.assistantText || '',
    blocks: legacyBlocks,
    v3Turn: chatbotV3Turn,
    resources: legacyResources,
    journeySnapshot: message.journeySnapshot ?? chatbotV2.journeySnapshot ?? metadata.journeySnapshot,
    attachments: message.attachments,
    createdAt: message.createdAt,
    senderType: message.role === 'USER'
      ? 'patient'
      : message.role === 'SYSTEM'
        ? 'system'
        : 'ai',
    messageState: isPendingAssistantDraft ? 'typing' : 'sent',
  };
}

function applyChatMessageMutation(
  current: CompactChatMessage[],
  mutation: CompactChatMessageMutation,
): CompactChatMessage[] {
  let next = current;

  if (mutation.removeIds && mutation.removeIds.length > 0) {
    const removeIds = new Set(mutation.removeIds);
    next = next.filter((message) => !removeIds.has(message.id));
  }

  if (mutation.update && mutation.update.length > 0) {
    const updates = new Map(mutation.update.map((message) => [message.id, message]));
    next = next.map((message) => {
      const update = updates.get(message.id);
      return update ? { ...message, ...update } : message;
    });
  }

  if (mutation.add && mutation.add.length > 0) {
    next = mergeChatMessages(next, mutation.add);
  }

  return next;
}

function buildProfileSummaryRows(profile: PatientProfileDraft, translate: ChatWidgetTranslate): Array<[string, string]> {
  const rows: Array<[string, string]> = [
    [translate('chatWidget.summary.name'), profile.name],
    [translate('chatWidget.summary.email'), profile.email],
  ];

  if (profile.phone.trim()) {
    rows.push([translate('chatWidget.summary.phone'), profile.phone]);
  }

  if (profile.gender.trim()) {
    rows.push([translate('chatWidget.summary.gender'), localizeGender(profile.gender, translate)]);
  }

  if (profile.country.trim()) {
    rows.push([translate('chatWidget.summary.country'), localizeCountry(profile.country, translate)]);
  }

  if (profile.department.trim()) {
    rows.push([translate('chatWidget.summary.department'), profile.department]);
  }

  if (profile.disease.trim()) {
    rows.push([translate('chatWidget.summary.disease'), profile.disease]);
  }

  if (profile.destination.trim()) {
    rows.push([translate('chatWidget.summary.destination'), localizeDestination(profile.destination, translate)]);
  }

  if (profile.treatmentTime.trim()) {
    rows.push([translate('chatWidget.summary.treatmentTime'), localizeTreatmentTime(profile.treatmentTime, translate)]);
  }

  return rows;
}

function mergeSubmittedProfile(
  profileDraft: PatientProfileDraft,
  patient: ReturnType<typeof usePatientAuth>['patient'],
): PatientProfileDraft {
  return {
    ...profileDraft,
    name: profileDraft.name.trim() || patient?.name || '',
    email: profileDraft.email.trim() || patient?.email || '',
    phone: profileDraft.phone.trim() || patient?.phone || '',
    gender: profileDraft.gender.trim() || patient?.gender || '',
    country: profileDraft.country.trim() || patient?.country || '',
    department: profileDraft.department.trim() || patient?.department || '',
    departmentCode: profileDraft.departmentCode.trim() || patient?.departmentCode || '',
    disease: profileDraft.disease.trim() || patient?.disease || '',
    destination: profileDraft.destination.trim() || patient?.destination || '',
    treatmentTime: profileDraft.treatmentTime.trim() || patient?.treatmentTime || '',
  };
}

function AssistantPromptBubble({ text }: { text: string }) {
  return (
    <div className="mr-auto flex max-w-[90%] items-start gap-3">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
        <BotMessageSquare className="h-4 w-4 text-slate-500" />
      </div>
      <div className="rounded-2xl bg-slate-100 px-4 py-3 text-[13px] font-medium text-slate-700 shadow-sm">
        {text}
      </div>
    </div>
  );
}

function PatientProfileSummaryCard({
  profile,
  translate,
}: {
  profile: PatientProfileDraft;
  translate: ChatWidgetTranslate;
}) {
  const rows = buildProfileSummaryRows(profile, translate);

  return (
    <div className="max-w-[92%] rounded-[26px] border border-slate-200 bg-white px-5 py-5 shadow-[0_22px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-semibold text-slate-900">{translate('chatWidget.summary.title')}</div>
          <div className="mt-3 space-y-2">
            {rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[110px_1fr] gap-3 text-sm leading-6">
                <span className="text-slate-500">{label}:</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-teal-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {translate('chatWidget.summary.submitted')}
          </div>
        </div>
      </div>
    </div>
  );
}

function InlinePhaseBlock() {
  const { currentLanguage } = useLanguage();
  const { patient } = usePatientAuth();
  const { phase, bootstrapError, clearBootstrapError, profileDraft } = usePatientEntry();
  const translate = useMemo(
    () => createChatWidgetTranslator(currentLanguage.code),
    [currentLanguage.code],
  );
  const submittedProfile = useMemo(
    () => mergeSubmittedProfile(profileDraft, patient),
    [patient, profileDraft],
  );

  if (phase === 'collect-profile') {
    return (
      <>
        <PatientProfileForm />
        <AssistantPromptBubble text={translate('chatWidget.prompt.help')} />
      </>
    );
  }

  if (phase === 'select-hospitals') {
    return <PatientProfileSummaryCard profile={submittedProfile} translate={translate} />;
  }

  if (phase === 'bootstrap-error') {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-4 w-4" />
          {translate('chatWidget.bootstrapError.title')}
        </div>
        <p className="mt-2 leading-6">
          {bootstrapError || translate('chatWidget.bootstrapError.fallback')}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearBootstrapError}
          className="mt-3"
        >
          {translate('chatWidget.retry')}
        </Button>
      </div>
    );
  }

  return <PatientProfileSummaryCard profile={submittedProfile} translate={translate} />;
}

function isNearBottom(element: HTMLElement, threshold = 96): boolean {
  return element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;
}

function scrollContainerToBottom(element: HTMLElement) {
  const nextTop = Math.max(element.scrollHeight - element.clientHeight, 0);

  if (typeof element.scrollTo === 'function') {
    element.scrollTo({ top: nextTop, behavior: 'auto' });
    return;
  }

  element.scrollTop = nextTop;
}

export default function PatientEntryWindow() {
  const { currentLanguage } = useLanguage();
  const { patient } = usePatientAuth();
  const {
    phase,
    caseId,
    widgetDisplayMode,
    widgetChatTarget,
    journeySnapshot,
    processConfirmed,
    chatbotV3Journey,
    chatbotV3Handoff,
    chatbotV3Cards,
    applyChatbotV3TurnState = () => {},
    clearChatbotV3TurnState = () => {},
    markProcessConfirmed = () => {},
    isQuestionnaireModalOpen,
    questionnaireTemplateId,
    questionnaireHistoryRefreshNonce,
    requestQuestionnaireTemplate,
    closeQuestionnaireModal,
    openComposerAttachmentPicker,
  } = usePatientEntry();
  const {
    sessions,
    sessionsLoading,
    sessionsError,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    detail,
    detailLoading,
    detailError,
    refreshActiveSession,
    connectionState,
  } = usePatientSessionRuntime();
  const [optimisticMessages, setOptimisticMessages] = useState<CompactChatMessage[]>([]);
  const [medicalRecordsUploadCompletionNonce, setMedicalRecordsUploadCompletionNonce] = useState(0);
  const [medicalRecordsUploadFailureNonce, setMedicalRecordsUploadFailureNonce] = useState(0);
  const canShowFormalMessages = phase === 'select-hospitals' || phase === 'messages-ready';
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const stickToBottomRef = useRef(true);
  const translate = useMemo(
    () => createChatWidgetTranslator(currentLanguage.code),
    [currentLanguage.code],
  );
  const runtimeAssistantMode = activeSession?.sessionKind === 'care-team' && detail?.sessionId === activeSessionId
    ? (detail.chatAuthority ?? null)
    : null;
  const assistantMode = runtimeAssistantMode
    ?? activeSession?.assistantMode
    ?? patient?.formalConversationState?.activeAssistantMode
    ?? null;
  const baseMessages = useMemo<CompactChatMessage[]>(
    () => (
      detail?.sessionId === activeSessionId
        ? detail.data.map((message) => {
            if (message.source === 'CHATBOT') {
              return toCompactChatbotMessage({
                id: message.id,
                role: message.senderRole === 'PATIENT'
                  ? 'USER'
                  : message.senderRole === 'SYSTEM'
                    ? 'SYSTEM'
                    : 'ASSISTANT',
                content: message.content,
                resources: message.metadata?.resources as PatientChatbotHistoryResourceDescriptor[] | undefined,
                journeySnapshot: message.metadata?.journeySnapshot as PatientChatbotHistoryJourneySnapshot | undefined,
                metadata: message.metadata as PatientChatbotMessageMetadata | undefined,
                attachments: message.attachments,
                createdAt: message.createdAt,
              });
            }

            return toCompactFormalMessage(message);
          })
        : []
    ),
    [activeSessionId, detail],
  );
  const latestHistoryChatbotV3Turn = useMemo(
    () => [...baseMessages]
      .reverse()
      .find((message) => message.role === 'assistant' && message.messageSource === 'chatbot' && message.v3Turn)
      ?.v3Turn ?? null,
    [baseMessages],
  );
  const [pendingChatbotV3Turn, setPendingChatbotV3Turn] = useState<ChatbotV3TurnViewModel | null>(null);
  const [pendingChatbotV3AssistantMessage, setPendingChatbotV3AssistantMessage] = useState<CompactChatMessage | null>(null);
  const pendingChatbotV3TurnConversationIdRef = useRef<string | null>(null);
  const isPendingChatbotV3TurnActive = Boolean(
    pendingChatbotV3Turn
    && activeSessionId
    && pendingChatbotV3TurnConversationIdRef.current === activeSessionId
    && !hasHistoryCaughtUpToPendingTurn(latestHistoryChatbotV3Turn, pendingChatbotV3Turn),
  );
  const latestChatbotV3Turn = useMemo(() => {
    if (
      !pendingChatbotV3Turn
      || pendingChatbotV3TurnConversationIdRef.current !== activeSessionId
    ) {
      return latestHistoryChatbotV3Turn;
    }

    if (hasHistoryCaughtUpToPendingTurn(latestHistoryChatbotV3Turn, pendingChatbotV3Turn)) {
      return latestHistoryChatbotV3Turn;
    }

    return pendingChatbotV3Turn;
  }, [activeSessionId, latestHistoryChatbotV3Turn, pendingChatbotV3Turn]);
  const visibleBaseMessages = useMemo<CompactChatMessage[]>(() => {
    if (!isPendingChatbotV3TurnActive || !pendingChatbotV3AssistantMessage) {
      return baseMessages;
    }

    return mergeChatMessages(baseMessages, [pendingChatbotV3AssistantMessage]);
  }, [baseMessages, isPendingChatbotV3TurnActive, pendingChatbotV3AssistantMessage]);
  const displayedMessages = useMemo<CompactChatMessage[]>(
    () => (canShowFormalMessages ? mergeChatMessages(visibleBaseMessages, optimisticMessages) : []),
    [canShowFormalMessages, optimisticMessages, visibleBaseMessages],
  );
  const widgetChatSessionId = widgetChatTarget?.kind === 'CHATBOT_SESSION'
    ? widgetChatTarget.sessionId
    : null;
  const stageWidgetMessage = useMemo(
    () => resolveSyntheticStageWidgetMessage({
      journeySnapshot,
      chatbotV3Journey,
      chatbotV3Handoff,
      chatbotV3Cards,
      displayedMessages,
      assistantMode,
      activeConversationType: activeSession?.sessionKind === 'care-team' ? 'patient-admin' : 'patient-hospital',
      widgetChatSessionId,
    }),
    [
      activeSession?.sessionKind,
      assistantMode,
      chatbotV3Cards,
      chatbotV3Handoff,
      chatbotV3Journey,
      displayedMessages,
      journeySnapshot,
      widgetChatSessionId,
    ],
  );
  const renderedMessages = useMemo(
    () => (stageWidgetMessage ? mergeChatMessages([stageWidgetMessage], displayedMessages) : displayedMessages),
    [displayedMessages, stageWidgetMessage],
  );
  const isFallbackPolling = connectionState === 'polling';
  const isConversationSwitchPending = canShowFormalMessages
    && Boolean(activeSessionId)
    && detail !== null
    && detail?.sessionId !== activeSessionId;
  const hasHospitalSessions = sessions.some((session) => session.sessionKind === 'hospital');
  const hasMechanicalChatFlag = (detail as { mechanicalChat?: { enabled?: boolean } } | null)?.mechanicalChat?.enabled === true;
  const shouldUseMechanicalFallback = activeSession?.sessionKind === 'care-team'
    && widgetChatTarget?.kind === 'CHATBOT_SESSION'
    && assistantMode === 'AI_ACTIVE';
  const isMechanicalChatEnabled = canShowFormalMessages
    && activeSession?.sessionKind === 'care-team'
    && detail?.sessionId === activeSessionId
    && (hasMechanicalChatFlag || shouldUseMechanicalFallback);

  useEffect(() => {
    if (!canShowFormalMessages || activeSession?.sessionKind !== 'care-team') {
      pendingChatbotV3TurnConversationIdRef.current = null;
      setPendingChatbotV3Turn(null);
      setPendingChatbotV3AssistantMessage(null);
      clearChatbotV3TurnState();
      return;
    }

    if (!pendingChatbotV3Turn) {
      return;
    }

    if (hasHistoryCaughtUpToPendingTurn(latestHistoryChatbotV3Turn, pendingChatbotV3Turn)) {
      pendingChatbotV3TurnConversationIdRef.current = null;
      setPendingChatbotV3Turn(null);
      setPendingChatbotV3AssistantMessage(null);
    }
  }, [
    activeSession?.sessionKind,
    canShowFormalMessages,
    clearChatbotV3TurnState,
    latestHistoryChatbotV3Turn,
    pendingChatbotV3Turn,
  ]);

  useEffect(() => {
    if (!canShowFormalMessages || activeSession?.sessionKind !== 'care-team') {
      setPendingChatbotV3Turn(null);
      setPendingChatbotV3AssistantMessage(null);
      clearChatbotV3TurnState();
      return;
    }

    if (!latestChatbotV3Turn) {
      clearChatbotV3TurnState();
      return;
    }

    applyChatbotV3TurnState({
      journey: latestChatbotV3Turn.journey,
      handoff: latestChatbotV3Turn.handoff,
      cards: latestChatbotV3Turn.cards,
      uiIntent: latestChatbotV3Turn.uiIntent,
      source: isPendingChatbotV3TurnActive ? 'fresh' : 'history',
    });
  }, [
    activeSession?.sessionKind,
    applyChatbotV3TurnState,
    canShowFormalMessages,
    clearChatbotV3TurnState,
    isPendingChatbotV3TurnActive,
    latestChatbotV3Turn,
  ]);

  useEffect(() => {
    setOptimisticMessages([]);
    pendingChatbotV3TurnConversationIdRef.current = null;
    setPendingChatbotV3Turn(null);
    setPendingChatbotV3AssistantMessage(null);
  }, [activeSessionId]);

  const handleMessagesSent = (incoming: CompactChatMessage[]) => {
    setOptimisticMessages((current) => mergeChatMessages(current, incoming));
    const hasMechanicalMedicalRecordsUpload = isMechanicalChatEnabled
      && incoming.some((message) =>
        message.role === 'patient'
        && message.messageSource === 'formal'
        && (message.attachments?.length ?? 0) > 0
      );

    if (hasMechanicalMedicalRecordsUpload) {
      setMedicalRecordsUploadCompletionNonce((current) => current + 1);
    }
  };

  const handleMessageMutation = (mutation: CompactChatMessageMutation) => {
    setOptimisticMessages((current) => applyChatMessageMutation(current, mutation));
  };

  const handleRetryFormalMessages = () => {
    void refreshActiveSession();
  };

  const handleConversationRefresh = () => {
    void refreshActiveSession();
  };

  const handleMechanicalUploadFailed = () => {
    setMedicalRecordsUploadFailureNonce((current) => current + 1);
  };

  const handleChatbotTurnReceived = (turn: ChatbotV3TurnViewModel) => {
    if (!canShowFormalMessages || activeSession?.sessionKind !== 'care-team' || !activeSessionId) {
      return;
    }

    pendingChatbotV3TurnConversationIdRef.current = activeSessionId;
    setPendingChatbotV3Turn(turn);
    setPendingChatbotV3AssistantMessage(
      buildPendingChatbotAssistantMessage(turn, displayedMessages, activeSessionId),
    );
    applyChatbotV3TurnState({
      journey: turn.journey,
      handoff: turn.handoff,
      cards: turn.cards,
      uiIntent: turn.uiIntent,
      source: 'fresh',
    });
  };

  const handleConfirmProcessGuide = async () => {
    if (!activeSessionId) {
      throw new Error('Cannot confirm the process guide before the chat session is loaded.');
    }

    await patientMessagesApi.confirmProcessGuide({ sessionId: activeSessionId });
    markProcessConfirmed();
    await refreshActiveSession();
  };

  const messageStream = (
    <div className="space-y-4 pr-1">
      <InlinePhaseBlock />
      {canShowFormalMessages && (isConversationSwitchPending || (detailLoading && displayedMessages.length === 0)) ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {activeSession?.displayTitle ? (
            <div className="font-medium text-slate-700">{activeSession.displayTitle}</div>
          ) : null}
          <div className={activeSession?.displayTitle ? 'mt-1' : undefined}>
            {phase === 'select-hospitals'
              ? translate('chatWidget.messages.loadingHospitals')
              : translate('chatWidget.messages.loadingCareTeam')}
          </div>
        </div>
      ) : canShowFormalMessages && isFallbackPolling && displayedMessages.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {translate('chatWidget.messages.reconnecting')}
        </div>
      ) : canShowFormalMessages && detailError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <div>{detailError}</div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRetryFormalMessages}
            className="mt-3"
          >
            {translate('chatWidget.retry')}
          </Button>
        </div>
      ) : isMechanicalChatEnabled ? (
        <>
          {renderedMessages.length > 0 ? (
            <PatientChatMessageList messages={renderedMessages} onConfirmProcessGuide={handleConfirmProcessGuide} />
          ) : null}
          <MechanicalChatMenu
            caseId={caseId}
            processConfirmed={processConfirmed}
            questionnaireHistoryRefreshNonce={questionnaireHistoryRefreshNonce}
            medicalRecordsUploadCompletionNonce={medicalRecordsUploadCompletionNonce}
            medicalRecordsUploadFailureNonce={medicalRecordsUploadFailureNonce}
            onConfirmProcessGuide={handleConfirmProcessGuide}
            onOpenQuestionnaire={requestQuestionnaireTemplate}
            onOpenMedicalRecordsUpload={openComposerAttachmentPicker}
          />
        </>
      ) : (
        <PatientChatMessageList messages={renderedMessages} onConfirmProcessGuide={handleConfirmProcessGuide} />
      )}
    </div>
  );

  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) {
      return;
    }

    const handleScroll = () => {
      stickToBottomRef.current = isNearBottom(element);
    };

    handleScroll();
    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useLayoutEffect(() => {
    const element = scrollContainerRef.current;
    if (!element || !stickToBottomRef.current) {
      return;
    }

    scrollContainerToBottom(element);
  }, [renderedMessages, phase, detailLoading, isConversationSwitchPending, canShowFormalMessages]);

  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (!stickToBottomRef.current) {
        return;
      }

      scrollContainerToBottom(element);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-950/15">
      <div data-testid="patient-entry-header" className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md shadow-slate-200/80">
            <img src={BRAND_LOGO_URL} alt={translate('chatWidget.brandName')} className="h-10 w-10 rounded-xl object-contain" />
          </div>
          <div>
            <div className="text-base font-semibold text-slate-900">{translate('chatWidget.brandName')}</div>
            <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
              <span>{getPhaseLabel(phase, translate)}</span>
            </div>
          </div>
        </div>
        {canShowFormalMessages && hasHospitalSessions ? (
          <div className={widgetDisplayMode === 'modal' ? 'mt-4 md:hidden' : 'mt-4'}>
            <ConversationList
              conversations={sessions}
              activeConversationId={activeSessionId}
              isLoading={sessionsLoading}
              errorMessage={sessionsError}
              onSelectConversation={setActiveSessionId}
              variant="switcher"
            />
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {widgetDisplayMode === 'modal' && canShowFormalMessages ? (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="hidden w-[280px] min-w-[240px] md:flex">
              <ConversationList
                conversations={sessions}
                activeConversationId={activeSessionId}
                isLoading={sessionsLoading}
                errorMessage={sessionsError}
                onSelectConversation={setActiveSessionId}
                variant="sidebar"
              />
            </div>
            <div
              ref={scrollContainerRef}
              data-testid="patient-chat-scroll-container"
              className="flex-1 overflow-y-auto px-4 py-5"
            >
              {messageStream}
            </div>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            data-testid="patient-chat-scroll-container"
            className="flex-1 overflow-y-auto px-4 py-5"
          >
            {messageStream}
          </div>
        )}
      </div>

      <PatientChatComposer
        sessionId={activeSession?.id ?? null}
        assistantMode={assistantMode}
        widgetChatTarget={widgetChatTarget?.kind === 'CHATBOT_SESSION'
          ? { sessionId: widgetChatTarget.sessionId }
          : null}
        onMessagesSent={handleMessagesSent}
        onMessageMutation={handleMessageMutation}
        onConversationRefresh={handleConversationRefresh}
        latestAssistantChatbotV3Turn={latestChatbotV3Turn}
        onChatbotTurnReceived={handleChatbotTurnReceived}
        onMechanicalUploadFailed={handleMechanicalUploadFailed}
        mechanicalMode={isMechanicalChatEnabled}
      />
      {isQuestionnaireModalOpen && caseId ? (
        <PatientQuestionnaireModal
          caseId={caseId}
          templateId={questionnaireTemplateId}
          isOpen={isQuestionnaireModalOpen}
          onClose={closeQuestionnaireModal}
        />
      ) : null}
    </div>
  );
}

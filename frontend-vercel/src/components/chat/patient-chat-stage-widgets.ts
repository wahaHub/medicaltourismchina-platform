import type { CompactChatMessage } from './PatientChatMessageList';
import type {
  PatientConversationAssistantMode,
  PatientSessionJourneySnapshot,
} from '@/services/api/crmApiClient';
import type { ChatbotV3TurnViewModel } from '@/services/chatbot-v3-normalizer';
import { buildChatbotBlocksFromV3Turn } from './chatbot-v3-blocks';

type ResolveSyntheticStageWidgetMessageInput = {
  journeySnapshot: PatientSessionJourneySnapshot | null;
  chatbotV3Journey: ChatbotV3TurnViewModel['journey'];
  chatbotV3Handoff: ChatbotV3TurnViewModel['handoff'];
  chatbotV3Cards: ChatbotV3TurnViewModel['cards'];
  displayedMessages: CompactChatMessage[];
  assistantMode: PatientConversationAssistantMode | null;
  activeConversationType: string | null;
  widgetChatSessionId: string | null;
};

function hasRenderedChatStageWidget(messages: CompactChatMessage[], blockType: string): boolean {
  return messages.some((message) => {
    const v3Blocks = message.v3Turn ? buildChatbotBlocksFromV3Turn(message.v3Turn) : [];
    return (message.blocks?.some((block) => block.type === blockType) ?? false)
      || v3Blocks.some((block) => block.type === blockType);
  });
}

function createStageWidgetCreatedAt(messages: CompactChatMessage[]): string {
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

function buildSyntheticStageWidgetMessage(
  input: {
    stage: 'EXPLAIN_PROCESS' | 'COLLECT_MEDICAL_INPUTS' | 'ONLINE_CONSULT' | 'HUMAN_HANDOFF';
    phase: 'pre' | 'active' | 'post';
    handoff?: ChatbotV3TurnViewModel['handoff'];
    cards?: ChatbotV3TurnViewModel['cards'];
  },
  existingMessages: CompactChatMessage[],
): CompactChatMessage | null {
  const createdAt = createStageWidgetCreatedAt(existingMessages);
  const baseMessage = {
    role: 'assistant' as const,
    messageSource: 'chatbot' as const,
    content: '',
    createdAt,
    senderType: 'ai' as const,
    messageState: 'sent' as const,
  };

  if (input.stage === 'EXPLAIN_PROCESS') {
    const v3Turn: ChatbotV3TurnViewModel = {
      assistantText: null,
      attachments: [],
      cards: input.cards && input.cards.length > 0
        ? input.cards
        : [{
            id: 'card-process-guide',
            kind: 'PROCESS_GUIDE',
            title: 'Medical travel process',
            guideId: 'guide-process',
            actions: [{
              type: 'OPEN_MODAL',
              label: 'Open process guide',
              modalKey: 'MEDICAL_TRAVEL_PROCESS',
            }],
          }],
      journey: {
        stage: 'EXPLAIN_PROCESS',
        phase: input.phase,
      },
      handoff: input.handoff ?? {
        required: false,
        ticketId: null,
      },
      turnOutcome: null,
      uiIntent: 'EXPLAIN_PROCESS',
    };

    return {
      id: 'stage-widget:explain-process',
      ...baseMessage,
      v3Turn,
    };
  }

  if (input.stage === 'COLLECT_MEDICAL_INPUTS') {
    const v3Turn: ChatbotV3TurnViewModel = {
      assistantText: null,
      attachments: [],
      cards: input.cards && input.cards.length > 0
        ? input.cards
        : [{
            id: 'card-upload-records',
            kind: 'UPLOAD_RECORDS',
            required: true,
            uploadedCount: 0,
            actions: [{
              type: 'REFRESH_STATUS',
              label: 'Refresh upload status',
              actionKey: 'UPLOAD_RECORDS',
            }],
          }],
      journey: {
        stage: 'COLLECT_MEDICAL_INPUTS',
        phase: input.phase,
      },
      handoff: input.handoff ?? {
        required: false,
        ticketId: null,
      },
      turnOutcome: null,
      uiIntent: 'SUPPORTING_DOCUMENT_UPLOAD',
    };

    return {
      id: 'stage-widget:supporting-documents',
      ...baseMessage,
      v3Turn,
    };
  }

  if (input.stage === 'HUMAN_HANDOFF') {
    const v3Turn: ChatbotV3TurnViewModel = {
      assistantText: null,
      attachments: [],
      cards: input.cards && input.cards.length > 0
        ? input.cards
        : [{
            id: 'card-handoff-status',
            kind: 'HANDOFF_STATUS',
            required: true,
            ticketId: null,
            actions: [{
              type: 'OPEN_URL',
              label: 'Open handoff portal',
              actionKey: 'HANDOFF_PORTAL',
            }],
          }],
      journey: {
        stage: 'HUMAN_HANDOFF',
        phase: input.phase,
      },
      handoff: input.handoff ?? {
        required: true,
        ticketId: null,
      },
      turnOutcome: null,
      uiIntent: 'HUMAN_HANDOFF',
    };

    return {
      id: 'stage-widget:human-handoff',
      ...baseMessage,
      v3Turn,
    };
  }

  if (input.stage === 'ONLINE_CONSULT') {
    const v3Turn: ChatbotV3TurnViewModel = {
      assistantText: null,
      attachments: [],
      cards: input.cards && input.cards.length > 0
        ? input.cards
        : [{
            id: 'card-consult-status',
            kind: 'CONSULT_BOOKING',
            status: 'idle',
            actions: [{
              type: 'REFRESH_STATUS',
              label: 'Refresh consultation status',
              actionKey: 'CONSULT_BOOKING',
            }],
          }],
      journey: {
        stage: 'ONLINE_CONSULT',
        phase: input.phase,
      },
      handoff: input.handoff ?? {
        required: false,
        ticketId: null,
      },
      turnOutcome: null,
      uiIntent: 'ONLINE_CONSULT',
    };

    return {
      id: 'stage-widget:online-consult',
      ...baseMessage,
      v3Turn,
    };
  }

  return null;
}

export function resolveSyntheticStageWidgetMessage(
  input: ResolveSyntheticStageWidgetMessageInput,
): CompactChatMessage | null {
  const {
    journeySnapshot,
    chatbotV3Journey,
    chatbotV3Handoff,
    chatbotV3Cards,
    displayedMessages,
    assistantMode,
    activeConversationType,
    widgetChatSessionId,
  } = input;

  if (activeConversationType !== 'patient-admin') {
    return null;
  }

  const effectiveJourney = chatbotV3Journey ?? (
    journeySnapshot
      ? {
          stage: journeySnapshot.currentStage,
          phase: journeySnapshot.currentPhase,
        }
      : null
  );

  if (!effectiveJourney) {
    return null;
  }

  if (
    effectiveJourney.stage === 'EXPLAIN_PROCESS'
    && hasRenderedChatStageWidget(displayedMessages, 'PROCESS_MODAL_TRIGGER')
  ) {
    return null;
  }

  if (
    effectiveJourney.stage === 'COLLECT_MEDICAL_INPUTS'
    && hasRenderedChatStageWidget(displayedMessages, 'SUPPORTING_DOCUMENT_UPLOAD_PROMPT')
  ) {
    return null;
  }

  if (
    effectiveJourney.stage === 'HUMAN_HANDOFF'
    && hasRenderedChatStageWidget(displayedMessages, 'HANDOFF_STATUS_CARD')
  ) {
    return null;
  }

  if (
    effectiveJourney.stage === 'ONLINE_CONSULT'
    && hasRenderedChatStageWidget(displayedMessages, 'ONLINE_CONSULT_STATUS_CARD')
  ) {
    return null;
  }

  if (effectiveJourney.stage === 'HUMAN_HANDOFF' || effectiveJourney.stage === 'ONLINE_CONSULT') {
    return buildSyntheticStageWidgetMessage({
      stage: effectiveJourney.stage,
      phase: effectiveJourney.phase,
      handoff: chatbotV3Handoff,
      cards: chatbotV3Cards,
    }, displayedMessages);
  }

  if (assistantMode !== 'AI_ACTIVE' || !widgetChatSessionId) {
    return null;
  }

  if (effectiveJourney.stage !== 'EXPLAIN_PROCESS' && effectiveJourney.stage !== 'COLLECT_MEDICAL_INPUTS') {
    return null;
  }

  return buildSyntheticStageWidgetMessage({
    stage: effectiveJourney.stage,
    phase: effectiveJourney.phase,
    handoff: chatbotV3Handoff,
    cards: chatbotV3Cards,
  }, displayedMessages);
}

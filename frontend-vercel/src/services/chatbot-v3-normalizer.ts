import type {
  PatientChatbotV3Attachment,
  PatientChatbotV3Card,
  PatientChatbotV3ChatResponse,
  PatientChatbotV3Handoff,
  PatientChatbotV3Journey,
  PatientChatbotV3TurnOutcome,
} from '@/services/api/patient-chatbot-v3';

export type ChatbotV3UiIntent =
  | 'DEFAULT'
  | 'EXPLAIN_PROCESS'
  | 'SUPPORTING_DOCUMENT_UPLOAD'
  | 'RECOMMENDATION'
  | 'ONLINE_CONSULT'
  | 'HUMAN_HANDOFF'
  | 'FAQ_DETOUR';

export type ChatbotV3CardViewModel =
  | {
      id: string;
      kind: 'PROCESS_GUIDE';
      title: string;
      guideId: string;
      actions: Array<{
        type: 'OPEN_MODAL';
        label: string;
        modalKey: 'MEDICAL_TRAVEL_PROCESS';
      }>;
    }
  | {
      id: string;
      kind: 'UPLOAD_RECORDS';
      required: boolean;
      uploadedCount: number;
      actions: Array<{
        type: 'SUBMIT' | 'REFRESH_STATUS';
        label: string;
        actionKey: 'UPLOAD_RECORDS';
      }>;
    }
  | {
      id: string;
      kind: 'RECOMMENDATION_LIST';
      candidates: Array<{
        hospitalId: string;
        name: string;
        reason?: string;
      }>;
      actions: Array<
        | {
            type: 'SUBMIT';
            label: string;
            hospitalId: string;
          }
        | {
            type: 'SUBMIT';
            label: string;
            actionKey: 'RECOMMENDATION_SKIPPED';
          }
      >;
    }
  | {
      id: string;
      kind: 'CONSULT_BOOKING';
      status: 'idle' | 'scheduled' | 'failed';
      actions: Array<{
        type: 'SUBMIT' | 'REFRESH_STATUS';
        label: string;
        actionKey: 'CONSULT_BOOKING';
      }>;
    }
  | {
      id: string;
      kind: 'HANDOFF_STATUS';
      required: boolean;
      ticketId: string | null;
      actions: Array<{
        type: 'OPEN_URL';
        label: string;
        actionKey: 'HANDOFF_PORTAL';
      }>;
    };

export type ChatbotV3TurnViewModel = {
  assistantText: string | null;
  cards: ChatbotV3CardViewModel[];
  journey: PatientChatbotV3Journey | null;
  handoff: PatientChatbotV3Handoff | null;
  turnOutcome: PatientChatbotV3TurnOutcome | null;
  attachments: PatientChatbotV3Attachment[];
  uiIntent: ChatbotV3UiIntent;
  expectsTriageSubmission?: boolean;
};

function hasStructuredThreePartTriagePrompt(assistantText: string | null): boolean {
  if (!assistantText) {
    return false;
  }

  const normalized = assistantText.replace(/\s+/g, ' ').trim();
  const markers = Array.from(
    assistantText.matchAll(/(?:^|[\s\r\n])([1-3])(?:[.)、:-])\s+/g),
    (match) => match[1],
  ).join('');

  const hasProblemPrompt = /\b(main symptom|main problem|medical problem|diagnosis)\b/i.test(normalized);
  const hasTimingOrSeverityPrompt = /\b(when did it start|how long|been going on|how severe|severity)\b/i.test(normalized);
  const hasExistingRecordsPrompt = /\b(tests|treatments|medicines|diagnoses|diagnosis(?:\s+report)?s?|already exist)\b/i.test(normalized);

  return markers.includes('123')
    && hasProblemPrompt
    && hasTimingOrSeverityPrompt
    && hasExistingRecordsPrompt;
}

export function expectsStructuredTriageSubmission(
  turn: Pick<ChatbotV3TurnViewModel, 'assistantText' | 'journey' | 'expectsTriageSubmission'> | null | undefined,
): boolean {
  if (!turn) {
    return false;
  }

  if (typeof turn.expectsTriageSubmission === 'boolean') {
    return turn.expectsTriageSubmission;
  }

  return turn.journey?.stage === 'COLLECT_MINIMAL_MEDICAL_FACTS'
    && hasStructuredThreePartTriagePrompt(turn.assistantText);
}

function normalizeCard(card: PatientChatbotV3Card): ChatbotV3CardViewModel {
  switch (card.cardType) {
    case 'PROCESS_GUIDE':
      return {
        id: card.cardId,
        kind: 'PROCESS_GUIDE',
        title: card.payload.title,
        guideId: card.payload.guideId,
        actions: card.actions.map((action) => ({
          type: action.actionType,
          label: action.label,
          modalKey: action.params.modalKey,
        })),
      };
    case 'UPLOAD_RECORDS':
      return {
        id: card.cardId,
        kind: 'UPLOAD_RECORDS',
        required: card.payload.required,
        uploadedCount: card.payload.uploadedCount,
        actions: card.actions.map((action) => ({
          type: action.actionType,
          label: action.label,
          actionKey: action.params.actionKey,
        })),
      };
    case 'RECOMMENDATION_LIST':
      return {
        id: card.cardId,
        kind: 'RECOMMENDATION_LIST',
        candidates: card.payload.candidates,
        actions: card.actions.map((action) => (
          'hospitalId' in action.params
            ? {
                type: action.actionType,
                label: action.label,
                hospitalId: action.params.hospitalId,
              }
            : {
                type: action.actionType,
                label: action.label,
                actionKey: action.params.actionKey,
              }
        )),
      };
    case 'CONSULT_BOOKING':
      return {
        id: card.cardId,
        kind: 'CONSULT_BOOKING',
        status: card.payload.status,
        actions: card.actions.map((action) => ({
          type: action.actionType,
          label: action.label,
          actionKey: action.params.actionKey,
        })),
      };
    case 'HANDOFF_STATUS':
      return {
        id: card.cardId,
        kind: 'HANDOFF_STATUS',
        required: card.payload.required,
        ticketId: card.payload.ticketId ?? null,
        actions: card.actions.map((action) => ({
          type: action.actionType,
          label: action.label,
          actionKey: action.params.actionKey,
        })),
      };
  }
}

function deriveUiIntent(
  response: PatientChatbotV3ChatResponse,
  cards: ChatbotV3CardViewModel[],
  assistantText: string | null,
): ChatbotV3UiIntent {
  if (response.handoff.required || response.journey.stage === 'HUMAN_HANDOFF' || cards.some((card) => card.kind === 'HANDOFF_STATUS')) {
    return 'HUMAN_HANDOFF';
  }

  if (assistantText && cards.length === 0) {
    return 'FAQ_DETOUR';
  }

  if (cards.some((card) => card.kind === 'PROCESS_GUIDE') || response.journey.stage === 'EXPLAIN_PROCESS') {
    return 'EXPLAIN_PROCESS';
  }

  if (cards.some((card) => card.kind === 'UPLOAD_RECORDS') || response.journey.stage === 'COLLECT_MEDICAL_INPUTS') {
    return 'SUPPORTING_DOCUMENT_UPLOAD';
  }

  if (cards.some((card) => card.kind === 'RECOMMENDATION_LIST') || response.journey.stage === 'RECOMMENDATION') {
    return 'RECOMMENDATION';
  }

  if (cards.some((card) => card.kind === 'CONSULT_BOOKING') || response.journey.stage === 'ONLINE_CONSULT') {
    return 'ONLINE_CONSULT';
  }

  return 'DEFAULT';
}

export function normalizeChatbotV3Turn(
  response: PatientChatbotV3ChatResponse,
  input: {
    attachments?: PatientChatbotV3Attachment[];
  } = {},
): ChatbotV3TurnViewModel {
  const assistantText = response.messages
    .map((message) => message.text.trim())
    .filter((text) => text.length > 0)
    .join('\n\n') || null;
  const cards = response.cards.map((card) => normalizeCard(card));
  const uiIntent = deriveUiIntent(response, cards, assistantText);
  const expectsTriageSubmission = response.journey.stage === 'COLLECT_MINIMAL_MEDICAL_FACTS'
    && hasStructuredThreePartTriagePrompt(assistantText);

  return {
    assistantText,
    cards,
    journey: response.journey ?? null,
    handoff: response.handoff ?? null,
    turnOutcome: response.turnOutcome ?? null,
    attachments: input.attachments ?? [],
    uiIntent,
    expectsTriageSubmission,
  };
}

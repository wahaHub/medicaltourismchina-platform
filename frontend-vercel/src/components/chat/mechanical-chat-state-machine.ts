export type MechanicalActionKey =
  | 'PROCESS_GUIDE'
  | 'MEDICAL_RECORDS'
  | 'ADVISOR_HANDOFF'
  | 'QUESTIONNAIRE';

export type MechanicalTurnStatus = 'selected' | 'completed' | 'unconfirmed' | 'cancelled' | 'failed';

export type MechanicalTurn = {
  id: string;
  actionKey: MechanicalActionKey;
  status: MechanicalTurnStatus;
  requiresProcessFirst: boolean;
  processConfirmed: boolean;
  repeat: boolean;
  questionnaireRefreshNonce?: number;
};

export type MechanicalChatState = {
  optimisticProcessConfirmed: boolean;
  questionnaireBefore: boolean;
  advisorCompleted: boolean;
  turns: MechanicalTurn[];
};

export type MechanicalChatEvent =
  | {
      type: 'ACTION_SELECTED';
      actionKey: MechanicalActionKey;
      processConfirmed: boolean;
      repeat: boolean;
    }
  | { type: 'PROCESS_CONFIRMED'; turnId?: string }
  | { type: 'PROCESS_DISMISSED'; turnId?: string }
  | { type: 'UPLOAD_PICKER_OPENED' }
  | { type: 'UPLOAD_SUCCEEDED' }
  | { type: 'UPLOAD_FAILED' }
  | { type: 'QUESTIONNAIRE_OPENED'; turnId: string; questionnaireRefreshNonce: number }
  | { type: 'QUESTIONNAIRE_SUBMITTED' }
  | { type: 'ADVISOR_CONFIRMED'; turnId?: string };

export function createInitialMechanicalChatState(): MechanicalChatState {
  return {
    optimisticProcessConfirmed: false,
    questionnaireBefore: false,
    advisorCompleted: false,
    turns: [],
  };
}

export function createMechanicalTurnId(actionKey: MechanicalActionKey): string {
  return `mechanical:${actionKey}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}

export function requiresProcess(actionKey: MechanicalActionKey): boolean {
  return actionKey === 'MEDICAL_RECORDS'
    || actionKey === 'ADVISOR_HANDOFF'
    || actionKey === 'QUESTIONNAIRE';
}

export function getActiveMechanicalTurn(state: MechanicalChatState): MechanicalTurn | null {
  return state.turns.find((turn) => turn.status === 'selected') ?? null;
}

export function isMechanicalActionBarVisible(state: MechanicalChatState): boolean {
  return getActiveMechanicalTurn(state) === null;
}

function updateLatestTurn(
  state: MechanicalChatState,
  actionKey: MechanicalActionKey,
  status: MechanicalTurnStatus,
  patch: Partial<MechanicalTurn> = {},
  fromStatuses: MechanicalTurnStatus[] = ['selected'],
): MechanicalChatState {
  const targetIndex = state.turns.findLastIndex((turn) =>
    turn.actionKey === actionKey && fromStatuses.includes(turn.status)
  );

  if (targetIndex < 0) {
    return state;
  }

  const turns = state.turns.map((turn, index) => {
    if (index !== targetIndex) {
      return turn;
    }

    return { ...turn, ...patch, status };
  });

  return { ...state, turns };
}

function updateTurnById(
  state: MechanicalChatState,
  turnId: string | undefined,
  patch: Partial<MechanicalTurn>,
): MechanicalChatState {
  const activeTurnId = turnId ?? getActiveMechanicalTurn(state)?.id;
  if (!activeTurnId) {
    return state;
  }

  return {
    ...state,
    turns: state.turns.map((turn) => (
      turn.id === activeTurnId ? { ...turn, ...patch } : turn
    )),
  };
}

export function mechanicalChatReducer(
  state: MechanicalChatState,
  event: MechanicalChatEvent,
): MechanicalChatState {
  switch (event.type) {
    case 'ACTION_SELECTED': {
      const effectiveProcessConfirmed = event.processConfirmed || state.optimisticProcessConfirmed;
      return {
        ...state,
        turns: [
          ...state.turns,
          {
            id: createMechanicalTurnId(event.actionKey),
            actionKey: event.actionKey,
            status: 'selected',
            requiresProcessFirst: requiresProcess(event.actionKey) && !effectiveProcessConfirmed,
            processConfirmed: effectiveProcessConfirmed,
            repeat: event.actionKey === 'QUESTIONNAIRE' ? event.repeat : false,
          },
        ],
      };
    }

    case 'PROCESS_CONFIRMED': {
      const activeTurn = event.turnId
        ? state.turns.find((turn) => turn.id === event.turnId) ?? null
        : getActiveMechanicalTurn(state);
      const nextState = { ...state, optimisticProcessConfirmed: true };

      if (!activeTurn) {
        return nextState;
      }

      if (activeTurn.actionKey === 'PROCESS_GUIDE') {
        return updateTurnById(nextState, activeTurn.id, {
          status: 'completed',
          processConfirmed: true,
        });
      }

      return updateTurnById(nextState, activeTurn.id, {
        requiresProcessFirst: false,
        processConfirmed: true,
      });
    }

    case 'PROCESS_DISMISSED':
      return updateTurnById(state, event.turnId, { status: 'unconfirmed' });

    case 'UPLOAD_PICKER_OPENED':
      return updateLatestTurn(state, 'MEDICAL_RECORDS', 'cancelled');

    case 'UPLOAD_SUCCEEDED':
      return updateLatestTurn(
        state,
        'MEDICAL_RECORDS',
        'completed',
        { processConfirmed: true },
        ['selected', 'cancelled'],
      );

    case 'UPLOAD_FAILED':
      return updateLatestTurn(state, 'MEDICAL_RECORDS', 'failed', {}, ['selected', 'cancelled']);

    case 'QUESTIONNAIRE_OPENED':
      return updateTurnById(state, event.turnId, {
        questionnaireRefreshNonce: event.questionnaireRefreshNonce,
      });

    case 'QUESTIONNAIRE_SUBMITTED':
      return updateLatestTurn(
        { ...state, questionnaireBefore: true },
        'QUESTIONNAIRE',
        'completed',
        { processConfirmed: true },
      );

    case 'ADVISOR_CONFIRMED':
      return updateTurnById(
        { ...state, advisorCompleted: true },
        event.turnId,
        { status: 'completed', processConfirmed: true },
      );

    default:
      return state;
  }
}

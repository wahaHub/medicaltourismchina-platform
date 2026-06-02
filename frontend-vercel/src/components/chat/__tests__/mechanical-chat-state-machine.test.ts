import { describe, expect, it } from 'vitest';
import {
  createInitialMechanicalChatState,
  getActiveMechanicalTurn,
  isMechanicalActionBarVisible,
  mechanicalChatReducer,
} from '../mechanical-chat-state-machine';

describe('mechanical chat state machine', () => {
  it('returns to idle when the upload picker is opened so canceling the picker cannot trap the action bar', () => {
    const selected = mechanicalChatReducer(createInitialMechanicalChatState(), {
      type: 'ACTION_SELECTED',
      actionKey: 'MEDICAL_RECORDS',
      processConfirmed: true,
      repeat: false,
    });

    expect(getActiveMechanicalTurn(selected)?.actionKey).toBe('MEDICAL_RECORDS');
    expect(isMechanicalActionBarVisible(selected)).toBe(false);

    const afterPickerOpen = mechanicalChatReducer(selected, {
      type: 'UPLOAD_PICKER_OPENED',
    });

    expect(getActiveMechanicalTurn(afterPickerOpen)).toBeNull();
    expect(isMechanicalActionBarVisible(afterPickerOpen)).toBe(true);
    expect(afterPickerOpen.turns.at(-1)).toEqual(expect.objectContaining({
      actionKey: 'MEDICAL_RECORDS',
      status: 'cancelled',
    }));
  });

  it('marks the active upload turn failed and restores the action bar', () => {
    const selected = mechanicalChatReducer(createInitialMechanicalChatState(), {
      type: 'ACTION_SELECTED',
      actionKey: 'MEDICAL_RECORDS',
      processConfirmed: true,
      repeat: false,
    });

    const failed = mechanicalChatReducer(selected, {
      type: 'UPLOAD_FAILED',
    });

    expect(getActiveMechanicalTurn(failed)).toBeNull();
    expect(isMechanicalActionBarVisible(failed)).toBe(true);
    expect(failed.turns.at(-1)).toEqual(expect.objectContaining({
      actionKey: 'MEDICAL_RECORDS',
      status: 'failed',
    }));
  });
});

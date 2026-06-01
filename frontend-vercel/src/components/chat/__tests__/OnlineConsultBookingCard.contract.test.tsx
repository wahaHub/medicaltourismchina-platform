import { describe, expect, it } from 'vitest';
import type { OnlineConsultBookingCardBlock } from '../../../types/chatbot-blocks';

const consultBlock: OnlineConsultBookingCardBlock = {
  id: 'block-consult',
  type: 'ONLINE_CONSULT_BOOKING_CARD',
  title: 'Online Consultation',
  requestedAction: 'INVITE_ONLINE_CONSULT',
  convertPath: '/consult/convert',
  conversionDraft: {
    sessionId: 'session-1',
    name: 'Alice',
    email: 'alice@example.com',
    country: 'China',
    conditionSummary: 'Eye pain and blurred vision',
    budget: 'Flexible',
  },
};

describe('OnlineConsultBookingCard contract', () => {
  it('matches the current backend contract', () => {
    expect(consultBlock.requestedAction).toBe('INVITE_ONLINE_CONSULT');
    expect(consultBlock.conversionDraft.sessionId).toBe('session-1');
    expect(consultBlock.conversionDraft.country).toBe('China');
  });
});

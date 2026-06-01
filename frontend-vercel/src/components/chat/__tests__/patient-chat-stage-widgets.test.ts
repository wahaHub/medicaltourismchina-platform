import { describe, expect, it } from 'vitest';
import { resolveSyntheticStageWidgetMessage } from '../patient-chat-stage-widgets';
import type { CompactChatMessage } from '../PatientChatMessageList';

function makeMessage(overrides: Partial<CompactChatMessage> = {}): CompactChatMessage {
  return {
    id: 'message-1',
    role: 'assistant',
    messageSource: 'formal',
    content: 'Existing message',
    createdAt: '2026-04-24T10:00:00.000Z',
    senderType: 'admin',
    messageState: 'sent',
    ...overrides,
  };
}

describe('resolveSyntheticStageWidgetMessage', () => {
  it('places explain-process widgets after the latest rendered turn', () => {
    const widget = resolveSyntheticStageWidgetMessage({
      journeySnapshot: {
        currentStage: 'EXPLAIN_PROCESS',
        currentPhase: 'active',
      },
      displayedMessages: [
        makeMessage({ id: 'message-1', createdAt: '2026-04-24T10:00:00.000Z' }),
        makeMessage({ id: 'message-2', createdAt: '2026-04-24T10:05:00.000Z' }),
      ],
      assistantMode: 'AI_ACTIVE',
      activeConversationType: 'patient-admin',
      widgetChatSessionId: 'widget-session-1',
    });

    expect(widget?.id).toBe('stage-widget:explain-process');
    expect(new Date(widget?.createdAt ?? 0).getTime()).toBeGreaterThan(new Date('2026-04-24T10:05:00.000Z').getTime());
  });

  it('keeps handoff widgets available after assistant mode flips to HUMAN_TAKEOVER', () => {
    const widget = resolveSyntheticStageWidgetMessage({
      journeySnapshot: {
        currentStage: 'HUMAN_HANDOFF',
        currentPhase: 'active',
      },
      displayedMessages: [makeMessage()],
      assistantMode: 'HUMAN_TAKEOVER',
      activeConversationType: 'patient-admin',
      widgetChatSessionId: null,
    });

    expect(widget?.id).toBe('stage-widget:human-handoff');
    expect(widget?.v3Turn?.cards[0]).toMatchObject({
      kind: 'HANDOFF_STATUS',
    });
  });

  it('injects an online-consult widget when the journey is already in ONLINE_CONSULT', () => {
    const widget = resolveSyntheticStageWidgetMessage({
      journeySnapshot: {
        currentStage: 'ONLINE_CONSULT',
        currentPhase: 'active',
      },
      displayedMessages: [makeMessage()],
      assistantMode: 'AI_ACTIVE',
      activeConversationType: 'patient-admin',
      widgetChatSessionId: 'widget-session-1',
    });

    expect(widget?.id).toBe('stage-widget:online-consult');
    expect(widget?.v3Turn?.cards[0]).toMatchObject({
      kind: 'CONSULT_BOOKING',
      status: 'idle',
    });
  });

  it('keeps online-consult widgets available after assistant mode flips to HUMAN_TAKEOVER', () => {
    const widget = resolveSyntheticStageWidgetMessage({
      journeySnapshot: {
        currentStage: 'ONLINE_CONSULT',
        currentPhase: 'active',
      },
      displayedMessages: [makeMessage()],
      assistantMode: 'HUMAN_TAKEOVER',
      activeConversationType: 'patient-admin',
      widgetChatSessionId: null,
    });

    expect(widget?.id).toBe('stage-widget:online-consult');
    expect(widget?.v3Turn?.uiIntent).toBe('ONLINE_CONSULT');
  });

  it('preserves persisted consult card details across FAQ detours', () => {
    const widget = resolveSyntheticStageWidgetMessage({
      journeySnapshot: {
        currentStage: 'RECOMMENDATION',
        currentPhase: 'active',
      },
      chatbotV3Journey: {
        stage: 'ONLINE_CONSULT',
        phase: 'active',
      },
      chatbotV3Handoff: {
        required: false,
        ticketId: null,
      },
      chatbotV3Cards: [{
        id: 'card-consult-scheduled',
        kind: 'CONSULT_BOOKING',
        status: 'scheduled',
        actions: [{
          type: 'REFRESH_STATUS',
          label: 'Refresh consultation status',
          actionKey: 'CONSULT_BOOKING',
        }],
      }],
      displayedMessages: [makeMessage()],
      assistantMode: 'AI_ACTIVE',
      activeConversationType: 'patient-admin',
      widgetChatSessionId: 'widget-session-1',
    });

    expect(widget?.id).toBe('stage-widget:online-consult');
    expect(widget?.v3Turn?.cards[0]).toMatchObject({
      kind: 'CONSULT_BOOKING',
      status: 'scheduled',
    });
  });

  it('does not inject chatbot widgets into hospital conversations', () => {
    const widget = resolveSyntheticStageWidgetMessage({
      journeySnapshot: {
        currentStage: 'COLLECT_MEDICAL_INPUTS',
        currentPhase: 'active',
      },
      displayedMessages: [makeMessage()],
      assistantMode: 'AI_ACTIVE',
      activeConversationType: 'patient-hospital',
      widgetChatSessionId: 'widget-session-1',
    });

    expect(widget).toBeNull();
  });

  it('does not inject a duplicate synthetic widget when a v3 turn already rendered the same stage widget', () => {
    const widget = resolveSyntheticStageWidgetMessage({
      journeySnapshot: {
        currentStage: 'EXPLAIN_PROCESS',
        currentPhase: 'active',
      },
      displayedMessages: [
        makeMessage({
          id: 'message-v3-1',
          messageSource: 'chatbot',
          senderType: 'ai',
          v3Turn: {
            assistantText: null,
            attachments: [],
            cards: [{
              id: 'card-process-1',
              kind: 'PROCESS_GUIDE',
              title: 'Medical travel process',
              guideId: 'guide-1',
              actions: [{
                type: 'OPEN_MODAL',
                label: 'Open process guide',
                modalKey: 'MEDICAL_TRAVEL_PROCESS',
              }],
            }],
            journey: {
              stage: 'EXPLAIN_PROCESS',
              phase: 'active',
            },
            handoff: {
              required: false,
              ticketId: null,
            },
            turnOutcome: null,
            uiIntent: 'EXPLAIN_PROCESS',
          },
        }),
      ],
      assistantMode: 'AI_ACTIVE',
      activeConversationType: 'patient-admin',
      widgetChatSessionId: 'widget-session-1',
    });

    expect(widget).toBeNull();
  });

  it('does not keep a stale process widget once chatbot-v3 state has advanced beyond EXPLAIN_PROCESS', () => {
    const widget = resolveSyntheticStageWidgetMessage({
      journeySnapshot: {
        currentStage: 'EXPLAIN_PROCESS',
        currentPhase: 'active',
      },
      chatbotV3Journey: {
        stage: 'RECOMMENDATION',
        phase: 'active',
      },
      chatbotV3Handoff: {
        required: false,
        ticketId: null,
      },
      chatbotV3Cards: [],
      displayedMessages: [makeMessage()],
      assistantMode: 'AI_ACTIVE',
      activeConversationType: 'patient-admin',
      widgetChatSessionId: 'widget-session-1',
    });

    expect(widget).toBeNull();
  });
});

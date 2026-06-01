import { describe, expect, it } from 'vitest';
import type { PatientChatbotV3ChatResponse } from '@/services/api/patient-chatbot-v3';
import { normalizeChatbotV3Turn } from '@/services/chatbot-v3-normalizer';

function makeResponse(overrides: Partial<PatientChatbotV3ChatResponse> = {}): PatientChatbotV3ChatResponse {
  return {
    messages: [{
      role: 'assistant',
      text: 'Default assistant reply',
    }],
    turnOutcome: {
      status: 'ok',
      recoverableErrorCode: null,
    },
    cards: [],
    journey: {
      stage: 'COLLECT_MINIMAL_MEDICAL_FACTS',
      phase: 'active',
    },
    handoff: {
      required: false,
      ticketId: null,
    },
    ...overrides,
  };
}

describe('normalizeChatbotV3Turn', () => {
  it('normalizes a standard progression turn with assistant text plus cards', () => {
    const viewModel = normalizeChatbotV3Turn(makeResponse({
      messages: [{
        role: 'assistant',
        text: 'Please review how the process works next.',
      }],
      cards: [{
        cardId: 'card-process-1',
        cardType: 'PROCESS_GUIDE',
        payload: {
          guideId: 'guide-1',
          title: 'Medical travel process',
        },
        actions: [{
          actionType: 'OPEN_MODAL',
          label: 'Open process guide',
          params: {
            modalKey: 'MEDICAL_TRAVEL_PROCESS',
          },
        }],
      }],
      journey: {
        stage: 'EXPLAIN_PROCESS',
        phase: 'active',
      },
    }));

    expect(viewModel.assistantText).toBe('Please review how the process works next.');
    expect(viewModel.uiIntent).toBe('EXPLAIN_PROCESS');
    expect(viewModel.cards).toEqual([{
      id: 'card-process-1',
      kind: 'PROCESS_GUIDE',
      title: 'Medical travel process',
      guideId: 'guide-1',
      actions: [{
        type: 'OPEN_MODAL',
        label: 'Open process guide',
        modalKey: 'MEDICAL_TRAVEL_PROCESS',
      }],
    }]);
  });

  it('classifies a FAQ detour without changing the primary journey stage', () => {
    const viewModel = normalizeChatbotV3Turn(makeResponse({
      messages: [{
        role: 'assistant',
        text: 'The usual recovery period is around two weeks.',
      }],
      journey: {
        stage: 'RECOMMENDATION',
        phase: 'active',
      },
    }));

    expect(viewModel.uiIntent).toBe('FAQ_DETOUR');
    expect(viewModel.journey).toEqual({
      stage: 'RECOMMENDATION',
      phase: 'active',
    });
    expect(viewModel.assistantText).toContain('two weeks');
  });

  it('keeps FAQ misses honest instead of fabricating workflow copy', () => {
    const viewModel = normalizeChatbotV3Turn(makeResponse({
      messages: [{
        role: 'assistant',
        text: "I don't have that exact answer right now, but I can connect you with our care team.",
      }],
      journey: {
        stage: 'COLLECT_MEDICAL_INPUTS',
        phase: 'active',
      },
    }));

    expect(viewModel.uiIntent).toBe('FAQ_DETOUR');
    expect(viewModel.assistantText).toContain("don't have that exact answer");
    expect(viewModel.cards).toEqual([]);
  });

  it('surfaces handoff turns through handoff state and card intent', () => {
    const viewModel = normalizeChatbotV3Turn(makeResponse({
      messages: [{
        role: 'assistant',
        text: 'I am handing this to our care team now.',
      }],
      cards: [{
        cardId: 'card-handoff-1',
        cardType: 'HANDOFF_STATUS',
        payload: {
          required: true,
          ticketId: 'ticket-123',
        },
        actions: [{
          actionType: 'OPEN_URL',
          label: 'Open handoff portal',
          params: {
            actionKey: 'HANDOFF_PORTAL',
          },
        }],
      }],
      journey: {
        stage: 'HUMAN_HANDOFF',
        phase: 'active',
      },
      handoff: {
        required: true,
        ticketId: 'ticket-123',
      },
    }));

    expect(viewModel.uiIntent).toBe('HUMAN_HANDOFF');
    expect(viewModel.handoff).toEqual({
      required: true,
      ticketId: 'ticket-123',
    });
    expect(viewModel.cards[0]).toMatchObject({
      kind: 'HANDOFF_STATUS',
      ticketId: 'ticket-123',
    });
  });

  it('keeps attachment-only turns usable even when assistant text is empty', () => {
    const viewModel = normalizeChatbotV3Turn(
      makeResponse({
        messages: [{
          role: 'assistant',
          text: '',
        }],
        cards: [{
          cardId: 'card-upload-1',
          cardType: 'UPLOAD_RECORDS',
          payload: {
            required: true,
            uploadedCount: 1,
          },
          actions: [{
            actionType: 'REFRESH_STATUS',
            label: 'Refresh upload status',
            params: {
              actionKey: 'UPLOAD_RECORDS',
            },
          }],
        }],
        journey: {
          stage: 'COLLECT_MEDICAL_INPUTS',
          phase: 'active',
        },
      }),
      {
        attachments: [{
          fileName: 'report.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          storageKey: 'crm/dev/chatbot/report.pdf',
        }],
      },
    );

    expect(viewModel.assistantText).toBeNull();
    expect(viewModel.uiIntent).toBe('SUPPORTING_DOCUMENT_UPLOAD');
    expect(viewModel.attachments).toEqual([{
      fileName: 'report.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      storageKey: 'crm/dev/chatbot/report.pdf',
    }]);
  });

  it('marks structured three-part minimal-facts prompts as triage submissions', () => {
    const viewModel = normalizeChatbotV3Turn(makeResponse({
      messages: [{
        role: 'assistant',
        text: [
          'To finish triage, please reply in one message with:',
          '1. Your main symptom and how severe it is',
          '2. How long this has been happening',
          '3. Any diagnosis, treatment, or tests you already had',
        ].join('\n'),
      }],
      journey: {
        stage: 'COLLECT_MINIMAL_MEDICAL_FACTS',
        phase: 'active',
      },
    }));

    expect(viewModel.expectsTriageSubmission).toBe(true);
  });

  it('does not mark ordinary minimal-facts turns as triage submissions', () => {
    const viewModel = normalizeChatbotV3Turn(makeResponse({
      messages: [{
        role: 'assistant',
        text: 'Tell me more about your symptoms and any diagnosis you already have.',
      }],
      journey: {
        stage: 'COLLECT_MINIMAL_MEDICAL_FACTS',
        phase: 'active',
      },
    }));

    expect(viewModel.expectsTriageSubmission).toBe(false);
  });

  it('does not mark unrelated numbered prompts as triage submissions', () => {
    const viewModel = normalizeChatbotV3Turn(makeResponse({
      messages: [{
        role: 'assistant',
        text: [
          'Please answer these follow-up questions:',
          '1. Which eye is affected?',
          '2. Can you upload a photo?',
          '3. What time works best for a callback?',
        ].join('\n'),
      }],
      journey: {
        stage: 'COLLECT_MINIMAL_MEDICAL_FACTS',
        phase: 'active',
      },
    }));

    expect(viewModel.expectsTriageSubmission).toBe(false);
  });
});

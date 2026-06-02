import type { ChatbotMessageBlock } from '@/types/chatbot-blocks';
import type { ChatbotV3TurnViewModel } from '@/services/chatbot-v3-normalizer';
import type { ChatWidgetTranslate } from './chat-widget-i18n';

const defaultTranslate: ChatWidgetTranslate = (key) => {
  const fallback: Record<string, string> = {
    'chatWidget.v3.upload.title': 'Upload your medical records',
    'chatWidget.v3.upload.description': 'Please attach at least one supporting document so the doctor can review your case.',
    'chatWidget.v3.recommendations.title': 'Recommended hospitals',
    'chatWidget.v3.handoff.title': 'Care team handoff in progress',
    'chatWidget.v3.handoff.description': 'A human care coordinator will continue your case from here.',
    'chatWidget.v3.handoff.waiting': 'Waiting for care team',
    'chatWidget.v3.handoff.resolved': 'Resolved',
    'chatWidget.v3.consult.title': 'Online consultation status',
    'chatWidget.v3.consult.description': 'We are keeping your consultation step active here while the care team coordinates the next action.',
    'chatWidget.v3.consult.stageDescription': 'Your case is in the consultation stage and the care team will guide the next step here.',
    'chatWidget.v3.consult.scheduled': 'Scheduled',
    'chatWidget.v3.consult.needsAttention': 'Needs attention',
    'chatWidget.v3.consult.ready': 'Ready to arrange',
    'chatWidget.v3.consult.scheduledHelper': 'The care team will share the consultation details here.',
    'chatWidget.v3.consult.helper': 'You can still upload late documents with the attachment button below.',
    'chatWidget.v3.process.title': 'Medical travel process',
  };

  return fallback[key] ?? String(key);
};

export function buildChatbotBlocksFromV3Turn(
  viewModel: ChatbotV3TurnViewModel,
  input: {
    caseId?: string | null;
    translate?: ChatWidgetTranslate;
  } = {},
): ChatbotMessageBlock[] {
  const blocks: ChatbotMessageBlock[] = [];
  const caseId = input.caseId ?? null;
  const translate = input.translate ?? defaultTranslate;

  for (const card of viewModel.cards) {
    switch (card.kind) {
      case 'PROCESS_GUIDE':
        blocks.push({
          id: `v3:${card.id}`,
          type: 'PROCESS_MODAL_TRIGGER',
          modalKey: 'MEDICAL_TRAVEL_PROCESS',
          title: card.title,
        });
        break;
      case 'UPLOAD_RECORDS':
        blocks.push({
          id: `v3:${card.id}`,
          type: 'SUPPORTING_DOCUMENT_UPLOAD_PROMPT',
          title: translate('chatWidget.v3.upload.title'),
          description: translate('chatWidget.v3.upload.description'),
          required: card.required,
          uploadedCount: card.uploadedCount,
        });
        break;
      case 'RECOMMENDATION_LIST':
        if (!caseId) {
          break;
        }
        blocks.push({
          id: `v3:${card.id}`,
          type: 'HOSPITAL_RECOMMENDATION_CARDS',
          title: translate('chatWidget.v3.recommendations.title'),
          caseId,
          selectPath: '/select-hospitals',
          hospitals: card.candidates.map((candidate) => ({
            hospitalId: candidate.hospitalId,
            name: candidate.name,
            reason: candidate.reason,
            summary: candidate.reason,
          })),
        });
        break;
      case 'HANDOFF_STATUS':
        blocks.push({
          id: `v3:${card.id}`,
          type: 'HANDOFF_STATUS_CARD',
          title: translate('chatWidget.v3.handoff.title'),
          description: translate('chatWidget.v3.handoff.description'),
          ticketId: card.ticketId ?? undefined,
          statusLabel: card.required ? translate('chatWidget.v3.handoff.waiting') : translate('chatWidget.v3.handoff.resolved'),
        });
        break;
      case 'CONSULT_BOOKING':
        blocks.push({
          id: `v3:${card.id}`,
          type: 'ONLINE_CONSULT_STATUS_CARD',
          title: translate('chatWidget.v3.consult.title'),
          description: translate('chatWidget.v3.consult.description'),
          statusLabel:
            card.status === 'scheduled'
              ? translate('chatWidget.v3.consult.scheduled')
              : card.status === 'failed'
                ? translate('chatWidget.v3.consult.needsAttention')
                : translate('chatWidget.v3.consult.ready'),
          helperText:
            card.status === 'scheduled'
              ? translate('chatWidget.v3.consult.scheduledHelper')
              : translate('chatWidget.v3.consult.helper'),
        });
        break;
      default:
        break;
    }
  }

  if (blocks.length > 0) {
    return blocks;
  }

  if (viewModel.uiIntent === 'EXPLAIN_PROCESS') {
    return [{
      id: 'v3:intent:process-guide',
      type: 'PROCESS_MODAL_TRIGGER',
      modalKey: 'MEDICAL_TRAVEL_PROCESS',
      title: translate('chatWidget.v3.process.title'),
    }];
  }

  if (viewModel.uiIntent === 'SUPPORTING_DOCUMENT_UPLOAD') {
    return [{
      id: 'v3:intent:upload-records',
      type: 'SUPPORTING_DOCUMENT_UPLOAD_PROMPT',
      title: translate('chatWidget.v3.upload.title'),
      description: translate('chatWidget.v3.upload.description'),
      required: true,
      uploadedCount: 0,
    }];
  }

  if (viewModel.uiIntent === 'HUMAN_HANDOFF') {
    return [{
      id: 'v3:intent:handoff-status',
      type: 'HANDOFF_STATUS_CARD',
      title: translate('chatWidget.v3.handoff.title'),
      description: translate('chatWidget.v3.handoff.description'),
      ticketId: viewModel.handoff?.ticketId ?? undefined,
      statusLabel: translate('chatWidget.v3.handoff.waiting'),
    }];
  }

  if (viewModel.uiIntent === 'ONLINE_CONSULT') {
    return [{
      id: 'v3:intent:online-consult-status',
      type: 'ONLINE_CONSULT_STATUS_CARD',
      title: translate('chatWidget.v3.consult.title'),
      description: translate('chatWidget.v3.consult.stageDescription'),
      statusLabel: translate('chatWidget.v3.consult.ready'),
      helperText: translate('chatWidget.v3.consult.helper'),
    }];
  }

  return [];
}

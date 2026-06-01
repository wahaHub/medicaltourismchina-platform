import type { ChatbotMessageBlock } from '@/types/chatbot-blocks';
import type { ChatbotV3TurnViewModel } from '@/services/chatbot-v3-normalizer';

export function buildChatbotBlocksFromV3Turn(
  viewModel: ChatbotV3TurnViewModel,
  input: {
    caseId?: string | null;
  } = {},
): ChatbotMessageBlock[] {
  const blocks: ChatbotMessageBlock[] = [];
  const caseId = input.caseId ?? null;

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
          title: 'Upload your medical records',
          description: 'Please attach at least one supporting document so the doctor can review your case.',
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
          title: 'Recommended hospitals',
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
          title: 'Care team handoff in progress',
          description: 'A human care coordinator will continue your case from here.',
          ticketId: card.ticketId ?? undefined,
          statusLabel: card.required ? 'Waiting for care team' : 'Resolved',
        });
        break;
      case 'CONSULT_BOOKING':
        blocks.push({
          id: `v3:${card.id}`,
          type: 'ONLINE_CONSULT_STATUS_CARD',
          title: 'Online consultation status',
          description: 'We are keeping your consultation step active here while the care team coordinates the next action.',
          statusLabel:
            card.status === 'scheduled'
              ? 'Scheduled'
              : card.status === 'failed'
                ? 'Needs attention'
                : 'Ready to arrange',
          helperText:
            card.status === 'scheduled'
              ? 'The care team will share the consultation details here.'
              : 'You can still upload late documents with the attachment button below.',
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
      title: 'Medical travel process',
    }];
  }

  if (viewModel.uiIntent === 'SUPPORTING_DOCUMENT_UPLOAD') {
    return [{
      id: 'v3:intent:upload-records',
      type: 'SUPPORTING_DOCUMENT_UPLOAD_PROMPT',
      title: 'Upload your medical records',
      description: 'Please attach at least one supporting document so the doctor can review your case.',
      required: true,
      uploadedCount: 0,
    }];
  }

  if (viewModel.uiIntent === 'HUMAN_HANDOFF') {
    return [{
      id: 'v3:intent:handoff-status',
      type: 'HANDOFF_STATUS_CARD',
      title: 'Care team handoff in progress',
      description: 'A human care coordinator will continue your case from here.',
      ticketId: viewModel.handoff?.ticketId ?? undefined,
      statusLabel: 'Waiting for care team',
    }];
  }

  if (viewModel.uiIntent === 'ONLINE_CONSULT') {
    return [{
      id: 'v3:intent:online-consult-status',
      type: 'ONLINE_CONSULT_STATUS_CARD',
      title: 'Online consultation status',
      description: 'Your case is in the consultation stage and the care team will guide the next step here.',
      statusLabel: 'Ready to arrange',
      helperText: 'You can still upload late documents with the attachment button below.',
    }];
  }

  return [];
}

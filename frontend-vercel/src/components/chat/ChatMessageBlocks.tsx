import type { ReactNode } from 'react';
import type {
  ChatbotMessageBlock,
  HandoffStatusCardBlock,
  HospitalRecommendationCardsBlock,
  OnlineConsultStatusCardBlock,
  OnlineConsultBookingCardBlock,
  ProcessModalTriggerBlock,
  QuestionnaireModalTriggerBlock,
  SupportingDocumentUploadPromptBlock,
} from '../../types/chatbot-blocks';
import { ProcessModalTrigger } from './blocks/ProcessModalTrigger';
import { QuestionnaireModalTrigger } from './blocks/QuestionnaireModalTrigger';
import { HospitalRecommendationCards } from './blocks/HospitalRecommendationCards';
import { OnlineConsultBookingCard } from './blocks/OnlineConsultBookingCard';
import { ChatbotV3StageCard } from '@/components/chat-v3/ChatbotV3StageCard';

export interface ChatMessageBlocksHandlers {
  /** Called when the patient submits one or more hospitals from the recommendation cards. */
  onSubmitHospitals?: (caseId: string, hospitalIds: string[], customHospitalRequest?: string) => Promise<void> | void;
  /** Called when the patient opens the formal questionnaire flow. */
  onOpenQuestionnaire?: (templateId: string) => Promise<void> | void;
  /** Called when the patient submits the online consult booking card. */
  onSubmitConsult?: (block: OnlineConsultBookingCardBlock) => Promise<void> | void;
}

interface ChatMessageBlocksProps extends ChatMessageBlocksHandlers {
  blocks: ChatbotMessageBlock[];
}

function renderBlock(block: ChatbotMessageBlock, handlers: ChatMessageBlocksHandlers): ReactNode {
  switch (block.type) {
    case 'PROCESS_MODAL_TRIGGER':
      {
        const processBlock = block as ProcessModalTriggerBlock;
        return (
          <ProcessModalTrigger key={processBlock.id} block={processBlock} />
        );
      }
    case 'QUESTIONNAIRE_MODAL_TRIGGER':
      {
        const questionnaireBlock = block as QuestionnaireModalTriggerBlock;
        return (
          <QuestionnaireModalTrigger
            key={questionnaireBlock.id}
            block={questionnaireBlock}
            onOpen={handlers.onOpenQuestionnaire}
          />
        );
      }
    case 'HOSPITAL_RECOMMENDATION_CARDS': {
      const hospitalBlock = block as HospitalRecommendationCardsBlock;
      const onSubmitSelection = handlers.onSubmitHospitals
        ? (hospitalIds: string[], customHospitalRequest?: string) =>
            handlers.onSubmitHospitals!(hospitalBlock.caseId, hospitalIds, customHospitalRequest)
        : undefined;
      return (
        <HospitalRecommendationCards key={hospitalBlock.id} block={hospitalBlock} onSubmitSelection={onSubmitSelection} />
      );
    }
    case 'ONLINE_CONSULT_BOOKING_CARD': {
      const consultBlock = block as OnlineConsultBookingCardBlock;
      return (
        <OnlineConsultBookingCard
          key={consultBlock.id}
          block={consultBlock}
          onSubmit={handlers.onSubmitConsult}
        />
      );
    }
    case 'SUPPORTING_DOCUMENT_UPLOAD_PROMPT':
      return (
        <ChatbotV3StageCard
          key={(block as SupportingDocumentUploadPromptBlock).id}
          block={block as SupportingDocumentUploadPromptBlock}
        />
      );
    case 'HANDOFF_STATUS_CARD':
      return (
        <ChatbotV3StageCard
          key={(block as HandoffStatusCardBlock).id}
          block={block as HandoffStatusCardBlock}
        />
      );
    case 'ONLINE_CONSULT_STATUS_CARD':
      return (
        <ChatbotV3StageCard
          key={(block as OnlineConsultStatusCardBlock).id}
          block={block as OnlineConsultStatusCardBlock}
        />
      );
    default:
      // Unknown block types are silently ignored
      return null;
  }
}

export function ChatMessageBlocks({
  blocks,
  onSubmitHospitals,
  onOpenQuestionnaire,
  onSubmitConsult,
}: ChatMessageBlocksProps) {
  const handlers: ChatMessageBlocksHandlers = { onSubmitHospitals, onOpenQuestionnaire, onSubmitConsult };
  return (
    <div className="flex flex-col gap-2 mb-2">
      {blocks.map((block) => renderBlock(block, handlers))}
    </div>
  );
}

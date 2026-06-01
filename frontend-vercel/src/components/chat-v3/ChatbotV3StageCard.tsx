import type {
  HandoffStatusCardBlock,
  OnlineConsultStatusCardBlock,
  SupportingDocumentUploadPromptBlock,
} from '@/types/chatbot-blocks';
import { ChatbotV3AttachmentPrompt } from './ChatbotV3AttachmentPrompt';
import { ChatbotV3ConsultStatusCard } from './ChatbotV3ConsultStatusCard';
import { ChatbotV3HandoffCard } from './ChatbotV3HandoffCard';

type ChatbotV3StageCardBlock =
  | SupportingDocumentUploadPromptBlock
  | HandoffStatusCardBlock
  | OnlineConsultStatusCardBlock;

interface ChatbotV3StageCardProps {
  block: ChatbotV3StageCardBlock;
}

export function ChatbotV3StageCard({ block }: ChatbotV3StageCardProps) {
  switch (block.type) {
    case 'SUPPORTING_DOCUMENT_UPLOAD_PROMPT':
      return <ChatbotV3AttachmentPrompt block={block} />;
    case 'HANDOFF_STATUS_CARD':
      return <ChatbotV3HandoffCard block={block} />;
    case 'ONLINE_CONSULT_STATUS_CARD':
      return <ChatbotV3ConsultStatusCard block={block} />;
    default:
      return null;
  }
}

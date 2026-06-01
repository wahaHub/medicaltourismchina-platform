import { useContext } from 'react';
import { BotMessageSquare, FileText, Image as ImageIcon } from 'lucide-react';
import type { ChatbotMessageBlock } from '../../types/chatbot-blocks';
import { ChatMessageBlocks } from './ChatMessageBlocks';
import { PatientEntryContext } from '@/contexts/PatientEntryContext';
import type {
  PatientChatbotHistoryJourneySnapshot,
  PatientChatbotHistoryResourceDescriptor,
} from '@/services/api/patient-chatbot';
import type { PatientMessageAttachment } from '@/services/api/patient-messages';
import type { ChatbotV3TurnViewModel } from '@/services/chatbot-v3-normalizer';
import { buildChatbotBlocksFromV3Turn } from './chatbot-v3-blocks';
import { PatientChatLegacyResources } from './patient-chat-legacy-resources';

export type CompactChatSenderType = 'patient' | 'ai' | 'admin' | 'hospital' | 'system';
export type CompactChatMessageState = 'sent' | 'sending' | 'typing' | 'failed';
export type CompactChatMessageSource = 'chatbot' | 'formal';

export type CompactChatMessage = {
  id: string;
  role: 'patient' | 'assistant' | 'system-ui';
  messageSource: CompactChatMessageSource;
  content: string;
  createdAt: string;
  blocks?: ChatbotMessageBlock[];
  v3Turn?: ChatbotV3TurnViewModel;
  resources?: PatientChatbotHistoryResourceDescriptor[];
  journeySnapshot?: PatientChatbotHistoryJourneySnapshot;
  attachments?: PatientMessageAttachment[];
  senderType?: CompactChatSenderType;
  senderLabel?: string | null;
  messageState?: CompactChatMessageState;
};

export type CompactChatMessageMutation = {
  add?: CompactChatMessage[];
  update?: Array<{ id: string } & Partial<CompactChatMessage>>;
  removeIds?: string[];
};

interface PatientChatMessageListProps {
  messages: CompactChatMessage[];
}

function resolveCoveredResourceTypes(
  chatbotV3Blocks: ChatbotMessageBlock[],
): Set<PatientChatbotHistoryResourceDescriptor['resourceType']> {
  const coveredTypes = new Set<PatientChatbotHistoryResourceDescriptor['resourceType']>();

  for (const block of chatbotV3Blocks) {
    switch (block.type) {
      case 'PROCESS_MODAL_TRIGGER':
        coveredTypes.add('PROCESS_GUIDE');
        break;
      case 'SUPPORTING_DOCUMENT_UPLOAD_PROMPT':
        coveredTypes.add('MEDICAL_DOC_UPLOAD');
        break;
      case 'HOSPITAL_RECOMMENDATION_CARDS':
        coveredTypes.add('HOSPITAL_RECOMMENDATION');
        break;
      case 'HANDOFF_STATUS_CARD':
        coveredTypes.add('HUMAN_HANDOFF');
        break;
      case 'ONLINE_CONSULT_STATUS_CARD':
        coveredTypes.add('ONLINE_CONSULT_BOOKING');
        break;
      default:
        break;
    }
  }

  return coveredTypes;
}

function resolveCoveredLegacyBlockTypes(
  resources: PatientChatbotHistoryResourceDescriptor[],
): Set<ChatbotMessageBlock['type']> {
  const coveredBlockTypes = new Set<ChatbotMessageBlock['type']>();

  for (const resource of resources) {
    switch (resource.resourceType) {
      case 'PROCESS_GUIDE':
        coveredBlockTypes.add('PROCESS_MODAL_TRIGGER');
        break;
      case 'QUESTIONNAIRE':
        coveredBlockTypes.add('QUESTIONNAIRE_MODAL_TRIGGER');
        break;
      case 'HOSPITAL_RECOMMENDATION':
        coveredBlockTypes.add('HOSPITAL_RECOMMENDATION_CARDS');
        break;
      case 'ONLINE_CONSULT_BOOKING':
        coveredBlockTypes.add('ONLINE_CONSULT_BOOKING_CARD');
        break;
      default:
        break;
    }
  }

  return coveredBlockTypes;
}

function shouldSuppressAssistantContent(message: CompactChatMessage, visibleAssistantText: string): boolean {
  if (message.role !== 'assistant') {
    return false;
  }

  const hasHospitalCards = message.blocks?.some((block) => block.type === 'HOSPITAL_RECOMMENDATION_CARDS')
    || message.resources?.some((resource) => resource.resourceType === 'HOSPITAL_RECOMMENDATION');

  if (!hasHospitalCards) {
    return false;
  }

  const normalized = visibleAssistantText.trim();
  return normalized === 'Thanks for sharing your details. Please choose your preferred hospitals below so we can continue your case.'
    || normalized === 'Here are matched hospitals';
}

function resolveSenderLabel(message: CompactChatMessage): string | null {
  if (message.senderLabel && message.senderLabel.trim().length > 0) {
    return message.senderLabel.trim();
  }

  switch (message.senderType) {
    case 'ai':
      return 'AI Bot';
    case 'admin':
      return 'Care Team';
    case 'hospital':
      return 'Hospital Team';
    case 'system':
      return 'System';
    default:
      return message.role === 'assistant'
        ? 'AI Bot'
        : message.role === 'system-ui'
          ? 'System'
          : null;
  }
}

function TypingDotsBubble() {
  return (
    <div
      data-testid="assistant-typing-bubble"
      className="relative inline-flex min-h-[68px] min-w-[88px] items-center justify-center overflow-hidden rounded-[28px] rounded-bl-lg border border-slate-200/90 bg-white/95 px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
    >
      <span className="pointer-events-none absolute inset-x-5 bottom-3 h-4 rounded-full bg-indigo-100/80 blur-md" />
      <div className="relative flex items-center gap-2">
        <span
          data-testid="assistant-typing-dot-1"
          className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-[0_4px_14px_rgba(99,102,241,0.35)] animate-bounce"
          style={{ animationDuration: '1.1s', animationDelay: '0ms' }}
        />
        <span
          data-testid="assistant-typing-dot-2"
          className="h-2.5 w-2.5 rounded-full bg-indigo-300 shadow-[0_4px_12px_rgba(165,180,252,0.35)] animate-bounce"
          style={{ animationDuration: '1.1s', animationDelay: '140ms' }}
        />
        <span
          data-testid="assistant-typing-dot-3"
          className="h-2.5 w-2.5 rounded-full bg-indigo-200 shadow-[0_4px_12px_rgba(199,210,254,0.45)] animate-bounce"
          style={{ animationDuration: '1.1s', animationDelay: '280ms' }}
        />
      </div>
    </div>
  );
}

export default function PatientChatMessageList({ messages }: PatientChatMessageListProps) {
  const ctx = useContext(PatientEntryContext);
  const onSubmitHospitals = ctx?.submitHospitalSelection;
  const patientCaseId = ctx?.caseId ?? null;

  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => {
        const isPatient = message.role === 'patient';
        const senderLabel = resolveSenderLabel(message);
        const showSenderLabel = Boolean(senderLabel) && (!isPatient || Boolean(message.senderLabel));
        const isTyping = message.messageState === 'typing';
        const chatbotV3Blocks = message.role === 'assistant' && message.messageSource === 'chatbot' && message.v3Turn
          ? buildChatbotBlocksFromV3Turn(message.v3Turn, { caseId: patientCaseId })
          : [];
        const visibleAssistantText = message.content || message.v3Turn?.assistantText || '';
        const hideContent = chatbotV3Blocks.some((block) => block.type === 'HOSPITAL_RECOMMENDATION_CARDS')
          ? (() => {
              const normalized = visibleAssistantText.trim();
              return normalized === 'Thanks for sharing your details. Please choose your preferred hospitals below so we can continue your case.'
                || normalized === 'Here are matched hospitals';
            })()
          : shouldSuppressAssistantContent(message, visibleAssistantText);
        const assistantResources = message.role === 'assistant' && message.messageSource === 'chatbot'
          ? (message.resources ?? [])
          : [];
        const coveredResourceTypes = resolveCoveredResourceTypes(chatbotV3Blocks);
        const remainingAssistantResources = assistantResources.filter(
          (resource) => !coveredResourceTypes.has(resource.resourceType),
        );
        const coveredLegacyBlockTypes = resolveCoveredLegacyBlockTypes(remainingAssistantResources);
        const effectiveBlocks = [...chatbotV3Blocks];
        const shouldSuppressLegacyChatbotBlocks = message.messageSource === 'chatbot'
          && !isPatient
          && remainingAssistantResources.length > 0
          && chatbotV3Blocks.length === 0;

        for (const block of message.blocks ?? []) {
          if (shouldSuppressLegacyChatbotBlocks) {
            continue;
          }

          if (
            message.messageSource === 'chatbot'
            && !isPatient
            && coveredLegacyBlockTypes.has(block.type)
          ) {
            continue;
          }

          if (!effectiveBlocks.some((existingBlock) => existingBlock.id === block.id)) {
            effectiveBlocks.push(block);
          }
        }

        const hasLegacyBlocks = message.messageSource === 'formal' && !isPatient && effectiveBlocks.length > 0;
        const hasChatbotBlocks = message.messageSource === 'chatbot' && !isPatient && effectiveBlocks.length > 0;
        const shouldRenderLegacyResources = message.messageSource === 'chatbot'
          && !isPatient
          && remainingAssistantResources.length > 0;
        const shouldRenderBlocks = hasLegacyBlocks || (hasChatbotBlocks && (chatbotV3Blocks.length > 0 || !shouldRenderLegacyResources));

        return (
          <div
            key={message.id}
            data-message-id={message.id}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
              isPatient
                ? 'ml-auto bg-teal-600 text-white'
                : 'mr-auto border border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            {showSenderLabel ? (
              <div className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                isPatient ? 'text-white/75' : 'text-slate-400'
              }`}>
                {senderLabel}
              </div>
            ) : null}
            {shouldRenderLegacyResources ? (
              <PatientChatLegacyResources
                resources={remainingAssistantResources}
                journeySnapshot={message.journeySnapshot}
              />
            ) : null}
            {shouldRenderBlocks ? (
              <ChatMessageBlocks
                blocks={effectiveBlocks}
                onSubmitHospitals={onSubmitHospitals}
                onOpenQuestionnaire={ctx?.requestQuestionnaireTemplate}
                onSubmitConsult={ctx ? (block) => ctx.requestConsultConversion(block) : undefined}
              />
            ) : null}
            {isTyping ? (
              <div
                className="flex items-end gap-3"
                data-testid={`typing-indicator-${message.id}`}
              >
                <div
                  data-testid="assistant-typing-avatar"
                  className="relative mb-1 flex h-10 w-10 shrink-0 items-center justify-center"
                >
                  <span className="absolute inset-0 rounded-full bg-indigo-100/80" />
                  <span className="absolute inset-1 rounded-full bg-white/85 shadow-[0_10px_24px_rgba(99,102,241,0.16)]" />
                  <BotMessageSquare className="relative h-4 w-4 text-indigo-500" />
                </div>
                <TypingDotsBubble />
              </div>
            ) : visibleAssistantText && !hideContent ? (
              <div className="whitespace-pre-wrap">{visibleAssistantText}</div>
            ) : null}
            {message.attachments && message.attachments.length > 0 ? (
              <div className={`${visibleAssistantText && !hideContent ? 'mt-3' : ''} space-y-2`}>
                {message.attachments.map((attachment) => {
                  const isImage = attachment.mimeType.startsWith('image/');
                  const hasUrl = attachment.url.trim().length > 0;

                  if (isImage && hasUrl) {
                    return (
                      <a
                        key={`${message.id}:${attachment.storageKey}`}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`block overflow-hidden rounded-2xl border ${
                          isPatient
                            ? 'border-white/20 bg-white/10 hover:bg-white/15'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <img
                          src={attachment.url}
                          alt={attachment.fileName}
                          className="h-40 w-full object-cover"
                          loading="lazy"
                        />
                        <div className={`flex items-center gap-2 px-3 py-2 text-[12px] ${
                          isPatient ? 'text-white/90' : 'text-slate-600'
                        }`}>
                          <ImageIcon className="h-4 w-4 shrink-0" />
                          <span className="min-w-0 truncate">{attachment.fileName}</span>
                        </div>
                      </a>
                    );
                  }

                  const content = (
                    <>
                      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isPatient ? 'bg-white/15' : 'bg-white'}`}>
                        {isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{attachment.fileName}</span>
                      {!hasUrl ? (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          isPatient ? 'bg-white/15 text-white/90' : 'bg-slate-200 text-slate-600'
                        }`}>
                          Upload syncing
                        </span>
                      ) : null}
                    </>
                  );

                  if (!hasUrl) {
                    return (
                      <div
                        key={`${message.id}:${attachment.storageKey}`}
                        className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-[12px] ${
                          isPatient
                            ? 'border-white/25 bg-white/10 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                      >
                        {content}
                      </div>
                    );
                  }

                  return (
                    <a
                      key={`${message.id}:${attachment.storageKey}`}
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-[12px] ${
                        isPatient
                          ? 'border-white/25 bg-white/10 text-white hover:bg-white/15'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {content}
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

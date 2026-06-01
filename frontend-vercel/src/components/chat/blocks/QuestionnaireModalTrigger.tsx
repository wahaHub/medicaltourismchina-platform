import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { QuestionnaireModalTriggerBlock } from '../../../types/chatbot-blocks';
import { createChatWidgetTranslator } from '../chat-widget-i18n';

interface QuestionnaireModalTriggerProps {
  block: QuestionnaireModalTriggerBlock;
  onOpen?: (templateId: string) => void;
  historyResourceId?: string;
  historyResourceStatus?: string;
}

export function QuestionnaireModalTrigger({
  block,
  onOpen,
  historyResourceId,
  historyResourceStatus,
}: QuestionnaireModalTriggerProps) {
  const { currentLanguage } = useLanguage();
  const handleClick = () => {
    onOpen?.(block.templateId);
  };

  const translate = createChatWidgetTranslator(currentLanguage.code);
  const ctaLabel = block.ctaLabel ?? translate('chatWidget.questionnaire.start');

  return (
    <div
      data-block-type="QUESTIONNAIRE_MODAL_TRIGGER"
      data-history-resource-id={historyResourceId}
      data-history-resource-status={historyResourceStatus}
      className="max-w-[92%] rounded-[24px] border border-violet-100 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50">
          <ClipboardList className="h-4 w-4 text-violet-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-5 text-slate-900">{block.title}</div>
          {block.description && (
            <div className="mt-0.5 text-[12px] leading-5 text-slate-500">{block.description}</div>
          )}
          <Button
            type="button"
            onClick={handleClick}
            className="mt-3 inline-flex h-9 items-center rounded-xl bg-violet-600 px-4 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

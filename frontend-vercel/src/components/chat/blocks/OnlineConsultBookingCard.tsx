import { useState } from 'react';
import { CalendarClock, CheckCircle2, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { OnlineConsultBookingCardBlock } from '../../../types/chatbot-blocks';
import { createChatWidgetTranslator } from '../chat-widget-i18n';

type RequestState = 'idle' | 'submitting' | 'submitted' | 'failed';

interface OnlineConsultBookingCardProps {
  block: OnlineConsultBookingCardBlock;
  onSubmit?: (block: OnlineConsultBookingCardBlock) => Promise<void> | void;
  historyResourceId?: string;
  historyResourceStatus?: string;
}

export function OnlineConsultBookingCard({
  block,
  onSubmit,
  historyResourceId,
  historyResourceStatus,
}: OnlineConsultBookingCardProps) {
  const { currentLanguage } = useLanguage();
  const [requestState, setRequestState] = useState<RequestState>(
    (block.requestState === 'submitted' || block.requestState === 'failed')
      ? block.requestState
      : 'idle',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const translate = createChatWidgetTranslator(currentLanguage.code);

  const handleSubmit = async () => {
    if (requestState === 'submitting') return; // prevent double-submit
    setRequestState('submitting');
    setErrorMessage(null);
    try {
      await onSubmit?.(block);
      setRequestState('submitted');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : translate('chatWidget.consult.failed'));
      setRequestState('failed');
    }
  };

  return (
    <div
      data-block-type="ONLINE_CONSULT_BOOKING_CARD"
      data-history-resource-id={historyResourceId}
      data-history-resource-status={historyResourceStatus}
      className="max-w-[92%] rounded-[24px] border border-teal-100 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)] space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50">
          <CalendarClock className="h-4 w-4 text-teal-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-5 text-slate-900">{block.title}</div>
          {block.description && (
            <div className="mt-0.5 text-[12px] leading-5 text-slate-500">{block.description}</div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <UserRound className="h-3.5 w-3.5" />
          {translate('chatWidget.consult.draft')}
        </div>
        <dl className="mt-2 grid grid-cols-[92px_1fr] gap-x-3 gap-y-1.5 text-[12px] leading-5">
          <dt className="text-slate-500">{translate('chatWidget.consult.name')}</dt>
          <dd className="font-medium text-slate-800">{block.conversionDraft.name}</dd>
          <dt className="text-slate-500">{translate('chatWidget.consult.email')}</dt>
          <dd className="font-medium text-slate-800 break-all">{block.conversionDraft.email}</dd>
          <dt className="text-slate-500">{translate('chatWidget.consult.country')}</dt>
          <dd className="font-medium text-slate-800">{block.conversionDraft.country}</dd>
          <dt className="text-slate-500">{translate('chatWidget.consult.condition')}</dt>
          <dd className="font-medium text-slate-800">{block.conversionDraft.conditionSummary}</dd>
          <dt className="text-slate-500">{translate('chatWidget.consult.budget')}</dt>
          <dd className="font-medium text-slate-800">{block.conversionDraft.budget}</dd>
        </dl>
      </div>

      {requestState === 'idle' && (
        <Button
          type="button"
          onClick={() => { void handleSubmit(); }}
          className="mt-1 inline-flex h-9 items-center rounded-xl bg-teal-600 px-4 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          {translate('chatWidget.consult.request')}
        </Button>
      )}

      {requestState === 'submitting' && (
        <div className="text-sm text-slate-500">{translate('chatWidget.consult.submitting')}</div>
      )}

      {requestState === 'submitted' && (
        <div className="flex items-center gap-2 rounded-2xl bg-teal-50 px-3 py-2 text-sm text-teal-800">
          <CheckCircle2 className="h-4 w-4" />
          {translate('chatWidget.consult.submitted')}
        </div>
      )}

      {requestState === 'failed' && (
        <div className="space-y-2">
          <div className="rounded-2xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {errorMessage ?? translate('chatWidget.consult.failed')}
          </div>
          <Button
            type="button"
            onClick={() => { void handleSubmit(); }}
            variant="outline"
            className="inline-flex h-9 items-center rounded-xl border-teal-300 bg-white px-4 text-sm font-medium text-teal-700 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            {translate('chatWidget.consult.retry')}
          </Button>
        </div>
      )}
    </div>
  );
}

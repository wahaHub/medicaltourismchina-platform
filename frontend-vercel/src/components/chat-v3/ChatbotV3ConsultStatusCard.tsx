import { CalendarClock, MoveRight } from 'lucide-react';
import type { OnlineConsultStatusCardBlock } from '@/types/chatbot-blocks';

interface ChatbotV3ConsultStatusCardProps {
  block: OnlineConsultStatusCardBlock;
}

export function ChatbotV3ConsultStatusCard({ block }: ChatbotV3ConsultStatusCardProps) {
  return (
    <div
      data-block-type="ONLINE_CONSULT_STATUS_CARD"
      className="max-w-[92%] rounded-[24px] border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-4 shadow-[0_14px_36px_rgba(13,148,136,0.10)]"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
          <CalendarClock className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-5 text-slate-900">{block.title}</div>
          {block.description ? (
            <div className="mt-1 text-[12px] leading-5 text-slate-600">{block.description}</div>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-teal-800">
            {block.statusLabel ? (
              <span className="rounded-full bg-teal-100 px-2.5 py-1">{block.statusLabel}</span>
            ) : null}
          </div>
          {block.helperText ? (
            <div className="mt-3 inline-flex items-center gap-2 text-[12px] font-medium text-teal-700">
              <MoveRight className="h-3.5 w-3.5" />
              {block.helperText}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

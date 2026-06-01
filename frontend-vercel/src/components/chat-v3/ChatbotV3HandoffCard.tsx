import { Headset, MoveRight } from 'lucide-react';
import type { HandoffStatusCardBlock } from '@/types/chatbot-blocks';

interface ChatbotV3HandoffCardProps {
  block: HandoffStatusCardBlock;
}

export function ChatbotV3HandoffCard({ block }: ChatbotV3HandoffCardProps) {
  return (
    <div
      data-block-type="HANDOFF_STATUS_CARD"
      className="max-w-[92%] rounded-[24px] border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 shadow-[0_14px_36px_rgba(14,116,144,0.10)]"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
          <Headset className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-5 text-slate-900">{block.title}</div>
          {block.description ? (
            <div className="mt-1 text-[12px] leading-5 text-slate-600">{block.description}</div>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-sky-800">
            {block.statusLabel ? (
              <span className="rounded-full bg-sky-100 px-2.5 py-1">{block.statusLabel}</span>
            ) : null}
            {block.ticketId ? (
              <span className="rounded-full bg-white px-2.5 py-1 text-slate-600">
                Ticket {block.ticketId}
              </span>
            ) : null}
          </div>
          <div className="mt-3 inline-flex items-center gap-2 text-[12px] font-medium text-sky-700">
            <MoveRight className="h-3.5 w-3.5" />
            The care team will continue the next step.
          </div>
        </div>
      </div>
    </div>
  );
}

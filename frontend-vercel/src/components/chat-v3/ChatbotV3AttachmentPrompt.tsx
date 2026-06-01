import { useContext } from 'react';
import { FileUp, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientEntryContext } from '@/contexts/PatientEntryContext';
import type { SupportingDocumentUploadPromptBlock } from '@/types/chatbot-blocks';

interface ChatbotV3AttachmentPromptProps {
  block: SupportingDocumentUploadPromptBlock;
}

export function ChatbotV3AttachmentPrompt({ block }: ChatbotV3AttachmentPromptProps) {
  const ctx = useContext(PatientEntryContext);
  const openComposerAttachmentPicker = ctx?.openComposerAttachmentPicker;

  return (
    <div
      data-block-type="SUPPORTING_DOCUMENT_UPLOAD_PROMPT"
      className="max-w-[92%] rounded-[24px] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-[0_14px_36px_rgba(146,64,14,0.10)]"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <FileUp className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-5 text-slate-900">{block.title}</div>
          {block.description ? (
            <div className="mt-1 text-[12px] leading-5 text-slate-600">{block.description}</div>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-amber-800">
            <span className="rounded-full bg-amber-100 px-2.5 py-1">
              {block.required ? 'Required before consult' : 'Recommended for review'}
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 text-slate-600">
              Uploaded: {block.uploadedCount ?? 0}
            </span>
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-amber-300 bg-white px-3 py-2 text-[12px] text-slate-700">
            <Paperclip className="h-3.5 w-3.5 text-amber-600" />
            Upload files with the attachment button below.
          </div>
          <div className="mt-3">
            <Button
              type="button"
              size="sm"
              className="bg-amber-600 text-white hover:bg-amber-700"
              onClick={() => openComposerAttachmentPicker?.()}
            >
              Upload supporting documents
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

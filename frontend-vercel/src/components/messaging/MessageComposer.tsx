import { Loader2, SendHorizonal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSending: boolean;
  disabled?: boolean;
}

export default function MessageComposer({
  value,
  onChange,
  onSubmit,
  isSending,
  disabled = false,
}: MessageComposerProps) {
  const isBlocked = disabled || isSending;

  return (
    <div className="border-t border-slate-200 bg-white px-5 py-4">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Send a message..."
        className="min-h-[110px] resize-none"
        disabled={isBlocked}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Use Ctrl+Enter or Cmd+Enter to send.</p>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isBlocked || value.trim().length === 0}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
          {isSending ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { AlertTriangle, RefreshCcw, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { PatientSessionItem } from '@/features/patient-sessions/session-model';
import { usePatientSessionRuntime } from '@/features/patient-sessions/PatientSessionRuntimeProvider';
import { useSendPatientSessionMessage } from '@/features/patient-sessions/usePatientSessions';
import MessageComposer from './MessageComposer';

interface ConversationThreadProps {
  conversation: PatientSessionItem | null;
}

function formatMessageTimestamp(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function getSenderLabel(
  senderRole: string | null,
  senderName: string | null,
  sessionKind: PatientSessionItem['sessionKind'],
) {
  if (senderRole === 'PATIENT') {
    return 'You';
  }

  if (senderRole === 'AI') {
    return 'AI Assistant';
  }

  if (senderName?.trim()) {
    return senderName;
  }

  if (sessionKind === 'care-team') {
    return 'Care Team';
  }

  return 'Hospital Team';
}

export default function ConversationThread({ conversation }: ConversationThreadProps) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');
  const [failedDraft, setFailedDraft] = useState<{ content: string; error: string } | null>(null);
  const { detail, detailLoading, detailError, refreshActiveSession } = usePatientSessionRuntime();
  const sessionId = conversation?.id ?? null;
  const effectiveAssistantMode = conversation?.sessionKind === 'care-team' && detail?.sessionId === sessionId
    ? (detail.chatAuthority ?? conversation.assistantMode)
    : (conversation?.assistantMode ?? null);
  const isCareTeamAiActive = conversation?.sessionKind === 'care-team' && effectiveAssistantMode === 'AI_ACTIVE';
  const sendMutation = useSendPatientSessionMessage(sessionId);
  const messages = useMemo(
    () => detail?.sessionId === sessionId ? detail.data : [],
    [detail?.sessionId, detail?.data, sessionId],
  );

  const handleSend = async (content = draft.trim()) => {
    if (!sessionId || !content) {
      return;
    }
    if (isCareTeamAiActive) {
      return;
    }

    try {
      await sendMutation.mutateAsync({ content });
      await refreshActiveSession();
      setDraft('');
      setFailedDraft(null);
    } catch (error) {
      const nextError = error instanceof Error ? error.message : 'Failed to send message';
      setFailedDraft({ content, error: nextError });
      toast({
        title: 'Message failed',
        description: nextError,
        variant: 'destructive',
      });
    }
  };

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="max-w-sm rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
          Select a conversation to continue messaging.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0 flex-col bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-slate-900">{conversation.displayTitle}</div>
            <div className="mt-1 text-sm text-slate-500">
              {conversation.sessionKind === 'care-team'
                ? 'Coordinate next steps with Medora AI and the Medora care team.'
                : 'Discuss case updates directly with this hospital.'}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/packages')}>
              <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
              Browse Packages
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard?tab=orders')}>
              View Orders
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-slate-50/70">
        <div className="space-y-4 px-6 py-5">
          {detailLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
              Loading messages...
            </div>
          ) : detailError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
              {detailError}
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
              No messages yet. Start the conversation below.
            </div>
          ) : (
            messages.map((message) => {
              const isPatient = message.senderRole === 'PATIENT';
              const isAi = message.senderRole === 'AI';
              const isSystem = message.senderRole === 'SYSTEM' || message.messageType === 'SYSTEM';

              return (
                <div
                  key={message.id}
                  className={cn(
                    'max-w-[80%] rounded-3xl px-4 py-3 shadow-sm',
                    isPatient
                      ? 'ml-auto bg-teal-600 text-white'
                      : isSystem
                        ? 'mr-auto border border-amber-200 bg-amber-50 text-amber-900'
                        : isAi
                          ? 'mr-auto border border-indigo-200 bg-indigo-50 text-indigo-950'
                          : 'mr-auto border border-slate-200 bg-white text-slate-800',
                  )}
                >
                  <div className={cn(
                    'text-xs font-medium',
                    isPatient ? 'text-teal-50/90' : 'text-slate-500',
                  )}
                  >
                    {getSenderLabel(message.senderRole, message.senderName, conversation.sessionKind)}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap text-sm leading-6">
                    {message.content}
                  </div>
                  {message.attachments && message.attachments.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((attachment) => (
                        attachment.url ? (
                          <a
                            key={`${message.id}:${attachment.storageKey}`}
                            href={attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                              'block rounded-2xl border px-3 py-2 text-xs',
                              isPatient
                                ? 'border-white/20 bg-white/10 text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-700',
                            )}
                          >
                            {attachment.fileName}
                          </a>
                        ) : null
                      ))}
                    </div>
                  ) : null}
                  <div className={cn(
                    'mt-2 text-[11px]',
                    isPatient ? 'text-teal-50/80' : 'text-slate-400',
                  )}
                  >
                    {formatMessageTimestamp(message.createdAt)}
                  </div>
                </div>
              );
            })
          )}

          {failedDraft ? (
            <div className="flex max-w-[80%] items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  Failed to send last message
                </div>
                <div className="mt-1 truncate text-xs text-amber-700">{failedDraft.error}</div>
              </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 border-amber-300 bg-white text-amber-800 hover:bg-amber-100"
                  onClick={() => void handleSend(failedDraft.content)}
                  disabled={sendMutation.isPending}
                >
                  <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
                  Retry
              </Button>
            </div>
          ) : null}

          {isCareTeamAiActive ? (
            <div className="max-w-[80%] rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 shadow-sm">
              Medora AI is still active in the main care-team session. Continue the conversation from the patient chat widget until a human takes over.
            </div>
          ) : null}
        </div>
      </ScrollArea>

      <MessageComposer
        value={draft}
        onChange={setDraft}
        onSubmit={() => void handleSend()}
        isSending={sendMutation.isPending}
        disabled={isCareTeamAiActive}
      />
    </div>
  );
}

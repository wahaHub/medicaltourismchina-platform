import { MessageSquareMore } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import type { PatientSessionItem } from '@/features/patient-sessions/session-model';

interface ConversationListProps {
  conversations: PatientSessionItem[];
  activeConversationId: string | null;
  isLoading: boolean;
  errorMessage: string | null;
  onSelectConversation: (conversationId: string) => void;
  variant?: 'sidebar' | 'switcher';
}

function formatPreviewTimestamp(value: string | null, locale: string, noMessagesLabel: string) {
  if (!value) {
    return noMessagesLabel;
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function ConversationList({
  conversations,
  activeConversationId,
  isLoading,
  errorMessage,
  onSelectConversation,
  variant = 'sidebar',
}: ConversationListProps) {
  const { currentLanguage, t } = useLanguage();
  const translateSessionTitle = (title: string) => {
    if (title === 'Medora Care Team') {
      return t('patientConversations.medoraCareTeam');
    }

    if (title === 'Hospital Conversation') {
      return t('patientConversations.hospitalConversation');
    }

    return title;
  };

  if (variant === 'switcher') {
    const orderedConversations = conversations
      .map((conversation, index) => ({ conversation, index }))
      .sort((left, right) => {
        if (left.conversation.sessionKind !== right.conversation.sessionKind) {
          return left.conversation.sessionKind === 'care-team' ? -1 : 1;
        }

        return left.index - right.index;
      })
      .map(({ conversation }) => conversation);
    const hasHospitalConversation = orderedConversations.some((conversation) => conversation.sessionKind === 'hospital');
    const shouldPeekAdditionalSessions = orderedConversations.length >= 3;

    if (!hasHospitalConversation) {
      return null;
    }

    return (
      <div
        data-testid="compact-session-switcher"
        className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          data-testid="compact-session-switcher-rail"
          className="grid grid-flow-col gap-2"
          style={shouldPeekAdditionalSessions
            ? { gridAutoColumns: 'calc((100% - 1rem) / 2.25)' }
            : { gridAutoColumns: 'minmax(0, 1fr)' }}
        >
          {orderedConversations.map((conversation) => {
          const isActive = conversation.id === activeConversationId;

          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelectConversation(conversation.id)}
              className={cn(
                'flex h-10 min-w-0 shrink-0 items-center gap-2 rounded-2xl border px-3 text-left text-xs font-medium shadow-sm transition-colors',
                isActive
                  ? 'border-teal-300 bg-teal-50 text-teal-900 shadow-teal-100'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <span
                className={cn(
                  'inline-flex h-5 shrink-0 items-center rounded-md px-1.5 text-[9px] font-semibold uppercase tracking-[0.12em]',
                  conversation.sessionKind === 'hospital'
                    ? 'bg-cyan-100 text-cyan-700'
                    : 'bg-teal-100 text-teal-700',
                )}
              >
                {conversation.sessionKind === 'hospital' ? 'H' : 'CT'}
              </span>
              <span className="truncate text-sm font-semibold leading-5">
                {translateSessionTitle(conversation.displayTitle)}
              </span>
            </button>
          );
          })}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="sidebar-session-list" className="flex h-full flex-col border-r border-slate-200 bg-slate-50/80">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="text-sm font-semibold text-slate-900">{t('patientConversations.title')}</div>
        <div className="mt-1 text-xs text-slate-500">
          {t('patientConversations.subtitle')}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
              {t('patientConversations.loading')}
            </div>
          ) : errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : conversations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
              {t('patientConversations.empty')}
            </div>
          ) : (
            conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    'flex w-full flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition-colors',
                    isActive
                      ? 'border-teal-300 bg-white shadow-sm'
                      : 'border-transparent bg-white/70 hover:border-slate-200 hover:bg-white',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {translateSessionTitle(conversation.displayTitle)}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]',
                            conversation.sessionKind === 'care-team'
                              ? 'bg-teal-100 text-teal-700'
                              : 'bg-cyan-100 text-cyan-700',
                          )}
                        >
                          {conversation.sessionKind === 'care-team'
                            ? t('patientConversations.careTeam')
                            : t('patientConversations.hospital')}
                        </Badge>
                      </div>
                    </div>
                    <div className="shrink-0 text-[11px] text-slate-400">
                      {formatPreviewTimestamp(
                        conversation.lastMessageAt,
                        currentLanguage.code,
                        t('patientConversations.noMessages'),
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                    <MessageSquareMore className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-2">
                      {conversation.lastMessagePreview || t('patientConversations.readyPreview')}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

import { AlertCircle, MessageSquareMore } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientSessionRuntime } from '@/features/patient-sessions/PatientSessionRuntimeProvider';
import ConversationList from '@/components/messaging/ConversationList';
import ConversationThread from '@/components/messaging/ConversationThread';

export default function MessagesPage() {
  const { t } = useLanguage();
  const {
    sessions,
    sessionsLoading,
    sessionsError,
    activeSession,
    activeSessionId,
    setActiveSessionId,
  } = usePatientSessionRuntime();

  if (sessionsLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="px-6 py-8 text-sm text-slate-500">
          {t('dashboard.messages.loading')}
        </CardContent>
      </Card>
    );
  }

  if (sessionsError) {
    return (
      <Card className="border border-rose-200 bg-rose-50 shadow-none">
        <CardHeader>
          <CardTitle className="text-rose-900">{t('dashboard.messages.unavailableTitle')}</CardTitle>
          <CardDescription className="text-rose-700">
            {sessionsError}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageSquareMore className="h-5 w-5 text-teal-600" />
            {t('dashboard.messages.emptyTitle')}
          </CardTitle>
          <CardDescription>
            {t('dashboard.messages.emptyDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
          {t('dashboard.messages.emptyHistory')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid min-h-[calc(100vh-2.5rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10 lg:grid-cols-[340px_1fr]">
      <ConversationList
        conversations={sessions}
        activeConversationId={activeSessionId}
        isLoading={false}
        errorMessage={null}
        onSelectConversation={setActiveSessionId}
        variant="sidebar"
      />
      <div className="min-w-0">
        {activeSession ? (
          <ConversationThread key={activeSession.id} conversation={activeSession} />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-50">
            <div className="max-w-sm rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-sm text-slate-500">
              <AlertCircle className="mx-auto h-8 w-8 text-teal-600" />
              <div className="mt-4 font-medium text-slate-900">{t('dashboard.messages.selectTitle')}</div>
              <div className="mt-2 leading-6">{t('dashboard.messages.selectDesc')}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

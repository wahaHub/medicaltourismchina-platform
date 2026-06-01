import { useEffect } from 'react';
import { LifeBuoy, MessageSquareMore } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { usePatientSessionRuntime } from '@/features/patient-sessions/PatientSessionRuntimeProvider';
import ConversationList from './ConversationList';
import ConversationThread from './ConversationThread';

export default function PatientMessagePanel() {
  const location = useLocation();
  const { patient, isAuthenticated } = usePatientAuth();
  const {
    phase,
    isPanelOpen,
    closePanel,
  } = usePatientEntry();
  const {
    sessions,
    sessionsLoading,
    sessionsError,
    activeSessionId,
    activeSession,
    setActiveSessionId,
  } = usePatientSessionRuntime();
  const canShowFormalMessages = phase === 'select-hospitals' || phase === 'messages-ready';
  const isHiddenRoute = (
    location.pathname === '/login'
    || location.pathname === '/patient-login'
    || location.pathname === '/auth'
    || location.pathname === '/auth/callback'
    || location.pathname === '/hospital'
    || location.pathname.startsWith('/hospital/')
    || location.pathname === '/dashboard/case-intake'
    || location.pathname === '/medical-case-intake'
    || location.pathname.startsWith('/case-intake/')
  );
  useEffect(() => {
    if (isHiddenRoute || !isAuthenticated) {
      closePanel();
    }
  }, [closePanel, isAuthenticated, isHiddenRoute]);

  if (isHiddenRoute || !isAuthenticated) {
    return null;
  }

  return (
    <Sheet open={isPanelOpen} onOpenChange={(open) => { if (!open) closePanel(); }}>
      <SheetContent
        side="right"
        className="w-[min(1100px,calc(100vw-24px))] max-w-none p-0 sm:max-w-none"
      >
          <SheetHeader className="border-b border-slate-200 px-6 py-5">
          <SheetTitle className="pr-10 text-2xl">Patient Messages</SheetTitle>
          <SheetDescription>
            Formal patient conversations for this CRM case. Switch between hospital and care-team sessions at any time.
          </SheetDescription>
        </SheetHeader>

        {!canShowFormalMessages ? (
          <div className="flex h-[calc(100vh-104px)] items-center justify-center bg-slate-50 px-6">
            <div className="max-w-md rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center">
              <LifeBuoy className="mx-auto h-10 w-10 text-teal-600" />
              <div className="mt-4 text-lg font-semibold text-slate-900">Complete patient setup first</div>
              <div className="mt-2 text-sm leading-6 text-slate-500">
                Finish the widget flow so the admin and hospital conversations can be created for this patient.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-[calc(100vh-104px)] min-h-0 bg-white">
            <div className="flex w-[340px] min-w-[300px] flex-col">
              <ConversationList
                conversations={sessions}
                activeConversationId={activeSessionId}
                isLoading={sessionsLoading}
                errorMessage={sessionsError}
                onSelectConversation={setActiveSessionId}
                variant="sidebar"
              />
            </div>

            <div className="min-w-0 flex-1">
              {activeSessionId ? (
                <ConversationThread
                  key={activeSessionId}
                  conversation={activeSession}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-50">
                  <div className="max-w-sm rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-sm text-slate-500">
                    <MessageSquareMore className="mx-auto h-8 w-8 text-teal-600" />
                    <div className="mt-4 font-medium text-slate-900">No active conversation</div>
                    <div className="mt-2 leading-6">
                      Once conversations are available, choose the session you want to continue here.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

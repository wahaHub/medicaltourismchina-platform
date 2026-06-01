import { AlertTriangle, MessageCircleMore, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { Button } from '@/components/ui/button';
import PatientDashboardShell from '@/components/dashboard/PatientDashboardShell';
import { resolvePatientDashboardViewState } from './patient-dashboard-entry.helpers';
import { createChatWidgetTranslator } from '@/components/chat/chat-widget-i18n';

interface PatientDashboardEntryProps {
  hasDashboardToken: boolean;
}

export default function PatientDashboardEntry({ hasDashboardToken }: PatientDashboardEntryProps) {
  const { currentLanguage } = useLanguage();
  const { patient } = usePatientAuth();
  const { phase, bootstrapError, openWidget } = usePatientEntry();
  const translate = createChatWidgetTranslator(currentLanguage.code);

  const viewState = resolvePatientDashboardViewState({
    hasDashboardToken,
    phase,
    patientNextStep: patient?.nextStep,
  });

  if (viewState === 'dashboard') {
    return <PatientDashboardShell />;
  }

  if (viewState === 'bootstrap-error') {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="rounded-3xl border border-rose-200 bg-white p-8 shadow-xl shadow-rose-950/5">
            <div className="flex items-center gap-2 text-sm font-medium text-rose-700">
              <AlertTriangle className="h-4 w-4" />
              {translate('dashboard.patientEntry.attention')}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              {translate('dashboard.patientEntry.restoreTitle')}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {bootstrapError ?? translate('dashboard.patientEntry.restoreFallback')}
            </p>
            <div className="mt-6">
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={openWidget}>
                <MessageCircleMore className="mr-2 h-4 w-4" />
                {translate('dashboard.patientEntry.openWidget')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="rounded-3xl bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-700 p-8 text-white shadow-xl shadow-teal-950/15">
          <div className="flex flex-wrap items-center gap-3 text-sm/6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
              <Sparkles className="h-4 w-4" />
              {translate('dashboard.patientEntry.restoring')}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
              <ShieldCheck className="h-4 w-4" />
              {translate('dashboard.patientEntry.syncing')}
            </span>
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            {translate('dashboard.patientEntry.welcomeBack', { name: patient?.name ? `, ${patient.name}` : '' })}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-cyan-50">
            {translate('dashboard.patientEntry.sessionActive')}
          </p>
        </div>
      </div>
    </div>
  );
}

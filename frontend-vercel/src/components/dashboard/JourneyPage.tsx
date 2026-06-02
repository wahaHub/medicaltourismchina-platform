import { useMemo } from 'react';
import { Clock3, Route } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientCases, usePatientJourney, usePatientJourneyMilestones } from '@/hooks/usePatientPhase2';
import { formatDateOnly, renderStructuredValue, sortMilestones } from '@/lib/patient-phase2';

export default function JourneyPage() {
  const { currentLanguage, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const casesQuery = usePatientCases();
  const selectedCaseId = searchParams.get('caseId') || casesQuery.data?.[0]?.id || null;
  const journeyQuery = usePatientJourney(selectedCaseId);
  const milestonesQuery = usePatientJourneyMilestones(selectedCaseId);

  const milestones = useMemo(
    () => sortMilestones(milestonesQuery.data ?? []),
    [milestonesQuery.data],
  );

  const handleSelectCase = (caseId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('caseId', caseId);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold text-slate-900">{t('dashboard.journey.title')}</div>
          <div className="text-sm text-slate-500">
            {t('dashboard.journey.subtitle')}
          </div>
        </div>
        {casesQuery.isLoading ? (
          <div className="text-sm text-slate-500">{t('dashboard.journey.loadingCases')}</div>
        ) : casesQuery.error ? (
          <div className="text-sm text-rose-700">
            {casesQuery.error instanceof Error ? casesQuery.error.message : t('dashboard.journey.casesFailed')}
          </div>
        ) : (
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedCaseId ?? ''}
            onChange={(event) => handleSelectCase(event.target.value)}
          >
            {(casesQuery.data ?? []).map((caseItem) => (
              <option key={caseItem.id} value={caseItem.id}>
                {caseItem.caseNumber}
              </option>
            ))}
          </select>
        )}
      </div>

      {casesQuery.error ? (
        <Card className="border border-rose-200 bg-rose-50 shadow-none">
          <CardContent className="px-6 py-6 text-sm text-rose-700">
            {casesQuery.error instanceof Error ? casesQuery.error.message : t('dashboard.journey.patientCasesFailed')}
          </CardContent>
        </Card>
      ) : casesQuery.isLoading ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="px-6 py-6 text-sm text-slate-500">{t('dashboard.journey.loadingPatientCases')}</CardContent>
        </Card>
      ) : !(casesQuery.data?.length) ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="px-6 py-6 text-sm text-slate-500">{t('dashboard.journey.noCases')}</CardContent>
        </Card>
      ) : (
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Route className="h-5 w-5 text-teal-600" />
              {t('dashboard.journey.overviewTitle')}
            </CardTitle>
            <CardDescription>{t('dashboard.journey.overviewDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {journeyQuery.isLoading ? (
              <div className="text-sm text-slate-500">{t('dashboard.journey.loadingJourney')}</div>
            ) : journeyQuery.error ? (
              <div className="text-sm text-rose-700">
                {journeyQuery.error instanceof Error ? journeyQuery.error.message : t('dashboard.journey.journeyFailed')}
              </div>
            ) : !journeyQuery.data ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 sm:col-span-2">
                {t('dashboard.journey.noOverview')}
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{t('dashboard.journey.visa')}</div>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {renderStructuredValue(journeyQuery.data.visa, t)}
                  </pre>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{t('dashboard.journey.insurance')}</div>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {renderStructuredValue(journeyQuery.data.insurance, t)}
                  </pre>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{t('dashboard.journey.accommodation')}</div>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {renderStructuredValue(journeyQuery.data.accommodation, t)}
                  </pre>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{t('dashboard.journey.transportation')}</div>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {renderStructuredValue(journeyQuery.data.transportation, t)}
                  </pre>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4 sm:col-span-2">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{t('dashboard.journey.postCare')}</div>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                    {renderStructuredValue(journeyQuery.data.postCare, t)}
                  </pre>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock3 className="h-5 w-5 text-teal-600" />
              {t('dashboard.journey.milestonesTitle')}
            </CardTitle>
            <CardDescription>{t('dashboard.journey.milestonesDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {milestonesQuery.isLoading ? (
              <div className="text-sm text-slate-500">{t('dashboard.journey.loadingMilestones')}</div>
            ) : milestonesQuery.error ? (
              <div className="text-sm text-rose-700">
                {milestonesQuery.error instanceof Error ? milestonesQuery.error.message : t('dashboard.journey.milestonesFailed')}
              </div>
            ) : milestones.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                {t('dashboard.journey.noMilestones')}
              </div>
            ) : (
              milestones.map((milestone) => (
                <div key={milestone.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-900">{milestone.eventType}</div>
                    <Badge variant="outline">{formatDateOnly(milestone.eventDate, currentLanguage.code, t)}</Badge>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    {milestone.note || t('dashboard.journey.noMilestoneNote')}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  );
}

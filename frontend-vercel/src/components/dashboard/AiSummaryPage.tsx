import { Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePatientAiSummary, usePatientCases } from '@/hooks/usePatientPhase2';
import { formatDateTime } from '@/lib/patient-phase2';

function statusTone(status: 'EMPTY' | 'PENDING' | 'READY' | 'FAILED') {
  switch (status) {
    case 'READY':
      return 'bg-emerald-100 text-emerald-800';
    case 'PENDING':
      return 'bg-amber-100 text-amber-800';
    case 'FAILED':
      return 'bg-rose-100 text-rose-800';
    case 'EMPTY':
      return 'bg-slate-100 text-slate-700';
  }
}

export default function AiSummaryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const casesQuery = usePatientCases();
  const selectedCaseId = searchParams.get('caseId') || casesQuery.data?.[0]?.id || null;
  const aiSummaryQuery = usePatientAiSummary(selectedCaseId);

  const handleSelectCase = (caseId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('caseId', caseId);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold text-slate-900">AI Summary</div>
          <div className="text-sm text-slate-500">
            Case-level summary generated in CRM v2 and published read-only for patients.
          </div>
        </div>
        {casesQuery.isLoading ? (
          <div className="text-sm text-slate-500">Loading cases...</div>
        ) : casesQuery.error ? (
          <div className="text-sm text-rose-700">
            {casesQuery.error instanceof Error ? casesQuery.error.message : 'Failed to load cases.'}
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
            {casesQuery.error instanceof Error ? casesQuery.error.message : 'Failed to load patient cases.'}
          </CardContent>
        </Card>
      ) : casesQuery.isLoading ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="px-6 py-6 text-sm text-slate-500">Loading patient cases...</CardContent>
        </Card>
      ) : !(casesQuery.data?.length) ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="px-6 py-6 text-sm text-slate-500">No patient cases are available yet.</CardContent>
        </Card>
      ) : (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-5 w-5 text-teal-600" />
            Case summary
          </CardTitle>
          <CardDescription>
            AI-generated context is read-only here. Case-specific updates continue to come from your care team and journey tabs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aiSummaryQuery.isLoading ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Loading AI summary...
            </div>
          ) : aiSummaryQuery.error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
              {aiSummaryQuery.error instanceof Error ? aiSummaryQuery.error.message : 'Failed to load AI summary.'}
            </div>
          ) : aiSummaryQuery.data ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className={statusTone(aiSummaryQuery.data.status)}>
                  {aiSummaryQuery.data.status}
                </Badge>
                <div className="text-xs text-slate-500">
                  Updated {formatDateTime(aiSummaryQuery.data.updatedAt)}
                </div>
              </div>
              {aiSummaryQuery.data.status === 'READY' && aiSummaryQuery.data.summary ? (
                <div className="rounded-3xl bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-700">
                  {aiSummaryQuery.data.summary}
                </div>
              ) : aiSummaryQuery.data.status === 'PENDING' ? (
                <div className="rounded-3xl bg-amber-50 px-5 py-5 text-sm leading-7 text-amber-800">
                  The AI summary is still being prepared for this case.
                </div>
              ) : aiSummaryQuery.data.status === 'FAILED' ? (
                <div className="rounded-3xl bg-rose-50 px-5 py-5 text-sm leading-7 text-rose-700">
                  AI summary generation failed for this case. The care team can continue supporting you through messages and journey updates.
                </div>
              ) : (
                <div className="rounded-3xl bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-600">
                  No AI summary has been published for this case yet.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
              No AI summary is available for this case.
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}

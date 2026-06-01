import { useMemo } from 'react';
import { AlertCircle, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAcceptPatientDashboardQuote, usePatientDashboardQuotes, useRejectPatientDashboardQuote } from '@/hooks/usePatientDashboard';

function formatCurrency(amount: string, currency: string) {
  const numeric = Number(amount);
  if (Number.isFinite(numeric)) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(numeric);
  }

  return `${amount} ${currency}`;
}

function statusTone(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-800';
    case 'ACCEPTED':
      return 'bg-emerald-100 text-emerald-800';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-800';
    case 'EXPIRED':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export default function QuotesPage() {
  const { data, isLoading, error } = usePatientDashboardQuotes();
  const acceptMutation = useAcceptPatientDashboardQuote();
  const rejectMutation = useRejectPatientDashboardQuote();

  const totalQuotes = useMemo(
    () => data?.reduce((sum, group) => sum + group.quotes.length, 0) ?? 0,
    [data],
  );

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="px-6 py-8 text-sm text-slate-500">
          Loading quotes...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-rose-200 bg-rose-50 shadow-none">
        <CardHeader>
          <CardTitle className="text-rose-900">Quotes unavailable</CardTitle>
          <CardDescription className="text-rose-700">
            {error instanceof Error ? error.message : 'Failed to load quotes.'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-5 w-5 text-teal-600" />
            No quotes yet
          </CardTitle>
          <CardDescription>
            Quotes will appear here after the widget finishes onboarding and the care team responds in messages.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold text-slate-900">Quotes</div>
          <div className="text-sm text-slate-500">
            {totalQuotes} quote{totalQuotes === 1 ? '' : 's'} across {data.length} case{data.length === 1 ? '' : 's'}.
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((group) => (
          <Card key={group.caseId} className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
                Case {group.caseNumber}
                <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                  {group.pendingQuoteCount} pending
                </Badge>
              </CardTitle>
              <CardDescription>
                {group.caseSummary || 'No case summary available yet.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.quotes.map((quote, index) => {
                const isPrimary = index === 0;
                const canAct = quote.status === 'PENDING' && !quote.isDraft;

                return (
                  <div
                    key={quote.id}
                    className={`rounded-2xl border px-4 py-4 ${isPrimary ? 'border-teal-200 bg-teal-50/40' : 'border-slate-200 bg-white'}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {quote.hospitalName || 'Hospital quote'}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Quote {quote.quoteNumber} · version {quote.version}
                        </div>
                      </div>
                      <Badge variant="secondary" className={statusTone(quote.status)}>
                        {quote.status}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Total</div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">
                          {formatCurrency(quote.totalAmount, quote.currency)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Valid until</div>
                        <div className="mt-1 text-sm text-slate-700">
                          {new Date(quote.validUntil).toLocaleDateString('en-US')}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Treatment plan</div>
                        <div className="mt-1 text-sm leading-6 text-slate-700">
                          {quote.treatmentPlan || 'No treatment plan was provided.'}
                        </div>
                      </div>
                      {quote.notes ? (
                        <div className="sm:col-span-2">
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Notes</div>
                          <div className="mt-1 text-sm leading-6 text-slate-700">{quote.notes}</div>
                        </div>
                      ) : null}
                    </div>

                    {canAct ? (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => void acceptMutation.mutate({ caseId: group.caseId, quoteId: quote.id })}
                          disabled={acceptMutation.isPending || rejectMutation.isPending}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => void rejectMutation.mutate({ caseId: group.caseId, quoteId: quote.id })}
                          disabled={acceptMutation.isPending || rejectMutation.isPending}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-4 text-xs text-slate-500">
                        {quote.isDraft ? 'Draft quote, not ready for action.' : 'Action is not available for this quote status.'}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

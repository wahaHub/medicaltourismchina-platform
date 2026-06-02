import { useEffect, useMemo, useState } from 'react';
import { Link2, LifeBuoy, Send, TicketPlus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useCreatePatientTicket,
  usePatientCases,
  usePatientTicket,
  usePatientTickets,
  useReplyToPatientTicket,
} from '@/hooks/usePatientPhase2';
import {
  formatDateTime,
  ticketPriorityTone,
  ticketStatusLabel,
  ticketStatusTone,
  ticketTypeLabel,
} from '@/lib/patient-phase2';
import type {
  PatientTicketPriority,
  PatientTicketType,
} from '@/types/patient-phase2';

const TICKET_TYPES: PatientTicketType[] = [
  'GENERAL_SUPPORT',
  'MEDICAL_QUESTION',
  'QUOTE_PRICING',
  'PACKAGE_ORDER',
  'PAYMENT_REFUND',
  'TRAVEL_JOURNEY',
  'ACCOUNT_TECHNICAL',
];

const PRIORITIES: PatientTicketPriority[] = ['HIGH', 'MEDIUM', 'LOW'];

type TicketDraft = {
  caseId: string;
  type: PatientTicketType;
  priority: PatientTicketPriority;
  subject: string;
  description: string;
};

function createEmptyDraft(): TicketDraft {
  return {
    caseId: '',
    type: 'GENERAL_SUPPORT',
    priority: 'MEDIUM',
    subject: '',
    description: '',
  };
}

export default function TicketsPage() {
  const { currentLanguage, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const composeMode = searchParams.get('compose') === '1';
  const selectedTicketId = searchParams.get('ticketId');
  const [page, setPage] = useState(1);
  const ticketsQuery = usePatientTickets({ page, limit: 20 });
  const casesQuery = usePatientCases();
  const ticketDetailQuery = usePatientTicket(selectedTicketId);
  const createTicketMutation = useCreatePatientTicket();
  const replyMutation = useReplyToPatientTicket();
  const [draft, setDraft] = useState<TicketDraft>(createEmptyDraft);
  const [replyBody, setReplyBody] = useState('');
  const [didAutofillCaseForCompose, setDidAutofillCaseForCompose] = useState(false);

  const tickets = ticketsQuery.data?.data ?? [];
  const selectedTicket = ticketDetailQuery.data?.ticket ?? null;
  const ticketReplies = ticketDetailQuery.data?.replies ?? [];
  const totalPages = Math.max(1, Math.ceil((ticketsQuery.data?.total ?? 0) / (ticketsQuery.data?.limit ?? 20)));

  useEffect(() => {
    if (!selectedTicketId && tickets[0]?.id) {
      const next = new URLSearchParams(searchParams);
      next.set('ticketId', tickets[0].id);
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, selectedTicketId, setSearchParams, tickets]);

  useEffect(() => {
    if (!composeMode) {
      setDidAutofillCaseForCompose(false);
      return;
    }

    if (!didAutofillCaseForCompose && casesQuery.data?.length && !draft.caseId) {
      setDraft((current) => ({
        ...current,
        caseId: current.caseId || casesQuery.data?.[0]?.id || '',
      }));
      setDidAutofillCaseForCompose(true);
    }
  }, [casesQuery.data, composeMode, didAutofillCaseForCompose, draft.caseId]);

  const activeTicket = useMemo(() => {
    if (selectedTicket) {
      return selectedTicket;
    }

    return tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;
  }, [selectedTicket, selectedTicketId, tickets]);

  const handleSelectTicket = (ticketId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('ticketId', ticketId);
    next.delete('compose');
    setSearchParams(next, { replace: true });
  };

  const handleOpenCompose = () => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'tickets');
    next.set('compose', '1');
    setDraft(createEmptyDraft());
    setDidAutofillCaseForCompose(false);
    setSearchParams(next, { replace: true });
  };

  const handleCloseCompose = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('compose');
    setDidAutofillCaseForCompose(false);
    setSearchParams(next, { replace: true });
  };

  const handleCreateTicket = async () => {
    const created = await createTicketMutation.mutateAsync({
      caseId: draft.caseId || undefined,
      type: draft.type,
      priority: draft.priority,
      subject: draft.subject.trim() || undefined,
      description: draft.description.trim(),
      sourcePage: '/dashboard',
    });

    setDraft(createEmptyDraft());
    setDidAutofillCaseForCompose(false);
    const next = new URLSearchParams(searchParams);
    next.set('ticketId', created.id);
    next.delete('compose');
    setSearchParams(next, { replace: true });
  };

  const handleSendReply = async () => {
    if (!activeTicket || !replyBody.trim()) {
      return;
    }

    await replyMutation.mutateAsync({
      ticketId: activeTicket.id,
      content: replyBody.trim(),
    });
    setReplyBody('');
  };

  return (
    <div className="flex min-h-[calc(100vh-2.5rem)] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold text-slate-900">{t('dashboard.tickets.title')}</div>
          <div className="text-sm text-slate-500">
            {t('dashboard.tickets.subtitle')}
          </div>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleOpenCompose}>
          <TicketPlus className="mr-2 h-4 w-4" />
          {t('dashboard.tickets.create')}
        </Button>
      </div>

      {composeMode ? (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-teal-600" />
              {t('dashboard.tickets.newTitle')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.tickets.newDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ticket-case">{t('dashboard.tickets.linkedCase')}</Label>
                <select
                  id="ticket-case"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={draft.caseId}
                  onChange={(event) => setDraft((current) => ({ ...current, caseId: event.target.value }))}
                >
                  <option value="">{t('dashboard.tickets.noLinkedCase')}</option>
                  {(casesQuery.data ?? []).map((caseItem) => (
                    <option key={caseItem.id} value={caseItem.id}>
                      {caseItem.caseNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-type">{t('dashboard.tickets.type')}</Label>
                <select
                  id="ticket-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={draft.type}
                  onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as PatientTicketType }))}
                >
                  {TICKET_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {ticketTypeLabel(type, t)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-priority">{t('dashboard.tickets.priority')}</Label>
                <select
                  id="ticket-priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={draft.priority}
                  onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value as PatientTicketPriority }))}
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {t(`dashboard.ticketPriority.${priority}` as any)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-subject">{t('dashboard.tickets.subject')}</Label>
                <Input
                  id="ticket-subject"
                  value={draft.subject}
                  onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))}
                  placeholder={t('dashboard.tickets.subjectPlaceholder')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-description">{t('dashboard.tickets.description')}</Label>
              <Textarea
                id="ticket-description"
                rows={6}
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                placeholder={t('dashboard.tickets.descriptionPlaceholder')}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => void handleCreateTicket()}
                disabled={createTicketMutation.isPending || !draft.description.trim()}
              >
                {createTicketMutation.isPending ? t('dashboard.tickets.creating') : t('dashboard.tickets.create')}
              </Button>
              <Button variant="outline" onClick={handleCloseCompose}>
                {t('dashboard.tickets.cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10 lg:grid-cols-[340px_1fr]">
        <div className="flex min-h-0 flex-col border-r border-slate-200 bg-slate-50/70">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">{t('dashboard.tickets.mine')}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {t('dashboard.tickets.totalSummary', {
                    count: ticketsQuery.data?.total ?? 0,
                    ticketLabel: t((ticketsQuery.data?.total ?? 0) === 1 ? 'dashboard.tickets.ticketSingular' : 'dashboard.tickets.ticketPlural'),
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                  {t('dashboard.common.prev')}
                </Button>
                <span className="text-xs text-slate-500">{t('dashboard.common.pageCount', { page, totalPages })}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
                  {t('dashboard.common.next')}
                </Button>
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-3 p-4">
              {ticketsQuery.isLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
                  {t('dashboard.tickets.loading')}
                </div>
              ) : ticketsQuery.error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                  {ticketsQuery.error instanceof Error ? ticketsQuery.error.message : t('dashboard.tickets.loadFailed')}
                </div>
              ) : tickets.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
                  {t('dashboard.tickets.empty')}
                </div>
              ) : (
                tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    className={`flex w-full flex-col gap-3 rounded-2xl border px-4 py-4 text-left transition-colors ${
                      ticket.id === activeTicket?.id
                        ? 'border-teal-300 bg-white shadow-sm'
                        : 'border-transparent bg-white/70 hover:border-slate-200 hover:bg-white'
                    }`}
                    onClick={() => handleSelectTicket(ticket.id)}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {ticket.subject || ticketTypeLabel(ticket.type, t)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{ticket.ticketNumber}</div>
                      </div>
                      <Badge variant="secondary" className={ticketStatusTone(ticket.status)}>
                        {ticketStatusLabel(ticket.status, t)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className={ticketPriorityTone(ticket.priority)}>
                        {t(`dashboard.ticketPriority.${ticket.priority}` as any)}
                      </Badge>
                      <Badge variant="outline">{ticketTypeLabel(ticket.type, t)}</Badge>
                    </div>
                    <div className="text-xs text-slate-500">
                      {t('dashboard.tickets.updated', { date: formatDateTime(ticket.updatedAt, currentLanguage.code, t) })}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="min-w-0 bg-white">
          {!activeTicket ? (
            <div className="flex h-full items-center justify-center bg-slate-50">
              <div className="max-w-sm rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-sm text-slate-500">
                {t('dashboard.tickets.choose')}
              </div>
            </div>
          ) : ticketDetailQuery.isLoading ? (
            <div className="p-6 text-sm text-slate-500">{t('dashboard.tickets.detailLoading')}</div>
          ) : ticketDetailQuery.error ? (
            <div className="p-6 text-sm text-rose-700">
              {ticketDetailQuery.error instanceof Error ? ticketDetailQuery.error.message : t('dashboard.tickets.detailFailed')}
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xl font-semibold text-slate-900">
                    {activeTicket.subject || ticketTypeLabel(activeTicket.type, t)}
                  </div>
                  <Badge variant="secondary" className={ticketStatusTone(activeTicket.status)}>
                    {ticketStatusLabel(activeTicket.status, t)}
                  </Badge>
                  <Badge variant="outline">{ticketTypeLabel(activeTicket.type, t)}</Badge>
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  {t('dashboard.tickets.lastUpdated', {
                    ticketNumber: activeTicket.ticketNumber,
                    date: formatDateTime(activeTicket.updatedAt, currentLanguage.code, t),
                  })}
                </div>
                {activeTicket.caseId ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    <Link2 className="h-3.5 w-3.5" />
                    {t('dashboard.tickets.linkedCaseValue', { caseId: activeTicket.caseId })}
                  </div>
                ) : null}
                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                  {activeTicket.description}
                </div>
              </div>

              <ScrollArea className="flex-1 bg-slate-50/70">
                <div className="space-y-4 px-6 py-5">
                  <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{t('dashboard.tickets.originalRequest')}</div>
                    <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {activeTicket.description}
                    </div>
                    <div className="mt-3 text-[11px] text-slate-400">
                      {formatDateTime(activeTicket.createdAt, currentLanguage.code, t)}
                    </div>
                  </div>

                  {ticketReplies.map((reply) => {
                    const isPatient = reply.authorRole === 'PATIENT';
                    return (
                      <div
                        key={reply.id}
                        className={`max-w-[80%] rounded-3xl px-4 py-3 shadow-sm ${
                          isPatient
                            ? 'ml-auto bg-teal-600 text-white'
                            : 'mr-auto border border-slate-200 bg-white text-slate-800'
                        }`}
                      >
                        <div className={`text-xs font-medium ${isPatient ? 'text-teal-50/90' : 'text-slate-500'}`}>
                          {isPatient ? t('dashboard.tickets.you') : t('dashboard.tickets.careTeam')}
                        </div>
                        <div className="mt-1 whitespace-pre-wrap text-sm leading-6">{reply.content}</div>
                        <div className={`mt-2 text-[11px] ${isPatient ? 'text-teal-50/80' : 'text-slate-400'}`}>
                          {formatDateTime(reply.createdAt, currentLanguage.code, t)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="border-t border-slate-200 bg-white px-6 py-4">
                <div className="space-y-3">
                  <Textarea
                    rows={3}
                    value={replyBody}
                    onChange={(event) => setReplyBody(event.target.value)}
                    placeholder={t('dashboard.tickets.replyPlaceholder')}
                  />
                  <div className="flex justify-end">
                    <Button
                      className="bg-teal-600 hover:bg-teal-700"
                      onClick={() => void handleSendReply()}
                      disabled={replyMutation.isPending || !replyBody.trim()}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {replyMutation.isPending ? t('dashboard.tickets.sending') : t('dashboard.tickets.sendReply')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

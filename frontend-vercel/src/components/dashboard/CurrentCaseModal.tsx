import type React from 'react';
import { ExternalLink, FileText, Hospital, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientCaseDocuments } from '@/hooks/usePatientDashboard';
import { usePatientAiSummary } from '@/hooks/usePatientPhase2';
import type { TranslationKey } from '@/i18n';
import { caseAssignmentStatusLabel } from '@/lib/patient-phase2';
import type { PatientCaseDocument, PatientDashboardCase } from '@/services/api/patient-dashboard';

type CurrentCaseModalProps = {
  caseItem: PatientDashboardCase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatCaseLabel(caseNumber: string) {
  return caseNumber.startsWith('CASE-') ? caseNumber : caseNumber;
}

function formatBytes(size: number, unknownSize: string) {
  if (!Number.isFinite(size) || size <= 0) return unknownSize;
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(kb >= 100 ? 0 : 1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;
}

function formatDate(value: string | null | undefined, locale: string, noDate: string) {
  if (!value) return noDate;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return noDate;
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

function DocumentList({
  title,
  icon,
  documents,
  emptyText,
  locale,
  t,
}: {
  title: string;
  icon: React.ReactNode;
  documents: PatientCaseDocument[];
  emptyText: string;
  locale: string;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}) {
  return (
    <section className="flex min-h-[360px] flex-col rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
        {icon}
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <Badge variant="secondary" className="ml-auto bg-slate-100 text-slate-700">
          {documents.length}
        </Badge>
      </div>
      <div className="grid flex-1 content-start gap-2 overflow-y-auto p-3">
        {documents.length === 0 ? (
          <div className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">{emptyText}</div>
        ) : documents.map((document) => (
          <div
            key={document.id}
            className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-900">
                {document.fileName || document.name || t('dashboard.caseModal.document')}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>{formatBytes(document.fileSize || document.size, t('dashboard.common.unknownSize'))}</span>
                <span>{formatDate(document.messageCreatedAt, locale, t('dashboard.common.noDate'))}</span>
                <span className="truncate">{document.hospitalName || document.sessionTitle}</span>
              </div>
            </div>
            {document.url && (
              <Button asChild size="icon" variant="ghost" className="h-8 w-8 shrink-0">
                <a href={document.url} target="_blank" rel="noreferrer" aria-label={t('dashboard.caseModal.openDocument', { fileName: document.fileName })}>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CurrentCaseModal({ caseItem, open, onOpenChange }: CurrentCaseModalProps) {
  const { currentLanguage, t } = useLanguage();
  const documentsQuery = usePatientCaseDocuments(caseItem.id, { enabled: open });
  const aiSummaryQuery = usePatientAiSummary(open ? caseItem.id : null);
  const aiSummary = aiSummaryQuery.data?.status === 'READY' && aiSummaryQuery.data.summary
    ? aiSummaryQuery.data.summary
    : caseItem.aiSummary;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[94vh] max-h-[94vh] w-[96vw] max-w-[1500px] flex-col overflow-hidden border-slate-200 bg-slate-50 p-0">
        <DialogHeader className="shrink-0 border-b border-slate-200 bg-white px-7 py-4">
          <DialogTitle className="flex flex-wrap items-center gap-3 text-2xl text-slate-950">
            {t('dashboard.common.caseLabel', { caseNumber: formatCaseLabel(caseItem.caseNumber) })}
            <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">{caseAssignmentStatusLabel(caseItem.assignmentStatus, t)}</Badge>
          </DialogTitle>
          <DialogDescription className="mt-1">
            {caseItem.primaryDiagnosis || t('dashboard.caseModal.currentDetails')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-4 overflow-hidden px-7 py-4">
          <div className="grid gap-4 lg:grid-cols-[0.68fr_1.32fr]">
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Hospital className="h-4 w-4 text-teal-700" />
                {t('dashboard.caseModal.status')}
              </div>
              <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">{t('dashboard.caseModal.hospital')}</dt>
                  <dd className="mt-1 font-medium text-slate-900">{caseItem.hospitalName || t('dashboard.caseModal.hospitalUnassigned')}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">{t('dashboard.caseModal.treatmentStage')}</dt>
                  <dd className="mt-1 font-medium text-slate-900">{caseItem.treatmentStage || t('dashboard.caseModal.treatmentNotStarted')}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">{t('dashboard.caseModal.riskLevel')}</dt>
                  <dd className="mt-1 font-medium text-slate-900">{caseItem.riskLevel || t('dashboard.caseModal.riskNotSet')}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">{t('dashboard.caseModal.updated')}</dt>
                  <dd className="mt-1 font-medium text-slate-900">{formatDate(caseItem.updatedAt, currentLanguage.code, t('dashboard.common.noDate'))}</dd>
                </div>
              </dl>
            </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Sparkles className="h-4 w-4 text-teal-700" />
              {t('dashboard.caseModal.aiSummary')}
              {aiSummaryQuery.isLoading && <Loader2 className="ml-auto h-4 w-4 animate-spin text-slate-400" />}
            </div>
            <div className="mt-3 line-clamp-5 rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
              {aiSummaryQuery.error ? (
                t('dashboard.caseModal.aiUnavailable')
              ) : aiSummary ? (
                aiSummary
              ) : (
                t('dashboard.caseModal.noAiSummary')
              )}
            </div>
          </section>
          </div>

          <div className="grid min-h-0 gap-4 lg:grid-cols-2">
            {documentsQuery.isLoading ? (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500 lg:col-span-2">
                {t('dashboard.caseModal.loadingDocuments')}
              </div>
            ) : documentsQuery.error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 lg:col-span-2">
                {t('dashboard.caseModal.documentsUnavailable')}
              </div>
            ) : (
              <>
                <DocumentList
                  title={t('dashboard.caseModal.uploadedDocuments')}
                  icon={<UploadCloud className="h-4 w-4 text-teal-700" />}
                  documents={documentsQuery.data?.uploadedDocuments ?? []}
                  emptyText={t('dashboard.caseModal.uploadedDocumentsEmpty')}
                  locale={currentLanguage.code}
                  t={t}
                />
                <DocumentList
                  title={t('dashboard.caseModal.hospitalReplyDocuments')}
                  icon={<Hospital className="h-4 w-4 text-teal-700" />}
                  documents={documentsQuery.data?.hospitalReplyDocuments ?? []}
                  emptyText={t('dashboard.caseModal.hospitalReplyDocumentsEmpty')}
                  locale={currentLanguage.code}
                  t={t}
                />
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

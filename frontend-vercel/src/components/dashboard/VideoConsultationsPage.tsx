import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Check, Clock, Link2, Loader2, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import {
  patientVideoConsultationsApi,
  type PatientVideoConsultation,
  type VideoConsultationDoctor,
  type VideoConsultationStatus,
} from '@/services/api/patient-video-consultations';
import { cn } from '@/lib/utils';
import VideoCallRoom from './VideoCallRoom';

type ActiveCall = {
  consultation: PatientVideoConsultation;
  token: string;
  livekitUrl: string;
  identity: string;
  participantId: string;
};

const STATUS_BADGE_CLASS: Record<VideoConsultationStatus, string> = {
  PENDING_CONFIRMATION: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  SCHEDULED: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  IN_PROGRESS: 'bg-sky-100 text-sky-800 hover:bg-sky-100',
  COMPLETED: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
  CANCELLED: 'bg-slate-100 text-slate-500 hover:bg-slate-100',
  REJECTED: 'bg-red-100 text-red-700 hover:bg-red-100',
};

const STATUS_LABEL_KEY: Record<VideoConsultationStatus, Parameters<ReturnType<typeof useLanguage>['t']>[0]> = {
  PENDING_CONFIRMATION: 'dashboard.video.statusPendingConfirmation',
  SCHEDULED: 'dashboard.video.statusScheduled',
  IN_PROGRESS: 'dashboard.video.statusInProgress',
  COMPLETED: 'dashboard.video.statusCompleted',
  CANCELLED: 'dashboard.video.statusCancelled',
  REJECTED: 'dashboard.video.statusRejected',
};

function isUpcoming(consultation: PatientVideoConsultation): boolean {
  return ['PENDING_CONFIRMATION', 'SCHEDULED', 'IN_PROGRESS'].includes(consultation.status);
}

function canJoin(consultation: PatientVideoConsultation): boolean {
  return consultation.status === 'SCHEDULED' || consultation.status === 'IN_PROGRESS';
}

function canCancel(consultation: PatientVideoConsultation): boolean {
  return consultation.status === 'PENDING_CONFIRMATION' || consultation.status === 'SCHEDULED';
}

export default function VideoConsultationsPage() {
  const { t, currentLanguage } = useLanguage();
  const { patient } = usePatientAuth();
  const [consultations, setConsultations] = useState<PatientVideoConsultation[]>([]);
  const [doctors, setDoctors] = useState<VideoConsultationDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDoctorId, setBookingDoctorId] = useState('');
  const [bookingDateTime, setBookingDateTime] = useState('');
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const [list, doctorList] = await Promise.all([
        patientVideoConsultationsApi.list(),
        patientVideoConsultationsApi.listDoctors().catch(() => [] as VideoConsultationDoctor[]),
      ]);
      setConsultations(list);
      setDoctors(doctorList);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Auto-select when there is exactly one available doctor.
  useEffect(() => {
    if (doctors.length === 1) {
      setBookingDoctorId((current) => current || doctors[0].surgeon_id);
    }
  }, [doctors]);

  const upcoming = useMemo(() => consultations.filter(isUpcoming), [consultations]);
  const past = useMemo(() => consultations.filter((item) => !isUpcoming(item)), [consultations]);

  const formatDateTime = (iso: string | null) => {
    if (!iso) return t('dashboard.common.noDate');
    return new Date(iso).toLocaleString(currentLanguage.code, { dateStyle: 'medium', timeStyle: 'short' });
  };

  const submitBooking = async () => {
    if (!patient?.id || !bookingDoctorId || !bookingDateTime) return;
    const scheduledAt = new Date(bookingDateTime);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      setBookingError(t('dashboard.video.invalidDateTime'));
      return;
    }
    const doctor = doctors.find((item) => item.surgeon_id === bookingDoctorId);
    setBookingSubmitting(true);
    setBookingError(null);
    try {
      await patientVideoConsultationsApi.book({
        patientId: patient.id,
        patientName: patient.name ?? null,
        patientEmail: patient.email ?? null,
        caseId: patient.caseId,
        scheduledAt: scheduledAt.toISOString(),
        doctorId: bookingDoctorId,
        doctorName: doctor?.name ?? null,
        title: bookingTitle.trim() || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        patientLanguage: patient.preferredLanguage ?? currentLanguage.code,
      });
      setBookingOpen(false);
      setBookingDoctorId('');
      setBookingDateTime('');
      setBookingTitle('');
      setBookingSuccess(true);
      await load();
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'booking_failed');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const copyShareLink = async (consultation: PatientVideoConsultation) => {
    const url = `${window.location.origin}/video-room/${consultation.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    setCopiedId(consultation.id);
    window.setTimeout(() => setCopiedId((current) => (current === consultation.id ? null : current)), 2000);
  };

  const cancelConsultation = async (consultation: PatientVideoConsultation) => {
    setCancellingId(consultation.id);
    try {
      await patientVideoConsultationsApi.cancel(consultation.id);
      await load();
    } finally {
      setCancellingId(null);
    }
  };

  const joinConsultation = async (consultation: PatientVideoConsultation) => {
    setJoiningId(consultation.id);
    try {
      const tokenResult = await patientVideoConsultationsApi.getJoinToken(consultation.id);
      const participant = await patientVideoConsultationsApi.join(consultation.id, {
        identity: tokenResult.identity,
        displayName: patient?.name ?? tokenResult.identity,
      });
      setActiveCall({
        consultation,
        token: tokenResult.token,
        livekitUrl: tokenResult.livekitUrl,
        identity: tokenResult.identity,
        participantId: participant.id,
      });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'join_failed');
    } finally {
      setJoiningId(null);
    }
  };

  const leaveCall = useCallback(() => {
    if (activeCall) {
      void patientVideoConsultationsApi.leave(activeCall.consultation.id, activeCall.participantId).catch(() => undefined);
    }
    setActiveCall(null);
    void load();
  }, [activeCall, load]);

  if (activeCall) {
    return (
      <div className="mx-auto max-w-4xl">
        <VideoCallRoom
          token={activeCall.token}
          livekitUrl={activeCall.livekitUrl}
          displayName={patient?.name}
          onLeave={leaveCall}
        />
      </div>
    );
  }

  const renderConsultationCard = (consultation: PatientVideoConsultation) => (
    <Card key={consultation.id}>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-900">
              {consultation.title || t('dashboard.video.defaultTitle')}
            </p>
            <Badge className={STATUS_BADGE_CLASS[consultation.status]}>
              {t(STATUS_LABEL_KEY[consultation.status])}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            {consultation.doctor_name || consultation.doctor_id || ''}
            {consultation.doctor_name || consultation.doctor_id ? ' · ' : ''}
            {formatDateTime(consultation.scheduled_at)}
            {' · '}
            {consultation.duration_minutes} {t('dashboard.video.minutes')}
          </p>
          {consultation.status === 'PENDING_CONFIRMATION' && (
            <p className="text-xs text-amber-700">{t('dashboard.video.pendingConfirmationHint')}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {canJoin(consultation) && (
            <Button
              size="sm"
              onClick={() => void joinConsultation(consultation)}
              disabled={joiningId === consultation.id}
            >
              {joiningId === consultation.id ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <VideoIcon className="mr-1 h-4 w-4" />
              )}
              {t('dashboard.video.join')}
            </Button>
          )}
          {isUpcoming(consultation) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void copyShareLink(consultation)}
              title={t('dashboard.video.copyLink')}
            >
              {copiedId === consultation.id ? (
                <Check className="mr-1 h-4 w-4 text-emerald-600" />
              ) : (
                <Link2 className="mr-1 h-4 w-4" />
              )}
              {copiedId === consultation.id ? t('dashboard.video.linkCopied') : t('dashboard.video.copyLink')}
            </Button>
          )}
          {canCancel(consultation) && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600"
              onClick={() => void cancelConsultation(consultation)}
              disabled={cancellingId === consultation.id}
            >
              {cancellingId === consultation.id && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {t('dashboard.video.cancelBooking')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('dashboard.video.title')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('dashboard.video.subtitle')}</p>
        </div>
        <Button onClick={() => setBookingOpen(true)}>
          <Calendar className="mr-1 h-4 w-4" />
          {t('dashboard.video.book')}
        </Button>
      </div>

      {bookingSuccess && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {t('dashboard.video.bookSuccess')}
        </p>
      )}
      {loadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {t('dashboard.video.loadError')}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('dashboard.common.loading')}
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h3 className="text-lg font-medium text-slate-900">{t('dashboard.video.upcoming')}</h3>
            {upcoming.length > 0 ? (
              upcoming.map(renderConsultationCard)
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-sm text-slate-500">
                  {t('dashboard.video.empty')}
                </CardContent>
              </Card>
            )}
          </section>

          {past.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-lg font-medium text-slate-900">{t('dashboard.video.past')}</h3>
              {past.map(renderConsultationCard)}
            </section>
          )}
        </>
      )}

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dashboard.video.bookDialogTitle')}</DialogTitle>
            <DialogDescription>{t('dashboard.video.bookDialogDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t('dashboard.video.doctor')}</Label>
              {doctors.length === 0 ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {t('dashboard.video.noDoctors')}
                </p>
              ) : (
                <div className="space-y-2">
                  {doctors.map((doctor) => {
                    const selected = bookingDoctorId === doctor.surgeon_id;
                    return (
                      <button
                        key={doctor.surgeon_id}
                        type="button"
                        onClick={() => setBookingDoctorId(doctor.surgeon_id)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                          selected
                            ? 'border-teal-600 bg-teal-50 text-slate-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400',
                        )}
                      >
                        <span>
                          <span className="font-medium">{doctor.name}</span>
                          {doctor.title && <span className="ml-2 text-slate-500">{doctor.title}</span>}
                        </span>
                        {selected && <Check className="h-4 w-4 shrink-0 text-teal-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t('dashboard.video.dateTime')}</Label>
              <Input
                type="datetime-local"
                value={bookingDateTime}
                onChange={(event) => setBookingDateTime(event.target.value)}
                min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('dashboard.video.titleLabel')}</Label>
              <Input
                value={bookingTitle}
                onChange={(event) => setBookingTitle(event.target.value)}
                placeholder={t('dashboard.video.titlePlaceholder')}
                maxLength={120}
              />
            </div>
            {bookingError && <p className="text-sm text-red-600">{bookingError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)} disabled={bookingSubmitting}>
              {t('dashboard.tickets.cancel')}
            </Button>
            <Button
              onClick={() => void submitBooking()}
              disabled={bookingSubmitting || !bookingDoctorId || !bookingDateTime}
            >
              {bookingSubmitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              <Clock className="mr-1 h-4 w-4" />
              {t('dashboard.video.submitBooking')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, LogIn, ShieldX, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { patientVideoConsultationsApi } from '@/services/api/patient-video-consultations';
import VideoCallRoom from '@/components/dashboard/VideoCallRoom';

type JoinedCall = {
  token: string;
  livekitUrl: string;
  participantId: string | null;
  patientLanguage: string | null;
};

// Patient-authenticated video room entry. Unlike the public guest link
// (/video-room/:id), this page requires a patient session and the API only
// issues a token when the logged-in patient owns the booking — so a link
// forwarded to anyone else cannot enter the room.
export default function PatientVideoRoomPage() {
  const { consultationId } = useParams<{ consultationId: string }>();
  const { t } = useLanguage();
  const { patient, isAuthenticated, isLoading, logout } = usePatientAuth();
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState(false);
  const [call, setCall] = useState<JoinedCall | null>(null);
  const joinStartedRef = useRef(false);

  useEffect(() => {
    if (!consultationId || isLoading || !isAuthenticated || joinStartedRef.current) return;
    joinStartedRef.current = true;
    setJoining(true);
    (async () => {
      try {
        const tokenResult = await patientVideoConsultationsApi.getJoinToken(consultationId);
        const participant = await patientVideoConsultationsApi.join(consultationId, {
          identity: tokenResult.identity,
          displayName: patient?.name ?? tokenResult.identity,
        });
        setCall({
          token: tokenResult.token,
          livekitUrl: tokenResult.livekitUrl,
          participantId: participant.id,
          patientLanguage: tokenResult.patientLanguage,
        });
      } catch {
        // The API returns 404 both for unknown ids and for consultations owned
        // by another patient, so neither leaks booking information.
        setJoinError(true);
      } finally {
        setJoining(false);
      }
    })();
  }, [consultationId, isAuthenticated, isLoading, patient?.name]);

  const leave = useCallback(() => {
    if (consultationId && call?.participantId) {
      void patientVideoConsultationsApi.leave(consultationId, call.participantId).catch(() => undefined);
    }
    setCall(null);
  }, [consultationId, call]);

  // The 404 join failure almost always means the visitor is signed in with a
  // different account than the booking email — show the current account and
  // offer a sign-out shortcut so they can switch to the booking email.
  const switchAccount = useCallback(async () => {
    await logout().catch(() => undefined);
    navigate('/patient-login');
  }, [logout, navigate]);

  if (call) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-4xl">
          <VideoCallRoom
            consultationId={consultationId!}
            token={call.token}
            livekitUrl={call.livekitUrl}
            preferredLanguage={call.patientLanguage}
            displayName={patient?.name ?? ''}
            onLeave={leave}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef8f7_100%)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VideoIcon className="h-5 w-5 text-teal-600" />
            {t('guestVideo.title')}
          </CardTitle>
          <CardDescription>{t('guestVideo.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || joining ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {joining ? t('guestVideo.joining') : t('dashboard.common.loading')}
            </div>
          ) : !isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">{t('patientVideo.loginRequired')}</p>
              <Button asChild className="w-full">
                <Link to="/patient-login">
                  <LogIn className="mr-1 h-4 w-4" />
                  {t('dashboard.loginButton')}
                </Link>
              </Button>
            </div>
          ) : joinError ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-sm text-red-600">
                <ShieldX className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{t('patientVideo.onlyBookingPatient')}</p>
              </div>
              {patient?.email ? (
                <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  {t('patientVideo.signedInAs', { email: patient.email })}
                </p>
              ) : null}
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full" onClick={() => void switchAccount()}>
                  <LogIn className="mr-1 h-4 w-4" />
                  {t('patientVideo.switchAccount')}
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link to="/dashboard">{t('patientVideo.backToDashboard')}</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

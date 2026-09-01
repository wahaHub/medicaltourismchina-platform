import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  patientVideoConsultationsApi,
  type VideoConsultationPublicInfo,
} from '@/services/api/patient-video-consultations';
import VideoCallRoom from '@/components/dashboard/VideoCallRoom';

type GuestCall = {
  token: string;
  livekitUrl: string;
  participantId: string | null;
};

export default function VideoRoomPage() {
  const { consultationId } = useParams<{ consultationId: string }>();
  const { t, currentLanguage } = useLanguage();
  const [info, setInfo] = useState<VideoConsultationPublicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [call, setCall] = useState<GuestCall | null>(null);
  const [left, setLeft] = useState(false);

  useEffect(() => {
    if (!consultationId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    patientVideoConsultationsApi.getPublicInfo(consultationId)
      .then((result) => {
        if (!cancelled) setInfo(result);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [consultationId]);

  const join = async () => {
    if (!consultationId || !displayName.trim()) return;
    setJoining(true);
    setJoinError(null);
    try {
      const result = await patientVideoConsultationsApi.guestJoin(consultationId, displayName.trim());
      setCall({ token: result.token, livekitUrl: result.livekitUrl, participantId: result.participantId });
    } catch (error) {
      setJoinError(error instanceof Error ? error.message : 'join_failed');
    } finally {
      setJoining(false);
    }
  };

  const leave = useCallback(() => {
    if (consultationId && call?.participantId) {
      void patientVideoConsultationsApi.guestLeave(consultationId, call.participantId).catch(() => undefined);
    }
    setCall(null);
    setLeft(true);
  }, [consultationId, call]);

  if (call) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-4xl">
          <VideoCallRoom
            token={call.token}
            livekitUrl={call.livekitUrl}
            displayName={displayName.trim()}
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
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('dashboard.common.loading')}
            </div>
          ) : notFound || !info ? (
            <p className="text-sm text-red-600">{t('guestVideo.notFound')}</p>
          ) : left ? (
            <p className="text-sm text-slate-600">{t('guestVideo.left')}</p>
          ) : !info.joinable ? (
            <p className="text-sm text-amber-700">{t('guestVideo.notJoinable')}</p>
          ) : (
            <>
              <div className="space-y-1 text-sm text-slate-600">
                <p className="font-medium text-slate-900">{info.title || t('dashboard.video.defaultTitle')}</p>
                {info.doctorName && <p>{t('dashboard.video.doctor')}: {info.doctorName}</p>}
                {info.scheduledAt && (
                  <p>
                    {new Date(info.scheduledAt).toLocaleString(currentLanguage.code, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                    {' · '}
                    {info.durationMinutes} {t('dashboard.video.minutes')}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest-name">{t('guestVideo.nameLabel')}</Label>
                <Input
                  id="guest-name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder={t('guestVideo.namePlaceholder')}
                  maxLength={80}
                />
              </div>
              {joinError && <p className="text-sm text-red-600">{t('guestVideo.error')}</p>}
              <Button
                className="w-full"
                disabled={joining || !displayName.trim()}
                onClick={() => void join()}
              >
                {joining ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <VideoIcon className="mr-1 h-4 w-4" />
                )}
                {joining ? t('guestVideo.joining') : t('guestVideo.join')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

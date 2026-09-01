import { useEffect, useRef, useState } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  VideoPresets,
  type LocalVideoTrack,
  type RemoteAudioTrack,
  type RemoteVideoTrack,
} from 'livekit-client';
import { Loader2, Mic, MicOff, PhoneOff, Video as VideoIcon, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface VideoCallRoomProps {
  token: string;
  livekitUrl: string;
  displayName?: string;
  onLeave: () => void;
}

function RemoteVideoView({ track, className }: { track: RemoteVideoTrack; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = track.attach();
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.objectFit = 'cover';
    containerRef.current?.appendChild(element);
    return () => {
      track.detach(element);
      element.remove();
    };
  }, [track]);

  return <div ref={containerRef} className={cn('overflow-hidden bg-slate-900', className)} />;
}

function RemoteAudio({ track }: { track: RemoteAudioTrack }) {
  useEffect(() => {
    const element = track.attach();
    element.style.display = 'none';
    document.body.appendChild(element);
    return () => {
      track.detach(element);
      element.remove();
    };
  }, [track]);
  return null;
}

export default function VideoCallRoom({ token, livekitUrl, displayName, onLeave }: VideoCallRoomProps) {
  const { t } = useLanguage();
  const [room, setRoom] = useState<Room | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [remoteVideoTracks, setRemoteVideoTracks] = useState<RemoteVideoTrack[]>([]);
  const [remoteAudioTracks, setRemoteAudioTracks] = useState<RemoteAudioTrack[]>([]);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const onLeaveRef = useRef(onLeave);
  onLeaveRef.current = onLeave;

  useEffect(() => {
    let disposed = false;
    const lkRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
      publishDefaults: { simulcast: true },
      videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
    });

    const syncLocalVideo = () => {
      const publication = lkRoom.localParticipant.getTrackPublication(Track.Source.Camera);
      setLocalVideoTrack((publication?.track as LocalVideoTrack | undefined) ?? null);
    };

    lkRoom
      .on(RoomEvent.LocalTrackPublished, syncLocalVideo)
      .on(RoomEvent.LocalTrackUnpublished, syncLocalVideo)
      .on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Video) {
          const videoTrack = track as RemoteVideoTrack;
          setRemoteVideoTracks((prev) => (prev.some((item) => item.sid === videoTrack.sid) ? prev : [...prev, videoTrack]));
        } else if (track.kind === Track.Kind.Audio) {
          const audioTrack = track as RemoteAudioTrack;
          setRemoteAudioTracks((prev) => (prev.some((item) => item.sid === audioTrack.sid) ? prev : [...prev, audioTrack]));
        }
      })
      .on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === Track.Kind.Video) {
          setRemoteVideoTracks((prev) => prev.filter((item) => item.sid !== track.sid));
        } else if (track.kind === Track.Kind.Audio) {
          setRemoteAudioTracks((prev) => prev.filter((item) => item.sid !== track.sid));
        }
      })
      .on(RoomEvent.Disconnected, () => {
        if (!disposed) {
          onLeaveRef.current();
        }
      });

    (async () => {
      try {
        await lkRoom.connect(livekitUrl, token);
        await lkRoom.localParticipant.enableCameraAndMicrophone();
        if (disposed) return;
        setMicEnabled(lkRoom.localParticipant.isMicrophoneEnabled);
        setCameraEnabled(lkRoom.localParticipant.isCameraEnabled);
        setRoom(lkRoom);
        setConnecting(false);
      } catch (err) {
        if (disposed) return;
        setError(err instanceof Error ? err.message : 'connect_failed');
        setConnecting(false);
      }
    })();

    return () => {
      disposed = true;
      lkRoom.disconnect();
    };
  }, [token, livekitUrl]);

  useEffect(() => {
    if (!localVideoTrack || !localVideoRef.current) return;
    const element = localVideoTrack.attach();
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.objectFit = 'cover';
    element.style.transform = 'scaleX(-1)';
    localVideoRef.current.appendChild(element);
    return () => {
      localVideoTrack.detach(element);
      element.remove();
    };
  }, [localVideoTrack]);

  const toggleMic = async () => {
    if (!room) return;
    const next = !micEnabled;
    await room.localParticipant.setMicrophoneEnabled(next);
    setMicEnabled(next);
  };

  const toggleCamera = async () => {
    if (!room) return;
    const next = !cameraEnabled;
    await room.localParticipant.setCameraEnabled(next);
    setCameraEnabled(next);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-slate-900 p-10 text-center text-white">
        <p className="text-sm text-red-300">{t('dashboard.video.connectionError')}</p>
        <p className="text-xs text-slate-400">{error}</p>
        <Button variant="outline" onClick={onLeave} className="text-slate-900">
          {t('dashboard.video.leave')}
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-slate-950 text-white">
      <div className="relative aspect-video w-full">
        {remoteVideoTracks.length > 0 ? (
          <div className={cn('grid h-full w-full gap-1', remoteVideoTracks.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
            {remoteVideoTracks.map((track) => (
              <RemoteVideoView key={track.sid} track={track} className="h-full w-full" />
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">{t(connecting ? 'dashboard.video.connecting' : 'dashboard.video.waitingForHost')}</p>
          </div>
        )}

        <div className="absolute bottom-3 right-3 h-28 w-40 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-lg">
          {localVideoTrack && cameraEnabled ? (
            <div ref={localVideoRef} className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              {displayName || t('dashboard.video.you')}
            </div>
          )}
        </div>
      </div>

      {remoteAudioTracks.map((track) => (
        <RemoteAudio key={track.sid} track={track} />
      ))}

      <div className="flex items-center justify-center gap-3 bg-slate-900 px-4 py-3">
        <Button
          type="button"
          variant={micEnabled ? 'secondary' : 'destructive'}
          size="icon"
          className="rounded-full"
          onClick={() => void toggleMic()}
          disabled={connecting}
          aria-label={micEnabled ? t('dashboard.video.mute') : t('dashboard.video.unmute')}
        >
          {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          variant={cameraEnabled ? 'secondary' : 'destructive'}
          size="icon"
          className="rounded-full"
          onClick={() => void toggleCamera()}
          disabled={connecting}
          aria-label={cameraEnabled ? t('dashboard.video.cameraOff') : t('dashboard.video.cameraOn')}
        >
          {cameraEnabled ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="rounded-full"
          onClick={onLeave}
          aria-label={t('dashboard.video.leave')}
        >
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

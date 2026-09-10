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
import { AlertTriangle, Loader2, Mic, MicOff, PhoneOff, Video as VideoIcon, VideoOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { cn } from '@/lib/utils';
import { patientVideoConsultationsApi } from '@/services/api/patient-video-consultations';
import {
  activeInterpretationFence,
  classifyRemoteAudioTrust,
  interpretationFenceIsCurrent,
  matchesInterpretationFence,
  type VideoInterpretationFence,
} from './video-interpretation-trust';
import {
  isPatientTranslationTarget,
  isPatientTranslationTrack,
  normalizeVideoInterpretationLanguage,
} from './video-interpretation-language';

interface VideoCallRoomProps {
  consultationId: string;
  token: string;
  livekitUrl: string;
  preferredLanguage?: string | null;
  displayName?: string;
  onLeave: () => void;
}

interface SubtitleLine {
  from: string;
  sourceText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  isFinal: boolean;
}

interface RemoteAudioEntry {
  track: RemoteAudioTrack;
  participantIdentity: string;
  trackName: string;
}

const DUCKED_ORIGINAL_VOLUME = 0.15;

type DeviceIssueReason = 'not-found' | 'denied' | 'busy' | 'error';

interface DeviceIssue {
  mic: DeviceIssueReason | null;
  camera: DeviceIssueReason | null;
}

function classifyMediaError(err: unknown): DeviceIssueReason {
  const name = err instanceof DOMException ? err.name : '';
  if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'DevicesNotFoundError') return 'not-found';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied';
  if (name === 'NotReadableError' || name === 'AbortError') return 'busy';
  return 'error';
}

const DEVICE_ISSUE_REASON_KEYS: Record<DeviceIssueReason, TranslationKey> = {
  'not-found': 'dashboard.video.deviceIssue.reason.notFound',
  denied: 'dashboard.video.deviceIssue.reason.denied',
  busy: 'dashboard.video.deviceIssue.reason.busy',
  error: 'dashboard.video.deviceIssue.reason.error',
};

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

function RemoteAudio({ track, volume }: { track: RemoteAudioTrack; volume: number }) {
  const elementRef = useRef<HTMLMediaElement | null>(null);
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  useEffect(() => {
    const element = track.attach();
    element.volume = volumeRef.current;
    element.style.display = 'none';
    document.body.appendChild(element);
    elementRef.current = element;
    return () => {
      track.detach(element);
      element.remove();
      elementRef.current = null;
    };
  }, [track]);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.volume = volume;
    }
  }, [volume]);

  return null;
}

export default function VideoCallRoom({
  consultationId,
  token,
  livekitUrl,
  preferredLanguage,
  displayName,
  onLeave,
}: VideoCallRoomProps) {
  const { t } = useLanguage();
  // Legacy consultations may predate the required booking field. Their CRM
  // room already defaults to English, so retain the same fallback here.
  const patientLanguage = normalizeVideoInterpretationLanguage(preferredLanguage) ?? 'en';
  const [room, setRoom] = useState<Room | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [remoteVideoTracks, setRemoteVideoTracks] = useState<RemoteVideoTrack[]>([]);
  const [remoteAudioEntries, setRemoteAudioEntries] = useState<RemoteAudioEntry[]>([]);
  const [subtitles, setSubtitles] = useState<SubtitleLine[]>([]);
  const [translatedPlayoutCount, setTranslatedPlayoutCount] = useState(0);
  const [interpretationFence, setInterpretationFence] = useState<VideoInterpretationFence | null>(null);
  const interpretationFenceRef = useRef<VideoInterpretationFence | null>(null);
  const [deviceIssue, setDeviceIssue] = useState<DeviceIssue | null>(null);
  const [deviceIssueDismissed, setDeviceIssueDismissed] = useState(false);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const onLeaveRef = useRef(onLeave);
  onLeaveRef.current = onLeave;

  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const applyFence = (next: VideoInterpretationFence | null) => {
      const current = interpretationFenceRef.current;
      const changed = current?.jobId !== next?.jobId
        || current?.roomGeneration !== next?.roomGeneration
        || current?.interpretationGeneration !== next?.interpretationGeneration
        || current?.executionVersion !== next?.executionVersion
        || current?.agentIdentity !== next?.agentIdentity;
      if (!changed) return;
      interpretationFenceRef.current = next;
      setInterpretationFence(next);
      setTranslatedPlayoutCount(0);
      setSubtitles([]);
    };

    const refresh = async () => {
      try {
        const result = await patientVideoConsultationsApi.getInterpretationStatus(consultationId);
        if (!disposed) applyFence(activeInterpretationFence(result.job));
      } catch {
        // A single control-plane/network miss must not mute a sentence in
        // progress. Retain only the exact fence until its server-issued expiry.
        if (!disposed && !interpretationFenceIsCurrent(interpretationFenceRef.current)) {
          applyFence(null);
        }
      } finally {
        if (!disposed) timer = setTimeout(() => { void refresh(); }, 1_000);
      }
    };
    void refresh();
    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      interpretationFenceRef.current = null;
    };
  }, [consultationId]);

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
      .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Video) {
          const videoTrack = track as RemoteVideoTrack;
          setRemoteVideoTracks((prev) => (prev.some((item) => item.sid === videoTrack.sid) ? prev : [...prev, videoTrack]));
        } else if (track.kind === Track.Kind.Audio) {
          const audioTrack = track as RemoteAudioTrack;
          setRemoteAudioEntries((prev) => (
            prev.some((item) => item.track.sid === audioTrack.sid)
              ? prev
              : [...prev, {
                track: audioTrack,
                participantIdentity: participant.identity,
                trackName: publication.trackName || audioTrack.name,
              }]
          ));
        }
      })
      .on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === Track.Kind.Video) {
          setRemoteVideoTracks((prev) => prev.filter((item) => item.sid !== track.sid));
        } else if (track.kind === Track.Kind.Audio) {
          setRemoteAudioEntries((prev) => prev.filter((item) => item.track.sid !== track.sid));
        }
      })
      .on(RoomEvent.ParticipantDisconnected, (participant) => {
        setRemoteAudioEntries((prev) => prev.filter((entry) => entry.participantIdentity !== participant.identity));
        if (participant.identity === interpretationFenceRef.current?.agentIdentity) {
          setTranslatedPlayoutCount(0);
        }
      })
      .on(RoomEvent.DataReceived, (payload, participant, _kind, topic) => {
        if (payload.byteLength > 64 * 1024) return;
        try {
          const msg = JSON.parse(new TextDecoder().decode(payload)) as Record<string, unknown>;
          if (!matchesInterpretationFence(
            participant?.identity,
            msg,
            interpretationFenceRef.current,
          )) return;
          if (topic === 'interpretation-status' && msg.schema === 'medora.interpretation.status.v1') {
            if (!isPatientTranslationTarget(msg.targetLanguage, patientLanguage)) return;
            if (msg.code === 'TRANSLATED_PLAYOUT_STARTED') {
              setTranslatedPlayoutCount((count) => count + 1);
            } else if (msg.code === 'TRANSLATED_PLAYOUT_ENDED') {
              setTranslatedPlayoutCount((count) => Math.max(0, count - 1));
            }
            return;
          }
          if (topic !== 'subtitle' || msg.schema !== 'medora.subtitle.v1') return;
          if (typeof msg.sourceText !== 'string' || typeof msg.translatedText !== 'string') return;
          if (msg.sourceText.length > 4_000 || msg.translatedText.length > 4_000) return;
          if (typeof msg.isFinal !== 'boolean') return;
          if (!isPatientTranslationTarget(msg.toLanguage, patientLanguage)) return;
          const line: SubtitleLine = {
            from: String(msg.from ?? ''),
            sourceText: msg.sourceText,
            translatedText: msg.translatedText,
            fromLanguage: String(msg.fromLanguage ?? ''),
            toLanguage: String(msg.toLanguage ?? ''),
            isFinal: msg.isFinal,
          };
          setSubtitles((prev) => {
            // Interim captions carry the accumulated text of the same turn —
            // update the speaker's in-progress line in place instead of
            // appending one line per delta.
            const next = [...prev];
            let liveIndex = -1;
            for (let i = next.length - 1; i >= 0; i -= 1) {
              const entry = next[i];
              if (entry && !entry.isFinal && entry.from === line.from) {
                liveIndex = i;
                break;
              }
            }
            if (liveIndex >= 0) next[liveIndex] = line;
            else next.push(line);
            return next.slice(-49);
          });
        } catch {
          // Ignore malformed data messages.
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
        // Enable devices independently so one missing device doesn't block the
        // other — or the whole join. A device-less participant still enters the
        // room in watch/listen mode and gets the device-issue banner.
        const issue: DeviceIssue = { mic: null, camera: null };
        try {
          await lkRoom.localParticipant.setMicrophoneEnabled(true);
        } catch (deviceErr) {
          issue.mic = classifyMediaError(deviceErr);
        }
        try {
          await lkRoom.localParticipant.setCameraEnabled(true);
        } catch (deviceErr) {
          issue.camera = classifyMediaError(deviceErr);
        }
        if (disposed) return;
        setMicEnabled(lkRoom.localParticipant.isMicrophoneEnabled);
        setCameraEnabled(lkRoom.localParticipant.isCameraEnabled);
        if (issue.mic || issue.camera) setDeviceIssue(issue);
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
  }, [token, livekitUrl, patientLanguage]);

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
    try {
      await room.localParticipant.setMicrophoneEnabled(next);
      setMicEnabled(next);
      // Retrying after a device failure (e.g. user plugged in a headset)
      // clears the banner entry for this device.
      if (next) setDeviceIssue((prev) => (prev ? { ...prev, mic: null } : prev));
    } catch (err) {
      if (next) setDeviceIssue((prev) => ({ mic: classifyMediaError(err), camera: prev?.camera ?? null }));
    }
  };

  const toggleCamera = async () => {
    if (!room) return;
    const next = !cameraEnabled;
    try {
      await room.localParticipant.setCameraEnabled(next);
      setCameraEnabled(next);
      if (next) setDeviceIssue((prev) => (prev ? { ...prev, camera: null } : prev));
    } catch (err) {
      if (next) setDeviceIssue((prev) => ({ mic: prev?.mic ?? null, camera: classifyMediaError(err) }));
    }
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

  const visibleSubtitles = subtitles.slice(-1);

  return (
    <div className="overflow-hidden rounded-xl bg-slate-950 text-white">
      <div className="relative aspect-[4/3] w-full sm:aspect-video">
        {remoteVideoTracks.length > 0 ? (
          <div className={cn('grid h-full w-full gap-1', remoteVideoTracks.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1')}>
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

        {visibleSubtitles.length > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-1 px-4">
            {visibleSubtitles.map((line, index) => (
              <div
                key={`${subtitles.length - visibleSubtitles.length + index}`}
                className={cn(
                  'max-w-2xl rounded-lg bg-black/70 px-3 py-1.5 text-center',
                  line.isFinal ? '' : 'opacity-80',
                )}
              >
                <p className="text-sm text-white">{line.translatedText}</p>
              </div>
            ))}
          </div>
        )}

        <div className="absolute right-2 top-2 h-20 w-28 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-lg sm:right-3 sm:top-3 sm:h-28 sm:w-40">
          {localVideoTrack && cameraEnabled ? (
            <div ref={localVideoRef} className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              {displayName || t('dashboard.video.you')}
            </div>
          )}
        </div>
      </div>

      {remoteAudioEntries.map((entry) => (
        <RemoteAudio
          key={entry.track.sid}
          track={entry.track}
          volume={(() => {
            const trust = classifyRemoteAudioTrust(entry.participantIdentity, interpretationFence);
            if (trust === 'BLOCKED_AGENT') return 0;
            if (trust === 'TRANSLATED') {
              return isPatientTranslationTrack(entry.trackName, patientLanguage) ? 1 : 0;
            }
            return translatedPlayoutCount > 0 ? DUCKED_ORIGINAL_VOLUME : 1;
          })()}
        />
      ))}

      {deviceIssue && !deviceIssueDismissed && (deviceIssue.mic || deviceIssue.camera) && (
        <div className="flex items-start gap-3 border-t border-amber-500/40 bg-amber-500/15 px-4 py-3 text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <div className="flex-1 space-y-1 text-xs leading-relaxed">
            {deviceIssue.mic && (
              <p>{t('dashboard.video.deviceIssue.mic', { reason: t(DEVICE_ISSUE_REASON_KEYS[deviceIssue.mic]) })}</p>
            )}
            {deviceIssue.camera && (
              <p>{t('dashboard.video.deviceIssue.camera', { reason: t(DEVICE_ISSUE_REASON_KEYS[deviceIssue.camera]) })}</p>
            )}
            {deviceIssue.mic && deviceIssue.camera && (
              <p>{t('dashboard.video.deviceIssue.listenOnly')}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDeviceIssueDismissed(true)}
            className="shrink-0 rounded p-1 text-amber-200/80 hover:bg-amber-500/20 hover:text-amber-100"
            aria-label={t('dashboard.video.deviceIssue.dismiss')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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

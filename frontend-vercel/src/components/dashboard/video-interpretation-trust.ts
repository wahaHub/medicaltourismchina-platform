export interface VideoInterpretationFence {
  jobId: string;
  roomGeneration: number;
  interpretationGeneration: number;
  executionVersion: number;
  agentIdentity: string;
  validUntil: string;
}

export type RemoteAudioTrust = 'ORIGINAL' | 'TRANSLATED' | 'BLOCKED_AGENT';

const TRANSLATOR_IDENTITY_PREFIX = 'translator-';

export function activeInterpretationFence(value: unknown): VideoInterpretationFence | null {
  if (!value || typeof value !== 'object') return null;
  const job = value as Record<string, unknown>;
  if (job.desiredState !== 'RUNNING' || job.status !== 'ACTIVE'
    || typeof job.jobId !== 'string'
    || typeof job.agentIdentity !== 'string'
    || typeof job.validUntil !== 'string'
    || !Number.isFinite(Date.parse(job.validUntil))
    || Date.parse(job.validUntil) <= Date.now()
    || !job.agentIdentity.startsWith(TRANSLATOR_IDENTITY_PREFIX)
    || !Number.isInteger(job.roomGeneration)
    || !Number.isInteger(job.interpretationGeneration)
    || !Number.isInteger(job.executionVersion)) return null;
  return job as unknown as VideoInterpretationFence;
}

export function interpretationFenceIsCurrent(
  fence: VideoInterpretationFence | null,
  nowMs = Date.now(),
): boolean {
  return Boolean(fence && Date.parse(fence.validUntil) > nowMs);
}

export function matchesInterpretationFence(
  participantIdentity: string | undefined,
  message: Record<string, unknown>,
  fence: VideoInterpretationFence | null,
): boolean {
  return Boolean(fence
    && participantIdentity === fence.agentIdentity
    && message.jobId === fence.jobId
    && message.roomGeneration === fence.roomGeneration
    && message.interpretationGeneration === fence.interpretationGeneration
    && message.executionVersion === fence.executionVersion);
}

export function classifyRemoteAudioTrust(
  participantIdentity: string,
  fence: VideoInterpretationFence | null,
): RemoteAudioTrust {
  if (fence && participantIdentity === fence.agentIdentity) return 'TRANSLATED';
  if (participantIdentity.startsWith(TRANSLATOR_IDENTITY_PREFIX)) return 'BLOCKED_AGENT';
  return 'ORIGINAL';
}

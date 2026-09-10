import { describe, expect, it } from 'vitest';
import {
  activeInterpretationFence,
  classifyRemoteAudioTrust,
  interpretationFenceIsCurrent,
  matchesInterpretationFence,
} from '../video-interpretation-trust';

const status = {
  jobId: 'job-1',
  roomGeneration: 2,
  interpretationGeneration: 3,
  executionVersion: 4,
  agentIdentity: 'translator-job-1-v4',
  desiredState: 'RUNNING',
  status: 'ACTIVE',
  validUntil: new Date(Date.now() + 60_000).toISOString(),
};

describe('patient video interpretation trust', () => {
  it('only activates a complete running execution fence', () => {
    expect(activeInterpretationFence(status)).toMatchObject({ jobId: 'job-1', executionVersion: 4 });
    expect(activeInterpretationFence({ ...status, status: 'STOPPING' })).toBeNull();
    expect(activeInterpretationFence({ ...status, agentIdentity: 'patient-1' })).toBeNull();
  });

  it('retains an exact fence only through its server-issued validity window', () => {
    const fence = activeInterpretationFence(status);
    expect(interpretationFenceIsCurrent(fence, Date.now())).toBe(true);
    expect(interpretationFenceIsCurrent(fence, Date.parse(status.validUntil) + 1)).toBe(false);
  });

  it('matches every message fence field and the exact agent identity', () => {
    const fence = activeInterpretationFence(status);
    expect(matchesInterpretationFence(status.agentIdentity, status, fence)).toBe(true);
    expect(matchesInterpretationFence(status.agentIdentity, { ...status, executionVersion: 3 }, fence)).toBe(false);
    expect(matchesInterpretationFence('translator-old', status, fence)).toBe(false);
  });

  it('blocks translator-like audio unless it belongs to the active fence', () => {
    const fence = activeInterpretationFence(status);
    expect(classifyRemoteAudioTrust(status.agentIdentity, fence)).toBe('TRANSLATED');
    expect(classifyRemoteAudioTrust('translator-old', fence)).toBe('BLOCKED_AGENT');
    expect(classifyRemoteAudioTrust('patient-1', fence)).toBe('ORIGINAL');
    expect(classifyRemoteAudioTrust(status.agentIdentity, null)).toBe('BLOCKED_AGENT');
  });
});

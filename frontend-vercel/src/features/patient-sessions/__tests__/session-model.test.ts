import { describe, expect, it } from 'vitest';
import {
  buildFallbackPatientSessions,
  getPreferredPatientSessionId,
  getSessionDisplayTitle,
  normalizePatientSessions,
} from '../session-model';

describe('patient session model', () => {
  it('prefers hospital sessions ahead of the care-team session when selecting a default session', () => {
    const sessions = normalizePatientSessions({
      sessions: [
        {
          sessionId: 'widget-chat:patient-1:case-1',
          caseId: 'case-1',
          type: 'CARE_TEAM',
          title: 'Medora Care Team',
          hospitalId: null,
          hospitalName: null,
          isAiAvailable: true,
          unreadCount: 0,
          lastMessagePreview: 'Care team ready',
          lastMessageAt: '2026-04-18T00:02:00.000Z',
          updatedAt: '2026-04-18T00:02:00.000Z',
        },
        {
          sessionId: 'hospital:hospital-1:case-1',
          caseId: 'case-1',
          type: 'HOSPITAL',
          title: 'Ruijin Hospital',
          hospitalId: 'hospital-1',
          hospitalName: 'Ruijin Hospital',
          isAiAvailable: false,
          unreadCount: 0,
          lastMessagePreview: 'Hospital ready',
          lastMessageAt: '2026-04-18T00:01:00.000Z',
          updatedAt: '2026-04-18T00:01:00.000Z',
        },
      ],
      meta: {
        caseId: 'case-1',
        chatAuthority: 'AI_ACTIVE',
      },
    });

    expect(getPreferredPatientSessionId(sessions, null)).toBe('hospital:hospital-1:case-1');
  });

  it('uses the canonical care-team title and keeps the case authority on the care-team session', () => {
    const [session] = normalizePatientSessions({
      sessions: [
        {
          sessionId: 'widget-chat:patient-1:case-1',
          caseId: 'case-1',
          type: 'CARE_TEAM',
          title: '',
          hospitalId: null,
          hospitalName: null,
          isAiAvailable: false,
          unreadCount: 0,
          lastMessagePreview: null,
          lastMessageAt: null,
          updatedAt: '2026-04-18T00:02:00.000Z',
        },
      ],
      meta: {
        caseId: 'case-1',
        chatAuthority: 'HUMAN_TAKEOVER',
      },
    });

    expect(getSessionDisplayTitle(session)).toBe('Medora Care Team');
    expect(session.assistantMode).toBe('HUMAN_TAKEOVER');
    expect(session.displayTitle).toBe('Medora Care Team');
  });

  it('treats unknown fallback session prefixes as hospital sessions consistently', () => {
    const [session] = buildFallbackPatientSessions({
      activeConversationId: 'legacy:case-1',
      conversationIds: ['legacy:case-1'],
      activeAssistantMode: 'AI_ACTIVE',
    });

    expect(session.type).toBe('HOSPITAL');
    expect(session.sessionKind).toBe('hospital');
    expect(session.assistantMode).toBe('HUMAN_TAKEOVER');
  });

  it('injects the authoritative active session even when conversationIds omit it', () => {
    const sessions = buildFallbackPatientSessions({
      activeConversationId: 'widget-chat:patient-1:case-1',
      conversationIds: ['hospital:hospital-1:case-1'],
      activeAssistantMode: 'AI_ACTIVE',
    });

    expect(sessions.map((session) => session.id)).toContain('widget-chat:patient-1:case-1');
  });
});

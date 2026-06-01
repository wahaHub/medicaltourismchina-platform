import { describe, expect, it } from 'vitest';
import {
  getConversationDisplayTitle,
  getPreferredConversationId,
  normalizePatientConversations,
} from '../usePatientConversations';

describe('usePatientConversations helpers', () => {
  it('prefers hospital threads ahead of admin threads when choosing a default conversation', () => {
    const conversations = normalizePatientConversations([
      {
        id: 'conversation-admin-1',
        caseId: 'case-1',
        category: 'ADMIN_PATIENT',
        title: null,
        hospitalId: null,
        hospitalName: null,
        assistantMode: 'AI_ACTIVE',
        lastMessageAt: '2026-04-19T09:00:00.000Z',
        lastMessagePreview: 'Admin ready',
        lastSenderId: 'admin-1',
        createdAt: '2026-04-18T09:00:00.000Z',
        updatedAt: '2026-04-19T09:00:00.000Z',
      },
      {
        id: 'conversation-hospital-1',
        caseId: 'case-1',
        category: 'HOSPITAL_PATIENT',
        title: null,
        hospitalId: 'hospital-1',
        hospitalName: 'Shanghai East Hospital',
        assistantMode: 'HUMAN_TAKEOVER',
        lastMessageAt: '2026-04-18T09:00:00.000Z',
        lastMessagePreview: 'Hospital ready',
        lastSenderId: 'hospital-1',
        createdAt: '2026-04-17T09:00:00.000Z',
        updatedAt: '2026-04-18T09:00:00.000Z',
      },
    ]);

    expect(getPreferredConversationId(conversations, null)).toBe('conversation-hospital-1');
  });

  it('uses hospitalName as the fallback title for hospital threads', () => {
    expect(getConversationDisplayTitle({
      id: 'conversation-hospital-1',
      caseId: 'case-1',
      category: 'HOSPITAL_PATIENT',
      title: null,
      hospitalId: 'hospital-1',
      hospitalName: 'Shanghai East Hospital',
      assistantMode: 'HUMAN_TAKEOVER',
      lastMessageAt: null,
      lastMessagePreview: null,
      lastSenderId: null,
      createdAt: '2026-04-17T09:00:00.000Z',
      updatedAt: '2026-04-18T09:00:00.000Z',
    })).toBe('Shanghai East Hospital');
  });
});

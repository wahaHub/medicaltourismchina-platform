import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('patientMessagesApi session detail adapter', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exposes merged session detail payloads for runtime consumers without stripping chatbot rows', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({
          sessions: [
            {
              sessionId: 'widget-chat:patient-1:case-1',
              caseId: 'case-1',
              type: 'CARE_TEAM',
              title: 'Medora Care Team',
              hospitalId: null,
              hospitalName: null,
              isAiAvailable: false,
              unreadCount: 0,
              lastMessagePreview: 'Human reply',
              lastMessageAt: '2026-04-18T00:01:00.000Z',
              updatedAt: '2026-04-18T00:01:00.000Z',
            },
          ],
          meta: {
            caseId: 'case-1',
            chatAuthority: 'HUMAN_TAKEOVER',
          },
        })),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({
          sessionId: 'widget-chat:patient-1:case-1',
          caseId: 'case-1',
          type: 'CARE_TEAM',
          title: 'Medora Care Team',
          hospitalId: null,
          hospitalName: null,
          isAiAvailable: false,
          chatAuthority: 'HUMAN_TAKEOVER',
          data: [
            {
              id: 'msg-ai',
              sessionId: 'widget-chat:patient-1:case-1',
              source: 'CHATBOT',
              conversationId: null,
              senderId: null,
              senderRole: 'AI',
              senderName: 'Medora AI',
              content: 'AI reply',
              originalLanguage: null,
              translatedContent: null,
              messageType: 'TEXT',
              moderationStatus: null,
              attachments: [],
              createdAt: '2026-04-18T00:00:00.000Z',
            },
            {
              id: 'msg-admin',
              sessionId: 'widget-chat:patient-1:case-1',
              source: 'FORMAL',
              conversationId: 'conv-1',
              senderId: 'admin-1',
              senderRole: 'ADMIN',
              senderName: 'Medora Care Team',
              content: 'Human reply',
              originalLanguage: null,
              translatedContent: null,
              messageType: 'TEXT',
              moderationStatus: 'ALLOWED',
              attachments: [],
              createdAt: '2026-04-18T00:01:00.000Z',
            },
          ],
          total: 2,
          page: 1,
          limit: 50,
          totalPages: 1,
          hasMore: false,
        })),
      });
    vi.stubGlobal('fetch', fetchMock);

    const { listSessions, getSessionMessages } = await import('../patient-messages');

    const sessions = await listSessions({ caseId: 'case-1' });
    const detail = await getSessionMessages({
      sessionId: 'widget-chat:patient-1:case-1',
      limit: 50,
    });

    expect(sessions.meta.chatAuthority).toBe('HUMAN_TAKEOVER');
    expect(sessions.sessions).toEqual([
      expect.objectContaining({
        sessionId: 'widget-chat:patient-1:case-1',
        type: 'CARE_TEAM',
      }),
    ]);
    expect(detail.data).toEqual([
      expect.objectContaining({ id: 'msg-ai', source: 'CHATBOT', senderRole: 'AI' }),
      expect.objectContaining({ id: 'msg-admin', source: 'FORMAL', senderRole: 'ADMIN' }),
    ]);
  });

  it('maps session detail chatAuthority into legacy assistantMode and filters chatbot rows for legacy consumers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(JSON.stringify({
        sessionId: 'widget-chat:patient-1:case-1',
        caseId: 'case-1',
        type: 'CARE_TEAM',
        title: 'Medora Care Team',
        hospitalId: null,
        hospitalName: null,
        isAiAvailable: false,
        chatAuthority: 'HUMAN_TAKEOVER',
        data: [
          {
            id: 'msg-ai',
            sessionId: 'widget-chat:patient-1:case-1',
            source: 'CHATBOT',
            conversationId: null,
            senderId: null,
            senderRole: 'AI',
            senderName: 'Medora AI',
            content: 'AI reply',
            originalLanguage: null,
            translatedContent: null,
            messageType: 'TEXT',
            moderationStatus: null,
            attachments: [],
            createdAt: '2026-04-18T00:00:00.000Z',
          },
          {
            id: 'msg-admin',
            sessionId: 'widget-chat:patient-1:case-1',
            source: 'FORMAL',
            conversationId: 'conv-1',
            senderId: 'admin-1',
            senderRole: 'ADMIN',
            senderName: 'Medora Care Team',
            content: 'Human reply',
            originalLanguage: null,
            translatedContent: null,
            messageType: 'TEXT',
            moderationStatus: 'ALLOWED',
            attachments: [],
            createdAt: '2026-04-18T00:01:00.000Z',
          },
        ],
        total: 2,
        page: 1,
        limit: 50,
        totalPages: 1,
        hasMore: false,
      })),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { getConversationMessages } = await import('../patient-messages');

    const result = await getConversationMessages({
      conversationId: 'widget-chat:patient-1:case-1',
      limit: 50,
    });

    expect(result.assistantMode).toBe('HUMAN_TAKEOVER');
    expect(result.type).toBe('CARE_TEAM');
    expect(result.data).toEqual([
      expect.objectContaining({
        id: 'msg-admin',
        source: 'FORMAL',
        senderRole: 'ADMIN',
      }),
    ]);
  });

  it('keeps hospital session summaries and detail payloads on the formal HUMAN_TAKEOVER path even while case authority is AI_ACTIVE', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({
          sessions: [
            {
              sessionId: 'hospital:hospital-1:case-1',
              caseId: 'case-1',
              type: 'HOSPITAL',
              title: 'Ruijin Hospital',
              hospitalId: 'hospital-1',
              hospitalName: 'Ruijin Hospital',
              isAiAvailable: false,
              unreadCount: 0,
              lastMessagePreview: 'Hospital follow-up',
              lastMessageAt: '2026-04-18T00:02:00.000Z',
              updatedAt: '2026-04-18T00:02:00.000Z',
            },
          ],
          meta: {
            caseId: 'case-1',
            chatAuthority: 'AI_ACTIVE',
          },
        })),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(JSON.stringify({
          sessionId: 'hospital:hospital-1:case-1',
          caseId: 'case-1',
          type: 'HOSPITAL',
          title: 'Ruijin Hospital',
          hospitalId: 'hospital-1',
          hospitalName: 'Ruijin Hospital',
          isAiAvailable: false,
          chatAuthority: 'AI_ACTIVE',
          data: [
            {
              id: 'msg-hospital',
              sessionId: 'hospital:hospital-1:case-1',
              source: 'FORMAL',
              conversationId: 'conv-hospital-1',
              senderId: 'hospital-user-1',
              senderRole: 'HOSPITAL',
              senderName: 'Ruijin Hospital',
              content: 'Hospital follow-up',
              originalLanguage: null,
              translatedContent: null,
              messageType: 'TEXT',
              moderationStatus: 'ALLOWED',
              attachments: [],
              createdAt: '2026-04-18T00:02:00.000Z',
            },
          ],
          total: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
          hasMore: false,
        })),
      });
    vi.stubGlobal('fetch', fetchMock);

    const { listConversations, getConversationMessages } = await import('../patient-messages');

    const conversations = await listConversations();
    const detail = await getConversationMessages({
      conversationId: 'hospital:hospital-1:case-1',
      limit: 50,
    });

    expect(conversations).toEqual([
      expect.objectContaining({
        id: 'hospital:hospital-1:case-1',
        category: 'HOSPITAL_PATIENT',
        assistantMode: 'HUMAN_TAKEOVER',
      }),
    ]);
    expect(detail.assistantMode).toBe('HUMAN_TAKEOVER');
    expect(detail.data).toEqual([
      expect.objectContaining({
        id: 'msg-hospital',
        senderRole: 'HOSPITAL',
        source: 'FORMAL',
      }),
    ]);
  });

  it('passes caseId through to the session summary endpoint so authority is scoped server-side', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(JSON.stringify({
        sessions: [],
        meta: {
          caseId: 'case-1',
          chatAuthority: 'HUMAN_TAKEOVER',
        },
      })),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { listConversations } = await import('../patient-messages');

    await listConversations({ caseId: 'case-1' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/patient/conversations?caseId=case-1',
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });
});

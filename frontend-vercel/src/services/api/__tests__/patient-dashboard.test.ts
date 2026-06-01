import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listPatientCaseDocuments } from '../patient-dashboard';
import { patientMessagesApi } from '../patient-messages';

vi.mock('../patient-messages', () => ({
  patientMessagesApi: {
    listSessions: vi.fn(),
    getSessionMessages: vi.fn(),
  },
}));

describe('patientDashboardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('groups patient uploads and care-team reply documents from case conversations', async () => {
    vi.mocked(patientMessagesApi.listSessions).mockResolvedValue({
      meta: { caseId: 'case-1', chatAuthority: 'HUMAN_TAKEOVER' },
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
          lastMessagePreview: null,
          lastMessageAt: null,
          updatedAt: '2026-06-01T00:00:00.000Z',
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
          lastMessagePreview: null,
          lastMessageAt: null,
          updatedAt: '2026-06-01T00:00:00.000Z',
        },
      ],
    });

    vi.mocked(patientMessagesApi.getSessionMessages)
      .mockResolvedValueOnce({
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
            id: 'msg-patient',
            sessionId: 'widget-chat:patient-1:case-1',
            conversationId: 'conv-1',
            senderId: 'patient-1',
            senderRole: 'PATIENT',
            senderName: 'Patient',
            content: 'My report',
            originalLanguage: null,
            translatedContent: null,
            messageType: 'FILE',
            moderationStatus: 'ALLOWED',
            attachments: [{
              fileName: 'patient-report.pdf',
              mimeType: 'application/pdf',
              fileSize: 1024,
              storageKey: 'documents/patient-report.pdf',
              name: 'patient-report.pdf',
              type: 'application/pdf',
              size: 1024,
              url: 'https://example.com/patient-report.pdf',
            }],
            aiSummary: null,
            createdAt: '2026-06-01T01:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
        hasMore: false,
      })
      .mockResolvedValueOnce({
        sessionId: 'hospital:hospital-1:case-1',
        caseId: 'case-1',
        type: 'HOSPITAL',
        title: 'Ruijin Hospital',
        hospitalId: 'hospital-1',
        hospitalName: 'Ruijin Hospital',
        isAiAvailable: false,
        chatAuthority: 'HUMAN_TAKEOVER',
        data: [
          {
            id: 'msg-hospital',
            sessionId: 'hospital:hospital-1:case-1',
            conversationId: 'conv-2',
            senderId: 'hospital-user-1',
            senderRole: 'HOSPITAL',
            senderName: 'Doctor',
            content: 'Hospital reply',
            originalLanguage: null,
            translatedContent: null,
            messageType: 'FILE',
            moderationStatus: 'ALLOWED',
            attachments: [{
              fileName: 'hospital-plan.pdf',
              mimeType: 'application/pdf',
              fileSize: 2048,
              storageKey: 'documents/hospital-plan.pdf',
              name: 'hospital-plan.pdf',
              type: 'application/pdf',
              size: 2048,
              url: 'https://example.com/hospital-plan.pdf',
            }],
            aiSummary: null,
            createdAt: '2026-06-01T02:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 100,
        totalPages: 1,
        hasMore: false,
      });

    const result = await listPatientCaseDocuments('case-1');

    expect(patientMessagesApi.listSessions).toHaveBeenCalledWith({ caseId: 'case-1' });
    expect(result.uploadedDocuments).toEqual([
      expect.objectContaining({
        fileName: 'patient-report.pdf',
        source: 'PATIENT_UPLOAD',
        sessionTitle: 'Medora Care Team',
      }),
    ]);
    expect(result.hospitalReplyDocuments).toEqual([
      expect.objectContaining({
        fileName: 'hospital-plan.pdf',
        source: 'CARE_TEAM_REPLY',
        hospitalName: 'Ruijin Hospital',
      }),
    ]);
  });
});

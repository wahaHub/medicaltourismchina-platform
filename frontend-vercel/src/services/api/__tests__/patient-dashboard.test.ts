import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listPatientCaseDocuments, uploadPatientCaseDocument } from '../patient-dashboard';
import { patientMessagesApi } from '../patient-messages';

vi.mock('../patient-messages', () => ({
  patientMessagesApi: {
    listSessions: vi.fn(),
    getSessionMessages: vi.fn(),
    initSessionAttachmentUpload: vi.fn(),
    sendSessionChatEvent: vi.fn(),
    getUploadStatus: vi.fn(),
  },
}));

describe('patientDashboardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    vi.mocked(patientMessagesApi.getUploadStatus).mockResolvedValue({
      status: 'INITIATED', effectiveStatus: 'INITIATED', documentId: null,
    });
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

  it('uploads medical records directly and completes the server upload intent', async () => {
    const file = {
      name: 'medical-record.pdf',
      size: 1024,
      type: 'application/pdf',
    } as File;
    vi.mocked(patientMessagesApi.initSessionAttachmentUpload).mockResolvedValue({
      upload: {
        uploadUrl: 'https://upload.example.test/presigned',
        storageKey: 'crm/test/messages/asset.pdf',
        expiresIn: 600,
        uploadIntentId: 'intent-1',
        traceId: 'trace-1',
        expiresAt: '2026-08-20T12:00:00.000Z',
        requiredHeaders: {
          'Content-Type': 'application/pdf',
          'If-None-Match': '*',
        },
      },
      asset: {
        fileName: 'medical-record.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024,
        storageKey: 'crm/test/messages/asset.pdf',
      },
      message: {
        serverMessageId: 'message-1',
        clientMessageId: 'client-1',
        deliveryStatus: 'uploading',
      },
    });
    vi.mocked(patientMessagesApi.sendSessionChatEvent).mockResolvedValue({} as never);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);

    await uploadPatientCaseDocument({
      sessionId: 'session-1',
      file,
      description: 'Latest scan',
    });

    expect(fetchMock).toHaveBeenCalledWith('https://upload.example.test/presigned', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/pdf',
        'If-None-Match': '*',
      },
      body: file,
    });
    expect(patientMessagesApi.sendSessionMessage).toBeUndefined();
    expect(patientMessagesApi.sendSessionChatEvent).toHaveBeenCalledWith({
      sessionId: 'session-1',
      eventType: 'ATTACHMENT_UPLOAD_COMPLETED',
      uploadIntentId: 'intent-1',
      serverMessageId: 'message-1',
      clientMessageId: 'client-1',
      payload: { description: 'Latest scan' },
    });
  });

  it('retries only completion after a 5xx without another init or PUT', async () => {
    const file = new File(['record'], 'medical-record.pdf', { type: 'application/pdf', lastModified: 1 });
    vi.mocked(patientMessagesApi.initSessionAttachmentUpload).mockResolvedValue({
      upload: {
        uploadUrl: 'https://upload.example.test/presigned', storageKey: 'opaque', expiresIn: 600,
        uploadIntentId: 'intent-1', traceId: 'trace-1', expiresAt: '2030-01-01T00:00:00.000Z',
        requiredHeaders: { 'Content-Type': 'application/pdf', 'If-None-Match': '*' },
      },
      asset: { fileName: file.name, mimeType: file.type, fileSize: file.size, storageKey: 'opaque' },
      message: { serverMessageId: 'message-1', clientMessageId: 'client-1', deliveryStatus: 'uploading' },
    });
    vi.mocked(patientMessagesApi.sendSessionChatEvent)
      .mockRejectedValueOnce(new Error('completion 500'))
      .mockResolvedValueOnce({} as never);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);

    await expect(uploadPatientCaseDocument({ sessionId: 'session-1', file })).rejects.toThrow('completion 500');
    await expect(uploadPatientCaseDocument({ sessionId: 'session-1', file })).resolves.toEqual({ ok: true });

    expect(patientMessagesApi.initSessionAttachmentUpload).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(patientMessagesApi.getUploadStatus).toHaveBeenCalledWith('intent-1');
  });

  it('recovers a lost completion response from completed status after refresh', async () => {
    const file = new File(['record'], 'medical-record.pdf', { type: 'application/pdf', lastModified: 2 });
    const key = `medora-patient-upload-completion:v1:${encodeURIComponent(['session-1', file.name, file.size, file.type, file.lastModified].join(':'))}`;
    window.sessionStorage.setItem(key, JSON.stringify({ uploadIntentId: 'intent-completed', serverMessageId: 'message-1', clientMessageId: 'client-1' }));
    vi.mocked(patientMessagesApi.getUploadStatus).mockResolvedValue({
      status: 'COMPLETED', effectiveStatus: 'COMPLETED', documentId: 'document-1',
    });

    await expect(uploadPatientCaseDocument({ sessionId: 'session-1', file })).resolves.toEqual({ ok: true });

    expect(patientMessagesApi.initSessionAttachmentUpload).not.toHaveBeenCalled();
    expect(patientMessagesApi.sendSessionChatEvent).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});

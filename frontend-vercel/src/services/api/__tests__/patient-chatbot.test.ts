import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crmApiRequest } from '../crmApiClient';
import { initAttachmentUpload, sendMessage } from '../patient-chatbot-v3';

vi.mock('../crmApiClient', () => ({
  crmApiRequest: vi.fn(),
}));

describe('patientChatbotV3Api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts chatbot v3 messages with attachment refs', async () => {
    vi.mocked(crmApiRequest).mockResolvedValue({ ok: true } as never);

    await sendMessage({
      sessionId: 'widget-session-1',
      message: 'Please review this document',
      attachments: [{
        fileName: 'report.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        storageKey: 'crm/dev/chatbot/report.pdf',
      }],
    });

    expect(vi.mocked(crmApiRequest)).toHaveBeenCalledWith('/api/v3/chatbot/chat', {
      method: 'POST',
      timeoutMs: 10000,
      body: JSON.stringify({
        sessionId: 'widget-session-1',
        message: 'Please review this document',
        attachments: [{
          fileName: 'report.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf',
          storageKey: 'crm/dev/chatbot/report.pdf',
        }],
      }),
    });
  });

  it('posts pageContext when the widget turn comes from a hospital detail page', async () => {
    vi.mocked(crmApiRequest).mockResolvedValue({ ok: true } as never);

    await sendMessage({
      sessionId: 'widget-session-1',
      message: 'What should I know about this hospital?',
      pageContext: {
        type: 'HOSPITAL_DETAIL',
        hospitalId: 'hospital-123',
      },
    });

    expect(vi.mocked(crmApiRequest)).toHaveBeenCalledWith('/api/v3/chatbot/chat', {
      method: 'POST',
      timeoutMs: 10000,
      body: JSON.stringify({
        sessionId: 'widget-session-1',
        message: 'What should I know about this hospital?',
        pageContext: {
          type: 'HOSPITAL_DETAIL',
          hospitalId: 'hospital-123',
        },
      }),
    });
  });

  it('initializes chatbot v3 attachment uploads through the public upload-init route', async () => {
    vi.mocked(crmApiRequest).mockResolvedValue({ ok: true } as never);

    await initAttachmentUpload({
      sessionId: 'widget-session-1',
      fileName: 'report.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
    });

    expect(vi.mocked(crmApiRequest)).toHaveBeenCalledWith('/api/v3/chatbot/uploads/init', {
      method: 'POST',
      timeoutMs: 10000,
      body: JSON.stringify({
        sessionId: 'widget-session-1',
        fileName: 'report.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
      }),
    });
  });
});

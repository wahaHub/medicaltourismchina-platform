import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import PatientChatComposer from '../PatientChatComposer';
import type { CompactChatMessage } from '../PatientChatMessageList';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { ApiError } from '@/services/api/crmApiClient';
import { patientMessagesApi } from '@/services/api/patient-messages';
import { normalizeChatbotV3Turn } from '@/services/chatbot-v3-normalizer';
import { patientChatbotV3Api } from '@/services/api/patient-chatbot-v3';

vi.mock('@/hooks/usePatientAuth', () => ({
  usePatientAuth: vi.fn(),
}));

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: vi.fn(),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

vi.mock('@/services/api/patient-messages', () => ({
  patientMessagesApi: {
    initSessionAttachmentUpload: vi.fn(),
    sendSessionMessage: vi.fn(),
    sendSessionChatEvent: vi.fn(),
    getUploadStatus: vi.fn(),
  },
}));

vi.mock('@/services/api/patient-chatbot-v3', () => ({
  patientChatbotV3Api: {
    sendMessage: vi.fn(),
    initAttachmentUpload: vi.fn(),
  },
}));

describe('PatientChatComposer attachments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        apiCode: 'en',
      },
    } as never);
    vi.mocked(usePatientAuth).mockReturnValue({
      expirePatientSession: vi.fn(),
    } as never);
    vi.mocked(usePatientEntry).mockReturnValue({
      phase: 'messages-ready',
    } as never);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(''),
      }),
    );
    vi.mocked(patientMessagesApi.getUploadStatus).mockResolvedValue({
      status: 'INITIATED', effectiveStatus: 'INITIATED', documentId: null,
    });
  });

  it('completes formal attachments before sending accompanying text when assistantMode is HUMAN_TAKEOVER', async () => {
    const onMessagesSent = vi.fn();

    vi.mocked(patientMessagesApi.initSessionAttachmentUpload).mockResolvedValue({
      upload: {
        uploadUrl: 'https://upload.example.com/file-1',
        storageKey: 'storage-key-1',
        expiresIn: 900,
      },
      asset: {
        fileName: 'lab-report.pdf',
        mimeType: 'application/pdf',
        fileSize: 12,
        storageKey: 'storage-key-1',
      },
    });

    vi.mocked(patientMessagesApi.sendSessionMessage).mockResolvedValue({
      id: 'message-1',
      sessionId: 'conversation-1',
      conversationId: null,
      senderId: 'patient-1',
      senderRole: 'PATIENT',
      senderName: 'Patient',
      content: 'Please review',
      originalLanguage: null,
      translatedContent: null,
      messageType: 'FILE',
      moderationStatus: 'APPROVED',
      attachments: [],
      aiSummary: null,
      createdAt: '2026-04-05T00:00:00.000Z',
    } as never);
    vi.mocked(patientMessagesApi.sendSessionChatEvent).mockResolvedValue({} as never);

    render(
      <PatientChatComposer
        sessionId="conversation-1"
        assistantMode="HUMAN_TAKEOVER"
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
        onMessagesSent={onMessagesSent}
      />,
    );

    const fileInput = screen.getByLabelText('Attach files');
    const textarea = screen.getByRole('textbox');
    const file = new File(['hello'], 'lab-report.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.change(textarea, { target: { value: 'Please review' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(patientMessagesApi.initSessionAttachmentUpload).toHaveBeenCalledWith({
        sessionId: 'conversation-1',
        fileName: 'lab-report.pdf',
        fileSize: file.size,
        mimeType: 'application/pdf',
        clientMessageId: expect.stringMatching(/^formal-upload:/),
        uploadBatchId: expect.stringMatching(/^upload-batch:/),
        uploadBatchSize: 1,
        locale: 'en',
      });
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://upload.example.com/file-1',
      expect.objectContaining({
        method: 'PUT',
        body: file,
      }),
    );

    expect(patientMessagesApi.sendSessionChatEvent).toHaveBeenCalledWith({
      sessionId: 'conversation-1',
      eventType: 'ATTACHMENT_UPLOAD_COMPLETED',
      clientMessageId: expect.stringMatching(/^formal-upload:/),
      locale: 'en',
      payload: {
        attachments: [{
          fileName: 'lab-report.pdf',
          mimeType: 'application/pdf',
          fileSize: 12,
          storageKey: 'storage-key-1',
        }],
      },
    });
    expect(patientMessagesApi.sendSessionMessage).toHaveBeenCalledWith({
      sessionId: 'conversation-1',
      content: 'Please review',
      messageType: 'TEXT',
    });
    expect(patientChatbotV3Api.sendMessage).not.toHaveBeenCalled();
    expect(onMessagesSent).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'message-1',
        role: 'patient',
        content: 'Please review',
        messageSource: 'formal',
        messageState: 'sent',
      }),
    ]);
  });

  it('automatically uploads selected files to the formal session in mechanical mode', async () => {
    const onMessageMutation = vi.fn();
    vi.mocked(patientMessagesApi.initSessionAttachmentUpload).mockResolvedValue({
      upload: {
        uploadUrl: 'https://upload.example.com/mechanical-file',
        storageKey: 'mechanical-storage-key',
        expiresIn: 900,
      },
      asset: {
        fileName: 'ct-scan.pdf',
        mimeType: 'application/pdf',
        fileSize: 16,
        storageKey: 'mechanical-storage-key',
      },
      message: {
        serverMessageId: 'server-message-1',
        clientMessageId: 'client-message-1',
        deliveryStatus: 'uploading',
      },
    });
    vi.mocked(patientMessagesApi.sendSessionMessage).mockResolvedValue({
      id: 'mechanical-message-1',
      sessionId: 'widget-chat:patient-1:case-1',
      conversationId: null,
      senderId: 'patient-1',
      senderRole: 'PATIENT',
      senderName: 'Patient',
      content: '',
      originalLanguage: null,
      translatedContent: null,
      messageType: 'FILE',
      moderationStatus: 'APPROVED',
      attachments: [],
      aiSummary: null,
      createdAt: '2026-06-02T00:00:00.000Z',
    } as never);

    render(
      <PatientChatComposer
        sessionId="widget-chat:patient-1:case-1"
        assistantMode="AI_ACTIVE"
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
        onMessageMutation={onMessageMutation}
        mechanicalMode
      />,
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveProperty('disabled', false);

    const file = new File(['scan'], 'ct-scan.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Attach files'), { target: { files: [file] } });

    await waitFor(() => {
      expect(patientMessagesApi.initSessionAttachmentUpload).toHaveBeenCalledWith({
        sessionId: 'widget-chat:patient-1:case-1',
        fileName: 'ct-scan.pdf',
        fileSize: file.size,
        mimeType: 'application/pdf',
        mechanicalMode: true,
        clientMessageId: expect.stringMatching(/^formal-upload:/),
        uploadBatchId: expect.stringMatching(/^upload-batch:/),
        uploadBatchSize: 1,
        locale: 'en',
      });
    });

    expect(patientMessagesApi.sendSessionMessage).not.toHaveBeenCalled();
    expect(patientMessagesApi.sendSessionChatEvent).toHaveBeenCalledWith({
      sessionId: 'widget-chat:patient-1:case-1',
      eventType: 'ATTACHMENT_UPLOAD_COMPLETED',
      clientMessageId: 'client-message-1',
      serverMessageId: 'server-message-1',
      locale: 'en',
      payload: {
        attachments: [{
          fileName: 'ct-scan.pdf',
          mimeType: 'application/pdf',
          fileSize: 16,
          storageKey: 'mechanical-storage-key',
        }],
      },
    });
    expect(patientChatbotV3Api.sendMessage).not.toHaveBeenCalled();
    expect(onMessageMutation).toHaveBeenCalledWith(expect.objectContaining({
      add: [expect.objectContaining({
        role: 'patient',
        messageSource: 'formal',
        messageState: 'sending',
        attachments: [expect.objectContaining({
          fileName: 'ct-scan.pdf',
        })],
      })],
    }));
  });

  it('sends free-text messages to the formal session in mechanical mode', async () => {
    vi.mocked(patientMessagesApi.sendSessionMessage).mockResolvedValue({
      id: 'mechanical-text-message-1',
      sessionId: 'widget-chat:patient-1:case-1',
      conversationId: null,
      senderId: 'patient-1',
      senderRole: 'PATIENT',
      senderName: 'Patient',
      content: 'I have an additional symptom to share.',
      originalLanguage: null,
      translatedContent: null,
      messageType: 'TEXT',
      moderationStatus: 'APPROVED',
      attachments: [],
      aiSummary: null,
      createdAt: '2026-06-02T00:00:00.000Z',
    } as never);

    render(
      <PatientChatComposer
        sessionId="widget-chat:patient-1:case-1"
        assistantMode="AI_ACTIVE"
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
        mechanicalMode
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'I have an additional symptom to share.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(patientMessagesApi.sendSessionMessage).toHaveBeenCalledWith({
        sessionId: 'widget-chat:patient-1:case-1',
        content: 'I have an additional symptom to share.',
        messageType: 'TEXT',
        mechanicalMode: true,
        attachments: [],
      });
    });
    expect(patientChatbotV3Api.sendMessage).not.toHaveBeenCalled();
  });

  it('marks the optimistic mechanical upload block failed and reports failure when upload fails', async () => {
    const onMessageMutation = vi.fn();
    const onMechanicalUploadFailed = vi.fn();

    vi.mocked(patientMessagesApi.initSessionAttachmentUpload).mockRejectedValue(
      new Error('R2 upload init failed'),
    );

    render(
      <PatientChatComposer
        sessionId="widget-chat:patient-1:case-1"
        assistantMode="AI_ACTIVE"
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
        onMessageMutation={onMessageMutation}
        onMechanicalUploadFailed={onMechanicalUploadFailed}
        mechanicalMode
      />,
    );

    const file = new File(['scan'], 'ct-scan.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Attach files'), { target: { files: [file] } });

    await waitFor(() => {
      expect(onMechanicalUploadFailed).toHaveBeenCalledWith(expect.any(Error));
    });

    expect(onMessageMutation).toHaveBeenCalledWith(expect.objectContaining({
      add: [expect.objectContaining({
        messageState: 'sending',
        attachments: [expect.objectContaining({ fileName: 'ct-scan.pdf' })],
      })],
    }));
    expect(onMessageMutation).toHaveBeenCalledWith(expect.objectContaining({
      update: [expect.objectContaining({
        messageState: 'failed',
      })],
    }));
    expect(patientMessagesApi.sendSessionChatEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'ATTACHMENT_UPLOAD_FAILED',
      locale: 'en',
    }));
    expect(patientMessagesApi.sendSessionMessage).not.toHaveBeenCalled();
  });

  it('retries only the failed mechanical upload using its original message and batch ids', async () => {
    const onMessageMutation = vi.fn();
    let retryHandler: ((message: CompactChatMessage) => void) | null = null;
    vi.mocked(patientMessagesApi.initSessionAttachmentUpload)
      .mockRejectedValueOnce(new Error('first upload failed'))
      .mockResolvedValueOnce({
        upload: {
          uploadUrl: 'https://upload.example.com/retry-file',
          storageKey: 'retry-storage-key',
          expiresIn: 900,
        },
        asset: {
          fileName: 'retry-report.pdf',
          mimeType: 'application/pdf',
          fileSize: 5,
          storageKey: 'retry-storage-key',
        },
        message: {
          serverMessageId: 'server-retry-1',
          clientMessageId: 'client-retry-1',
          deliveryStatus: 'uploading',
        },
      });

    render(
      <PatientChatComposer
        sessionId="widget-chat:patient-1:case-1"
        assistantMode="AI_ACTIVE"
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
        onMessageMutation={onMessageMutation}
        registerMechanicalUploadRetry={(handler) => {
          retryHandler = handler;
        }}
        mechanicalMode
      />,
    );

    const file = new File(['retry'], 'retry-report.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Attach files'), { target: { files: [file] } });
    await waitFor(() => {
      expect(onMessageMutation).toHaveBeenCalledWith(expect.objectContaining({
        update: [expect.objectContaining({ messageState: 'failed' })],
      }));
    });

    const optimisticMessage = onMessageMutation.mock.calls
      .find(([mutation]) => mutation.add?.[0]?.clientMessageId)?.[0].add[0];
    expect(optimisticMessage).toBeTruthy();
    expect(retryHandler).not.toBeNull();

    await act(async () => {
      retryHandler?.(optimisticMessage);
    });

    await waitFor(() => {
      expect(patientMessagesApi.initSessionAttachmentUpload).toHaveBeenCalledTimes(2);
    });
    const firstInput = vi.mocked(patientMessagesApi.initSessionAttachmentUpload).mock.calls[0]?.[0];
    const retryInput = vi.mocked(patientMessagesApi.initSessionAttachmentUpload).mock.calls[1]?.[0];
    expect(retryInput).toEqual(expect.objectContaining({
      clientMessageId: firstInput?.clientMessageId,
      uploadBatchId: firstInput?.uploadBatchId,
      uploadBatchSize: 1,
    }));
    expect(patientMessagesApi.sendSessionChatEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'ATTACHMENT_UPLOAD_COMPLETED',
      clientMessageId: 'client-retry-1',
      serverMessageId: 'server-retry-1',
    }));
  });

  it('retries completion without re-initializing or re-uploading after a completion 5xx', async () => {
    const onMessageMutation = vi.fn();
    let retryHandler: ((message: CompactChatMessage) => void) | null = null;
    vi.mocked(patientMessagesApi.initSessionAttachmentUpload).mockResolvedValue({
      upload: {
        uploadUrl: 'https://upload.example.com/completion-only', storageKey: 'opaque-key', expiresIn: 900,
        uploadIntentId: 'intent-completion-only', traceId: 'trace-1', expiresAt: '2030-01-01T00:00:00.000Z',
        requiredHeaders: { 'Content-Type': 'application/pdf', 'If-None-Match': '*' },
      },
      asset: { fileName: 'completion-only.pdf', mimeType: 'application/pdf', fileSize: 7, storageKey: 'opaque-key' },
      message: { serverMessageId: 'server-1', clientMessageId: 'client-1', deliveryStatus: 'uploading' },
    });
    vi.mocked(patientMessagesApi.sendSessionChatEvent)
      .mockRejectedValueOnce(new Error('completion 500'))
      .mockResolvedValueOnce({} as never)
      .mockResolvedValueOnce({} as never);

    render(
      <PatientChatComposer
        sessionId="widget-chat:patient-1:case-1" assistantMode="AI_ACTIVE"
        widgetChatTarget={{ sessionId: 'widget-session-1' }} onMessageMutation={onMessageMutation}
        registerMechanicalUploadRetry={(handler) => { retryHandler = handler; }} mechanicalMode
      />,
    );
    const file = new File(['content'], 'completion-only.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Attach files'), { target: { files: [file] } });
    await waitFor(() => expect(onMessageMutation).toHaveBeenCalledWith(expect.objectContaining({
      update: [expect.objectContaining({ messageState: 'failed' })],
    })));
    const failedMessage = onMessageMutation.mock.calls.find(([mutation]) => mutation.add?.[0]?.clientMessageId)?.[0].add[0];

    await act(async () => { retryHandler?.(failedMessage); });
    await waitFor(() => expect(patientMessagesApi.getUploadStatus).toHaveBeenCalledWith('intent-completion-only'));

    expect(patientMessagesApi.initSessionAttachmentUpload).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(patientMessagesApi.sendSessionChatEvent).toHaveBeenLastCalledWith(expect.objectContaining({
      eventType: 'ATTACHMENT_UPLOAD_COMPLETED', uploadIntentId: 'intent-completion-only',
    }));
  });

  it('treats a lost completion response as complete after refresh/status without another PUT', async () => {
    const onMessageMutation = vi.fn();
    let retryHandler: ((message: CompactChatMessage) => void) | null = null;
    vi.mocked(patientMessagesApi.getUploadStatus).mockResolvedValue({
      status: 'COMPLETED', effectiveStatus: 'COMPLETED', documentId: 'document-1',
    });
    render(
      <PatientChatComposer
        sessionId="widget-chat:patient-1:case-1" assistantMode="AI_ACTIVE"
        widgetChatTarget={{ sessionId: 'widget-session-1' }} onMessageMutation={onMessageMutation}
        registerMechanicalUploadRetry={(handler) => { retryHandler = handler; }} mechanicalMode
      />,
    );
    const refreshedMessage: CompactChatMessage = {
      id: 'server-refreshed', clientMessageId: 'client-refreshed', role: 'patient', messageSource: 'formal', content: '',
      createdAt: '2026-08-20T00:00:00.000Z', senderType: 'patient', messageState: 'failed', uploadIntentId: 'intent-refreshed',
      attachments: [{ fileName: 'report.pdf', mimeType: 'application/pdf', fileSize: 5, storageKey: 'opaque', name: 'report.pdf', type: 'application/pdf', size: 5, url: '' }],
    };

    await act(async () => { retryHandler?.(refreshedMessage); });
    await waitFor(() => expect(patientMessagesApi.getUploadStatus).toHaveBeenCalledWith('intent-refreshed'));

    expect(patientMessagesApi.initSessionAttachmentUpload).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(patientMessagesApi.sendSessionChatEvent).not.toHaveBeenCalled();
  });

  it('retries HUMAN_TAKEOVER completion without another init or PUT after a completion 5xx', async () => {
    let retryHandler: ((message: CompactChatMessage) => void) | null = null;
    vi.mocked(patientMessagesApi.initSessionAttachmentUpload).mockResolvedValue({
      upload: {
        uploadUrl: 'https://upload.example.com/human-completion', storageKey: 'human-key', expiresIn: 900,
        uploadIntentId: 'intent-human', traceId: 'trace-human', expiresAt: '2030-01-01T00:00:00.000Z',
        requiredHeaders: { 'Content-Type': 'application/pdf', 'If-None-Match': '*' },
      },
      asset: { fileName: 'human.pdf', mimeType: 'application/pdf', fileSize: 5, storageKey: 'human-key' },
      message: { serverMessageId: 'server-human', clientMessageId: 'client-human', deliveryStatus: 'uploading' },
    });
    vi.mocked(patientMessagesApi.sendSessionChatEvent)
      .mockRejectedValueOnce(new Error('completion 500'))
      .mockResolvedValueOnce({} as never)
      .mockResolvedValueOnce({} as never);

    render(
      <PatientChatComposer
        sessionId="conversation-human" assistantMode="HUMAN_TAKEOVER"
        registerMechanicalUploadRetry={(handler) => { retryHandler = handler; }}
      />,
    );
    const file = new File(['human'], 'human.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Attach files'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(screen.getByText('completion 500')).toBeTruthy());

    await act(async () => {
      retryHandler?.({
        id: 'server-human', clientMessageId: 'client-human', role: 'patient', messageSource: 'formal', content: '',
        createdAt: '2026-08-20T00:00:00.000Z', senderType: 'patient', messageState: 'failed', uploadIntentId: 'intent-human',
        attachments: [{ fileName: 'human.pdf', mimeType: 'application/pdf', fileSize: 5, storageKey: 'human-key', name: 'human.pdf', type: 'application/pdf', size: 5, url: '' }],
      });
    });
    await waitFor(() => expect(patientMessagesApi.getUploadStatus).toHaveBeenCalledWith('intent-human'));

    expect(patientMessagesApi.initSessionAttachmentUpload).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(patientMessagesApi.sendSessionChatEvent).toHaveBeenLastCalledWith(expect.objectContaining({
      eventType: 'ATTACHMENT_UPLOAD_COMPLETED', uploadIntentId: 'intent-human',
    }));
  });

  it('completes a refreshed HUMAN_TAKEOVER INITIATED message before asking for the file again', async () => {
    let retryHandler: ((message: CompactChatMessage) => void) | null = null;
    render(
      <PatientChatComposer
        sessionId="conversation-human" assistantMode="HUMAN_TAKEOVER"
        registerMechanicalUploadRetry={(handler) => { retryHandler = handler; }}
      />,
    );
    const refreshedMessage: CompactChatMessage = {
      id: 'server-human-refresh', clientMessageId: 'client-human-refresh', role: 'patient', messageSource: 'formal', content: '',
      createdAt: '2026-08-20T00:00:00.000Z', senderType: 'patient', messageState: 'failed', uploadIntentId: 'intent-human-refresh',
      attachments: [{ fileName: 'human.pdf', mimeType: 'application/pdf', fileSize: 5, storageKey: 'human-key', name: 'human.pdf', type: 'application/pdf', size: 5, url: '' }],
    };

    await act(async () => { retryHandler?.(refreshedMessage); });
    await waitFor(() => expect(patientMessagesApi.sendSessionChatEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'ATTACHMENT_UPLOAD_COMPLETED', uploadIntentId: 'intent-human-refresh',
    })));

    expect(patientMessagesApi.initSessionAttachmentUpload).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    { label: 'AI_ACTIVE', assistantMode: 'AI_ACTIVE' as const, mechanicalMode: true },
    { label: 'HUMAN_TAKEOVER', assistantMode: 'HUMAN_TAKEOVER' as const, mechanicalMode: false },
  ])('tries idempotent completion when $label status GET returns 5xx', async ({ assistantMode, mechanicalMode }) => {
    let retryHandler: ((message: CompactChatMessage) => void) | null = null;
    vi.mocked(patientMessagesApi.getUploadStatus).mockRejectedValue(new Error('status 500'));
    vi.mocked(patientMessagesApi.sendSessionChatEvent).mockResolvedValue({} as never);
    render(
      <PatientChatComposer
        sessionId="conversation-status-down"
        assistantMode={assistantMode}
        widgetChatTarget={assistantMode === 'AI_ACTIVE' ? { sessionId: 'widget-session-1' } : undefined}
        mechanicalMode={mechanicalMode}
        registerMechanicalUploadRetry={(handler) => { retryHandler = handler; }}
      />,
    );
    const refreshedMessage: CompactChatMessage = {
      id: 'server-status-down',
      clientMessageId: 'client-status-down',
      role: 'patient',
      messageSource: 'formal',
      content: '',
      createdAt: '2026-08-20T00:00:00.000Z',
      senderType: 'patient',
      messageState: 'failed',
      uploadIntentId: 'intent-status-down',
      attachments: [{
        fileName: 'report.pdf', mimeType: 'application/pdf', fileSize: 5, storageKey: 'opaque-key',
        name: 'report.pdf', type: 'application/pdf', size: 5, url: '',
      }],
    };

    await act(async () => { retryHandler?.(refreshedMessage); });

    await waitFor(() => expect(patientMessagesApi.sendSessionChatEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'ATTACHMENT_UPLOAD_COMPLETED',
      uploadIntentId: 'intent-status-down',
    })));
    expect(patientMessagesApi.getUploadStatus).toHaveBeenCalledWith('intent-status-down');
    expect(patientMessagesApi.initSessionAttachmentUpload).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('keeps successful mechanical uploads sent when another selected file fails', async () => {
    const onMessageMutation = vi.fn();
    const onMechanicalUploadFailed = vi.fn();

    vi.mocked(patientMessagesApi.initSessionAttachmentUpload)
      .mockResolvedValueOnce({
        upload: {
          uploadUrl: 'https://upload.example.com/success-file',
          storageKey: 'success-storage-key',
          expiresIn: 900,
        },
        asset: {
          fileName: 'successful-report.pdf',
          mimeType: 'application/pdf',
          fileSize: 14,
          storageKey: 'success-storage-key',
        },
        message: {
          serverMessageId: 'server-success-1',
          clientMessageId: 'client-success-1',
          deliveryStatus: 'uploading',
        },
      })
      .mockRejectedValueOnce(new Error('second file failed'));

    render(
      <PatientChatComposer
        sessionId="widget-chat:patient-1:case-1"
        assistantMode="AI_ACTIVE"
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
        onMessageMutation={onMessageMutation}
        onMechanicalUploadFailed={onMechanicalUploadFailed}
        mechanicalMode
      />,
    );

    const successFile = new File(['success'], 'successful-report.pdf', { type: 'application/pdf' });
    const failedFile = new File(['failed'], 'failed-report.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Attach files'), { target: { files: [successFile, failedFile] } });

    await waitFor(() => {
      expect(onMechanicalUploadFailed).toHaveBeenCalledWith(expect.any(Error));
    });

    const addCall = onMessageMutation.mock.calls.find(([mutation]) => Array.isArray(mutation.add) && mutation.add.length === 2);
    const optimisticIds = addCall?.[0].add.map((message: { id: string }) => message.id) ?? [];
    expect(optimisticIds).toHaveLength(2);
    const initCalls = vi.mocked(patientMessagesApi.initSessionAttachmentUpload).mock.calls;
    expect(initCalls[0]?.[0].uploadBatchId).toMatch(/^upload-batch:/);
    expect(initCalls[1]?.[0].uploadBatchId).toBe(initCalls[0]?.[0].uploadBatchId);
    expect(initCalls.every(([input]) => input.uploadBatchSize === 2)).toBe(true);

    expect(patientMessagesApi.sendSessionChatEvent).toHaveBeenCalledWith({
      sessionId: 'widget-chat:patient-1:case-1',
      eventType: 'ATTACHMENT_UPLOAD_COMPLETED',
      clientMessageId: 'client-success-1',
      serverMessageId: 'server-success-1',
      locale: 'en',
      payload: {
        attachments: [{
          fileName: 'successful-report.pdf',
          mimeType: 'application/pdf',
          fileSize: 14,
          storageKey: 'success-storage-key',
        }],
      },
    });
    expect(patientMessagesApi.sendSessionChatEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'ATTACHMENT_UPLOAD_FAILED',
      clientMessageId: optimisticIds[1],
      locale: 'en',
    }));
    expect(onMessageMutation).toHaveBeenCalledWith(expect.objectContaining({
      removeIds: [optimisticIds[0]],
    }));
    expect(onMessageMutation).toHaveBeenCalledWith(expect.objectContaining({
      update: [expect.objectContaining({
        id: optimisticIds[1],
        messageState: 'failed',
      })],
    }));
    expect(patientMessagesApi.sendSessionMessage).not.toHaveBeenCalled();
  });

  it('routes AI_ACTIVE sends through the widget chatbot session and refreshes the formal conversation afterward', async () => {
    const onConversationRefresh = vi.fn();
    const onMessageMutation = vi.fn();

    vi.mocked(patientChatbotV3Api.sendMessage).mockResolvedValue({
      messages: [{
        role: 'assistant',
        text: 'Tell me more about your symptoms.',
      }],
      turnOutcome: {
        status: 'ok',
        recoverableErrorCode: null,
      },
      cards: [],
      journey: {
        stage: 'COLLECT_MINIMAL_MEDICAL_FACTS',
        phase: 'active',
      },
      handoff: {
        required: false,
        ticketId: null,
      },
    });

    render(
      <PatientChatComposer
        sessionId="conversation-1"
        assistantMode="AI_ACTIVE"
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
        onConversationRefresh={onConversationRefresh}
        onMessageMutation={onMessageMutation}
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'I have persistent eye pain' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(patientChatbotV3Api.sendMessage).toHaveBeenCalledWith({
        sessionId: 'widget-session-1',
        locale: 'en',
        message: 'I have persistent eye pain',
      });
    });

    expect(patientMessagesApi.sendSessionMessage).not.toHaveBeenCalled();
    expect(onMessageMutation).toHaveBeenNthCalledWith(1, expect.objectContaining({
      add: expect.arrayContaining([
        expect.objectContaining({
          role: 'patient',
          content: 'I have persistent eye pain',
          messageSource: 'chatbot',
          senderType: 'patient',
          messageState: 'sending',
        }),
        expect.objectContaining({
          role: 'assistant',
          messageSource: 'chatbot',
          senderType: 'ai',
          messageState: 'typing',
        }),
      ]),
    }));
    expect(onMessageMutation).toHaveBeenNthCalledWith(2, expect.objectContaining({
      removeIds: expect.arrayContaining([
        expect.stringMatching(/^optimistic-patient:/),
        expect.stringMatching(/^optimistic-assistant:/),
      ]),
    }));
    expect(onConversationRefresh).toHaveBeenCalledTimes(1);
  });

  it('submits the next reply as TRIAGE_SUBMITTED after a structured three-part triage prompt', async () => {
    vi.mocked(patientChatbotV3Api.sendMessage).mockResolvedValue({
      messages: [{
        role: 'assistant',
        text: 'Thanks, I have what I need.',
      }],
      turnOutcome: {
        status: 'ok',
        recoverableErrorCode: null,
      },
      cards: [],
      journey: {
        stage: 'RECOMMENDATION',
        phase: 'active',
      },
      handoff: {
        required: false,
        ticketId: null,
      },
    });

    render(
      <PatientChatComposer
        sessionId="conversation-1"
        assistantMode="AI_ACTIVE"
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
        latestAssistantChatbotV3Turn={normalizeChatbotV3Turn({
          messages: [{
            role: 'assistant',
            text: [
              'To finish triage, please reply in one message with:',
              '1. Your main symptom and how severe it is',
              '2. How long this has been happening',
              '3. Any diagnosis, treatment, or tests you already had',
            ].join('\n'),
          }],
          turnOutcome: {
            status: 'ok',
            recoverableErrorCode: null,
          },
          cards: [],
          journey: {
            stage: 'COLLECT_MINIMAL_MEDICAL_FACTS',
            phase: 'active',
          },
          handoff: {
            required: false,
            ticketId: null,
          },
        })}
        onConversationRefresh={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '1. Eye pain, moderate. 2. Two weeks. 3. I had one local exam.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(patientChatbotV3Api.sendMessage).toHaveBeenCalledWith({
        sessionId: 'widget-session-1',
        locale: 'en',
        message: '1. Eye pain, moderate. 2. Two weeks. 3. I had one local exam.',
        action: {
          type: 'TRIAGE_SUBMITTED',
        },
      });
    });
  });

  it('keeps ordinary minimal-facts replies as plain text without TRIAGE_SUBMITTED', async () => {
    vi.mocked(patientChatbotV3Api.sendMessage).mockResolvedValue({
      messages: [{
        role: 'assistant',
        text: 'Tell me more.',
      }],
      turnOutcome: {
        status: 'ok',
        recoverableErrorCode: null,
      },
      cards: [],
      journey: {
        stage: 'COLLECT_MINIMAL_MEDICAL_FACTS',
        phase: 'active',
      },
      handoff: {
        required: false,
        ticketId: null,
      },
    });

    render(
      <PatientChatComposer
        sessionId="conversation-1"
        assistantMode="AI_ACTIVE"
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
        latestAssistantChatbotV3Turn={normalizeChatbotV3Turn({
          messages: [{
            role: 'assistant',
            text: 'Tell me more about your symptoms and when they started.',
          }],
          turnOutcome: {
            status: 'ok',
            recoverableErrorCode: null,
          },
          cards: [],
          journey: {
            stage: 'COLLECT_MINIMAL_MEDICAL_FACTS',
            phase: 'active',
          },
          handoff: {
            required: false,
            ticketId: null,
          },
        })}
        onConversationRefresh={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'I have sharp eye pain since last week.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(patientChatbotV3Api.sendMessage).toHaveBeenCalledWith({
        sessionId: 'widget-session-1',
        locale: 'en',
        message: 'I have sharp eye pain since last week.',
      });
    });
  });

  it('does not submit TRIAGE_SUBMITTED for unrelated numbered clarification prompts', async () => {
    vi.mocked(patientChatbotV3Api.sendMessage).mockResolvedValue({
      messages: [{
        role: 'assistant',
        text: 'Thanks, I noted that.',
      }],
      turnOutcome: {
        status: 'ok',
        recoverableErrorCode: null,
      },
      cards: [],
      journey: {
        stage: 'COLLECT_MINIMAL_MEDICAL_FACTS',
        phase: 'active',
      },
      handoff: {
        required: false,
        ticketId: null,
      },
    });

    render(
      <PatientChatComposer
        sessionId="conversation-1"
        assistantMode="AI_ACTIVE"
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
        latestAssistantChatbotV3Turn={normalizeChatbotV3Turn({
          messages: [{
            role: 'assistant',
            text: [
              'Please answer these follow-up questions:',
              '1. Which eye is affected?',
              '2. Can you upload a photo?',
              '3. What time works best for a callback?',
            ].join('\n'),
          }],
          turnOutcome: {
            status: 'ok',
            recoverableErrorCode: null,
          },
          cards: [],
          journey: {
            stage: 'COLLECT_MINIMAL_MEDICAL_FACTS',
            phase: 'active',
          },
          handoff: {
            required: false,
            ticketId: null,
          },
        })}
        onConversationRefresh={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '1. Left eye. 2. Yes, I can. 3. Tomorrow morning.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(patientChatbotV3Api.sendMessage).toHaveBeenCalledWith({
        sessionId: 'widget-session-1',
        locale: 'en',
        message: '1. Left eye. 2. Yes, I can. 3. Tomorrow morning.',
      });
    });
  });

  it('does not send through the widget chatbot session when no formal conversation is available', async () => {
    const onMessagesSent = vi.fn();

    render(
      <PatientChatComposer
        sessionId={null}
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
        onMessagesSent={onMessagesSent}
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'I need help with treatment options' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(patientChatbotV3Api.sendMessage).not.toHaveBeenCalled();
    });

    expect(patientMessagesApi.sendSessionMessage).not.toHaveBeenCalled();
    expect(onMessagesSent).not.toHaveBeenCalled();
  });

  it('does not invent HUMAN_TAKEOVER routing when assistantMode is null and a formal conversation exists', async () => {
    render(
      <PatientChatComposer
        sessionId="conversation-1"
        assistantMode={null}
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
      />,
    );

    const sendButton = screen.getByRole('button', { name: 'Send' });

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Please route this correctly.' },
    });
    fireEvent.click(sendButton);

    expect((sendButton as HTMLButtonElement).disabled).toBe(true);
    expect(patientChatbotV3Api.sendMessage).not.toHaveBeenCalled();
    expect(patientMessagesApi.sendSessionMessage).not.toHaveBeenCalled();
  });

  it('routes HUMAN_TAKEOVER sends through the formal conversation even when a widget session id is still present', async () => {
    vi.mocked(patientMessagesApi.sendSessionMessage).mockResolvedValue({
      id: 'message-human-1',
      sessionId: 'conversation-1',
      conversationId: null,
      senderId: 'patient-1',
      senderRole: 'PATIENT',
      senderName: 'Patient',
      content: 'Please connect me to the care team.',
      originalLanguage: null,
      translatedContent: null,
      messageType: 'TEXT',
      moderationStatus: 'APPROVED',
      attachments: [],
      aiSummary: null,
      createdAt: '2026-04-05T00:00:00.000Z',
    } as never);

    render(
      <PatientChatComposer
        sessionId="conversation-1"
        assistantMode="HUMAN_TAKEOVER"
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Please connect me to the care team.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(patientMessagesApi.sendSessionMessage).toHaveBeenCalledWith({
        sessionId: 'conversation-1',
        content: 'Please connect me to the care team.',
        messageType: 'TEXT',
        attachments: [],
      });
    });

    expect(patientChatbotV3Api.sendMessage).not.toHaveBeenCalled();
  });

  it('initializes attachment uploads through the chatbot route while AI_ACTIVE is still in control', async () => {
    vi.mocked(patientChatbotV3Api.initAttachmentUpload).mockResolvedValue({
      upload: {
        uploadUrl: 'https://upload.example.com/widget-file-1',
        storageKey: 'widget-storage-key-1',
        expiresIn: 900,
      },
      asset: {
        fileName: 'scan.jpg',
        mimeType: 'image/jpeg',
        fileSize: 48,
        storageKey: 'widget-storage-key-1',
      },
    });
    vi.mocked(patientChatbotV3Api.sendMessage).mockResolvedValue({
      messages: [{
        role: 'assistant',
        text: 'Thanks, I received the file.',
      }],
      turnOutcome: {
        status: 'ok',
        recoverableErrorCode: null,
      },
      cards: [],
      journey: {
        stage: 'COLLECT_MEDICAL_INPUTS',
        phase: 'active',
      },
      handoff: {
        required: false,
        ticketId: null,
      },
    });

    render(
      <PatientChatComposer
        sessionId="conversation-1"
        assistantMode="AI_ACTIVE"
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
      />,
    );

    const file = new File(['hello'], 'scan.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Attach files'), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(patientChatbotV3Api.initAttachmentUpload).toHaveBeenCalledWith({
        sessionId: 'widget-session-1',
        fileName: 'scan.jpg',
        fileSize: file.size,
        mimeType: 'image/jpeg',
      });
    });

    expect(patientMessagesApi.initSessionAttachmentUpload).not.toHaveBeenCalled();
  });

  it('keeps a direct-upload failure retryable without proxying file bytes', async () => {
    vi.mocked(patientChatbotV3Api.initAttachmentUpload).mockResolvedValue({
      upload: {
        uploadUrl: 'https://example.r2.cloudflarestorage.com/widget-file-1',
        storageKey: 'widget-storage-key-1',
        expiresIn: 900,
      },
      asset: {
        fileName: 'scan.jpg',
        mimeType: 'image/jpeg',
        fileSize: 48,
        storageKey: 'widget-storage-key-1',
      },
    });
    vi.mocked(patientChatbotV3Api.sendMessage).mockResolvedValue({
      messages: [{
        role: 'assistant',
        text: 'Thanks, I received the file.',
      }],
      turnOutcome: {
        status: 'ok',
        recoverableErrorCode: null,
      },
      cards: [],
      journey: {
        stage: 'COLLECT_MEDICAL_INPUTS',
        phase: 'active',
      },
      handoff: {
        required: false,
        ticketId: null,
      },
    });

    const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    render(
      <PatientChatComposer
        sessionId="conversation-1"
        assistantMode="AI_ACTIVE"
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
      />,
    );

    const file = new File(['hello'], 'scan.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Attach files'), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeTruthy();
    });

    expect(patientChatbotV3Api.sendMessage).not.toHaveBeenCalled();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://example.r2.cloudflarestorage.com/widget-file-1',
      expect.objectContaining({
        method: 'PUT',
        body: file,
      }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([409, 412])('does not treat chatbot PUT HTTP %s as a verifiable completion', async (status) => {
    vi.mocked(patientChatbotV3Api.initAttachmentUpload).mockResolvedValue({
      upload: { uploadUrl: 'https://upload.example.com/chatbot-conflict', storageKey: 'chatbot-key', expiresIn: 900 },
      asset: { fileName: 'scan.pdf', mimeType: 'application/pdf', fileSize: 4, storageKey: 'chatbot-key' },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status }));
    render(
      <PatientChatComposer
        sessionId="conversation-1" assistantMode="AI_ACTIVE"
        widgetChatTarget={{ sessionId: 'widget-session-1' }}
      />,
    );

    const file = new File(['scan'], 'scan.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Attach files'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(screen.getByText('Attachment upload failed for scan.pdf')).toBeTruthy());
    expect(patientChatbotV3Api.sendMessage).not.toHaveBeenCalled();
  });

  it('expires the patient session when a send returns 401', async () => {
    const expirePatientSession = vi.fn();
    vi.mocked(usePatientAuth).mockReturnValue({
      expirePatientSession,
    } as never);

    vi.mocked(patientMessagesApi.sendSessionMessage).mockRejectedValue(
      new ApiError('Unauthorized', 401),
    );

    render(
      <PatientChatComposer
        sessionId="conversation-1"
        assistantMode="HUMAN_TAKEOVER"
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hello' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(expirePatientSession).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText('Your patient session expired. Please sign in again.')).toBeTruthy();
  });
});

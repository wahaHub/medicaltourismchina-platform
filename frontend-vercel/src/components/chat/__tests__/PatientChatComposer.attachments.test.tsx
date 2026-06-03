import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PatientChatComposer from '../PatientChatComposer';
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
  });

  it('uploads selected files and sends them through the formal conversation when assistantMode is HUMAN_TAKEOVER', async () => {
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
      });
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://upload.example.com/file-1',
      expect.objectContaining({
        method: 'PUT',
        body: file,
      }),
    );

    expect(patientMessagesApi.sendSessionMessage).toHaveBeenCalledWith({
      sessionId: 'conversation-1',
      content: 'Please review',
      messageType: 'FILE',
      attachments: [
        {
          fileName: 'lab-report.pdf',
          mimeType: 'application/pdf',
          fileSize: 12,
          storageKey: 'storage-key-1',
        },
      ],
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

  it('allows attachment-only uploads to the formal session in mechanical mode', async () => {
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
    expect(textarea).toHaveProperty('disabled', true);

    const file = new File(['scan'], 'ct-scan.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Attach files'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(patientMessagesApi.initSessionAttachmentUpload).toHaveBeenCalledWith({
        sessionId: 'widget-chat:patient-1:case-1',
        fileName: 'ct-scan.pdf',
        fileSize: file.size,
        mimeType: 'application/pdf',
        mechanicalMode: true,
        clientMessageId: expect.stringMatching(/^mechanical-upload:/),
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
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

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
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(onMechanicalUploadFailed).toHaveBeenCalledWith(expect.any(Error));
    });

    const addCall = onMessageMutation.mock.calls.find(([mutation]) => Array.isArray(mutation.add) && mutation.add.length === 2);
    const optimisticIds = addCall?.[0].add.map((message: { id: string }) => message.id) ?? [];
    expect(optimisticIds).toHaveLength(2);

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

  it('falls back to the CRM patient upload proxy when the signed upload URL fails in the browser', async () => {
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

    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue(''),
      });
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
      expect(patientChatbotV3Api.sendMessage).toHaveBeenCalledWith({
        sessionId: 'widget-session-1',
        locale: 'en',
        attachments: [{
          fileName: 'scan.jpg',
          mimeType: 'image/jpeg',
          fileSize: 48,
          storageKey: 'widget-storage-key-1',
        }],
      });
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://example.r2.cloudflarestorage.com/widget-file-1',
      expect.objectContaining({
        method: 'PUT',
        body: file,
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/patient/uploads/proxy',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
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

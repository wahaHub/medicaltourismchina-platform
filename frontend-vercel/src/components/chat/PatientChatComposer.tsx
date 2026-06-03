import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Paperclip, SendHorizonal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { patientChatbotV3Api } from '@/services/api/patient-chatbot-v3';
import { crmApiUploadProxy } from '@/services/api/crmApiClient';
import {
  expectsStructuredTriageSubmission,
  normalizeChatbotV3Turn,
  type ChatbotV3TurnViewModel,
} from '@/services/chatbot-v3-normalizer';
import {
  patientMessagesApi,
  type PatientChatState,
  type PatientConversationMessage,
  type PatientMessageAttachment,
} from '@/services/api/patient-messages';
import type { CompactChatMessage, CompactChatMessageMutation } from './PatientChatMessageList';
import type { PatientConversationAssistantMode } from '@/services/api/crmApiClient';
import { isUnauthorizedApiError } from '@/services/api/crmApiClient';
import { createChatWidgetTranslator } from './chat-widget-i18n';

type UploadedAttachment = {
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
};

type UploadAttachmentResult = {
  attachment: UploadedAttachment;
  serverMessageId?: string | null;
  clientMessageId?: string | null;
};

async function markMechanicalUploadFailed(input: {
  sessionId: string;
  clientMessageId: string;
  locale: 'en' | 'zh';
}) {
  try {
    await patientMessagesApi.sendSessionChatEvent({
      sessionId: input.sessionId,
      eventType: 'ATTACHMENT_UPLOAD_FAILED',
      clientMessageId: input.clientMessageId,
      locale: input.locale,
      payload: { errorCode: 'UPLOAD_FAILED' },
    });
  } catch {
    // Keep the local failed state visible even if the server-side status update fails.
  }
}

async function uploadAttachment(
  target: {
    kind: 'FORMAL_SESSION';
    sessionId: string;
    mechanicalMode?: boolean;
  } | {
    kind: 'CHATBOT_SESSION';
    sessionId: string;
  },
  file: File,
  options?: {
    clientMessageId?: string;
    locale?: 'en' | 'zh';
  },
): Promise<UploadAttachmentResult> {
  const init = target.kind === 'FORMAL_SESSION'
    ? await patientMessagesApi.initSessionAttachmentUpload({
        sessionId: target.sessionId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        ...(target.mechanicalMode ? { mechanicalMode: true } : {}),
        clientMessageId: options?.clientMessageId,
        locale: options?.locale,
      })
    : await patientChatbotV3Api.initAttachmentUpload({
        sessionId: target.sessionId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
      });

  if (!init.upload) {
    throw new Error(`Attachment upload is no longer available for ${file.name}`);
  }

  const uploadResponse = await fetch(init.upload.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  }).catch(async (error) => {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    await crmApiUploadProxy({
      uploadUrl: init.upload.uploadUrl,
      file,
    });

    return { ok: true } satisfies Pick<Response, 'ok'>;
  });

  if (!uploadResponse.ok) {
    throw new Error(`Attachment upload failed for ${file.name}`);
  }

  return {
    attachment: {
      fileName: init.asset.fileName,
      mimeType: init.asset.mimeType,
      fileSize: init.asset.fileSize,
      storageKey: init.asset.storageKey,
    },
    serverMessageId: init.message?.serverMessageId ?? null,
    clientMessageId: init.message?.clientMessageId ?? options?.clientMessageId ?? null,
  };
}

function toPendingAttachment(file: File): PatientMessageAttachment {
  return {
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileSize: file.size,
    storageKey: `pending:${file.name}:${file.size}:${file.lastModified}`,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    url: createPendingAttachmentPreviewUrl(file),
  };
}

function createOptimisticMessageId(prefix: string): string {
  return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

function createPendingAttachmentPreviewUrl(file: File): string {
  if (!file.type.startsWith('image/')) {
    return '';
  }

  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return '';
  }

  return URL.createObjectURL(file);
}

interface PatientChatComposerProps {
  sessionId?: string | null;
  assistantMode?: PatientConversationAssistantMode | null;
  widgetChatTarget?: {
    sessionId: string;
  } | null;
  onFormalMessageSent?: (message: PatientConversationMessage) => void;
  onMessagesSent?: (messages: CompactChatMessage[]) => void;
  onMessageMutation?: (mutation: CompactChatMessageMutation) => void;
  onConversationRefresh?: () => Promise<void> | void;
  latestAssistantChatbotV3Turn?: ChatbotV3TurnViewModel | null;
  onChatbotTurnReceived?: (turn: ChatbotV3TurnViewModel) => void;
  onMechanicalUploadFailed?: (error: Error) => void;
  mechanicalMode?: boolean;
  chatLocale?: 'en' | 'zh';
  composerPolicy?: PatientChatState['composerPolicy'] | null;
}

export default function PatientChatComposer({
  sessionId,
  assistantMode,
  widgetChatTarget,
  onFormalMessageSent,
  onMessagesSent,
  onMessageMutation,
  onConversationRefresh,
  latestAssistantChatbotV3Turn = null,
  onChatbotTurnReceived,
  onMechanicalUploadFailed,
  mechanicalMode = false,
  chatLocale,
  composerPolicy = null,
}: PatientChatComposerProps) {
  const { currentLanguage } = useLanguage();
  const { expirePatientSession } = usePatientAuth();
  const {
    phase,
    composerSelectedFiles,
    registerComposerAttachmentPicker,
    removeComposerSelectedFile,
    setComposerSelectedFiles,
  } = usePatientEntry();
  const [value, setValue] = useState('');
  const [localSelectedFiles, setLocalSelectedFiles] = useState<File[]>([]);
  const selectedFiles = composerSelectedFiles ?? localSelectedFiles;
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const translate = createChatWidgetTranslator(currentLanguage.code);
  const effectiveChatLocale = chatLocale ?? (currentLanguage.code === 'zh' ? 'zh' : 'en');

  const isFormalMessagingPhase = phase === 'select-hospitals' || phase === 'messages-ready';
  const effectiveTarget = mechanicalMode && sessionId
    ? {
        kind: 'FORMAL_SESSION' as const,
        sessionId,
        mechanicalMode: true,
      }
    : assistantMode === 'HUMAN_TAKEOVER'
    ? (sessionId
        ? {
            kind: 'FORMAL_SESSION' as const,
            sessionId,
          }
        : null)
    : (assistantMode === 'AI_ACTIVE' && sessionId && widgetChatTarget
        ? {
            kind: 'CHATBOT_SESSION' as const,
            sessionId: widgetChatTarget.sessionId,
          }
        : null);
  const attachmentsSupported = Boolean(effectiveTarget) && (composerPolicy?.attachmentsEnabled ?? true);
  const isTextDisabled = isSending
    || !(composerPolicy?.textEnabled ?? !mechanicalMode)
    || !isFormalMessagingPhase
    || !effectiveTarget;
  const isSendDisabled = isSending
    || !isFormalMessagingPhase
    || !effectiveTarget
    || composerPolicy?.sendEnabledWhen === 'disabled'
    || (composerPolicy?.sendEnabledWhen === 'attachment_only' && selectedFiles.length === 0)
    || (!composerPolicy && mechanicalMode && selectedFiles.length === 0);

  useEffect(() => {
    if (!registerComposerAttachmentPicker) {
      return;
    }

    const openAttachmentPicker = () => {
      if (isSending || !isFormalMessagingPhase || !effectiveTarget || !attachmentsSupported) {
        return;
      }

      fileInputRef.current?.click();
    };

    registerComposerAttachmentPicker(openAttachmentPicker);

    return () => {
      registerComposerAttachmentPicker(null);
    };
  }, [attachmentsSupported, effectiveTarget, isFormalMessagingPhase, isSending, registerComposerAttachmentPicker]);

  const handleSend = async () => {
    const content = value.trim();
    if ((!content && selectedFiles.length === 0) || isSendDisabled || !effectiveTarget) {
      return;
    }

    const selectedFilesSnapshot = selectedFiles;
    setErrorMessage(null);
    setIsSending(true);
    setValue('');
    if (setComposerSelectedFiles) {
      setComposerSelectedFiles([]);
    } else {
      setLocalSelectedFiles([]);
    }

    const now = new Date().toISOString();
    const optimisticPatientMessageId = createOptimisticMessageId('optimistic-patient');
    const optimisticAssistantTypingId = createOptimisticMessageId('optimistic-assistant');
    const hasMechanicalFormalUpload = effectiveTarget.kind === 'FORMAL_SESSION'
      && mechanicalMode
      && selectedFilesSnapshot.length > 0;
    const mechanicalClientMessageIds = selectedFilesSnapshot.map(() => createOptimisticMessageId('mechanical-upload'));
    const markAllMechanicalUploadsFailed = async () => {
      if (!hasMechanicalFormalUpload || effectiveTarget.kind !== 'FORMAL_SESSION') {
        return;
      }
      await Promise.all(mechanicalClientMessageIds.map((clientMessageId) => markMechanicalUploadFailed({
        sessionId: effectiveTarget.sessionId,
        clientMessageId,
        locale: effectiveChatLocale,
      })));
    };

    if (effectiveTarget.kind === 'CHATBOT_SESSION') {
      onMessageMutation?.({
        add: [
          {
            id: optimisticPatientMessageId,
            role: 'patient',
            messageSource: 'chatbot',
            content,
            attachments: selectedFilesSnapshot.map((file) => toPendingAttachment(file)),
            createdAt: now,
            senderType: 'patient',
            messageState: 'sending',
          },
          {
            id: optimisticAssistantTypingId,
            role: 'assistant',
            messageSource: 'chatbot',
            content: '',
            createdAt: new Date(Date.now() + 1).toISOString(),
            senderType: 'ai',
            messageState: 'typing',
          },
        ],
      });
    }

    if (hasMechanicalFormalUpload) {
      onMessageMutation?.({
        add: selectedFilesSnapshot.map((file, index) => ({
            id: mechanicalClientMessageIds[index] ?? createOptimisticMessageId('mechanical-upload'),
            role: 'patient',
            messageSource: 'formal',
            content: effectiveChatLocale === 'zh' ? '正在上传医疗资料...' : 'Uploading medical records...',
            attachments: [toPendingAttachment(file)],
            createdAt: now,
            senderType: 'patient',
            messageState: 'sending',
          })),
      });
    }

    try {
      if (hasMechanicalFormalUpload && effectiveTarget.kind === 'FORMAL_SESSION') {
        const completedClientMessageIds: string[] = [];
        const failedClientMessageIds: string[] = [];
        let firstUploadError: Error | null = null;

        for (const [index, file] of selectedFilesSnapshot.entries()) {
          const clientMessageId = mechanicalClientMessageIds[index] ?? createOptimisticMessageId('mechanical-upload');
          try {
            const result = await uploadAttachment(
              effectiveTarget,
              file,
              { clientMessageId, locale: effectiveChatLocale },
            );
            await patientMessagesApi.sendSessionChatEvent({
              sessionId: effectiveTarget.sessionId,
              eventType: 'ATTACHMENT_UPLOAD_COMPLETED',
              clientMessageId: result.clientMessageId ?? clientMessageId,
              serverMessageId: result.serverMessageId ?? undefined,
              locale: effectiveChatLocale,
              payload: {
                attachments: [result.attachment],
              },
            });
            completedClientMessageIds.push(clientMessageId);
          } catch (uploadError) {
            const normalizedUploadError = uploadError instanceof Error
              ? uploadError
              : new Error(translate('chatWidget.composer.failed'));
            firstUploadError ??= normalizedUploadError;
            failedClientMessageIds.push(clientMessageId);
            await markMechanicalUploadFailed({
              sessionId: effectiveTarget.sessionId,
              clientMessageId,
              locale: effectiveChatLocale,
            });
          }
        }

        if (completedClientMessageIds.length > 0) {
          onMessageMutation?.({
            removeIds: completedClientMessageIds,
          });
        }

        if (failedClientMessageIds.length > 0) {
          onMessageMutation?.({
            update: failedClientMessageIds.map((clientMessageId) => ({
              id: clientMessageId,
              messageState: 'failed',
            })),
            add: [{
              id: createOptimisticMessageId('mechanical-upload-failed'),
              role: 'assistant',
              messageSource: 'formal',
              content: translate('chatWidget.mechanical.upload.failedMessage'),
              createdAt: new Date(Date.now() + 1).toISOString(),
              senderType: 'system',
              messageState: 'sent',
            }],
          });
          if (firstUploadError) {
            onMechanicalUploadFailed?.(firstUploadError);
          }
        }

        await onConversationRefresh?.();
        onMessagesSent?.([]);
        return;
      }

      const uploadResults = await Promise.all(
        selectedFilesSnapshot.map((file, index) => uploadAttachment(
          effectiveTarget,
          file,
          hasMechanicalFormalUpload
            ? { clientMessageId: mechanicalClientMessageIds[index], locale: effectiveChatLocale }
            : undefined,
        )),
      );
      const attachments = uploadResults.map((result) => result.attachment);

      if (effectiveTarget.kind === 'CHATBOT_SESSION') {
        const action = content && expectsStructuredTriageSubmission(latestAssistantChatbotV3Turn)
          ? { type: 'TRIAGE_SUBMITTED' as const }
          : undefined;
        const response = await patientChatbotV3Api.sendMessage({
          sessionId: effectiveTarget.sessionId,
          locale: currentLanguage.apiCode,
          ...(content ? { message: content } : {}),
          ...(action ? { action } : {}),
          ...(attachments.length > 0 ? { attachments } : {}),
        });
        const responseTurn = normalizeChatbotV3Turn(response);
        onChatbotTurnReceived?.(responseTurn);

        if (sessionId) {
          await onConversationRefresh?.();
          onMessageMutation?.({
            removeIds: [optimisticAssistantTypingId, optimisticPatientMessageId],
          });
          return;
        }

        onMessageMutation?.({
          removeIds: [optimisticAssistantTypingId, optimisticPatientMessageId],
        });

        onMessagesSent?.([
          {
            id: optimisticPatientMessageId,
            role: 'patient',
            messageSource: 'chatbot',
            content,
            attachments: attachments.map((attachment) => ({
              ...attachment,
              name: attachment.fileName,
              type: attachment.mimeType,
              size: attachment.fileSize,
              url: '',
            })),
            createdAt: now,
            senderType: 'patient',
            messageState: 'sent',
          },
          {
            id: optimisticAssistantTypingId,
            role: 'assistant',
            messageSource: 'chatbot',
            content: response.messages[0]?.text ?? '',
            v3Turn: responseTurn,
            createdAt: new Date(Date.now() + 1).toISOString(),
            senderType: 'ai',
            messageState: 'sent',
          },
        ]);
        return;
      }

      const message = await patientMessagesApi.sendSessionMessage({
        sessionId: effectiveTarget.sessionId,
        content,
        messageType: selectedFilesSnapshot.length > 0
          ? (selectedFilesSnapshot.every((file) => file.type.startsWith('image/')) ? 'IMAGE' : 'FILE')
          : 'TEXT',
        ...(effectiveTarget.mechanicalMode ? { mechanicalMode: true } : {}),
        attachments,
      });

      if (hasMechanicalFormalUpload) {
        onMessageMutation?.({
          removeIds: mechanicalClientMessageIds,
        });
      }

      onFormalMessageSent?.(message);
      onMessagesSent?.([{
        id: message.id,
        role: message.senderRole === 'PATIENT' ? 'patient' : 'assistant',
        messageSource: 'formal',
        content: message.content,
        attachments: message.attachments,
        blocks: message.blocks,
        createdAt: message.createdAt,
        senderLabel: message.senderName,
        senderType: message.senderRole === 'PATIENT' ? 'patient' : 'admin',
        messageState: 'sent',
      }]);
      await onConversationRefresh?.();
    } catch (error) {
      const normalizedError = error instanceof Error
        ? error
        : new Error(translate('chatWidget.composer.failed'));

      if (isUnauthorizedApiError(error)) {
        if (effectiveTarget.kind === 'CHATBOT_SESSION') {
          onMessageMutation?.({
            removeIds: [optimisticAssistantTypingId],
            update: [{
              id: optimisticPatientMessageId,
              messageState: 'failed',
            }],
          });
        }
        if (hasMechanicalFormalUpload) {
          await markAllMechanicalUploadsFailed();
          onMessageMutation?.({
            update: mechanicalClientMessageIds.map((clientMessageId) => ({
              id: clientMessageId,
              messageState: 'failed',
            })),
            add: [{
              id: createOptimisticMessageId('mechanical-upload-failed'),
              role: 'assistant',
              messageSource: 'formal',
              content: translate('chatWidget.mechanical.upload.failedMessage'),
              createdAt: new Date(Date.now() + 1).toISOString(),
              senderType: 'system',
              messageState: 'sent',
            }],
          });
          onMechanicalUploadFailed?.(normalizedError);
        }
        await expirePatientSession();
        setErrorMessage(translate('chatWidget.composer.sessionExpired'));
        return;
      }

      if (effectiveTarget.kind === 'CHATBOT_SESSION') {
        onMessageMutation?.({
          removeIds: [optimisticAssistantTypingId],
          update: [{
            id: optimisticPatientMessageId,
            messageState: 'failed',
          }],
        });
      }
      if (hasMechanicalFormalUpload) {
        await markAllMechanicalUploadsFailed();
        onMessageMutation?.({
          update: mechanicalClientMessageIds.map((clientMessageId) => ({
            id: clientMessageId,
            messageState: 'failed',
          })),
          add: [{
            id: createOptimisticMessageId('mechanical-upload-failed'),
            role: 'assistant',
            messageSource: 'formal',
            content: translate('chatWidget.mechanical.upload.failedMessage'),
            createdAt: new Date(Date.now() + 1).toISOString(),
            senderType: 'system',
            messageState: 'sent',
          }],
        });
        onMechanicalUploadFailed?.(normalizedError);
      }
      setErrorMessage(normalizedError.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    if (setComposerSelectedFiles) {
      setComposerSelectedFiles((current) => [...current, ...files]);
    } else {
      setLocalSelectedFiles((current) => [...current, ...files]);
    }
    event.target.value = '';
  };

  const removeSelectedFile = (name: string) => {
    if (removeComposerSelectedFile) {
      removeComposerSelectedFile(name);
    } else {
      setLocalSelectedFiles((current) => current.filter((file) => file.name !== name));
    }
  };

  return (
    <div className="space-y-3 border-t border-slate-200 px-4 py-4">
      {selectedFiles.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedFiles.map((file) => (
            <div
              key={`${file.name}:${file.size}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700"
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span className="max-w-[180px] truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeSelectedFile(file.name)}
                className="rounded-full p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={composerPolicy?.placeholder ?? (isFormalMessagingPhase
          ? (mechanicalMode ? translate('chatWidget.composer.placeholderMechanical') : translate('chatWidget.composer.placeholderHuman'))
          : translate('chatWidget.composer.placeholderAi'))}
        className="min-h-[88px] resize-none"
        disabled={isTextDisabled}
      />
      <div className="flex items-center justify-between gap-3">
        <p className={`text-xs ${errorMessage ? 'text-rose-600' : 'text-slate-500'}`}>
          {errorMessage || (
            isFormalMessagingPhase
              ? translate('chatWidget.composer.helperReady')
              : translate('chatWidget.composer.completeProfile')
          )}
        </p>
        <div className="flex items-center gap-2">
          <label className={`inline-flex cursor-pointer items-center justify-center rounded-full border px-3 py-2 text-sm transition ${
            isSending || !isFormalMessagingPhase || !effectiveTarget || !attachmentsSupported
              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
              : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-600'
          }`}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              aria-label={translate('chatWidget.composer.attachFiles')}
              disabled={isSending || !isFormalMessagingPhase || !effectiveTarget || !attachmentsSupported}
              onChange={handleFileSelection}
            />
            <Paperclip className="h-4 w-4" />
          </label>
          <Button
            type="button"
            onClick={() => void handleSend()}
            disabled={isSendDisabled || (value.trim().length === 0 && selectedFiles.length === 0)}
            className="shrink-0 bg-teal-600 hover:bg-teal-700"
          >
            <SendHorizonal className="h-4 w-4" />
            {isSending ? translate('chatWidget.composer.sending') : translate('chatWidget.composer.send')}
          </Button>
        </div>
      </div>
    </div>
  );
}

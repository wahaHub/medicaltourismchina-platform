import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FileText,
  Upload,
  X,
  FileImage,
  FileSpreadsheet,
  Presentation,
  FileAudio,
  FileVideo,
  File as FileIcon,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { patientDashboardApi, type PatientCaseDocument } from '@/services/api/patient-dashboard';
import { patientMessagesApi } from '@/services/api/patient-messages';
import { cn } from '@/lib/utils';
import type { TranslationKey } from '@/i18n';

const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/bmp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/rtf',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
];

const MAX_FILE_SIZE = 100 * 1024 * 1024;

function fileIconForMimeType(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return FileSpreadsheet;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return Presentation;
  if (mimeType.startsWith('audio/')) return FileAudio;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType === 'application/pdf') return FileText;
  return FileIcon;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error';
  error?: string;
}

export default function MedicalRecordsPage() {
  const { currentLanguage, t } = useLanguage();
  const { patient } = usePatientAuth();
  const [documents, setDocuments] = useState<PatientCaseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const translate = useMemo(
    () => (key: string, params?: Record<string, string | number>) => t(key as TranslationKey, params),
    [t],
  );

  const activeCaseId = patient?.caseId ?? null;
  const sessionId = useMemo(() => {
    if (patient?.formalConversationState?.activeConversationId) {
      return patient.formalConversationState.activeConversationId;
    }
    return null;
  }, [patient]);

  const loadDocuments = useCallback(async () => {
    if (!activeCaseId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await patientDashboardApi.listPatientCaseDocuments(
        activeCaseId,
        currentLanguage.apiCode,
      );
      setDocuments([...result.uploadedDocuments, ...result.hospitalReplyDocuments]);
    } catch (err) {
      setError(err instanceof Error ? err.message : translate('dashboard.medicalRecords.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [activeCaseId, currentLanguage.apiCode, translate]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return translate('dashboard.medicalRecords.errorTooLarge', { name: file.name });
    }
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      return translate('dashboard.medicalRecords.errorUnsupportedType', { name: file.name });
    }
    return null;
  };

  const uploadSingleFile = async (item: UploadingFile): Promise<void> => {
    if (!sessionId) {
      throw new Error(translate('dashboard.medicalRecords.errorNoSession'));
    }

    setUploads((prev) =>
      prev.map((u) => (u.id === item.id ? { ...u, status: 'uploading', progress: 10 } : u)),
    );

    await patientDashboardApi.uploadPatientCaseDocument({
      sessionId,
      file: item.file,
      description: `Uploaded medical record: ${item.file.name}`,
    });

    setUploads((prev) =>
      prev.map((u) => (u.id === item.id ? { ...u, status: 'done', progress: 100 } : u)),
    );
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!sessionId) {
      setError(translate('dashboard.medicalRecords.errorNoSession'));
      return;
    }

    const newUploads: UploadingFile[] = [];
    for (const file of Array.from(files)) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }
      newUploads.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        progress: 0,
        status: 'pending',
      });
    }

    if (newUploads.length === 0) return;

    setUploads((prev) => [...prev, ...newUploads]);
    setError(null);

    for (const item of newUploads) {
      try {
        await uploadSingleFile(item);
      } catch (err) {
        const message = err instanceof Error ? err.message : translate('dashboard.medicalRecords.uploadError');
        setUploads((prev) =>
          prev.map((u) => (u.id === item.id ? { ...u, status: 'error', error: message } : u)),
        );
      }
    }

    await loadDocuments();
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const clearCompletedUploads = () => {
    setUploads((prev) => prev.filter((u) => u.status !== 'done'));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    void handleFiles(e.dataTransfer.files);
  };

  if (!activeCaseId) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>{translate('dashboard.medicalRecords.title')}</CardTitle>
          <CardDescription>{translate('dashboard.medicalRecords.noCaseDesc')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-teal-600" />
            {translate('dashboard.medicalRecords.title')}
          </CardTitle>
          <CardDescription>{translate('dashboard.medicalRecords.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="border-rose-200 bg-rose-50 text-rose-900">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{translate('dashboard.common.error')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div
            className={cn(
              'relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-colors',
              isDragging
                ? 'border-teal-500 bg-teal-50'
                : 'border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/50',
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                inputRef.current?.click();
              }
            }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <Upload className="h-6 w-6 text-teal-600" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-900">
              {translate('dashboard.medicalRecords.dropzoneTitle')}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {translate('dashboard.medicalRecords.dropzoneHint')}
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED_MIME_TYPES.join(',')}
              className="sr-only"
              onChange={(e) => void handleFiles(e.target.files)}
            />
          </div>

          {uploads.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  {translate('dashboard.medicalRecords.uploadProgress')}
                </h3>
                <Button variant="ghost" size="sm" onClick={clearCompletedUploads}>
                  {translate('dashboard.medicalRecords.clearCompleted')}
                </Button>
              </div>
              <div className="grid gap-2">
                {uploads.map((item) => {
                  const Icon = fileIconForMimeType(item.file.type);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <Icon className="h-5 w-5 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{item.file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(item.file.size)}</p>
                        {item.status === 'error' ? (
                          <p className="text-xs text-rose-600">{item.error}</p>
                        ) : (
                          <Progress value={item.progress} className="mt-1 h-1.5" />
                        )}
                      </div>
                      {item.status === 'done' ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600" />
                      ) : item.status === 'error' ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-rose-600"
                          onClick={() => removeUpload(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-slate-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">{translate('dashboard.medicalRecords.yourRecords')}</CardTitle>
          <CardDescription>{translate('dashboard.medicalRecords.recordsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {translate('dashboard.common.loading')}
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              {translate('dashboard.medicalRecords.emptyState')}
            </div>
          ) : (
            <div className="grid gap-2">
              {documents.map((doc) => {
                const Icon = fileIconForMimeType(doc.mimeType);
                const isPatientUpload = doc.source === 'PATIENT_UPLOAD';
                return (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 transition-colors hover:border-teal-300 hover:bg-teal-50/30"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-white">
                      <Icon className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{doc.fileName}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{formatDate(doc.messageCreatedAt, currentLanguage.code)}</span>
                        <span>•</span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px]',
                            isPatientUpload
                              ? 'bg-teal-100 text-teal-800 hover:bg-teal-100'
                              : 'bg-sky-100 text-sky-800 hover:bg-sky-100',
                          )}
                        >
                          {isPatientUpload
                            ? translate('dashboard.medicalRecords.uploadedByYou')
                            : translate('dashboard.medicalRecords.fromCareTeam')}
                        </Badge>
                      </div>
                    </div>
                    <FileText className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-teal-600" />
                  </a>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

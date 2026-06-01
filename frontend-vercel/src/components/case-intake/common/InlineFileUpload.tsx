import React, { useCallback, useState, useRef } from 'react';
import { Upload, File, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadedFile } from '@/types/caseIntake';
import { uploadFile } from '@/services/api/fileUpload';

interface InlineFileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  category: UploadedFile['category'];
  examType: string;
  maxFiles?: number;
  maxSizeMB?: number;
  userId?: string;
  caseIntakeId?: string;
  requirePersistentUpload?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export function InlineFileUpload({
  files,
  onFilesChange,
  category,
  examType,
  maxFiles = 5,
  maxSizeMB = 20,
  userId,
  caseIntakeId,
  requirePersistentUpload = false,
  disabled = false,
  disabledReason,
}: InlineFileUploadProps) {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.dicom', '.dcm'];

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const fileArray = Array.from(e.target.files);
    setUploadError(null);

    if (disabled) {
      setUploadError(disabledReason || 'File upload is currently unavailable.');
      e.target.value = '';
      return;
    }

    if (requirePersistentUpload && (!userId || !caseIntakeId)) {
      setUploadError(disabledReason || 'Please wait for your patient session to finish loading before uploading files.');
      e.target.value = '';
      return;
    }

    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      setUploadError(t('caseIntake.fileUpload.maxFilesExceeded', { maxFiles }));
      return;
    }

    setIsUploading(true);
    const validFiles: UploadedFile[] = [];

    for (const file of fileArray) {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setUploadError(t('caseIntake.fileUpload.fileTooLarge', { maxSize: maxSizeMB }));
        continue;
      }

      // Check file type
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = acceptedTypes.some(type =>
        type === extension || file.type.includes(type.replace('.', ''))
      );
      if (!isValidType) {
        setUploadError(t('caseIntake.fileUpload.invalidType'));
        continue;
      }

      // Create a unique ID for the file
      const fileId = `${examType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      let fileUrl: string;

      // If userId and caseIntakeId are provided, upload to Supabase Storage
      if (userId && caseIntakeId) {
        console.log('[InlineFileUpload] Uploading to Supabase Storage...');
        const result = await uploadFile(file, userId, caseIntakeId, examType);

        if (!result.success || !result.url) {
          console.error('[InlineFileUpload] Upload failed:', result.error);
          setUploadError(result.error || 'Upload failed');
          continue;
        }

        fileUrl = result.url;
        console.log('[InlineFileUpload] Upload successful:', fileUrl);
      } else {
        // Fallback to blob URL if no userId/caseIntakeId (e.g., before case intake is created)
        console.log('[InlineFileUpload] Using temporary blob URL (no userId/caseIntakeId)');
        fileUrl = URL.createObjectURL(file);
      }

      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        category,
        uploadedAt: new Date().toISOString(),
        url: fileUrl
      };

      validFiles.push(uploadedFile);
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }

    setIsUploading(false);
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [files, onFilesChange, category, examType, maxFiles, maxSizeMB, t, userId, caseIntakeId]);

  const removeFile = useCallback((fileId: string) => {
    onFilesChange(files.filter(f => f.id !== fileId));
  }, [files, onFilesChange]);

  return (
    <div className="mt-2 space-y-2">
      {/* Upload Error */}
      {uploadError && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="ml-auto hover:text-red-800"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading || files.length >= maxFiles}
          className="text-xs h-7 px-2"
        >
          {isUploading ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Upload className="h-3 w-3 mr-1" />
          )}
          {t('caseIntake.fileUpload.uploadFile')}
        </Button>
        <span className="text-xs text-gray-500">
          ({files.length}/{maxFiles})
        </span>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map(file => {
            const isBlobUrl = file.url?.startsWith('blob:');
            return (
              <div
                key={file.id}
                className={`flex items-center gap-2 p-1.5 rounded border text-xs ${
                  isBlobUrl
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <File className={`h-3 w-3 flex-shrink-0 ${isBlobUrl ? 'text-yellow-600' : 'text-green-600'}`} />
                <span
                  className={`truncate flex-1 ${isBlobUrl ? 'text-yellow-800' : 'text-green-800'}`}
                  title={file.name}
                >
                  {file.name}
                </span>
                <span className={`flex-shrink-0 ${isBlobUrl ? 'text-yellow-600' : 'text-green-600'}`}>
                  {formatFileSize(file.size)}
                </span>
                {isBlobUrl ? (
                  <span className="text-yellow-600 text-[10px]" title="Pending upload">
                    ⏳
                  </span>
                ) : (
                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="p-0.5 hover:bg-red-100 rounded text-gray-400 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default InlineFileUpload;

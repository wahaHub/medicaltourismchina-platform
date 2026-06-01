import React, { useCallback, useState } from 'react';
import { Upload, File, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadedFile } from '@/types/caseIntake';

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  category: UploadedFile['category'];
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export function FileUpload({
  files,
  onFilesChange,
  category,
  maxFiles = 10,
  maxSizeMB = 20,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.dicom', '.dcm']
}: FileUploadProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return t('caseIntake.fileUpload.fileTooLarge', { maxSize: maxSizeMB });
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = acceptedTypes.some(type =>
      type === extension || file.type.includes(type.replace('.', ''))
    );
    if (!isValidType) {
      return t('caseIntake.fileUpload.invalidType');
    }

    return null;
  };

  const processFiles = useCallback(async (newFiles: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(newFiles);

    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      setError(t('caseIntake.fileUpload.maxFilesExceeded', { maxFiles }));
      return;
    }

    const validFiles: UploadedFile[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      // Create a unique ID for the file
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setUploadingFiles(prev => [...prev, fileId]);

      // Simulate upload (in production, this would upload to S3/storage)
      await new Promise(resolve => setTimeout(resolve, 500));

      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        category,
        uploadedAt: new Date().toISOString(),
        // In production, this would be the actual URL from storage
        url: URL.createObjectURL(file)
      };

      validFiles.push(uploadedFile);
      setUploadingFiles(prev => prev.filter(id => id !== fileId));
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  }, [files, onFilesChange, category, maxFiles, maxSizeMB, acceptedTypes, t]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [processFiles]);

  const removeFile = useCallback((fileId: string) => {
    onFilesChange(files.filter(f => f.id !== fileId));
  }, [files, onFilesChange]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const inputId = `file-upload-${category}`;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById(inputId)?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          id={inputId}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />

        <p className="text-sm text-gray-600 mb-1">
          {t('caseIntake.fileUpload.dragDrop')}
        </p>
        <p className="text-xs text-gray-500">
          {t('caseIntake.fileUpload.supportedFormats')}: PDF, JPG, PNG, DOC, DICOM
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {t('caseIntake.fileUpload.maxSize', { maxSize: maxSizeMB })} | {t('caseIntake.fileUpload.maxFiles', { maxFiles })}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="flex items-center gap-2 text-blue-600 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('caseIntake.fileUpload.uploading')}...
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {t('caseIntake.fileUpload.uploadedFiles')} ({files.length})
          </p>
          <div className="space-y-2">
            {files.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;

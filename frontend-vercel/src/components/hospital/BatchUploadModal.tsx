/**
 * Batch Upload Modal
 * 批量上传 Modal - 支持拖拽上传多个文件
 */

import { useState, useCallback } from 'react';
import { useServiceRequests } from '@/hooks/hospital/useMedplumResources';
import { medplum } from '@/lib/medplum';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Upload, File, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { DocumentReference } from '@medplum/fhirtypes';

interface BatchUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadFile {
  file: File;
  patientId: string;
  category: 'clinical' | 'invitation' | 'non-medical';
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const CATEGORIES = [
  { value: 'clinical', label: '临床文档' },
  { value: 'invitation', label: '邀请函' },
  { value: 'non-medical', label: '非医疗文档' },
];

export function BatchUploadModal({ open, onOpenChange }: BatchUploadModalProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [defaultPatientId, setDefaultPatientId] = useState('');
  const [defaultCategory, setDefaultCategory] = useState<'clinical' | 'invitation' | 'non-medical'>('clinical');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: casesData } = useServiceRequests({ limit: 100 });

  // 处理文件拖拽
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    [defaultPatientId, defaultCategory]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        addFiles(selectedFiles);
      }
    },
    [defaultPatientId, defaultCategory]
  );

  const addFiles = (newFiles: File[]) => {
    if (!defaultPatientId) {
      toast({
        title: '错误',
        description: '请先选择患者',
        variant: 'destructive',
      });
      return;
    }

    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      file,
      patientId: defaultPatientId,
      category: defaultCategory,
      status: 'pending',
    }));

    setFiles((prev) => [...prev, ...uploadFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: '错误',
        description: '请先添加文件',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const uploadFile = files[i];
      
      // 更新状态为上传中
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: 'uploading' as const } : f
        )
      );

      try {
        // 1. 上传文件到 Medplum Binary
        const binary = await medplum.createBinary(
          uploadFile.file,
          uploadFile.file.name,
          uploadFile.file.type
        );

        // 2. 创建 DocumentReference
        const docRef: DocumentReference = {
          resourceType: 'DocumentReference',
          status: 'current',
          subject: {
            reference: `Patient/${uploadFile.patientId}`,
          },
          category: [
            {
              coding: [
                {
                  system: 'https://medicaltourismchina.health/fhir/CodeSystem/document-category',
                  code: uploadFile.category,
                },
              ],
            },
          ],
          content: [
            {
              attachment: {
                url: `Binary/${binary.id}`,
                contentType: uploadFile.file.type,
                title: uploadFile.file.name,
              },
            },
          ],
        };

        await medplum.createResource(docRef);

        // 更新状态为成功
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'success' as const } : f
          )
        );
        successCount++;
      } catch (error) {
        // 更新状态为失败
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : '上传失败',
                }
              : f
          )
        );
      }

      // 更新进度
      setUploadProgress(((i + 1) / files.length) * 100);
    }

    setIsUploading(false);

    toast({
      title: '上传完成',
      description: `成功上传 ${successCount} 个文件，失败 ${files.length - successCount} 个`,
    });
  };

  const handleReset = () => {
    setFiles([]);
    setUploadProgress(0);
    setDefaultPatientId('');
    setDefaultCategory('clinical');
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>批量上传文档</DialogTitle>
          <DialogDescription>
            为患者批量上传临床文档、邀请函等文件
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 默认设置 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>默认患者</Label>
              <Select value={defaultPatientId} onValueChange={setDefaultPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="选择患者" />
                </SelectTrigger>
                <SelectContent>
                  {casesData?.patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id!}>
                      #{patient.id?.slice(-6)} - {patient.gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>默认分类</Label>
              <Select value={defaultCategory} onValueChange={(v: any) => setDefaultCategory(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 拖拽上传区域 */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              拖拽文件到此处，或点击选择文件
            </p>
            <p className="text-xs text-gray-500">
              支持多个文件同时上传
            </p>
            <input
              id="file-input"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* 文件列表 */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between">
                <Label>待上传文件 ({files.length})</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isUploading}
                >
                  清空
                </Button>
              </div>
              {files.map((uploadFile, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <File className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {CATEGORIES.find((c) => c.value === uploadFile.category)?.label} -{' '}
                        {(uploadFile.file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <div>
                    {uploadFile.status === 'pending' && (
                      <div className="text-xs text-gray-500">等待上传</div>
                    )}
                    {uploadFile.status === 'uploading' && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    {uploadFile.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {uploadFile.status === 'error' && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 进度条 */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>上传进度</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              {isUploading ? '上传中...' : '关闭'}
            </Button>
            <Button onClick={handleUpload} disabled={isUploading || files.length === 0}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  开始上传
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

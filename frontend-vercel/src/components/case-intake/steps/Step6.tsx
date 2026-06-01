import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { Step6Data, UploadedFile } from '@/types/caseIntake';
import { YesNoToggle } from '../common/YesNoToggle';
import { InlineFileUpload } from '../common/InlineFileUpload';

interface Step6Props {
  data: Partial<Step6Data>;
  onChange: (data: Partial<Step6Data>) => void;
  onError: (error: string) => void;
  userId?: string;
  caseIntakeId?: string;
}

export function Step6({ data, onChange, onError, userId, caseIntakeId }: Step6Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {/* Recent Examinations - Compact */}
      <div className="p-3 rounded-lg border border-gray-200">
        <Label className="text-sm font-semibold">
          {t('caseIntake.step6.recentExams')}
        </Label>
        <p className="text-xs text-gray-500 mt-0.5">
          {t('caseIntake.step6.selectExamTypes')}
        </p>

        <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-1.5">
          {[
            { key: 'ct', labelKey: 'caseIntake.step6.examType.ct' },
            { key: 'mri', labelKey: 'caseIntake.step6.examType.mri' },
            { key: 'xray', labelKey: 'caseIntake.step6.examType.xray' },
            { key: 'ultrasound', labelKey: 'caseIntake.step6.examType.ultrasound' },
            { key: 'blood_test', labelKey: 'caseIntake.step6.examType.bloodTest' },
            { key: 'urine_test', labelKey: 'caseIntake.step6.examType.urineTest' },
            { key: 'ecg', labelKey: 'caseIntake.step6.examType.ecg' },
            { key: 'endoscopy', labelKey: 'caseIntake.step6.examType.endoscopy' },
            { key: 'biopsy', labelKey: 'caseIntake.step6.examType.biopsy' },
            { key: 'pet_scan', labelKey: 'caseIntake.step6.examType.petScan' }
          ].map(({ key, labelKey }) => {
            const isChecked = data.exam_types_selected?.includes(key) || false;

            return (
              <div
                key={key}
                className={`flex items-center space-x-1 px-1.5 py-1 border rounded text-xs cursor-pointer transition-colors ${
                  isChecked ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  const current = data.exam_types_selected || [];
                  let newSelected: string[];
                  let newExamFiles = { ...data.exam_files };

                  if (isChecked) {
                    newSelected = current.filter(t => t !== key);
                    if (newExamFiles) {
                      delete newExamFiles[key];
                    }
                  } else {
                    newSelected = [...current, key];
                  }

                  const newData = {
                    ...data,
                    exam_types_selected: newSelected,
                    has_recent_exams: newSelected.length > 0,
                    exam_files: newExamFiles
                  };
                  onChange(newData);
                  onError('');
                }}
              >
                <Checkbox
                  id={`exam_${key}`}
                  checked={isChecked}
                  className="h-3.5 w-3.5 pointer-events-none"
                />
                <Label htmlFor={`exam_${key}`} className="cursor-pointer font-normal text-xs">
                  {t(labelKey as any)}
                </Label>
              </div>
            );
          })}
        </div>

        {/* File uploads for selected exams */}
        {data.exam_types_selected && data.exam_types_selected.length > 0 && (
          <div className="mt-3 space-y-2">
            {data.exam_types_selected.map((key) => {
              const examFiles = data.exam_files?.[key] || [];
              const labelKey = `caseIntake.step6.examType.${key.replace('_', '')}`;

              return (
                <div key={key} className="p-2 bg-gray-50 rounded border">
                  <InlineFileUpload
                    files={examFiles}
                    onFilesChange={(files: UploadedFile[]) => {
                      const newExamFiles = {
                        ...data.exam_files,
                        [key]: files
                      };
                      const newData = {
                        ...data,
                        exam_files: newExamFiles,
                        can_provide_files: Object.values(newExamFiles).some(f => f.length > 0)
                      };
                      onChange(newData);
                      onError('');
                    }}
                    category="exam"
                    examType={key}
                    maxFiles={5}
                    userId={userId}
                    caseIntakeId={caseIntakeId}
                  />
                </div>
              );
            })}
          </div>
        )}

        {data.has_recent_exams && (
          <div className="mt-3 pt-3 border-t">
            <Label className="text-xs font-medium text-gray-600">
              {t('caseIntake.step6.examDetails')}
            </Label>
            <Textarea
              value={data.exam_details_summary || ''}
              onChange={(e) => {
                const newData = { ...data, exam_details_summary: e.target.value };
                onChange(newData);
                onError('');
              }}
              placeholder={t('caseIntake.step6.examDetailsPlaceholder') as any}
              rows={2}
              className="mt-1 resize-none text-sm"
            />
          </div>
        )}
      </div>

      {/* Lab Results, Imaging, Pathology - Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Lab Results */}
        <div className="p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              {t('caseIntake.step6.labResults')}
            </Label>
            <YesNoToggle
              name="lab_results"
              value={data.has_lab_results || false}
              onChange={(value) => {
                const newData = {
                  ...data,
                  has_lab_results: value,
                  lab_results_summary: value ? data.lab_results_summary : ''
                };
                onChange(newData);
                onError('');
              }}
              noLabelKey="caseIntake.step6.noLabResults"
              yesLabelKey="caseIntake.step6.hasLabResults"
            />
          </div>
          {data.has_lab_results && (
            <Textarea
              value={data.lab_results_summary || ''}
              onChange={(e) => {
                const newData = { ...data, lab_results_summary: e.target.value };
                onChange(newData);
                onError('');
              }}
              placeholder={t('caseIntake.step6.labResultsPlaceholder') as any}
              rows={3}
              className="mt-2 resize-none text-sm"
            />
          )}
        </div>

        {/* Imaging */}
        <div className="p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              {t('caseIntake.step6.imaging')}
            </Label>
            <YesNoToggle
              name="imaging"
              value={data.has_imaging_available || false}
              onChange={(value) => {
                const newData = {
                  ...data,
                  has_imaging_available: value,
                  imaging_description: value ? data.imaging_description : ''
                };
                onChange(newData);
                onError('');
              }}
              noLabelKey="caseIntake.step6.noImaging"
              yesLabelKey="caseIntake.step6.hasImaging"
            />
          </div>
          {data.has_imaging_available && (
            <Textarea
              value={data.imaging_description || ''}
              onChange={(e) => {
                const newData = { ...data, imaging_description: e.target.value };
                onChange(newData);
                onError('');
              }}
              placeholder={t('caseIntake.step6.imagingPlaceholder') as any}
              rows={3}
              className="mt-2 resize-none text-sm"
            />
          )}
        </div>

        {/* Pathology */}
        <div className="p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              {t('caseIntake.step6.pathology')}
            </Label>
            <YesNoToggle
              name="pathology"
              value={data.has_pathology_report || false}
              onChange={(value) => {
                const newData = {
                  ...data,
                  has_pathology_report: value,
                  pathology_summary: value ? data.pathology_summary : ''
                };
                onChange(newData);
                onError('');
              }}
              noLabelKey="caseIntake.step6.noPathology"
              yesLabelKey="caseIntake.step6.hasPathology"
            />
          </div>
          {data.has_pathology_report && (
            <Textarea
              value={data.pathology_summary || ''}
              onChange={(e) => {
                const newData = { ...data, pathology_summary: e.target.value };
                onChange(newData);
                onError('');
              }}
              placeholder={t('caseIntake.step6.pathologyPlaceholder') as any}
              rows={3}
              className="mt-2 resize-none text-sm"
            />
          )}
        </div>
      </div>

      {/* Additional Notes - Compact */}
      <div className="p-3 rounded-lg border border-gray-200">
        <Label className="text-sm font-semibold">
          {t('caseIntake.step6.additionalNotes')}
        </Label>
        <Textarea
          id="files_notes"
          value={data.files_provision_notes || ''}
          onChange={(e) => {
            const newData = { ...data, files_provision_notes: e.target.value };
            onChange(newData);
            onError('');
          }}
          placeholder={t('caseIntake.step6.additionalNotesPlaceholder') as any}
          rows={2}
          className="mt-1.5 resize-none text-sm"
        />
      </div>
    </div>
  );
}

export default Step6;

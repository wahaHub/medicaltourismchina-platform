import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  User,
  Activity,
  Pill,
  Stethoscope,
  FileImage,
  Target,
  AlertCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getCaseIntakeById } from '@/services/api/caseIntakes';
import type { CaseIntake, UploadedFile } from '@/types/caseIntake';

// Status badge component
const StatusBadge = ({ status, isZh }: { status: string; isZh: boolean }) => {
  const statusConfig: Record<string, { label: string; labelZh: string; className: string; icon: React.ReactNode }> = {
    draft: { label: 'Draft', labelZh: '草稿', className: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Clock className="w-3 h-3" /> },
    submitted: { label: 'Submitted', labelZh: '已提交', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: <CheckCircle2 className="w-3 h-3" /> },
    under_review: { label: 'Under Review', labelZh: '审核中', className: 'bg-purple-100 text-purple-700 border-purple-200', icon: <Activity className="w-3 h-3" /> },
    archived: { label: 'Archived', labelZh: '已归档', className: 'bg-gray-100 text-gray-700 border-gray-200', icon: <FileText className="w-3 h-3" /> },
  };
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
      {config.icon}
      {isZh ? config.labelZh : config.label}
    </Badge>
  );
};

// Category label helper
const getCategoryLabel = (category: string, isZh: boolean): string => {
  const categoryLabels: Record<string, { en: string; zh: string }> = {
    surgery: { en: 'Surgery', zh: '外科手术' },
    tumor: { en: 'Tumor/Cancer', zh: '肿瘤' },
    fertility: { en: 'Fertility', zh: '生育' },
    cosmetic: { en: 'Cosmetic', zh: '美容整形' },
    cardiovascular: { en: 'Cardiovascular', zh: '心血管' },
    general: { en: 'General', zh: '综合' },
    other: { en: 'Other', zh: '其他' },
  };
  const labels = categoryLabels[category] || categoryLabels.other;
  return isZh ? labels.zh : labels.en;
};

// Exam type label helper
const getExamTypeLabel = (examType: string, isZh: boolean): string => {
  const examLabels: Record<string, { en: string; zh: string }> = {
    ct: { en: 'CT Scan', zh: 'CT扫描' },
    mri: { en: 'MRI', zh: '核磁共振(MRI)' },
    xray: { en: 'X-Ray', zh: 'X光' },
    ultrasound: { en: 'Ultrasound', zh: '超声波' },
    blood_test: { en: 'Blood Test', zh: '血液检查' },
    urine_test: { en: 'Urine Test', zh: '尿液检查' },
    ecg: { en: 'ECG/EKG', zh: '心电图' },
    endoscopy: { en: 'Endoscopy', zh: '内窥镜' },
    biopsy: { en: 'Biopsy', zh: '活检' },
    pet_scan: { en: 'PET Scan', zh: 'PET扫描' },
  };
  const labels = examLabels[examType] || { en: examType, zh: examType };
  return isZh ? labels.zh : labels.en;
};

// File size formatter
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Information row component
const InfoRow = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <div className="text-gray-400 mt-0.5">{icon}</div>}
      <div className="flex-1">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-gray-900">{value}</div>
      </div>
    </div>
  );
};

// Section component
const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <Card className="mb-6">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-lg">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

// File display component
const FileDisplay = ({ file, isZh }: { file: UploadedFile; isZh: boolean }) => {
  const isImage = file.type?.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif'].some(ext => file.name.toLowerCase().endsWith(ext));
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  return (
    <div className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {isImage ? (
            <FileImage className="w-8 h-8 text-blue-500" />
          ) : isPdf ? (
            <FileText className="w-8 h-8 text-red-500" />
          ) : (
            <FileText className="w-8 h-8 text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate" title={file.name}>
            {file.name}
          </div>
          <div className="text-xs text-gray-500">
            {formatFileSize(file.size)} · {new Date(file.uploadedAt).toLocaleDateString(isZh ? 'zh-CN' : 'en-US')}
          </div>
        </div>
        {file.url && !file.url.startsWith('blob:') && (
          <div className="flex gap-2">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-white rounded-full transition-colors"
              title={isZh ? '在新窗口打开' : 'Open in new tab'}
            >
              <ExternalLink className="w-4 h-4 text-gray-600" />
            </a>
            <a
              href={file.url}
              download={file.name}
              className="p-2 hover:bg-white rounded-full transition-colors"
              title={isZh ? '下载' : 'Download'}
            >
              <Download className="w-4 h-4 text-gray-600" />
            </a>
          </div>
        )}
      </div>
      {/* Image preview */}
      {isImage && file.url && !file.url.startsWith('blob:') && (
        <div className="mt-3">
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-48 rounded border object-contain mx-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

export function CaseIntakeViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const isZh = String(currentLanguage) === 'zh';

  const [caseIntake, setCaseIntake] = useState<CaseIntake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCaseIntake = async () => {
      if (!id) {
        setError(isZh ? '无效的病例ID' : 'Invalid case ID');
        setLoading(false);
        return;
      }

      if (authLoading) return;

      if (!isAuthenticated) {
        navigate('/auth?redirect=' + encodeURIComponent(`/case-intake/${id}`));
        return;
      }

      try {
        setLoading(true);
        const response = await getCaseIntakeById(id);
        setCaseIntake(response.data);
      } catch (err) {
        console.error('Error loading case intake:', err);
        setError(isZh ? '加载病例失败' : 'Failed to load case');
      } finally {
        setLoading(false);
      }
    };

    loadCaseIntake();
  }, [id, isAuthenticated, authLoading, navigate, isZh]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-2 text-gray-500">{isZh ? '加载中...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error || !caseIntake) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            {isZh ? '出错了' : 'Error'}
          </h2>
          <p className="mt-2 text-gray-500">{error || (isZh ? '未找到病例' : 'Case not found')}</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            {isZh ? '返回仪表板' : 'Back to Dashboard'}
          </Button>
        </div>
      </div>
    );
  }

  const formData = caseIntake.form_data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {isZh ? '返回仪表板' : 'Back to Dashboard'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {caseIntake.chief_complaint || formData?.step2?.chief_complaint || (isZh ? '医疗病例' : 'Medical Case')}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {isZh ? '创建于' : 'Created'}: {new Date(caseIntake.created_at).toLocaleDateString(isZh ? 'zh-CN' : 'en-US')}
                </span>
                {caseIntake.submitted_at && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {isZh ? '提交于' : 'Submitted'}: {new Date(caseIntake.submitted_at).toLocaleDateString(isZh ? 'zh-CN' : 'en-US')}
                  </span>
                )}
              </div>
            </div>
            <StatusBadge status={caseIntake.status} isZh={isZh} />
          </div>
          {caseIntake.main_category && (
            <div className="mt-4">
              <Badge variant="secondary">{getCategoryLabel(caseIntake.main_category, isZh)}</Badge>
            </div>
          )}
        </div>

        {/* Step 2: Quick Triage */}
        {formData?.step2 && (
          <Section title={isZh ? '基本信息与分类' : 'Basic Information & Classification'} icon={<Activity className="w-5 h-5 text-blue-500" />}>
            <div className="space-y-1">
              <InfoRow
                label={isZh ? '主诉' : 'Chief Complaint'}
                value={formData.step2.chief_complaint}
              />
              <InfoRow
                label={isZh ? '主要部位' : 'Primary Location'}
                value={formData.step2.primary_location}
              />
              {formData.step2.primary_location_other && (
                <InfoRow
                  label={isZh ? '其他部位说明' : 'Other Location Details'}
                  value={formData.step2.primary_location_other}
                />
              )}
              {formData.step2.symptom_nature && formData.step2.symptom_nature.length > 0 && (
                <InfoRow
                  label={isZh ? '症状性质' : 'Symptom Nature'}
                  value={formData.step2.symptom_nature.join(', ')}
                />
              )}
              {formData.step2.onset_and_course && (
                <>
                  <InfoRow
                    label={isZh ? '发病时间' : 'Onset Time'}
                    value={formData.step2.onset_and_course.category}
                  />
                  <InfoRow
                    label={isZh ? '病程描述' : 'Course Description'}
                    value={formData.step2.onset_and_course.description}
                  />
                </>
              )}
              <InfoRow
                label={isZh ? '当前诊断阶段' : 'Current Diagnosis Stage'}
                value={formData.step2.current_diagnosis_stage}
              />
              <InfoRow
                label={isZh ? '症状严重程度' : 'Symptom Severity'}
                value={formData.step2.symptom_severity}
              />
            </div>
          </Section>
        )}

        {/* Step 3: Present Illness */}
        {formData?.step3 && (
          <Section title={isZh ? '现病史' : 'Present Illness History'} icon={<Stethoscope className="w-5 h-5 text-green-500" />}>
            <div className="space-y-1">
              <InfoRow
                label={isZh ? '详细症状' : 'Detailed Symptoms'}
                value={formData.step3.detailed_symptoms}
              />
              <InfoRow
                label={isZh ? '症状位置' : 'Symptom Location'}
                value={formData.step3.symptom_location}
              />
              <InfoRow
                label={isZh ? '症状特征' : 'Symptom Characteristics'}
                value={formData.step3.symptom_characteristics}
              />
              <InfoRow
                label={isZh ? '病情进展' : 'Progression'}
                value={formData.step3.progression}
              />
              <InfoRow
                label={isZh ? '加重因素' : 'Aggravating Factors'}
                value={formData.step3.aggravating_factors}
              />
              <InfoRow
                label={isZh ? '缓解因素' : 'Relieving Factors'}
                value={formData.step3.relieving_factors}
              />
              <InfoRow
                label={isZh ? '对日常生活的影响' : 'Impact on Daily Life'}
                value={formData.step3.impact_on_daily_life}
              />
              <InfoRow
                label={isZh ? '已尝试的治疗' : 'Previous Treatments Tried'}
                value={formData.step3.previous_treatments_tried}
              />
            </div>
          </Section>
        )}

        {/* Step 4: Past Medical History */}
        {formData?.step4 && (
          <Section title={isZh ? '既往史与家族史' : 'Past Medical & Family History'} icon={<User className="w-5 h-5 text-purple-500" />}>
            <div className="space-y-4">
              {/* Past Medical History */}
              {formData.step4.past_medical_history && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">{isZh ? '既往病史' : 'Past Medical History'}</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(formData.step4.past_medical_history).map(([key, value]) => {
                      if (key === 'other' && value) {
                        return <Badge key={key} variant="outline">{value}</Badge>;
                      }
                      if (key === 'none' && value) {
                        return <Badge key={key} variant="secondary">{isZh ? '无' : 'None'}</Badge>;
                      }
                      if (value === true) {
                        return <Badge key={key} variant="outline">{key}</Badge>;
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* Past Surgeries */}
              {formData.step4.has_past_surgeries && formData.step4.past_surgeries && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">{isZh ? '既往手术' : 'Past Surgeries'}</h4>
                  <div className="space-y-2">
                    {formData.step4.past_surgeries.map((surgery, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded">
                        <div className="font-medium">{surgery.name}</div>
                        {surgery.date && <div className="text-sm text-gray-500">{surgery.date}</div>}
                        {surgery.hospital && <div className="text-sm text-gray-500">{surgery.hospital}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <InfoRow
                label={isZh ? '慢性病' : 'Chronic Conditions'}
                value={formData.step4.has_chronic_conditions ? formData.step4.chronic_conditions_description : (isZh ? '无' : 'None')}
              />
              <InfoRow
                label={isZh ? '家族史' : 'Family History'}
                value={formData.step4.has_family_history ? formData.step4.family_history_description : (isZh ? '无' : 'None')}
              />
            </div>
          </Section>
        )}

        {/* Step 5: Medications & Allergies */}
        {formData?.step5 && (
          <Section title={isZh ? '用药与过敏史' : 'Medications & Allergies'} icon={<Pill className="w-5 h-5 text-orange-500" />}>
            <div className="space-y-4">
              {/* Current Medications */}
              {formData.step5.has_current_medications && formData.step5.current_medications && formData.step5.current_medications.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">{isZh ? '当前用药' : 'Current Medications'}</h4>
                  <div className="space-y-2">
                    {formData.step5.current_medications.map((med, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded">
                        <div className="font-medium">{med.name}</div>
                        {med.dosage && <div className="text-sm text-gray-500">{isZh ? '剂量' : 'Dosage'}: {med.dosage}</div>}
                        {med.frequency && <div className="text-sm text-gray-500">{isZh ? '频率' : 'Frequency'}: {med.frequency}</div>}
                        {med.purpose && <div className="text-sm text-gray-500">{isZh ? '用途' : 'Purpose'}: {med.purpose}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!formData.step5.has_current_medications && (
                <InfoRow label={isZh ? '当前用药' : 'Current Medications'} value={isZh ? '无' : 'None'} />
              )}

              {/* Allergies */}
              {formData.step5.has_allergies && formData.step5.allergies && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">{isZh ? '过敏史' : 'Allergies'}</h4>
                  {formData.step5.allergies.drug_allergies && formData.step5.allergies.drug_allergies.length > 0 && (
                    <div className="mb-2">
                      <div className="text-sm text-gray-500 mb-1">{isZh ? '药物过敏' : 'Drug Allergies'}:</div>
                      <div className="flex flex-wrap gap-2">
                        {formData.step5.allergies.drug_allergies.map((allergy, idx) => (
                          <Badge key={idx} variant="destructive">{allergy.substance}: {allergy.reaction}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {formData.step5.allergies.food_allergies && formData.step5.allergies.food_allergies.length > 0 && (
                    <div className="mb-2">
                      <div className="text-sm text-gray-500 mb-1">{isZh ? '食物过敏' : 'Food Allergies'}:</div>
                      <div className="flex flex-wrap gap-2">
                        {formData.step5.allergies.food_allergies.map((allergy, idx) => (
                          <Badge key={idx} variant="outline">{allergy.substance}: {allergy.reaction}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {formData.step5.allergies.other_allergies && (
                    <InfoRow label={isZh ? '其他过敏' : 'Other Allergies'} value={formData.step5.allergies.other_allergies} />
                  )}
                </div>
              )}
              {!formData.step5.has_allergies && (
                <InfoRow label={isZh ? '过敏史' : 'Allergies'} value={isZh ? '无' : 'None'} />
              )}
            </div>
          </Section>
        )}

        {/* Step 6: Examinations & Files */}
        {formData?.step6 && (
          <Section title={isZh ? '检查与报告' : 'Examinations & Reports'} icon={<FileImage className="w-5 h-5 text-cyan-500" />}>
            <div className="space-y-6">
              {/* Exam Types and Files */}
              {formData.step6.exam_types_selected && formData.step6.exam_types_selected.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">{isZh ? '已做检查' : 'Completed Examinations'}</h4>
                  <div className="space-y-4">
                    {formData.step6.exam_types_selected.map((examType) => {
                      const files = formData.step6?.exam_files?.[examType] || [];
                      return (
                        <div key={examType} className="border rounded-lg p-4">
                          <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            {getExamTypeLabel(examType, isZh)}
                          </h5>
                          {files.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                              {files.map((file: UploadedFile) => (
                                <FileDisplay key={file.id} file={file} isZh={isZh} />
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">{isZh ? '无上传文件' : 'No files uploaded'}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Exam Details Summary */}
              {formData.step6.exam_details_summary && (
                <InfoRow
                  label={isZh ? '检查详情摘要' : 'Examination Details Summary'}
                  value={<pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{formData.step6.exam_details_summary}</pre>}
                />
              )}

              {/* Lab Results */}
              {formData.step6.has_lab_results && formData.step6.lab_results_summary && (
                <InfoRow
                  label={isZh ? '实验室检查结果' : 'Lab Results'}
                  value={<pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{formData.step6.lab_results_summary}</pre>}
                />
              )}

              {/* Imaging */}
              {formData.step6.has_imaging_available && formData.step6.imaging_description && (
                <InfoRow
                  label={isZh ? '影像资料' : 'Imaging'}
                  value={<pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{formData.step6.imaging_description}</pre>}
                />
              )}

              {/* Pathology */}
              {formData.step6.has_pathology_report && formData.step6.pathology_summary && (
                <InfoRow
                  label={isZh ? '病理报告' : 'Pathology Report'}
                  value={<pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{formData.step6.pathology_summary}</pre>}
                />
              )}

              {/* Additional Notes */}
              {formData.step6.files_provision_notes && (
                <InfoRow
                  label={isZh ? '补充说明' : 'Additional Notes'}
                  value={formData.step6.files_provision_notes}
                />
              )}

              {/* General Uploaded Files */}
              {formData.step6.uploaded_files && formData.step6.uploaded_files.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">{isZh ? '其他上传文件' : 'Other Uploaded Files'}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.step6.uploaded_files.map((file: UploadedFile) => (
                      <FileDisplay key={file.id} file={file} isZh={isZh} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Step 7: Treatment Expectations */}
        {formData?.step7 && (
          <Section title={isZh ? '治疗期望与安排' : 'Treatment Expectations & Logistics'} icon={<Target className="w-5 h-5 text-red-500" />}>
            <div className="space-y-4">
              {formData.step7.treatment_expectations && formData.step7.treatment_expectations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">{isZh ? '治疗期望' : 'Treatment Expectations'}</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.step7.treatment_expectations.map((exp, idx) => (
                      <Badge key={idx} variant="outline">{exp}</Badge>
                    ))}
                  </div>
                  {formData.step7.treatment_expectations_other && (
                    <p className="mt-2 text-sm text-gray-600">{formData.step7.treatment_expectations_other}</p>
                  )}
                </div>
              )}

              <InfoRow
                label={isZh ? '预算范围' : 'Budget Range'}
                value={formData.step7.budget_range}
              />
              {formData.step7.budget_notes && (
                <InfoRow
                  label={isZh ? '预算说明' : 'Budget Notes'}
                  value={formData.step7.budget_notes}
                />
              )}

              <InfoRow
                label={isZh ? '期望时间' : 'Preferred Timing'}
                value={formData.step7.preferred_timing}
              />
              {formData.step7.timing_constraints && (
                <InfoRow
                  label={isZh ? '时间限制' : 'Timing Constraints'}
                  value={formData.step7.timing_constraints}
                />
              )}

              {formData.step7.preferred_contact_channel && (
                <InfoRow
                  label={isZh ? '首选联系方式' : 'Preferred Contact Channel'}
                  value={formData.step7.preferred_contact_channel}
                />
              )}

              {formData.step7.additional_notes && (
                <InfoRow
                  label={isZh ? '其他备注' : 'Additional Notes'}
                  value={<pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{formData.step7.additional_notes}</pre>}
                />
              )}
            </div>
          </Section>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            {isZh ? '返回仪表板' : 'Back to Dashboard'}
          </Button>
          <Button onClick={() => navigate('/medical-case-intake')}>
            {isZh ? '提交新病例' : 'Submit New Case'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CaseIntakeViewPage;

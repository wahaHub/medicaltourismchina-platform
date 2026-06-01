import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { patientEntryApi, type PatientMedicalFormTemplate, type PatientMedicalFormTemplateQuestion } from '@/services/api/patient-entry';
import type { UploadedFile } from '@/types/caseIntake';
import { InlineFileUpload } from '@/components/case-intake/common/InlineFileUpload';
import { createChatWidgetTranslator, type ChatWidgetTranslate } from './chat-widget-i18n';

interface PatientMedicalFormModalProps {
  caseId: string;
  templateId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

type MedicalFormAnswerValue =
  | string
  | string[]
  | {
      selectedOptions: string[];
      additionalText?: string;
      files?: UploadedFile[];
    }
  | {
      text: string;
      files?: UploadedFile[];
    };

type PatientMedicalQuestionType = PatientMedicalFormTemplateQuestion['type'] | 'multiselect_with_text';

interface NormalizedMedicalQuestion {
  id: string;
  label: string;
  type: PatientMedicalQuestionType;
  required: boolean;
  options?: Array<{ label: string; value: string }>;
}

interface NormalizedMedicalQuestionSection {
  id: string;
  title?: string;
  description?: string;
  questions: NormalizedMedicalQuestion[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getLocalizedRecordText(
  value: Record<string, unknown>,
  languageCode: string,
  keys: {
    base: string;
    zh?: string;
    en?: string;
  },
): string | null {
  const preferChinese = languageCode === 'zh';
  const candidates = preferChinese
    ? [keys.zh, keys.base, keys.en]
    : [keys.en, keys.base, keys.zh];

  for (const key of candidates) {
    if (!key) {
      continue;
    }
    if (typeof value[key] === 'string' && value[key].trim().length > 0) {
      return value[key] as string;
    }
  }

  return null;
}

function normalizeQuestionType(type: unknown, hasOptions: boolean): PatientMedicalQuestionType {
  if (typeof type !== 'string') {
    return hasOptions ? 'select' : 'text';
  }

  const normalized = type.trim().toUpperCase();
  if (normalized.includes('MULTI_CHOICE_WITH_TEXT')) {
    return 'multiselect_with_text';
  }
  if (normalized.includes('SELECT') || normalized.includes('RADIO')) {
    return 'select';
  }
  if (normalized.includes('MULTI_CHOICE_WITH_FILE')) {
    return 'multiselect_with_file';
  }
  if (normalized.includes('TEXT_WITH_FILE')) {
    return 'text_with_file';
  }
  if (normalized.includes('MULTI')) {
    return 'multiselect';
  }
  if (normalized.includes('DATE')) {
    return 'date';
  }
  if (normalized.includes('TEXTAREA') || normalized.includes('LONG')) {
    return 'textarea';
  }
  return hasOptions ? 'select' : 'text';
}

function normalizeOptions(value: unknown, languageCode: string): Array<{ label: string; value: string }> | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const options = value
    .map((option) => {
      if (typeof option === 'string') {
        return { label: option, value: option };
      }
      if (!isRecord(option)) {
        return null;
      }
      const valueText = typeof option.value === 'string'
        ? option.value
        : getLocalizedRecordText(option, languageCode, {
          base: 'label',
          zh: 'labelZh',
          en: 'labelEn',
        });
      const labelText = getLocalizedRecordText(option, languageCode, {
        base: 'label',
        zh: 'labelZh',
        en: 'labelEn',
      }) ?? valueText;

      if (!valueText || !labelText) {
        return null;
      }

      return {
        label: labelText,
        value: valueText,
      };
    })
    .filter((option): option is { label: string; value: string } =>
      Boolean(option && option.label.trim().length > 0 && option.value.trim().length > 0));

  return options.length > 0 ? options : undefined;
}

function toQuestion(value: unknown, languageCode: string): NormalizedMedicalQuestion | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = typeof value.id === 'string' ? value.id : null;
  const label = getLocalizedRecordText(value, languageCode, {
    base: 'label',
    zh: 'labelZh',
    en: 'labelEn',
  })
    ?? getLocalizedRecordText(value, languageCode, {
      base: 'text',
      zh: 'textZh',
      en: 'textEn',
    })
    ?? getLocalizedRecordText(value, languageCode, {
      base: 'prompt',
      zh: 'promptZh',
      en: 'promptEn',
    })
    ?? getLocalizedRecordText(value, languageCode, {
      base: 'title',
      zh: 'titleZh',
      en: 'titleEn',
    });
  const options = normalizeOptions(value.options, languageCode);

  if (!id || !label) {
    return null;
  }

  return {
    id,
    label,
    type: normalizeQuestionType(value.type, Boolean(options?.length)),
    required: typeof value.required === 'boolean' ? value.required : true,
    options,
  };
}

function extractQuestionSections(template: PatientMedicalFormTemplate, languageCode: string): NormalizedMedicalQuestionSection[] {
  const raw = template.questions;

  if (Array.isArray(raw)) {
    return [{
      id: 'default-section',
      questions: raw
        .map((question) => toQuestion(question, languageCode))
        .filter((question): question is NormalizedMedicalQuestion => question !== null),
    }];
  }

  if (!isRecord(raw)) {
    return [];
  }

  if (Array.isArray(raw.steps)) {
    return raw.steps
      .map((step, index): NormalizedMedicalQuestionSection | null => {
        if (!isRecord(step) || !Array.isArray(step.questions)) {
          return null;
        }

        const questions = step.questions
          .map((question) => toQuestion(question, languageCode))
          .filter((question): question is NormalizedMedicalQuestion => question !== null);

        if (questions.length === 0) {
          return null;
        }

        return {
          id: typeof step.id === 'string' ? step.id : `section-${index + 1}`,
          title: getLocalizedRecordText(step, languageCode, {
            base: 'title',
            zh: 'titleZh',
            en: 'titleEn',
          }) ?? undefined,
          description: getLocalizedRecordText(step, languageCode, {
            base: 'description',
            zh: 'descriptionZh',
            en: 'descriptionEn',
          }) ?? undefined,
          questions,
        };
      })
      .filter((section): section is NormalizedMedicalQuestionSection => section !== null);
  }

  const nestedCandidates = ['items', 'questions', 'fields', 'nodes']
    .map((key) => raw[key])
    .find((value) => Array.isArray(value));

  if (!Array.isArray(nestedCandidates)) {
    return [];
  }

  return [{
    id: 'default-section',
    questions: nestedCandidates
      .map((question) => toQuestion(question, languageCode))
      .filter((question): question is NormalizedMedicalQuestion => question !== null),
  }];
}

function flattenQuestionSections(sections: NormalizedMedicalQuestionSection[]): NormalizedMedicalQuestion[] {
  return sections.flatMap((section) => section.questions);
}

function isMultiValueAnswer(value: MedicalFormAnswerValue | undefined): value is string[] {
  return Array.isArray(value);
}

function isMultiValueWithTextAnswer(
  value: MedicalFormAnswerValue | undefined,
): value is { selectedOptions: string[]; additionalText?: string } {
  return isRecord(value) && Array.isArray(value.selectedOptions);
}

function isTextWithFileAnswer(
  value: MedicalFormAnswerValue | undefined,
): value is { text: string; files?: UploadedFile[] } {
  return isRecord(value) && typeof value.text === 'string';
}

function isFilesArray(value: unknown): value is UploadedFile[] {
  return Array.isArray(value) && value.every((item) =>
    isRecord(item)
    && typeof item.id === 'string'
    && typeof item.name === 'string'
    && typeof item.size === 'number'
    && typeof item.type === 'string'
  );
}

function getUploadedFiles(value: unknown): UploadedFile[] {
  if (!isRecord(value)) {
    return [];
  }

  if (isFilesArray(value.files)) {
    return value.files;
  }

  if (isFilesArray(value.uploaded_files)) {
    return value.uploaded_files;
  }

  return [];
}

function getQuestionnaireReadOnlyTitle(
  isReadOnly: boolean,
  template: PatientMedicalFormTemplate | null,
  translate: ChatWidgetTranslate,
): string {
  void isReadOnly;
  return buildMedicalIntakeTitle(template, translate);
}

function toTitleCase(value: string): string {
  return value
    .split('/')
    .map((segment) => segment
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((part) => {
        if (part.length <= 4 && part === part.toUpperCase()) {
          return part;
        }

        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      })
      .join(' '))
    .join('/');
}

function buildMedicalIntakeTitle(template: PatientMedicalFormTemplate | null, translate: ChatWidgetTranslate): string {
  if (!template) {
    return translate('medicalForm.title.default');
  }

  const category = template.category.trim();
  if (category.length === 0) {
    return translate('medicalForm.title.default');
  }

  return translate('medicalForm.title.withCategory', { category: toTitleCase(category) });
}

export default function PatientMedicalFormModal({ caseId, templateId, isOpen, onClose }: PatientMedicalFormModalProps) {
  const { currentLanguage } = useLanguage();
  const { patient } = usePatientAuth();
  const { requestQuestionnaireHistoryRefresh } = usePatientEntry();
  const [template, setTemplate] = useState<PatientMedicalFormTemplate | null>(null);
  const [answers, setAnswers] = useState<Record<string, MedicalFormAnswerValue>>({});
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const translate = createChatWidgetTranslator(currentLanguage.code);
  const uploadBlockedReason = translate('medicalForm.uploadBlocked');

  useEffect(() => {
    if (!isOpen) {
      setTemplate(null);
      setAnswers({});
      setIsReadOnly(false);
      setErrorMessage(null);
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }

    let cancelled = false;

    const loadTemplate = async () => {
      setTemplate(null);
      setAnswers({});
      setIsReadOnly(false);
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const questionnaireResponseResult = await patientEntryApi.getQuestionnaireResponse({ caseId });
        const submittedResponse = questionnaireResponseResult?.response ?? null;
        const resolvedTemplateId = submittedResponse?.templateId?.trim() || templateId || null;
        const templateResult = resolvedTemplateId
          ? await patientEntryApi.fetchMedicalFormTemplateById(resolvedTemplateId, caseId)
          : await patientEntryApi.fetchMedicalFormTemplate('DEFAULT');
        if (!cancelled) {
          setTemplate(templateResult);
          if (submittedResponse) {
            setAnswers(submittedResponse.responses as Record<string, MedicalFormAnswerValue>);
            setIsReadOnly(
              submittedResponse.completionStatus === 'COMPLETED'
              || submittedResponse.submittedAt !== null,
            );
          }
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : translate('medicalForm.loadFailed'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadTemplate();

    return () => {
      cancelled = true;
    };
  }, [caseId, isOpen, templateId]);

  const sections = useMemo(
    () => (template ? extractQuestionSections(template, currentLanguage.code) : []),
    [currentLanguage.code, template],
  );
  const questions = useMemo(() => flattenQuestionSections(sections), [sections]);

  const handleAnswerChange = (questionId: string, value: MedicalFormAnswerValue) => {
    if (isReadOnly) {
      return;
    }
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!template) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await patientEntryApi.submitMedicalFormResponse({
        caseId,
        templateId: templateId ?? template.id,
        responses: answers,
      });
      requestQuestionnaireHistoryRefresh();
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : translate('medicalForm.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = getQuestionnaireReadOnlyTitle(isReadOnly, template, translate);
  const dialogDescription = isReadOnly
    ? translate('medicalForm.readOnlyDescription')
    : translate('medicalForm.editableDescription');

  const renderFiles = (files: UploadedFile[]) => {
    if (files.length === 0) {
      return null;
    }

    return (
      <div className="space-y-2">
        {files.map((file) => {
          const isImage = file.type.startsWith('image/');
          const fileBlock = (
            <>
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                {isImage ? 'IMG' : 'FILE'}
              </span>
              <span className="min-w-0 flex-1 truncate text-slate-700">{file.name}</span>
              <span className="shrink-0 text-xs text-slate-400">{Math.max(1, Math.round(file.size / 1024))} KB</span>
            </>
          );

          if (file.url) {
            return (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              >
                {fileBlock}
              </a>
            );
          }

          return (
            <div key={file.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              {fileBlock}
            </div>
          );
        })}
      </div>
    );
  };

  const renderReadOnlyAnswer = (question: NormalizedMedicalQuestion, answer: MedicalFormAnswerValue | undefined) => {
    if (!answer) {
      return <span className="text-slate-400">—</span>;
    }

    if (question.type === 'select' || question.type === 'date') {
      return <span className="text-slate-800">{String(answer)}</span>;
    }

    if (question.type === 'multiselect' && Array.isArray(answer)) {
      return (
        <div className="flex flex-wrap gap-2">
          {answer.map((item) => (
            <span key={item} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
              {item}
            </span>
          ))}
        </div>
      );
    }

    if (question.type === 'multiselect_with_text' && isMultiValueWithTextAnswer(answer)) {
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {answer.selectedOptions.map((item) => (
              <span key={item} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                {item}
              </span>
            ))}
          </div>
          {answer.additionalText ? <p className="text-sm text-slate-700">{answer.additionalText}</p> : null}
          {renderFiles(getUploadedFiles(answer))}
        </div>
      );
    }

    if (question.type === 'multiselect_with_file' && isMultiValueAnswer(answer)) {
      return <span className="text-slate-800">{answer.join(', ')}</span>;
    }

    if (question.type === 'text_with_file' && isTextWithFileAnswer(answer)) {
      return (
        <div className="space-y-2">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{answer.text}</p>
          {renderFiles(getUploadedFiles(answer))}
        </div>
      );
    }

    if (isRecord(answer) && Array.isArray(answer.selectedOptions)) {
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {answer.selectedOptions.map((item: string) => (
              <span key={item} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                {item}
              </span>
            ))}
          </div>
          {typeof answer.additionalText === 'string' && answer.additionalText.trim().length > 0 ? (
            <p className="text-sm text-slate-700">{answer.additionalText}</p>
          ) : null}
          {renderFiles(getUploadedFiles(answer))}
        </div>
      );
    }

    if (isRecord(answer) && typeof answer.text === 'string') {
      return (
        <div className="space-y-2">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{answer.text}</p>
          {renderFiles(getUploadedFiles(answer))}
        </div>
      );
    }

    if (Array.isArray(answer)) {
      return (
        <div className="flex flex-wrap gap-2">
          {answer.map((item) => (
            <span key={String(item)} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    return <span className="text-slate-800">{String(answer)}</span>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent
        data-testid="patient-medical-form-modal"
        className="z-[10050] max-h-[88vh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            {translate('medicalForm.loading')}
          </div>
        ) : null}

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {!isLoading && !errorMessage ? (
          <div className="space-y-4">
            {sections.length > 0 ? (
              sections.map((section, sectionIndex) => (
                <section key={section.id} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  {section.title ? (
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {sectionIndex + 1}. {section.title}
                      </h3>
                      {section.description ? (
                        <p className="text-xs leading-5 text-slate-500">{section.description}</p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="space-y-4">
                    {section.questions.map((question) => {
                      const answer = answers[question.id];
                      const checkboxAnswer = isMultiValueAnswer(answer) ? answer : [];
                      const checkboxAnswerWithText = isMultiValueWithTextAnswer(answer)
                        ? answer
                        : { selectedOptions: [], additionalText: '' };
                      const fileAnswer = isRecord(answer) && isFilesArray(answer.files) ? answer.files : [];
                      const textWithFileAnswer = isTextWithFileAnswer(answer)
                        ? answer
                        : { text: '', files: fileAnswer };
                      const multiselectWithFileAnswer = isRecord(answer) && Array.isArray(answer.selectedOptions)
                        ? {
                            selectedOptions: answer.selectedOptions as string[],
                            files: fileAnswer,
                          }
                        : {
                            selectedOptions: [],
                            files: fileAnswer,
                          };

                      return (
                        <div key={question.id} className="space-y-1.5">
                          <label
                            htmlFor={`question-${question.id}`}
                            className="block text-sm font-medium text-slate-800"
                          >
                            {question.label}
                            {question.required ? <span className="ml-1 text-rose-500">*</span> : null}
                          </label>

                          {isReadOnly ? (
                            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                              {renderReadOnlyAnswer(question, answer)}
                            </div>
                          ) : question.type === 'select' && question.options?.length ? (
                            <select
                              id={`question-${question.id}`}
                              value={typeof answer === 'string' ? answer : ''}
                              onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                            >
                              <option value="">{translate('medicalForm.selectOption')}</option>
                              {question.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : question.type === 'multiselect' && question.options?.length ? (
                            <div className="space-y-2 rounded-xl border border-slate-300 bg-white px-3 py-3">
                              {question.options.map((option) => {
                                const checked = checkboxAnswer.includes(option.value);
                                return (
                                  <label key={option.value} className="flex items-center gap-2 text-sm text-slate-800">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(event) => {
                                        const next = event.target.checked
                                          ? [...checkboxAnswer, option.value]
                                          : checkboxAnswer.filter((value) => value !== option.value);
                                        handleAnswerChange(question.id, next);
                                      }}
                                    />
                                    <span>{option.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          ) : question.type === 'multiselect_with_text' && question.options?.length ? (
                            <div className="space-y-3 rounded-xl border border-slate-300 bg-white px-3 py-3">
                              <div className="space-y-2">
                                {question.options.map((option) => {
                                  const checked = checkboxAnswerWithText.selectedOptions.includes(option.value);
                                  return (
                                    <label key={option.value} className="flex items-center gap-2 text-sm text-slate-800">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(event) => {
                                          const selectedOptions = event.target.checked
                                            ? [...checkboxAnswerWithText.selectedOptions, option.value]
                                            : checkboxAnswerWithText.selectedOptions.filter((value) => value !== option.value);
                                          handleAnswerChange(question.id, {
                                            ...checkboxAnswerWithText,
                                            selectedOptions,
                                          });
                                        }}
                                      />
                                      <span>{option.label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                              <div className="space-y-1.5">
                                <label
                                  htmlFor={`question-${question.id}-details`}
                                  className="block text-xs font-medium uppercase tracking-wide text-slate-500"
                                >
                                  {translate('medicalForm.additionalDetails')}
                                </label>
                                <textarea
                                  id={`question-${question.id}-details`}
                                  rows={3}
                                  value={checkboxAnswerWithText.additionalText ?? ''}
                                  onChange={(event) => handleAnswerChange(question.id, {
                                    ...checkboxAnswerWithText,
                                    additionalText: event.target.value,
                                  })}
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                                />
                              </div>
                            </div>
                          ) : question.type === 'text_with_file' ? (
                            <div className="space-y-3 rounded-xl border border-slate-300 bg-white px-3 py-3">
                              <textarea
                                id={`question-${question.id}`}
                                rows={4}
                                value={textWithFileAnswer.text}
                                onChange={(event) => handleAnswerChange(question.id, {
                                  ...textWithFileAnswer,
                                  text: event.target.value,
                                })}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                              />
                              <InlineFileUpload
                                files={textWithFileAnswer.files ?? []}
                                onFilesChange={(files) => handleAnswerChange(question.id, {
                                  ...textWithFileAnswer,
                                  files,
                                })}
                                category="other"
                                examType={question.id}
                                maxFiles={5}
                                userId={patient?.id}
                                caseIntakeId={caseId}
                                requirePersistentUpload
                                disabled={!patient?.id}
                                disabledReason={uploadBlockedReason}
                              />
                            </div>
                          ) : question.type === 'multiselect_with_file' && question.options?.length ? (
                            <div className="space-y-3 rounded-xl border border-slate-300 bg-white px-3 py-3">
                              <div className="space-y-2">
                                {question.options.map((option) => {
                                  const checked = multiselectWithFileAnswer.selectedOptions.includes(option.value);
                                  return (
                                    <label key={option.value} className="flex items-center gap-2 text-sm text-slate-800">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(event) => {
                                          const selectedOptions = event.target.checked
                                            ? [...multiselectWithFileAnswer.selectedOptions, option.value]
                                            : multiselectWithFileAnswer.selectedOptions.filter((value) => value !== option.value);
                                          handleAnswerChange(question.id, {
                                            ...multiselectWithFileAnswer,
                                            selectedOptions,
                                          });
                                        }}
                                      />
                                      <span>{option.label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                              <InlineFileUpload
                                files={multiselectWithFileAnswer.files ?? []}
                                onFilesChange={(files) => handleAnswerChange(question.id, {
                                  ...multiselectWithFileAnswer,
                                  files,
                                })}
                                category="other"
                                examType={question.id}
                                maxFiles={5}
                                userId={patient?.id}
                                caseIntakeId={caseId}
                                requirePersistentUpload
                                disabled={!patient?.id}
                                disabledReason={uploadBlockedReason}
                              />
                            </div>
                          ) : question.type === 'date' ? (
                            <Input
                              id={`question-${question.id}`}
                              type="date"
                              value={typeof answer === 'string' ? answer : ''}
                              onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                            />
                          ) : question.type === 'textarea' ? (
                            <textarea
                              id={`question-${question.id}`}
                              rows={4}
                              value={typeof answer === 'string' ? answer : ''}
                              onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                            />
                          ) : (
                            <Input
                              id={`question-${question.id}`}
                              value={typeof answer === 'string' ? answer : ''}
                              onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                              className="h-10"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            ) : (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                {translate('medicalForm.noQuestions')}
              </p>
            )}
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {translate('medicalForm.close')}
          </Button>
          {!isReadOnly ? (
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isLoading || isSubmitting || questions.length === 0}
              className="w-full bg-teal-600 hover:bg-teal-700 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {translate('medicalForm.submitting')}
                </>
              ) : (
                translate('medicalForm.submit')
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

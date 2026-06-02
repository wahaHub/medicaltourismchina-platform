import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, Eye, LifeBuoy, Loader2, MessageSquareMore, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientDashboardHome } from '@/hooks/usePatientDashboard';
import { departmentApi } from '@/services/api/department';
import { crmApi, type PatientSessionProfileUpdate } from '@/services/api/crmApiClient';
import type { Department } from '@/types';
import {
  createChatWidgetTranslator,
  formatDestinationSelection,
  getCountryOptions,
  getDestinationOptions,
  getGenderOptions,
  getTreatmentTimeOptions,
  localizeCountry,
  localizeDestination,
  localizeTreatmentTime,
  parseDestinationSelection,
} from '@/components/chat/chat-widget-i18n';
import CurrentCaseModal from './CurrentCaseModal';

interface HomePageProps {
  onNavigateTab?: (
    tab: 'home' | 'quotes' | 'messages' | 'tickets' | 'orders' | 'journey',
    params?: Record<string, string | null | undefined>,
  ) => void;
}

function formatCaseLabel(caseNumber: string) {
  return caseNumber.startsWith('CASE-') ? caseNumber : `Case ${caseNumber}`;
}

type IntakeDetail = {
  key: string;
  label: string;
  value: string | null | undefined;
  editable?: boolean;
  kind?: 'text' | 'select' | 'multiselect';
  options?: Array<{ value: string; label: string }>;
  isLoadingOptions?: boolean;
  displayValue?: string;
};

function getDepartmentDisplayName(department: Department, languageCode: string) {
  return languageCode === 'zh' ? department.name : (department.name_en || department.name);
}

function resolveOptionLabel(value: string, options: IntakeDetail['options']) {
  return options?.find((option) => option.value === value)?.label ?? value;
}

function EditableIntakeDetail({
  detail,
  value,
  isEditing,
  isSaving,
  draftValue,
  onEdit,
  onDraftChange,
  onCommit,
  onCancel,
  onSave,
}: {
  detail: IntakeDetail;
  value: string;
  isEditing: boolean;
  isSaving: boolean;
  draftValue: string;
  onEdit: () => void;
  onDraftChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  onSave: (value: string) => void;
}) {
  const displayValue = detail.displayValue ?? resolveOptionLabel(value, detail.options);

  if (isEditing) {
    if (detail.kind === 'select') {
      return (
        <div className="rounded-xl bg-slate-50 px-3 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {detail.label}
          </div>
          <Select value={draftValue} onValueChange={onSave}>
            <SelectTrigger
              aria-label={detail.label}
              className="mt-2 h-9 rounded-lg border-teal-200 bg-white px-3 text-sm font-medium text-slate-900 ring-2 ring-teal-100"
            >
              <SelectValue placeholder={detail.isLoadingOptions ? '加载中...' : detail.label} />
            </SelectTrigger>
            <SelectContent className="z-[10020]">
              {detail.isLoadingOptions ? (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  加载中...
                </div>
              ) : detail.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (detail.kind === 'multiselect') {
      const selectedValues = parseDestinationSelection(draftValue);

      return (
        <div className="rounded-xl bg-slate-50 px-3 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {detail.label}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                aria-label={detail.label}
                className="mt-2 h-9 w-full justify-between rounded-lg border-teal-200 bg-white px-3 text-left text-sm font-medium text-slate-900 ring-2 ring-teal-100 hover:bg-white"
              >
                <span className="truncate">{detail.displayValue || resolveOptionLabel(draftValue, detail.options) || detail.label}</span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="z-[10020] w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border-slate-200 p-2"
            >
              {detail.options?.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={() => {
                    const next = selectedValues.includes(option.value)
                      ? selectedValues.filter((valueItem) => valueItem !== option.value)
                      : option.value === 'No preference'
                        ? ['No preference']
                        : [
                            ...selectedValues.filter((valueItem) => valueItem !== 'No preference'),
                            option.value,
                          ];
                    const nextValue = formatDestinationSelection(next);
                    onDraftChange(nextValue);
                    onSave(nextValue);
                  }}
                  onSelect={(event) => event.preventDefault()}
                  className="rounded-lg py-2"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    return (
      <div className="rounded-xl bg-slate-50 px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500" htmlFor={`patient-summary-${detail.key}`}>
            {detail.label}
          </label>
          {isSaving && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              保存中
            </span>
          )}
        </div>
        <input
          id={`patient-summary-${detail.key}`}
          aria-label={detail.label}
          className="mt-2 h-9 w-full rounded-lg border border-teal-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none ring-2 ring-teal-100"
          value={draftValue}
          disabled={isSaving}
          onChange={(event) => onDraftChange(event.target.value)}
          onBlur={onCommit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onCommit();
            }
            if (event.key === 'Escape') {
              onCancel();
            }
          }}
          autoFocus
        />
      </div>
    );
  }

  if (!detail.editable) {
    return (
      <div className="rounded-xl bg-slate-50 px-3 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {detail.label}
        </div>
        <div className="mt-1 break-words text-sm font-medium text-slate-900">
          {value || '未填写'}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="rounded-xl bg-slate-50 px-3 py-3 text-left transition-colors hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
      aria-label={`编辑 ${detail.label}`}
      onClick={onEdit}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        <span>{detail.label}</span>
      </div>
      <div className="mt-1 flex items-center gap-2 break-words text-sm font-medium text-slate-900">
        <span>{displayValue || '未填写'}</span>
        {isSaving && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            保存中
          </span>
        )}
      </div>
    </button>
  );
}

export default function HomePage({ onNavigateTab }: HomePageProps) {
  const { currentLanguage } = useLanguage();
  const { patient, refreshPatientSession } = usePatientAuth();
  const { data, isLoading, error } = usePatientDashboardHome();
  const [currentCaseOpen, setCurrentCaseOpen] = useState(false);
  const [editedIntakeDetails, setEditedIntakeDetails] = useState<Record<string, string>>({});
  const [editingIntakeKey, setEditingIntakeKey] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState('');
  const [savingIntakeKey, setSavingIntakeKey] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [departmentsLoadFailed, setDepartmentsLoadFailed] = useState(false);
  const translate = createChatWidgetTranslator(currentLanguage.code);
  const genderOptions = getGenderOptions(translate);
  const countryOptions = getCountryOptions(translate);
  const destinationOptions = getDestinationOptions(translate);
  const treatmentTimeOptions = getTreatmentTimeOptions(translate);
  const departmentOptions = departments.map((department) => ({
    value: department.slug,
    label: getDepartmentDisplayName(department, currentLanguage.code),
  }));
  const genderLabel = genderOptions.find((option) => option.value === patient?.gender)?.label;

  useEffect(() => {
    let cancelled = false;

    const loadDepartments = async () => {
      setIsLoadingDepartments(true);
      setDepartmentsLoadFailed(false);
      try {
        const response = await departmentApi.getDept(currentLanguage.apiCode);
        if (!cancelled) {
          setDepartments(response.data);
        }
      } catch {
        if (!cancelled) {
          setDepartments([]);
          setDepartmentsLoadFailed(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDepartments(false);
        }
      }
    };

    void loadDepartments();

    return () => {
      cancelled = true;
    };
  }, [currentLanguage.apiCode]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="px-6 py-8 text-sm text-slate-500">
          {translate('dashboard.home.loading')}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-rose-200 bg-rose-50 shadow-none">
        <CardHeader>
          <CardTitle className="text-rose-900">{translate('dashboard.home.unavailableTitle')}</CardTitle>
          <CardDescription className="text-rose-700">
            {error instanceof Error ? error.message : translate('dashboard.home.unavailableFallback')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data || data.caseCount === 0 || !data.activeCase) {
    return (
      <div className="grid min-h-[calc(100vh-2.5rem)] gap-4">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-5 w-5 text-teal-600" />
              {translate('dashboard.home.welcomeBack')}
            </CardTitle>
            <CardDescription>
              {translate('dashboard.home.setupPrompt')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
              {translate('dashboard.home.noActiveCase')}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => onNavigateTab?.('messages')}>
                <MessageSquareMore className="mr-2 h-4 w-4" />
                {translate('dashboard.home.goMessages')}
              </Button>
              <Button variant="outline" onClick={() => onNavigateTab?.('quotes')}>
                {translate('dashboard.home.viewQuotes')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => onNavigateTab?.('tickets', { compose: '1' })}>
                <LifeBuoy className="mr-2 h-4 w-4" />
                {translate('dashboard.home.createTicket')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const intakeDetails: IntakeDetail[] = [
    {
      key: 'name',
      label: translate('chatWidget.form.name'),
      value: patient?.name || data.patientName,
      editable: true,
    },
    {
      key: 'email',
      label: translate('chatWidget.form.email'),
      value: patient?.email || data.patientEmail,
      editable: false,
    },
    {
      key: 'phone',
      label: translate('chatWidget.form.phone'),
      value: patient?.phone || data.activeCase.patientPhone,
      editable: true,
    },
    {
      key: 'age',
      label: translate('chatWidget.form.age'),
      value: patient?.age,
      editable: true,
    },
    {
      key: 'gender',
      label: translate('chatWidget.form.gender'),
      value: patient?.gender,
      editable: true,
      kind: 'select',
      options: [...genderOptions],
      displayValue: genderLabel,
    },
    {
      key: 'country',
      label: translate('chatWidget.form.country'),
      value: patient?.country || data.activeCase.patientCountry,
      editable: true,
      kind: 'select',
      options: [...countryOptions],
      displayValue: localizeCountry(editedIntakeDetails.country ?? patient?.country ?? data.activeCase.patientCountry ?? '', translate),
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      value: patient?.whatsapp,
      editable: true,
    },
    {
      key: 'messenger',
      label: 'Messenger',
      value: patient?.messenger,
      editable: true,
    },
    {
      key: 'departmentCode',
      label: translate('chatWidget.form.department'),
      value: patient?.departmentCode || patient?.department,
      editable: true,
      kind: departmentsLoadFailed ? 'text' : 'select',
      options: departmentOptions,
      isLoadingOptions: isLoadingDepartments,
    },
    {
      key: 'disease',
      label: translate('chatWidget.form.disease'),
      value: patient?.disease || data.activeCase.primaryDiagnosis,
      editable: true,
    },
    {
      key: 'destination',
      label: translate('chatWidget.form.destination'),
      value: patient?.destination,
      editable: true,
      kind: 'multiselect',
      options: [...destinationOptions],
      displayValue: localizeDestination(editedIntakeDetails.destination ?? patient?.destination ?? '', translate),
    },
    {
      key: 'treatmentTime',
      label: translate('chatWidget.form.treatmentTime'),
      value: patient?.treatmentTime,
      editable: true,
      kind: 'select',
      options: [...treatmentTimeOptions],
      displayValue: localizeTreatmentTime(editedIntakeDetails.treatmentTime ?? patient?.treatmentTime ?? '', translate),
    },
  ];

  const beginEditingIntakeDetail = (detail: IntakeDetail) => {
    if (!detail.editable) return;
    setEditingIntakeKey(detail.key);
    setEditingDraft(editedIntakeDetails[detail.key] ?? detail.value ?? '');
  };

  const saveIntakeDetail = async (key: string, value: string) => {
    const nextValue = value.trim();
    setSaveError(null);
    setSavingIntakeKey(key);

    try {
      await crmApi.updateMe({ [key]: nextValue } as PatientSessionProfileUpdate);
      await refreshPatientSession();
    } catch (saveProfileError) {
      setSaveError(saveProfileError instanceof Error ? saveProfileError.message : '保存失败，请稍后再试。');
      setSavingIntakeKey(null);
      return;
    }

    setEditedIntakeDetails((current) => ({
      ...current,
      [key]: nextValue,
    }));
    setEditingIntakeKey(null);
    setSavingIntakeKey(null);
  };

  const commitEditingIntakeDetail = () => {
    if (!editingIntakeKey) return;
    void saveIntakeDetail(editingIntakeKey, editingDraft);
  };

  const cancelEditingIntakeDetail = () => {
    setEditingIntakeKey(null);
    setEditingDraft('');
  };

  return (
    <div className="grid min-h-[calc(100vh-2.5rem)] gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-0 shadow-lg lg:self-start">
        <CardContent className="space-y-4 pt-6">
          <button
            type="button"
            className="block w-full rounded-2xl bg-slate-50 px-4 py-4 text-left transition-colors hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            onClick={() => setCurrentCaseOpen(true)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{translate('dashboard.home.activeCase')}</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {formatCaseLabel(data.activeCase.caseNumber)}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {data.activeCase.primaryDiagnosis || data.activeCase.aiSummary || translate('dashboard.home.noSummary')}
                </div>
              </div>
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-teal-700 shadow-sm">
                <Eye className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                {data.activeCase.assignmentStatus}
              </Badge>
              <Badge variant="outline" className="text-slate-600">
                {data.activeCase.treatmentStage || translate('dashboard.home.noStage')}
              </Badge>
            </div>
          </button>

          <div className="flex flex-wrap gap-3">
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => onNavigateTab?.('messages')}>
              <MessageSquareMore className="mr-2 h-4 w-4" />
              {translate('dashboard.home.goMessages')}
            </Button>
            <Button variant="outline" onClick={() => onNavigateTab?.('tickets', { compose: '1' })}>
              <LifeBuoy className="mr-2 h-4 w-4" />
              {translate('dashboard.home.createTicket')}
            </Button>
            <Button variant="outline" onClick={() => onNavigateTab?.('quotes')}>
              {translate('dashboard.home.viewQuotes')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid content-start gap-4">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">{translate('dashboard.home.patientSummary')}</CardTitle>
            <CardDescription>右下角建档表单里提交的信息。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {saveError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
                {saveError}
              </div>
            )}
            {intakeDetails.map((detail) => (
              <EditableIntakeDetail
                key={detail.key}
                detail={detail}
                value={editedIntakeDetails[detail.key] ?? detail.value ?? ''}
                isEditing={editingIntakeKey === detail.key}
                isSaving={savingIntakeKey === detail.key}
                draftValue={editingDraft}
                onEdit={() => beginEditingIntakeDetail(detail)}
                onDraftChange={setEditingDraft}
                onCommit={commitEditingIntakeDetail}
                onCancel={cancelEditingIntakeDetail}
                onSave={(value) => void saveIntakeDetail(detail.key, value)}
              />
            ))}
          </CardContent>
        </Card>

      </div>
      <CurrentCaseModal
        caseItem={data.activeCase}
        open={currentCaseOpen}
        onOpenChange={setCurrentCaseOpen}
      />
    </div>
  );
}

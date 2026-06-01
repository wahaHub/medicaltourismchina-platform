import { useEffect, useState } from 'react';
import { AlertCircle, ChevronDown, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { departmentApi } from '@/services/api/department';
import { startPatientOnboarding } from '@/services/patient-onboarding';
import type { Department } from '@/types';
import {
  createChatWidgetTranslator,
  formatDestinationSelection,
  getCountryOptions,
  getDestinationOptions,
  getGenderOptions,
  getTreatmentTimeOptions,
  parseDestinationSelection,
} from './chat-widget-i18n';

const NO_DESTINATION_PREFERENCE = 'No preference';

function getDepartmentDisplayName(department: Department, languageCode: string) {
  return languageCode === 'zh' ? department.name : (department.name_en || department.name);
}

function normalizeStoredDepartmentSelection(
  departments: Department[],
  departmentName: string,
  departmentCode: string,
  languageCode: string,
) {
  const trimmedDepartmentName = departmentName.trim();
  const trimmedDepartmentCode = departmentCode.trim();

  if (!trimmedDepartmentName && !trimmedDepartmentCode) {
    return null;
  }

  const selectedDepartment = (
    (trimmedDepartmentCode
      ? departments.find((department) => department.slug === trimmedDepartmentCode)
      : null)
    ?? departments.find((department) =>
      department.slug === trimmedDepartmentName
      || department.name.toLowerCase() === trimmedDepartmentName.toLowerCase()
      || department.name_en.toLowerCase() === trimmedDepartmentName.toLowerCase()
      || getDepartmentDisplayName(department, languageCode).toLowerCase() === trimmedDepartmentName.toLowerCase(),
    )
  );

  if (!selectedDepartment) {
    return null;
  }

  return {
    department: getDepartmentDisplayName(selectedDepartment, languageCode),
    departmentCode: selectedDepartment.slug,
  };
}

export default function PatientProfileForm() {
  const { currentLanguage } = useLanguage();
  const { bootstrapSession } = usePatientAuth();
  const {
    profileDraft,
    patchProfileDraft,
    applyOnboardingResult,
    setBootstrapError,
  } = usePatientEntry();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [departmentsLoadFailed, setDepartmentsLoadFailed] = useState(false);
  const translate = createChatWidgetTranslator(currentLanguage.code);
  const genderOptions = getGenderOptions(translate);
  const countryOptions = getCountryOptions(translate);
  const destinationOptions = getDestinationOptions(translate);
  const treatmentTimeOptions = getTreatmentTimeOptions(translate);
  const selectedDestinations = parseDestinationSelection(profileDraft.destination);
  const selectedDestinationLabels = selectedDestinations
    .map((value) => destinationOptions.find((destination) => destination.value === value)?.label ?? value);
  const destinationButtonLabel = selectedDestinationLabels.length > 0
    ? selectedDestinationLabels.join(', ')
    : translate('chatWidget.form.destinationPlaceholder');

  const toggleDestination = (destination: string) => {
    const nextDestinations = selectedDestinations.includes(destination)
      ? selectedDestinations.filter((value) => value !== destination)
      : destination === NO_DESTINATION_PREFERENCE
        ? [NO_DESTINATION_PREFERENCE]
        : [
            ...selectedDestinations.filter((value) => value !== NO_DESTINATION_PREFERENCE),
            destination,
          ];

    patchProfileDraft({ destination: formatDestinationSelection(nextDestinations) });
  };

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

  useEffect(() => {
    if (!departments.length || !profileDraft.department.trim()) {
      return;
    }

    const normalized = normalizeStoredDepartmentSelection(
      departments,
      profileDraft.department,
      profileDraft.departmentCode,
      currentLanguage.code,
    );

    if (
      normalized
      && (
        normalized.department !== profileDraft.department
        || normalized.departmentCode !== profileDraft.departmentCode
      )
    ) {
      patchProfileDraft(normalized);
    }
  }, [
    currentLanguage.code,
    departments,
    patchProfileDraft,
    profileDraft.department,
    profileDraft.departmentCode,
  ]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setBootstrapError(null);

    if (!profileDraft.department.trim()) {
      setErrorMessage(translate('chatWidget.form.departmentRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const { bootstrapPromise } = await startPatientOnboarding({
        draft: {
          ...profileDraft,
          preferredLanguage: currentLanguage.code,
        },
        bootstrapSession,
        applyOnboardingResult,
        onBootstrapError: (error) => {
          const message = error instanceof Error ? error.message : translate('chatWidget.form.startFailed');
          setBootstrapError(message);
        },
      });

      void bootstrapPromise.catch(() => undefined);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : translate('chatWidget.form.startFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="max-w-[92%] space-y-4 rounded-[28px] border border-teal-100 bg-white px-5 py-5 shadow-[0_24px_48px_rgba(15,23,42,0.1)]"
      onSubmit={handleSubmit}
    >
      <div>
        <div className="text-xl font-semibold text-slate-900">{translate('chatWidget.form.title')}</div>
        <p className="mt-1 text-sm text-slate-500">
          {translate('chatWidget.form.subtitle')}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="patient-name">{translate('chatWidget.form.name')}</Label>
          <Input
            id="patient-name"
            value={profileDraft.name}
            onChange={(event) => patchProfileDraft({ name: event.target.value })}
            required
            className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-inner shadow-slate-200/40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="patient-email">{translate('chatWidget.form.email')}</Label>
          <Input
            id="patient-email"
            type="email"
            value={profileDraft.email}
            onChange={(event) => patchProfileDraft({ email: event.target.value })}
            required
            className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-inner shadow-slate-200/40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="patient-phone">{translate('chatWidget.form.phone')}</Label>
          <Input
            id="patient-phone"
            value={profileDraft.phone}
            onChange={(event) => patchProfileDraft({ phone: event.target.value })}
            required
            className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-inner shadow-slate-200/40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="patient-gender">{translate('chatWidget.form.gender')}</Label>
          <Select
            value={profileDraft.gender}
            onValueChange={(value) => patchProfileDraft({ gender: value })}
          >
            <SelectTrigger
              id="patient-gender"
              aria-label={translate('chatWidget.form.gender')}
              className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-inner shadow-slate-200/40"
            >
              <SelectValue placeholder={translate('chatWidget.form.genderPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="z-[10020] rounded-2xl border-slate-200 shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
              {genderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="patient-country">{translate('chatWidget.form.country')}</Label>
          <Select
            value={profileDraft.country}
            onValueChange={(value) => patchProfileDraft({ country: value })}
          >
            <SelectTrigger
              id="patient-country"
              aria-label={translate('chatWidget.form.country')}
              className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-inner shadow-slate-200/40"
            >
              <SelectValue placeholder={translate('chatWidget.form.countryPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="z-[10020] rounded-2xl border-slate-200 shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
              {countryOptions.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="patient-department">{translate('chatWidget.form.department')}</Label>
          {departmentsLoadFailed || (!isLoadingDepartments && departments.length === 0) ? (
            <Input
              id="patient-department"
              value={profileDraft.department}
              onChange={(event) => patchProfileDraft({
                department: event.target.value,
                departmentCode: '',
              })}
              required
              placeholder={translate('chatWidget.form.departmentManualPlaceholder')}
              className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-inner shadow-slate-200/40"
            />
          ) : (
            <Select
              value={profileDraft.departmentCode || profileDraft.department}
              onValueChange={(value) => {
                const matchedDepartment = departments.find((department) => department.slug === value);
                patchProfileDraft({
                  department: matchedDepartment
                    ? getDepartmentDisplayName(matchedDepartment, currentLanguage.code)
                    : value,
                  departmentCode: matchedDepartment?.slug || value,
                });
              }}
            >
              <SelectTrigger
                id="patient-department"
                aria-label={translate('chatWidget.form.department')}
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-inner shadow-slate-200/40"
              >
                <SelectValue placeholder={translate('chatWidget.form.departmentPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="z-[10020] rounded-2xl border-slate-200 shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
                {isLoadingDepartments ? (
                  <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
                    {translate('chatWidget.form.departmentLoading')}
                  </div>
                ) : (
                  departments.map((department) => (
                    <SelectItem key={department.slug} value={department.slug}>
                      {getDepartmentDisplayName(department, currentLanguage.code)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
          {departmentsLoadFailed ? (
            <p className="text-xs text-amber-600">
              {translate('chatWidget.form.departmentUnavailable')}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="patient-disease">{translate('chatWidget.form.disease')}</Label>
          <Input
            id="patient-disease"
            value={profileDraft.disease}
            onChange={(event) => patchProfileDraft({ disease: event.target.value })}
            required
            placeholder={translate('chatWidget.form.diseasePlaceholder')}
            className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-inner shadow-slate-200/40"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="patient-destination">{translate('chatWidget.form.destination')}</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                id="patient-destination"
                type="button"
                variant="outline"
                aria-label={translate('chatWidget.form.destination')}
                className="h-12 w-full justify-between rounded-2xl border-slate-200 bg-slate-50 px-4 text-left font-normal text-slate-900 shadow-inner shadow-slate-200/40 hover:bg-slate-50"
              >
                <span className="truncate">{destinationButtonLabel}</span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="z-[10020] w-[var(--radix-dropdown-menu-trigger-width)] rounded-2xl border-slate-200 p-2 shadow-[0_20px_40px_rgba(15,23,42,0.18)]"
            >
              {destinationOptions.map((destination) => (
                <DropdownMenuCheckboxItem
                  key={destination.value}
                  checked={selectedDestinations.includes(destination.value)}
                  onCheckedChange={() => toggleDestination(destination.value)}
                  onSelect={(event) => event.preventDefault()}
                  className="rounded-xl py-2"
                >
                  {destination.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="patient-treatment-time">{translate('chatWidget.form.treatmentTime')}</Label>
          <Select
            value={profileDraft.treatmentTime}
            onValueChange={(value) => patchProfileDraft({ treatmentTime: value })}
          >
            <SelectTrigger
              id="patient-treatment-time"
              aria-label={translate('chatWidget.form.treatmentTime')}
              className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-inner shadow-slate-200/40"
            >
              <SelectValue placeholder={translate('chatWidget.form.treatmentTimePlaceholder')} />
            </SelectTrigger>
            <SelectContent className="z-[10020] rounded-2xl border-slate-200 shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
              {treatmentTimeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="leading-6">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="h-12 w-full rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-base font-semibold hover:from-teal-600 hover:to-cyan-600"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {translate('chatWidget.form.submitting')}
          </>
        ) : (
          translate('chatWidget.form.submit')
        )}
      </Button>
    </form>
  );
}

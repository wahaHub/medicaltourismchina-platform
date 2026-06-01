import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getPartnershipApplicationDefinition,
  type PartnershipFieldDefinition,
} from "@/components/work-with-us/applicationConfig";
import { submitPartnershipApplication, type PartnershipApplicationType } from "@/services/api/partnershipApplications";

type PartnershipApplicationFormProps = {
  activeTab: PartnershipApplicationType;
  locale: "en" | "zh";
  className?: string;
};

type SubmissionState = {
  title: string;
  message: string;
} | null;

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export function PartnershipApplicationForm({ activeTab, locale, className = "mt-10" }: PartnershipApplicationFormProps) {
  const definition = useMemo(
    () => getPartnershipApplicationDefinition(activeTab, locale),
    [activeTab, locale],
  );
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setErrors({});
    setSubmitError(null);
    setSubmissionState(null);
  }, [activeTab, locale]);

  const localeText = locale === "zh"
    ? {
        required: "此项为必填",
        invalidEmail: "请输入有效邮箱地址",
        sectionLabel: "合作申请表",
        contactHint: "提交后会同时发送到内部合作邮箱，并向申请人发送确认邮件。",
      }
    : {
        required: "This field is required",
        invalidEmail: "Please enter a valid email address",
        sectionLabel: "Application form",
        contactHint: "Submissions are emailed to our partnerships inboxes and a confirmation is sent to the applicant.",
      };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormValues((current) => ({ ...current, [fieldId]: value }));
    setErrors((current) => ({ ...current, [fieldId]: "" }));
    setSubmitError(null);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    definition.fields.forEach((field) => {
      const value = (formValues[field.id] || "").trim();
      if (field.required && !value) {
        nextErrors[field.id] = localeText.required;
      }
      if (field.id === "email" && value && !isValidEmail(value)) {
        nextErrors[field.id] = localeText.invalidEmail;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const rootValues: Record<string, string> = {};
    const detailValues: Record<string, string> = {};

    definition.fields.forEach((field) => {
      const value = (formValues[field.id] || "").trim();
      if (!value) return;

      if (field.storage === "root") {
        rootValues[field.id] = value;
      } else {
        detailValues[field.id] = value;
      }
    });

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitPartnershipApplication({
        applicationType: activeTab,
        organizationName: rootValues.organizationName,
        website: rootValues.website,
        contactName: rootValues.contactName,
        jobTitle: rootValues.jobTitle,
        email: rootValues.email,
        phone: rootValues.phone,
        whatsapp: rootValues.whatsapp,
        wechat: rootValues.wechat,
        country: rootValues.country,
        city: rootValues.city,
        notes: rootValues.notes,
        details: detailValues,
      });

      setSubmissionState({
        title: definition.successTitle,
        message: definition.successMessage,
      });
      setFormValues({});
      setErrors({});
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: PartnershipFieldDefinition) => {
    const value = formValues[field.id] || "";
    const fieldClassName =
      "rounded-2xl border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-[#0F638E]";

    return (
      <div key={field.id} className={field.fullWidth ? "md:col-span-2" : ""}>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          {field.label}
          {field.required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>

        {field.type === "textarea" ? (
          <Textarea
            value={value}
            onChange={(event) => handleFieldChange(field.id, event.target.value)}
            placeholder={field.placeholder}
            className={`${fieldClassName} min-h-[120px]`}
          />
        ) : null}

        {field.type === "select" ? (
          <select
            value={value}
            onChange={(event) => handleFieldChange(field.id, event.target.value)}
            className={`${fieldClassName} flex h-12 w-full`}
          >
            <option value="">{field.placeholder}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}

        {field.type !== "textarea" && field.type !== "select" ? (
          <Input
            type={field.type}
            value={value}
            onChange={(event) => handleFieldChange(field.id, event.target.value)}
            placeholder={field.placeholder}
            className={fieldClassName}
          />
        ) : null}

        {errors[field.id] ? <p className="mt-2 text-sm text-rose-600">{errors[field.id]}</p> : null}
      </div>
    );
  };

  return (
    <section id="partnership-application" className={`${className} rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-lg sm:p-8`}>
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-6">
        <div className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          {localeText.sectionLabel}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl">{definition.title}</h3>
        <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{definition.description}</p>
        <p className="max-w-3xl text-sm leading-7 text-slate-500">{definition.promise}</p>
      </div>

      <div className="mt-6 rounded-[24px] border border-[#D9E8F0] bg-gradient-to-r from-[#F7FBFD] to-white p-4 text-sm leading-7 text-slate-600">
        {localeText.contactHint}
      </div>

      {submissionState ? (
        <div className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <p className="text-base font-semibold">{submissionState.title}</p>
          <p className="mt-2 text-sm leading-7">{submissionState.message}</p>
        </div>
      ) : null}

      {submitError ? (
        <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <p className="text-sm leading-7">{submitError}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="grid gap-5 md:grid-cols-2">
          {definition.fields.map(renderField)}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-7 text-slate-500">
            {locale === "zh" ? "提交即表示您同意我们使用以上信息进行合作评估和后续联系。" : "By submitting, you agree that Medora Health may review this information for partnership evaluation and follow-up."}
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? locale === "zh"
                ? "提交中..."
                : "Submitting..."
              : definition.submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}

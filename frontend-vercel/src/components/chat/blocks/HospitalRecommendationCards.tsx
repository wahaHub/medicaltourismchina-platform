import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import type { HospitalRecommendationCardsBlock, HospitalRecommendationItem } from '../../../types/chatbot-blocks';
import { createChatWidgetTranslator } from '../chat-widget-i18n';

interface HospitalRecommendationCardsProps {
  block: HospitalRecommendationCardsBlock;
  onSubmitSelection?: (hospitalIds: string[], customHospitalRequest?: string) => Promise<void> | void;
  historyResourceId?: string;
  historyResourceStatus?: string;
}

function HospitalThumbnail({
  hospital,
  placeholderLabel,
}: {
  hospital: HospitalRecommendationItem;
  placeholderLabel: string;
}) {
  const candidates = useMemo(
    () => [
      ...(hospital.thumbnailUrl ? [hospital.thumbnailUrl] : []),
      ...(hospital.thumbnailFallbackUrls ?? []),
    ],
    [hospital.thumbnailFallbackUrls, hospital.thumbnailUrl],
  );
  const [candidateIndex, setCandidateIndex] = useState(0);
  const currentImageUrl = candidates[candidateIndex];

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidates]);

  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {currentImageUrl ? (
        <img
          src={currentImageUrl}
          alt={hospital.name ?? 'Hospital thumbnail'}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => {
            setCandidateIndex((index) => index + 1);
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-50 to-teal-50 px-2 text-center text-[11px] font-medium text-slate-500">
          {placeholderLabel}
        </div>
      )}
    </div>
  );
}

export function HospitalRecommendationCards({
  block,
  onSubmitSelection,
  historyResourceId,
  historyResourceStatus,
}: HospitalRecommendationCardsProps) {
  const { currentLanguage } = useLanguage();
  const visibleHospitals = useMemo(() => block.hospitals.slice(0, 3), [block.hospitals]);
  const [selectedHospitalIds, setSelectedHospitalIds] = useState<string[]>([]);
  const [customHospitalRequest, setCustomHospitalRequest] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const translate = createChatWidgetTranslator(currentLanguage.code);

  const trimmedCustomHospitalRequest = customHospitalRequest.trim();
  const canSubmit = selectedHospitalIds.length > 0 || trimmedCustomHospitalRequest.length > 0;

  function toggleHospitalSelection(hospitalId: string) {
    setSelectedHospitalIds((current) =>
      current.includes(hospitalId)
        ? current.filter((value) => value !== hospitalId)
        : [...current, hospitalId],
    );
  }

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onSubmitSelection?.(
        selectedHospitalIds,
        trimmedCustomHospitalRequest.length > 0 ? trimmedCustomHospitalRequest : undefined,
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : translate('chatWidget.hospitals.saveFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      data-block-type="HOSPITAL_RECOMMENDATION_CARDS"
      data-history-resource-id={historyResourceId}
      data-history-resource-status={historyResourceStatus}
      className="max-w-[92%] space-y-3 rounded-[28px] border border-cyan-100 bg-white p-5 shadow-[0_24px_48px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50">
          <Building2 className="h-4 w-4 text-cyan-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-slate-900">{block.title}</div>
          {block.description ? (
            <p className="mt-1 text-[13px] leading-5 text-slate-500">{block.description}</p>
          ) : null}
        </div>
      </div>

      {visibleHospitals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-3 text-[13px] text-slate-600">
          {translate('chatWidget.hospitals.empty')}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleHospitals.map((hospital) => {
            const checked = selectedHospitalIds.includes(hospital.hospitalId);
            const cardContent = (
              <>
                <HospitalThumbnail
                  hospital={hospital}
                  placeholderLabel={translate('chatWidget.hospitals.placeholder')}
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-[13px] font-semibold leading-5 text-slate-900">
                    {hospital.name ?? translate('chatWidget.hospitals.placeholder')}
                  </div>
                  {hospital.city ? (
                    <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-cyan-700">
                      {hospital.city}
                    </div>
                  ) : null}
                  {hospital.summary ? (
                    <p className="line-clamp-3 text-[12px] leading-5 text-slate-500">{hospital.summary}</p>
                  ) : hospital.reason ? (
                    <p className="line-clamp-3 text-[12px] leading-5 text-slate-500">{hospital.reason}</p>
                  ) : null}
                </div>
              </>
            );

            return (
              <label
                key={hospital.hospitalId}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50/40"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleHospitalSelection(hospital.hospitalId)}
                  aria-label={hospital.name ?? hospital.hospitalId}
                  className="mt-1"
                />
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  {hospital.ctaUrl ? (
                    <a
                      href={hospital.ctaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-w-0 flex-1 items-start gap-3"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {cardContent}
                    </a>
                  ) : (
                    cardContent
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}

      <div className="space-y-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
        <p className="text-[13px] leading-5 text-slate-600">
          {translate('chatWidget.hospitals.customPrompt')}
        </p>
        <Input
          value={customHospitalRequest}
          onChange={(event) => setCustomHospitalRequest(event.target.value)}
          placeholder={translate('chatWidget.hospitals.customPlaceholder')}
        />
      </div>

      {errorMessage ? (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>{errorMessage}</div>
        </div>
      ) : null}

      <Button
        type="button"
        className="h-12 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
        disabled={!canSubmit || isSubmitting}
        onClick={() => {
          void handleSubmit();
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {translate('chatWidget.hospitals.submitting')}
          </>
        ) : (
          translate('chatWidget.hospitals.submit')
        )}
      </Button>
    </div>
  );
}

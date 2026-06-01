import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { Step3Data } from '@/types/caseIntake';

interface Step3Props {
  data: Partial<Step3Data>;
  onChange: (data: Partial<Step3Data>) => void;
  onError: (error: string) => void;
  missingFields?: string[];
}

export function Step3({ data, onChange, onError, missingFields = [] }: Step3Props) {
  const { t, currentLanguage } = useLanguage();
  const isZh = String(currentLanguage) === 'zh';

  const handleChange = (field: keyof Step3Data, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
    onError('');
  };

  return (
    <div className="space-y-4">
      {/* Detailed Symptoms - Required */}
      <div className={`p-3 rounded-lg border ${missingFields.includes('detailed_symptoms') ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200'}`}>
        <Label htmlFor="detailed_symptoms" className={`text-sm font-semibold ${missingFields.includes('detailed_symptoms') ? 'text-red-700' : ''}`}>
          {t('caseIntake.step3.detailedSymptoms')} *
        </Label>
        <Textarea
          id="detailed_symptoms"
          value={data.detailed_symptoms || ''}
          onChange={(e) => handleChange('detailed_symptoms', e.target.value)}
          placeholder={t('caseIntake.step3.detailedSymptomsPlaceholder')}
          rows={4}
          className={`mt-1.5 resize-none text-sm ${missingFields.includes('detailed_symptoms') ? 'border-red-400' : ''}`}
        />
        <p className="text-xs text-gray-500 mt-1">
          {t('caseIntake.step3.detailedSymptomsTip')}
        </p>
      </div>

      {/* Progression */}
      <div className="p-3 rounded-lg border border-gray-200">
        <Label htmlFor="progression" className="text-sm font-semibold">
          {t('caseIntake.step3.progression')}
        </Label>
        <Textarea
          id="progression"
          value={data.progression || ''}
          onChange={(e) => handleChange('progression', e.target.value)}
          placeholder={t('caseIntake.step3.progressionPlaceholder')}
          rows={2}
          className="mt-1.5 resize-none text-sm"
        />
      </div>

      {/* Aggravating & Relieving Factors - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Aggravating Factors */}
        <div className="p-3 rounded-lg border border-gray-200">
          <Label className="text-sm font-semibold">
            {t('caseIntake.step3.aggravatingFactors')}
          </Label>
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            {[
              { key: 'activity', labelKey: 'caseIntake.step3.aggravating.activity' },
              { key: 'eating', labelKey: 'caseIntake.step3.aggravating.eating' },
              { key: 'night', labelKey: 'caseIntake.step3.aggravating.night' },
              { key: 'stress', labelKey: 'caseIntake.step3.aggravating.stress' },
              { key: 'weather', labelKey: 'caseIntake.step3.aggravating.weather' },
              { key: 'position', labelKey: 'caseIntake.step3.aggravating.position' }
            ].map(({ key, labelKey }) => (
              <div key={key} className="flex items-center space-x-1 px-1.5 py-0.5">
                <Checkbox
                  id={`aggr_${key}`}
                  checked={data.aggravating_factors?.includes(key) || false}
                  onCheckedChange={(checked) => {
                    const current = data.aggravating_factors || '';
                    const items = current.split(',').filter(Boolean);
                    if (checked) {
                      handleChange('aggravating_factors', [...items, key].join(','));
                    } else {
                      handleChange('aggravating_factors', items.filter(i => i !== key).join(','));
                    }
                  }}
                  className="h-3.5 w-3.5"
                />
                <Label htmlFor={`aggr_${key}`} className="cursor-pointer font-normal text-xs">
                  {t(labelKey as any)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Relieving Factors */}
        <div className="p-3 rounded-lg border border-gray-200">
          <Label className="text-sm font-semibold">
            {t('caseIntake.step3.relievingFactors')}
          </Label>
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            {[
              { key: 'rest', labelKey: 'caseIntake.step3.relieving.rest' },
              { key: 'medication', labelKey: 'caseIntake.step3.relieving.medication' },
              { key: 'heat', labelKey: 'caseIntake.step3.relieving.heat' },
              { key: 'cold', labelKey: 'caseIntake.step3.relieving.cold' },
              { key: 'massage', labelKey: 'caseIntake.step3.relieving.massage' },
              { key: 'position_change', labelKey: 'caseIntake.step3.relieving.positionChange' }
            ].map(({ key, labelKey }) => (
              <div key={key} className="flex items-center space-x-1 px-1.5 py-0.5">
                <Checkbox
                  id={`relief_${key}`}
                  checked={data.relieving_factors?.includes(key) || false}
                  onCheckedChange={(checked) => {
                    const current = data.relieving_factors || '';
                    const items = current.split(',').filter(Boolean);
                    if (checked) {
                      handleChange('relieving_factors', [...items, key].join(','));
                    } else {
                      handleChange('relieving_factors', items.filter(i => i !== key).join(','));
                    }
                  }}
                  className="h-3.5 w-3.5"
                />
                <Label htmlFor={`relief_${key}`} className="cursor-pointer font-normal text-xs">
                  {t(labelKey as any)}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact on Daily Life - Compact */}
      <div className="p-3 rounded-lg border border-gray-200">
        <Label className="text-sm font-semibold">
          {t('caseIntake.step3.impactOnLife')}
        </Label>
        <div className="mt-1.5 grid grid-cols-2 md:grid-cols-4 gap-1">
          {[
            { key: 'work', labelKey: 'caseIntake.step3.impact.work' },
            { key: 'sleep', labelKey: 'caseIntake.step3.impact.sleep' },
            { key: 'mobility', labelKey: 'caseIntake.step3.impact.mobility' },
            { key: 'appetite', labelKey: 'caseIntake.step3.impact.appetite' },
            { key: 'mood', labelKey: 'caseIntake.step3.impact.mood' },
            { key: 'social', labelKey: 'caseIntake.step3.impact.social' },
            { key: 'exercise', labelKey: 'caseIntake.step3.impact.exercise' },
            { key: 'self_care', labelKey: 'caseIntake.step3.impact.selfCare' }
          ].map(({ key, labelKey }) => (
            <div key={key} className="flex items-center space-x-1 px-1.5 py-0.5">
              <Checkbox
                id={`impact_${key}`}
                checked={data.impact_on_daily_life?.includes(key) || false}
                onCheckedChange={(checked) => {
                  const current = data.impact_on_daily_life || '';
                  const items = current.split(',').filter(Boolean);
                  if (checked) {
                    handleChange('impact_on_daily_life', [...items, key].join(','));
                  } else {
                    handleChange('impact_on_daily_life', items.filter(i => i !== key).join(','));
                  }
                }}
                className="h-3.5 w-3.5"
              />
              <Label htmlFor={`impact_${key}`} className="cursor-pointer font-normal text-xs">
                {t(labelKey as any)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Previous Treatments - Compact */}
      <div className="p-3 rounded-lg border border-gray-200">
        <Label htmlFor="previous_treatments_tried" className="text-sm font-semibold">
          {t('caseIntake.step3.previousTreatments')}
        </Label>
        <Textarea
          id="previous_treatments_tried"
          value={data.previous_treatments_tried || ''}
          onChange={(e) => handleChange('previous_treatments_tried', e.target.value)}
          placeholder={t('caseIntake.step3.previousTreatmentsPlaceholder')}
          rows={2}
          className="mt-1.5 resize-none text-sm"
        />
      </div>
    </div>
  );
}

export default Step3;


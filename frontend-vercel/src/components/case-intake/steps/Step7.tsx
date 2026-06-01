import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Step7Data, TreatmentExpectation, BudgetRange, PreferredTiming, ContactChannel } from '@/types/caseIntake';
import { CheckCircle } from 'lucide-react';

interface Step7Props {
  data: Partial<Step7Data>;
  onChange: (data: Partial<Step7Data>) => void;
  onError: (error: string) => void;
  missingFields?: string[];
}

export function Step7({ data, onChange, onError, missingFields = [] }: Step7Props) {
  const { t } = useLanguage();

  const handleChange = (field: keyof Step7Data, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
    onError('');
  };

  const handleExpectationChange = (expectation: TreatmentExpectation, checked: boolean) => {
    const current = data.treatment_expectations || [];
    if (checked) {
      handleChange('treatment_expectations', [...current, expectation]);
    } else {
      handleChange('treatment_expectations', current.filter(e => e !== expectation));
    }
  };

  return (
    <div className="space-y-4">
      {/* Treatment Expectations & Budget - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Treatment Expectations */}
        <div className={`p-3 rounded-lg border ${missingFields.includes('treatment_expectations') ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <Label className={`text-sm font-semibold ${missingFields.includes('treatment_expectations') ? 'text-red-700' : ''}`}>
            {t('caseIntake.step7.treatmentExpectations')} *
          </Label>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('caseIntake.step7.selectAll')}
          </p>
          <div className="mt-2 space-y-1">
            {[
              { value: 'diagnosis', labelKey: 'caseIntake.step7.expectation.diagnosis' },
              { value: 'treatment_plan', labelKey: 'caseIntake.step7.expectation.treatmentPlan' },
              { value: 'second_opinion', labelKey: 'caseIntake.step7.expectation.secondOpinion' },
              { value: 'cost_evaluation', labelKey: 'caseIntake.step7.expectation.costEvaluation' },
              { value: 'post_treatment_followup', labelKey: 'caseIntake.step7.expectation.postTreatment' }
            ].map(({ value, labelKey }) => (
              <div key={value} className="flex items-center space-x-1.5 px-1.5 py-0.5">
                <Checkbox
                  id={value}
                  checked={data.treatment_expectations?.includes(value as TreatmentExpectation) || false}
                  onCheckedChange={(checked) => handleExpectationChange(value as TreatmentExpectation, !!checked)}
                  className="h-3.5 w-3.5"
                />
                <Label htmlFor={value} className="cursor-pointer font-normal text-xs">
                  {t(labelKey as any)}
                </Label>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <Textarea
              id="expectations_other"
              value={data.treatment_expectations_other || ''}
              onChange={(e) => handleChange('treatment_expectations_other', e.target.value)}
              placeholder={t('caseIntake.step7.expectationOtherPlaceholder') as any}
              rows={2}
              className="resize-none text-xs"
            />
          </div>
        </div>

        {/* Budget */}
        <div className={`p-3 rounded-lg border ${missingFields.includes('budget_range') ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <Label className={`text-sm font-semibold ${missingFields.includes('budget_range') ? 'text-red-700' : ''}`}>
            {t('caseIntake.step7.budgetRange')} *
          </Label>
          <Select
            value={data.budget_range || ''}
            onValueChange={(value) => handleChange('budget_range', value as BudgetRange)}
          >
            <SelectTrigger className="mt-2 h-8 text-sm">
              <SelectValue placeholder={t('caseIntake.step7.selectBudget')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-5k">{t('caseIntake.step7.budget.0to5k')}</SelectItem>
              <SelectItem value="5-10k">{t('caseIntake.step7.budget.5to10k')}</SelectItem>
              <SelectItem value="10-20k">{t('caseIntake.step7.budget.10to20k')}</SelectItem>
              <SelectItem value="20-50k">{t('caseIntake.step7.budget.20to50k')}</SelectItem>
              <SelectItem value=">50k">{t('caseIntake.step7.budget.over50k')}</SelectItem>
              <SelectItem value="uncertain">{t('caseIntake.step7.budget.uncertain')}</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            id="budget_notes"
            value={data.budget_notes || ''}
            onChange={(e) => handleChange('budget_notes', e.target.value)}
            placeholder={t('caseIntake.step7.budgetNotesPlaceholder') as any}
            rows={2}
            className="mt-2 resize-none text-xs"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            {t('caseIntake.step7.budgetNote')}
          </p>
        </div>
      </div>

      {/* Timing & Contact Preferences - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Timing */}
        <div className={`p-3 rounded-lg border ${missingFields.includes('preferred_timing') ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <Label className={`text-sm font-semibold ${missingFields.includes('preferred_timing') ? 'text-red-700' : ''}`}>
            {t('caseIntake.step7.preferredTiming')} *
          </Label>
          <Select
            value={data.preferred_timing || ''}
            onValueChange={(value) => handleChange('preferred_timing', value as PreferredTiming)}
          >
            <SelectTrigger className="mt-2 h-8 text-sm">
              <SelectValue placeholder={t('caseIntake.step7.selectTiming')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="within_1month">{t('caseIntake.step7.timing.within1Month')}</SelectItem>
              <SelectItem value="1-3months">{t('caseIntake.step7.timing.1to3Months')}</SelectItem>
              <SelectItem value="3-6months">{t('caseIntake.step7.timing.3to6Months')}</SelectItem>
              <SelectItem value=">6months">{t('caseIntake.step7.timing.after6Months')}</SelectItem>
              <SelectItem value="flexible">{t('caseIntake.step7.timing.flexible')}</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            id="timing_constraints"
            value={data.timing_constraints || ''}
            onChange={(e) => handleChange('timing_constraints', e.target.value)}
            placeholder={t('caseIntake.step7.timingConstraintsPlaceholder') as any}
            rows={2}
            className="mt-2 resize-none text-xs"
          />
        </div>

        {/* Contact Preferences */}
        <div className="p-3 rounded-lg border border-gray-200">
          <Label className="text-sm font-semibold">
            {t('caseIntake.step7.contactPreferences')}
          </Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="contact_channel" className="text-xs text-gray-600">
                {t('caseIntake.step7.preferredContact')}
              </Label>
              <Select
                value={data.preferred_contact_channel || ''}
                onValueChange={(value) => handleChange('preferred_contact_channel', value as ContactChannel)}
              >
                <SelectTrigger className="mt-1 h-7 text-xs">
                  <SelectValue placeholder={t('caseIntake.onsetCourse.pleaseSelect') as any} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">{t('caseIntake.step7.contact.email')}</SelectItem>
                  <SelectItem value="phone">{t('caseIntake.step7.contact.phone')}</SelectItem>
                  <SelectItem value="wechat">{t('caseIntake.step7.contact.wechat')}</SelectItem>
                  <SelectItem value="whatsapp">{t('caseIntake.step7.contact.whatsapp')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="best_contact_time" className="text-xs text-gray-600">
                {t('caseIntake.step7.bestContactTime')}
              </Label>
              <Input
                id="best_contact_time"
                value={data.best_contact_time || ''}
                onChange={(e) => handleChange('best_contact_time', e.target.value)}
                placeholder={t('caseIntake.step7.bestContactTimePlaceholder') as any}
                className="mt-1 h-7 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Notes - Compact */}
      <div className="p-3 rounded-lg border border-gray-200">
        <Label className="text-sm font-semibold">
          {t('caseIntake.step7.additionalInfo')}
        </Label>
        <Textarea
          id="additional_notes"
          value={data.additional_notes || ''}
          onChange={(e) => handleChange('additional_notes', e.target.value)}
          placeholder={t('caseIntake.step7.additionalInfoPlaceholder') as any}
          rows={3}
          className="mt-1.5 resize-none text-sm"
        />
        <p className="text-[10px] text-gray-500 mt-1">
          {t('caseIntake.step7.additionalInfoHint')}
        </p>
      </div>

      {/* Final Note - Compact */}
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm text-green-900">
              {t('caseIntake.step7.almostDone')}
            </h4>
            <p className="text-xs text-green-800 mt-0.5">
              {t('caseIntake.step7.reviewMessage')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step7;

import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Step4Data, PastSurgery } from '@/types/caseIntake';
import { YesNoToggle } from '../common/YesNoToggle';

interface Step4Props {
  data: Partial<Step4Data>;
  onChange: (data: Partial<Step4Data>) => void;
  onError: (error: string) => void;
}

export function Step4({ data, onChange, onError }: Step4Props) {
  const { t, currentLanguage } = useLanguage();
  const isZh = String(currentLanguage) === 'zh';

  const handleChange = (field: keyof Step4Data, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
    onError('');
  };

  const handleMedicalHistoryChange = (condition: string, checked: boolean) => {
    const history = data.past_medical_history || {};
    
    // If "none" is checked, uncheck all others
    if (condition === 'none' && checked) {
      handleChange('past_medical_history', { none: true });
    } else {
      // If any other is checked, uncheck "none"
      const newHistory = {
        ...history,
        [condition]: checked,
        none: false
      };
      handleChange('past_medical_history', newHistory);
    }
  };

  const addSurgery = () => {
    const surgeries = data.past_surgeries || [];
    handleChange('past_surgeries', [
      ...surgeries,
      { name: '', date: '', hospital: '', complications: '' }
    ]);
  };

  const removeSurgery = (index: number) => {
    const surgeries = data.past_surgeries || [];
    handleChange('past_surgeries', surgeries.filter((_, i) => i !== index));
  };

  const updateSurgery = (index: number, field: keyof PastSurgery, value: string) => {
    const surgeries = data.past_surgeries || [];
    const updated = [...surgeries];
    updated[index] = { ...updated[index], [field]: value };
    handleChange('past_surgeries', updated);
  };

  return (
    <div className="space-y-4">
      {/* Past Medical History - Compact */}
      <div className="p-3 rounded-lg border border-gray-200">
        <Label className="text-sm font-semibold">
          {t('caseIntake.step4.pastMedicalHistory')}
        </Label>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-1">
          {[
            { key: 'hypertension', labelKey: 'caseIntake.step4.condition.hypertension' },
            { key: 'diabetes', labelKey: 'caseIntake.step4.condition.diabetes' },
            { key: 'heart_disease', labelKey: 'caseIntake.step4.condition.heartDisease' },
            { key: 'stroke', labelKey: 'caseIntake.step4.condition.stroke' },
            { key: 'hepatitis', labelKey: 'caseIntake.step4.condition.hepatitis' },
            { key: 'kidney_disease', labelKey: 'caseIntake.step4.condition.kidneyDisease' },
            { key: 'cancer', labelKey: 'caseIntake.step4.condition.cancer' },
            { key: 'tuberculosis', labelKey: 'caseIntake.step4.condition.tuberculosis' }
          ].map(({ key, labelKey }) => (
            <div key={key} className="flex items-center space-x-1 px-1.5 py-0.5">
              <Checkbox
                id={key}
                checked={data.past_medical_history?.[key as keyof typeof data.past_medical_history] || false}
                onCheckedChange={(checked) => handleMedicalHistoryChange(key, !!checked)}
                className="h-3.5 w-3.5"
              />
              <Label htmlFor={key} className="cursor-pointer font-normal text-xs">
                {t(labelKey as any)}
              </Label>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Input
            id="other_conditions"
            value={data.past_medical_history?.other || ''}
            onChange={(e) => handleChange('past_medical_history', {
              ...data.past_medical_history,
              other: e.target.value
            })}
            placeholder={t('caseIntake.step4.otherConditions')}
            className="h-8 text-sm flex-1"
          />
          <div className="flex items-center space-x-1 px-2 py-1 border rounded bg-gray-50">
            <Checkbox
              id="none"
              checked={data.past_medical_history?.none || false}
              onCheckedChange={(checked) => handleMedicalHistoryChange('none', !!checked)}
              className="h-3.5 w-3.5"
            />
            <Label htmlFor="none" className="cursor-pointer font-normal text-xs whitespace-nowrap">
              {t('caseIntake.step4.noHistory')}
            </Label>
          </div>
        </div>
      </div>

      {/* Past Surgeries - Compact */}
      <div className="p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">
            {t('caseIntake.step4.pastSurgicalHistory')}
          </Label>
          <YesNoToggle
            name="past_surgeries"
            value={data.has_past_surgeries || false}
            onChange={(value) => {
              if (!value && data.has_past_surgeries && data.past_surgeries && data.past_surgeries.length > 0) {
                const confirmed = window.confirm(
                  isZh
                    ? '切换为"无手术史"将清空所有已添加的手术记录，确定吗？'
                    : 'Switching to "No surgical history" will clear all added surgery records. Are you sure?'
                );
                if (!confirmed) return;
              }
              const newData = {
                ...data,
                has_past_surgeries: value,
                past_surgeries: value ? (data.past_surgeries || []) : []
              };
              onChange(newData);
            }}
            noLabelKey="caseIntake.step4.noSurgery"
            yesLabelKey="caseIntake.step4.hasSurgery"
          />
        </div>

        {data.has_past_surgeries && (
          <div className="mt-3 space-y-2">
            {(data.past_surgeries || []).map((surgery, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-xs text-gray-600">
                    {t('caseIntake.step4.surgery')} {index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSurgery(index)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Input
                    value={surgery.name}
                    onChange={(e) => updateSurgery(index, 'name', e.target.value)}
                    placeholder={isZh ? '手术名称' : 'Surgery name'}
                    className="h-7 text-xs"
                  />
                  <Input
                    type="text"
                    value={surgery.date}
                    onChange={(e) => updateSurgery(index, 'date', e.target.value)}
                    placeholder={isZh ? '日期' : 'Date'}
                    className="h-7 text-xs"
                  />
                  <Input
                    value={surgery.hospital || ''}
                    onChange={(e) => updateSurgery(index, 'hospital', e.target.value)}
                    placeholder={isZh ? '医院(可选)' : 'Hospital (optional)'}
                    className="h-7 text-xs"
                  />
                  <Input
                    value={surgery.complications || ''}
                    onChange={(e) => updateSurgery(index, 'complications', e.target.value)}
                    placeholder={isZh ? '并发症(如有)' : 'Complications (if any)'}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addSurgery}
              size="sm"
              className="w-full h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              {t('caseIntake.step4.addSurgery')}
            </Button>
          </div>
        )}
      </div>

      {/* Chronic Conditions & Family History - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Chronic Conditions */}
        <div className="p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              {t('caseIntake.step4.chronicConditions')}
            </Label>
            <YesNoToggle
              name="chronic_conditions"
              value={data.has_chronic_conditions || false}
              onChange={(value) => handleChange('has_chronic_conditions', value)}
              noLabelKey="caseIntake.step4.noChronic"
              yesLabelKey="caseIntake.step4.hasChronic"
            />
          </div>
          {data.has_chronic_conditions && (
            <Textarea
              value={data.chronic_conditions_description || ''}
              onChange={(e) => handleChange('chronic_conditions_description', e.target.value)}
              placeholder={t('caseIntake.step4.chronicDescription')}
              rows={2}
              className="mt-2 resize-none text-sm"
            />
          )}
        </div>

        {/* Family History */}
        <div className="p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              {t('caseIntake.step4.familyHistory')}
            </Label>
            <YesNoToggle
              name="family_history"
              value={data.has_family_history || false}
              onChange={(value) => handleChange('has_family_history', value)}
              noLabelKey="caseIntake.step4.noFamily"
              yesLabelKey="caseIntake.step4.hasFamily"
            />
          </div>
          {data.has_family_history && (
            <Textarea
              value={data.family_history_description || ''}
              onChange={(e) => handleChange('family_history_description', e.target.value)}
              placeholder={t('caseIntake.step4.familyDescription')}
              rows={2}
              className="mt-2 resize-none text-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Step4;


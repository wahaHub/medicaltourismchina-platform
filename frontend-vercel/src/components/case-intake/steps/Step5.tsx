import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Step5Data, Medication, Allergen } from '@/types/caseIntake';
import { YesNoToggle } from '../common/YesNoToggle';

interface Step5Props {
  data: Partial<Step5Data>;
  onChange: (data: Partial<Step5Data>) => void;
  onError: (error: string) => void;
}

export function Step5({ data, onChange, onError }: Step5Props) {
  const { t, currentLanguage } = useLanguage();
  const isZh = String(currentLanguage) === 'zh';

  const handleChange = (field: keyof Step5Data, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
    onError('');
  };

  // Medications management
  const addMedication = () => {
    const meds = data.current_medications || [];
    handleChange('current_medications', [
      ...meds,
      { name: '', dosage: '', frequency: '', duration: '', purpose: '' }
    ]);
  };

  const removeMedication = (index: number) => {
    const meds = data.current_medications || [];
    handleChange('current_medications', meds.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const meds = data.current_medications || [];
    const updated = [...meds];
    updated[index] = { ...updated[index], [field]: value };
    handleChange('current_medications', updated);
  };

  // Drug allergies management
  const addDrugAllergy = () => {
    const allergies = data.allergies?.drug_allergies || [];
    handleChange('allergies', {
      ...data.allergies,
      drug_allergies: [...allergies, { substance: '', reaction: '' }]
    });
  };

  const removeDrugAllergy = (index: number) => {
    const allergies = data.allergies?.drug_allergies || [];
    handleChange('allergies', {
      ...data.allergies,
      drug_allergies: allergies.filter((_, i) => i !== index)
    });
  };

  const updateDrugAllergy = (index: number, field: keyof Allergen, value: string) => {
    const allergies = data.allergies?.drug_allergies || [];
    const updated = [...allergies];
    updated[index] = { ...updated[index], [field]: value };
    handleChange('allergies', {
      ...data.allergies,
      drug_allergies: updated
    });
  };

  // Food allergies management
  const addFoodAllergy = () => {
    const allergies = data.allergies?.food_allergies || [];
    handleChange('allergies', {
      ...data.allergies,
      food_allergies: [...allergies, { substance: '', reaction: '' }]
    });
  };

  const removeFoodAllergy = (index: number) => {
    const allergies = data.allergies?.food_allergies || [];
    handleChange('allergies', {
      ...data.allergies,
      food_allergies: allergies.filter((_, i) => i !== index)
    });
  };

  const updateFoodAllergy = (index: number, field: keyof Allergen, value: string) => {
    const allergies = data.allergies?.food_allergies || [];
    const updated = [...allergies];
    updated[index] = { ...updated[index], [field]: value };
    handleChange('allergies', {
      ...data.allergies,
      food_allergies: updated
    });
  };

  return (
    <div className="space-y-4">
      {/* Current Medications - Compact */}
      <div className="p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">
            {t('caseIntake.step5.currentMedications')}
          </Label>
          <YesNoToggle
            name="current_medications"
            value={data.has_current_medications || false}
            onChange={(value) => {
              if (!value && data.has_current_medications &&
                  ((data.current_medications && data.current_medications.length > 0) ||
                   (data.medication_types_selected && data.medication_types_selected.length > 0))) {
                const confirmed = window.confirm(
                  isZh
                    ? '切换为"未服用药物"将清空所有已添加的用药记录，确定吗？'
                    : 'Switching to "Not taking medications" will clear all medication records. Are you sure?'
                );
                if (!confirmed) return;
              }
              const newData = {
                ...data,
                has_current_medications: value,
                current_medications: value ? (data.current_medications || []) : [],
                medication_types_selected: value ? (data.medication_types_selected || []) : []
              };
              onChange(newData);
            }}
            noLabelKey="caseIntake.step5.noMedications"
            yesLabelKey="caseIntake.step5.hasMedications"
          />
        </div>

        {data.has_current_medications && (
          <div className="mt-3 space-y-3">
            {/* Common medication types - Compact grid */}
            <div className="pb-3 border-b">
              <Label className="text-xs font-medium text-gray-600">
                {t('caseIntake.step5.medicationTypes')}
              </Label>
              <div className="mt-1.5 grid grid-cols-2 md:grid-cols-4 gap-1">
                {[
                  { key: 'antihypertensive', labelKey: 'caseIntake.step5.medType.antihypertensive' },
                  { key: 'diabetes', labelKey: 'caseIntake.step5.medType.diabetes' },
                  { key: 'anticoagulant', labelKey: 'caseIntake.step5.medType.anticoagulant' },
                  { key: 'pain_relief', labelKey: 'caseIntake.step5.medType.painRelief' },
                  { key: 'antibiotics', labelKey: 'caseIntake.step5.medType.antibiotics' },
                  { key: 'heart', labelKey: 'caseIntake.step5.medType.heart' },
                  { key: 'thyroid', labelKey: 'caseIntake.step5.medType.thyroid' },
                  { key: 'psychiatric', labelKey: 'caseIntake.step5.medType.psychiatric' }
                ].map(({ key, labelKey }) => (
                  <div key={key} className="flex items-center space-x-1 px-1.5 py-0.5">
                    <Checkbox
                      id={`medtype_${key}`}
                      checked={data.medication_types_selected?.includes(key) || false}
                      onCheckedChange={(checked) => {
                        const current = data.medication_types_selected || [];
                        if (checked) {
                          handleChange('medication_types_selected', [...current, key]);
                        } else {
                          handleChange('medication_types_selected', current.filter(t => t !== key));
                        }
                      }}
                      className="h-3.5 w-3.5"
                    />
                    <Label htmlFor={`medtype_${key}`} className="cursor-pointer font-normal text-xs">
                      {t(labelKey as any)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed medication list - Compact */}
            <div>
              <Label className="text-xs font-medium text-gray-600">
                {t('caseIntake.step5.detailedMedications')}
              </Label>
              <div className="mt-1.5 space-y-2">
                {(data.current_medications || []).map((med, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded border">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-medium text-xs text-gray-600">
                        {t('caseIntake.step5.medication')} {index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
                      <Input
                        value={med.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        placeholder={isZh ? '药名' : 'Name'}
                        className="h-7 text-xs"
                      />
                      <Input
                        value={med.dosage || ''}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        placeholder={isZh ? '剂量' : 'Dosage'}
                        className="h-7 text-xs"
                      />
                      <Input
                        value={med.frequency || ''}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        placeholder={isZh ? '频率' : 'Frequency'}
                        className="h-7 text-xs"
                      />
                      <Input
                        value={med.duration || ''}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        placeholder={isZh ? '时长' : 'Duration'}
                        className="h-7 text-xs"
                      />
                      <Input
                        value={med.purpose || ''}
                        onChange={(e) => updateMedication(index, 'purpose', e.target.value)}
                        placeholder={isZh ? '用途' : 'Purpose'}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMedication}
                  size="sm"
                  className="w-full h-7 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {t('caseIntake.step5.addMedication')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Allergies - Compact */}
      <div className="p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">
            {t('caseIntake.step5.allergyHistory')}
          </Label>
          <YesNoToggle
            name="allergies"
            value={data.has_allergies || false}
            onChange={(value) => {
              if (!value && data.has_allergies && data.allergies &&
                  ((data.allergies.drug_allergies && data.allergies.drug_allergies.length > 0) ||
                   (data.allergies.food_allergies && data.allergies.food_allergies.length > 0) ||
                   data.allergies.other_allergies)) {
                const confirmed = window.confirm(
                  isZh
                    ? '切换为"无过敏史"将清空所有已添加的过敏记录，确定吗？'
                    : 'Switching to "No allergies" will clear all allergy records. Are you sure?'
                );
                if (!confirmed) return;
              }
              const newData = {
                ...data,
                has_allergies: value,
                allergies: value ? data.allergies : undefined
              };
              onChange(newData);
            }}
            noLabelKey="caseIntake.step5.noAllergies"
            yesLabelKey="caseIntake.step5.hasAllergies"
          />
        </div>

        {data.has_allergies && (
          <div className="mt-3 space-y-3">
            {/* Drug & Food Allergies - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Drug Allergies */}
              <div className="p-2 bg-gray-50 rounded border">
                <h4 className="font-medium text-xs text-gray-700 mb-2">{t('caseIntake.step5.drugAllergies')}</h4>
                <div className="space-y-1.5">
                  {(data.allergies?.drug_allergies || []).map((allergy, index) => (
                    <div key={index} className="flex gap-1.5 items-center">
                      <Input
                        value={allergy.substance}
                        onChange={(e) => updateDrugAllergy(index, 'substance', e.target.value)}
                        placeholder={isZh ? '药物名' : 'Drug'}
                        className="h-7 text-xs flex-1"
                      />
                      <Input
                        value={allergy.reaction}
                        onChange={(e) => updateDrugAllergy(index, 'reaction', e.target.value)}
                        placeholder={isZh ? '反应' : 'Reaction'}
                        className="h-7 text-xs flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDrugAllergy(index)}
                        className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDrugAllergy}
                    size="sm"
                    className="w-full h-6 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {t('caseIntake.step5.addDrugAllergy')}
                  </Button>
                </div>
              </div>

              {/* Food Allergies */}
              <div className="p-2 bg-gray-50 rounded border">
                <h4 className="font-medium text-xs text-gray-700 mb-2">{t('caseIntake.step5.foodAllergies')}</h4>
                <div className="space-y-1.5">
                  {(data.allergies?.food_allergies || []).map((allergy, index) => (
                    <div key={index} className="flex gap-1.5 items-center">
                      <Input
                        value={allergy.substance}
                        onChange={(e) => updateFoodAllergy(index, 'substance', e.target.value)}
                        placeholder={isZh ? '食物名' : 'Food'}
                        className="h-7 text-xs flex-1"
                      />
                      <Input
                        value={allergy.reaction}
                        onChange={(e) => updateFoodAllergy(index, 'reaction', e.target.value)}
                        placeholder={isZh ? '反应' : 'Reaction'}
                        className="h-7 text-xs flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFoodAllergy(index)}
                        className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFoodAllergy}
                    size="sm"
                    className="w-full h-6 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {t('caseIntake.step5.addFoodAllergy')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Other Allergies */}
            <div>
              <Label htmlFor="other_allergies" className="text-xs font-medium text-gray-600">
                {t('caseIntake.step5.otherAllergies')}
              </Label>
              <Textarea
                id="other_allergies"
                value={data.allergies?.other_allergies || ''}
                onChange={(e) => handleChange('allergies', {
                  ...data.allergies,
                  other_allergies: e.target.value
                })}
                placeholder={t('caseIntake.step4.pleaseSpecify') as any}
                rows={2}
                className="mt-1 resize-none text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Step5;

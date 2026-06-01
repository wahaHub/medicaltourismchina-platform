import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Step2Data, OnsetTimeCategory, DiagnosisStage, MainCategory } from '@/types/caseIntake';

interface Step2Props {
  data: Partial<Step2Data>;
  onChange: (data: Partial<Step2Data>) => void;
  onError: (error: string) => void;
  missingFields?: string[];
}

export function Step2({ data, onChange, onError, missingFields = [] }: Step2Props) {
  const { t, currentLanguage } = useLanguage();
  const isZh = String(currentLanguage) === 'zh';

  const handleChange = (field: keyof Step2Data, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
    onError(''); // Clear errors when user makes changes
  };

  // Two-level location selection
  const [selectedRegion, setSelectedRegion] = React.useState<string>('');

  // Define location hierarchy with i18n keys
  const locationHierarchy = {
    head: {
      labelKey: 'caseIntake.region.head',
      sublocs: [
        { key: 'head', labelKey: 'caseIntake.location.head' },
        { key: 'face', labelKey: 'caseIntake.location.face' }
      ]
    },
    neck: {
      labelKey: 'caseIntake.region.neck',
      sublocs: [
        { key: 'neck_throat', labelKey: 'caseIntake.location.neckThroat' }
      ]
    },
    chest: {
      labelKey: 'caseIntake.region.chest',
      sublocs: [
        { key: 'chest_center', labelKey: 'caseIntake.location.chestCenter' },
        { key: 'chest_left', labelKey: 'caseIntake.location.chestLeft' },
        { key: 'chest_right', labelKey: 'caseIntake.location.chestRight' }
      ]
    },
    abdomen: {
      labelKey: 'caseIntake.region.abdomen',
      sublocs: [
        { key: 'upper_abdomen', labelKey: 'caseIntake.location.upperAbdomen' },
        { key: 'right_upper_abdomen', labelKey: 'caseIntake.location.rightUpperAbdomen' },
        { key: 'periumbilical', labelKey: 'caseIntake.location.periumbilical' },
        { key: 'right_lower_abdomen', labelKey: 'caseIntake.location.rightLowerAbdomen' },
        { key: 'left_lower_abdomen', labelKey: 'caseIntake.location.leftLowerAbdomen' },
        { key: 'whole_abdomen', labelKey: 'caseIntake.location.wholeAbdomen' }
      ]
    },
    back_waist: {
      labelKey: 'caseIntake.region.backWaist',
      sublocs: [
        { key: 'waist', labelKey: 'caseIntake.location.waist' },
        { key: 'back', labelKey: 'caseIntake.location.back' }
      ]
    },
    joints_limbs: {
      labelKey: 'caseIntake.region.jointsLimbs',
      sublocs: [
        { key: 'shoulder', labelKey: 'caseIntake.location.shoulder' },
        { key: 'elbow', labelKey: 'caseIntake.location.elbow' },
        { key: 'wrist_hand', labelKey: 'caseIntake.location.wristHand' },
        { key: 'hip', labelKey: 'caseIntake.location.hip' },
        { key: 'knee', labelKey: 'caseIntake.location.knee' },
        { key: 'ankle_foot', labelKey: 'caseIntake.location.ankleFoot' }
      ]
    },
    other: {
      labelKey: 'caseIntake.region.other',
      sublocs: [
        { key: 'genitourinary', labelKey: 'caseIntake.location.genitourinary' },
        { key: 'dizziness', labelKey: 'caseIntake.location.dizziness' },
        { key: 'other', labelKey: 'caseIntake.location.other' }
      ]
    }
  };

  // Auto-select region if location is already set
  React.useEffect(() => {
    if (data.primary_location && !selectedRegion) {
      for (const [region, config] of Object.entries(locationHierarchy)) {
        if (config.sublocs.some(sub => sub.key === data.primary_location)) {
          setSelectedRegion(region);
          break;
        }
      }
    }
  }, [data.primary_location]);

  return (
    <div className="space-y-4">
      {/* Q1: Primary Location - Compact Two Level Selection */}
      <div className={`p-3 rounded-lg border ${missingFields.includes('primary_location') ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200'}`}>
        <Label className={`text-sm font-semibold ${missingFields.includes('primary_location') ? 'text-red-700' : ''}`}>
          {t('caseIntake.q1.title')} *
        </Label>
        <div className="mt-2 grid grid-cols-4 md:grid-cols-7 gap-1.5">
          {Object.entries(locationHierarchy).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelectedRegion(key);
                handleChange('primary_location', '');
              }}
              className={`px-2 py-1.5 text-xs border rounded text-center transition-all ${
                selectedRegion === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              {t(config.labelKey as any)}
            </button>
          ))}
        </div>
        {selectedRegion && locationHierarchy[selectedRegion as keyof typeof locationHierarchy] && (
          <div className="mt-2 pt-2 border-t">
            <RadioGroup
              value={data.primary_location || ''}
              onValueChange={(value) => handleChange('primary_location', value)}
              className="grid grid-cols-2 md:grid-cols-3 gap-1.5"
            >
              {locationHierarchy[selectedRegion as keyof typeof locationHierarchy].sublocs.map(({ key, labelKey }) => (
                <div key={key} className="flex items-center space-x-1.5 px-2 py-1.5 border rounded hover:bg-blue-50 hover:border-blue-300">
                  <RadioGroupItem value={key} id={`subloc_${key}`} className="h-3.5 w-3.5" />
                  <Label htmlFor={`subloc_${key}`} className="cursor-pointer font-normal text-xs flex-1">
                    {t(labelKey as any)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {data.primary_location === 'other' && (
              <Input
                placeholder={t('caseIntake.q1.otherLocation')}
                value={data.primary_location_other || ''}
                onChange={(e) => handleChange('primary_location_other', e.target.value)}
                className="mt-2 h-8 text-sm"
              />
            )}
          </div>
        )}
      </div>

      {/* Q2: Symptom Nature - Compact */}
      <div className={`p-3 rounded-lg border ${missingFields.includes('symptom_nature') ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200'}`}>
        <Label className={`text-sm font-semibold ${missingFields.includes('symptom_nature') ? 'text-red-700' : ''}`}>
          {t('caseIntake.q2.title')} *
        </Label>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-1.5">
          {[
            { key: 'dull_pain', labelKey: 'caseIntake.symptom.dullPain' },
            { key: 'severe_pain', labelKey: 'caseIntake.symptom.severePain' },
            { key: 'stabbing_pain', labelKey: 'caseIntake.symptom.stabbingPain' },
            { key: 'distending_pain', labelKey: 'caseIntake.symptom.distendingPain' },
            { key: 'numbness', labelKey: 'caseIntake.symptom.numbness' },
            { key: 'weakness', labelKey: 'caseIntake.symptom.weakness' },
            { key: 'tightness', labelKey: 'caseIntake.symptom.tightness' },
            { key: 'breathing_difficulty', labelKey: 'caseIntake.symptom.breathingDifficulty' },
            { key: 'nausea', labelKey: 'caseIntake.symptom.nausea' },
            { key: 'dizziness', labelKey: 'caseIntake.symptom.dizziness' },
            { key: 'unclear', labelKey: 'caseIntake.symptom.unclear' }
          ].map(({ key, labelKey }) => (
            <div key={key} className="flex items-center space-x-1.5 px-2 py-1 border rounded hover:bg-gray-50">
              <Checkbox
                id={`nature_${key}`}
                checked={data.symptom_nature?.includes(key) || false}
                onCheckedChange={(checked) => {
                  const current = data.symptom_nature || [];
                  if (checked) {
                    handleChange('symptom_nature', [...current, key]);
                  } else {
                    handleChange('symptom_nature', current.filter(n => n !== key));
                  }
                }}
                className="h-3.5 w-3.5"
              />
              <Label htmlFor={`nature_${key}`} className="cursor-pointer font-normal text-xs flex-1">
                {t(labelKey as any)}
              </Label>
            </div>
          ))}
        </div>
        <Textarea
          placeholder={t('caseIntake.q2.otherNotes')}
          value={data.symptom_nature_other || ''}
          onChange={(e) => handleChange('symptom_nature_other', e.target.value)}
          rows={1}
          className="mt-2 resize-none text-sm"
        />
      </div>

      {/* Onset, Diagnosis & Category - Combined Compact Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Onset Duration */}
        <div className="p-3 rounded-lg border border-gray-200">
          <Label className="text-sm font-semibold">{t('caseIntake.onsetCourse.duration')}</Label>
          <Select
            value={data.onset_and_course?.category || ''}
            onValueChange={(value) => handleChange('onset_and_course', {
              ...data.onset_and_course,
              category: value as OnsetTimeCategory
            })}
          >
            <SelectTrigger className="mt-1.5 h-8 text-sm">
              <SelectValue placeholder={t('caseIntake.onsetCourse.pleaseSelect')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="<1month">{t('caseIntake.onsetCourse.lessThan1Month')}</SelectItem>
              <SelectItem value="1-6months">{t('caseIntake.onsetCourse.1to6Months')}</SelectItem>
              <SelectItem value="6-12months">{t('caseIntake.onsetCourse.6to12Months')}</SelectItem>
              <SelectItem value=">1year">{t('caseIntake.onsetCourse.moreThan1Year')}</SelectItem>
            </SelectContent>
          </Select>
          <div className="mt-2 grid grid-cols-2 gap-1">
            {[
              { key: 'worsening', labelKey: 'caseIntake.onsetCourse.worsening' },
              { key: 'fluctuating', labelKey: 'caseIntake.onsetCourse.fluctuating' },
              { key: 'stable', labelKey: 'caseIntake.onsetCourse.stable' },
              { key: 'improving', labelKey: 'caseIntake.onsetCourse.improving' }
            ].map(({ key, labelKey }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleChange('onset_and_course', {
                  ...data.onset_and_course,
                  progression_trend: key
                })}
                className={`px-1.5 py-1 text-[10px] border rounded text-center transition-all ${
                  data.onset_and_course?.progression_trend === key
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                {t(labelKey as any)}
              </button>
            ))}
          </div>
        </div>

        {/* Current Diagnosis Stage */}
        <div className={`p-3 rounded-lg border ${missingFields.includes('current_diagnosis_stage') ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <Label className={`text-sm font-semibold ${missingFields.includes('current_diagnosis_stage') ? 'text-red-700' : ''}`}>
            {t('caseIntake.diagnosisStage.title')} *
          </Label>
          <RadioGroup
            value={data.current_diagnosis_stage || ''}
            onValueChange={(value) => handleChange('current_diagnosis_stage', value as DiagnosisStage)}
            className="mt-1.5 space-y-1"
          >
            {[
              { value: 'undiagnosed', labelKey: 'caseIntake.diagnosisStage.undiagnosed' },
              { value: 'preliminary', labelKey: 'caseIntake.diagnosisStage.preliminary' },
              { value: 'confirmed', labelKey: 'caseIntake.diagnosisStage.confirmed' },
              { value: 'post_treatment', labelKey: 'caseIntake.diagnosisStage.postTreatment' }
            ].map(({ value, labelKey }) => (
              <div key={value} className="flex items-center space-x-1.5 px-2 py-1 border rounded hover:bg-gray-50">
                <RadioGroupItem value={value} id={value} className="h-3.5 w-3.5" />
                <Label htmlFor={value} className="flex-1 cursor-pointer font-normal text-xs">
                  {t(labelKey as any)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Main Category */}
        <div className={`p-3 rounded-lg border ${missingFields.includes('main_category') ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <Label className={`text-sm font-semibold ${missingFields.includes('main_category') ? 'text-red-700' : ''}`}>
            {t('caseIntake.mainCategory.title')} *
          </Label>
          <Select
            value={data.main_category || ''}
            onValueChange={(value) => handleChange('main_category', value as MainCategory)}
          >
            <SelectTrigger className="mt-1.5 h-8 text-sm">
              <SelectValue placeholder={t('caseIntake.mainCategory.pleaseSelect')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="surgery">{t('caseIntake.mainCategory.surgery')}</SelectItem>
              <SelectItem value="tumor">{t('caseIntake.mainCategory.tumor')}</SelectItem>
              <SelectItem value="cardiovascular">{t('caseIntake.mainCategory.cardiovascular')}</SelectItem>
              <SelectItem value="fertility">{t('caseIntake.mainCategory.fertility')}</SelectItem>
              <SelectItem value="cosmetic">{t('caseIntake.mainCategory.cosmetic')}</SelectItem>
              <SelectItem value="general">{t('caseIntake.mainCategory.general')}</SelectItem>
              <SelectItem value="other">{t('caseIntake.mainCategory.other')}</SelectItem>
            </SelectContent>
          </Select>
          {(data.main_category === 'surgery' || data.main_category === 'tumor') && (
            <div className="mt-2 text-xs">
              <Label className="text-blue-800 text-xs">
                {data.main_category === 'surgery'
                  ? (isZh ? '已建议手术？' : 'Surgery recommended?')
                  : (isZh ? '有病理诊断？' : 'Pathology diagnosis?')}
              </Label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleChange(data.main_category === 'surgery' ? 'is_surgery_related' : 'is_tumor_related', true)}
                  className={`px-2 py-0.5 text-xs rounded ${(data.main_category === 'surgery' ? data.is_surgery_related : data.is_tumor_related) ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
                >
                  {isZh ? '是' : 'Yes'}
                </button>
                <button
                  type="button"
                  onClick={() => handleChange(data.main_category === 'surgery' ? 'is_surgery_related' : 'is_tumor_related', false)}
                  className={`px-2 py-0.5 text-xs rounded ${(data.main_category === 'surgery' ? !data.is_surgery_related : !data.is_tumor_related) ? 'bg-gray-500 text-white' : 'border border-gray-300'}`}
                >
                  {isZh ? '否' : 'No'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Step2;


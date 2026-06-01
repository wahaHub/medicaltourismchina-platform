import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  FileText,
  Stethoscope,
  ClipboardList,
  Pill,
  FlaskConical,
  Calendar
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { CaseIntakeFormData, CaseIntake } from '@/types/caseIntake';
import {
  createCaseIntake,
  updateCaseIntake,
} from '@/services/api/caseIntakes';

// Import step components (we'll create these next)
import Step2Component from './steps/Step2';
import Step3Component from './steps/Step3';
import Step4Component from './steps/Step4';
import Step5Component from './steps/Step5';
import Step6Component from './steps/Step6';
import Step7Component from './steps/Step7';

interface CaseIntakeWizardProps {
  existingCaseIntake?: CaseIntake;
  onComplete?: () => void;
}

const TOTAL_STEPS = 6; // Steps 2-7
const STEP_CONFIG = [
  { 
    step: 2, 
    titleKey: 'caseIntake.step2.title',
    descriptionKey: 'caseIntake.step2.description',
    icon: FileText
  },
  { 
    step: 3, 
    titleKey: 'caseIntake.step3.title',
    descriptionKey: 'caseIntake.step3.description',
    icon: Stethoscope
  },
  { 
    step: 4, 
    titleKey: 'caseIntake.step4.title',
    descriptionKey: 'caseIntake.step4.description',
    icon: ClipboardList
  },
  { 
    step: 5, 
    titleKey: 'caseIntake.step5.title',
    descriptionKey: 'caseIntake.step5.description',
    icon: Pill
  },
  { 
    step: 6, 
    titleKey: 'caseIntake.step6.title',
    descriptionKey: 'caseIntake.step6.description',
    icon: FlaskConical
  },
  { 
    step: 7, 
    titleKey: 'caseIntake.step7.title',
    descriptionKey: 'caseIntake.step7.description',
    icon: Calendar
  }
];

export function CaseIntakeWizard({ existingCaseIntake, onComplete }: CaseIntakeWizardProps) {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State management
  const [currentStep, setCurrentStep] = useState(existingCaseIntake?.current_step || 2);
  const [formData, setFormData] = useState<Partial<CaseIntakeFormData>>(
    existingCaseIntake?.form_data || {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [caseIntakeId, setCaseIntakeId] = useState<string | null>(existingCaseIntake?.id || null);

  // Track if form data has changed since last save
  const lastSavedFormData = useRef<string>(JSON.stringify(existingCaseIntake?.form_data || {}));

  // Calculate progress based on completed steps (not current step)
  // Progress = (number of completed steps) / total steps * 100
  const completedSteps = currentStep - 2; // If on step 2, 0 steps completed; if on step 3, 1 completed, etc.
  const progress = (completedSteps / TOTAL_STEPS) * 100;

  // Auto-save draft every 30 seconds (optional, can be enabled later)
  useEffect(() => {
    // Placeholder for auto-save logic
    // const interval = setInterval(() => {
    //   if (formData && Object.keys(formData).length > 0) {
    //     handleSaveDraft();
    //   }
    // }, 30000);
    // return () => clearInterval(interval);
  }, [formData]);

  // Update form data for current step
  const updateStepData = (stepKey: keyof CaseIntakeFormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [stepKey]: data
    }));
    setSaveSuccess(false);
  };

  // Get missing required fields for current step
  const getMissingFields = (): string[] => {
    const stepKey = `step${currentStep}` as keyof CaseIntakeFormData;
    const stepData = formData[stepKey] as any;
    const missing: string[] = [];

    switch (currentStep) {
      case 2:
        if (!stepData?.primary_location) missing.push('primary_location');
        if (!stepData?.symptom_nature || stepData.symptom_nature.length === 0) missing.push('symptom_nature');
        if (!stepData?.current_diagnosis_stage) missing.push('current_diagnosis_stage');
        if (!stepData?.main_category) missing.push('main_category');
        break;
      case 3:
        if (!stepData?.detailed_symptoms) missing.push('detailed_symptoms');
        break;
      case 7:
        if (!stepData?.treatment_expectations || stepData.treatment_expectations.length === 0) missing.push('treatment_expectations');
        if (!stepData?.budget_range) missing.push('budget_range');
        if (!stepData?.preferred_timing) missing.push('preferred_timing');
        break;
    }
    return missing;
  };

  // Validate current step (basic validation)
  const validateCurrentStep = (): boolean => {
    const missing = getMissingFields();
    setMissingFields(missing);
    return missing.length === 0;
  };

  // Save draft
  const handleSaveDraft = async () => {
    // Check if there are any changes to save
    const currentFormDataStr = JSON.stringify(formData);
    if (currentFormDataStr === lastSavedFormData.current && caseIntakeId) {
      // No changes, skip save
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      let response;

      if (caseIntakeId) {
        // Update existing case intake
        response = await updateCaseIntake(caseIntakeId, {
          form_data: formData as CaseIntakeFormData,
          current_step: currentStep,
          status: 'draft',
        });
      } else {
        // Create new case intake
        response = await createCaseIntake({
          form_data: formData as CaseIntakeFormData,
          current_step: currentStep,
          status: 'draft',
        });
        // Store the new ID for future updates
        if (response.ok && response.data.id) {
          setCaseIntakeId(response.data.id);
        }
      }

      if (response.ok) {
        lastSavedFormData.current = currentFormDataStr;
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Save draft error:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit final form
  const handleSubmit = async () => {
    console.log('[CaseIntake] handleSubmit called');
    console.log('[CaseIntake] currentStep:', currentStep);
    console.log('[CaseIntake] formData:', JSON.stringify(formData, null, 2));
    console.log('[CaseIntake] caseIntakeId:', caseIntakeId);

    if (!validateCurrentStep()) {
      console.log('[CaseIntake] Validation failed, missingFields:', missingFields);
      setSaveError('Please complete all required fields before submitting.');
      return;
    }

    console.log('[CaseIntake] Validation passed, starting submit...');
    setIsSubmitting(true);
    setSaveError(null);

    try {
      let response;

      if (caseIntakeId) {
        console.log('[CaseIntake] Updating existing case intake:', caseIntakeId);
        // Update existing case intake with submitted status
        response = await updateCaseIntake(caseIntakeId, {
          form_data: formData as CaseIntakeFormData,
          current_step: 7,
          status: 'submitted',
        });
      } else {
        console.log('[CaseIntake] Creating new case intake');
        // Create new case intake with submitted status
        response = await createCaseIntake({
          form_data: formData as CaseIntakeFormData,
          current_step: 7,
          status: 'submitted',
        });
      }

      console.log('[CaseIntake] API response:', response);

      if (response.ok) {
        console.log('[CaseIntake] Submit successful');

        // 检查用户是否是无密码用户（通过 booking request 自动创建的）
        // 如果没有密码，提交成功后登出用户
        if (user && !user.hasPassword) {
          console.log('[CaseIntake] User has no password, logging out after submission');
          await logout();
          // 导航到首页并显示成功消息
          navigate('/?caseIntakeSubmitted=true');
        } else {
          // 有密码的用户保持登录状态，导航到 dashboard
          console.log('[CaseIntake] User has password, keeping session, redirecting to dashboard...');
          if (onComplete) {
            onComplete();
          } else {
            navigate('/dashboard?tab=case-intakes&success=true');
          }
        }
      } else {
        console.error('[CaseIntake] Response not ok:', response);
        setSaveError('Submit failed. Please try again.');
      }
    } catch (error) {
      console.error('[CaseIntake] Submit error:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation handlers
  const handleNext = async () => {
    if (!validateCurrentStep()) {
      setSaveError('Please complete all required fields before proceeding.');
      return;
    }

    setSaveError(null);
    
    // Auto-save before moving to next step
    await handleSaveDraft();
    
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
      setSaveError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Your progress will be saved as a draft.')) {
      handleSaveDraft();
      navigate('/dashboard');
    }
  };

  // Render current step component
  const renderStepContent = () => {
    const stepKey = `step${currentStep}` as keyof CaseIntakeFormData;
    const stepData = formData[stepKey] || {};

    const commonProps = {
      data: stepData,
      onChange: (data: any) => updateStepData(stepKey, data),
      onError: (error: string) => setSaveError(error),
      missingFields: missingFields
    };

    switch (currentStep) {
      case 2:
        return <Step2Component {...commonProps} />;
      case 3:
        return <Step3Component {...commonProps} />;
      case 4:
        return <Step4Component {...commonProps} />;
      case 5:
        return <Step5Component {...commonProps} />;
      case 6:
        return <Step6Component {...commonProps} userId={user?.id} caseIntakeId={caseIntakeId || undefined} />;
      case 7:
        return <Step7Component {...commonProps} />;
      default:
        return null;
    }
  };

  const currentStepConfig = STEP_CONFIG[currentStep - 2];
  const StepIcon = currentStepConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('caseIntake.title')}
          </h1>
          <p className="text-gray-600">
            {t('caseIntake.subtitle')}
          </p>
        </div>

        {/* Top Banner - Medical Specialist Contact Notice */}
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 shadow-sm">
          <p className="text-amber-900 font-medium">
            {t('caseIntake.topBanner')}
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {t('caseIntake.progress', { current: currentStep - 1, total: TOTAL_STEPS })}
                </span>
                <span className="text-sm text-gray-500">
                  {t('caseIntake.percentComplete', { percent: Math.round(progress) })}
                  {completedSteps === 0 && (
                    <span className="ml-2 text-xs text-gray-400">
                      ({t('caseIntake.noStepsCompleted')})
                    </span>
                  )}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              
              {/* Step indicators */}
              <div className="flex justify-between">
                {STEP_CONFIG.map((config, index) => {
                  const isActive = config.step === currentStep;
                  const isCompleted = config.step < currentStep;
                  const Icon = config.icon;
                  
                  return (
                    <div 
                      key={config.step} 
                      className={`flex flex-col items-center ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center mb-2
                        ${isActive ? 'bg-blue-100 border-2 border-blue-600' : ''}
                        ${isCompleted ? 'bg-green-100' : ''}
                        ${!isActive && !isCompleted ? 'bg-gray-100' : ''}
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-xs text-center hidden md:block">
                        {t(config.titleKey)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Step Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <StepIcon className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-xl">
                  {t(currentStepConfig.titleKey)}
                </div>
                <div className="text-sm font-normal text-gray-500 mt-1">
                  {t(currentStepConfig.descriptionKey)}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Privacy Notice */}
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                {t('caseIntake.privacyNotice')}
              </AlertDescription>
            </Alert>

            {/* Step Content */}
            {renderStepContent()}

            {/* Error/Success Messages */}
            {saveError && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}

            {saveSuccess && (
              <Alert className="mt-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {t('caseIntake.draftSaved')}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving || isSubmitting}
                >
                  {t('caseIntake.cancel')}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSaving || isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? t('caseIntake.saving') : t('caseIntake.saveDraft')}
                </Button>
              </div>

              <div className="flex gap-3">
                {currentStep > 2 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isSaving || isSubmitting}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    {t('caseIntake.previous')}
                  </Button>
                )}

                {currentStep < 7 ? (
                  <Button
                    onClick={handleNext}
                    disabled={isSaving || isSubmitting}
                  >
                    {t('caseIntake.next')}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSaving || isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? t('caseIntake.submitting') : t('caseIntake.submit')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CaseIntakeWizard;


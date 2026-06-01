import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  FileText,
  Stethoscope,
  ClipboardList,
  Pill,
  FlaskConical,
  Calendar,
  ChevronUp,
  User
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { CaseIntakeFormData, CaseIntake } from '@/types/caseIntake';
import {
  createCaseIntake,
  updateCaseIntake,
  createCaseIntakeWithToken,
} from '@/services/api/caseIntakes';
import { ValidateTokenResponse } from '@/services/api/salesTokens';
import { supabase, isSupabaseConfigured } from '@/config/supabaseClient';

// Import step components
import Step2Component from './steps/Step2';
import Step3Component from './steps/Step3';
import Step4Component from './steps/Step4';
import Step5Component from './steps/Step5';
import Step6Component from './steps/Step6';
import Step7Component from './steps/Step7';

interface CaseIntakeSinglePageProps {
  existingCaseIntake?: CaseIntake;
  onComplete?: () => void;
  // Token mode props (Flow B)
  isTokenMode?: boolean;
  salesToken?: string | null;
  tokenValidation?: ValidateTokenResponse | null;
}

// Basic info for token mode (Flow B)
interface BasicInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  whatsapp: string;
}

const STEP_CONFIG = [
  {
    step: 2,
    titleKey: 'caseIntake.step2.title',
    descriptionKey: 'caseIntake.step2.description',
    icon: FileText,
    id: 'step2'
  },
  {
    step: 3,
    titleKey: 'caseIntake.step3.title',
    descriptionKey: 'caseIntake.step3.description',
    icon: Stethoscope,
    id: 'step3'
  },
  {
    step: 4,
    titleKey: 'caseIntake.step4.title',
    descriptionKey: 'caseIntake.step4.description',
    icon: ClipboardList,
    id: 'step4'
  },
  {
    step: 5,
    titleKey: 'caseIntake.step5.title',
    descriptionKey: 'caseIntake.step5.description',
    icon: Pill,
    id: 'step5'
  },
  {
    step: 6,
    titleKey: 'caseIntake.step6.title',
    descriptionKey: 'caseIntake.step6.description',
    icon: FlaskConical,
    id: 'step6'
  },
  {
    step: 7,
    titleKey: 'caseIntake.step7.title',
    descriptionKey: 'caseIntake.step7.description',
    icon: Calendar,
    id: 'step7'
  }
];

export function CaseIntakeSinglePage({
  existingCaseIntake,
  onComplete,
  isTokenMode = false,
  salesToken = null,
  tokenValidation = null,
}: CaseIntakeSinglePageProps) {
  const { t, currentLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isZh = String(currentLanguage) === 'zh';

  // State management
  const [formData, setFormData] = useState<Partial<CaseIntakeFormData>>(
    existingCaseIntake?.form_data || {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [caseIntakeId, setCaseIntakeId] = useState<string | null>(existingCaseIntake?.id || null);
  const [activeSection, setActiveSection] = useState('step2');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Basic info state for token mode (Flow B)
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    first_name: tokenValidation?.patient_name?.split(' ')[0] || '',
    last_name: tokenValidation?.patient_name?.split(' ').slice(1).join(' ') || '',
    email: tokenValidation?.patient_email || '',
    phone: tokenValidation?.patient_phone || '',
    whatsapp: '',
  });

  // Track if form data has changed since last save
  const lastSavedFormData = useRef<string>(JSON.stringify(existingCaseIntake?.form_data || {}));

  // Section refs for scrolling
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Handle scroll to detect active section and show/hide scroll-to-top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      // Find which section is currently in view
      const sections = STEP_CONFIG.map(config => ({
        id: config.id,
        top: sectionRefs.current[config.id]?.getBoundingClientRect().top || 0
      }));

      const currentSection = sections.find(section => section.top > -100 && section.top < 300);
      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update form data for a step
  const updateStepData = (stepKey: keyof CaseIntakeFormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [stepKey]: data
    }));
    setSaveSuccess(false);
  };

  // Get missing required fields
  const getMissingFields = (): string[] => {
    const missing: string[] = [];

    // Token mode (Flow B): Require basic info
    if (isTokenMode) {
      if (!basicInfo.first_name.trim()) missing.push('first_name');
      if (!basicInfo.last_name.trim()) missing.push('last_name');
      if (!basicInfo.email.trim()) missing.push('email');
      if (!basicInfo.phone.trim()) missing.push('phone');
    }

    // Step 2 required fields
    const step2Data = formData.step2 as any;
    if (!step2Data?.primary_location) missing.push('primary_location');
    if (!step2Data?.symptom_nature || step2Data.symptom_nature.length === 0) missing.push('symptom_nature');
    if (!step2Data?.current_diagnosis_stage) missing.push('current_diagnosis_stage');
    if (!step2Data?.main_category) missing.push('main_category');

    // Step 3 required fields
    const step3Data = formData.step3 as any;
    if (!step3Data?.detailed_symptoms) missing.push('detailed_symptoms');

    // Step 7 required fields
    const step7Data = formData.step7 as any;
    if (!step7Data?.treatment_expectations || step7Data.treatment_expectations.length === 0) missing.push('treatment_expectations');
    if (!step7Data?.budget_range) missing.push('budget_range');
    if (!step7Data?.preferred_timing) missing.push('preferred_timing');

    return missing;
  };

  // Validate all steps
  const validateAllSteps = (): boolean => {
    const missing = getMissingFields();
    setMissingFields(missing);
    return missing.length === 0;
  };

  // Save draft
  const handleSaveDraft = async () => {
    const currentFormDataStr = JSON.stringify(formData);
    if (currentFormDataStr === lastSavedFormData.current && caseIntakeId) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      let response;

      if (caseIntakeId) {
        response = await updateCaseIntake(caseIntakeId, {
          form_data: formData as CaseIntakeFormData,
          current_step: 7,
          status: 'draft',
        });
      } else {
        response = await createCaseIntake({
          form_data: formData as CaseIntakeFormData,
          current_step: 7,
          status: 'draft',
        });
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
    if (!validateAllSteps()) {
      setSaveError(isZh
        ? '请填写所有必填项后再提交。'
        : 'Please complete all required fields before submitting.'
      );
      // Scroll to first missing field section
      const firstMissing = missingFields[0];
      if (['first_name', 'last_name', 'email', 'phone'].includes(firstMissing)) {
        scrollToSection('basic-info');
      } else if (firstMissing === 'primary_location' || firstMissing === 'symptom_nature' || firstMissing === 'current_diagnosis_stage' || firstMissing === 'main_category') {
        scrollToSection('step2');
      } else if (firstMissing === 'detailed_symptoms') {
        scrollToSection('step3');
      } else if (firstMissing === 'treatment_expectations' || firstMissing === 'budget_range' || firstMissing === 'preferred_timing') {
        scrollToSection('step7');
      }
      return;
    }

    setIsSubmitting(true);
    setSaveError(null);

    try {
      let userId = user?.id;
      let authUserId: string | null = null;

      // Token mode (Flow B): Create user first
      if (isTokenMode && !user) {
        if (!isSupabaseConfigured) {
          setSaveError(
            isZh
              ? '当前环境未启用 Supabase，无法通过销售链接自动注册。请使用已登录账号或联系顾问。'
              : 'Supabase is disabled in this build; sales-token signup is unavailable. Sign in or contact your consultant.',
          );
          setIsSubmitting(false);
          return;
        }
        // Sign up the user with a random password (they can reset later)
        const tempPassword = crypto.randomUUID();
        const fullName = `${basicInfo.first_name} ${basicInfo.last_name}`.trim();
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: basicInfo.email,
          password: tempPassword,
          options: {
            data: {
              first_name: basicInfo.first_name,
              last_name: basicInfo.last_name,
              name: fullName,
              full_name: fullName,
              phone: basicInfo.phone,
            }
          }
        });

        if (authError) {
          // If user exists, try to get their ID
          if (authError.message.includes('already registered')) {
            setSaveError(isZh
              ? '该邮箱已注册。请登录后提交，或使用其他邮箱。'
              : 'This email is already registered. Please log in to submit, or use a different email.'
            );
            setIsSubmitting(false);
            return;
          }
          throw authError;
        }

        authUserId = authData.user?.id || null;

        // Create user record in users table
        if (authUserId) {
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              auth_user_id: authUserId,
              email: basicInfo.email,
              first_name: basicInfo.first_name,
              last_name: basicInfo.last_name,
              phone: basicInfo.phone,
              role_code: 'user',
            })
            .select('id')
            .single();

          if (userError) {
            console.error('Error creating user:', userError);
            throw userError;
          }

          userId = newUser.id;
        }
      }

      let response;

      if (caseIntakeId) {
        response = await updateCaseIntake(caseIntakeId, {
          form_data: formData as CaseIntakeFormData,
          current_step: 7,
          status: 'submitted',
        });
      } else {
        // For token mode, use the dedicated API endpoint that handles email notifications
        if (isTokenMode && userId) {
          const fullName = `${basicInfo.first_name} ${basicInfo.last_name}`.trim();
          response = await createCaseIntakeWithToken({
            user_id: userId,
            form_data: formData as CaseIntakeFormData,
            sales_token: salesToken || undefined,
            user_info: {
              first_name: basicInfo.first_name,
              last_name: basicInfo.last_name,
              name: fullName,
              email: basicInfo.email,
              phone: basicInfo.phone,
              whatsapp: basicInfo.whatsapp || undefined,
            },
          });
        } else {
          response = await createCaseIntake({
            form_data: formData as CaseIntakeFormData,
            current_step: 7,
            status: 'submitted',
          });
        }
      }

      if (response.ok) {
        if (isTokenMode) {
          // Token mode: Sign out and redirect
          if (isSupabaseConfigured) {
            await supabase.auth.signOut();
          }
          if (onComplete) {
            onComplete();
          } else {
            navigate('/?caseIntakeSubmitted=true');
          }
        } else if (user && !user.hasPassword) {
          await logout();
          navigate('/?caseIntakeSubmitted=true');
        } else {
          if (onComplete) {
            onComplete();
          } else {
            navigate('/dashboard?tab=case-intakes&success=true');
          }
        }
      } else {
        setSaveError(isZh ? '提交失败，请重试。' : 'Submit failed. Please try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSaveError(error instanceof Error ? error.message : (isZh ? '提交失败，请重试。' : 'Failed to submit. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Your progress will be saved as a draft.')) {
      handleSaveDraft();
      navigate('/dashboard');
    }
  };

  // Render step content
  const renderStepContent = (stepNumber: number) => {
    const stepKey = `step${stepNumber}` as keyof CaseIntakeFormData;
    const stepData = formData[stepKey] || {};

    const commonProps = {
      data: stepData,
      onChange: (data: any) => updateStepData(stepKey, data),
      onError: (error: string) => setSaveError(error),
      missingFields: missingFields
    };

    switch (stepNumber) {
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

        {/* Top Banner */}
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 shadow-sm">
          <p className="text-amber-900 font-medium">
            {t('caseIntake.topBanner')}
          </p>
        </div>

        {/* Privacy Notice */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800">
            {t('caseIntake.privacyNotice')}
          </AlertDescription>
        </Alert>

        {/* Basic Info Section - Only for Token Mode (Flow B) */}
        {isTokenMode && (
          <div
            ref={(el) => (sectionRefs.current['basic-info'] = el)}
            id="basic-info"
            className="mb-4"
          >
            <Card className="shadow-md border-2 border-teal-200">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-white border-b py-3">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="font-bold text-base text-gray-900">
                    {isZh ? '基本信息' : 'Basic Information'}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`space-y-1.5 ${missingFields.includes('first_name') ? 'text-red-600' : ''}`}>
                    <Label htmlFor="first_name" className={missingFields.includes('first_name') ? 'text-red-600' : ''}>
                      {isZh ? '名' : 'First Name'} *
                    </Label>
                    <Input
                      id="first_name"
                      value={basicInfo.first_name}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder={isZh ? '请输入您的名' : 'Enter your first name'}
                      className={missingFields.includes('first_name') ? 'border-red-500' : ''}
                    />
                  </div>
                  <div className={`space-y-1.5 ${missingFields.includes('last_name') ? 'text-red-600' : ''}`}>
                    <Label htmlFor="last_name" className={missingFields.includes('last_name') ? 'text-red-600' : ''}>
                      {isZh ? '姓' : 'Last Name'} *
                    </Label>
                    <Input
                      id="last_name"
                      value={basicInfo.last_name}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder={isZh ? '请输入您的姓' : 'Enter your last name'}
                      className={missingFields.includes('last_name') ? 'border-red-500' : ''}
                    />
                  </div>
                  <div className={`space-y-1.5 ${missingFields.includes('email') ? 'text-red-600' : ''}`}>
                    <Label htmlFor="email" className={missingFields.includes('email') ? 'text-red-600' : ''}>
                      {isZh ? '邮箱' : 'Email'} *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={basicInfo.email}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder={isZh ? '请输入您的邮箱' : 'Enter your email'}
                      className={missingFields.includes('email') ? 'border-red-500' : ''}
                    />
                  </div>
                  <div className={`space-y-1.5 ${missingFields.includes('phone') ? 'text-red-600' : ''}`}>
                    <Label htmlFor="phone" className={missingFields.includes('phone') ? 'text-red-600' : ''}>
                      {isZh ? '电话' : 'Phone'} *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={basicInfo.phone}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder={isZh ? '请输入您的电话' : 'Enter your phone number'}
                      className={missingFields.includes('phone') ? 'border-red-500' : ''}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="whatsapp">
                      WhatsApp {isZh ? '(选填)' : '(Optional)'}
                    </Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={basicInfo.whatsapp}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                      placeholder={isZh ? '请输入您的 WhatsApp 号码' : 'Enter your WhatsApp number'}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  {isZh
                    ? '我们将使用此信息创建您的账户并联系您。'
                    : 'We will use this information to create your account and contact you.'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* All Steps - Compact Layout */}
        {STEP_CONFIG.map((config) => {
          const Icon = config.icon;

          return (
            <div
              key={config.id}
              ref={(el) => (sectionRefs.current[config.id] = el)}
              id={config.id}
              className="mb-4"
            >
              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b py-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="font-bold text-base text-gray-900">
                      Step {config.step - 1}: {t(config.titleKey)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 pb-4">
                  {renderStepContent(config.step)}
                </CardContent>
              </Card>
            </div>
          );
        })}

        {/* Error/Success Messages */}
        {saveError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {saveSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {t('caseIntake.draftSaved')}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <Card className="sticky bottom-4 shadow-xl">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-3">
                {!isTokenMode && (
                  <>
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
                  </>
                )}
                {isTokenMode && (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    disabled={isSubmitting}
                  >
                    {isZh ? '取消' : 'Cancel'}
                  </Button>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSaving || isSubmitting}
                className="bg-green-600 hover:bg-green-700 px-8"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting
                  ? (isZh ? '提交中...' : t('caseIntake.submitting'))
                  : (isZh ? '提交' : t('caseIntake.submit'))}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all z-30"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

export default CaseIntakeSinglePage;

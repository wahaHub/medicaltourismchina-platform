import React, { useState, useEffect } from 'react';
import { User, Phone, MessageSquare, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/config/supabaseClient';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import {
  buildConsultationOnboardingDraft,
  completePatientOnboarding,
} from '@/services/patient-onboarding';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedureName?: string;
  type?: 'quote' | 'consultation';
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  country: string;
  whatsapp: string;
  messenger: string;
  procedure: string;
  destination: string;
  treatmentTime: string;
  message: string;
  password: string;
  confirmPassword: string;
}

const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  isOpen,
  onClose,
  procedureName = '',
  type = 'quote'
}) => {
  const { t, currentLanguage } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { bootstrapSession } = usePatientAuth();
  const { applyOnboardingResult, openWidget } = usePatientEntry();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
    country: '',
    whatsapp: '',
    messenger: '',
    procedure: '',
    destination: '',
    treatmentTime: '',
    message: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  // 记录从后端加载的原始数据，用于判断哪些字段应该是只读的
  const [loadedUserData, setLoadedUserData] = useState<Partial<FormData>>({});

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Japan', 'South Korea', 'Singapore', 'Malaysia', 'Thailand',
    'India', 'UAE', 'Saudi Arabia', 'Other'
  ];

  // Country codes for WhatsApp - comprehensive list covering all major regions
  const countryCodes = [
    // North America
    { code: '+1', country: 'US/CA', flag: '🇺🇸' },
    // Europe
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+49', country: 'DE', flag: '🇩🇪' },
    { code: '+33', country: 'FR', flag: '🇫🇷' },
    { code: '+39', country: 'IT', flag: '🇮🇹' },
    { code: '+34', country: 'ES', flag: '🇪🇸' },
    { code: '+31', country: 'NL', flag: '🇳🇱' },
    { code: '+32', country: 'BE', flag: '🇧🇪' },
    { code: '+41', country: 'CH', flag: '🇨🇭' },
    { code: '+43', country: 'AT', flag: '🇦🇹' },
    { code: '+46', country: 'SE', flag: '🇸🇪' },
    { code: '+47', country: 'NO', flag: '🇳🇴' },
    { code: '+45', country: 'DK', flag: '🇩🇰' },
    { code: '+358', country: 'FI', flag: '🇫🇮' },
    { code: '+48', country: 'PL', flag: '🇵🇱' },
    { code: '+420', country: 'CZ', flag: '🇨🇿' },
    { code: '+36', country: 'HU', flag: '🇭🇺' },
    { code: '+30', country: 'GR', flag: '🇬🇷' },
    { code: '+351', country: 'PT', flag: '🇵🇹' },
    { code: '+353', country: 'IE', flag: '🇮🇪' },
    { code: '+7', country: 'RU', flag: '🇷🇺' },
    { code: '+380', country: 'UA', flag: '🇺🇦' },
    { code: '+40', country: 'RO', flag: '🇷🇴' },
    // Oceania
    { code: '+61', country: 'AU', flag: '🇦🇺' },
    { code: '+64', country: 'NZ', flag: '🇳🇿' },
    // East Asia
    { code: '+86', country: 'CN', flag: '🇨🇳' },
    { code: '+852', country: 'HK', flag: '🇭🇰' },
    { code: '+853', country: 'MO', flag: '🇲🇴' },
    { code: '+886', country: 'TW', flag: '🇹🇼' },
    { code: '+81', country: 'JP', flag: '🇯🇵' },
    { code: '+82', country: 'KR', flag: '🇰🇷' },
    { code: '+976', country: 'MN', flag: '🇲🇳' },
    // Southeast Asia - ASEAN
    { code: '+65', country: 'SG', flag: '🇸🇬' },
    { code: '+60', country: 'MY', flag: '🇲🇾' },
    { code: '+66', country: 'TH', flag: '🇹🇭' },
    { code: '+62', country: 'ID', flag: '🇮🇩' },
    { code: '+63', country: 'PH', flag: '🇵🇭' },
    { code: '+84', country: 'VN', flag: '🇻🇳' },
    { code: '+95', country: 'MM', flag: '🇲🇲' },
    { code: '+855', country: 'KH', flag: '🇰🇭' },
    { code: '+856', country: 'LA', flag: '🇱🇦' },
    { code: '+673', country: 'BN', flag: '🇧🇳' },
    { code: '+670', country: 'TL', flag: '🇹🇱' },
    // South Asia
    { code: '+91', country: 'IN', flag: '🇮🇳' },
    { code: '+92', country: 'PK', flag: '🇵🇰' },
    { code: '+880', country: 'BD', flag: '🇧🇩' },
    { code: '+94', country: 'LK', flag: '🇱🇰' },
    { code: '+977', country: 'NP', flag: '🇳🇵' },
    { code: '+960', country: 'MV', flag: '🇲🇻' },
    { code: '+975', country: 'BT', flag: '🇧🇹' },
    { code: '+93', country: 'AF', flag: '🇦🇫' },
    // Middle East - Complete
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'SA', flag: '🇸🇦' },
    { code: '+974', country: 'QA', flag: '🇶🇦' },
    { code: '+973', country: 'BH', flag: '🇧🇭' },
    { code: '+965', country: 'KW', flag: '🇰🇼' },
    { code: '+968', country: 'OM', flag: '🇴🇲' },
    { code: '+967', country: 'YE', flag: '🇾🇪' },
    { code: '+962', country: 'JO', flag: '🇯🇴' },
    { code: '+961', country: 'LB', flag: '🇱🇧' },
    { code: '+963', country: 'SY', flag: '🇸🇾' },
    { code: '+964', country: 'IQ', flag: '🇮🇶' },
    { code: '+98', country: 'IR', flag: '🇮🇷' },
    { code: '+972', country: 'IL', flag: '🇮🇱' },
    { code: '+970', country: 'PS', flag: '🇵🇸' },
    { code: '+90', country: 'TR', flag: '🇹🇷' },
    // Central Asia
    { code: '+7', country: 'KZ', flag: '🇰🇿' },
    { code: '+998', country: 'UZ', flag: '🇺🇿' },
    { code: '+993', country: 'TM', flag: '🇹🇲' },
    { code: '+996', country: 'KG', flag: '🇰🇬' },
    { code: '+992', country: 'TJ', flag: '🇹🇯' },
    { code: '+994', country: 'AZ', flag: '🇦🇿' },
    { code: '+374', country: 'AM', flag: '🇦🇲' },
    { code: '+995', country: 'GE', flag: '🇬🇪' },
    // Latin America - Complete
    { code: '+52', country: 'MX', flag: '🇲🇽' },
    { code: '+55', country: 'BR', flag: '🇧🇷' },
    { code: '+54', country: 'AR', flag: '🇦🇷' },
    { code: '+56', country: 'CL', flag: '🇨🇱' },
    { code: '+57', country: 'CO', flag: '🇨🇴' },
    { code: '+51', country: 'PE', flag: '🇵🇪' },
    { code: '+58', country: 'VE', flag: '🇻🇪' },
    { code: '+593', country: 'EC', flag: '🇪🇨' },
    { code: '+591', country: 'BO', flag: '🇧🇴' },
    { code: '+595', country: 'PY', flag: '🇵🇾' },
    { code: '+598', country: 'UY', flag: '🇺🇾' },
    { code: '+507', country: 'PA', flag: '🇵🇦' },
    { code: '+506', country: 'CR', flag: '🇨🇷' },
    { code: '+502', country: 'GT', flag: '🇬🇹' },
    { code: '+503', country: 'SV', flag: '🇸🇻' },
    { code: '+504', country: 'HN', flag: '🇭🇳' },
    { code: '+505', country: 'NI', flag: '🇳🇮' },
    { code: '+53', country: 'CU', flag: '🇨🇺' },
    { code: '+1809', country: 'DO', flag: '🇩🇴' },
    { code: '+509', country: 'HT', flag: '🇭🇹' },
    { code: '+1876', country: 'JM', flag: '🇯🇲' },
    { code: '+1868', country: 'TT', flag: '🇹🇹' },
    // Africa - Complete
    { code: '+20', country: 'EG', flag: '🇪🇬' },
    { code: '+212', country: 'MA', flag: '🇲🇦' },
    { code: '+213', country: 'DZ', flag: '🇩🇿' },
    { code: '+216', country: 'TN', flag: '🇹🇳' },
    { code: '+218', country: 'LY', flag: '🇱🇾' },
    { code: '+234', country: 'NG', flag: '🇳🇬' },
    { code: '+27', country: 'ZA', flag: '🇿🇦' },
    { code: '+254', country: 'KE', flag: '🇰🇪' },
    { code: '+255', country: 'TZ', flag: '🇹🇿' },
    { code: '+256', country: 'UG', flag: '🇺🇬' },
    { code: '+251', country: 'ET', flag: '🇪🇹' },
    { code: '+233', country: 'GH', flag: '🇬🇭' },
    { code: '+225', country: 'CI', flag: '🇨🇮' },
    { code: '+221', country: 'SN', flag: '🇸🇳' },
    { code: '+237', country: 'CM', flag: '🇨🇲' },
    { code: '+243', country: 'CD', flag: '🇨🇩' },
    { code: '+244', country: 'AO', flag: '🇦🇴' },
    { code: '+263', country: 'ZW', flag: '🇿🇼' },
    { code: '+260', country: 'ZM', flag: '🇿🇲' },
    { code: '+258', country: 'MZ', flag: '🇲🇿' },
    { code: '+249', country: 'SD', flag: '🇸🇩' },
    { code: '+250', country: 'RW', flag: '🇷🇼' },
    { code: '+230', country: 'MU', flag: '🇲🇺' },
  ];
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('+1');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // 当用户已登录时，自动填充用户信息
  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated && user && isOpen) {
        setIsLoadingUserData(true);
        try {
          let metadata: Record<string, unknown> = {};
          if (isSupabaseConfigured) {
            const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
            if (error || !supabaseUser) {
              console.error('Failed to get user metadata:', error);
              return;
            }
            metadata = supabaseUser.user_metadata || {};
          }

          // 准备从后端加载的数据
          const loadedData = {
            name: (metadata.name as string) || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
            email: user.email || '',
            phone: (metadata.phone as string) || '',
            age: metadata.age ? String(metadata.age) : '',
            gender: (metadata.gender as string) || '',
            country: (metadata.country as string) || '',
            whatsapp: (metadata.whatsapp as string) || '',
            messenger: (metadata.messenger as string) || '',
            procedure: '',
            destination: '',
            treatmentTime: '',
            message: '',
            password: '',
            confirmPassword: ''
          };

          // 自动填充表单数据
          setFormData(loadedData);
          // 记录哪些字段是从后端加载的（有值的字段）
          setLoadedUserData(loadedData);
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setIsLoadingUserData(false);
        }
      }
    };

    loadUserData();
  }, [isAuthenticated, user, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) newErrors.name = t('quote.validation.nameRequired');

    // Email is required
    if (!formData.email.trim()) {
      newErrors.email = t('quote.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('quote.validation.emailInvalid');
    }

    // Phone is required
    if (!formData.phone.trim()) {
      newErrors.phone = t('quote.validation.phoneRequired');
    }

    if (!formData.age.trim()) newErrors.age = t('quote.validation.ageRequired');
    if (!formData.gender) newErrors.gender = t('quote.validation.genderRequired');
    if (!formData.country) newErrors.country = t('quote.validation.countryRequired');

    // At least one of WhatsApp or Messenger is required
    if (!formData.whatsapp.trim() && !formData.messenger.trim()) {
      const contactRequiredMsg = 'Please provide at least WhatsApp or Messenger';
      newErrors.whatsapp = contactRequiredMsg;
      newErrors.messenger = contactRequiredMsg;
    }

    // Password is optional - only validate if provided
    if (!isAuthenticated && formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = t('quote.validation.passwordLength');
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('quote.validation.passwordMismatch');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // 准备API请求数据
      await completePatientOnboarding({
        draft: buildConsultationOnboardingDraft({
          preferredLanguage: currentLanguage.code,
          procedureName,
          formData,
        }),
        bootstrapSession,
        applyOnboardingResult,
      });
      alert(t('quote.success.message'));
      openWidget();

      // 只重置 message 和 treatment 字段，其他字段保留（特别是已登录用户的信息）
      if (isAuthenticated) {
        setFormData(prev => ({
          ...prev,
          procedure: '',
          destination: '',
          treatmentTime: '',
          message: ''
        }));
      } else {
        // 未登录用户：完全重置表单
        setFormData({
          name: '',
          phone: '',
          email: '',
          age: '',
          gender: '',
          country: '',
          whatsapp: '',
          messenger: '',
          procedure: '',
          destination: '',
          treatmentTime: '',
          message: '',
          password: '',
          confirmPassword: ''
        });
        setWhatsappCountryCode('+1');
        setWhatsappNumber('');
      }
      setErrors({});
      onClose();

    } catch (error) {
      console.error('Booking request submission error:', error);
      alert(t('quote.error.message') + '\n\n' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            {type === 'consultation' ? t('consultation.modal.title') : t('quote.modal.title')}
          </DialogTitle>
          <p className="text-gray-600 text-center">
            {type === 'consultation' ? t('consultation.cta.description') : t('quote.cta.description')}
          </p>
          {procedureName && (
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <span className="font-medium">
                {type === 'consultation' ? t('consultation.modal.hospital') : t('quote.modal.procedure')}:
              </span> {procedureName}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" />
              {t('quote.section.personal')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  {t('quote.field.name')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('quote.placeholder.name')}
                  className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                  readOnly={isAuthenticated && !!loadedUserData.name}
                  disabled={isAuthenticated && !!loadedUserData.name}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                  {t('quote.field.age')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder={t('quote.placeholder.age')}
                  className={errors.age ? 'border-red-500 focus:border-red-500' : ''}
                  readOnly={isAuthenticated && !!loadedUserData.age}
                  disabled={isAuthenticated && !!loadedUserData.age}
                />
                {errors.age && <p className="text-xs text-red-500">{errors.age}</p>}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                  {t('quote.field.gender')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  disabled={isAuthenticated && !!loadedUserData.gender}
                >
                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('quote.placeholder.gender')} />
                </SelectTrigger>
                  <SelectContent className="z-[10030]">
                    <SelectItem value="male">{t('quote.gender.male')}</SelectItem>
                    <SelectItem value="female">{t('quote.gender.female')}</SelectItem>
                    <SelectItem value="other">{t('quote.gender.other')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                  {t('quote.field.country')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleInputChange('country', value)}
                  disabled={isAuthenticated && !!loadedUserData.country}
                >
                  <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('quote.placeholder.country')} />
                  </SelectTrigger>
                  <SelectContent className="z-[10030] max-h-48">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Phone className="h-5 w-5 text-gray-600" />
              {t('quote.section.contact')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t('quote.field.email')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={t('quote.placeholder.email')}
                  className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                  readOnly={isAuthenticated && !!loadedUserData.email}
                  disabled={isAuthenticated && !!loadedUserData.email}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  {t('quote.field.phone')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={t('quote.placeholder.phone')}
                  className={errors.phone ? 'border-red-500 focus:border-red-500' : ''}
                  readOnly={isAuthenticated && !!loadedUserData.phone}
                  disabled={isAuthenticated && !!loadedUserData.phone}
                />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
              </div>
            </div>

            {/* Preferred Contact Method - WhatsApp or Messenger */}
            <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">Preferred Contact Method</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Choose at least one</span>
              </div>
              <p className="text-xs text-gray-600 mb-4">Please provide at least one of the following contact methods so we can reach you easily.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* WhatsApp */}
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </Label>
                  <div className="flex gap-2">
                    <select
                      value={whatsappCountryCode}
                      onChange={(e) => {
                        setWhatsappCountryCode(e.target.value);
                        if (whatsappNumber) {
                          handleInputChange('whatsapp', `${e.target.value} ${whatsappNumber}`);
                        }
                      }}
                      className="w-28 px-2 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => {
                        const number = e.target.value.replace(/[^0-9\s]/g, '');
                        setWhatsappNumber(number);
                        handleInputChange('whatsapp', number ? `${whatsappCountryCode} ${number}` : '');
                      }}
                      placeholder="234 567 8900"
                      className={`flex-1 ${errors.whatsapp ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                  </div>
                </div>

                {/* Messenger */}
                <div className="space-y-2">
                  <Label htmlFor="messenger" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                    </svg>
                    Facebook Messenger
                  </Label>
                  <Input
                    id="messenger"
                    type="text"
                    value={formData.messenger}
                    onChange={(e) => handleInputChange('messenger', e.target.value)}
                    placeholder="Username or profile link"
                    className={errors.messenger ? 'border-red-500 focus:border-red-500' : ''}
                  />
                </div>
              </div>

              {(errors.whatsapp || errors.messenger) && (
                <p className="text-xs text-red-500 mt-2">Please provide at least WhatsApp or Messenger</p>
              )}
            </div>
          </div>

          {/* Treatment Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-gray-600" />
              {t('quote.section.treatment')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Procedure */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="procedure" className="text-sm font-medium text-gray-700">
                  {t('quote.field.procedure')}
                </Label>
                <Input
                  id="procedure"
                  type="text"
                  value={formData.procedure}
                  onChange={(e) => handleInputChange('procedure', e.target.value)}
                  placeholder={t('quote.placeholder.procedure')}
                />
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <Label htmlFor="destination" className="text-sm font-medium text-gray-700">
                  {t('quote.field.destination')}
                </Label>
                <Select
                  value={formData.destination}
                  onValueChange={(value) => handleInputChange('destination', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('quote.placeholder.destination')} />
                  </SelectTrigger>
                  <SelectContent className="z-[10030]">
                    <SelectItem value="Beijing">{t('cities.beijing')}</SelectItem>
                    <SelectItem value="Shanghai">{t('cities.shanghai')}</SelectItem>
                    <SelectItem value="Guangzhou">{t('cities.guangzhou')}</SelectItem>
                    <SelectItem value="Shenzhen">{t('cities.shenzhen')}</SelectItem>
                    <SelectItem value="Chengdu">{t('cities.chengdu')}</SelectItem>
                    <SelectItem value="Chongqing">{t('cities.chongqing')}</SelectItem>
                    <SelectItem value="Other">{t('quote.destination.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Treatment Time */}
              <div className="space-y-2">
                <Label htmlFor="treatmentTime" className="text-sm font-medium text-gray-700">
                  {t('quote.field.treatmentTime')}
                </Label>
                <Select
                  value={formData.treatmentTime}
                  onValueChange={(value) => handleInputChange('treatmentTime', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('quote.placeholder.treatmentTime')} />
                  </SelectTrigger>
                  <SelectContent className="z-[10030]">
                    <SelectItem value="ASAP">{t('quote.treatmentTime.asap')}</SelectItem>
                    <SelectItem value="Within 1 month">{t('quote.treatmentTime.oneMonth')}</SelectItem>
                    <SelectItem value="1-3 months">{t('quote.treatmentTime.threeMonths')}</SelectItem>
                    <SelectItem value="3-6 months">{t('quote.treatmentTime.sixMonths')}</SelectItem>
                    <SelectItem value="6+ months">{t('quote.treatmentTime.later')}</SelectItem>
                    <SelectItem value="Just exploring">{t('quote.treatmentTime.exploring')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 
                (type === 'consultation' ? t('consultation.button.submitting') : t('quote.button.submitting')) : 
                (type === 'consultation' ? t('consultation.button.submit') : t('quote.button.submit'))
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteRequestModal;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/config/supabaseClient";
import { User, Phone, MessageSquare, Stethoscope } from 'lucide-react';
import { ResultModal } from "@/components/ui/ResultModal";

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

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
  'France', 'Japan', 'South Korea', 'Singapore', 'Malaysia', 'Thailand',
  'India', 'UAE', 'Saudi Arabia', 'Other'
];

// Country codes for WhatsApp - comprehensive list
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
  { code: '+351', country: 'PT', flag: '🇵🇹' },
  { code: '+30', country: 'GR', flag: '🇬🇷' },
  { code: '+353', country: 'IE', flag: '🇮🇪' },
  { code: '+7', country: 'RU', flag: '🇷🇺' },
  { code: '+380', country: 'UA', flag: '🇺🇦' },
  { code: '+90', country: 'TR', flag: '🇹🇷' },
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
  // Southeast Asia (ASEAN)
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
  // Middle East
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
  // Central Asia
  { code: '+7', country: 'KZ', flag: '🇰🇿' },
  { code: '+998', country: 'UZ', flag: '🇺🇿' },
  { code: '+993', country: 'TM', flag: '🇹🇲' },
  { code: '+996', country: 'KG', flag: '🇰🇬' },
  { code: '+992', country: 'TJ', flag: '🇹🇯' },
  { code: '+994', country: 'AZ', flag: '🇦🇿' },
  { code: '+374', country: 'AM', flag: '🇦🇲' },
  { code: '+995', country: 'GE', flag: '🇬🇪' },
  // Latin America
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
  // Africa
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

const FreeQuote = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
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
  const [loadedUserData, setLoadedUserData] = useState<Partial<FormData>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [accountCreated, setAccountCreated] = useState(false);
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('+1');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // 当用户已登录时，自动填充用户信息
  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated && user) {
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

          setFormData(loadedData);
          setLoadedUserData(loadedData);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [isAuthenticated, user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) newErrors.name = t('quote.validation.nameRequired');

    if (!formData.email.trim()) {
      newErrors.email = t('quote.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('quote.validation.emailInvalid');
    }

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
      const requestData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: formData.age,
        gender: formData.gender,
        country: formData.country,
        whatsapp: formData.whatsapp || '',
        messenger: formData.messenger || '',
        procedure: formData.procedure || '',
        destination: formData.destination || '',
        treatmentTime: formData.treatmentTime || '',
        message: formData.message || '',
        ...(!isAuthenticated && formData.password && {
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      };

      const apiUrl = import.meta.env.VITE_ACTION_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'https://api.medicaltourismchina.health';
      const response = await fetch(`${apiUrl}/booking-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to submit request');
      }

      // Set account created flag and show success modal
      setAccountCreated(!!result.accountCreated);

      // 如果创建了新账户，自动登录
      if (isSupabaseConfigured && result.accountCreated && formData.password) {
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (signInError) {
            console.error('Auto sign-in failed:', signInError);
            // 登录失败不阻止显示成功弹窗，用户可以稍后手动登录
          } else {
            console.log('Auto sign-in successful');
          }
        } catch (signInErr) {
          console.error('Auto sign-in error:', signInErr);
        }
      }

      setShowSuccessModal(true);

      if (isAuthenticated) {
        setFormData(prev => ({
          ...prev,
          message: ''
        }));
      } else {
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

    } catch (error) {
      console.error('Booking request submission error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
      hasError ? 'border-red-500' : 'border-gray-200'
    }`;

  return (
    <div className="min-h-screen">
      {/* Success Modal */}
      <ResultModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title={t('freeQuote.success.title')}
        message={t('freeQuote.success.message')}
        accountCreated={accountCreated}
        showCaseIntakeCTA={true}
      />

      {/* Error Modal */}
      <ResultModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        type="error"
        errorDetails={errorMessage}
        onRetry={() => {
          setShowErrorModal(false);
        }}
      />

      <TopBanner />
      <Header />

      {/* Hero Background */}
      <div
        className="relative h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] bg-cover bg-center mt-[112px] sm:mt-[120px]"
        style={{
          backgroundImage: `url('/free_quote_back.png')`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#003B59] drop-shadow-lg">
            {t('freeQuote.heroTitle')}
          </h1>
        </div>
      </div>

      {/* Form Card */}
      <div className="container mx-auto px-3 sm:px-4 -mt-16 sm:-mt-20 md:-mt-24 lg:-mt-32 relative z-10 pb-8 sm:pb-12 md:pb-16">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8">
          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-600 mb-2 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7" />
            {t('consultation.modal.title')}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
            {t('consultation.cta.description')}
          </p>
          <div className="w-12 sm:w-14 md:w-16 h-1 bg-teal-500 mb-4 sm:mb-6 md:mb-8"></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                {t('quote.section.personal')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    {t('quote.field.name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder={t('quote.placeholder.name')}
                    className={inputClass(!!errors.name)}
                    readOnly={isAuthenticated && !!loadedUserData.name}
                    disabled={isAuthenticated && !!loadedUserData.name}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    {t('quote.field.age')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    placeholder={t('quote.placeholder.age')}
                    className={inputClass(!!errors.age)}
                    readOnly={isAuthenticated && !!loadedUserData.age}
                    disabled={isAuthenticated && !!loadedUserData.age}
                  />
                  {errors.age && <p className="text-xs text-red-500">{errors.age}</p>}
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    {t('quote.field.gender')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className={inputClass(!!errors.gender)}
                    disabled={isAuthenticated && !!loadedUserData.gender}
                  >
                    <option value="">{t('quote.placeholder.gender')}</option>
                    <option value="male">{t('quote.gender.male')}</option>
                    <option value="female">{t('quote.gender.female')}</option>
                    <option value="other">{t('quote.gender.other')}</option>
                  </select>
                  {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    {t('quote.field.country')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className={inputClass(!!errors.country)}
                    disabled={isAuthenticated && !!loadedUserData.country}
                  >
                    <option value="">{t('quote.placeholder.country')}</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-600" />
                {t('quote.section.contact')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    {t('quote.field.email')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder={t('quote.placeholder.email')}
                    className={inputClass(!!errors.email)}
                    readOnly={isAuthenticated && !!loadedUserData.email}
                    disabled={isAuthenticated && !!loadedUserData.email}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    {t('quote.field.phone')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder={t('quote.placeholder.phone')}
                    className={inputClass(!!errors.phone)}
                    readOnly={isAuthenticated && !!loadedUserData.phone}
                    disabled={isAuthenticated && !!loadedUserData.phone}
                  />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>

              </div>

              {/* Preferred Contact Method - WhatsApp or Messenger */}
              <div className="md:col-span-2 mt-2">
                <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">Preferred Contact Method</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Choose at least one</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">Please provide at least one of the following contact methods so we can reach you easily.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* WhatsApp */}
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                        <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={whatsappCountryCode}
                          onChange={(e) => {
                            setWhatsappCountryCode(e.target.value);
                            // Update full whatsapp with new country code
                            if (whatsappNumber) {
                              handleChange('whatsapp', `${e.target.value} ${whatsappNumber}`);
                            }
                          }}
                          className="w-28 px-2 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          {countryCodes.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          value={whatsappNumber}
                          onChange={(e) => {
                            const number = e.target.value.replace(/[^0-9\s]/g, '');
                            setWhatsappNumber(number);
                            handleChange('whatsapp', number ? `${whatsappCountryCode} ${number}` : '');
                          }}
                          placeholder="234 567 8900"
                          className={`flex-1 px-3 py-2.5 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.whatsapp ? 'border-red-500' : 'border-gray-200'}`}
                        />
                      </div>
                    </div>

                    {/* Messenger */}
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                        <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                        </svg>
                        Facebook Messenger
                      </label>
                      <input
                        type="text"
                        value={formData.messenger}
                        onChange={(e) => handleChange('messenger', e.target.value)}
                        placeholder="Username or profile link"
                        className={inputClass(!!errors.messenger)}
                      />
                    </div>
                  </div>

                  {(errors.whatsapp || errors.messenger) && (
                    <p className="text-xs text-red-500 mt-2">Please provide at least WhatsApp or Messenger</p>
                  )}
                </div>
              </div>
            </div>

            {/* Treatment Information Section */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-gray-600" />
                {t('quote.section.treatment')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Procedure */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    {t('quote.field.procedure')}
                  </label>
                  <input
                    type="text"
                    value={formData.procedure}
                    onChange={(e) => handleChange('procedure', e.target.value)}
                    placeholder={t('quote.placeholder.procedure')}
                    className={inputClass(!!errors.procedure)}
                  />
                </div>

                {/* Destination */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    {t('quote.field.destination')}
                  </label>
                  <select
                    value={formData.destination}
                    onChange={(e) => handleChange('destination', e.target.value)}
                    className={inputClass(!!errors.destination)}
                  >
                    <option value="">{t('quote.placeholder.destination')}</option>
                    <option value="Beijing">{t('cities.beijing')}</option>
                    <option value="Shanghai">{t('cities.shanghai')}</option>
                    <option value="Guangzhou">{t('cities.guangzhou')}</option>
                    <option value="Shenzhen">{t('cities.shenzhen')}</option>
                    <option value="Chengdu">{t('cities.chengdu')}</option>
                    <option value="Chongqing">{t('cities.chongqing')}</option>
                    <option value="Other">{t('quote.destination.other')}</option>
                  </select>
                </div>

                {/* Treatment Time */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    {t('quote.field.treatmentTime')}
                  </label>
                  <select
                    value={formData.treatmentTime}
                    onChange={(e) => handleChange('treatmentTime', e.target.value)}
                    className={inputClass(!!errors.treatmentTime)}
                  >
                    <option value="">{t('quote.placeholder.treatmentTime')}</option>
                    <option value="ASAP">{t('quote.treatmentTime.asap')}</option>
                    <option value="Within 1 month">{t('quote.treatmentTime.oneMonth')}</option>
                    <option value="1-3 months">{t('quote.treatmentTime.threeMonths')}</option>
                    <option value="3-6 months">{t('quote.treatmentTime.sixMonths')}</option>
                    <option value="6+ months">{t('quote.treatmentTime.later')}</option>
                    <option value="Just exploring">{t('quote.treatmentTime.exploring')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 sm:flex-none px-6 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? t('consultation.button.submitting') : t('consultation.button.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FreeQuote;

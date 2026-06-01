import React, { useEffect, useState } from 'react';
import { CaseIntakeSinglePage } from '@/components/case-intake/CaseIntakeSinglePage';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Mail, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/config/supabaseClient';
import { validateSalesToken, ValidateTokenResponse } from '@/services/api/salesTokens';
import { BRAND_LOGO_URL } from '@/config/brandAssets';

export function CaseIntakePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t, currentLanguage } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isProcessingMagicLink, setIsProcessingMagicLink] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);

  // Token mode (Flow B) states
  const [salesToken, setSalesToken] = useState<string | null>(null);
  const [tokenValidation, setTokenValidation] = useState<ValidateTokenResponse | null>(null);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const isZh = String(currentLanguage) === 'zh';

  // Check for sales token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setSalesToken(token);
      validateToken(token);
    }
  }, [searchParams]);

  const validateToken = async (token: string) => {
    setIsValidatingToken(true);
    setTokenError(null);
    try {
      const result = await validateSalesToken(token);
      setTokenValidation(result);
      if (!result.is_valid) {
        setTokenError(isZh
          ? '链接已失效或已被使用，请联系您的医疗顾问获取新链接。'
          : 'This link has expired or already been used. Please contact your medical consultant for a new link.'
        );
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setTokenError(isZh
        ? '验证链接时出错，请重试。'
        : 'Error validating link. Please try again.'
      );
    } finally {
      setIsValidatingToken(false);
    }
  };

  // Check if this is a Magic Link redirect (contains hash with access_token or error)
  useEffect(() => {
    const handleMagicLink = async () => {
      if (!isSupabaseConfigured) {
        return;
      }
      const hash = window.location.hash;

      // Check if URL contains Supabase auth tokens (Magic Link)
      if (hash && (hash.includes('access_token') || hash.includes('error'))) {
        setIsProcessingMagicLink(true);

        try {
          // Supabase client will automatically handle the token from URL
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Magic link auth error:', error);
            setMagicLinkError(error.message);
          } else if (data.session) {
            console.log('Magic link login successful');
            // Clear the hash from URL for cleaner appearance
            window.history.replaceState(null, '', location.pathname);
          }
        } catch (err) {
          console.error('Error processing magic link:', err);
          setMagicLinkError('Failed to process login link. Please try again.');
        } finally {
          setIsProcessingMagicLink(false);
        }
      }
    };

    handleMagicLink();
  }, [location]);

  // Logo header component for auth pages
  const LogoHeader = () => (
    <div className="absolute top-0 left-0 w-full bg-white border-b">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <a href="/" className="inline-block">
          <img
            src={BRAND_LOGO_URL}
            alt="Medora Health"
            className="h-10 w-auto"
          />
        </a>
      </div>
    </div>
  );

  // Show loading while processing Magic Link, validating token, or waiting for auth
  if (isProcessingMagicLink || isValidatingToken || (authLoading && !salesToken)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
        <LogoHeader />
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {isProcessingMagicLink
              ? t('caseIntake.processingLogin') || 'Processing your login...'
              : isValidatingToken
              ? (isZh ? '正在验证链接...' : 'Validating link...')
              : t('caseIntake.loading') || 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if token is invalid (Flow B)
  if (salesToken && tokenError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
        <LogoHeader />
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isZh ? '链接无效' : 'Invalid Link'}
          </h2>
          <p className="text-gray-600 mb-6">{tokenError}</p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/')} className="w-full">
              {isZh ? '返回首页' : 'Back to Home'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show error if Magic Link failed
  if (magicLinkError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
        <LogoHeader />
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t('caseIntake.loginFailed') || 'Login Failed'}
          </h2>
          <p className="text-gray-600 mb-6">{magicLinkError}</p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/auth')} className="w-full">
              {t('caseIntake.goToLogin') || 'Go to Login'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              {t('caseIntake.backToHome') || 'Back to Home'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // For Flow B (token mode): Allow access without login if token is valid
  const isTokenMode = salesToken && tokenValidation?.is_valid;

  // Show login prompt if not authenticated AND not in token mode
  if (!isTokenMode && (!isAuthenticated || !user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
        <LogoHeader />
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t('caseIntake.loginRequired') || 'Login Required'}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('caseIntake.loginRequiredMessage') || 'Please log in to access the Medical Case Intake form. If you received an email invitation, please use the link in that email.'}
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/auth')} className="w-full">
              {t('caseIntake.goToLogin') || 'Go to Login'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              {t('caseIntake.backToHome') || 'Back to Home'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button - different for token mode */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          {isTokenMode ? (
            // Token mode: Show logo and consultant info
            <div className="flex items-center gap-4">
              <a href="/" className="inline-block">
                <img
                  src={BRAND_LOGO_URL}
                  alt="Medora Health"
                  className="h-8 w-auto"
                />
              </a>
              {tokenValidation.sales_name && (
                <span className="text-sm text-gray-600">
                  {isZh ? '您的医疗顾问: ' : 'Your Medical Consultant: '}
                  <span className="font-medium text-gray-900">{tokenValidation.sales_name}</span>
                </span>
              )}
            </div>
          ) : (
            // Normal mode: Show back button
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('caseIntake.backToDashboard')}
            </Button>
          )}
        </div>
      </div>

      {/* Main content - Single Page Layout */}
      <CaseIntakeSinglePage
        onComplete={() => {
          if (isTokenMode) {
            // Token mode: Navigate to success page
            navigate('/?caseIntakeSubmitted=true');
          } else {
            // Normal mode: Navigate back to dashboard
            navigate('/dashboard?caseIntakeSuccess=true');
          }
        }}
        // Pass token mode props
        isTokenMode={isTokenMode}
        salesToken={salesToken}
        tokenValidation={tokenValidation}
      />
    </div>
  );
}

export default CaseIntakePage;

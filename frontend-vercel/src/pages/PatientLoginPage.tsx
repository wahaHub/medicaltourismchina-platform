import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { AlertCircle, Loader2, MailCheck } from 'lucide-react';
import { isPatientSessionRefreshSuperseded, usePatientAuth } from '@/hooks/usePatientAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getStoredRestoreToken, isUnauthorizedApiError } from '@/services/api/crmApiClient';
import { getPatientLoginContent } from './patient-login.helpers';
import { BRAND_LOGO_URL } from '@/config/brandAssets';

type LocationState = {
  error?: string;
  from?: Location;
};

export default function PatientLoginPage() {
  const { t } = useLanguage();
  const {
    isAuthenticated,
    isLoading,
    lastSessionValidatedAt,
    requestMagicLink,
    refreshPatientSession,
    expirePatientSession,
  } = usePatientAuth();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionCheckStatus, setSessionCheckStatus] = useState<'idle' | 'checking' | 'fresh' | 'stale'>('idle');
  const sessionCheckStartedRef = useRef(false);
  const content = useMemo(() => getPatientLoginContent(t), [t]);
  const hasStoredRestoreToken = Boolean(getStoredRestoreToken());
  const sessionWasRecentlyValidated = lastSessionValidatedAt !== null
    && Date.now() - lastSessionValidatedAt < 5000;

  useEffect(() => {
    if (state?.error === 'invalid-token') {
      setErrorMessage(t('patientLogin.invalidTokenError') ?? 'The login link is invalid or expired. Please request a new one.');
    }
  }, [state?.error, t]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated && !hasStoredRestoreToken) {
      sessionCheckStartedRef.current = false;
      setSessionCheckStatus('stale');
      return;
    }

    if (isAuthenticated && sessionWasRecentlyValidated) {
      sessionCheckStartedRef.current = false;
      setSessionCheckStatus('fresh');
      return;
    }

    if (sessionCheckStartedRef.current) {
      return;
    }

    let cancelled = false;
    sessionCheckStartedRef.current = true;

    const verifyFreshSession = async () => {
      setSessionCheckStatus('checking');

      try {
        await refreshPatientSession();
        if (!cancelled) {
          setSessionCheckStatus('fresh');
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (isUnauthorizedApiError(error)) {
          await expirePatientSession();
          if (!cancelled) {
            setSessionCheckStatus('stale');
          }
          return;
        }

        if (isPatientSessionRefreshSuperseded(error)) {
          return;
        }

        if (isAuthenticated) {
          setSessionCheckStatus('fresh');
          return;
        }

        setSessionCheckStatus('stale');
      }
    };

    void verifyFreshSession();

    return () => {
      cancelled = true;
    };
  }, [
    expirePatientSession,
    hasStoredRestoreToken,
    isAuthenticated,
    isLoading,
    lastSessionValidatedAt,
    refreshPatientSession,
    sessionWasRecentlyValidated,
  ]);

  if (sessionCheckStatus === 'fresh' || (sessionCheckStatus === 'stale' && isAuthenticated && !isLoading)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (sessionCheckStatus === 'checking' || (isLoading && (isAuthenticated || hasStoredRestoreToken))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const handleMagicLinkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await requestMagicLink(email.trim());
      setSuccessMessage(t('patientLogin.magicLinkSuccess') ?? 'Email sign-in link sent. Please check your email.');
    } catch (error) {
      console.error('Failed to request patient magic link:', error);
      setErrorMessage(error instanceof Error ? error.message : (t('patientLogin.magicLinkError') ?? 'Failed to send login link.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.15),_transparent_40%),linear-gradient(180deg,_#f8fffd_0%,_#eefbf8_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center space-y-5 text-slate-900">
            <img
              src={BRAND_LOGO_URL}
              alt="Medora Health"
              className="h-24 w-auto sm:h-28 lg:h-36"
            />
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {t('patientLogin.pageTitle') ?? 'Patient login'}
              </h1>
              <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                {content.description || 'Sign in to continue your medical journey, review updates, and pick up your conversations right where you left them.'}
              </p>
            </div>
          </div>

          <Card className="border-0 bg-white/90 shadow-2xl shadow-teal-950/10 backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl">{content.cardTitle || 'Continue with an email sign-in link'}</CardTitle>
                <CardDescription>{content.cardDescription || 'We will send a one-time secure sign-in link to your email address.'}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert className="border-teal-200 bg-teal-50 text-teal-900">
                  <MailCheck className="h-4 w-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <form className="space-y-4" onSubmit={handleMagicLinkSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="patient-email-magic">{t('patientLogin.emailLabel') ?? 'Email'}</Label>
                  <Input
                    id="patient-email-magic"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t('patientLogin.emailPlaceholder') ?? 'name@example.com'}
                    autoComplete="email"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {content.submittingLabel || 'Sending sign-in link...'}
                    </>
                  ) : (
                    content.submitLabel || 'Send email sign-in link'
                  )}
                </Button>
              </form>

              <div className="flex items-center justify-start text-sm text-slate-500">
                <Link to="/" className="hover:text-slate-700">
                  {t('patientLogin.backToWebsite') ?? 'Back to website'}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

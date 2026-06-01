import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { isPatientSessionRefreshSuperseded, usePatientAuth } from '@/hooks/usePatientAuth';
import { getStoredRestoreToken, isUnauthorizedApiError } from '@/services/api/crmApiClient';
import PatientDashboardEntry from './PatientDashboardEntry';

export default function DashboardRoute() {
  const location = useLocation();
  const {
    isAuthenticated: patientIsAuthenticated,
    isLoading: patientIsLoading,
    lastSessionValidatedAt,
    refreshPatientSession,
    expirePatientSession,
  } = usePatientAuth();
  const hasPatientToken = new URLSearchParams(location.search).has('token');
  const hasStoredRestoreToken = Boolean(getStoredRestoreToken());
  const sessionWasRecentlyValidated = lastSessionValidatedAt !== null
    && Date.now() - lastSessionValidatedAt < 5000;
  const [sessionCheckStatus, setSessionCheckStatus] = useState<'idle' | 'checking' | 'fresh' | 'expired'>('idle');
  const sessionCheckStartedRef = useRef(false);

  useEffect(() => {
    if (hasPatientToken) {
      sessionCheckStartedRef.current = false;
      setSessionCheckStatus('idle');
      return;
    }

    if (patientIsLoading) {
      return;
    }

    if (!patientIsAuthenticated && !hasStoredRestoreToken) {
      sessionCheckStartedRef.current = false;
      setSessionCheckStatus('expired');
      return;
    }

    if (patientIsAuthenticated && sessionWasRecentlyValidated) {
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
            setSessionCheckStatus('expired');
          }
          return;
        }

        if (isPatientSessionRefreshSuperseded(error)) {
          return;
        }

        if (patientIsAuthenticated) {
          setSessionCheckStatus('fresh');
          return;
        }

        setSessionCheckStatus('expired');
      }
    };

    void verifyFreshSession();

    return () => {
      cancelled = true;
    };
  }, [
    expirePatientSession,
    hasPatientToken,
    hasStoredRestoreToken,
    lastSessionValidatedAt,
    patientIsAuthenticated,
    patientIsLoading,
    refreshPatientSession,
    sessionWasRecentlyValidated,
  ]);

  if (hasPatientToken) {
    if (patientIsAuthenticated) {
      return <PatientDashboardEntry hasDashboardToken />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (
    sessionCheckStatus === 'checking'
    || (sessionCheckStatus === 'idle' && (patientIsAuthenticated || hasStoredRestoreToken))
    || (patientIsLoading && hasStoredRestoreToken)
  ) {
    if (patientIsAuthenticated) {
      return <PatientDashboardEntry hasDashboardToken={false} />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (sessionCheckStatus === 'fresh' && patientIsAuthenticated) {
    return <PatientDashboardEntry hasDashboardToken={false} />;
  }

  return <Navigate to="/patient-login" replace />;
}

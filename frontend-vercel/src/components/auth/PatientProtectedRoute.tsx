import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { usePatientAuth } from '@/hooks/usePatientAuth';

interface PatientProtectedRouteProps {
  children: ReactNode;
}

export function PatientProtectedRoute({ children }: PatientProtectedRouteProps) {
  const { isLoading, isAuthenticated } = usePatientAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/patient-login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}


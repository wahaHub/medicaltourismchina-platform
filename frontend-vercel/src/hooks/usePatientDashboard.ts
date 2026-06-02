import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { toast } from '@/hooks/use-toast';
import {
  acceptPatientDashboardQuote,
  getPatientDashboardHomeSummary,
  listPatientCaseDocuments,
  listPatientDashboardQuotes,
  rejectPatientDashboardQuote,
} from '@/services/api/patient-dashboard';

export const patientDashboardKeys = {
  all: (patientScope: string) => ['patient-dashboard', patientScope] as const,
  home: (patientScope: string, locale: string) => [...patientDashboardKeys.all(patientScope), 'home', locale] as const,
  quotes: (patientScope: string, locale: string) => [...patientDashboardKeys.all(patientScope), 'quotes', locale] as const,
  caseDocuments: (patientScope: string, caseId: string, locale: string) => [...patientDashboardKeys.all(patientScope), 'case-documents', caseId, locale] as const,
};

export function usePatientDashboardHome() {
  const { patient } = usePatientAuth();
  const { currentLanguage } = useLanguage();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: [...patientDashboardKeys.home(patientScope, currentLanguage.apiCode), patient?.caseId ?? 'no-case'],
    queryFn: () => getPatientDashboardHomeSummary(patient?.caseId ?? null, currentLanguage.apiCode),
  });
}

export function usePatientDashboardQuotes() {
  const { patient } = usePatientAuth();
  const { currentLanguage } = useLanguage();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: patientDashboardKeys.quotes(patientScope, currentLanguage.apiCode),
    queryFn: () => listPatientDashboardQuotes(currentLanguage.apiCode),
  });
}

export function usePatientCaseDocuments(caseId: string | null, options?: { enabled?: boolean }) {
  const { patient } = usePatientAuth();
  const { currentLanguage } = useLanguage();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: caseId ? patientDashboardKeys.caseDocuments(patientScope, caseId, currentLanguage.apiCode) : [...patientDashboardKeys.all(patientScope), 'case-documents', 'idle', currentLanguage.apiCode],
    queryFn: async () => {
      if (!caseId) {
        throw new Error('Case id is required');
      }

      return listPatientCaseDocuments(caseId, currentLanguage.apiCode);
    },
    enabled: Boolean(caseId) && (options?.enabled ?? true),
  });
}

export function useAcceptPatientDashboardQuote() {
  const { patient } = usePatientAuth();
  const { currentLanguage, t } = useLanguage();
  const queryClient = useQueryClient();
  const patientScope = patient?.id ?? 'anonymous';

  return useMutation({
    mutationFn: acceptPatientDashboardQuote,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: patientDashboardKeys.home(patientScope, currentLanguage.apiCode) }),
        queryClient.invalidateQueries({ queryKey: patientDashboardKeys.quotes(patientScope, currentLanguage.apiCode) }),
      ]);
    },
    onError: (error) => {
      toast({
        title: t('dashboard.quotes.unavailableTitle'),
        description: error instanceof Error ? error.message : t('dashboard.quotes.unavailableFallback'),
        variant: 'destructive',
      });
    },
  });
}

export function useRejectPatientDashboardQuote() {
  const { patient } = usePatientAuth();
  const { currentLanguage, t } = useLanguage();
  const queryClient = useQueryClient();
  const patientScope = patient?.id ?? 'anonymous';

  return useMutation({
    mutationFn: rejectPatientDashboardQuote,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: patientDashboardKeys.home(patientScope, currentLanguage.apiCode) }),
        queryClient.invalidateQueries({ queryKey: patientDashboardKeys.quotes(patientScope, currentLanguage.apiCode) }),
      ]);
    },
    onError: (error) => {
      toast({
        title: t('dashboard.quotes.unavailableTitle'),
        description: error instanceof Error ? error.message : t('dashboard.quotes.unavailableFallback'),
        variant: 'destructive',
      });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  home: (patientScope: string) => [...patientDashboardKeys.all(patientScope), 'home'] as const,
  quotes: (patientScope: string) => [...patientDashboardKeys.all(patientScope), 'quotes'] as const,
  caseDocuments: (patientScope: string, caseId: string) => [...patientDashboardKeys.all(patientScope), 'case-documents', caseId] as const,
};

export function usePatientDashboardHome() {
  const { patient } = usePatientAuth();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: [...patientDashboardKeys.home(patientScope), patient?.caseId ?? 'no-case'],
    queryFn: () => getPatientDashboardHomeSummary(patient?.caseId ?? null),
  });
}

export function usePatientDashboardQuotes() {
  const { patient } = usePatientAuth();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: patientDashboardKeys.quotes(patientScope),
    queryFn: listPatientDashboardQuotes,
  });
}

export function usePatientCaseDocuments(caseId: string | null, options?: { enabled?: boolean }) {
  const { patient } = usePatientAuth();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: caseId ? patientDashboardKeys.caseDocuments(patientScope, caseId) : [...patientDashboardKeys.all(patientScope), 'case-documents', 'idle'],
    queryFn: async () => {
      if (!caseId) {
        throw new Error('Case id is required');
      }

      return listPatientCaseDocuments(caseId);
    },
    enabled: Boolean(caseId) && (options?.enabled ?? true),
  });
}

export function useAcceptPatientDashboardQuote() {
  const { patient } = usePatientAuth();
  const queryClient = useQueryClient();
  const patientScope = patient?.id ?? 'anonymous';

  return useMutation({
    mutationFn: acceptPatientDashboardQuote,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: patientDashboardKeys.home(patientScope) }),
        queryClient.invalidateQueries({ queryKey: patientDashboardKeys.quotes(patientScope) }),
      ]);
    },
    onError: (error) => {
      toast({
        title: 'Quote action failed',
        description: error instanceof Error ? error.message : 'Failed to accept quote.',
        variant: 'destructive',
      });
    },
  });
}

export function useRejectPatientDashboardQuote() {
  const { patient } = usePatientAuth();
  const queryClient = useQueryClient();
  const patientScope = patient?.id ?? 'anonymous';

  return useMutation({
    mutationFn: rejectPatientDashboardQuote,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: patientDashboardKeys.home(patientScope) }),
        queryClient.invalidateQueries({ queryKey: patientDashboardKeys.quotes(patientScope) }),
      ]);
    },
    onError: (error) => {
      toast({
        title: 'Quote action failed',
        description: error instanceof Error ? error.message : 'Failed to reject quote.',
        variant: 'destructive',
      });
    },
  });
}

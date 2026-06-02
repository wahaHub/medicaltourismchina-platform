import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { toast } from '@/hooks/use-toast';
import { patientPhase2Api } from '@/services/api/patient-phase2';
import type {
  CreatePatientOrderInput,
  CreatePatientTicketInput,
  PatientTicketStatus,
  PatientTicketType,
  ReplyToPatientTicketInput,
} from '@/types/patient-phase2';

export const patientPhase2Keys = {
  all: (patientScope: string) => ['patient-phase2', patientScope] as const,
  locale: (patientScope: string, locale: string) => [...patientPhase2Keys.all(patientScope), locale] as const,
  cases: (patientScope: string, locale: string) => [...patientPhase2Keys.locale(patientScope, locale), 'cases'] as const,
  tickets: (patientScope: string, locale: string) => [...patientPhase2Keys.locale(patientScope, locale), 'tickets'] as const,
  ticketList: (
    patientScope: string,
    locale: string,
    input: { page?: number; limit?: number; status?: PatientTicketStatus; type?: PatientTicketType },
  ) => [...patientPhase2Keys.tickets(patientScope, locale), 'list', input.page ?? 1, input.limit ?? 20, input.status ?? 'all', input.type ?? 'all'] as const,
  ticketDetail: (patientScope: string, locale: string, ticketId: string) => [...patientPhase2Keys.tickets(patientScope, locale), 'detail', ticketId] as const,
  orders: (patientScope: string, locale: string) => [...patientPhase2Keys.locale(patientScope, locale), 'orders'] as const,
  orderList: (patientScope: string, locale: string, page = 1, limit = 50) => [...patientPhase2Keys.orders(patientScope, locale), 'list', page, limit] as const,
  orderDetail: (patientScope: string, locale: string, orderId: string) => [...patientPhase2Keys.orders(patientScope, locale), 'detail', orderId] as const,
  packages: (patientScope: string, locale: string) => [...patientPhase2Keys.locale(patientScope, locale), 'packages'] as const,
  packageList: (patientScope: string, locale: string, page = 1, limit = 50) => [...patientPhase2Keys.packages(patientScope, locale), 'list', page, limit] as const,
  packageDetail: (patientScope: string, locale: string, packageId: string) => [...patientPhase2Keys.packages(patientScope, locale), 'detail', packageId] as const,
  journey: (patientScope: string, locale: string, caseId: string) => [...patientPhase2Keys.locale(patientScope, locale), 'journey', caseId] as const,
  milestones: (patientScope: string, locale: string, caseId: string) => [...patientPhase2Keys.locale(patientScope, locale), 'milestones', caseId] as const,
  aiSummary: (patientScope: string, locale: string, caseId: string) => [...patientPhase2Keys.locale(patientScope, locale), 'ai-summary', caseId] as const,
};

export function usePatientTickets(input: {
  page?: number;
  limit?: number;
  status?: PatientTicketStatus;
  type?: PatientTicketType;
} = {}) {
  const { patient } = usePatientAuth();
  const { currentLanguage } = useLanguage();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: patientPhase2Keys.ticketList(patientScope, currentLanguage.apiCode, input),
    queryFn: () => patientPhase2Api.listPatientTickets({ ...input, locale: currentLanguage.apiCode }),
  });
}

export function usePatientCases() {
  const { patient } = usePatientAuth();
  const { currentLanguage } = useLanguage();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: patientPhase2Keys.cases(patientScope, currentLanguage.apiCode),
    queryFn: () => patientPhase2Api.listPatientCases(currentLanguage.apiCode),
  });
}

export function usePatientTicket(ticketId: string | null) {
  const { patient } = usePatientAuth();
  const { currentLanguage } = useLanguage();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: ticketId ? patientPhase2Keys.ticketDetail(patientScope, currentLanguage.apiCode, ticketId) : [...patientPhase2Keys.tickets(patientScope, currentLanguage.apiCode), 'detail', 'idle'],
    queryFn: async () => {
      if (!ticketId) {
        throw new Error('Ticket id is required');
      }

      return patientPhase2Api.getPatientTicket(ticketId, currentLanguage.apiCode);
    },
    enabled: Boolean(ticketId),
  });
}

export function useCreatePatientTicket() {
  const { patient } = usePatientAuth();
  const { currentLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const patientScope = patient?.id ?? 'anonymous';

  return useMutation({
    mutationFn: (input: CreatePatientTicketInput) => patientPhase2Api.createPatientTicket(input),
    onSuccess: async (ticket) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.cases(patientScope, currentLanguage.apiCode) }),
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.tickets(patientScope, currentLanguage.apiCode) }),
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.all(patientScope) }),
      ]);

      queryClient.setQueryData(patientPhase2Keys.ticketDetail(patientScope, currentLanguage.apiCode, ticket.id), {
        ticket,
        replies: [],
      });
    },
    onError: (error) => {
      toast({
        title: 'Ticket creation failed',
        description: error instanceof Error ? error.message : 'Failed to create ticket.',
        variant: 'destructive',
      });
    },
  });
}

export function useReplyToPatientTicket() {
  const { patient } = usePatientAuth();
  const { currentLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const patientScope = patient?.id ?? 'anonymous';

  return useMutation({
    mutationFn: (input: ReplyToPatientTicketInput) => patientPhase2Api.replyToPatientTicket(input),
    onSuccess: async (reply) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.ticketDetail(patientScope, currentLanguage.apiCode, reply.ticketId) }),
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.tickets(patientScope, currentLanguage.apiCode) }),
      ]);
    },
    onError: (error) => {
      toast({
        title: 'Ticket reply failed',
        description: error instanceof Error ? error.message : 'Failed to send ticket reply.',
        variant: 'destructive',
      });
    },
  });
}

export function usePatientOrders(input: { page?: number; limit?: number } = {}) {
  const { patient } = usePatientAuth();
  const { currentLanguage } = useLanguage();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: patientPhase2Keys.orderList(patientScope, currentLanguage.apiCode, input.page ?? 1, input.limit ?? 50),
    queryFn: () => patientPhase2Api.listPatientOrders({ ...input, locale: currentLanguage.apiCode }),
  });
}

export function usePatientOrder(orderId: string | null) {
  const { patient } = usePatientAuth();
  const { currentLanguage } = useLanguage();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: orderId ? patientPhase2Keys.orderDetail(patientScope, currentLanguage.apiCode, orderId) : [...patientPhase2Keys.orders(patientScope, currentLanguage.apiCode), 'detail', 'idle'],
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Order id is required');
      }

      return patientPhase2Api.getPatientOrder(orderId, currentLanguage.apiCode);
    },
    enabled: Boolean(orderId),
  });
}

export function useCreatePatientOrder() {
  const { patient } = usePatientAuth();
  const { currentLanguage, t } = useLanguage();
  const queryClient = useQueryClient();
  const patientScope = patient?.id ?? 'anonymous';

  return useMutation({
    mutationFn: (input: CreatePatientOrderInput) => patientPhase2Api.createPatientOrder(input),
    onSuccess: async (order) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.cases(patientScope, currentLanguage.apiCode) }),
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.orders(patientScope, currentLanguage.apiCode) }),
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.all(patientScope) }),
      ]);

      queryClient.setQueryData(patientPhase2Keys.orderDetail(patientScope, currentLanguage.apiCode, order.id), order);
    },
    onError: (error) => {
      toast({
        title: t('dashboard.orders.createFailedTitle'),
        description: error instanceof Error ? error.message : t('dashboard.orders.createFailedFallback'),
        variant: 'destructive',
      });
    },
  });
}

export function useCreatePatientPaymentIntent() {
  const { patient } = usePatientAuth();
  const { currentLanguage, t } = useLanguage();
  const queryClient = useQueryClient();
  const patientScope = patient?.id ?? 'anonymous';

  return useMutation({
    mutationFn: (orderId: string) => patientPhase2Api.createPatientPaymentIntent(orderId),
    onSuccess: async (intent) => {
      await queryClient.invalidateQueries({ queryKey: patientPhase2Keys.orderDetail(patientScope, currentLanguage.apiCode, intent.orderId) });
      toast({
        title: t('dashboard.orders.paymentPreparedTitle'),
        description: t('dashboard.orders.paymentPreparedDesc', { orderId: intent.orderId }),
      });
    },
    onError: (error) => {
      toast({
        title: t('dashboard.orders.paymentFailedTitle'),
        description: error instanceof Error ? error.message : t('dashboard.orders.paymentFailedFallback'),
        variant: 'destructive',
      });
    },
  });
}

export function usePatientPackages(input: { page?: number; limit?: number; enabled?: boolean } = {}) {
  const { patient } = usePatientAuth();
  const { currentLanguage } = useLanguage();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: patientPhase2Keys.packageList(patientScope, currentLanguage.apiCode, input.page ?? 1, input.limit ?? 50),
    queryFn: () => patientPhase2Api.listPatientPackages({
      page: input.page,
      limit: input.limit,
      locale: currentLanguage.apiCode,
    }),
    enabled: input.enabled ?? true,
  });
}

export function usePatientPackage(packageId: string | null) {
  const { patient } = usePatientAuth();
  const { currentLanguage } = useLanguage();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: packageId ? patientPhase2Keys.packageDetail(patientScope, currentLanguage.apiCode, packageId) : [...patientPhase2Keys.packages(patientScope, currentLanguage.apiCode), 'detail', 'idle'],
    queryFn: async () => {
      if (!packageId) {
        throw new Error('Package id is required');
      }

      return patientPhase2Api.getPatientPackage(packageId, currentLanguage.apiCode);
    },
    enabled: Boolean(packageId),
  });
}

export function usePatientJourney(caseId: string | null) {
  const { patient } = usePatientAuth();
  const { currentLanguage } = useLanguage();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: caseId ? patientPhase2Keys.journey(patientScope, currentLanguage.apiCode, caseId) : [...patientPhase2Keys.locale(patientScope, currentLanguage.apiCode), 'journey', 'idle'],
    queryFn: async () => {
      if (!caseId) {
        throw new Error('Case id is required');
      }

      return patientPhase2Api.getPatientJourney(caseId, currentLanguage.apiCode);
    },
    enabled: Boolean(caseId),
  });
}

export function usePatientJourneyMilestones(caseId: string | null) {
  const { patient } = usePatientAuth();
  const { currentLanguage } = useLanguage();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: caseId ? patientPhase2Keys.milestones(patientScope, currentLanguage.apiCode, caseId) : [...patientPhase2Keys.locale(patientScope, currentLanguage.apiCode), 'milestones', 'idle'],
    queryFn: async () => {
      if (!caseId) {
        throw new Error('Case id is required');
      }

      return patientPhase2Api.listPatientMilestones(caseId, currentLanguage.apiCode);
    },
    enabled: Boolean(caseId),
  });
}

export function usePatientAiSummary(caseId: string | null) {
  const { patient } = usePatientAuth();
  const { currentLanguage } = useLanguage();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: caseId ? patientPhase2Keys.aiSummary(patientScope, currentLanguage.apiCode, caseId) : [...patientPhase2Keys.locale(patientScope, currentLanguage.apiCode), 'ai-summary', 'idle'],
    queryFn: async () => {
      if (!caseId) {
        throw new Error('Case id is required');
      }

      return patientPhase2Api.getPatientAiSummary(caseId, currentLanguage.apiCode);
    },
    enabled: Boolean(caseId),
  });
}

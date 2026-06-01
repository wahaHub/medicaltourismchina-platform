import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  cases: (patientScope: string) => [...patientPhase2Keys.all(patientScope), 'cases'] as const,
  tickets: (patientScope: string) => [...patientPhase2Keys.all(patientScope), 'tickets'] as const,
  ticketList: (
    patientScope: string,
    input: { page?: number; limit?: number; status?: PatientTicketStatus; type?: PatientTicketType },
  ) => [...patientPhase2Keys.tickets(patientScope), 'list', input.page ?? 1, input.limit ?? 20, input.status ?? 'all', input.type ?? 'all'] as const,
  ticketDetail: (patientScope: string, ticketId: string) => [...patientPhase2Keys.tickets(patientScope), 'detail', ticketId] as const,
  orders: (patientScope: string) => [...patientPhase2Keys.all(patientScope), 'orders'] as const,
  orderList: (patientScope: string, page = 1, limit = 50) => [...patientPhase2Keys.orders(patientScope), 'list', page, limit] as const,
  orderDetail: (patientScope: string, orderId: string) => [...patientPhase2Keys.orders(patientScope), 'detail', orderId] as const,
  packages: (patientScope: string) => [...patientPhase2Keys.all(patientScope), 'packages'] as const,
  packageList: (patientScope: string, page = 1, limit = 50) => [...patientPhase2Keys.packages(patientScope), 'list', page, limit] as const,
  packageDetail: (patientScope: string, packageId: string) => [...patientPhase2Keys.packages(patientScope), 'detail', packageId] as const,
  journey: (patientScope: string, caseId: string) => [...patientPhase2Keys.all(patientScope), 'journey', caseId] as const,
  milestones: (patientScope: string, caseId: string) => [...patientPhase2Keys.all(patientScope), 'milestones', caseId] as const,
  aiSummary: (patientScope: string, caseId: string) => [...patientPhase2Keys.all(patientScope), 'ai-summary', caseId] as const,
};

export function usePatientTickets(input: {
  page?: number;
  limit?: number;
  status?: PatientTicketStatus;
  type?: PatientTicketType;
} = {}) {
  const { patient } = usePatientAuth();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: patientPhase2Keys.ticketList(patientScope, input),
    queryFn: () => patientPhase2Api.listPatientTickets(input),
  });
}

export function usePatientCases() {
  const { patient } = usePatientAuth();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: patientPhase2Keys.cases(patientScope),
    queryFn: patientPhase2Api.listPatientCases,
  });
}

export function usePatientTicket(ticketId: string | null) {
  const { patient } = usePatientAuth();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: ticketId ? patientPhase2Keys.ticketDetail(patientScope, ticketId) : [...patientPhase2Keys.tickets(patientScope), 'detail', 'idle'],
    queryFn: async () => {
      if (!ticketId) {
        throw new Error('Ticket id is required');
      }

      return patientPhase2Api.getPatientTicket(ticketId);
    },
    enabled: Boolean(ticketId),
  });
}

export function useCreatePatientTicket() {
  const { patient } = usePatientAuth();
  const queryClient = useQueryClient();
  const patientScope = patient?.id ?? 'anonymous';

  return useMutation({
    mutationFn: (input: CreatePatientTicketInput) => patientPhase2Api.createPatientTicket(input),
    onSuccess: async (ticket) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.cases(patientScope) }),
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.tickets(patientScope) }),
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.all(patientScope) }),
      ]);

      queryClient.setQueryData(patientPhase2Keys.ticketDetail(patientScope, ticket.id), {
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
  const queryClient = useQueryClient();
  const patientScope = patient?.id ?? 'anonymous';

  return useMutation({
    mutationFn: (input: ReplyToPatientTicketInput) => patientPhase2Api.replyToPatientTicket(input),
    onSuccess: async (reply) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.ticketDetail(patientScope, reply.ticketId) }),
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.tickets(patientScope) }),
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
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: patientPhase2Keys.orderList(patientScope, input.page ?? 1, input.limit ?? 50),
    queryFn: () => patientPhase2Api.listPatientOrders(input),
  });
}

export function usePatientOrder(orderId: string | null) {
  const { patient } = usePatientAuth();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: orderId ? patientPhase2Keys.orderDetail(patientScope, orderId) : [...patientPhase2Keys.orders(patientScope), 'detail', 'idle'],
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Order id is required');
      }

      return patientPhase2Api.getPatientOrder(orderId);
    },
    enabled: Boolean(orderId),
  });
}

export function useCreatePatientOrder() {
  const { patient } = usePatientAuth();
  const queryClient = useQueryClient();
  const patientScope = patient?.id ?? 'anonymous';

  return useMutation({
    mutationFn: (input: CreatePatientOrderInput) => patientPhase2Api.createPatientOrder(input),
    onSuccess: async (order) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.cases(patientScope) }),
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.orders(patientScope) }),
        queryClient.invalidateQueries({ queryKey: patientPhase2Keys.all(patientScope) }),
      ]);

      queryClient.setQueryData(patientPhase2Keys.orderDetail(patientScope, order.id), order);
    },
    onError: (error) => {
      toast({
        title: 'Order creation failed',
        description: error instanceof Error ? error.message : 'Failed to create order.',
        variant: 'destructive',
      });
    },
  });
}

export function useCreatePatientPaymentIntent() {
  const { patient } = usePatientAuth();
  const queryClient = useQueryClient();
  const patientScope = patient?.id ?? 'anonymous';

  return useMutation({
    mutationFn: (orderId: string) => patientPhase2Api.createPatientPaymentIntent(orderId),
    onSuccess: async (intent) => {
      await queryClient.invalidateQueries({ queryKey: patientPhase2Keys.orderDetail(patientScope, intent.orderId) });
      toast({
        title: 'Payment step prepared',
        description: `Payment intent ready for order ${intent.orderId}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Payment step failed',
        description: error instanceof Error ? error.message : 'Failed to prepare payment.',
        variant: 'destructive',
      });
    },
  });
}

export function usePatientPackages(input: { page?: number; limit?: number; enabled?: boolean } = {}) {
  const { patient } = usePatientAuth();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: patientPhase2Keys.packageList(patientScope, input.page ?? 1, input.limit ?? 50),
    queryFn: () => patientPhase2Api.listPatientPackages({
      page: input.page,
      limit: input.limit,
    }),
    enabled: input.enabled ?? true,
  });
}

export function usePatientPackage(packageId: string | null) {
  const { patient } = usePatientAuth();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: packageId ? patientPhase2Keys.packageDetail(patientScope, packageId) : [...patientPhase2Keys.packages(patientScope), 'detail', 'idle'],
    queryFn: async () => {
      if (!packageId) {
        throw new Error('Package id is required');
      }

      return patientPhase2Api.getPatientPackage(packageId);
    },
    enabled: Boolean(packageId),
  });
}

export function usePatientJourney(caseId: string | null) {
  const { patient } = usePatientAuth();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: caseId ? patientPhase2Keys.journey(patientScope, caseId) : [...patientPhase2Keys.all(patientScope), 'journey', 'idle'],
    queryFn: async () => {
      if (!caseId) {
        throw new Error('Case id is required');
      }

      return patientPhase2Api.getPatientJourney(caseId);
    },
    enabled: Boolean(caseId),
  });
}

export function usePatientJourneyMilestones(caseId: string | null) {
  const { patient } = usePatientAuth();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: caseId ? patientPhase2Keys.milestones(patientScope, caseId) : [...patientPhase2Keys.all(patientScope), 'milestones', 'idle'],
    queryFn: async () => {
      if (!caseId) {
        throw new Error('Case id is required');
      }

      return patientPhase2Api.listPatientMilestones(caseId);
    },
    enabled: Boolean(caseId),
  });
}

export function usePatientAiSummary(caseId: string | null) {
  const { patient } = usePatientAuth();
  const patientScope = patient?.id ?? 'anonymous';

  return useQuery({
    queryKey: caseId ? patientPhase2Keys.aiSummary(patientScope, caseId) : [...patientPhase2Keys.all(patientScope), 'ai-summary', 'idle'],
    queryFn: async () => {
      if (!caseId) {
        throw new Error('Case id is required');
      }

      return patientPhase2Api.getPatientAiSummary(caseId);
    },
    enabled: Boolean(caseId),
  });
}

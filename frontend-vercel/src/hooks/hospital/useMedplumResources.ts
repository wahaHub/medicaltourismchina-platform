/**
 * Medplum FHIR Resources Hooks for Hospital
 * 
 * 封装所有 FHIR 资源查询逻辑，基于 Access Policy 自动过滤
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medplum } from '@/lib/medplum';
import type { 
  ServiceRequest, 
  Patient, 
  DocumentReference, 
  Communication,
  Task,
  Appointment,
  Bundle
} from '@medplum/fhirtypes';

/**
 * 获取医院被指派的病例列表
 * 
 * 查询条件：performer=Organization/@auth.organization
 * Access Policy 自动限制到本院
 */
export function useServiceRequests(filters?: {
  progressState?: string[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['serviceRequests', filters],
    queryFn: async () => {
      const params: Record<string, string> = {
        // 基础查询：医院被指派的病例
        'performer': 'Organization/@auth.organization',
        '_include': 'ServiceRequest:subject', // 包含 Patient
        '_sort': '-_lastUpdated',
        '_count': String(filters?.limit || 20),
      };

      if (filters?.offset) {
        params['_offset'] = String(filters.offset);
      }

      // 进度状态过滤
      if (filters?.progressState && filters.progressState.length > 0) {
        params['_tag'] = filters.progressState.map(s => `progress-state|${s}`).join(',');
      }

      // 日期范围过滤
      if (filters?.dateFrom) {
        params['_lastUpdated'] = `ge${filters.dateFrom}`;
      }
      if (filters?.dateTo) {
        params['_lastUpdated'] = `le${filters.dateTo}`;
      }

      const bundle = await medplum.searchResources('ServiceRequest', params) as Bundle;
      
      return {
        serviceRequests: bundle.entry?.filter(e => e.resource?.resourceType === 'ServiceRequest')
          .map(e => e.resource as ServiceRequest) || [],
        patients: bundle.entry?.filter(e => e.resource?.resourceType === 'Patient')
          .map(e => e.resource as Patient) || [],
        total: bundle.total || 0,
      };
    },
  });
}

/**
 * 获取单个 ServiceRequest 详情
 */
export function useServiceRequest(srId: string | undefined) {
  return useQuery({
    queryKey: ['serviceRequest', srId],
    queryFn: async () => {
      if (!srId) throw new Error('ServiceRequest ID is required');
      return await medplum.readResource('ServiceRequest', srId);
    },
    enabled: !!srId,
  });
}

/**
 * 获取 Patient 详情
 */
export function usePatient(patientId: string | undefined) {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      return await medplum.readResource('Patient', patientId);
    },
    enabled: !!patientId,
  });
}

/**
 * 获取文档列表（按类别）
 */
export function useDocumentReferences(
  patientId: string | undefined,
  category: 'clinical' | 'invitation' | 'non-medical'
) {
  return useQuery({
    queryKey: ['documents', patientId, category],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      
      const params = {
        'subject': `Patient/${patientId}`,
        'category': category,
        '_sort': '-date',
        '_count': '50',
      };

      return await medplum.searchResources('DocumentReference', params);
    },
    enabled: !!patientId,
  });
}

/**
 * 获取消息列表
 */
export function useCommunications(patientId: string | undefined) {
  return useQuery({
    queryKey: ['communications', patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      
      const params = {
        'subject': `Patient/${patientId}`,
        '_sort': '_lastUpdated', // 时间正序（最旧在上）
        '_count': '50',
      };

      return await medplum.searchResources('Communication', params);
    },
    enabled: !!patientId,
  });
}

/**
 * 获取任务列表
 */
export function useTasks(srId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', srId],
    queryFn: async () => {
      if (!srId) throw new Error('ServiceRequest ID is required');
      
      const params = {
        'owner': 'Organization/@auth.organization',
        'focus': `ServiceRequest/${srId}`,
        '_sort': '-_lastUpdated',
      };

      return await medplum.searchResources('Task', params);
    },
    enabled: !!srId,
  });
}

/**
 * 获取预约列表
 */
export function useAppointments(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['appointments', dateFrom, dateTo],
    queryFn: async () => {
      const params: Record<string, string> = {
        'actor': 'Organization/@auth.organization',
        '_sort': 'date',
        '_count': '50',
      };

      if (dateFrom) {
        params['date'] = `ge${dateFrom}`;
      }
      if (dateTo) {
        params['date'] = `le${dateTo}`;
      }

      return await medplum.searchResources('Appointment', params);
    },
  });
}

/**
 * 更新 ServiceRequest 进度
 */
export function useUpdateServiceRequestProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      srId, 
      newState,
      note 
    }: { 
      srId: string; 
      newState: string;
      note?: string;
    }) => {
      // 获取当前 SR
      const sr = await medplum.readResource('ServiceRequest', srId);

      // 更新 extension
      const updatedExtensions = [
        ...(sr.extension || []).filter(
          ext => ext.url !== 'https://medicaltourismchina.health/fhir/StructureDefinition/progress-state'
        ),
        {
          url: 'https://medicaltourismchina.health/fhir/StructureDefinition/progress-state',
          valueCode: newState,
        },
      ];

      // 如果有备注，添加到 note
      const updatedNotes = note
        ? [
            ...(sr.note || []),
            {
              text: note,
              time: new Date().toISOString(),
            },
          ]
        : sr.note;

      return await medplum.updateResource({
        ...sr,
        extension: updatedExtensions,
        note: updatedNotes,
      });
    },
    onSuccess: (_, variables) => {
      // 刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['serviceRequest', variables.srId] });
      queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
    },
  });
}

/**
 * 发送消息
 */
export function useSendCommunication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patientId,
      message,
      recipientReference,
    }: {
      patientId: string;
      message: string;
      recipientReference?: string;
    }) => {
      const communication: Communication = {
        resourceType: 'Communication',
        status: 'completed',
        // ⚠️ 不发送 sender 和 subject，由后端/Bot 基于 @auth.organization 自动填充
        ...(recipientReference && {
          recipient: [{ reference: recipientReference }],
        }),
        sent: new Date().toISOString(),
        payload: [{
          contentString: message,
        }],
      };

      return await medplum.createResource(communication);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communications', variables.patientId] });
    },
  });
}

/**
 * 上传邀请函
 */
export function useUploadInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patientId,
      file,
    }: {
      patientId: string;
      file: File;
    }) => {
      // 1. 上传文件到 Medplum Binary
      const binary = await medplum.createBinary(file, file.name, file.type);

      // 2. 创建 DocumentReference
      const docRef: DocumentReference = {
        resourceType: 'DocumentReference',
        status: 'current',
        category: [{
          coding: [{
            system: 'https://medicaltourismchina.health/fhir/CodeSystem/document-category',
            code: 'invitation',
          }],
        }],
        // ⚠️ 不发送 subject 和 author，由后端/Bot 基于 @auth.organization 自动填充
        content: [{
          attachment: {
            url: `Binary/${binary.id}`,
            contentType: file.type,
            title: file.name,
          },
        }],
      };

      return await medplum.createResource(docRef);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['documents', variables.patientId, 'invitation'] 
      });
    },
  });
}

/**
 * 创建预约
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patientId,
      start,
      end,
      serviceType,
      practitionerId,
    }: {
      patientId: string;
      start: string;
      end: string;
      serviceType?: string;
      practitionerId?: string;
    }) => {
      const appointment: Appointment = {
        resourceType: 'Appointment',
        status: 'booked',
        start,
        end,
        ...(serviceType && {
          serviceType: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/service-type',
              code: serviceType,
            }],
          }],
        }),
        participant: [
          {
            actor: { reference: `Patient/${patientId}` },
            status: 'accepted',
          },
          {
            actor: { reference: 'Organization/@auth.organization' },
            status: 'accepted',
          },
          ...(practitionerId
            ? [{
                actor: { reference: `Practitioner/${practitionerId}` },
                status: 'accepted',
              }]
            : []),
        ],
      };

      return await medplum.createResource(appointment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

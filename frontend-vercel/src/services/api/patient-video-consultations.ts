import { crmApiRequest } from './crmApiClient';

export type VideoConsultationStatus =
  | 'PENDING_CONFIRMATION'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export interface PatientVideoConsultation {
  id: string;
  case_id: string | null;
  patient_id: string | null;
  patient_name: string | null;
  room_name: string;
  status: VideoConsultationStatus;
  scheduled_at: string | null;
  title: string | null;
  description: string | null;
  timezone: string | null;
  doctor_id: string | null;
  doctor_name: string | null;
  duration_minutes: number;
  patient_language: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface VideoConsultationDoctor {
  surgeon_id: string;
  name: string;
  title: string | null;
  image_url: string | null;
}

export interface VideoConsultationParticipant {
  id: string;
  consultation_id: string;
  identity: string;
}

export interface VideoConsultationJoinToken {
  success: boolean;
  token: string;
  livekitUrl: string;
  identity: string;
  roomName: string;
}

export interface BookVideoConsultationInput {
  patientId: string;
  patientName?: string | null;
  patientEmail?: string | null;
  caseId?: string;
  scheduledAt?: string;
  doctorId: string;
  doctorName?: string | null;
  title?: string;
  description?: string;
  durationMinutes?: number;
  timezone?: string;
  patientLanguage?: string | null;
}

export const patientVideoConsultationsApi = {
  list: () => crmApiRequest<PatientVideoConsultation[]>('/video-consultations'),

  listDoctors: () => crmApiRequest<VideoConsultationDoctor[]>('/video-consultations/doctors'),

  book: (input: BookVideoConsultationInput) =>
    crmApiRequest<PatientVideoConsultation>('/video-consultations', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  cancel: (id: string) =>
    crmApiRequest<PatientVideoConsultation>(`/video-consultations/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
    }),

  join: (id: string, input: { identity: string; displayName?: string }) =>
    crmApiRequest<VideoConsultationParticipant>(`/video-consultations/${encodeURIComponent(id)}/join`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  leave: (id: string, participantId: string) =>
    crmApiRequest<VideoConsultationParticipant>(`/video-consultations/${encodeURIComponent(id)}/leave`, {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    }),

  getJoinToken: (id: string) =>
    crmApiRequest<VideoConsultationJoinToken>(`/video-consultations/${encodeURIComponent(id)}/token`, {
      method: 'POST',
      body: '{}',
    }),

  // Public guest access (no patient session required)
  getPublicInfo: (id: string) =>
    crmApiRequest<VideoConsultationPublicInfo>(`/video-consultations/${encodeURIComponent(id)}/public-info`),

  guestJoin: (id: string, displayName: string) =>
    crmApiRequest<VideoConsultationGuestJoin>(`/video-consultations/${encodeURIComponent(id)}/guest-join`, {
      method: 'POST',
      body: JSON.stringify({ displayName }),
    }),

  guestLeave: (id: string, participantId: string) =>
    crmApiRequest<{ ok: boolean }>(`/video-consultations/${encodeURIComponent(id)}/guest-leave`, {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    }),
};

export interface VideoConsultationPublicInfo {
  id: string;
  status: VideoConsultationStatus;
  title: string | null;
  doctorName: string | null;
  scheduledAt: string | null;
  durationMinutes: number;
  joinable: boolean;
}

export interface VideoConsultationGuestJoin {
  success: boolean;
  token: string;
  livekitUrl: string;
  identity: string;
  roomName: string;
  participantId: string | null;
}

export type PatientEntryPhase =
  | 'collect-profile'
  | 'select-hospitals'
  | 'messages-ready'
  | 'bootstrap-error';

export type PatientProfileDraft = {
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  country: string;
  whatsapp: string;
  messenger: string;
  department: string;
  departmentCode: string;
  disease: string;
  consultationContext?: string;
  destination: string;
  treatmentTime: string;
};

export type MatchedHospital = {
  id: string;
  name: string;
  city?: string;
  summary?: string;
};

export type PatientConversationSummary = {
  id: string;
  type: 'patient-admin' | 'patient-hospital';
  title: string;
  lastMessagePreview?: string;
  unreadCount?: number;
};

export type SelectHospitalsResult = {
  nextStep: 'messages-ready';
  conversationIds: string[];
  conversations: PatientConversationSummary[];
};

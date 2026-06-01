// Dashboard related types
import type { CaseIntake } from './caseIntake';

export interface DashboardData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  preferred_language: string;
  preferred_currency: string;
  pending_quotes_count: number;
  active_journeys_count: number;
  upcoming_consultations_count: number;
  support_tickets_open_count: number;
  quotes: Array<Quote>;
  consultations: Array<Consultation>;
  medical_journeys: Array<MedicalJourney>;
  support_tickets: Array<SupportTicket>;
  // Case intake fields
  case_intakes: Array<CaseIntake>;
  case_intakes_count: number;
  draft_case_intakes_count: number;
  submitted_case_intakes_count: number;
  under_review_case_intakes_count: number;
  has_active_draft: boolean;
  latest_draft: CaseIntake | null;
}

export interface Quote {
  id: string;
  quote_id: string;
  disease: {
    id: string;
    name: string;
    slug: string;
  };
  status: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  hospital: {
    id: string;
    name: string;
  };
  preferred_date: string;
  status: string;
  questions: string;
  created_at: string;
}

export interface MedicalJourney {
  id: string;
  disease: {
    id: string;
    name: string;
    slug: string;
  };
  hospital: {
    id: string;
    name: string;
    city: string;
    province: string;
  };
  status: string;
  start_date: string;
  end_date: string;
  stages: Array<JourneyStage>;
  created_at: string;
  updated_at: string;
}

export interface JourneyStage {
  id: string;
  stage_name: string;
  status: string;
  start_date: string;
  end_date: string;
  notes: string;
  icon: string;
  sort_order: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}
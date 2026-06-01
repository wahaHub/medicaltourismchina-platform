// Types for Featured Treatments
export interface FeaturedTreatmentCard {
  id: string;
  slug: string;
  name: string;
  treatment_type: string;
  display_order: number;

  // Legacy pricing fields (kept for backward compatibility)
  price_locally?: number;
  price_range?: {
    currency: string;
    min_price: number;
    max_price: number;
    note?: string;
    includes?: string[];
    excludes?: string[];
  };

  // New multi-currency pricing fields
  price_cny?: number;
  price_cny_min?: number;
  price_cny_max?: number;
  price_usd?: number;
  price_usd_min?: number;
  price_usd_max?: number;
  price_eur?: number;
  price_eur_min?: number;
  price_eur_max?: number;

  hero: {
    title: string;
    subtitle?: string;
    description?: string;
  };
  inquiry_count?: number;
  created_at: string;
  updated_at: string;
}

export interface KeyBenefit {
  icon: string;
  title: string;
  subtitle?: string;
  description: string;
}

export interface ProblemSection {
  title: string;
  content: string;
  highlights?: string[];
  emotion_text?: string;
}

export interface SolutionSection {
  title: string;
  content: string;
  key_points?: string[];
}

export interface WhyChooseUsAdvantage {
  type: string;
  title: string;
  content: string;
}

export interface WhyChooseUs {
  title: string;
  advantages: WhyChooseUsAdvantage[];
}

export interface PatientStoryTimeline {
  time: string;
  event: string;
}

export interface PatientStory {
  patient_name: string;
  age?: number;
  condition: string;
  location?: string;
  story: string;
  timeline?: PatientStoryTimeline[];
  testimonial?: string;
  outcome: string;
}

export interface ProcessFlowStep {
  step: number;
  title: string;
  time_range?: string;
  description: string;
  icon?: string;
}

export interface FAQ {
  question: string;
  answer: string;
  tags?: string[];
}

export interface HospitalPartner {
  name: string;
  level?: string;
  specialties?: string[];
  logo_url?: string;
}

export interface FeaturedTreatmentDetail extends FeaturedTreatmentCard {
  key_benefits: KeyBenefit[];
  problem_section?: ProblemSection;
  solution_section?: SolutionSection;
  why_choose_us?: WhyChooseUs;
  patient_stories?: PatientStory[];
  process_flow?: ProcessFlowStep[];
  faqs?: FAQ[];
  suitable_conditions?: string[];
  hospital_partners?: HospitalPartner[];
  meta: {
    title?: string;
    description?: string;
  };
}
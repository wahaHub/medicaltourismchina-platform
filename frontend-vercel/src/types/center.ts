// Medical center/hospital related types

export interface CenterCard {
  id: string;
  slug: string;
  name_official: string;
  display_name: string;
  city: string;
  province: string;
  country_code: string;
  year_founded: number;
  is_3a: boolean;
  serving_languages: string[];
  website_url: string;
  logo_url: string;
  gallery_images: Array<{
    url: string;
    alt: string;
    category: string;
  }>;
  contact_json: {
    city: string;
    email: string;
    phone: string;
    province: string;
    country_code: string;
  };
  badges: Array<{
    code: string;
    label: string;
    url?: string;
  }>;
  locale: string;
  short_desc_md: string;
  facility_summary_md: string;
  patient_journey_md: string;
  faq_data: Array<{
    question: string;
    answer_md: string;
  }>;
}

export interface CenterDetail {
  center: {
    id: string;
    slug: string;
    name: string;
    name_official: string;
    city: string;
    province: string;
    country_code: string;
    website_url: string;
    logo_url: string;
    albums: Array<{
      url: string;
      alt: string;
    }>;
    serving_languages: string[];
  };
  badges: Array<{
    code: string;
    label: string;
    url?: string;
  }>;
  at_a_glance: {
    metrics: {
      year: number;
      annual_surgeries: number;
      inpatients: number;
      beds_total: number;
      evidence_url: string;
    };
    for_disease?: {
      slug: string;
      wait_time: {
        min_days: number;
        max_days: number;
        typical_days: number;
        label: string;
        scope: string;
      };
      wait_time_evidence_url: string;
      est_cost: {
        min: number;
        max: number;
        currency: string;
        label: string;
        scope: string;
      };
      est_cost_evidence_url: string;
    };
  };
  services_for_disease?: Array<{
    dept_label: string;
    title: string;
    blurb_md: string;
    evidence_url: string;
  }>;
  technology: {
    modalities: string[];
    summary_md: string;
  };
  patient_journey_md: string;
  faq: Array<{
    question: string;
    answer_md: string;
  }>;
  references: Array<{
    title: string;
    url: string;
    source_type: string;
    last_checked_at: string;
  }>;
}
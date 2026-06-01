// Disease related types

export interface Disease {
  id: string;
  slug: string;
  name: string;
  snippet?: string;
  name_en?: string;
  description?: string;
  meta?: {
    icd10_count: number;
    procedures_count: number;
    updated_month: string;
  };
}

export interface DiseaseDetail {
  disease: {
    id: string;
    slug: string;
    dept_id: string;
    name: string;
    sections: {
      overview_md?: string;
      care_pathway_md?: string;
      options_md?: string;
      cost_drivers_md?: string;
      quality_safety_md?: string;
      travel_ready_md?: string;
      risks_md?: string;
      faq_intro_md?: string;
      disclaimer_md?: string;
    };
    cta: {
      text: string;
      href: string;
    };
    meta: {
      icd10_codes: string[];
      show_price_range: boolean;
      updated_at: string;
    };
  };
  procedures: Array<{
    slug: string;
    name: string;
    preview_md: string;
  }>;
  faq: Array<{
    id: string;
    question: string;
    answer_md: string;
  }>;
  references: Array<{
    title: string;
    url: string;
    source_type: string;
    last_checked_at: string;
  }>;
  wait_time_estimate?: {
    min_days: number;
    max_days: number;
    typical_days: number;
    conditions_i18n: {
      'zh-CN': string[];
      en: string[];
    };
    notes_i18n: {
      'zh-CN': string;
      en: string;
    };
    supporting_links: string[];
  };
}
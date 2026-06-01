// Procedure related types

export interface SimpleProcedure {
  id: string;
  slug: string;
  name: string;
  name_en?: string;
  description?: string;
  cost_usd?: string;
  waiting_time?: string;
  stay_in_china?: string;
}

export interface ProcedureCard {
  id: string;
  slug: string;
  name: string;
  short_desc: string;
  availability: string;
  modalities: string[];
  price_min_usd: number;
  price_max_usd: number;
  currency: string;
  price_display: string;
  updated_month: string;
  hero_image_url?: string;
  locale: string;
  updated_at: string;
}

export interface ProcedureDetail {
  procedure: {
    id: string;
    slug: string;
    name: string;
    availability: string;
    modalities: string[];
    show_price_range: boolean;
    price_min_usd?: number;
    price_max_usd?: number;
    currency: string;
    legal_reviewed_at?: string;
    hero_title?: string;
    hero_subtitle?: string;
    cta_primary_text?: string;
    cta_primary_href?: string;
    content: {
      what_it_is_md?: string;
      indications_md?: string;
      contraindications_md?: string;
      what_to_expect_md?: string;
      timeline_md?: string;
      why_china_md?: string;
      safety_outcomes_md?: string;
      cost_drivers_md?: string;
      inclusions_md?: string;
      exclusions_md?: string;
      disclaimer_md?: string;
    };
    eligibility_form?: Record<string, any>;
    outcomes_schema?: Record<string, string>;
  };
  page_blocks: Array<{
    block_type: string;
    content: Record<string, any>;
    sort_order: number;
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
}
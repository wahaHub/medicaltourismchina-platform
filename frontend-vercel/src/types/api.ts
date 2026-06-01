// Generic API response types
export interface ApiResponse<T> {
  data: T;
  meta: {
    requested_locale: string;
    resolved_locale: string;
    total?: number;
    total_departments?: number;
    total_diseases?: number;
    is_fallback?: boolean;
    generated_at: string;
    dept?: { slug: string };
    disease?: { slug: string };
    pagination?: {
      limit: number;
      offset: number;
      returned: number;
      total: number;
    };
    compliance?: {
      disclaimer: string;
    };
  };
  links?: Record<string, string>;
}
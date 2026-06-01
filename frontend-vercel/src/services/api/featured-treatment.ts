// API services for Featured Treatments
import { ACTION_API_BASE_URL, API_BASE_URL } from './config';
import type { ApiResponse, FeaturedTreatmentCard, FeaturedTreatmentDetail } from '@/types';

export interface GetFeaturedTreatmentsParams {
  locale?: string;
  limit?: number;
  offset?: number;
  type?: string;
}

export const featuredTreatmentApi = {
  /**
   * Get featured treatments list
   */
  getFeaturedTreatments: async (params: GetFeaturedTreatmentsParams = {}): Promise<ApiResponse<FeaturedTreatmentCard[]>> => {
    const searchParams = new URLSearchParams();
    
    if (params.locale) searchParams.append('locale', params.locale);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.type) searchParams.append('type', params.type);
    
    const url = `${API_BASE_URL}/featured-treatments?${searchParams}`;
    console.log('Fetching featured treatments from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  /**
   * Get featured treatment by slug
   */
  // Default to Chinese to match site default and backend handlers
  getFeaturedTreatmentBySlug: async (slug: string, locale = 'zh'): Promise<ApiResponse<FeaturedTreatmentDetail>> => {
    const url = `${API_BASE_URL}/featured-treatments/${slug}?locale=${locale}`;
    console.log('Fetching featured treatment by slug:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  /**
   * Track featured treatment interaction
   */
  trackFeaturedTreatment: async (slug: string, action = 'view'): Promise<ApiResponse<any>> => {
    const url = `${ACTION_API_BASE_URL}/featured-treatments/${slug}/track`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  /**
   * Get featured treatments by type
   */
  getFeaturedTreatmentsByType: async (type: string, params: Omit<GetFeaturedTreatmentsParams, 'type'> = {}): Promise<ApiResponse<FeaturedTreatmentCard[]>> => {
    const searchParams = new URLSearchParams();
    
    if (params.locale) searchParams.append('locale', params.locale);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    
    const url = `${API_BASE_URL}/featured-treatments/type/${type}?${searchParams}`;
    console.log('Fetching featured treatments by type:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },
};

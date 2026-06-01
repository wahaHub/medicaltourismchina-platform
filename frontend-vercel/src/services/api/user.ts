// User and Dashboard API services
import { supabase } from '@/config/supabaseClient';
import { API_BASE_URL, getAuthHeaders } from './config';
import type { ApiResponse, DashboardData, UserProfile } from '@/types';

export const userApi = {
  // 获取仪表板数据
  async getDashboardData(locale: string = 'en'): Promise<ApiResponse<DashboardData>> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/dashboard_summary?locale=${locale}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Transform the flat dashboard summary into the expected format
    if (result.ok && result.data) {
      // Frontend fallback: if name or phone is missing from DB view,
      // backfill from auth metadata
      let merged: DashboardData = { ...result.data } as DashboardData;
      try {
        if (!merged.first_name || !merged.last_name || !merged.phone || !merged.email) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const metadata = user.user_metadata || {};
            merged = {
              ...merged,
              first_name: merged.first_name || metadata.first_name || metadata.given_name || merged.first_name,
              last_name: merged.last_name || metadata.last_name || metadata.family_name || merged.last_name,
              email: merged.email || user.email || merged.email,
              phone: merged.phone || metadata.phone || merged.phone,
            } as DashboardData;
          }
        }
      } catch (e) {
        console.warn('Failed to backfill dashboard user fields from auth metadata:', e);
      }

      return {
        data: {
          ...merged,
          // Add empty arrays for components that expect them
          quotes: [],
          consultations: [],
          medical_journeys: [],
          support_tickets: []
        },
        meta: {
          requested_locale: locale,
          resolved_locale: locale,
          generated_at: new Date().toISOString()
        }
      };
    }
    
    return result;
  },

  // 更新用户资料
  async updateUserProfile(userData: UserProfile): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const headers = await getAuthHeaders();
      const url = `${API_BASE_URL}/v1/user/profile`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Backend not available for user profile update, using Supabase auth metadata instead:', error);
      
      // Fallback: update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          ...userData,
        }
      });

      if (authError) {
        throw authError;
      }

      return {
        data: { success: true },
        meta: {
          requested_locale: 'en',
          resolved_locale: 'en',
          total: 1,
          generated_at: new Date().toISOString()
        }
      };
    }
  },
};

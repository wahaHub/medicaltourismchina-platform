// API configuration and helper functions
import { supabase } from '@/config/supabaseClient';

export const API_BASE_URL =
  import.meta.env.VITE_CONTENT_API_BASE_URL
  || import.meta.env.VITE_API_BASE_URL
  || 'https://api.medicaltourismchina.health';

export const ACTION_API_BASE_URL =
  import.meta.env.VITE_ACTION_API_BASE_URL
  || import.meta.env.VITE_API_BASE_URL
  || 'https://api.medicaltourismchina.health';

// Helper function to get auth headers
export async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
}

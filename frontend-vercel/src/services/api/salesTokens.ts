// services/api/salesTokens.ts
import { supabase } from '@/config/supabaseClient';

export interface SalesToken {
  id: string;
  token: string;
  created_at: string;
  expires_at: string | null;
  used_at: string | null;
  is_active: boolean;
  case_intake_id: string | null;
  patient_name: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  notes: string | null;
  share_url: string;
}

export interface GenerateTokenRequest {
  expires_in_days?: number;
  notes?: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
}

export interface GenerateTokenResponse {
  token_id: string;
  token: string;
  expires_at: string;
  share_url: string;
}

export interface ValidateTokenResponse {
  is_valid: boolean;
  sales_user_id: string | null;
  sales_name: string | null;
  sales_email: string | null;
  patient_name: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  expires_at: string | null;
}

/**
 * Generate a new sales token (for sales users)
 */
export async function generateSalesToken(
  salesUserId: string,
  options: GenerateTokenRequest = {}
): Promise<GenerateTokenResponse> {
  const { data, error } = await supabase.rpc('generate_sales_token', {
    p_sales_user_id: salesUserId,
    p_expires_in_days: options.expires_in_days || 30,
    p_notes: options.notes || null,
    p_patient_name: options.patient_name || null,
    p_patient_email: options.patient_email || null,
    p_patient_phone: options.patient_phone || null,
  });

  if (error) {
    console.error('Error generating sales token:', error);
    throw new Error(error.message || 'Failed to generate token');
  }

  // RPC returns array, get first item
  const result = Array.isArray(data) ? data[0] : data;
  return result;
}

/**
 * Validate a sales token (for anonymous/authenticated users accessing via token link)
 */
export async function validateSalesToken(token: string): Promise<ValidateTokenResponse> {
  const { data, error } = await supabase.rpc('validate_sales_token', {
    p_token: token,
  });

  if (error) {
    console.error('Error validating sales token:', error);
    return {
      is_valid: false,
      sales_user_id: null,
      sales_name: null,
      sales_email: null,
      patient_name: null,
      patient_email: null,
      patient_phone: null,
      expires_at: null,
    };
  }

  // RPC returns array, get first item
  const result = Array.isArray(data) ? data[0] : data;
  return result || {
    is_valid: false,
    sales_user_id: null,
    sales_name: null,
    sales_email: null,
    patient_name: null,
    patient_email: null,
    patient_phone: null,
    expires_at: null,
  };
}

/**
 * Mark a token as used and link it to a case intake
 */
export async function useSalesToken(token: string, caseIntakeId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('use_sales_token', {
    p_token: token,
    p_case_intake_id: caseIntakeId,
  });

  if (error) {
    console.error('Error using sales token:', error);
    return false;
  }

  return data === true;
}

/**
 * Get all tokens for a sales user (for sales dashboard)
 */
export async function getSalesTokens(salesUserId: string): Promise<SalesToken[]> {
  const { data, error } = await supabase.rpc('get_sales_tokens', {
    p_sales_user_id: salesUserId,
  });

  if (error) {
    console.error('Error fetching sales tokens:', error);
    throw new Error(error.message || 'Failed to fetch tokens');
  }

  return data || [];
}

/**
 * Deactivate a token (for sales users)
 */
export async function deactivateSalesToken(tokenId: string, salesUserId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('deactivate_sales_token', {
    p_token_id: tokenId,
    p_sales_user_id: salesUserId,
  });

  if (error) {
    console.error('Error deactivating sales token:', error);
    return false;
  }

  return data === true;
}

/**
 * Build full share URL with base URL
 */
export function buildShareUrl(token: string): string {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://medorahealth.com';
  return `${baseUrl}/medical-case-intake?token=${token}`;
}

// Procedure API services
import { API_BASE_URL } from './config';
import type { ApiResponse, SimpleProcedure, ProcedureCard, ProcedureDetail } from '@/types';

export const procedureApi = {
  // 根据疾病获取手术列表
  async getProceduresByDisease(diseaseSlug: string, locale: string = 'zh-CN'): Promise<ApiResponse<SimpleProcedure[]>> {
    const response = await fetch(`${API_BASE_URL}/diseases/${diseaseSlug}/procedures?locale=${locale}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch procedures: ${response.status}`);
    }
    
    return response.json();
  },

  // 获取所有手术列表
  async getProcedures(locale: string = 'zh-CN', limit: number = 24, offset: number = 0): Promise<ApiResponse<ProcedureCard[]>> {
    const response = await fetch(`${API_BASE_URL}/procedures?locale=${locale}&limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch procedures: ${response.status}`);
    }
    
    return response.json();
  },

  // 获取手术详情
  // Default to Chinese to match site default and backend handlers
  async getProcedureDetail(procedureSlug: string, locale: string = 'zh'): Promise<ApiResponse<ProcedureDetail>> {
    const response = await fetch(`${API_BASE_URL}/procedures/${procedureSlug}?locale=${locale}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch procedure detail: ${response.status}`);
    }
    
    return response.json();
  },
};

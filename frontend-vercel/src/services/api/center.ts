// Medical Center/Hospital API services
import { API_BASE_URL, getAuthHeaders } from './config';
import type { ApiResponse, CenterCard, CenterDetail } from '@/types';

export const centerApi = {
  // 获取所有医院列表
  async getAllCenters(
    locale: string = 'zh-CN',
    limit: number = 24,
    offset: number = 0
  ): Promise<ApiResponse<CenterCard[]>> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/centers?locale=${locale}&limit=${limit}&offset=${offset}`, {
        headers
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch centers: ${response.status}`);
    }
    
    return response.json();
  },

  // 按科室获取医院列表
  async getCentersByDepartment(
    deptSlug: string,
    locale: string = 'zh-CN',
    limit: number = 24,
    offset: number = 0
  ): Promise<ApiResponse<CenterCard[]>> {
    const url = `${API_BASE_URL}/v1/departments/${deptSlug}/centers?locale=${locale}&limit=${limit}&offset=${offset}`;
    const response = await fetch(url);

    if (!response.ok) {
      // Fallback to all centers if department-specific endpoint fails
      console.warn('Failed to fetch centers by department, falling back to all centers');
      return centerApi.getAllCenters(locale, limit, offset);
    }

    return response.json();
  },

  // 按疾病获取医院列表
  async getCentersForDisease(
    deptSlug: string, 
    diseaseSlug: string, 
    locale: string = 'zh-CN',
    limit: number = 24,
    offset: number = 0
  ): Promise<ApiResponse<CenterCard[]>> {
    const response = await fetch(
      `${API_BASE_URL}/v1/departments/${deptSlug}/diseases/${diseaseSlug}/centers?locale=${locale}&limit=${limit}&offset=${offset}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch centers: ${response.status}`);
    }
    
    return response.json();
  },

  // 获取医院详情
  async getCenterDetail(
    centerSlug: string,
    locale: string = 'zh-CN',
    diseaseSlug?: string
  ): Promise<ApiResponse<CenterDetail>> {
    const url = diseaseSlug 
      ? `${API_BASE_URL}/v1/centers/${centerSlug}?locale=${locale}&disease_slug=${diseaseSlug}`
      : `${API_BASE_URL}/v1/centers/${centerSlug}?locale=${locale}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch center detail: ${response.status}`);
    }
    
    return response.json();
  },
};
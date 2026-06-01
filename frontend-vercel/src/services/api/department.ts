// Department API services
import { API_BASE_URL } from './config';
import type { ApiResponse, Department, DepartmentCapability } from '@/types';

export const departmentApi = {
  // 获取科室列表
  async getDept(locale: string = 'zh-CN'): Promise<ApiResponse<Department[]>> {
    const response = await fetch(`${API_BASE_URL}/departments?locale=${locale}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch departments: ${response.status}`);
    }
    
    return response.json();
  },

  // 获取科室专业能力数据
  async getDepartmentCapability(deptSlug: string, locale: string = 'zh-CN'): Promise<ApiResponse<DepartmentCapability>> {
    const response = await fetch(`${API_BASE_URL}/departments/${deptSlug}/capability?locale=${locale}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch department capability: ${response.status}`);
    }
    
    return response.json();
  },
};
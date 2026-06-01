// Disease API services
import { API_BASE_URL } from './config';
import type { ApiResponse, Disease, DiseaseDetail } from '@/types';

export const diseaseApi = {
  // 根据科室获取疾病列表
  async getDiseasesByDepartment(departmentSlug: string, locale: string = 'zh-CN'): Promise<ApiResponse<Disease[]>> {
    const response = await fetch(`${API_BASE_URL}/departments/${departmentSlug}/diseases?locale=${locale}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch diseases: ${response.status}`);
    }
    
    return response.json();
  },

  // 获取疾病详情
  async getDiseaseDetail(diseaseSlug: string, locale: string = 'zh-CN'): Promise<ApiResponse<DiseaseDetail>> {
    void diseaseSlug;
    void locale;
    throw new Error('Disease detail is not part of the public migration content API');
  },
};

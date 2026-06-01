// services/api/caseIntakes.ts
import { ACTION_API_BASE_URL, getAuthHeaders } from './config';
import type { CaseIntake, CaseIntakeFormData, CaseIntakeStatus } from '@/types/caseIntake';

export interface CreateCaseIntakeRequest {
  form_data: Partial<CaseIntakeFormData>;
  current_step: number;
  status: CaseIntakeStatus;
}

export interface UpdateCaseIntakeRequest {
  form_data?: Partial<CaseIntakeFormData>;
  current_step?: number;
  status?: CaseIntakeStatus;
}

export interface CaseIntakeResponse {
  ok: boolean;
  data: CaseIntake;
}

export interface CaseIntakesListResponse {
  ok: boolean;
  data: CaseIntake[];
}

/**
 * 获取用户的 case intakes 列表
 */
export async function getCaseIntakes(status?: string[]): Promise<CaseIntakesListResponse> {
  const headers = await getAuthHeaders();
  const queryParams = status?.length ? `?status=${status.join(',')}` : '';

  const response = await fetch(`${ACTION_API_BASE_URL}/case-intakes${queryParams}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch case intakes');
  }

  return response.json();
}

/**
 * 获取用户当前的 case intake (draft 优先)
 */
export async function getCurrentCaseIntake(): Promise<CaseIntakeResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${ACTION_API_BASE_URL}/case-intakes/current`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch current case intake');
  }

  return response.json();
}

/**
 * 获取单个 case intake 详情
 */
export async function getCaseIntakeById(id: string): Promise<CaseIntakeResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${ACTION_API_BASE_URL}/case-intakes/${id}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch case intake');
  }

  return response.json();
}

/**
 * 创建新的 case intake
 */
export async function createCaseIntake(data: CreateCaseIntakeRequest): Promise<CaseIntakeResponse> {
  console.log('[API] createCaseIntake called with data:', data);
  const headers = await getAuthHeaders();
  console.log('[API] Auth headers:', JSON.stringify(headers));

  const response = await fetch(`${ACTION_API_BASE_URL}/case-intakes`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  console.log('[API] Response status:', response.status);

  if (!response.ok) {
    const error = await response.json();
    console.error('[API] createCaseIntake error:', error);
    throw new Error(error.error || 'Failed to create case intake');
  }

  const result = await response.json();
  console.log('[API] createCaseIntake result:', result);
  return result;
}

/**
 * 更新 case intake (保存草稿或提交)
 */
export async function updateCaseIntake(
  id: string,
  data: UpdateCaseIntakeRequest
): Promise<CaseIntakeResponse> {
  console.log('[API] updateCaseIntake called with id:', id, 'data:', data);
  const headers = await getAuthHeaders();
  console.log('[API] Auth headers:', JSON.stringify(headers));

  const response = await fetch(`${ACTION_API_BASE_URL}/case-intakes/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });

  console.log('[API] Response status:', response.status);

  if (!response.ok) {
    const error = await response.json();
    console.error('[API] updateCaseIntake error:', error);
    throw new Error(error.error || 'Failed to update case intake');
  }

  const result = await response.json();
  console.log('[API] updateCaseIntake result:', result);
  return result;
}

/**
 * 删除 case intake (只能删除 draft 状态)
 */
export async function deleteCaseIntake(id: string): Promise<{ ok: boolean; message: string }> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${ACTION_API_BASE_URL}/case-intakes/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete case intake');
  }

  return response.json();
}

/**
 * Token 模式提交 case intake (不需要认证)
 * 用于 sales token 流程 (Flow B)
 */
export interface TokenSubmitRequest {
  user_id: string;
  form_data: Partial<CaseIntakeFormData>;
  sales_token?: string;
  user_info: {
    first_name?: string;
    last_name?: string;
    name?: string;
    email: string;
    phone?: string;
    whatsapp?: string;
  };
}

export async function createCaseIntakeWithToken(data: TokenSubmitRequest): Promise<CaseIntakeResponse> {
  console.log('[API] createCaseIntakeWithToken called with data:', data);

  const response = await fetch(`${ACTION_API_BASE_URL}/case-intakes/token-submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  console.log('[API] Response status:', response.status);

  if (!response.ok) {
    const error = await response.json();
    console.error('[API] createCaseIntakeWithToken error:', error);
    throw new Error(error.error || 'Failed to create case intake');
  }

  const result = await response.json();
  console.log('[API] createCaseIntakeWithToken result:', result);
  return result;
}

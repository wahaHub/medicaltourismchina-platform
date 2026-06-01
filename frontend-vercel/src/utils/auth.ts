import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = 'https://api.medicaltourismchina.health/busi';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  groups?: string[];
  role?: string;
}

// 获取认证的 fetch 函数，自动添加 Authorization header
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }
    
    return fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error('Failed to make authenticated request:', error);
    throw error;
  }
};

// 获取当前用户信息（从后端）
export const getCurrentUserFromAPI = async (): Promise<User> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/auth/me`);
  if (!response.ok) {
    throw new Error('Failed to get user info');
  }
  return response.json();
};

// 获取用户角色信息
export const getUserRoleFromAPI = async () => {
  const response = await authenticatedFetch(`${API_BASE_URL}/auth/role`);
  if (!response.ok) {
    throw new Error('Failed to get user role');
  }
  return response.json();
};

// 通用的 API 调用函数
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  return authenticatedFetch(url, options);
};

// 获取 Access Token（用于直接 API 调用）
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString() || null;
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
};

// 获取 ID Token（用于用户身份验证）
export const getIdToken = async (): Promise<string | null> => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || null;
  } catch (error) {
    console.error('Failed to get ID token:', error);
    return null;
  }
}; 
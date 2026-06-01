/**
 * Medplum Client Configuration
 *
 * 统一的 Medplum 客户端实例，用于所有 FHIR API 调用和认证
 */

import { ClientStorage, MedplumClient } from '@medplum/core';

// Medplum 服务器配置
const MEDPLUM_BASE_URL = import.meta.env.VITE_MEDPLUM_BASE_URL || 'https://medplum.medicaltourismchina.health';
const MEDPLUM_CLIENT_ID = import.meta.env.VITE_MEDPLUM_CLIENT_ID;

/**
 * 创建 Medplum 客户端单例
 *
 * 注意：clientId 是可选的
 * - 如果使用 Medplum 内置认证，不需要 clientId
 * - 如果使用外部 OAuth，需要 clientId
 */
export const medplum = new MedplumClient({
  baseUrl: MEDPLUM_BASE_URL,
  // clientId 是可选的，如果环境变量中没有配置，则不传递
  ...(MEDPLUM_CLIENT_ID && { clientId: MEDPLUM_CLIENT_ID }),

  // Medplum 期望的是 IClientStorage，而不是原生 localStorage 接口。
  storage: typeof window !== 'undefined' ? new ClientStorage(window.localStorage) : undefined,

  // 自动刷新 token
  autoRefresh: true,

  // 未认证时的回调
  onUnauthenticated: () => {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      console.warn('User unauthenticated, redirecting to login');
      window.location.href = '/login';
    }
  },
});

/**
 * 初始化 Medplum 客户端
 * 在应用启动时调用
 */
export async function initializeMedplum(): Promise<void> {
  try {
    // 检查是否有活动会话
    const profile = medplum.getProfile();

    if (profile) {
      console.log('Active Medplum session found:', profile.reference);
    } else {
      console.log('No active Medplum session');
    }
  } catch (error) {
    console.error('Error initializing Medplum:', error);
  }
}

/**
 * 检查用户是否已认证
 */
export function isAuthenticated(): boolean {
  try {
    return medplum.getProfile() !== undefined;
  } catch {
    return false;
  }
}

/**
 * 获取当前用户 profile
 */
export function getCurrentProfile() {
  return medplum.getProfile();
}

/**
 * 登出
 */
export async function logout(): Promise<void> {
  try {
    await medplum.signOut();

    // 清除本地存储
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
}

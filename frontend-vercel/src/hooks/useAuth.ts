/**
 * Authentication Hooks
 *
 * 提供认证状态管理和角色检查的 React Hooks
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { medplum, logout as medplumLogout } from '../lib/medplum';
import { getCurrentUserRole, type UserRole } from '../utils/role-router';
import type { ProfileResource } from '@medplum/fhirtypes';

/**
 * 认证状态 Hook
 *
 * @returns {object} 认证状态和方法
 */
export function useAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<ProfileResource | undefined>();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const profile = medplum.getProfile();
        setIsAuthenticated(!!profile);
        setUser(profile);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
        setUser(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // 监听存储变化（多标签页同步）
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await medplumLogout();
      setIsAuthenticated(false);
      setUser(undefined);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate]);

  return {
    isLoading,
    isAuthenticated,
    user,
    logout,
  };
}

/**
 * 用户角色 Hook
 *
 * @returns {object} 用户角色和加载状态
 */
export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadRole = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const userRole = await getCurrentUserRole(medplum);
        setRole(userRole);
      } catch (err) {
        console.error('Error loading user role:', err);
        setError(err as Error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadRole();
  }, []);

  return { role, isLoading, error };
}

/**
 * 路由保护 Hook - 确保用户已登录且角色匹配
 *
 * @param allowedRole - 允许的角色（可选，不指定则只检查登录状态）
 */
export function useRequireAuth(allowedRole?: UserRole) {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { role, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    // 等待加载完成
    if (authLoading || roleLoading) {
      return;
    }

    // 未登录 → 跳转到登录页
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    // 如果指定了允许的角色，检查角色是否匹配
    if (allowedRole && role && role !== allowedRole) {
      console.log(`User role ${role} does not match required role ${allowedRole}, redirecting`);
      navigate(`/${role}`, { replace: true });
      return;
    }
  }, [authLoading, roleLoading, isAuthenticated, role, allowedRole, navigate]);

  return {
    isLoading: authLoading || roleLoading,
    isAuthenticated,
    role,
  };
}

/**
 * 登录表单 Hook
 *
 * @returns {object} 登录方法和状态
 */
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // 调用 Medplum 登录
      const loginResult = await medplum.startLogin({
        email,
        password,
        remember: rememberMe,
      });

      console.log('Login successful:', loginResult);

      // 获取 profile 信息
      const profile = loginResult.profile;

      if (!profile) {
        throw new Error('无法获取用户信息');
      }

      // 导入角色路由工具
      const { getRoleRedirectPath } = await import('../utils/role-router');

      // 根据角色重定向
      const redirectPath = await getRoleRedirectPath(profile.reference, medplum);

      console.log('Redirecting to:', redirectPath);

      navigate(redirectPath, { replace: true });

      return loginResult;

    } catch (err: any) {
      console.error('Login error:', err);

      // 错误处理
      let errorMessage = '登录失败，请稍后再试';

      if (err.outcome?.issue?.[0]?.details?.text) {
        errorMessage = err.outcome.issue[0].details.text;
      } else if (err.message) {
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          errorMessage = '邮箱或密码错误';
        } else if (err.message.includes('403') || err.message.includes('Forbidden')) {
          errorMessage = '账号已被禁用，请联系管理员';
        } else if (err.message.includes('429')) {
          errorMessage = '登录尝试过多，请稍后再试';
        } else if (err.message.includes('Network')) {
          errorMessage = '网络连接失败，请检查网络';
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage);

    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  return {
    login,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

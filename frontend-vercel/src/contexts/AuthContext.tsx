import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { isSupabaseConfigured, supabase, type User as SupabaseUser, type Session } from '../config/supabaseClient';

// 类型定义
interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  role?: string;
  hasPassword?: boolean; // 标记用户是否已设置密码
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider 组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // 从 Supabase 用户信息创建 User 对象
  const createUserFromSupabaseUser = (supabaseUser: SupabaseUser): User => {
    const metadata = supabaseUser.user_metadata || {};
    const appMetadata = supabaseUser.app_metadata || {};
    
    const firstName = metadata.first_name || metadata.given_name;
    const lastName = metadata.last_name || metadata.family_name;
    const fullName = metadata.full_name || metadata.name;

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: fullName || `${firstName || ''} ${lastName || ''}`.trim() || supabaseUser.email || '',
      firstName,
      lastName,
      emailVerified: Boolean(supabaseUser.email_confirmed_at),
      role: appMetadata.role || 'user',
      // has_password 为 false 表示用户是通过 booking request 自动创建的无密码账户
      // 如果 has_password 不存在（undefined），假设用户有密码（老用户或正常注册用户）
      hasPassword: metadata.has_password !== false,
    };
  };

  // 获取当前用户和 session
  const fetchCurrentUser = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setIsAuthenticated(false);
      setSession(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // 获取当前 session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('获取 session 失败:', error);
        setUser(null);
        setIsAuthenticated(false);
        setSession(null);
        return;
      }
      
      if (session?.user) {
        const userData = createUserFromSupabaseUser(session.user);
        setUser(userData);
        setIsAuthenticated(true);
        setSession(session);
        
        console.log('用户已认证:', userData);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setSession(null);
      }
    } catch (error) {
      console.log('用户未认证:', error);
      setUser(null);
      setIsAuthenticated(false);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 登录函数 - 重定向到登录页面
  const login = () => {
    window.location.href = '/auth';
  };

  // 登出函数
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('登出失败:', error);
        return;
      }
      
      setUser(null);
      setIsAuthenticated(false);
      setSession(null);
      console.log('用户已登出');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 监听认证状态变化
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setIsAuthenticated(false);
      setSession(null);
      setIsLoading(false);
      return;
    }

    // 初始化时检查当前用户
    fetchCurrentUser();

    // 监听 Supabase auth 状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              const userData = createUserFromSupabaseUser(session.user);
              setUser(userData);
              setIsAuthenticated(true);
              setSession(session);
              
              console.log('用户登录成功:', userData);
            }
            break;
            
          case 'SIGNED_OUT':
            setUser(null);
            setIsAuthenticated(false);
            setSession(null);
            console.log('用户已登出');
            break;
            
          case 'TOKEN_REFRESHED':
            if (session?.user) {
              const userData = createUserFromSupabaseUser(session.user);
              setUser(userData);
              setSession(session);
              console.log('Token 已刷新');
            }
            break;
            
          default:
            break;
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    session,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook 来使用 AuthContext
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 

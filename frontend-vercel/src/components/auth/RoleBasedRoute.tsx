/**
 * 基于角色的路由组件
 *
 * 确保用户有正确的角色才能访问页面
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRequireAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '../../utils/role-router';

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRole: UserRole;
}

export function RoleBasedRoute({ children, allowedRole }: RoleBasedRouteProps) {
  const { isLoading, isAuthenticated, role } = useRequireAuth(allowedRole);

  // 加载中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // 未登录（已由 useRequireAuth 处理重定向）
  if (!isAuthenticated) {
    return null;
  }

  // 角色不匹配（已由 useRequireAuth 处理重定向）
  if (role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}

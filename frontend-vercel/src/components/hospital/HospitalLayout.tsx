/**
 * Hospital Layout
 * 
 * 医院端通用布局：包含侧边栏导航和顶部栏
 */

import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard,
  FolderOpen,
  Calendar,
  MessageSquare,
  Upload,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HospitalLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: '仪表盘', href: '/hospital', icon: LayoutDashboard },
  { name: '病例列表', href: '/hospital/cases', icon: FolderOpen },
  { name: '预约管理', href: '/hospital/appointments', icon: Calendar },
  { name: '消息中心', href: '/hospital/messages', icon: MessageSquare },
  { name: '批量上传', href: '/hospital/uploads', icon: Upload },
  { name: '设置', href: '/hospital/settings', icon: Settings },
];

export function HospitalLayout({ children }: HospitalLayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 侧边栏 */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">
              医疗旅游 · 医院端
            </h1>
          </div>

          {/* 用户信息 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {user?.display?.[0] || 'H'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.display || '医院工作人员'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.reference?.split('/')[0] || 'Practitioner'}
                </p>
              </div>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/hospital' && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className={cn(
                    'mr-3 h-5 w-5',
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* 登出按钮 */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={logout}
              variant="outline"
              className="w-full justify-start"
            >
              <LogOut className="mr-3 h-5 w-5" />
              登出
            </Button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

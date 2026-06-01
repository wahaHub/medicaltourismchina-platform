/**
 * 统一登录页面
 *
 * 所有角色（Patient, Hospital, Agency, Sales, Admin）使用同一个登录入口
 * 登录后根据用户角色自动路由到对应的仪表盘
 */

import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password, rememberMe);
      // 成功后会自动路由到对应页面
    } catch (error) {
      // 错误已在 useLogin hook 中处理
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Medical Tourism China
          </h1>
          <p className="text-gray-600">医疗旅游服务平台</p>
        </div>

        {/* 登录表单卡片 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">登录</h2>

          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 邮箱 */}
            <div>
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isLoading}
                autoComplete="email"
                className="mt-1"
              />
            </div>

            {/* 密码 */}
            <div>
              <Label htmlFor="password">密码</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 记住我 & 忘记密码 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  记住我
                </Label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                忘记密码？
              </Link>
            </div>

            {/* 登录按钮 */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>

          {/* 注册链接 */}
          <div className="mt-6 text-center text-sm text-gray-600">
            还没有账号？
            <Link
              to="/register"
              className="ml-1 text-blue-600 hover:underline font-medium"
            >
              注册
            </Link>
            <span className="text-gray-400 ml-1">(仅患者)</span>
          </div>
        </div>

        {/* 语言选择器 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <button className="mx-2 hover:text-gray-700 font-medium">中文</button>
          <span className="text-gray-300">|</span>
          <button className="mx-2 hover:text-gray-700">English</button>
        </div>

        {/* 帮助信息 */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>登录即表示您同意我们的</p>
          <div className="mt-1">
            <Link to="/terms" className="hover:text-gray-700 underline">
              服务条款
            </Link>
            <span className="mx-2">和</span>
            <Link to="/privacy" className="hover:text-gray-700 underline">
              隐私政策
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

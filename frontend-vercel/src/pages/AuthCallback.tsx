import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../config/supabaseClient'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!isSupabaseConfigured) {
        navigate('/', { replace: true })
        setLoading(false)
        return
      }
      try {
        // 处理 OAuth 回调
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          // 3秒后重定向到登录页
          setTimeout(() => navigate('/auth'), 3000)
          return
        }

        if (data.session) {
          console.log('Auth successful:', data.session.user)
          // 登录成功，重定向到 dashboard
          navigate('/dashboard')
        } else {
          // 没有会话，重定向到登录页
          navigate('/auth')
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err)
        setError('认证过程中发生意外错误')
        setTimeout(() => navigate('/auth'), 3000)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在验证登录状态...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">登录失败</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">3秒后自动返回登录页...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">登录成功</h1>
        <p className="text-gray-600">正在跳转到控制台...</p>
      </div>
    </div>
  )
}
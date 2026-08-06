import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../config/supabaseClient'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useLanguage } from '../contexts/LanguageContext'

export default function AuthPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }
    // 检查用户是否已登录
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // 用户已登录，重定向到首页或 dashboard
        navigate('/dashboard')
      }
    }
    
    checkUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // 登录成功，重定向到 dashboard
        navigate('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <h2 className="text-xl font-semibold text-gray-900">{t('auth.supabaseNotConfiguredTitle')}</h2>
          <p className="text-sm text-gray-600">{t('auth.supabaseNotConfiguredBody')}</p>
          <a href="/" className="inline-block text-blue-600 underline text-sm">{t('auth.supabaseNotConfiguredHome')}</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.pageTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.pageSubtitle')}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full px-4 py-2 rounded-md',
                input: 'w-full px-3 py-2 border border-gray-300 rounded-md',
              }
            }}
            providers={['google']}
            view="sign_in"
            showLinks={true}
            redirectTo={`${window.location.origin}/auth/callback`}
            localization={{
              variables: {
                sign_in: {
                  email_label: t('auth.emailLabel'),
                  password_label: t('auth.passwordLabel'),
                  button_label: t('auth.signInButton'),
                  loading_button_label: t('auth.signInLoading'),
                  social_provider_text: t('auth.socialProviderText'),
                  link_text: t('auth.alreadyHaveAccount'),
                },
                sign_up: {
                  email_label: t('auth.emailLabel'),
                  password_label: t('auth.passwordLabel'),
                  button_label: t('auth.signUpButton'),
                  loading_button_label: t('auth.signUpLoading'),
                  social_provider_text: t('auth.socialProviderSignUpText'),
                  link_text: t('auth.noAccountYet'),
                },
                forgotten_password: {
                  email_label: t('auth.emailLabel'),
                  button_label: t('auth.sendResetLink'),
                  link_text: t('auth.forgotPassword'),
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}

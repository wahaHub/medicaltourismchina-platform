import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// 已移除 AWS Amplify 配置，现在使用 Supabase

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// 开发环境下导入测试工具
if (import.meta.env.DEV) {
  import('./utils/resetOnboarding');
}

createRoot(document.getElementById("root")!).render(<App />);

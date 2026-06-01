/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_CONTENT_API_BASE_URL: string
  readonly VITE_ACTION_API_BASE_URL: string
  readonly VITE_CRM_API_BASE_URL: string
  readonly VITE_USE_MOCK_DATA: string
  readonly VITE_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

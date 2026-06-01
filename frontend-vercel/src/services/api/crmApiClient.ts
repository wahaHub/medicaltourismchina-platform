const BASE_URL = '/api/patient';
const CONFIGURED_CRM_API_BASE_URL = (import.meta.env.VITE_CRM_API_BASE_URL || '').replace(/\/+$/, '');
const FORCE_PATIENT_PROXY = import.meta.env.VITE_USE_PATIENT_PROXY === 'true';
const PATIENT_SITE_HEADER = 'x-medora-site';
const PATIENT_SITE_VALUE = 'china';

export const RESTORE_TOKEN_STORAGE_KEY = 'china.patient.restoreToken';
const LEGACY_RESTORE_TOKEN_STORAGE_KEY = 'medora.patient.restoreToken';

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isUnauthorizedApiError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 401;
}

type ValidationIssue = {
  path?: string[];
  message?: string;
};

function formatValidationError(details: unknown): string | null {
  if (!Array.isArray(details) || details.length === 0) {
    return null;
  }

  const firstIssue = details[0] as ValidationIssue;
  const firstPath = Array.isArray(firstIssue.path) ? firstIssue.path.join('.') : '';
  const firstMessage = typeof firstIssue.message === 'string' ? firstIssue.message.trim() : '';

  if (firstPath === 'captchaToken') {
    return 'Captcha verification is required. Please refresh and try again.';
  }

  if (firstPath && firstMessage) {
    return `${firstPath}: ${firstMessage}`;
  }

  if (firstMessage) {
    return firstMessage;
  }

  return null;
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function getBrowserHostname() {
  return isBrowser() ? window.location.hostname : '';
}

export function shouldUseSameOriginPatientProxy(hostname = getBrowserHostname()): boolean {
  return FORCE_PATIENT_PROXY || hostname.endsWith('.vercel.app');
}

export function getCrmApiBaseUrl(): string {
  return shouldUseSameOriginPatientProxy() ? '' : CONFIGURED_CRM_API_BASE_URL;
}

export function getCrmApiOrigin(): string {
  const CRM_API_BASE_URL = getCrmApiBaseUrl();
  if (CRM_API_BASE_URL) {
    try {
      return new URL(CRM_API_BASE_URL).origin;
    } catch {
      // Fall back to the current origin if the configured base URL is malformed.
    }
  }

  if (isBrowser()) {
    return window.location.origin;
  }

  return 'http://localhost';
}

export function getStoredRestoreToken() {
  if (!isBrowser()) return null;
  const current = window.localStorage.getItem(RESTORE_TOKEN_STORAGE_KEY);
  if (current) return current;

  const legacy = window.localStorage.getItem(LEGACY_RESTORE_TOKEN_STORAGE_KEY);
  if (legacy) {
    window.localStorage.setItem(RESTORE_TOKEN_STORAGE_KEY, legacy);
    window.localStorage.removeItem(LEGACY_RESTORE_TOKEN_STORAGE_KEY);
  }

  return legacy;
}

export function setStoredRestoreToken(token: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(RESTORE_TOKEN_STORAGE_KEY, token);
}

export function clearStoredRestoreToken() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(RESTORE_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_RESTORE_TOKEN_STORAGE_KEY);
}

export function shouldClearStoredRestoreToken(error: unknown) {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 408 || error.status === 429) return false;
  return error.status >= 400 && error.status < 500;
}

export type PatientSessionWidgetChatTarget = {
  kind: 'CHATBOT_SESSION';
  sessionId: string;
};

export type PatientConversationAssistantMode = 'AI_ACTIVE' | 'HUMAN_TAKEOVER';

export type PatientSessionFormalConversationState = {
  activeConversationId: string | null;
  conversationIds: string[];
  activeAssistantMode: PatientConversationAssistantMode | null;
};

export type PatientSessionJourneySnapshot = {
  currentStage: 'EXPLAIN_PROCESS' | 'COLLECT_MEDICAL_INPUTS' | 'RECOMMENDATION' | 'ONLINE_CONSULT' | 'HUMAN_HANDOFF';
  currentPhase: 'active' | 'pre' | 'post';
};

export type PatientSessionChatbotOrchestrationState = {
  conversationSummary: string;
};

type ApiResponseBody = {
  error?: string;
  message?: string;
  code?: string;
  details?: unknown;
  [key: string]: unknown;
};

type CrmApiRequestOptions = RequestInit & {
  timeoutMs?: number;
};

export async function crmApiRequest<T>(path: string, options: CrmApiRequestOptions = {}): Promise<T> {
  const { timeoutMs, signal: externalSignal, ...requestOptions } = options;
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has(PATIENT_SITE_HEADER)) {
    headers.set(PATIENT_SITE_HEADER, PATIENT_SITE_VALUE);
  }

  const relativePath = path.startsWith('/api/') ? path : `${BASE_URL}${path}`;
  const CRM_API_BASE_URL = getCrmApiBaseUrl();
  const requestUrl = CRM_API_BASE_URL ? `${CRM_API_BASE_URL}${relativePath}` : relativePath;

  const timeoutController = typeof AbortController !== 'undefined' && typeof timeoutMs === 'number'
    ? new AbortController()
    : null;
  const combinedSignal = timeoutController?.signal ?? externalSignal ?? undefined;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  if (timeoutController && timeoutMs > 0) {
    timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

    if (externalSignal) {
      if (externalSignal.aborted) {
        timeoutController.abort();
      } else {
        externalSignal.addEventListener('abort', () => timeoutController.abort(), { once: true });
      }
    }
  }

  let response: Response;

  try {
    response = await fetch(requestUrl, {
      ...requestOptions,
      credentials: 'include',
      headers,
      signal: combinedSignal,
    });
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (timeoutController && timeoutController.signal.aborted && !(externalSignal?.aborted)) {
      throw new ApiError('Request timed out', 408, 'TIMEOUT');
    }

    throw error;
  }

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  const rawBody = await response.text();
  let body: ApiResponseBody = {};

  if (rawBody) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = { message: rawBody };
    }
  }

  if (!response.ok) {
    const validationMessage = formatValidationError(body.details);
    throw new ApiError(
      validationMessage ?? body.error ?? body.message ?? `Request failed: ${response.status}`,
      response.status,
      typeof body.code === 'string' ? body.code : undefined,
      body.details,
    );
  }

  return body as T;
}

export async function crmApiUploadProxy(input: {
  uploadUrl: string;
  file: File;
}): Promise<void> {
  const formData = new FormData();
  formData.append('uploadUrl', input.uploadUrl);
  formData.append('file', input.file, input.file.name);

  await crmApiRequest('/uploads/proxy', {
    method: 'POST',
    body: formData,
  });
}

export type PatientSessionProfile = {
  id?: string;
  patientId?: string;
  caseId?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  age?: string | null;
  gender?: string | null;
  country?: string | null;
  whatsapp?: string | null;
  messenger?: string | null;
  department?: string | null;
  departmentCode?: string | null;
  disease?: string | null;
  consultationContext?: string | null;
  destination?: string | null;
  treatmentTime?: string | null;
  patientCode?: string | null;
  preferredLanguage?: string;
  restoreToken?: string;
  nextStep?: 'select-hospitals' | 'messages-ready';
  selectedHospitalId?: string | null;
  selectedHospitalIds?: string[];
  customHospitalRequest?: string | null;
  widgetChatTarget?: PatientSessionWidgetChatTarget;
  formalConversationState?: PatientSessionFormalConversationState;
  journeySnapshot?: PatientSessionJourneySnapshot;
  chatbotOrchestrationState?: PatientSessionChatbotOrchestrationState;
};

export type PatientSessionProfileUpdate = Partial<Pick<
  PatientSessionProfile,
  | 'name'
  | 'phone'
  | 'age'
  | 'gender'
  | 'country'
  | 'whatsapp'
  | 'messenger'
  | 'department'
  | 'departmentCode'
  | 'disease'
  | 'destination'
  | 'treatmentTime'
>>;

export type VerifyTokenResponse = PatientSessionProfile & {
  patientId: string;
  caseId: string;
  restoreToken: string;
  nextStep: 'select-hospitals' | 'messages-ready';
};

export type PatientSessionBootstrap = VerifyTokenResponse;
export type PatientPasswordLoginResponse = VerifyTokenResponse;

export const crmApi = {
  getMe: () => crmApiRequest<PatientSessionProfile>('/me'),
  updateMe: (profile: PatientSessionProfileUpdate) =>
    crmApiRequest<PatientSessionProfile>('/me', {
      method: 'PATCH',
      body: JSON.stringify(profile),
    }),
  restoreSession: (restoreToken: string) =>
    crmApiRequest<VerifyTokenResponse>('/session/restore', {
      method: 'POST',
      body: JSON.stringify({ restoreToken }),
    }),
  sendMagicLink: (email: string) =>
    crmApiRequest<{ ok: true }>('/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  loginWithPassword: (email: string, password: string) =>
    crmApiRequest<PatientPasswordLoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  verifyToken: (token: string) =>
    crmApiRequest<VerifyTokenResponse>('/verify-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  logout: () =>
    crmApiRequest<{ ok: true }>('/logout', {
      method: 'POST',
    }),
};

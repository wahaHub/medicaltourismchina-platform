import { afterEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { waitFor, render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PatientAuthProvider } from '../PatientAuthContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { ApiError, crmApi } from '@/services/api/crmApiClient';

function AuthProbe() {
  const { patient, isLoading, refreshPatientSession, bootstrapSession, expirePatientSession, loginWithPassword } = usePatientAuth();
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'ok' | 'failed'>('idle');
  const [bootstrapStatus, setBootstrapStatus] = useState<'idle' | 'ok' | 'failed'>('idle');
  const [loginStatus, setLoginStatus] = useState<'idle' | 'ok' | 'failed'>('idle');

  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="patient-id">{String(patient?.id ?? '')}</div>
      <div data-testid="widget-chat-target">{String(patient?.widgetChatTarget?.sessionId ?? '')}</div>
      <div data-testid="active-conversation">{String(patient?.formalConversationState?.activeConversationId ?? '')}</div>
      <div data-testid="active-assistant-mode">{String(patient?.formalConversationState?.activeAssistantMode ?? '')}</div>
      <div data-testid="selected-hospital-ids">{JSON.stringify(patient?.selectedHospitalIds ?? [])}</div>
      <div data-testid="refresh-status">{refreshStatus}</div>
      <div data-testid="bootstrap-status">{bootstrapStatus}</div>
      <div data-testid="login-status">{loginStatus}</div>
      <button
        type="button"
        onClick={async () => {
          await expirePatientSession();
        }}
      >
        expire
      </button>
      <button
        type="button"
        onClick={async () => {
          try {
            await refreshPatientSession();
            setRefreshStatus('ok');
          } catch {
            setRefreshStatus('failed');
          }
        }}
      >
        refresh
      </button>
      <button
        type="button"
        onClick={async () => {
          try {
            await bootstrapSession({
              patientId: 'patient-bootstrap',
              caseId: 'case-bootstrap',
              restoreToken: 'restore-bootstrap',
              nextStep: 'select-hospitals',
            } as never);
            setBootstrapStatus('ok');
          } catch {
            setBootstrapStatus('failed');
          }
        }}
      >
        bootstrap
      </button>
      <button
        type="button"
        onClick={async () => {
          try {
            await loginWithPassword('patient@example.com', 'password-123');
            setLoginStatus('ok');
          } catch {
            setLoginStatus('failed');
          }
        }}
      >
        login
      </button>
    </div>
  );
}

describe('PatientAuthProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderAuthProbe(initialEntries: string[] = ['/dashboard']) {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <PatientAuthProvider>
            <AuthProbe />
          </PatientAuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  it('preserves backend restore state fields on the authenticated patient profile', async () => {
    vi.spyOn(crmApi, 'getMe').mockResolvedValue({
      id: 'patient-1',
      patientId: 'patient-1',
      caseId: 'case-1',
      name: 'Hao Wang',
      email: 'hao@example.com',
      preferredLanguage: 'en',
      nextStep: 'messages-ready',
      selectedHospitalId: 'hospital-2',
      selectedHospitalIds: ['hospital-2'],
      widgetChatTarget: {
        kind: 'CHATBOT_SESSION',
        sessionId: 'widget-chat:patient-1:case-1',
      },
      formalConversationState: {
        activeConversationId: 'conversation-backend-1',
        conversationIds: ['conversation-backend-1', 'conversation-hospital-1'],
        activeAssistantMode: 'AI_ACTIVE',
      },
      chatbotOrchestrationState: {
        conversationSummary: 'Backend summary',
      },
      restoreToken: 'restore-token-1',
    } as never);

    renderAuthProbe();

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('patient-id').textContent).toBe('patient-1');
      expect(screen.getByTestId('widget-chat-target').textContent).toBe('widget-chat:patient-1:case-1');
      expect(screen.getByTestId('active-conversation').textContent).toBe('conversation-backend-1');
      expect(screen.getByTestId('active-assistant-mode').textContent).toBe('AI_ACTIVE');
      expect(screen.getByTestId('selected-hospital-ids').textContent).toBe('["hospital-2"]');
    });
  });

  it('persists the onboarding restore token when bootstrap verifies via /me', async () => {
    window.localStorage.clear();

    vi.spyOn(crmApi, 'getMe').mockResolvedValue({
      id: 'patient-1',
      patientId: 'patient-1',
      caseId: 'case-1',
      name: 'Hao Wang',
      email: 'hao@example.com',
      preferredLanguage: 'en',
      nextStep: 'messages-ready',
      widgetChatTarget: {
        kind: 'CHATBOT_SESSION',
        sessionId: 'widget-chat:patient-1:case-1',
      },
      formalConversationState: {
        activeConversationId: 'conversation-backend-1',
        conversationIds: ['conversation-backend-1'],
        activeAssistantMode: 'AI_ACTIVE',
      },
    } as never);

    renderAuthProbe(['/']);

    fireEvent.click(screen.getByRole('button', { name: 'bootstrap' }));

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-status').textContent).toBe('ok');
      expect(window.localStorage.getItem('china.patient.restoreToken')).toBe('restore-bootstrap');
    });
  });

  it('does not hit /me on anonymous public pages when there is no restore token to recover', async () => {
    window.localStorage.clear();

    const getMeMock = vi.spyOn(crmApi, 'getMe');
    const restoreSessionMock = vi.spyOn(crmApi, 'restoreSession');

    renderAuthProbe(['/']);

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(getMeMock).not.toHaveBeenCalled();
    expect(restoreSessionMock).not.toHaveBeenCalled();
  });

  it('refreshes the patient profile from backend truth without losing orchestration state', async () => {
    const getMeMock = vi.spyOn(crmApi, 'getMe');
    getMeMock.mockResolvedValueOnce({
      id: 'patient-1',
      patientId: 'patient-1',
      caseId: 'case-1',
      name: 'Hao Wang',
      email: 'hao@example.com',
      preferredLanguage: 'en',
      nextStep: 'messages-ready',
      selectedHospitalId: 'hospital-2',
      selectedHospitalIds: ['hospital-2'],
      widgetChatTarget: {
        kind: 'CHATBOT_SESSION',
        sessionId: 'widget-chat:patient-1:case-1',
      },
      formalConversationState: {
        activeConversationId: 'conversation-backend-1',
        conversationIds: ['conversation-backend-1'],
        activeAssistantMode: 'AI_ACTIVE',
      },
      chatbotOrchestrationState: {
        conversationSummary: 'Backend summary',
      },
      restoreToken: 'restore-token-1',
    } as never);
    getMeMock.mockResolvedValue({
      id: 'patient-1',
      patientId: 'patient-1',
      caseId: 'case-1',
      name: 'Hao Wang',
      email: 'hao@example.com',
      preferredLanguage: 'en',
      nextStep: 'messages-ready',
      selectedHospitalId: 'hospital-3',
      selectedHospitalIds: ['hospital-3', 'hospital-4'],
      widgetChatTarget: {
        kind: 'CHATBOT_SESSION',
        sessionId: 'widget-chat:patient-1:case-1',
      },
      formalConversationState: {
        activeConversationId: 'conversation-backend-2',
        conversationIds: ['conversation-backend-2'],
        activeAssistantMode: 'HUMAN_TAKEOVER',
      },
      chatbotOrchestrationState: {
        conversationSummary: 'Backend summary v2',
      },
      restoreToken: 'restore-token-2',
    } as never);

    renderAuthProbe();

    await waitFor(() => {
      expect(screen.getByTestId('patient-id').textContent).toBe('patient-1');
      expect(screen.getByTestId('selected-hospital-ids').textContent).toBe('["hospital-2"]');
    });

    fireEvent.click(screen.getByRole('button', { name: 'refresh' }));

    await waitFor(() => {
      expect(screen.getByTestId('selected-hospital-ids').textContent).toBe('["hospital-3","hospital-4"]');
      expect(screen.getByTestId('active-conversation').textContent).toBe('conversation-backend-2');
      expect(screen.getByTestId('active-assistant-mode').textContent).toBe('HUMAN_TAKEOVER');
    });
  });

  it('surfaces refresh failures so callers do not silently treat stale state as success', async () => {
    const getMeMock = vi.spyOn(crmApi, 'getMe');
    getMeMock.mockResolvedValueOnce({
      id: 'patient-1',
      patientId: 'patient-1',
      caseId: 'case-1',
      name: 'Hao Wang',
      email: 'hao@example.com',
      preferredLanguage: 'en',
      nextStep: 'messages-ready',
      selectedHospitalId: 'hospital-2',
      selectedHospitalIds: ['hospital-2'],
      widgetChatTarget: {
        kind: 'CHATBOT_SESSION',
        sessionId: 'widget-chat:patient-1:case-1',
      },
      formalConversationState: {
        activeConversationId: 'conversation-backend-1',
        conversationIds: ['conversation-backend-1'],
      },
      chatbotOrchestrationState: {
        conversationSummary: 'Backend summary',
      },
      restoreToken: 'restore-token-1',
    } as never);
    getMeMock.mockRejectedValueOnce(new Error('refresh failed'));

    renderAuthProbe();

    await waitFor(() => {
      expect(screen.getByTestId('patient-id').textContent).toBe('patient-1');
    });

    fireEvent.click(screen.getByRole('button', { name: 'refresh' }));

    await waitFor(() => {
      expect(screen.getByTestId('refresh-status').textContent).toBe('failed');
    });
  });

  it('clears the local patient state when refresh returns Unauthorized', async () => {
    const getMeMock = vi.spyOn(crmApi, 'getMe');
    vi.spyOn(crmApi, 'restoreSession').mockRejectedValueOnce(new ApiError('Unauthorized', 401));
    getMeMock.mockResolvedValueOnce({
      id: 'patient-1',
      patientId: 'patient-1',
      caseId: 'case-1',
      name: 'Hao Wang',
      email: 'hao@example.com',
      preferredLanguage: 'en',
      nextStep: 'messages-ready',
      restoreToken: 'restore-token-1',
    } as never);
    getMeMock.mockRejectedValueOnce(new ApiError('Unauthorized', 401));

    renderAuthProbe();

    await waitFor(() => {
      expect(screen.getByTestId('patient-id').textContent).toBe('patient-1');
    });

    fireEvent.click(screen.getByRole('button', { name: 'refresh' }));

    await waitFor(() => {
      expect(screen.getByTestId('refresh-status').textContent).toBe('failed');
      expect(screen.getByTestId('patient-id').textContent).toBe('');
    });
  });

  it('restores the patient session when /me is unauthorized but the restore token is still valid', async () => {
    const getMeMock = vi.spyOn(crmApi, 'getMe');
    const restoreSessionMock = vi.spyOn(crmApi, 'restoreSession');
    getMeMock
      .mockResolvedValueOnce({
        id: 'patient-1',
        patientId: 'patient-1',
        caseId: 'case-1',
        name: 'Hao Wang',
        email: 'hao@example.com',
        preferredLanguage: 'en',
        nextStep: 'messages-ready',
        restoreToken: 'restore-token-1',
      } as never)
      .mockRejectedValueOnce(new ApiError('Unauthorized', 401));
    restoreSessionMock.mockResolvedValueOnce({
      id: 'patient-1',
      patientId: 'patient-1',
      caseId: 'case-1',
      name: 'Restored Hao',
      email: 'hao@example.com',
      preferredLanguage: 'en',
      nextStep: 'messages-ready',
      restoreToken: 'restore-token-2',
    } as never);

    renderAuthProbe();

    await waitFor(() => {
      expect(screen.getByTestId('patient-id').textContent).toBe('patient-1');
    });

    fireEvent.click(screen.getByRole('button', { name: 'refresh' }));

    await waitFor(() => {
      expect(screen.getByTestId('refresh-status').textContent).toBe('ok');
      expect(screen.getByTestId('patient-id').textContent).toBe('patient-1');
    });

    expect(restoreSessionMock).toHaveBeenCalledWith('restore-token-1');
  });

  it('does not resurrect an expired patient session when an in-flight refresh resolves late', async () => {
    let resolveRefresh: ((value: PatientSessionBootstrap) => void) | null = null;
    const getMeMock = vi.spyOn(crmApi, 'getMe');
    getMeMock
      .mockResolvedValueOnce({
        id: 'patient-1',
        patientId: 'patient-1',
        caseId: 'case-1',
        name: 'Hao Wang',
        email: 'hao@example.com',
        preferredLanguage: 'en',
        nextStep: 'messages-ready',
        restoreToken: 'restore-token-1',
      } as never)
      .mockImplementationOnce(() => new Promise((resolve) => {
        resolveRefresh = resolve as (value: PatientSessionBootstrap) => void;
      }));

    renderAuthProbe();

    await waitFor(() => {
      expect(screen.getByTestId('patient-id').textContent).toBe('patient-1');
    });

    fireEvent.click(screen.getByRole('button', { name: 'refresh' }));
    fireEvent.click(screen.getByRole('button', { name: 'expire' }));

    await waitFor(() => {
      expect(screen.getByTestId('patient-id').textContent).toBe('');
    });

    resolveRefresh?.({
      id: 'patient-1',
      patientId: 'patient-1',
      caseId: 'case-1',
      name: 'Recovered Hao',
      email: 'hao@example.com',
      preferredLanguage: 'en',
      nextStep: 'messages-ready',
      restoreToken: 'restore-token-2',
    } as never);

    await waitFor(() => {
      expect(screen.getByTestId('refresh-status').textContent).toBe('failed');
      expect(screen.getByTestId('patient-id').textContent).toBe('');
    });
  });

  it('does not resurrect an expired patient session when onboarding bootstrap resolves late', async () => {
    let resolveRestore: ((value: PatientSessionBootstrap) => void) | null = null;
    vi.spyOn(crmApi, 'getMe')
      .mockResolvedValueOnce({
        id: 'patient-1',
        patientId: 'patient-1',
        caseId: 'case-1',
        name: 'Hao Wang',
        email: 'hao@example.com',
        preferredLanguage: 'en',
        nextStep: 'messages-ready',
        restoreToken: 'restore-token-1',
      } as never)
      .mockRejectedValueOnce(new Error('cookie missing after onboarding'));
    vi.spyOn(crmApi, 'restoreSession').mockImplementationOnce(() => new Promise((resolve) => {
      resolveRestore = resolve as (value: PatientSessionBootstrap) => void;
    }));

    renderAuthProbe();

    await waitFor(() => {
      expect(screen.getByTestId('patient-id').textContent).toBe('patient-1');
    });

    fireEvent.click(screen.getByRole('button', { name: 'bootstrap' }));
    fireEvent.click(screen.getByRole('button', { name: 'expire' }));

    await waitFor(() => {
      expect(screen.getByTestId('patient-id').textContent).toBe('');
    });

    resolveRestore?.({
      id: 'patient-bootstrap',
      patientId: 'patient-bootstrap',
      caseId: 'case-bootstrap',
      name: 'Bootstrap User',
      email: 'bootstrap@example.com',
      preferredLanguage: 'en',
      nextStep: 'select-hospitals',
      restoreToken: 'restore-bootstrap',
    } as never);

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-status').textContent).toBe('failed');
      expect(screen.getByTestId('patient-id').textContent).toBe('');
    });
  });

  it('does not resurrect an expired patient session when password login resolves late', async () => {
    let resolveLogin: ((value: PatientSessionBootstrap) => void) | null = null;
    vi.spyOn(crmApi, 'getMe').mockResolvedValueOnce({
      id: 'patient-1',
      patientId: 'patient-1',
      caseId: 'case-1',
      name: 'Hao Wang',
      email: 'hao@example.com',
      preferredLanguage: 'en',
      nextStep: 'messages-ready',
      restoreToken: 'restore-token-1',
    } as never);
    vi.spyOn(crmApi, 'loginWithPassword').mockImplementationOnce(() => new Promise((resolve) => {
      resolveLogin = resolve as (value: PatientSessionBootstrap) => void;
    }));

    renderAuthProbe();

    await waitFor(() => {
      expect(screen.getByTestId('patient-id').textContent).toBe('patient-1');
    });

    fireEvent.click(screen.getByRole('button', { name: 'login' }));
    fireEvent.click(screen.getByRole('button', { name: 'expire' }));

    await waitFor(() => {
      expect(screen.getByTestId('patient-id').textContent).toBe('');
    });

    resolveLogin?.({
      id: 'patient-login',
      patientId: 'patient-login',
      caseId: 'case-login',
      name: 'Late Login',
      email: 'late@example.com',
      preferredLanguage: 'en',
      nextStep: 'messages-ready',
      restoreToken: 'restore-token-login',
    } as never);

    await waitFor(() => {
      expect(screen.getByTestId('login-status').textContent).toBe('failed');
      expect(screen.getByTestId('patient-id').textContent).toBe('');
    });
  });

  it('does not mark the patient authenticated unless bootstrap establishes a real backend session', async () => {
    vi.spyOn(crmApi, 'getMe').mockRejectedValueOnce(new Error('Unauthorized'));
    vi.spyOn(crmApi, 'restoreSession').mockRejectedValueOnce(new Error('Unauthorized'));

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PatientAuthProvider>
            <AuthProbe />
          </PatientAuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    fireEvent.click(screen.getByRole('button', { name: 'bootstrap' }));

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-status').textContent).toBe('failed');
      expect(screen.getByTestId('patient-id').textContent).toBe('');
    });
  });

  it('bootstraps through /me when the cookie is already available after onboarding', async () => {
    const getMeMock = vi.spyOn(crmApi, 'getMe');
    getMeMock
      .mockResolvedValueOnce({
        id: 'patient-1',
        patientId: 'patient-1',
        caseId: 'case-1',
        restoreToken: 'restore-token-1',
        nextStep: 'messages-ready',
      } as never)
      .mockResolvedValueOnce({
        id: 'patient-bootstrap',
        patientId: 'patient-bootstrap',
        caseId: 'case-bootstrap',
        name: 'Bootstrap User',
        email: 'bootstrap@example.com',
        restoreToken: 'restore-bootstrap',
        nextStep: 'select-hospitals',
      } as never);

    renderAuthProbe();

    await waitFor(() => {
      expect(screen.getByTestId('patient-id').textContent).toBe('patient-1');
    });

    fireEvent.click(screen.getByRole('button', { name: 'bootstrap' }));

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap-status').textContent).toBe('ok');
      expect(screen.getByTestId('patient-id').textContent).toBe('patient-bootstrap');
    });
  });
});

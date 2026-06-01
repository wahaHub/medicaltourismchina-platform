import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import PatientLoginPage from '../PatientLoginPage';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { ApiError, getStoredRestoreToken } from '@/services/api/crmApiClient';

const translations: Record<string, string> = {
  'patientLogin.pageTitle': 'Patient login',
  'patientLogin.magicLinkDescription': 'Use your email to receive a secure sign-in link for this browser.',
  'patientLogin.magicLinkCardTitle': 'Continue with an email sign-in link',
  'patientLogin.magicLinkCardDescription': 'We will send a one-time secure sign-in link to your email address.',
  'patientLogin.magicLinkSubmit': 'Send email sign-in link',
  'patientLogin.magicLinkSubmitting': 'Sending sign-in link...',
  'patientLogin.emailLabel': 'Email',
  'patientLogin.emailPlaceholder': 'name@example.com',
  'patientLogin.backToWebsite': 'Back to website',
  'patientLogin.hospitalPortal': 'Hospital portal',
};

vi.mock('@/hooks/usePatientAuth', () => ({
  usePatientAuth: vi.fn(),
  isPatientSessionRefreshSuperseded: (error: unknown) => error instanceof Error && error.message === 'Patient session refresh superseded',
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => translations[key] ?? key,
  }),
}));

vi.mock('@/services/api/crmApiClient', async () => {
  const actual = await vi.importActual<typeof import('@/services/api/crmApiClient')>('@/services/api/crmApiClient');
  return {
    ...actual,
    getStoredRestoreToken: vi.fn(),
  };
});

function renderPage(initialPath = '/patient-login') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/patient-login" element={<PatientLoginPage />} />
        <Route path="/dashboard" element={<div data-testid="dashboard-page">dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PatientLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStoredRestoreToken).mockReturnValue(null);
  });

  it('verifies remembered patient state before redirecting to dashboard', async () => {
    const refreshPatientSession = vi.fn().mockResolvedValue({});
    vi.mocked(getStoredRestoreToken).mockReturnValue('restore-token-1');
    vi.mocked(usePatientAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      requestMagicLink: vi.fn(),
      loginWithPassword: vi.fn(),
      refreshPatientSession,
      expirePatientSession: vi.fn(),
    } as never);

    renderPage();

    expect(screen.queryByTestId('dashboard-page')).toBeNull();

    await waitFor(() => {
      expect(refreshPatientSession).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('dashboard-page')).toBeTruthy();
    });
  });

  it('expires stale remembered patient state instead of bouncing to dashboard', async () => {
    const authState = {
      isAuthenticated: true,
      isLoading: false,
      requestMagicLink: vi.fn(),
      loginWithPassword: vi.fn(),
      refreshPatientSession: vi.fn().mockRejectedValue(new ApiError('Unauthorized', 401)),
      expirePatientSession: vi.fn().mockImplementation(async () => {
        authState.isAuthenticated = false;
      }),
    };
    vi.mocked(getStoredRestoreToken).mockReturnValue('restore-token-1');
    vi.mocked(usePatientAuth).mockImplementation(() => authState as never);

    renderPage();

    await waitFor(() => {
      expect(authState.expirePatientSession).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('dashboard-page')).toBeNull();
      expect(screen.getByText('Patient login')).toBeTruthy();
    });
  });

  it('allows a fresh login on the same page after a stale remembered session is expired', async () => {
    let tokenValue: string | null = 'restore-token-1';
    const authState = {
      isAuthenticated: true,
      isLoading: false,
      requestMagicLink: vi.fn(),
      loginWithPassword: vi.fn(),
      refreshPatientSession: vi.fn()
        .mockRejectedValueOnce(new ApiError('Unauthorized', 401))
        .mockResolvedValueOnce({}),
      expirePatientSession: vi.fn().mockImplementation(async () => {
        tokenValue = null;
        authState.isAuthenticated = false;
      }),
    };

    vi.mocked(getStoredRestoreToken).mockImplementation(() => tokenValue);
    vi.mocked(usePatientAuth).mockImplementation(() => authState as never);

    const view = renderPage();

    await waitFor(() => {
      expect(authState.expirePatientSession).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Patient login')).toBeTruthy();
    });

    authState.isAuthenticated = true;
    view.rerender(
      <MemoryRouter initialEntries={['/patient-login']}>
        <Routes>
          <Route path="/patient-login" element={<PatientLoginPage />} />
          <Route path="/dashboard" element={<div data-testid="dashboard-page">dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(authState.refreshPatientSession).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('dashboard-page')).toBeTruthy();
    });
  });

  it('redirects to dashboard after a manual sign-in even if an earlier freshness probe failed transiently', async () => {
    vi.mocked(getStoredRestoreToken).mockReturnValue('restore-token-1');
    const authState = {
      isAuthenticated: false,
      isLoading: false,
      requestMagicLink: vi.fn(),
      loginWithPassword: vi.fn(),
      refreshPatientSession: vi.fn().mockRejectedValue(new Error('network down')),
      expirePatientSession: vi.fn(),
    };
    vi.mocked(usePatientAuth).mockImplementation(() => authState as never);

    const view = renderPage();

    await waitFor(() => {
      expect(screen.getByText('Patient login')).toBeTruthy();
    });

    authState.isAuthenticated = true;
    view.rerender(
      <MemoryRouter initialEntries={['/patient-login']}>
        <Routes>
          <Route path="/patient-login" element={<PatientLoginPage />} />
          <Route path="/dashboard" element={<div data-testid="dashboard-page">dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeTruthy();
    });
  });

  it('does not re-check a patient session that was just validated before redirecting', async () => {
    const refreshPatientSession = vi.fn().mockResolvedValue({});
    vi.mocked(usePatientAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      lastSessionValidatedAt: Date.now(),
      requestMagicLink: vi.fn(),
      loginWithPassword: vi.fn(),
      refreshPatientSession,
      expirePatientSession: vi.fn(),
    } as never);

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeTruthy();
    });
    expect(refreshPatientSession).not.toHaveBeenCalled();
  });

  it('shows only the email sign-in link flow and hides password plus hospital portal entrypoints', async () => {
    vi.mocked(usePatientAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      lastSessionValidatedAt: null,
      requestMagicLink: vi.fn(),
      loginWithPassword: vi.fn(),
      refreshPatientSession: vi.fn(),
      expirePatientSession: vi.fn(),
    } as never);

    renderPage();

    expect(screen.getByText('Continue with an email sign-in link')).toBeTruthy();
    expect(screen.getByText('Send email sign-in link')).toBeTruthy();
    expect(screen.queryByText('Password')).toBeNull();
    expect(screen.queryByText('Hospital portal')).toBeNull();
  });
});

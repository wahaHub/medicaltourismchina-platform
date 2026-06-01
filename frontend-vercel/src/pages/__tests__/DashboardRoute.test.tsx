import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardRoute from '../DashboardRoute';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { ApiError, getStoredRestoreToken } from '@/services/api/crmApiClient';

vi.mock('@/hooks/usePatientAuth', () => ({
  usePatientAuth: vi.fn(),
  isPatientSessionRefreshSuperseded: (error: unknown) => error instanceof Error && error.message === 'Patient session refresh superseded',
}));

vi.mock('@/services/api/crmApiClient', async () => {
  const actual = await vi.importActual<typeof import('@/services/api/crmApiClient')>('@/services/api/crmApiClient');
  return {
    ...actual,
    getStoredRestoreToken: vi.fn(),
  };
});

vi.mock('../PatientDashboardEntry', () => ({
  default: ({ hasDashboardToken }: { hasDashboardToken: boolean }) => (
    <div data-testid="patient-dashboard-entry">{hasDashboardToken ? 'token' : 'normal'}</div>
  ),
}));

function renderDashboard(initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/patient-login" element={<div data-testid="patient-login-page">login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('DashboardRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStoredRestoreToken).mockReturnValue(null);
  });

  it('verifies a remembered patient session before rendering the dashboard shell', async () => {
    const refreshPatientSession = vi.fn().mockResolvedValue({});
    vi.mocked(getStoredRestoreToken).mockReturnValue('restore-token-1');
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: { id: 'patient-1' },
      isAuthenticated: true,
      isLoading: false,
      refreshPatientSession,
      expirePatientSession: vi.fn(),
    } as never);

    renderDashboard();

    expect(screen.getByTestId('patient-dashboard-entry').textContent).toBe('normal');

    await waitFor(() => {
      expect(refreshPatientSession).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('patient-dashboard-entry').textContent).toBe('normal');
    });
  });

  it('keeps the dashboard shell visible while an authenticated session is being rechecked', async () => {
    const refreshPatientSession = vi.fn(() => new Promise(() => undefined));
    vi.mocked(getStoredRestoreToken).mockReturnValue('restore-token-1');
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: { id: 'patient-1' },
      isAuthenticated: true,
      isLoading: false,
      refreshPatientSession,
      expirePatientSession: vi.fn(),
    } as never);

    renderDashboard('/dashboard?tab=quotes');

    expect(screen.getByTestId('patient-dashboard-entry').textContent).toBe('normal');

    await waitFor(() => {
      expect(refreshPatientSession).toHaveBeenCalledTimes(1);
    });
  });

  it('expires stale remembered sessions and redirects to patient login', async () => {
    const expirePatientSession = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getStoredRestoreToken).mockReturnValue('restore-token-1');
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: { id: 'patient-1' },
      isAuthenticated: true,
      isLoading: false,
      refreshPatientSession: vi.fn().mockRejectedValue(new ApiError('Unauthorized', 401)),
      expirePatientSession,
    } as never);

    renderDashboard();

    await waitFor(() => {
      expect(expirePatientSession).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('patient-login-page')).toBeTruthy();
    });
  });

  it('redirects to patient login when no session markers remain', () => {
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: null,
      isAuthenticated: false,
      isLoading: false,
      refreshPatientSession: vi.fn(),
      expirePatientSession: vi.fn(),
    } as never);

    renderDashboard();

    expect(screen.getByTestId('patient-login-page')).toBeTruthy();
  });

  it('does not re-verify a patient session that was just validated', async () => {
    const refreshPatientSession = vi.fn().mockResolvedValue({});
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: { id: 'patient-1' },
      isAuthenticated: true,
      isLoading: false,
      lastSessionValidatedAt: Date.now(),
      refreshPatientSession,
      expirePatientSession: vi.fn(),
    } as never);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByTestId('patient-dashboard-entry').textContent).toBe('normal');
    });
    expect(refreshPatientSession).not.toHaveBeenCalled();
  });
});

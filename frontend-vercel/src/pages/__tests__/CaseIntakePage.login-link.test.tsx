import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CaseIntakePage } from '../CaseIntakePage';

vi.mock('@/components/case-intake/CaseIntakeSinglePage', () => ({
  CaseIntakeSinglePage: () => <div>intake form</div>,
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: () => '', currentLanguage: 'en' }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false, isLoading: false }),
}));

vi.mock('@/config/supabaseClient', () => ({
  isSupabaseConfigured: false,
  supabase: {},
}));

vi.mock('@/services/api/salesTokens', () => ({
  validateSalesToken: vi.fn(),
}));

function AuthDestination() {
  const location = useLocation();
  return <div data-testid="auth-location">{`${location.pathname}${location.search}`}</div>;
}

describe('CaseIntakePage login link', () => {
  it('opens the registered auth route with the intake page as return target', () => {
    render(
      <MemoryRouter initialEntries={['/medical-case-intake']}>
        <Routes>
          <Route path="/medical-case-intake" element={<CaseIntakePage />} />
          <Route path="/auth" element={<AuthDestination />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go to Login' }));

    expect(screen.getByTestId('auth-location').textContent).toBe(
      '/auth?returnTo=%2Fmedical-case-intake',
    );
  });
});

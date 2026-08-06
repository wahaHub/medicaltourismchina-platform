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

function PatientLoginDestination() {
  const location = useLocation();
  return <div data-testid="login-location">{`${location.pathname}${location.search}`}</div>;
}

describe('CaseIntakePage login link', () => {
  it('opens the patient email sign-in page', () => {
    render(
      <MemoryRouter initialEntries={['/medical-case-intake']}>
        <Routes>
          <Route path="/medical-case-intake" element={<CaseIntakePage />} />
          <Route path="/patient-login" element={<PatientLoginDestination />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go to Login' }));

    expect(screen.getByTestId('login-location').textContent).toBe('/patient-login');
  });
});

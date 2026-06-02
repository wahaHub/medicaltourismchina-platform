import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import PatientDashboardShell from '../PatientDashboardShell';

vi.mock('@/hooks/usePatientAuth', () => ({
  usePatientAuth: () => ({
    patient: { id: 'patient-1', name: 'Patient One' },
    logout: vi.fn(),
  }),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguage: {
      code: 'en',
      name: 'English',
      flag: '🇺🇸',
      apiCode: 'en',
    },
    t: (key: string) => ({
      'dashboard.shell.patientFallback': 'Patient',
      'dashboard.shell.badge': 'Patient dashboard',
      'dashboard.shell.crmBadge': 'CRM v2',
      'dashboard.shell.caseWorkspace': 'Case workspace',
      'dashboard.shell.home': 'Home',
      'dashboard.shell.quotes': 'Quotes',
      'dashboard.shell.messages': 'Messages',
      'dashboard.shell.tickets': 'Tickets',
      'dashboard.shell.orders': 'Orders',
      'dashboard.shell.journey': 'Journey',
      'dashboard.shell.backHome': 'Back to homepage',
      'dashboard.shell.signOut': 'Sign out',
    }[key] ?? key),
  }),
}));

vi.mock('../HomePage', () => ({
  default: () => <div>Home tab</div>,
}));

vi.mock('../QuotesPage', () => ({ default: () => <div>Quotes tab</div> }));
vi.mock('../MessagesPage', () => ({ default: () => <div>Messages tab</div> }));
vi.mock('../TicketsPage', () => ({ default: () => <div>Tickets tab</div> }));
vi.mock('../OrdersPage', () => ({ default: () => <div>Orders tab</div> }));
vi.mock('../JourneyPage', () => ({ default: () => <div>Journey tab</div> }));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe('PatientDashboardShell', () => {
  it('removes the widget-flow note and offers a homepage button above sign out', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="*"
            element={(
              <>
                <PatientDashboardShell />
                <LocationProbe />
              </>
            )}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText('Use the widget to continue the case flow.')).toBeNull();

    const homeButton = screen.getByRole('button', { name: /back to homepage/i });
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    expect((homeButton.compareDocumentPosition(signOutButton) & Node.DOCUMENT_POSITION_FOLLOWING) > 0).toBe(true);

    await user.click(homeButton);
    expect(screen.getByTestId('location').textContent).toBe('/');
  });
});

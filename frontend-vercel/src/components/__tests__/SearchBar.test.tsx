import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SearchBar from '@/components/SearchBar';
import { departmentApi } from '@/services/api/department';

const navigateMock = vi.fn();
const patientEntryState = vi.hoisted(() => ({
  openWidgetModal: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: () => patientEntryState,
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => ({
      'homepageJourney.eyebrow': 'Start Your Medical Journey',
      'homepageJourney.department': 'Department',
      'homepageJourney.departmentPlaceholder': 'Choose department',
      'homepageJourney.destination': 'Destination',
      'homepageJourney.destinationPlaceholder': 'Choose destination',
      'homepageJourney.search': 'Search',
      'homepageJourney.chatNow': 'Chat Now',
    }[key] ?? key),
    getApiLocale: () => 'en',
  }),
}));

vi.mock('@/services/api/department', () => ({
  departmentApi: {
    getDept: vi.fn(),
  },
}));

vi.mock('@/components/ui/select', () => {
  const React = require('react');
  const SelectContext = React.createContext<((value: string) => void) | null>(null);
  const Select = ({ value, onValueChange, children }: any) => (
    <SelectContext.Provider value={onValueChange}>
      <div data-value={value ?? ''}>{children}</div>
    </SelectContext.Provider>
  );
  const SelectTrigger = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>;
  const SelectContent = ({ children }: any) => <div>{children}</div>;
  const SelectItem = ({ value, children }: any) => {
    const onValueChange = React.useContext(SelectContext);
    return (
      <button type="button" onClick={() => onValueChange?.(value)}>
        {children}
      </button>
    );
  };

  return {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  };
});

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(departmentApi.getDept).mockResolvedValue({
      data: [
        { id: 'dept-1', slug: 'cardiology', name: 'Cardiology', name_en: 'Cardiology' },
        { id: 'dept-2', slug: 'oncology', name: 'Oncology', name_en: 'Oncology' },
      ],
    } as never);
  });

  it('navigates to hospitals filtered by destination only', async () => {
    render(<SearchBar />);

    await waitFor(() => {
      expect(departmentApi.getDept).toHaveBeenCalledWith('en');
    });

    const searchButton = screen.getByRole('button', { name: /search/i }) as HTMLButtonElement;
    expect(searchButton.disabled).toBe(true);

    fireEvent.click(screen.getByText('Cardiology'));
    expect(searchButton.disabled).toBe(true);

    fireEvent.click(screen.getByText('cities.shanghai'));
    expect(searchButton.disabled).toBe(false);

    fireEvent.click(searchButton);

    expect(navigateMock).toHaveBeenCalledWith('/hospitals?city=shanghai');
  });

  it('opens the patient widget in modal mode when Chat Now is clicked', async () => {
    render(<SearchBar />);

    fireEvent.click(screen.getByRole('button', { name: /chat now/i }));

    expect(patientEntryState.openWidgetModal).toHaveBeenCalledTimes(1);
  });

  it('keeps the hero entry copy minimal and uses gradient action buttons', async () => {
    render(<SearchBar />);

    await waitFor(() => {
      expect(departmentApi.getDept).toHaveBeenCalledWith('en');
    });

    expect(screen.queryByText(/find hospitals by destination/i)).toBeNull();
    expect(screen.queryByText(/choose a department for context/i)).toBeNull();

    const searchButton = screen.getByRole('button', { name: /search/i });
    const chatNowButton = screen.getByRole('button', { name: /chat now/i });

    expect(searchButton.className).toContain('bg-[linear-gradient(135deg');
    expect(chatNowButton.className).toContain('bg-[linear-gradient(135deg');
    expect(chatNowButton.className).not.toContain('bg-slate-900');
  });

  it('uses homepage journey i18n keys for the hero search entry copy', async () => {
    render(<SearchBar />);

    expect(screen.getByText('Start Your Medical Journey')).toBeDefined();
    expect(screen.getByText('Department')).toBeDefined();
    expect(screen.getByText('Destination')).toBeDefined();
    expect(screen.getByText('Choose department')).toBeDefined();
    expect(screen.getByText('Choose destination')).toBeDefined();
    expect(screen.getByRole('button', { name: /chat now/i })).toBeDefined();
  });
});

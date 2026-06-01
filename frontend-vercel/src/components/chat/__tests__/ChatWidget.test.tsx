import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ChatWidget from '@/components/chat/ChatWidget';
import { useLanguage } from '@/contexts/LanguageContext';

const patientEntryState = vi.hoisted(() => ({
  isWidgetOpen: false,
  widgetDisplayMode: 'panel',
  openWidget: vi.fn(),
  openWidgetModal: vi.fn(),
  closeWidget: vi.fn(),
}));

const patientAuthState = vi.hoisted(() => ({
  isAuthenticated: false,
}));

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: () => patientEntryState,
}));

vi.mock('@/hooks/usePatientAuth', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

vi.mock('@/components/chat/PatientEntryWindow', () => ({
  default: () => <div data-testid="patient-entry-window">Patient entry window</div>,
}));

describe('ChatWidget display shell', () => {
  const desktopMatchMedia = (matches = false) => vi.fn().mockImplementation(() => ({
    matches,
    media: '(max-width: 767px)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  beforeEach(() => {
    vi.clearAllMocks();
    patientEntryState.isWidgetOpen = false;
    patientEntryState.widgetDisplayMode = 'panel';
    patientAuthState.isAuthenticated = false;
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        apiCode: 'en',
      },
    } as never);
    window.matchMedia = desktopMatchMedia(false);
    patientEntryState.openWidget.mockImplementation(() => {
      patientEntryState.isWidgetOpen = true;
      patientEntryState.widgetDisplayMode = 'panel';
    });
    patientEntryState.openWidgetModal.mockImplementation(() => {
      patientEntryState.isWidgetOpen = true;
      patientEntryState.widgetDisplayMode = 'modal';
    });
    patientEntryState.closeWidget.mockImplementation(() => {
      patientEntryState.isWidgetOpen = false;
      patientEntryState.widgetDisplayMode = 'panel';
    });
  });

  it('hides the floating widget on auth routes', () => {
    render(
      <MemoryRouter initialEntries={['/auth']}>
        <ChatWidget />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('button', { name: /open chat/i })).toBeNull();
    expect(screen.queryByTestId('patient-entry-window')).toBeNull();
  });

  it('opens as a panel, can maximize to modal, then minimize back to panel', () => {
    const view = render(
      <MemoryRouter initialEntries={['/']}>
        <ChatWidget />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /open chat/i }));
    view.rerender(
      <MemoryRouter initialEntries={['/']}>
        <ChatWidget />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('chat-window').getAttribute('data-chat-display-mode')).toBe('panel');
    expect(screen.getByRole('button', { name: /maximize chat/i })).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /maximize chat/i }));
    expect(screen.getByTestId('chat-window').getAttribute('data-chat-display-mode')).toBe('modal');
    expect(patientEntryState.openWidgetModal).toHaveBeenCalledTimes(1);
    expect(patientEntryState.widgetDisplayMode).toBe('modal');
    expect(screen.getByRole('button', { name: /minimize chat/i })).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /minimize chat/i }));
    expect(screen.getByTestId('chat-window').getAttribute('data-chat-display-mode')).toBe('panel');
    expect(patientEntryState.widgetDisplayMode).toBe('panel');
  });

  it('returns modal chat to panel on Escape without closing the widget', () => {
    const view = render(
      <MemoryRouter initialEntries={['/']}>
        <ChatWidget />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /open chat/i }));
    view.rerender(
      <MemoryRouter initialEntries={['/']}>
        <ChatWidget />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /maximize chat/i }));
    expect(screen.getByTestId('chat-window').getAttribute('data-chat-display-mode')).toBe('modal');

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.getByTestId('chat-window').getAttribute('data-chat-display-mode')).toBe('panel');
    expect(screen.queryByRole('button', { name: /open chat/i })).toBeNull();
  });

  it('uses the mobile panel shell without a maximize button', () => {
    window.matchMedia = desktopMatchMedia(true);
    patientEntryState.isWidgetOpen = true;

    render(
      <MemoryRouter initialEntries={['/']}>
        <ChatWidget />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('chat-window').getAttribute('data-chat-display-mode')).toBe('mobile-panel');
    expect(screen.queryByRole('button', { name: /maximize chat/i })).toBeNull();
  });

  it('renders the enlarged modal immediately when context opens the widget in modal mode', () => {
    patientEntryState.isWidgetOpen = true;
    patientEntryState.widgetDisplayMode = 'modal';

    render(
      <MemoryRouter initialEntries={['/']}>
        <ChatWidget />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('chat-window').getAttribute('data-chat-display-mode')).toBe('modal');
    expect(screen.queryByRole('button', { name: /maximize chat/i })).toBeNull();
    expect(screen.getByRole('button', { name: /minimize chat/i })).not.toBeNull();
  });

  it('localizes the bubble trigger and controls in Chinese', () => {
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳',
        apiCode: 'zh',
      },
    } as never);

    const view = render(
      <MemoryRouter initialEntries={['/']}>
        <ChatWidget />
      </MemoryRouter>,
    );

    expect(screen.getByText('聊天')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: '打开聊天窗口' }));
    view.rerender(
      <MemoryRouter initialEntries={['/']}>
        <ChatWidget />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: '放大聊天窗口' })).toBeDefined();
    expect(screen.getByRole('button', { name: '关闭聊天窗口' })).toBeDefined();
  });
});

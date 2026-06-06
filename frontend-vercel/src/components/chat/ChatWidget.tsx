import { useEffect, useLayoutEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Maximize2, MessageCircleMore, Minimize2, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { createChatWidgetTranslator } from './chat-widget-i18n';
import PatientEntryWindow from './PatientEntryWindow';

const HIDDEN_PATTERNS = [
  '/login',
  '/auth',
  '/auth/callback',
  '/hospital',
  '/hospital/',
  '/dashboard/case-intake',
  '/medical-case-intake',
  '/case-intake/',
];

const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

type ChatDisplayMode = 'panel' | 'modal' | 'mobile-panel';

function shouldHideWidget(pathname: string): boolean {
  return HIDDEN_PATTERNS.some((pattern) =>
    pattern.endsWith('/') ? pathname.startsWith(pattern) : pathname === pattern || pathname.startsWith(`${pattern}/`),
  );
}

function readIsMobileViewport(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function getShellClasses(displayMode: ChatDisplayMode): string {
  if (displayMode === 'modal') {
    return 'relative flex h-[min(88dvh,56rem)] w-[min(72rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_34px_120px_rgba(15,23,42,0.28)]';
  }

  if (displayMode === 'mobile-panel') {
    return 'fixed inset-x-3 bottom-3 top-3 z-[9999] flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)] animate-fade-in-up';
  }

  return 'fixed bottom-5 right-5 z-[9999] flex h-[min(84dvh,50rem)] w-[min(38rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)] animate-fade-in-up sm:bottom-6 sm:right-6 sm:w-[min(40rem,calc(100vw-2rem))]';
}

export default function ChatWidget() {
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  const { isAuthenticated: patientIsAuthenticated } = usePatientAuth();
  const { isWidgetOpen, widgetDisplayMode, openWidget, openWidgetModal, closeWidget } = usePatientEntry();
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => readIsMobileViewport());
  const [desktopDisplayMode, setDesktopDisplayMode] = useState<'panel' | 'modal'>('panel');
  const isDashboardPath = location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/');
  const translate = createChatWidgetTranslator(currentLanguage.code);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
    };

    setIsMobileViewport(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (isMobileViewport) {
      setDesktopDisplayMode('panel');
    }
  }, [isMobileViewport]);

  useLayoutEffect(() => {
    if (!isWidgetOpen || isMobileViewport) {
      return;
    }

    setDesktopDisplayMode(widgetDisplayMode);
  }, [isMobileViewport, isWidgetOpen, widgetDisplayMode]);

  if (shouldHideWidget(location.pathname) || (isDashboardPath && !patientIsAuthenticated)) {
    return null;
  }

  const openPanel = () => {
    if (isMobileViewport) {
      setDesktopDisplayMode('panel');
      openWidget();
      return;
    }

    setDesktopDisplayMode('modal');
    openWidgetModal();
  };

  const closeToBubble = () => {
    setDesktopDisplayMode('panel');
    closeWidget();
  };

  const activeDisplayMode: ChatDisplayMode = isMobileViewport ? 'mobile-panel' : desktopDisplayMode;

  if (!isWidgetOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[9998]">
        <Button
          type="button"
          onClick={openPanel}
          size="lg"
          aria-label={translate('chatWidget.openChat')}
          className="h-14 rounded-full bg-teal-600 px-5 text-white shadow-xl shadow-teal-950/20 hover:bg-teal-700"
        >
          <MessageCircleMore className="h-5 w-5" />
          {translate('chatWidget.chat')}
        </Button>
      </div>
    );
  }

  const shell = (
    <div
      className={getShellClasses(activeDisplayMode)}
      data-testid="chat-window"
      data-chat-display-mode={activeDisplayMode}
    >
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        {activeDisplayMode === 'panel' && !isMobileViewport ? (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={() => {
              setDesktopDisplayMode('modal');
              openWidgetModal();
            }}
            className="h-9 w-9 rounded-full shadow-sm"
            aria-label={translate('chatWidget.maximize')}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        ) : null}
        {activeDisplayMode === 'modal' && !isMobileViewport ? (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={() => {
              setDesktopDisplayMode('panel');
              openWidget();
            }}
            className="h-9 w-9 rounded-full shadow-sm"
            aria-label={translate('chatWidget.minimize')}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        ) : null}
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={closeToBubble}
          className="h-9 w-9 rounded-full shadow-sm"
          aria-label={translate('chatWidget.close')}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 bg-slate-50">
        <PatientEntryWindow />
      </div>
    </div>
  );

  if (activeDisplayMode === 'modal') {
    return (
      <Dialog.Root open onOpenChange={(open) => {
        if (!open) {
          setDesktopDisplayMode('panel');
          openWidget();
        }
      }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[10000] bg-slate-950/30" />
          <Dialog.Content
            className="fixed inset-0 z-[10001] flex items-center justify-center p-3 sm:p-6 focus:outline-none"
            aria-label={translate('chatWidget.dialogLabel')}
          >
            {shell}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return shell;
}

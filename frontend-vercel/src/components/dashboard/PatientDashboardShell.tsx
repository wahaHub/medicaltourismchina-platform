import type React from 'react';
import { useMemo } from 'react';
import { FileText, Home, LifeBuoy, LogOut, MessageSquareMore, Route, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { cn } from '@/lib/utils';
import HomePage from './HomePage';
import QuotesPage from './QuotesPage';
import MessagesPage from './MessagesPage';
import TicketsPage from './TicketsPage';
import OrdersPage from './OrdersPage';
import JourneyPage from './JourneyPage';

type DashboardTab = 'home' | 'quotes' | 'messages' | 'tickets' | 'orders' | 'journey';

const VALID_TABS: DashboardTab[] = ['home', 'quotes', 'messages', 'tickets', 'orders', 'journey'];

const NAV_ITEMS: Array<{
  value: DashboardTab;
  labelKey: Parameters<ReturnType<typeof useLanguage>['t']>[0];
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: 'home', labelKey: 'dashboard.shell.home', icon: Home },
  { value: 'quotes', labelKey: 'dashboard.shell.quotes', icon: FileText },
  { value: 'messages', labelKey: 'dashboard.shell.messages', icon: MessageSquareMore },
  { value: 'tickets', labelKey: 'dashboard.shell.tickets', icon: LifeBuoy },
  { value: 'orders', labelKey: 'dashboard.shell.orders', icon: ShoppingBag },
  { value: 'journey', labelKey: 'dashboard.shell.journey', icon: Route },
];

export default function PatientDashboardShell() {
  const { t } = useLanguage();
  const { patient, logout } = usePatientAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const patientLabel = patient?.name || patient?.patientCode || patient?.id || t('dashboard.shell.patientFallback');
  const activeTab = useMemo<DashboardTab>(() => {
    const requested = searchParams.get('tab');

    if (requested && VALID_TABS.includes(requested as DashboardTab)) {
      return requested as DashboardTab;
    }

    return 'home';
  }, [searchParams]);

  const navigateToTab = (tab: DashboardTab, params?: Record<string, string | null | undefined>) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);

    if (tab !== 'tickets') {
      next.delete('compose');
      next.delete('ticketId');
    }

    if (tab !== 'orders') {
      next.delete('orderId');
    }

    if (tab !== 'journey') {
      next.delete('caseId');
    }

    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });

    setSearchParams(next, { replace: true });
  };

  const renderContent = () => (
    <>
      {activeTab === 'home' && <HomePage onNavigateTab={navigateToTab} />}
      {activeTab === 'quotes' && <QuotesPage />}
      {activeTab === 'messages' && <MessagesPage />}
      {activeTab === 'tickets' && <TicketsPage />}
      {activeTab === 'orders' && <OrdersPage />}
      {activeTab === 'journey' && <JourneyPage />}
    </>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_36%),linear-gradient(180deg,_#f8fafc_0%,_#eef8f7_100%)]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white/90 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col gap-5 px-4 py-4 lg:px-5 lg:py-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-teal-100 text-teal-800 hover:bg-teal-100">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  {t('dashboard.shell.badge')}
                </Badge>
                <Badge variant="secondary" className="rounded-full bg-sky-100 text-sky-800 lg:hidden">
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                  {t('dashboard.shell.crmBadge')}
                </Badge>
              </div>
              <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900 lg:text-2xl">
                {patientLabel}
              </h1>
              <p className="mt-1 text-sm text-slate-500 lg:block">
                {t('dashboard.shell.caseWorkspace')}
              </p>
            </div>

            <nav className="-mx-1 flex gap-2 overflow-x-auto pb-1 lg:mx-0 lg:grid lg:gap-1 lg:overflow-visible lg:pb-0">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    className={cn(
                      'inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors lg:w-full lg:justify-start',
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/10'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                    )}
                    onClick={() => navigateToTab(item.value)}
                  >
                    <Icon className="h-4 w-4" />
                    {t(item.labelKey)}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto" />

            <Button variant="outline" className="justify-start gap-2 lg:w-full" onClick={() => navigate('/')}>
              <Home className="h-4 w-4" />
              {t('dashboard.shell.backHome')}
            </Button>
            <Button variant="outline" className="justify-start gap-2 lg:w-full" onClick={() => void logout()}>
              <LogOut className="h-4 w-4" />
              {t('dashboard.shell.signOut')}
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="px-4 py-5 sm:px-6 lg:px-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

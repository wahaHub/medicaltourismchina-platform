import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, Search, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { departmentApi } from '@/services/api/department';

type DepartmentOption = {
  id: string;
  slug: string;
  label: string;
};

const DESTINATION_OPTIONS = [
  { value: 'beijing', translationKey: 'cities.beijing', fallback: 'Beijing' },
  { value: 'shanghai', translationKey: 'cities.shanghai', fallback: 'Shanghai' },
  { value: 'guangzhou', translationKey: 'cities.guangzhou', fallback: 'Guangzhou' },
  { value: 'shenzhen', translationKey: 'cities.shenzhen', fallback: 'Shenzhen' },
  { value: 'chengdu', translationKey: 'cities.chengdu', fallback: 'Chengdu' },
  { value: 'chongqing', translationKey: 'cities.chongqing', fallback: 'Chongqing' },
];

type HomepageJourneyEntryProps = {
  variant?: 'standalone' | 'hero';
};

export function HomepageJourneyEntry({ variant = 'standalone' }: HomepageJourneyEntryProps) {
  const navigate = useNavigate();
  const { t, getApiLocale } = useLanguage();
  const { openWidgetModal } = usePatientEntry();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadDepartments = async () => {
      try {
        const response = await departmentApi.getDept(getApiLocale());
        if (cancelled) {
          return;
        }

        const nextDepartments = (response.data ?? []).map((department: Record<string, unknown>) => ({
          id: String(department.id ?? department.slug ?? ''),
          slug: String(department.slug ?? ''),
          label: String(
            department[`name_${getApiLocale()}`] ??
            department.name_en ??
            department.name ??
            department.slug ??
            '',
          ),
        })).filter((department) => department.slug && department.label);

        setDepartments(nextDepartments);
      } catch {
        if (!cancelled) {
          setDepartments([]);
        }
      }
    };

    void loadDepartments();

    return () => {
      cancelled = true;
    };
  }, [getApiLocale]);

  const destinationOptions = useMemo(
    () => DESTINATION_OPTIONS.map((destination) => ({
      value: destination.value,
      label: t(destination.translationKey) || destination.fallback,
    })),
    [t],
  );

  const canSearch = selectedDepartment.trim().length > 0 && selectedDestination.trim().length > 0;

  const handleSearch = () => {
    if (!canSearch) {
      return;
    }

    navigate(`/hospitals?city=${encodeURIComponent(selectedDestination)}`);
  };

  const shellClassName = variant === 'hero'
    ? 'overflow-hidden rounded-[28px] border border-white/70 bg-white/94 shadow-[0_24px_90px_rgba(15,23,42,0.14)] backdrop-blur'
    : 'mx-auto overflow-hidden rounded-[30px] border border-white/70 bg-white/95 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur';

  const contentPaddingClassName = variant === 'hero'
    ? 'px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5'
    : 'px-4 py-4 sm:px-5 sm:py-5 lg:px-7 lg:py-6';

  return (
    <div className={shellClassName}>
      {variant === 'standalone' ? (
        <div className="border-b border-slate-100 px-5 py-4 sm:px-7">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600">
            {t('homepageJourney.eyebrow')}
          </div>
        </div>
      ) : null}

      <div className={`grid gap-3 lg:grid-cols-[1.2fr_1fr_auto_auto] lg:items-end lg:gap-4 ${contentPaddingClassName}`}>
        <label className="block">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
            {t('homepageJourney.department')}
          </div>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50 px-4 text-left text-sm text-slate-900 shadow-inner shadow-slate-100/80">
              <SelectValue placeholder={t('homepageJourney.departmentPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {departments.length > 0 ? departments.map((department) => (
                <SelectItem key={department.id} value={department.slug}>
                  {department.label}
                </SelectItem>
              )) : (
                <SelectItem value="loading" disabled>
                  {t('homepageJourney.departmentsLoading')}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </label>

        <label className="block">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-teal-600" />
            {t('homepageJourney.destination')}
          </div>
          <Select value={selectedDestination} onValueChange={setSelectedDestination}>
            <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50 px-4 text-left text-sm text-slate-900 shadow-inner shadow-slate-100/80">
              <SelectValue placeholder={t('homepageJourney.destinationPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {destinationOptions.map((destination) => (
                <SelectItem key={destination.value} value={destination.value}>
                  {destination.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <Button
          type="button"
          onClick={handleSearch}
          disabled={!canSearch}
          className="h-14 rounded-2xl border border-white/40 bg-[linear-gradient(135deg,#1DA78A_0%,#0F638E_100%)] px-6 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(15,99,142,0.28)] hover:brightness-105 disabled:border-slate-200 disabled:bg-slate-300 lg:min-w-[140px]"
        >
          <Search className="mr-2 h-4 w-4" />
          {t('homepageJourney.search')}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={openWidgetModal}
          className="h-14 rounded-2xl border border-teal-100 bg-[linear-gradient(135deg,#6BD9C3_0%,#1DA78A_45%,#0F638E_100%)] px-6 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(29,167,138,0.24)] hover:brightness-105 hover:text-white lg:min-w-[140px]"
        >
          {t('homepageJourney.chatNow')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function SearchBar() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#EAF7F4_0%,#F7FBFA_44%,#FFFFFF_100%)] py-8 sm:py-10 lg:-mt-14 lg:pb-14 lg:pt-0">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(29,167,138,0.18),transparent_55%),radial-gradient(circle_at_top_right,rgba(15,99,142,0.14),transparent_50%)]" />
      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HomepageJourneyEntry />
      </div>
    </section>
  );
}

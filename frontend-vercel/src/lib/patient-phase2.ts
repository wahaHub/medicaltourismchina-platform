import type {
  PatientJourneyMilestone,
  PatientTicketPriority,
  PatientTicketStatus,
  PatientTicketType,
} from '@/types/patient-phase2';
import type { TranslationKey, TranslationParams } from '@/i18n';

type Translate = (key: TranslationKey, params?: TranslationParams) => string;

export function formatMoney(amount: string, currency: string, locale = 'en-US') {
  const numeric = Number(amount);

  if (Number.isFinite(numeric)) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(numeric);
  }

  return `${amount} ${currency}`;
}

type MoneyDisplayLocale = 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ru';

const MONEY_LOCALE_CONFIG: Record<MoneyDisplayLocale, { locale: string; currency: string; prefix?: string; suffix?: string }> = {
  en: { locale: 'en-US', currency: 'USD', prefix: 'Approx. ' },
  zh: { locale: 'zh-CN', currency: 'CNY', prefix: '约 ' },
  es: { locale: 'es-ES', currency: 'EUR', prefix: 'Aprox. ' },
  fr: { locale: 'fr-FR', currency: 'EUR', prefix: 'Env. ' },
  de: { locale: 'de-DE', currency: 'EUR', prefix: 'Ca. ' },
  ru: { locale: 'ru-RU', currency: 'RUB', prefix: 'Примерно ' },
};

const USD_RATES: Record<string, number> = {
  USD: 1,
  CNY: 7.1,
  EUR: 0.92,
  RUB: 90,
};

function normalizeMoneyLocale(languageCode: string): MoneyDisplayLocale {
  if (languageCode === 'zh' || languageCode === 'zh-CN') return 'zh';
  if (languageCode === 'es' || languageCode === 'fr' || languageCode === 'de' || languageCode === 'ru') return languageCode;
  return 'en';
}

export function formatLocalizedPackageMoney(amount: string, currency: string, languageCode: string) {
  const numeric = Number(amount);
  const sourceCurrency = currency.toUpperCase();
  const display = MONEY_LOCALE_CONFIG[normalizeMoneyLocale(languageCode)];

  if (!Number.isFinite(numeric)) {
    return `${amount} ${currency}`;
  }

  if (sourceCurrency === display.currency) {
    return formatMoney(amount, sourceCurrency, display.locale);
  }

  const sourceRate = USD_RATES[sourceCurrency];
  const targetRate = USD_RATES[display.currency];

  if (!sourceRate || !targetRate) {
    return formatMoney(amount, sourceCurrency, display.locale);
  }

  const amountUsd = numeric / sourceRate;
  const converted = amountUsd * targetRate;
  const rounded = Math.round(converted);
  const formatted = new Intl.NumberFormat(display.locale, {
    style: 'currency',
    currency: display.currency,
    maximumFractionDigits: 0,
  }).format(rounded);

  return `${display.prefix ?? ''}${formatted}${display.suffix ?? ''}`;
}

export function formatDateTime(value: string | null | undefined, locale = 'en-US', translate?: Translate) {
  if (!value) {
    return translate?.('dashboard.common.notAvailable') ?? 'Not available';
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDateOnly(value: string | null | undefined, locale = 'en-US', translate?: Translate) {
  if (!value) {
    return translate?.('dashboard.common.notAvailable') ?? 'Not available';
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function ticketTypeLabel(type: PatientTicketType, translate?: Translate) {
  return translate?.(`dashboard.ticketType.${type}` as TranslationKey) ?? type.replace(/_/g, ' ').toLowerCase();
}

function translatedCodeLabel(prefix: string, code: string | null | undefined, translate?: Translate) {
  if (!code) {
    return translate?.('dashboard.common.notSetYet') ?? 'Not set yet';
  }

  const key = `${prefix}.${code}` as TranslationKey;
  const translated = translate?.(key);
  if (translated && translated !== key) {
    return translated;
  }

  return code
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ticketStatusLabel(status: PatientTicketStatus, translate?: Translate) {
  return translatedCodeLabel('dashboard.ticketStatus', status, translate);
}

export function orderStatusLabel(status: string, translate?: Translate) {
  return translatedCodeLabel('dashboard.orderStatus', status, translate);
}

export function orderTypeLabel(type: string, translate?: Translate) {
  return translatedCodeLabel('dashboard.orderType', type, translate);
}

export function paymentMethodLabel(method: string | null | undefined, translate?: Translate) {
  return translatedCodeLabel('dashboard.paymentMethod', method, translate);
}

export function caseAssignmentStatusLabel(status: string | null | undefined, translate?: Translate) {
  return translatedCodeLabel('dashboard.caseAssignmentStatus', status, translate);
}

export function ticketStatusTone(status: PatientTicketStatus) {
  switch (status) {
    case 'OPEN':
      return 'bg-teal-100 text-teal-800';
    case 'ASSIGNED':
      return 'bg-cyan-100 text-cyan-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'PENDING_INFO':
      return 'bg-amber-100 text-amber-800';
    case 'RESOLVED':
      return 'bg-emerald-100 text-emerald-800';
    case 'CLOSED':
      return 'bg-slate-100 text-slate-700';
  }
}

export function ticketPriorityTone(priority: PatientTicketPriority) {
  switch (priority) {
    case 'HIGH':
      return 'bg-rose-100 text-rose-800';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-800';
    case 'LOW':
      return 'bg-slate-100 text-slate-700';
  }
}

export function orderStatusTone(status: string) {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'bg-amber-100 text-amber-800';
    case 'PAID':
      return 'bg-emerald-100 text-emerald-800';
    case 'IN_PROGRESS':
      return 'bg-cyan-100 text-cyan-800';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800';
    case 'REFUNDED':
      return 'bg-fuchsia-100 text-fuchsia-800';
    case 'CANCELLED':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function createOrderIdempotencyKey(packageId: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `pkg-${packageId}-${crypto.randomUUID()}`;
  }

  return `pkg-${packageId}-${Date.now()}`;
}

export function sortMilestones(milestones: PatientJourneyMilestone[]) {
  return [...milestones].sort((left, right) =>
    new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime(),
  );
}

export function renderStructuredValue(value: unknown, translate?: Translate) {
  if (value === null || value === undefined) {
    return translate?.('dashboard.common.notSetYet') ?? 'Not set yet';
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return translate?.('dashboard.common.notSetYet') ?? 'Not set yet';
    }

    return value.map((item) => renderStructuredValue(item, translate)).join(' • ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

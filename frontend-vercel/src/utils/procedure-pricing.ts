export type ProcedurePriceInput = {
  source_price_amount?: unknown;
  source_price_min?: unknown;
  source_price_max?: unknown;
  source_price_currency?: unknown;
  source_price_display?: unknown;
  cost_usd?: unknown;
  price_max?: unknown;
};

type SupportedCurrency =
  | "AED"
  | "AUD"
  | "BDT"
  | "CAD"
  | "CNY"
  | "EUR"
  | "GBP"
  | "HKD"
  | "IDR"
  | "INR"
  | "JPY"
  | "KRW"
  | "MYR"
  | "NZD"
  | "PKR"
  | "QAR"
  | "RUB"
  | "SAR"
  | "SGD"
  | "THB"
  | "USD";

const USD_RATES: Record<SupportedCurrency, number> = {
  AED: 3.67,
  AUD: 1.52,
  BDT: 110,
  CAD: 1.37,
  CNY: 7.2,
  EUR: 0.92,
  GBP: 0.79,
  HKD: 7.8,
  IDR: 15800,
  INR: 83,
  JPY: 150,
  KRW: 1360,
  MYR: 4.7,
  NZD: 1.65,
  PKR: 278,
  QAR: 3.64,
  RUB: 90,
  SAR: 3.75,
  SGD: 1.34,
  THB: 35,
  USD: 1,
};

const COUNTRY_CURRENCIES: Record<string, SupportedCurrency> = {
  AE: "AED",
  AU: "AUD",
  BD: "BDT",
  CA: "CAD",
  CN: "CNY",
  DE: "EUR",
  ES: "EUR",
  FR: "EUR",
  GB: "GBP",
  HK: "HKD",
  ID: "IDR",
  IN: "INR",
  IT: "EUR",
  JP: "JPY",
  KR: "KRW",
  MY: "MYR",
  NL: "EUR",
  NZ: "NZD",
  PK: "PKR",
  QA: "QAR",
  RU: "RUB",
  SA: "SAR",
  SG: "SGD",
  TH: "THB",
  US: "USD",
};

const LANGUAGE_CURRENCIES: Record<string, SupportedCurrency> = {
  de: "EUR",
  es: "EUR",
  fr: "EUR",
  ru: "RUB",
  zh: "CNY",
};

const NUMBER_LOCALES: Record<string, string> = {
  ar: "ar",
  de: "de-DE",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  id: "id-ID",
  ru: "ru-RU",
  zh: "zh-CN",
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const matched = value.match(/\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/g);
  if (!matched?.length) return null;

  const amount = Number(matched[0].replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : null;
}

function detectCurrency(value: unknown, fallback: SupportedCurrency = "USD"): SupportedCurrency {
  const text = String(value || "");
  if (/\b(?:CNY|RMB)\b|CN¥|¥/i.test(text)) return "CNY";
  if (/\bEUR\b|€/i.test(text)) return "EUR";
  if (/\bGBP\b|£/i.test(text)) return "GBP";
  if (/\bJPY\b|JP¥/i.test(text)) return "JPY";
  if (/\bKRW\b|₩/i.test(text)) return "KRW";
  if (/\bRUB\b|₽/i.test(text)) return "RUB";
  if (/\bUSD\b|US\$|\$/i.test(text)) return "USD";
  return fallback;
}

function getSourcePrice(procedure: ProcedurePriceInput) {
  const raw = procedure.source_price_display ?? procedure.cost_usd ?? procedure.price_max;
  const currencyValue = String(procedure.source_price_currency || "").toUpperCase();
  const currency = currencyValue in USD_RATES
    ? currencyValue as SupportedCurrency
    : detectCurrency(raw);
  const amount = toNumber(procedure.source_price_amount) ?? toNumber(raw);
  const minAmount = toNumber(procedure.source_price_min) ?? amount;
  const maxAmount = toNumber(procedure.source_price_max) ?? amount;

  if (minAmount === null || maxAmount === null) return null;
  return { currency, minAmount, maxAmount };
}

export function getProcedureDisplayCurrency(country: string | null | undefined, language: string): SupportedCurrency {
  const normalizedCountry = String(country || "").trim().toUpperCase();
  if (normalizedCountry in COUNTRY_CURRENCIES) {
    return COUNTRY_CURRENCIES[normalizedCountry];
  }

  const normalizedLanguage = language.toLowerCase().split("-")[0];
  return LANGUAGE_CURRENCIES[normalizedLanguage] || "USD";
}

function convert(amount: number, source: SupportedCurrency, target: SupportedCurrency): number {
  return amount / USD_RATES[source] * USD_RATES[target];
}

function formatAmount(amount: number, currency: SupportedCurrency, language: string): string {
  const normalizedLanguage = language.toLowerCase().split("-")[0];
  return new Intl.NumberFormat(NUMBER_LOCALES[normalizedLanguage] || "en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(Math.round(amount)).replace(/\u00A0/g, " ");
}

export function formatProcedurePrice(
  procedure: ProcedurePriceInput,
  options: { country?: string | null; language: string },
): string | null {
  const source = getSourcePrice(procedure);
  if (!source) return null;

  const currency = getProcedureDisplayCurrency(options.country, options.language);
  const minAmount = convert(source.minAmount, source.currency, currency);
  const maxAmount = convert(source.maxAmount, source.currency, currency);
  const minText = formatAmount(minAmount, currency, options.language);

  return Math.round(minAmount) === Math.round(maxAmount)
    ? minText
    : `${minText}-${formatAmount(maxAmount, currency, options.language)}`;
}

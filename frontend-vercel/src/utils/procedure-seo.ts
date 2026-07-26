import {
  isSiteLocale,
  type SiteLocale,
} from "@/utils/locale-routing";

const PROCEDURE_TITLE_SUFFIXES: Partial<Record<SiteLocale, string>> = {
  en: "in China",
  es: "en China",
  fr: "en Chine",
  de: "in China",
  ru: "в Китае",
  ar: "في الصين",
  id: "di Tiongkok",
};

const normalizeSiteLocale = (locale: string): SiteLocale | null => {
  const baseLocale = locale.trim().toLowerCase().split(/[-_]/)[0];
  return isSiteLocale(baseLocale) ? baseLocale : null;
};

export function getProcedureAvailableLocales(
  apiLocales: readonly string[] | null | undefined,
): SiteLocale[] {
  const locales = new Set<SiteLocale>();

  for (const locale of apiLocales ?? []) {
    if (typeof locale !== "string") continue;
    const normalizedLocale = normalizeSiteLocale(locale);
    if (normalizedLocale) locales.add(normalizedLocale);
  }

  return [...locales];
}

export function isProcedureLocaleIndexable({
  requestedLocale,
  resolvedLocale,
  pageLocale,
  availableLocales,
}: {
  requestedLocale: string;
  resolvedLocale: string;
  pageLocale: SiteLocale;
  availableLocales: readonly SiteLocale[];
}): boolean {
  const normalizedRequestedLocale = normalizeSiteLocale(requestedLocale);
  const normalizedResolvedLocale = normalizeSiteLocale(resolvedLocale);

  return (
    normalizedRequestedLocale === pageLocale &&
    normalizedResolvedLocale === pageLocale &&
    availableLocales.includes(pageLocale)
  );
}

export function getProcedureSeoTitle(
  name: string,
  locale: SiteLocale,
): string {
  const suffix = PROCEDURE_TITLE_SUFFIXES[locale];
  return `${name}${suffix ? ` ${suffix}` : ""} | Medora Health`;
}

const normalizeSeoDescription = (
  value: string | null | undefined,
): string =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const truncateSeoDescription = (
  value: string,
  maxLength = 300,
): string => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}…`;
};

export function getProcedureSeoDescription(procedure: {
  name: string;
  summary?: string | null;
  description?: string | null;
  surgery_detailed_description?: string | null;
}): string {
  const source =
    procedure.summary
    || procedure.description
    || procedure.surgery_detailed_description
    || `Learn about ${procedure.name} with Medora Health.`;
  return truncateSeoDescription(normalizeSeoDescription(source));
}

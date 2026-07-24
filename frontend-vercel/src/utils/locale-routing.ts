export const DEFAULT_LOCALE = "en";
export const URL_LOCALES = ["zh", "es", "fr", "de", "ru", "ar"] as const;
export const ALL_LOCALES = [DEFAULT_LOCALE, ...URL_LOCALES] as const;

export type SiteLocale = (typeof ALL_LOCALES)[number];

const URL_LOCALE_SET = new Set<string>(URL_LOCALES);
const ARABIC_LOCALIZED_PATHS = new Set([
  "/",
  "/telemedicine",
  "/search",
  "/treatment",
  "/packages",
  "/hospitals",
  "/visa",
]);

function normalizeContentPath(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (normalized === "/") return normalized;
  return normalized.replace(/\/+$/, "");
}

export function isSiteLocale(value: string | null | undefined): value is SiteLocale {
  return Boolean(value && ALL_LOCALES.includes(value as SiteLocale));
}

export function getLocaleFromPathname(pathname: string): SiteLocale {
  const firstSegment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return URL_LOCALE_SET.has(firstSegment) ? (firstSegment as SiteLocale) : DEFAULT_LOCALE;
}

export function getLocaleBasename(locale: SiteLocale): string | undefined {
  return locale === DEFAULT_LOCALE ? undefined : `/${locale}`;
}

export function stripLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (locale === DEFAULT_LOCALE) {
    return pathname || "/";
  }

  const stripped = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "");
  return stripped || "/";
}

export function localizePathname(pathname: string, locale: SiteLocale): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const languageNeutralPath = stripLocaleFromPathname(normalizedPath);

  if (locale === DEFAULT_LOCALE) {
    return languageNeutralPath || "/";
  }

  if (languageNeutralPath === "/") {
    return `/${locale}/`;
  }

  return `/${locale}${languageNeutralPath}`;
}

export function isPathLocalizedForLocale(
  pathname: string,
  locale: SiteLocale,
): boolean {
  if (locale !== "ar") {
    return true;
  }

  return ARABIC_LOCALIZED_PATHS.has(
    normalizeContentPath(stripLocaleFromPathname(pathname)),
  );
}

export function buildLocaleUrl(
  targetLocale: SiteLocale,
  location: Pick<Location, "pathname" | "search" | "hash" | "origin">,
): string {
  const supportsCurrentPath = isPathLocalizedForLocale(
    location.pathname,
    targetLocale,
  );
  const localizedPath = supportsCurrentPath
    ? localizePathname(location.pathname, targetLocale)
    : "/ar/";

  return `${location.origin}${localizedPath}${
    supportsCurrentPath ? `${location.search}${location.hash}` : ""
  }`;
}

export function getHreflang(locale: SiteLocale): string {
  return locale === "zh" ? "zh-Hans" : locale;
}

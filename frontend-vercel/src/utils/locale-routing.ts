export const DEFAULT_LOCALE = "en";
export const URL_LOCALES = ["zh", "es", "fr", "de", "ru"] as const;
export const ALL_LOCALES = [DEFAULT_LOCALE, ...URL_LOCALES] as const;

export type SiteLocale = (typeof ALL_LOCALES)[number];

const URL_LOCALE_SET = new Set<string>(URL_LOCALES);

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

export function buildLocaleUrl(
  targetLocale: SiteLocale,
  location: Pick<Location, "pathname" | "search" | "hash" | "origin">,
): string {
  return `${location.origin}${localizePathname(location.pathname, targetLocale)}${location.search}${location.hash}`;
}

export function getHreflang(locale: SiteLocale): string {
  return locale === "zh" ? "zh-Hans" : locale;
}

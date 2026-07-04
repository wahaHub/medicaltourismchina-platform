const INCOMPLETE_CONTENT_LOCALES = new Set(["ru"]);

export function getContentApiLocale(locale: string): string {
  return INCOMPLETE_CONTENT_LOCALES.has(locale) ? "en" : locale;
}

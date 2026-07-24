const INCOMPLETE_CONTENT_LOCALES = new Set(["ru"]);
const INDEXABLE_HOSPITAL_CONTENT_LOCALES = new Set(["en", "zh"]);

export function getContentApiLocale(locale: string): string {
  return INCOMPLETE_CONTENT_LOCALES.has(locale) ? "en" : locale;
}

export function isContentLocaleIndexable(locale: string): boolean {
  return !INCOMPLETE_CONTENT_LOCALES.has(locale);
}

export function isHospitalContentLocaleIndexable(locale: string): boolean {
  return INDEXABLE_HOSPITAL_CONTENT_LOCALES.has(locale);
}

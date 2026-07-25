const INCOMPLETE_CONTENT_LOCALES = new Set(["ru"]);
const INDEXABLE_HOSPITAL_CONTENT_LOCALES = new Set(["en", "zh"]);
const COMPLETE_MEDICAL_TAXONOMY_LOCALES = new Set([
  "en",
  "zh",
  "es",
  "fr",
  "de",
  "ru",
  "ar",
  "id",
]);

export function getContentApiLocale(locale: string): string {
  return INCOMPLETE_CONTENT_LOCALES.has(locale) ? "en" : locale;
}

export function getMedicalTaxonomyApiLocale(locale: string): string {
  return COMPLETE_MEDICAL_TAXONOMY_LOCALES.has(locale) ? locale : "en";
}

export function isContentLocaleIndexable(locale: string): boolean {
  return !INCOMPLETE_CONTENT_LOCALES.has(locale);
}

export function isHospitalContentLocaleIndexable(locale: string): boolean {
  return INDEXABLE_HOSPITAL_CONTENT_LOCALES.has(locale);
}

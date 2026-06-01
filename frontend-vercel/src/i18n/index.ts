import { translations } from './translations/index';

export type TranslationKey = keyof typeof translations.en;

export interface TranslationParams {
  [key: string]: string | number;
}

export const t = (key: TranslationKey, params?: TranslationParams, locale: string = 'en'): string => {
  // Ensure locale is valid, fallback to 'en' if not
  const safeLocale = locale && translations[locale as keyof typeof translations] ? locale : 'en';
  const translation = translations[safeLocale as keyof typeof translations];
  // Use ?? so explicit empty strings in locale files are not replaced by English fallback
  let text = translation?.[key] ?? translations.en[key] ?? String(key);
  
  if (params) {
    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`{{${param}}}`, 'g'), String(params[param]));
    });
  }
  
  return text;
};

export * from './translations/index';
export { translations } from './translations/index';

import { en } from './translations/en';
import { zh } from './translations/zh';

export type TranslationKey = keyof typeof en;

export interface TranslationParams {
  [key: string]: string | number;
}

type TranslationDictionary = Partial<Record<TranslationKey, string>>;
type TranslationLocale = 'en' | 'zh' | 'zh-CN' | 'es' | 'fr' | 'de' | 'ru';

const loadedTranslations: Record<string, TranslationDictionary> = {
  en,
  zh,
  'zh-CN': zh,
};

const localeLoaders: Partial<Record<TranslationLocale, () => Promise<TranslationDictionary>>> = {
  es: () => import('./translations/es').then((module) => module.es),
  fr: () => import('./translations/fr').then((module) => module.fr),
  de: () => import('./translations/de').then((module) => module.de),
  ru: () => import('./translations/ru').then((module) => module.ru),
};

const localeLoadPromises: Partial<Record<TranslationLocale, Promise<TranslationDictionary>>> = {};

function normalizeLocale(locale: string): TranslationLocale {
  if (locale === 'zh-CN') return 'zh-CN';
  if (locale === 'zh' || locale === 'en' || locale === 'es' || locale === 'fr' || locale === 'de' || locale === 'ru') {
    return locale;
  }
  return 'en';
}

export async function loadTranslationLocale(locale: string): Promise<TranslationDictionary> {
  const safeLocale = normalizeLocale(locale);

  if (loadedTranslations[safeLocale]) {
    return loadedTranslations[safeLocale];
  }

  const loader = localeLoaders[safeLocale];
  if (!loader) {
    return loadedTranslations.en;
  }

  localeLoadPromises[safeLocale] ??= loader().then((dictionary) => {
    loadedTranslations[safeLocale] = dictionary;
    return dictionary;
  });

  return localeLoadPromises[safeLocale];
}

export const t = (key: TranslationKey, params?: TranslationParams, locale: string = 'en'): string => {
  const safeLocale = normalizeLocale(locale);
  const translation = loadedTranslations[safeLocale];
  // Use ?? so explicit empty strings in locale files are not replaced by English fallback
  let text = translation?.[key] ?? loadedTranslations.zh[key] ?? loadedTranslations.en[key] ?? String(key);
  
  if (params) {
    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`{{${param}}}`, 'g'), String(params[param]));
    });
  }
  
  return text;
};

export const translations = loadedTranslations;

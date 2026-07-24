import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { loadTranslationLocale, t, TranslationKey, TranslationParams } from '@/i18n';
import {
  buildLocaleUrl,
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  isSiteLocale,
  type SiteLocale,
} from '@/utils/locale-routing';

export interface Language {
  code: string;
  name: string;
  flag: string;
  apiCode: string; // API 使用的语言代码
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', apiCode: 'en' },
  { code: 'zh', name: '中文', flag: '🇨🇳', apiCode: 'zh' },
  { code: 'es', name: 'Español', flag: '🇪🇸', apiCode: 'es' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', apiCode: 'fr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', apiCode: 'de' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', apiCode: 'ru' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', apiCode: 'ar' },
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  getApiLocale: () => string;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  isLanguageLoading: boolean;
  detectionMethod: 'url' | 'geolocation' | 'browser' | 'default' | 'saved' | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguageCode?: SiteLocale;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialLanguageCode,
}) => {
  const routeLanguageCode =
    initialLanguageCode
    ?? (typeof window !== 'undefined' ? getLocaleFromPathname(window.location.pathname) : DEFAULT_LOCALE);
  const routeLanguage =
    SUPPORTED_LANGUAGES.find((language) => language.code === routeLanguageCode)
    ?? SUPPORTED_LANGUAGES[0];

  // The URL is the source of truth. The unprefixed site is always English.
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    routeLanguage
  );

  const [isLanguageLoading] = useState(false);
  const [detectionMethod] = useState<'url' | 'default'>(
    routeLanguageCode === DEFAULT_LOCALE ? 'default' : 'url'
  );
  const [, setDictionaryVersion] = useState(0);

  const setLanguage = (language: Language) => {
    if (!isSiteLocale(language.code)) {
      return;
    }

    localStorage.setItem('selectedLanguage', language.code);
    if (typeof window !== 'undefined') {
      const targetUrl = buildLocaleUrl(language.code, window.location);
      window.location.assign(targetUrl);
      return;
    }

    setCurrentLanguage(language);
  };

  const getApiLocale = () => {
    return currentLanguage.apiCode;
  };

  const translate = (key: TranslationKey, params?: TranslationParams) => {
    return t(key, params, currentLanguage?.code || 'en');
  };

  useEffect(() => {
    document.documentElement.lang = currentLanguage.code === 'zh' ? 'zh-Hans' : currentLanguage.code;
    document.documentElement.dir = currentLanguage.code === 'ar' ? 'rtl' : 'ltr';
    void loadTranslationLocale(currentLanguage.code).then(() => {
      setDictionaryVersion((version) => version + 1);
    });
  }, [currentLanguage.code]);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    getApiLocale,
    t: translate,
    isLanguageLoading,
    detectionMethod,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

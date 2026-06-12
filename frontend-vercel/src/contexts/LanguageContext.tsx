import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { loadTranslationLocale, t, TranslationKey, TranslationParams } from '@/i18n';

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
];

// 地理位置到语言的映射
const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  // 中文地区
  'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'MO': 'zh', 'SG': 'zh',
  
  // 英文地区
  'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en', 
  'ZA': 'en', 'IN': 'en', 'PH': 'en', 'MY': 'en',
  
  // 西班牙语地区
  'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es',
  'CL': 'es', 'EC': 'es', 'BO': 'es', 'PY': 'es', 'UY': 'es', 'CR': 'es',
  'PA': 'es', 'NI': 'es', 'HN': 'es', 'SV': 'es', 'GT': 'es', 'DO': 'es', 'CU': 'es',
  
  // 法语地区
  'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'LU': 'fr', 'MC': 'fr', 'SN': 'fr',
  'CI': 'fr', 'MA': 'fr', 'TN': 'fr', 'DZ': 'fr',
  
  // 德语地区
  'DE': 'de', 'AT': 'de', 'LI': 'de',
  
  // 俄语地区
  'RU': 'ru', 'BY': 'ru', 'KZ': 'ru', 'UA': 'ru', 'KG': 'ru',
};

// 浏览器语言检测
const detectBrowserLanguage = (): Language | null => {
  const browserLang = navigator.language || navigator.languages?.[0];
  if (!browserLang) return null;

  const langCode = browserLang.split('-')[0].toLowerCase();
  return SUPPORTED_LANGUAGES.find(lang => lang.code === langCode) || null;
};

// 地理位置检测
const detectLocationLanguage = async (signal?: AbortSignal): Promise<Language | null> => {
  try {
    const response = await fetch('https://ipapi.co/country_code/', {
      method: 'GET',
      headers: { 'Accept': 'text/plain' },
      signal,
    });
    
    if (response.ok) {
      const countryCode = (await response.text()).trim().toUpperCase();
      const langCode = COUNTRY_LANGUAGE_MAP[countryCode];
      
      if (langCode) {
        return SUPPORTED_LANGUAGES.find(lang => lang.code === langCode) || null;
      }
    }
  } catch (error) {
    console.warn('Failed to detect location-based language:', error);
  }
  
  return null;
};

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  getApiLocale: () => string;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  isLanguageLoading: boolean;
  detectionMethod: 'geolocation' | 'browser' | 'default' | 'saved' | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // 默认语言：中文（因为这是中国医疗旅游网站）
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    SUPPORTED_LANGUAGES.find(lang => lang.code === 'zh') || SUPPORTED_LANGUAGES[0]
  );
  
  const [isLanguageLoading, setIsLanguageLoading] = useState(true);
  const [detectionMethod, setDetectionMethod] = useState<'geolocation' | 'browser' | 'default' | 'saved' | null>(null);
  const [, setDictionaryVersion] = useState(0);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    // 保存到 localStorage
    localStorage.setItem('selectedLanguage', language.code);
    void loadTranslationLocale(language.code).then(() => {
      setDictionaryVersion((version) => version + 1);
    });
  };

  const getApiLocale = () => {
    return currentLanguage.apiCode;
  };

  const translate = (key: TranslationKey, params?: TranslationParams) => {
    return t(key, params, currentLanguage?.code || 'en');
  };

  useEffect(() => {
    void loadTranslationLocale(currentLanguage.code).then(() => {
      setDictionaryVersion((version) => version + 1);
    });
  }, [currentLanguage.code]);

  // 语言检测逻辑
  useEffect(() => {
    const chooseInitialLanguage = () => {
      try {
        // 首先检查是否有保存的语言设置
        const savedLanguageCode = localStorage.getItem('selectedLanguage');
        if (savedLanguageCode) {
          const savedLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguageCode);
          if (savedLanguage) {
            setCurrentLanguage(savedLanguage);
            setDetectionMethod('saved');
            setIsLanguageLoading(false);
            return { language: savedLanguage, shouldDetectLocation: false };
          }
        }

        // 首屏优先使用浏览器语言，不等待地理位置服务。
        const browserLanguage = detectBrowserLanguage();
        if (browserLanguage) {
          setCurrentLanguage(browserLanguage);
          setDetectionMethod('browser');
          setIsLanguageLoading(false);
          return { language: browserLanguage, shouldDetectLocation: true };
        }

        const defaultLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === 'zh') || SUPPORTED_LANGUAGES[0];
        setCurrentLanguage(defaultLanguage);
        setDetectionMethod('default');
        setIsLanguageLoading(false);
        return { language: defaultLanguage, shouldDetectLocation: true };

      } catch (error) {
        console.error('Language detection failed:', error);
        const defaultLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === 'zh') || SUPPORTED_LANGUAGES[0];
        setCurrentLanguage(defaultLanguage);
        setDetectionMethod('default');
        setIsLanguageLoading(false);
        return { language: defaultLanguage, shouldDetectLocation: true };
      }
    };

    const initial = chooseInitialLanguage();
    void loadTranslationLocale(initial.language.code).then(() => {
      setDictionaryVersion((version) => version + 1);
    });

    if (!initial.shouldDetectLocation) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 800);

    void detectLocationLanguage(controller.signal)
      .then((locationLanguage) => {
        if (!locationLanguage || localStorage.getItem('selectedLanguage')) {
          return;
        }

        setCurrentLanguage(locationLanguage);
        setDetectionMethod('geolocation');
        void loadTranslationLocale(locationLanguage.code).then(() => {
          setDictionaryVersion((version) => version + 1);
        });
      })
      .finally(() => {
        window.clearTimeout(timeout);
      });

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

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

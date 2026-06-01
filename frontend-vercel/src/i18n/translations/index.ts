import { en } from './en';
import { zh } from './zh';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { ru } from './ru';

export const translations = {
  en,
  zh,
  'zh-CN': zh, // Alias for Chinese
  es,
  fr,
  de,
  ru,
};

export type SupportedLocale = keyof typeof translations;

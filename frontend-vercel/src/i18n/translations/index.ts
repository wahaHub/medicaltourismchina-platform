import { en } from './en';
import { zh } from './zh';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { ru } from './ru';
import { ar } from './ar';
import { id } from './id';

export const translations = {
  en,
  zh,
  'zh-CN': zh, // Alias for Chinese
  es,
  fr,
  de,
  ru,
  ar,
  id,
};

export type SupportedLocale = keyof typeof translations;

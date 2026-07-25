import {
  ALL_LOCALES,
  type SiteLocale,
} from "@/utils/locale-routing";

const PROCEDURE_TITLE_SUFFIXES: Partial<Record<SiteLocale, string>> = {
  en: "in China",
  es: "en China",
  fr: "en Chine",
  de: "in China",
  ru: "в Китае",
  ar: "في الصين",
  id: "di Tiongkok",
};

export const INDEXABLE_PROCEDURE_LOCALES: SiteLocale[] = [...ALL_LOCALES];

export function getProcedureSeoTitle(
  name: string,
  locale: SiteLocale,
): string {
  const suffix = PROCEDURE_TITLE_SUFFIXES[locale];
  return `${name}${suffix ? ` ${suffix}` : ""} | Medora Health`;
}

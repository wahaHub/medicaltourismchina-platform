import {
  getStaticPageMetadata as getSharedStaticPageMetadata,
  STATIC_PAGE_METADATA,
} from "../../seo/static-pages.mjs";
import type { SiteLocale } from "@/utils/locale-routing";

export type StaticPageKey = keyof typeof STATIC_PAGE_METADATA;

type StaticLocaleMetadata = {
  title: string;
  description: string;
  heading: string;
};

type StaticPageMetadata = {
  path: string;
  indexableLocales: SiteLocale[];
  locale: StaticLocaleMetadata;
  indexable: boolean;
};

export function getStaticPageMetadata(
  key: StaticPageKey,
  locale: string,
): StaticPageMetadata {
  return getSharedStaticPageMetadata(key, locale) as StaticPageMetadata;
}

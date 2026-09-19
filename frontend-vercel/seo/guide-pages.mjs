import fs from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { prepareGuideBody } from "../src/lib/guide-markdown.mjs";
import { GUIDE_LOCALES, guideFilename, guideHeadingId, localizeGuideHeading } from "../src/lib/guide-locales.mjs";

import { getStaticPageMetadata } from "./static-pages.mjs";

const SITE_ORIGIN = "https://www.medicaltourismchina.health";


function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function localizePath(pathname, locale) {
  return locale === "en" ? pathname : `/${locale}${pathname}`;
}

function pickLocalized(record, locale) {
  return record?.[locale] || record?.en || record?.zh || "";
}

function normalizeDate(value) {
  const match = String(value || "").match(/^(\d{4})[/-](\d{2})[/-](\d{2})$/);
  if (!match) return undefined;
  const date = `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date ? date : undefined;
}

export function markdownToGuideSeoHtml(markdown, locale = "en") {
  // React escapes raw HTML; ReactMarkdown's default URL transform rejects unsafe schemes.
  // Localize only plain heading nodes, preserving inline links/emphasis and heading levels.
  const source = prepareGuideBody(markdown);
  const components = Object.fromEntries(Array.from({ length: 6 }, (_, index) => {
    const tag = `h${index + 1}`;
    return [tag, ({ children, node }) => {
      // Hash the original heading, just like GuideDetail's table of contents. Reading
      // source positions also retains Markdown formatting in the anchor input.
      const headingSource = source.slice(node.position.start.offset, node.position.end.offset);
      const heading = headingSource.match(/^ {0,3}##[ \t]+([^\n]+)/)?.[1]
        ?? headingSource.split(/\r?\n/)[0];
      return React.createElement(tag, tag === "h2" ? { id: guideHeadingId(heading) } : null,
        typeof children === "string" ? localizeGuideHeading(children, locale) : children);
    }];
  }));
  return renderToStaticMarkup(React.createElement("article", {
    "data-seo-article-content": "true",
    lang: locale === "zh" ? "zh-Hans" : locale,
    dir: locale === "ar" ? "rtl" : "ltr",
  },
    React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm], components }, source)));
}

// Source files, rather than translated titles or stale locale declarations, establish availability.
async function readGuideSources(projectRoot, category, guide) {
  const sources = {};
  for (const locale of GUIDE_LOCALES) {
    try {
      const markdown = await fs.readFile(path.join(projectRoot, "public/guides", category.slug,
        guideFilename(guide.slug, locale)), "utf8");
      if (prepareGuideBody(markdown).trim()) sources[locale] = markdown;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return sources;
}

function buildGuideStructuredData({
  canonicalUrl,
  categoryTitle,
  description,
  image,
  locale,
  modifiedDate,
  title,
}) {
  const guidesUrl = `${SITE_ORIGIN}${localizePath("/guides", locale)}`;
  const inLanguage = locale === "zh" ? "zh-Hans" : locale;
  const article = {
    "@type": "Article",
    "@id": `${canonicalUrl}#article`,
    headline: title,
    description,
    articleSection: categoryTitle,
    inLanguage,
    isAccessibleForFree: true,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    author: { "@type": "Organization", "@id": `${SITE_ORIGIN}/#organization`, name: "Medora Health" },
    publisher: { "@type": "Organization", "@id": `${SITE_ORIGIN}/#organization`, name: "Medora Health" },
  };
  if (modifiedDate) article.dateModified = modifiedDate;
  if (image) article.image = image;
  // Editorial workflow notes are not evidence of an actual medical review.

  return {
    "@context": "https://schema.org",
    "@graph": [
      article,
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Medora Health", item: `${SITE_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: getStaticPageMetadata("guides", locale).locale.heading, item: guidesUrl },
          { "@type": "ListItem", position: 3, name: title, item: canonicalUrl },
        ],
      },
    ],
  };
}

export async function makeGuidePages(projectRoot) {
  const manifestPath = path.join(projectRoot, "src", "data", "guides-manifest.json");
  const seoManifestPath = path.join(projectRoot, "src", "data", "guides-seo-manifest.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const seoManifest = JSON.parse(await fs.readFile(seoManifestPath, "utf8"));
  const pages = [];

  for (const category of manifest.categories || []) {
    for (const guide of category.guides || []) {
      const sources = await readGuideSources(projectRoot, category, guide);
      const availableLocales = Object.keys(sources);

      const route = `/guides/${category.slug}/${guide.slug}`;
      const seoGuide = seoManifest.guides?.[`${category.slug}/${guide.slug}`] || {};
      const alternates = Object.fromEntries(
        availableLocales.map((locale) => [locale, localizePath(route, locale)]),
      );

      for (const locale of availableLocales) {
        const markdown = sources[locale];
        const title = guide.title?.[locale] || guide.slug;
        const seoTitle = seoGuide.title?.[locale] || title;
        const description = seoGuide.description?.[locale]
          || guide.subtitle?.[locale]
          || (locale === "en" ? guide.excerpt : "") || "";
        const categoryTitle = pickLocalized(category.title, locale) || category.slug;
        const pathname = alternates[locale];
        const canonicalUrl = `${SITE_ORIGIN}${pathname}`;
        const image = category.image ? `${SITE_ORIGIN}${category.image}` : undefined;
        const modifiedDate = normalizeDate(guide.updatedDate);

        pages.push({
          path: pathname,
          canonical: canonicalUrl,
          locale,
          title: seoTitle,
          description,
          heading: title,
          eyebrow: categoryTitle,
          image,
          indexable: true,
          alternates,
          lastmod: modifiedDate,
          ogType: "article",
          contentHtml: markdownToGuideSeoHtml(markdown, locale),
          structuredData: buildGuideStructuredData({
            canonicalUrl,
            categoryTitle,
            description,
            image,
            locale,
            modifiedDate,
            title,
          }),
        });
      }
    }
  }

  return pages;
}

// Directory copy stays in static-pages; these notices describe the language of linked bodies.
const ENGLISH_GUIDE_NOTICE = {
  en: "The articles listed below are in English.",
  zh: "以下列出的文章为英文版本，暂未提供中文正文。",
  es: "Los artículos que se muestran a continuación están en inglés; aún no hay versiones en español.",
  fr: "Les articles ci-dessous sont en anglais ; les versions françaises ne sont pas encore disponibles.",
  de: "Die unten aufgeführten Artikel sind auf Englisch; deutsche Fassungen sind noch nicht verfügbar.",
  ru: "Перечисленные ниже статьи доступны на английском языке; русские версии пока недоступны.",
  ar: "المقالات المدرجة أدناه باللغة الإنجليزية؛ النسخ العربية غير متاحة بعد.",
  id: "Artikel yang tercantum di bawah ini berbahasa Inggris; versi bahasa Indonesia belum tersedia.",
};

/** Same page contract as makeGuidePages; replace generic localized /guides entries with these. */
export async function makeGuideIndexPages(projectRoot) {
  const manifest = JSON.parse(await fs.readFile(path.join(projectRoot, "src/data/guides-manifest.json"), "utf8"));
  const entries = [];
  for (const category of manifest.categories || []) {
    for (const guide of category.guides || []) {
      const sources = await readGuideSources(projectRoot, category, guide);
      for (const locale of Object.keys(sources)) {
        entries.push({ category, guide, locale,
          path: localizePath(`/guides/${category.slug}/${guide.slug}`, locale),
          title: guide.title?.[locale] || guide.slug });
      }
    }
  }
  return GUIDE_LOCALES.map((locale) => {
    const pathname = localizePath("/guides", locale);
    const canonical = `${SITE_ORIGIN}${pathname}`;
    const metadata = getStaticPageMetadata("guides", locale);
    const alternates = Object.fromEntries(metadata.indexableLocales.map((alternate) =>
      [alternate, localizePath("/guides", alternate)]));
    const { title, description, heading } = metadata.locale;
    const localized = entries.filter((entry) => entry.locale === locale);
    const fallback = localized.length === 0 && locale !== "en";
    const listed = fallback ? entries.filter((entry) => entry.locale === "en") : localized;
    const notice = fallback ? `<p data-guide-language-notice="en">${escapeHtml(ENGLISH_GUIDE_NOTICE[locale])}</p>` : "";
    const sections = (manifest.categories || []).map((category) => {
      const guides = listed.filter((entry) => entry.category === category);
      if (!guides.length) return "";
      return `<section><h2>${escapeHtml(pickLocalized(category.title, locale) || category.slug)}</h2><ul>${guides.map((entry) =>
        `<li><a href="${escapeHtml(entry.path)}" hreflang="${entry.locale === "zh" ? "zh-Hans" : entry.locale}" lang="${entry.locale === "zh" ? "zh-Hans" : entry.locale}">${escapeHtml(entry.title)}</a></li>`).join("")}</ul></section>`;
    }).join("");
    const itemList = {
      "@type": "ItemList", "@id": `${canonical}#list`, numberOfItems: listed.length,
      itemListElement: listed.map((entry, index) => ({ "@type": "ListItem", position: index + 1,
        name: entry.title, url: `${SITE_ORIGIN}${entry.path}` })),
    };
    return { path: pathname, canonical, locale, title, heading, description,
      indexable: metadata.indexable, alternates, ogType: "website",
      contentHtml: `<div data-seo-guide-directory="true"><p>${escapeHtml(description)}</p>${notice}${sections}</div>`,
      structuredData: { "@context": "https://schema.org", "@graph": [
        { "@type": "CollectionPage", "@id": canonical, url: canonical, name: title, description,
          inLanguage: locale === "zh" ? "zh-Hans" : locale, mainEntity: { "@id": itemList["@id"] } }, itemList,
      ] } };
  });
}

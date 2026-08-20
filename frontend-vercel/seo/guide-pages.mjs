import fs from "node:fs/promises";
import path from "node:path";

const SITE_ORIGIN = "https://www.medicaltourismchina.health";
const INDEXABLE_GUIDE_LOCALES = new Set(["en", "zh"]);

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
  return match ? `${match[1]}-${match[2]}-${match[3]}` : undefined;
}

function cleanMarkdownInline(value) {
  return String(value || "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<https?:\/\/[^>]+>/g, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function markdownToGuideSeoHtml(markdown) {
  const start = markdown.search(/^## (?:Key Takeaways|Content)\s*$/m);
  const content = start >= 0 ? markdown.slice(start) : markdown;
  const source = content.replace(/^## SEO Metadata\s*$[\s\S]*?(?=^##\s|(?![\s\S]))/m, "");
  const lines = source.split(/\r?\n/);
  const output = ['<article data-seo-article-content="true">'];
  let listType = null;

  const closeList = () => {
    if (listType) output.push(`</${listType}>`);
    listType = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || /^\|?\s*:?-{3,}/.test(line)) {
      closeList();
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = Math.min(heading[1].length, 3);
      output.push(`<h${level}>${escapeHtml(cleanMarkdownInline(heading[2]))}</h${level}>`);
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const nextListType = ordered ? "ol" : "ul";
      if (listType !== nextListType) {
        closeList();
        output.push(`<${nextListType}>`);
        listType = nextListType;
      }
      output.push(`<li>${escapeHtml(cleanMarkdownInline((unordered || ordered)[1]))}</li>`);
      continue;
    }

    closeList();
    const tableText = line.startsWith("|")
      ? line.split("|").map(cleanMarkdownInline).filter(Boolean).join(" · ")
      : cleanMarkdownInline(line.replace(/^>\s*/, ""));
    if (tableText) output.push(`<p>${escapeHtml(tableText)}</p>`);
  }

  closeList();
  output.push("</article>");
  return output.join("\n");
}

function buildGuideStructuredData({
  canonicalUrl,
  categoryTitle,
  description,
  image,
  locale,
  modifiedDate,
  reviewedBy,
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
  if (reviewedBy) article.reviewedBy = { "@type": "Organization", name: reviewedBy };

  return {
    "@context": "https://schema.org",
    "@graph": [
      article,
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Medora Health", item: `${SITE_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: locale === "zh" ? "赴华就医指南" : "Medical Travel Guides", item: guidesUrl },
          { "@type": "ListItem", position: 3, name: categoryTitle, item: canonicalUrl },
        ],
      },
    ],
  };
}

export async function makeGuidePages(projectRoot) {
  const manifestPath = path.join(projectRoot, "src", "data", "guides-manifest.json");
  const seoManifestPath = path.join(projectRoot, "src", "data", "guides-seo-manifest.json");
  const publicGuidesDir = path.join(projectRoot, "public", "guides");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const seoManifest = JSON.parse(await fs.readFile(seoManifestPath, "utf8"));
  const pages = [];

  for (const category of manifest.categories || []) {
    for (const guide of category.guides || []) {
      const availableLocales = (guide.locales || []).filter((locale) => INDEXABLE_GUIDE_LOCALES.has(locale));
      if (!availableLocales.includes("en")) continue;

      const route = `/visa/${category.slug}/${guide.slug}`;
      const seoGuide = seoManifest.guides?.[`${category.slug}/${guide.slug}`] || {};
      const alternates = Object.fromEntries(
        availableLocales.map((locale) => [locale, localizePath(route, locale)]),
      );

      for (const locale of availableLocales) {
        const markdownFilename = locale === "zh" ? `${guide.slug}.zh.md` : `${guide.slug}.md`;
        const markdown = await fs.readFile(
          path.join(publicGuidesDir, category.slug, markdownFilename),
          "utf8",
        );
        const title = pickLocalized(guide.title, locale) || guide.slug;
        const seoTitle = seoGuide.title?.[locale] || title;
        const description = seoGuide.description?.[locale]
          || guide.subtitle?.[locale]
          || guide.excerpt;
        const categoryTitle = pickLocalized(category.title, locale) || category.slug;
        const pathname = alternates[locale];
        const canonicalUrl = `${SITE_ORIGIN}${pathname}`;
        const image = category.image ? `${SITE_ORIGIN}${category.image}` : undefined;
        const modifiedDate = normalizeDate(guide.updatedDate);
        const reviewedBy = seoGuide.reviewedBy?.[locale]
          || seoGuide.reviewedBy?.en
          || "Medora Health Editorial Team";

        pages.push({
          path: pathname,
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
          contentHtml: markdownToGuideSeoHtml(markdown),
          structuredData: buildGuideStructuredData({
            canonicalUrl,
            categoryTitle,
            description,
            image,
            locale,
            modifiedDate,
            reviewedBy,
            title,
          }),
        });
      }
    }
  }

  return pages;
}

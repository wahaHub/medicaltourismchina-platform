import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { stripGuideEditorialSections } from "../src/lib/guide-markdown.mjs";
import { parseGuideMetadata, mergeLocalizedText, makeExcerpt } from "../src/lib/guide-metadata.mjs";
import { parseGuideFilename } from "../src/lib/guide-locales.mjs";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");

// The human-revision folder lives next to the medicaltourismchina-platform repo
// in the local workspace. If it is present, copy the markdown files into the
// public asset directory. If it is absent (e.g. Vercel), regenerate the manifest
// from the already-committed public/guides directory.
const EXTERNAL_SOURCE_DIR = path.resolve(
  PROJECT_ROOT,
  "..",
  "..",
  "Medora_Health_205_Human_Revision_2026-08-03",
);

const PUBLIC_GUIDES_DIR = path.join(PROJECT_ROOT, "public", "guides");
const MANIFEST_PATH = path.join(PROJECT_ROOT, "src", "data", "guides-manifest.json");
const SEO_MANIFEST_PATH = path.join(PROJECT_ROOT, "src", "data", "guides-seo-manifest.json");
const ROUTE_AVAILABILITY_PATH = path.join(PROJECT_ROOT, "src", "data", "guide-route-availability.json");
const LOCALE_AVAILABILITY_PATH = path.join(PROJECT_ROOT, "src", "data", "guide-locale-availability.json");
const CONDITION_TRANSLATIONS_PATH = path.join(PROJECT_ROOT, "src", "data", "guide-condition-translations.json");
const TRANSLATIONS_PATH = path.join(PROJECT_ROOT, "src", "data", "guides-translations.json");

const CATEGORY_IMAGES = {
  "china-healthcare-guides": "/guides/_categories/china-healthcare-guides.jpg",
  "treatment-guides": "/guides/_categories/treatment-guides.jpg",
  "clinical-trials-advanced-treatments": "/guides/_categories/clinical-trials-advanced-treatments.jpg",
  "hospital-guides": "/guides/_categories/hospital-guides.jpg",
  "patient-journey-guides": "/guides/_categories/patient-journey-guides.jpg",
  "cost-insurance-guides": "/guides/_categories/cost-insurance-guides.jpg",
  "patient-education-faq": "/guides/_categories/patient-education-faq.jpg",
};

function toSlug(value) {
  return value
    .replace(/^\d+_/, "")
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .replace(/^-|-$/g, "");
}

function toTitle(value) {
  return value
    .replace(/^\d+_/, "")
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ""))
    .join(" ");
}

function estimateReadTimeMinutes(markdown, locale) {
  const plain = String(markdown || "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#*_`>|\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) return 5;

  if (locale === "zh") {
    const cjkCount = (plain.match(/[\u3400-\u9fff\uf900-\ufaff]/g) || []).length;
    const minutes = Math.ceil(cjkCount / 400);
    return Math.max(3, minutes);
  }

  const wordCount = plain.split(" ").filter(Boolean).length;
  const minutes = Math.ceil(wordCount / 200);
  return Math.max(3, minutes);
}

async function loadTranslations() {
  try {
    const raw = await fs.readFile(TRANSLATIONS_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      categories: parsed?.categories ?? {},
      guides: parsed?.guides ?? {},
    };
  } catch {
    return { categories: {}, guides: {} };
  }
}

async function directoryExists(dir) {
  try {
    const stat = await fs.stat(dir);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function copyMarkdownFromSource() {
  if (!(await directoryExists(EXTERNAL_SOURCE_DIR))) {
    console.log(`[guides] External source not found: ${EXTERNAL_SOURCE_DIR}`);
    return false;
  }

  // Preserve auxiliary asset directories (e.g. _categories cover images) when
  // rebuilding the markdown tree from the external source.
  if (await directoryExists(PUBLIC_GUIDES_DIR)) {
    const existingEntries = await fs.readdir(PUBLIC_GUIDES_DIR, { withFileTypes: true });
    for (const entry of existingEntries) {
      if (entry.name.startsWith("_")) continue;
      await fs.rm(path.join(PUBLIC_GUIDES_DIR, entry.name), { recursive: true, force: true });
    }
  } else {
    await fs.mkdir(PUBLIC_GUIDES_DIR, { recursive: true });
  }

  const topEntries = await fs.readdir(EXTERNAL_SOURCE_DIR, { withFileTypes: true });
  const categoryDirs = topEntries
    .filter((entry) => entry.isDirectory() && /^\d+_/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  for (const categoryDir of categoryDirs) {
    const categoryPath = path.join(EXTERNAL_SOURCE_DIR, categoryDir);
    const categorySlug = toSlug(categoryDir);
    const guideDirs = (await fs.readdir(categoryPath, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() && /^\d+_/.test(entry.name))
      .map((entry) => entry.name)
      .sort();

    for (const guideDir of guideDirs) {
      const guidePath = path.join(categoryPath, guideDir);
      const guideSlug = toSlug(guideDir);
      const targetDir = path.join(PUBLIC_GUIDES_DIR, categorySlug);
      await fs.mkdir(targetDir, { recursive: true });

      const enPath = path.join(guidePath, "en", "guide.md");
      const zhPath = path.join(guidePath, "zh-CN", "guide.md");

      if (await fileExists(enPath)) {
        await fs.copyFile(enPath, path.join(targetDir, `${guideSlug}.md`));
      }
      if (await fileExists(zhPath)) {
        await fs.copyFile(zhPath, path.join(targetDir, `${guideSlug}.zh.md`));
      }
    }
  }

  console.log(`[guides] Copied markdown files from ${EXTERNAL_SOURCE_DIR}`);
  return true;
}

async function fileExists(file) {
  try {
    const stat = await fs.stat(file);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function buildManifest() {
  if (!(await directoryExists(PUBLIC_GUIDES_DIR))) {
    throw new Error(`Guides directory does not exist: ${PUBLIC_GUIDES_DIR}`);
  }

  const translations = await loadTranslations();
  const conditionTranslations = JSON.parse(await fs.readFile(CONDITION_TRANSLATIONS_PATH, "utf8"));
  const importInventoryPath = path.join(PROJECT_ROOT, 'content-imports/2026-09-09-new-305/inventory.json');
  const importedArticles = await fileExists(importInventoryPath)
    ? JSON.parse(await fs.readFile(importInventoryPath, 'utf8')).articles : [];
  const importedBySlug = new Map(importedArticles.map((article) => [article.slug, article]));
  const categories = [];
  const seoGuides = {};
  const availableLocales = new Set();
  const routeAvailability = {};
  const categoryDirs = (await fs.readdir(PUBLIC_GUIDES_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .sort();

  for (const categorySlug of categoryDirs) {
    const categoryPath = path.join(PUBLIC_GUIDES_DIR, categorySlug);
    const files = (await fs.readdir(categoryPath))
      .filter((name) => name.endsWith(".md"))
      .sort();

    const guideMap = new Map();

    for (const file of files) {
      const { slug: base, locale } = parseGuideFilename(file);
      const markdownPath = path.join(categoryPath, file);
      const originalMarkdown = await fs.readFile(markdownPath, "utf8");
      const markdown = stripGuideEditorialSections(originalMarkdown);
      // Clean committed assets and any newly imported external drafts before
      // Vite copies them into dist; retain SEO metadata for manifest extraction.
      if (markdown !== originalMarkdown) {
        await fs.writeFile(markdownPath, markdown.replace(/\n+$/, "\n"));
      }
      const { hero, seo, excerpt } = parseGuideMetadata(markdown);
      // Count actual patient prose, never title dictionaries or metadata-only
      // source stubs. Static pages can import this tiny array independently.
      if (makeExcerpt(markdown)) {
        availableLocales.add(locale);
        const routeKey = `${categorySlug}/${base}`;
        const routeLocales = routeAvailability[routeKey] ||= [];
        if (!routeLocales.includes(locale)) routeLocales.push(locale);
      }

      let guide = guideMap.get(base);
      if (!guide) {
        guide = {
          slug: base,
          title: {},
          subtitle: {},
          subcategory: "",
          excerpt: "",
          locales: [],
          updatedDate: "",
          readTimeMinutes: 0,
        };
        guideMap.set(base, guide);
        const imported = importedBySlug.get(base);
        if (imported) {
          guide.conditionId = imported.conditionId;
          guide.condition = mergeLocalizedText(imported.condition, conditionTranslations[imported.conditionId]);
          guide.topic = imported.topic;
          guide.importBatch = '2026-09-09-new-305';
        }
      }

      guide.title[locale] = hero.title;
      guide.subtitle[locale] = hero.subtitle;
      const seoKey = `${categorySlug}/${base}`;
      seoGuides[seoKey] ||= { title: {}, description: {}, reviewedBy: {} };
      if (seo.title) seoGuides[seoKey].title[locale] = seo.title;
      if (seo.description) seoGuides[seoKey].description[locale] = seo.description;
      if (hero.reviewedBy) seoGuides[seoKey].reviewedBy[locale] = hero.reviewedBy;
      guide.subcategory = hero.subcategory || guide.subcategory;
      guide.updatedDate = hero.updatedDate || guide.updatedDate;
      if (!guide.locales.includes(locale)) guide.locales.push(locale);
      if (!guide.excerpt) {
        guide.excerpt = excerpt;
      }
      const readTime = estimateReadTimeMinutes(markdown, locale);
      if (!guide.readTimeMinutes || (locale === "en" && readTime > 0)) {
        guide.readTimeMinutes = readTime;
      }
    }

    const guides = [...guideMap.values()].sort((a, b) => {
      const titleA = a.title.en || a.title.zh || a.slug;
      const titleB = b.title.en || b.title.zh || b.slug;
      return titleA.localeCompare(titleB);
    });

    for (const guide of guides) {
      const localized = translations.guides[guide.slug];
      if (localized) {
        guide.title = mergeLocalizedText(guide.title, localized.title);
        guide.subtitle = mergeLocalizedText(guide.subtitle, localized.subtitle);
      }
      if (!guide.readTimeMinutes) guide.readTimeMinutes = 5;
    }

    if (guides.length > 0) {
      const categoryTranslation = translations.categories[categorySlug];
      const baseTitle = categoryTranslation?.title?.en || toTitle(categorySlug);
      const categoryTitle = mergeLocalizedText(
        { en: baseTitle },
        categoryTranslation?.title,
      );
      if (!categoryTitle.zh) categoryTitle.zh = baseTitle;
      categories.push({
        slug: categorySlug,
        title: categoryTitle,
        image: CATEGORY_IMAGES[categorySlug] ?? null,
        guides,
      });
    }
  }

  const manifest = { categories };
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  await fs.writeFile(SEO_MANIFEST_PATH, JSON.stringify({ guides: seoGuides }, null, 2));
  await fs.writeFile(LOCALE_AVAILABILITY_PATH, `${JSON.stringify([...availableLocales].sort())}\n`);
  for (const locales of Object.values(routeAvailability)) locales.sort();
  await fs.writeFile(ROUTE_AVAILABILITY_PATH, `${JSON.stringify(routeAvailability)}\n`);
  console.log(`[guides] Manifest written with ${categories.length} categories`);
}

async function main() {
  const sourceAvailable = await directoryExists(EXTERNAL_SOURCE_DIR);
  // An ordinary build must not delete new imports or translations just because
  // an old external drafting folder happens to be present on this machine.
  if (sourceAvailable && process.argv.includes('--import-legacy-source')) {
    await copyMarkdownFromSource();
  }
  await buildManifest();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

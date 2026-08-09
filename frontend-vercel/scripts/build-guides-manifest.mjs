import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

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

function parseHero(markdown) {
  const lines = markdown.split(/\r?\n/);
  const hero = {
    title: "",
    subtitle: "",
    category: "",
    subcategory: "",
    updatedDate: "",
  };

  let inHero = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "## Hero") {
      inHero = true;
      continue;
    }
    if (inHero && trimmed.startsWith("## ") && trimmed !== "## Hero") {
      break;
    }
    if (!inHero) continue;

    const match = trimmed.match(/^-\s*\*\*(.+?):\s*\*\*\s*(.*)$/);
    if (!match) continue;
    const key = match[1].trim().toLowerCase();
    const value = match[2].trim().replace(/^`+|`+$/g, "").trim();
    if (key === "title") hero.title = value;
    if (key === "subtitle") hero.subtitle = value;
    if (key === "category") hero.category = value;
    if (key === "subcategory") hero.subcategory = value;
    if (key === "updated date") hero.updatedDate = value;
  }

  // Fallback title from first H1 if Hero title missing
  if (!hero.title) {
    const h1Match = markdown.match(/^#\s+\d*\s*(.+)$/m);
    if (h1Match) hero.title = h1Match[1].trim();
  }

  return hero;
}

function makeExcerpt(markdown, fallback) {
  const contentMatch = markdown.match(/## Content\s*\n([\s\S]*?)(?:\n## |\n# |\Z)/);
  if (contentMatch) {
    const text = contentMatch[1]
      .replace(/\[\d+\]/g, "")
      .replace(/[#*_`\[\]\(\)]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length > 20) {
      const sentence = text.split(/(?<=[.!?])\s+/)[0];
      return sentence.length > 220 ? `${sentence.slice(0, 219).trim()}…` : sentence;
    }
  }
  return fallback || "";
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

  await fs.rm(PUBLIC_GUIDES_DIR, { recursive: true, force: true });
  await fs.mkdir(PUBLIC_GUIDES_DIR, { recursive: true });

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

  const categories = [];
  const categoryDirs = (await fs.readdir(PUBLIC_GUIDES_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const categorySlug of categoryDirs) {
    const categoryPath = path.join(PUBLIC_GUIDES_DIR, categorySlug);
    const files = (await fs.readdir(categoryPath))
      .filter((name) => name.endsWith(".md"))
      .sort();

    const guideMap = new Map();

    for (const file of files) {
      const base = file.replace(/\.zh\.md$/, "").replace(/\.md$/, "");
      const isZh = file.endsWith(".zh.md");
      const locale = isZh ? "zh" : "en";
      const markdown = await fs.readFile(path.join(categoryPath, file), "utf8");
      const hero = parseHero(markdown);

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
        };
        guideMap.set(base, guide);
      }

      guide.title[locale] = hero.title;
      guide.subtitle[locale] = hero.subtitle;
      guide.subcategory = hero.subcategory || guide.subcategory;
      guide.updatedDate = hero.updatedDate || guide.updatedDate;
      if (!guide.locales.includes(locale)) guide.locales.push(locale);
      if (!guide.excerpt) {
        guide.excerpt = makeExcerpt(markdown, hero.subtitle);
      }
    }

    const guides = [...guideMap.values()].sort((a, b) => {
      const titleA = a.title.en || a.title.zh || a.slug;
      const titleB = b.title.en || b.title.zh || b.slug;
      return titleA.localeCompare(titleB);
    });

    if (guides.length > 0) {
      categories.push({
        slug: categorySlug,
        title: toTitle(categorySlug),
        guides,
      });
    }
  }

  const manifest = { categories };
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`[guides] Manifest written with ${categories.length} categories`);
}

async function main() {
  const sourceAvailable = await directoryExists(EXTERNAL_SOURCE_DIR);
  if (sourceAvailable) {
    await copyMarkdownFromSource();
  }
  await buildManifest();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

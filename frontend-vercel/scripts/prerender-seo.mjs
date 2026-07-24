import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  SEO_LOCALES,
  STATIC_PAGE_METADATA,
  getStaticPageMetadata,
} from "../seo/static-pages.mjs";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const DIST_DIR = path.join(PROJECT_ROOT, "dist");
const DIST_INDEX = path.join(DIST_DIR, "index.html");
const DIST_BASE_INDEX = path.join(DIST_DIR, ".seo-base-index.html");
const SITE_ORIGIN = "https://www.medicaltourismchina.health";
const CONTENT_API_BASE_URL = (
  process.env.VITE_CONTENT_API_BASE_URL
  || process.env.VITE_API_BASE_URL
  || "https://content.medicaltourismchina.health"
).replace(/\/+$/, "");
const REMOTE_REQUIRED =
  process.env.VERCEL === "1"
  || process.env.SEO_PRERENDER_REMOTE_REQUIRED === "1";
const REMOTE_ENABLED = process.env.SEO_PRERENDER_REMOTE !== "0";

const HREFLANG = {
  en: "en",
  zh: "zh-Hans",
  es: "es",
  fr: "fr",
  de: "de",
  ru: "ru",
  ar: "ar",
  id: "id",
};

const LOCATION_GUIDES = {
  beijing: {
    name: "Beijing",
    description: "Plan medical care in Beijing with information about major hospitals, specialist services, airports, accommodation, interpretation, and local travel.",
  },
  shanghai: {
    name: "Shanghai",
    description: "Plan medical care in Shanghai with information about tertiary hospitals, international medical services, airports, accommodation, and local travel.",
  },
  guangzhou: {
    name: "Guangzhou",
    description: "Plan medical care in Guangzhou with information about specialist hospitals, international patient support, transport, accommodation, and interpretation.",
  },
  shenzhen: {
    name: "Shenzhen",
    description: "Plan medical care in Shenzhen with information about modern hospitals, transport connections, accommodation, interpretation, and international patient services.",
  },
  chengdu: {
    name: "Chengdu",
    description: "Plan medical care in Chengdu with information about regional referral hospitals, specialist services, airports, accommodation, and local costs.",
  },
  chongqing: {
    name: "Chongqing",
    description: "Plan medical care in Chongqing with information about teaching hospitals, specialist services, transport, accommodation, and international patient support.",
  },
};

const LOCAL_TREATMENT_DETAILS = {
  "breast-cancer": {
    title: "Breast Cancer Care Coordination in China",
    description: "Learn about specialist review, treatment planning, hospital coordination, expected records, costs, and follow-up for breast cancer care in China.",
  },
  "lung-cancer": {
    title: "Lung Cancer Treatment in China",
    description: "Review lung cancer treatment pathways, specialist services, hospital options, medical records, estimated costs, and follow-up planning in China.",
  },
  "stem-cell-therapy": {
    title: "Stem Cell Therapy in China",
    description: "Understand eligibility review, protocols, hospital selection, medical records, costs, limitations, and follow-up considerations for stem cell therapy in China.",
  },
};

const ENGLISH_SEO_LANDINGS = {
  "/why-china": {
    title: "Why Choose China for Medical Care | Medora Health",
    description: "Understand the medical expertise, hospital capacity, technology, costs, travel planning, and patient support available in China.",
    heading: "Why consider China for medical care?",
  },
  "/visa": {
    title: "China Visa and Medical Travel Support | Medora Health",
    description: "Prepare for medical travel to China with practical information about appointments, supporting documents, interpretation, transport, and follow-up.",
    heading: "China visa and medical travel planning",
  },
  "/faq": {
    title: "China Medical Travel FAQ | Medora Health",
    description: "Answers about choosing a hospital, preparing medical records, treatment estimates, visas, travel, interpretation, recovery, and follow-up in China.",
    heading: "Frequently asked questions about China medical travel",
  },
  "/cosmetic-surgery": {
    title: "Cosmetic Surgery in China | Medora Health",
    description: "Explore cosmetic surgery options, provider selection, treatment planning, costs, travel, and follow-up considerations in China.",
    heading: "Cosmetic surgery options in China",
  },
  "/cancer-treatment": {
    title: "Cancer Treatment in China | Medora Health",
    description: "Explore oncology consultations, treatment planning, hospital options, medical record review, costs, and follow-up in China.",
    heading: "Cancer treatment options in China",
  },
  "/dental-treatment": {
    title: "Dental Treatment in China | Medora Health",
    description: "Explore dental treatment options, provider selection, treatment planning, estimated costs, travel, and follow-up in China.",
    heading: "Dental treatment options in China",
  },
  "/stem-cell-therapy": {
    title: "Stem Cell Therapy in China | Medora Health",
    description: "Understand medical record review, eligibility, protocols, provider selection, costs, limitations, and follow-up for stem cell therapy in China.",
    heading: "Stem cell therapy evaluation in China",
  },
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stripTags(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(value, maxLength = 300) {
  const normalized = stripTags(value);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}

function isSeoSafeSlug(slug) {
  return Boolean(
    slug
    && slug.length <= 120
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
  );
}

function isGeneratedHospitalSlug(slug) {
  return Boolean(
    slug
    && /^hospital-(?:[0-9a-f]{8,}|[0-9a-f-]{20,}|[a-z0-9]{8,})$/i.test(slug),
  );
}

function getHospitalSeoName(row, locale) {
  const name = String(row?.name || "").trim();
  const displayName = String(row?.display_name || "").trim();
  const hasCjk = (value) => /[\u3400-\u9fff\uf900-\ufaff]/u.test(value);

  if (locale === "zh") {
    if (hasCjk(displayName) && !hasCjk(name)) return displayName;
    if (hasCjk(name)) return name;
    return displayName || name;
  }

  if (!name) return displayName;
  const chineseAliasStart = name.search(/[（(]\s*[\u3400-\u9fff\uf900-\ufaff]/u);
  if (chineseAliasStart > 0 && /[A-Za-z]/.test(name.slice(0, chineseAliasStart))) {
    return name.slice(0, chineseAliasStart).trim();
  }

  const bilingualMatch = name.match(/^(.*)\s*[（(]\s*(.*?)\s*[）)]\s*$/);
  if (!bilingualMatch) return name;

  const outside = bilingualMatch[1]?.trim() || "";
  const inside = bilingualMatch[2]?.trim() || "";
  if (/[A-Za-z]/.test(outside) && hasCjk(inside)) return outside;
  if (hasCjk(outside) && /[A-Za-z]/.test(inside)) return inside;
  return name;
}

function localizePath(pathname, locale) {
  if (locale === "en") return pathname;
  if (pathname === "/") return `/${locale}/`;
  return `/${locale}${pathname}`;
}

function absoluteUrl(pathname) {
  return `${SITE_ORIGIN}${pathname}`;
}

function replaceMeta(html, selectorPattern, replacement) {
  const pattern = new RegExp(selectorPattern, "i");
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : html.replace("</head>", `    ${replacement}\n  </head>`);
}

function buildAlternateTags(alternates) {
  if (!alternates || Object.keys(alternates).length === 0) return "";

  const tags = Object.entries(alternates).map(([locale, pathname]) =>
    `    <link rel="alternate" hreflang="${HREFLANG[locale]}" href="${absoluteUrl(pathname)}" />`
  );
  if (alternates.en) {
    tags.push(`    <link rel="alternate" hreflang="x-default" href="${absoluteUrl(alternates.en)}" />`);
  }
  return tags.join("\n");
}

function buildSeoShell({ heading, description, eyebrow }) {
  return [
    '<main data-seo-prerender="true" class="min-h-[45vh] bg-white px-6 py-24">',
    '  <div class="mx-auto max-w-5xl">',
    eyebrow ? `    <p class="mb-4 text-sm font-semibold text-teal-700">${escapeHtml(eyebrow)}</p>` : "",
    `    <h1 class="text-4xl font-bold text-slate-950">${escapeHtml(heading)}</h1>`,
    `    <p class="mt-5 max-w-3xl text-lg leading-8 text-slate-600">${escapeHtml(description)}</p>`,
    "  </div>",
    "</main>",
  ].filter(Boolean).join("\n");
}

function renderHtml(baseHtml, page) {
  const canonicalUrl = absoluteUrl(page.path);
  const alternateTags = page.indexable ? buildAlternateTags(page.alternates) : "";
  const withoutOldAlternates = baseHtml.replace(
    /\s*<link\s+rel=["']alternate["'][^>]*hreflang=[^>]*>\s*/gi,
    "\n",
  );

  let html = withoutOldAlternates
    .replace(
      /<html\s+lang=["'][^"']*["'](?:\s+dir=["'][^"']*["'])?>/i,
      `<html lang="${HREFLANG[page.locale] || page.locale}" dir="${page.locale === "ar" ? "rtl" : "ltr"}">`,
    )
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`)
    .replace(
      /<div id="root">[\s\S]*?<\/div>/i,
      `<div id="root">${buildSeoShell(page)}</div>`,
    );

  html = replaceMeta(
    html,
    '<meta\\s+name=["\']description["\'][^>]*>',
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
  );
  html = replaceMeta(
    html,
    '<meta\\s+name=["\']robots["\'][^>]*>',
    `<meta name="robots" content="${page.indexable ? "index, follow" : "noindex, follow"}" />`,
  );
  html = replaceMeta(
    html,
    '<link\\s+rel=["\']canonical["\'][^>]*>',
    `<link rel="canonical" href="${canonicalUrl}" />${alternateTags ? `\n${alternateTags}` : ""}`,
  );
  html = replaceMeta(
    html,
    '<meta\\s+property=["\']og:title["\'][^>]*>',
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
  );
  html = replaceMeta(
    html,
    '<meta\\s+property=["\']og:description["\'][^>]*>',
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
  );
  html = replaceMeta(
    html,
    '<meta\\s+property=["\']og:url["\'][^>]*>',
    `<meta property="og:url" content="${canonicalUrl}" />`,
  );
  html = replaceMeta(
    html,
    '<meta\\s+name=["\']twitter:title["\'][^>]*>',
    `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
  );
  html = replaceMeta(
    html,
    '<meta\\s+name=["\']twitter:description["\'][^>]*>',
    `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
  );

  return html;
}

function routeOutputPath(pathname) {
  if (pathname === "/") return DIST_INDEX;
  return path.join(DIST_DIR, pathname.replace(/^\/+|\/+$/g, ""), "index.html");
}

async function writePage(baseHtml, page) {
  const outputPath = routeOutputPath(page.path);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, renderHtml(baseHtml, page), "utf8");
}

async function fetchJson(pathname) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${CONTENT_API_BASE_URL}${pathname}`, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchPaginated(endpoint, locale, pageSize = 250) {
  const items = [];
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const separator = endpoint.includes("?") ? "&" : "?";
    const payload = await fetchJson(
      `${endpoint}${separator}locale=${encodeURIComponent(locale)}&limit=${pageSize}&offset=${offset}`,
    );
    const batch = Array.isArray(payload.data) ? payload.data : [];
    items.push(...batch);
    total = payload.meta?.pagination?.total ?? payload.meta?.total ?? payload.total ?? items.length;
    if (batch.length === 0) break;
    offset += batch.length;
  }

  return items;
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

function makeStaticPages() {
  const pages = [];
  for (const key of Object.keys(STATIC_PAGE_METADATA)) {
    for (const locale of SEO_LOCALES) {
      const metadata = getStaticPageMetadata(key, locale);
      const path = localizePath(metadata.path, locale);
      const alternates = Object.fromEntries(
        metadata.indexableLocales.map((alternateLocale) => [
          alternateLocale,
          localizePath(metadata.path, alternateLocale),
        ]),
      );
      pages.push({
        path,
        locale,
        title: metadata.locale.title,
        description: metadata.locale.description,
        heading: metadata.locale.heading,
        indexable: metadata.indexable,
        alternates,
      });
    }
  }

  for (const [pathname, metadata] of Object.entries(ENGLISH_SEO_LANDINGS)) {
    pages.push({
      path: pathname,
      locale: "en",
      ...metadata,
      indexable: true,
      alternates: { en: pathname },
    });
  }

  for (const [slug, metadata] of Object.entries(LOCAL_TREATMENT_DETAILS)) {
    const pathname = `/treatment/${slug}`;
    pages.push({
      path: pathname,
      locale: "en",
      title: `${metadata.title} | Medora Health`,
      description: metadata.description,
      heading: metadata.title,
      indexable: true,
      alternates: { en: pathname },
    });
  }

  for (const [slug, guide] of Object.entries(LOCATION_GUIDES)) {
    const pathname = `/locations/china/${slug}`;
    pages.push({
      path: pathname,
      locale: "en",
      title: `${guide.name} Medical Tourism Guide | Medora Health`,
      description: guide.description,
      heading: `${guide.name} Medical Tourism Guide`,
      eyebrow: "China medical travel destination",
      indexable: true,
      alternates: { en: pathname },
    });
  }

  return pages;
}

async function makeRemotePages() {
  const pages = [];
  const indexableContentLocales = ["en", "zh"];
  const hospitalRowsByLocale = new Map();

  for (const locale of indexableContentLocales) {
    const rows = await fetchPaginated("/hospitals", locale, 200);
    hospitalRowsByLocale.set(locale, new Map(rows.map((row) => [row.slug, row])));
  }

  const hospitalSlugs = new Set(
    [...hospitalRowsByLocale.values()].flatMap((rows) => [...rows.keys()]),
  );

  const detailTasks = [];
  for (const slug of hospitalSlugs) {
    for (const locale of indexableContentLocales) {
      const fallback = hospitalRowsByLocale.get(locale)?.get(slug);
      if (fallback) detailTasks.push({ slug, locale, fallback });
    }
  }
  const details = await mapWithConcurrency(detailTasks, 12, async (task) => {
    try {
      const payload = await fetchJson(
        `/hospitals/${encodeURIComponent(task.slug)}/extended?locale=${task.locale}`,
      );
      return { ...task, row: payload.data || task.fallback };
    } catch {
      return { ...task, row: task.fallback };
    }
  });
  const hospitalDetailsByLocale = new Map(
    indexableContentLocales.map((locale) => [locale, new Map()]),
  );
  for (const detail of details) {
    hospitalDetailsByLocale.get(detail.locale).set(detail.slug, detail.row);
  }

  for (const slug of hospitalSlugs) {
    const alternates = {};
    for (const locale of indexableContentLocales) {
      if (hospitalDetailsByLocale.get(locale)?.has(slug)) {
        alternates[locale] = localizePath(`/hospitals/${encodeURIComponent(slug)}`, locale);
      }
    }

    for (const locale of Object.keys(alternates)) {
      const row = hospitalDetailsByLocale.get(locale).get(slug);
      const name = getHospitalSeoName(row, locale) || slug;
      const description = truncate(
        row.short_description
        || row.overview
        || `${name} hospital information and international patient services in China.`,
      );
      pages.push({
        path: alternates[locale],
        locale,
        title: `${name} | Medora Health`,
        description,
        heading: name,
        eyebrow: row.city ? `${row.city}, China` : "Hospital in China",
        indexable: !isGeneratedHospitalSlug(slug),
        alternates,
      });
    }

    const packageSlugs = new Set();
    for (const locale of indexableContentLocales) {
      const packages = hospitalDetailsByLocale.get(locale)?.get(slug)?.packages || [];
      for (const hospitalPackage of packages) {
        if (isSeoSafeSlug(hospitalPackage.slug)) {
          packageSlugs.add(hospitalPackage.slug);
        }
      }
    }

    for (const packageSlug of packageSlugs) {
      const packageAlternates = {};
      for (const locale of indexableContentLocales) {
        const packages = hospitalDetailsByLocale.get(locale)?.get(slug)?.packages || [];
        if (packages.some((hospitalPackage) => hospitalPackage.slug === packageSlug)) {
          packageAlternates[locale] = localizePath(
            `/hospitals/${encodeURIComponent(slug)}/packages/${encodeURIComponent(packageSlug)}`,
            locale,
          );
        }
      }

      for (const locale of Object.keys(packageAlternates)) {
        const hospital = hospitalDetailsByLocale.get(locale).get(slug);
        const hospitalPackage = (hospital.packages || []).find(
          (candidate) => candidate.slug === packageSlug,
        );
        const title = hospitalPackage.title || packageSlug;
        const hospitalName = getHospitalSeoName(hospital, locale);
        pages.push({
          path: packageAlternates[locale],
          locale,
          title: `${title} | Medora Health`,
          description: truncate(
            hospitalPackage.summary
            || hospitalPackage.subtitle
            || `${title} from ${hospitalName}.`,
          ),
          heading: title,
          eyebrow: hospitalName,
          indexable: !isGeneratedHospitalSlug(slug),
          alternates: packageAlternates,
        });
      }
    }
  }

  const proceduresByLocale = new Map();
  for (const locale of indexableContentLocales) {
    const rows = await fetchPaginated("/procedures", locale, 250);
    proceduresByLocale.set(locale, new Map(rows.map((row) => [row.slug, row])));
  }

  const procedureSlugs = new Set(
    [...proceduresByLocale.values()].flatMap((rows) => [...rows.keys()]),
  );
  let skippedProcedureSlugs = 0;
  for (const slug of procedureSlugs) {
    if (!isSeoSafeSlug(slug)) {
      skippedProcedureSlugs += 1;
      continue;
    }

    const alternates = {};
    for (const locale of indexableContentLocales) {
      const procedure = proceduresByLocale.get(locale)?.get(slug);
      if (procedure?.name) {
        alternates[locale] = localizePath(
          `/procedures/${encodeURIComponent(slug)}`,
          locale,
        );
      }
    }

    for (const locale of Object.keys(alternates)) {
      const procedure = proceduresByLocale.get(locale).get(slug);
      pages.push({
        path: alternates[locale],
        locale,
        title: `${procedure.name} | Medora Health`,
        description: truncate(
          procedure.summary
          || procedure.description
          || procedure.surgery_detailed_description
          || `Learn about ${procedure.name} and treatment planning in China.`,
        ),
        heading: procedure.name,
        eyebrow: procedure.department_name || "Medical treatment in China",
        indexable: true,
        alternates,
      });
    }
  }
  if (skippedProcedureSlugs > 0) {
    process.stderr.write(
      `[seo-prerender] Skipped ${skippedProcedureSlugs} procedures without a stable ASCII SEO slug.\n`,
    );
  }

  return pages;
}

function buildSitemap(pages) {
  const indexablePages = pages.filter((page) => page.indexable);
  const uniquePages = [...new Map(indexablePages.map((page) => [page.path, page])).values()];
  const entries = uniquePages.map((page) => {
    const alternateLinks = Object.entries(page.alternates || {}).map(
      ([locale, pathname]) =>
        `    <xhtml:link rel="alternate" hreflang="${HREFLANG[locale]}" href="${absoluteUrl(pathname)}" />`,
    );
    if (page.alternates?.en) {
      alternateLinks.push(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(page.alternates.en)}" />`,
      );
    }
    return [
      "  <url>",
      `    <loc>${escapeHtml(absoluteUrl(page.path))}</loc>`,
      ...alternateLinks,
      "  </url>",
    ].join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}

async function main() {
  let baseHtml;
  try {
    baseHtml = await fs.readFile(DIST_BASE_INDEX, "utf8");
  } catch {
    baseHtml = await fs.readFile(DIST_INDEX, "utf8");
    await fs.writeFile(DIST_BASE_INDEX, baseHtml, "utf8");
  }
  const pages = makeStaticPages();

  if (REMOTE_ENABLED) {
    try {
      pages.push(...await makeRemotePages());
    } catch (error) {
      if (REMOTE_REQUIRED) throw error;
      process.stderr.write(`[seo-prerender] Remote content skipped: ${error instanceof Error ? error.message : error}\n`);
    }
  }

  const uniquePages = [...new Map(pages.map((page) => [page.path, page])).values()];
  for (const page of uniquePages) {
    await writePage(baseHtml, page);
  }

  await fs.writeFile(path.join(DIST_DIR, "sitemap.xml"), buildSitemap(uniquePages), "utf8");
  process.stdout.write(
    `[seo-prerender] Generated ${uniquePages.length} route HTML files (${uniquePages.filter((page) => page.indexable).length} indexable).\n`,
  );
}

await main();

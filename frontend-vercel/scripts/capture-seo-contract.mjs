import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  extractHtmlSeo,
  isXmlContentType,
  parseSitemap,
  SITE_ORIGIN,
  validateSitemapEntries,
} from "../seo/artifact-validation.mjs";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const CONTRACTS_DIR = path.join(PROJECT_ROOT, "seo", "contracts");
const PROTECTED_URLS_PATH = path.join(CONTRACTS_DIR, "protected-urls.json");
const PROTECTED_METADATA_PATH = path.join(
  CONTRACTS_DIR,
  "protected-page-metadata.json",
);
const SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`;
const CRITICAL_CONTENT_PATHS = new Set([
  "/",
  "/telemedicine",
  "/treatment",
  "/packages",
  "/hospitals",
  "/guides",
]);
const LOCALE_PREFIX = /^\/(?:zh|es|fr|de|ru|ar|id)(?=\/|$)/;

async function fileExists(filename) {
  try {
    await fs.access(filename);
    return true;
  } catch {
    return false;
  }
}

function contentPath(url) {
  const pathname = new URL(url).pathname;
  const stripped = pathname.replace(LOCALE_PREFIX, "");
  return stripped || "/";
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, Math.max(items.length, 1)) },
      () => worker(),
    ),
  );
  return results;
}

async function fetchText(url, expectedContentType) {
  const response = await fetch(url, {
    headers: {
      accept:
        expectedContentType === "xml"
          ? "application/xml,text/xml;q=0.9,*/*;q=0.1"
          : "text/html,*/*;q=0.1",
    },
  });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (expectedContentType === "xml" && !isXmlContentType(contentType)) {
    throw new Error(`${url} returned unexpected Content-Type ${contentType}`);
  }
  if (expectedContentType === "html" && !contentType.includes("text/html")) {
    throw new Error(`${url} returned unexpected Content-Type ${contentType}`);
  }
  return await response.text();
}

if (
  process.env.SEO_CONTRACT_ALLOW_OVERWRITE !== "1"
  && (
    await fileExists(PROTECTED_URLS_PATH)
    || await fileExists(PROTECTED_METADATA_PATH)
  )
) {
  throw new Error(
    "SEO contract baseline already exists. Do not recapture it during normal "
    + "development. Set SEO_CONTRACT_ALLOW_OVERWRITE=1 only after an explicit "
    + "review of every URL and metadata change.",
  );
}

const sitemapXml = await fetchText(SITEMAP_URL, "xml");
const sitemapEntries = parseSitemap(sitemapXml);
const sitemapValidation = validateSitemapEntries(sitemapEntries, {
  xmlBytes: Buffer.byteLength(sitemapXml),
});
if (sitemapValidation.errors.length > 0) {
  throw new Error(
    `Production sitemap is not safe to capture:\n${sitemapValidation.errors.join("\n")}`,
  );
}

const urls = [...sitemapValidation.urls].sort();
const criticalUrls = urls.filter((url) =>
  CRITICAL_CONTENT_PATHS.has(contentPath(url))
);
const protectedPages = await mapWithConcurrency(
  criticalUrls,
  8,
  async (url) => {
    const html = await fetchText(url, "html");
    const seo = extractHtmlSeo(html);
    return {
      url,
      title: seo.title,
      description: seo.description,
      h1: seo.h1,
      robots: seo.robots,
      canonical: seo.canonical,
      lang: seo.lang,
      dir: seo.dir,
      alternates: seo.alternates,
    };
  },
);

await fs.mkdir(CONTRACTS_DIR, { recursive: true });
await fs.writeFile(
  PROTECTED_URLS_PATH,
  `${JSON.stringify({
    version: 1,
    source: SITEMAP_URL,
    capturedAt: new Date().toISOString(),
    urls,
  }, null, 2)}\n`,
  "utf8",
);
await fs.writeFile(
  PROTECTED_METADATA_PATH,
  `${JSON.stringify({
    version: 1,
    source: "production initial HTML",
    capturedAt: new Date().toISOString(),
    pages: protectedPages,
  }, null, 2)}\n`,
  "utf8",
);

process.stdout.write(
  `[seo-contract] Captured ${urls.length} protected URLs and `
  + `${protectedPages.length} protected metadata pages from production.\n`,
);

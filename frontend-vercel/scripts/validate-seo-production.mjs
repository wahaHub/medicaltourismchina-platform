import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  extractHtmlSeo,
  isXmlContentType,
  parseSitemap,
  SITE_ORIGIN,
  validateHtmlDocument,
  validateProtectedMetadata,
  validateProtectedUrls,
  validateSitemapEntries,
} from "../seo/artifact-validation.mjs";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const CONTRACTS_DIR = path.join(PROJECT_ROOT, "seo", "contracts");
const SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`;

async function readJson(filename) {
  return JSON.parse(await fs.readFile(filename, "utf8"));
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

function localeKey(url) {
  return new URL(url).pathname.split("/").filter(Boolean)[0] || "en";
}

function selectDynamicSamples(entries) {
  const selected = new Map();
  for (const entry of entries) {
    const pathname = new URL(entry.loc).pathname;
    const type = pathname.includes("/procedures/")
      ? "procedure"
      : pathname.includes("/hospitals/")
        ? "hospital"
        : null;
    if (!type) continue;
    const locale = localeKey(entry.loc);
    const key = `${type}:${locale}`;
    if (!selected.has(key)) selected.set(key, entry.loc);
  }
  return [...selected.values()];
}

const response = await fetch(SITEMAP_URL, {
  headers: { accept: "application/xml,text/xml;q=0.9,*/*;q=0.1" },
});
if (!response.ok) {
  throw new Error(
    `${SITEMAP_URL} returned ${response.status} ${response.statusText}`,
  );
}
const sitemapContentType = response.headers.get("content-type") ?? "";
if (!isXmlContentType(sitemapContentType)) {
  throw new Error(
    `${SITEMAP_URL} must return an XML Content-Type; found ${sitemapContentType}`,
  );
}

const xml = await response.text();
const entries = parseSitemap(xml);
const sitemapValidation = validateSitemapEntries(entries, {
  xmlBytes: Buffer.byteLength(xml),
});
const protectedUrls = await readJson(
  path.join(CONTRACTS_DIR, "protected-urls.json"),
);
const approvedRemovals = await readJson(
  path.join(CONTRACTS_DIR, "approved-url-removals.json"),
);
const metadataContract = await readJson(
  path.join(CONTRACTS_DIR, "protected-page-metadata.json"),
);
const protectedValidation = validateProtectedUrls(
  sitemapValidation.urls,
  protectedUrls,
  approvedRemovals,
);

const criticalUrls = metadataContract.pages.map((page) => page.url);
const urlsToFetch = [
  ...new Set([...criticalUrls, ...selectDynamicSamples(entries)]),
];
const htmlResults = await mapWithConcurrency(urlsToFetch, 8, async (url) => {
  const pageResponse = await fetch(url, {
    headers: { accept: "text/html,*/*;q=0.1" },
  });
  if (!pageResponse.ok) {
    return {
      url,
      errors: [`${url} returned ${pageResponse.status} ${pageResponse.statusText}`],
    };
  }
  const contentType = pageResponse.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("text/html")) {
    return {
      url,
      errors: [`${url} returned unexpected Content-Type ${contentType}`],
    };
  }
  const seo = extractHtmlSeo(await pageResponse.text());
  const routePath = new URL(url).pathname;
  const validation = validateHtmlDocument({
    routePath,
    seo,
    sitemapUrls: sitemapValidation.urls,
    sitemapEntry: sitemapValidation.entriesByUrl.get(url),
  });
  return { url, seo, errors: validation.errors };
});

const htmlByUrl = new Map(
  htmlResults.filter((result) => result.seo).map((result) => [
    result.url,
    result.seo,
  ]),
);
const metadataValidation = validateProtectedMetadata(
  htmlByUrl,
  metadataContract,
);
const errors = [
  ...sitemapValidation.errors,
  ...protectedValidation.errors,
  ...htmlResults.flatMap((result) => result.errors),
  ...metadataValidation.errors,
];
const warnings = [
  ...sitemapValidation.warnings,
  ...protectedValidation.warnings,
  ...metadataValidation.warnings,
];

for (const warning of warnings) {
  process.stderr.write(`[seo-production] WARNING: ${warning}\n`);
}
if (errors.length > 0) {
  process.stderr.write(
    `[seo-production] FAILED with ${errors.length} violation(s):\n`,
  );
  for (const error of errors.slice(0, 50)) {
    process.stderr.write(`  - ${error}\n`);
  }
  if (errors.length > 50) {
    process.stderr.write(
      `  ... ${errors.length - 50} additional violation(s) omitted\n`,
    );
  }
  process.exitCode = 1;
} else {
  process.stdout.write(
    `[seo-production] PASS sitemap=${entries.length}, `
    + `protected=${protectedUrls.urls.length}, checked-pages=${urlsToFetch.length}\n`,
  );
}

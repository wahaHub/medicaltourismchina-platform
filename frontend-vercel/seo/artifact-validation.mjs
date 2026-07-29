import fs from "node:fs/promises";
import path from "node:path";

import { JSDOM } from "jsdom";

export const SITE_ORIGIN = "https://www.medicaltourismchina.health";

export const HREFLANG_BY_LOCALE = {
  en: "en",
  zh: "zh-Hans",
  es: "es",
  fr: "fr",
  de: "de",
  ru: "ru",
  ar: "ar",
  id: "id",
};

export const PREFIXED_LOCALES = Object.keys(HREFLANG_BY_LOCALE).filter(
  (locale) => locale !== "en",
);

const RETIRED_PATHS = new Set([
  "/health-packages",
  "/hollywood-smile-veneers",
  "/rhinoplasty",
  "/double-eyelid-surgery",
  "/facial-liposuction",
  "/bariatric-surgery",
  "/insurance",
  "/faq",
  "/why-china",
]);

const NON_INDEXABLE_ROUTE_PREFIXES = [
  "/search",
  "/admin",
  "/api",
  "/dashboard",
  "/patient",
  "/work-with-us",
  "/login",
];

const TEST_ENTITY_MARKERS = [
  "33246eb1-5dd1-400b-9a31-43607966e997",
  "ceshi-logs",
];

const URL_SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9";
const XHTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const XML_CONTENT_TYPES = ["application/xml", "text/xml"];

function tagAttribute(tag, attributeName) {
  const escapedName = attributeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = tag.match(
    new RegExp(
      `(?:\\s|<)${escapedName}\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))`,
      "i",
    ),
  );
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

function matchingTags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) ?? [];
}

function matchingPairedTags(html, tagName) {
  return html.match(
    new RegExp(`<${tagName}\\b[^>]*>[\\s\\S]*?<\\/${tagName}>`, "gi"),
  ) ?? [];
}

function innerText(tag) {
  return tag
    .replace(/^<[^>]+>/, "")
    .replace(/<\/[^>]+>$/, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagsWithAttribute(tags, attributeName, expectedValue) {
  return tags.filter(
    (tag) => tagAttribute(tag, attributeName)?.toLowerCase() === expectedValue,
  );
}

function isIndexableRobotsContent(content) {
  const tokens = String(content || "")
    .toLowerCase()
    .split(",")
    .map((token) => token.trim());
  return tokens.includes("index") && !tokens.includes("noindex");
}

function urlForRoute(routePath) {
  return `${SITE_ORIGIN}${routePath}`;
}

function stripLocalePrefix(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (PREFIXED_LOCALES.includes(segments[0])) {
    segments.shift();
  }
  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

function localeForRoute(routePath) {
  const firstSegment = routePath.split("/").filter(Boolean)[0];
  return PREFIXED_LOCALES.includes(firstSegment) ? firstSegment : "en";
}

function routeForIndexFile(distDir, filename) {
  const relative = path.relative(distDir, filename).split(path.sep).join("/");
  if (relative === "index.html") return "/";

  const directory = relative.replace(/\/index\.html$/, "");
  const routePath = `/${directory}`;
  return PREFIXED_LOCALES.includes(directory) ? `${routePath}/` : routePath;
}

async function findIndexFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findIndexFiles(absolutePath));
    } else if (entry.isFile() && entry.name === "index.html") {
      files.push(absolutePath);
    }
  }

  return files;
}

function findElementsByLocalName(parent, localName) {
  return [...parent.getElementsByTagNameNS("*", localName)];
}

export function parseSitemap(xml) {
  let dom;
  try {
    dom = new JSDOM(xml, { contentType: "text/xml" });
  } catch (error) {
    throw new Error(`Sitemap is not valid XML: ${error.message}`);
  }

  try {
    const document = dom.window.document;
    const root = document.documentElement;
    if (root.localName !== "urlset") {
      throw new Error(`Expected <urlset>, received <${root.localName}>`);
    }
    if (root.namespaceURI !== URL_SITEMAP_NAMESPACE) {
      throw new Error(
        `Expected sitemap namespace ${URL_SITEMAP_NAMESPACE}, received ${root.namespaceURI}`,
      );
    }

    return findElementsByLocalName(root, "url").map((urlElement, index) => {
      const locElements = findElementsByLocalName(urlElement, "loc");
      if (locElements.length !== 1) {
        throw new Error(
          `Sitemap entry ${index + 1} must contain exactly one <loc>`,
        );
      }

      const alternates = {};
      for (const link of findElementsByLocalName(urlElement, "link")) {
        if (link.namespaceURI !== XHTML_NAMESPACE) continue;
        if (link.getAttribute("rel") !== "alternate") continue;
        const hreflang = link.getAttribute("hreflang");
        const href = link.getAttribute("href");
        if (!hreflang || !href) {
          throw new Error(
            `Sitemap entry ${index + 1} has an incomplete xhtml:link`,
          );
        }
        if (alternates[hreflang]) {
          throw new Error(
            `Sitemap entry ${index + 1} repeats hreflang ${hreflang}`,
          );
        }
        alternates[hreflang] = href;
      }

      return {
        loc: locElements[0].textContent.trim(),
        alternates,
      };
    });
  } finally {
    dom.window.close();
  }
}

export function extractHtmlSeo(html) {
  const htmlTags = matchingTags(html, "html");
  const titleTags = matchingPairedTags(html, "title");
  const metaTags = matchingTags(html, "meta");
  const linkTags = matchingTags(html, "link");
  const h1Tags = matchingPairedTags(html, "h1");

  const descriptionTags = tagsWithAttribute(metaTags, "name", "description");
  const robotsTags = tagsWithAttribute(metaTags, "name", "robots");
  const ogUrlTags = tagsWithAttribute(metaTags, "property", "og:url");
  const canonicalTags = tagsWithAttribute(linkTags, "rel", "canonical");
  const alternateTags = tagsWithAttribute(linkTags, "rel", "alternate");
  const alternates = {};
  const duplicateAlternates = [];

  for (const tag of alternateTags) {
    const hreflang = tagAttribute(tag, "hreflang");
    const href = tagAttribute(tag, "href");
    if (!hreflang || !href) continue;
    if (alternates[hreflang]) duplicateAlternates.push(hreflang);
    alternates[hreflang] = href;
  }

  return {
    counts: {
      html: htmlTags.length,
      title: titleTags.length,
      description: descriptionTags.length,
      robots: robotsTags.length,
      canonical: canonicalTags.length,
      ogUrl: ogUrlTags.length,
      h1: h1Tags.length,
    },
    title: titleTags[0] ? innerText(titleTags[0]) : "",
    description: descriptionTags[0]
      ? tagAttribute(descriptionTags[0], "content") ?? ""
      : "",
    robots: robotsTags[0]
      ? tagAttribute(robotsTags[0], "content") ?? ""
      : "",
    canonical: canonicalTags[0]
      ? tagAttribute(canonicalTags[0], "href") ?? ""
      : "",
    ogUrl: ogUrlTags[0] ? tagAttribute(ogUrlTags[0], "content") ?? "" : "",
    h1: h1Tags[0] ? innerText(h1Tags[0]) : "",
    lang: htmlTags[0] ? tagAttribute(htmlTags[0], "lang") ?? "" : "",
    dir: htmlTags[0] ? tagAttribute(htmlTags[0], "dir") ?? "" : "",
    alternates,
    duplicateAlternates,
    hasPrerenderedContent: /<main\b[^>]*data-seo-prerender=["']true["']/i.test(
      html,
    ),
  };
}

export function validateSitemapEntries(entries, { xmlBytes = 0 } = {}) {
  const errors = [];
  const warnings = [];
  const urls = new Set();
  const entriesByUrl = new Map();

  if (entries.length > 50_000) {
    errors.push(`Sitemap has ${entries.length} URLs; the limit is 50,000`);
  }
  if (xmlBytes > 50 * 1024 * 1024) {
    errors.push(`Sitemap is ${xmlBytes} bytes; the uncompressed limit is 50 MB`);
  }

  for (const entry of entries) {
    if (urls.has(entry.loc)) {
      errors.push(`Duplicate sitemap URL: ${entry.loc}`);
      continue;
    }
    urls.add(entry.loc);
    entriesByUrl.set(entry.loc, entry);

    let parsed;
    try {
      parsed = new URL(entry.loc);
    } catch {
      errors.push(`Invalid sitemap URL: ${entry.loc}`);
      continue;
    }

    if (parsed.origin !== SITE_ORIGIN) {
      errors.push(`Sitemap URL uses an unexpected origin: ${entry.loc}`);
    }
    if (parsed.search || parsed.hash) {
      errors.push(`Sitemap URL must not contain query or hash data: ${entry.loc}`);
    }

    const contentPath = stripLocalePrefix(parsed.pathname);
    if (
      NON_INDEXABLE_ROUTE_PREFIXES.some(
        (prefix) =>
          contentPath === prefix || contentPath.startsWith(`${prefix}/`),
      )
    ) {
      errors.push(`Non-indexable utility route is present in sitemap: ${entry.loc}`);
    }
    if (RETIRED_PATHS.has(contentPath)) {
      errors.push(`Retired route is present in sitemap: ${entry.loc}`);
    }
    if (TEST_ENTITY_MARKERS.some((marker) => entry.loc.includes(marker))) {
      errors.push(`Test entity is present in sitemap: ${entry.loc}`);
    }
    if (
      /\/hospitals\/hospital-(?:[0-9a-f]{8,}|[0-9a-f-]{20,}|[a-z0-9]{8,})(?:\/|$)/i.test(
        parsed.pathname,
      )
    ) {
      errors.push(`Generated hospital slug is present in sitemap: ${entry.loc}`);
    }
    if (
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:\/|$)/i.test(
        parsed.pathname,
      )
    ) {
      errors.push(`Database UUID is exposed in an SEO URL: ${entry.loc}`);
    }

    for (const [hreflang, href] of Object.entries(entry.alternates)) {
      if (!Object.values(HREFLANG_BY_LOCALE).includes(hreflang) && hreflang !== "x-default") {
        errors.push(`${entry.loc} has unsupported sitemap hreflang ${hreflang}`);
      }
      let alternateUrl;
      try {
        alternateUrl = new URL(href);
      } catch {
        errors.push(`${entry.loc} has invalid alternate URL ${href}`);
        continue;
      }
      if (alternateUrl.origin !== SITE_ORIGIN) {
        errors.push(`${entry.loc} has alternate on another origin: ${href}`);
      }
      if (alternateUrl.search || alternateUrl.hash) {
        errors.push(`${entry.loc} has alternate with query or hash data: ${href}`);
      }
    }
  }

  for (const entry of entries) {
    const locale = localeForRoute(new URL(entry.loc).pathname);
    const selfHreflang = HREFLANG_BY_LOCALE[locale];
    if (entry.alternates[selfHreflang] !== entry.loc) {
      errors.push(
        `${entry.loc} must include a self hreflang ${selfHreflang}`,
      );
    }

    if (entry.alternates.en) {
      if (entry.alternates["x-default"] !== entry.alternates.en) {
        errors.push(`${entry.loc} x-default must equal its English alternate`);
      }
    } else if (entry.alternates["x-default"]) {
      errors.push(`${entry.loc} has x-default without an English alternate`);
    }

    for (const [hreflang, href] of Object.entries(entry.alternates)) {
      if (!urls.has(href)) {
        errors.push(`${entry.loc} points hreflang ${hreflang} to missing URL ${href}`);
        continue;
      }
      if (hreflang === "x-default") continue;
      const target = entriesByUrl.get(href);
      if (target?.alternates[selfHreflang] !== entry.loc) {
        errors.push(
          `${entry.loc} and ${href} do not have reciprocal hreflang annotations`,
        );
      }
    }
  }

  return { errors, warnings, urls, entriesByUrl };
}

export function validateHtmlDocument({
  routePath,
  seo,
  sitemapUrls,
  sitemapEntry,
}) {
  const errors = [];
  const warnings = [];
  const expectedUrl = urlForRoute(routePath);
  const locale = localeForRoute(routePath);
  const expectedLang = HREFLANG_BY_LOCALE[locale];
  const indexable = isIndexableRobotsContent(seo.robots);

  for (const [name, count] of Object.entries(seo.counts)) {
    if (count !== 1) {
      errors.push(`${expectedUrl} must contain exactly one ${name}; found ${count}`);
    }
  }
  if (seo.title.length < 10) {
    errors.push(`${expectedUrl} has an empty or unhelpfully short title`);
  }
  const minimumDescriptionLength = locale === "zh" ? 12 : 40;
  if (seo.description.length < minimumDescriptionLength) {
    errors.push(`${expectedUrl} has an empty or unhelpfully short description`);
  }
  if (!seo.h1) {
    errors.push(`${expectedUrl} has no H1 in initial HTML`);
  }
  if (!seo.hasPrerenderedContent) {
    errors.push(`${expectedUrl} has no prerendered SEO content in initial HTML`);
  }
  if (seo.canonical !== expectedUrl) {
    errors.push(
      `${expectedUrl} canonical must self-reference; found ${seo.canonical || "(missing)"}`,
    );
  }
  if (seo.ogUrl !== expectedUrl) {
    errors.push(
      `${expectedUrl} og:url must match canonical; found ${seo.ogUrl || "(missing)"}`,
    );
  }
  if (seo.lang !== expectedLang) {
    errors.push(`${expectedUrl} html lang must be ${expectedLang}; found ${seo.lang}`);
  }
  const expectedDir = locale === "ar" ? "rtl" : "ltr";
  if (seo.dir !== expectedDir) {
    errors.push(`${expectedUrl} html dir must be ${expectedDir}; found ${seo.dir}`);
  }
  if (seo.duplicateAlternates.length > 0) {
    errors.push(
      `${expectedUrl} repeats hreflang values: ${seo.duplicateAlternates.join(", ")}`,
    );
  }

  if (indexable) {
    if (!sitemapUrls.has(expectedUrl)) {
      errors.push(`${expectedUrl} is indexable but missing from sitemap`);
    }
    const selfHreflang = HREFLANG_BY_LOCALE[locale];
    if (seo.alternates[selfHreflang] !== expectedUrl) {
      errors.push(`${expectedUrl} is missing self hreflang ${selfHreflang}`);
    }
    if (seo.alternates.en) {
      if (seo.alternates["x-default"] !== seo.alternates.en) {
        errors.push(`${expectedUrl} x-default must equal its English alternate`);
      }
    } else if (seo.alternates["x-default"]) {
      errors.push(`${expectedUrl} has x-default without an English alternate`);
    }
    for (const [hreflang, href] of Object.entries(seo.alternates)) {
      if (!sitemapUrls.has(href)) {
        errors.push(
          `${expectedUrl} HTML hreflang ${hreflang} points outside the sitemap: ${href}`,
        );
      }
    }
    if (
      sitemapEntry
      && JSON.stringify(seo.alternates) !== JSON.stringify(sitemapEntry.alternates)
    ) {
      errors.push(`${expectedUrl} HTML and sitemap hreflang mappings differ`);
    }
  } else {
    if (sitemapUrls.has(expectedUrl)) {
      errors.push(`${expectedUrl} is noindex but is present in sitemap`);
    }
    if (Object.keys(seo.alternates).length > 0) {
      errors.push(`${expectedUrl} is noindex but still publishes hreflang links`);
    }
  }

  return { errors, warnings, indexable, expectedUrl };
}

export function validateProtectedUrls(currentUrls, contract, approvals) {
  const errors = [];
  const warnings = [];
  const protectedUrls = new Set(contract?.urls ?? []);
  const removalEntries = approvals?.removals ?? [];
  const removals = new Map(removalEntries.map((entry) => [entry.url, entry]));

  for (const entry of removalEntries) {
    if (!protectedUrls.has(entry.url)) {
      errors.push(`Approved removal is not in the protected baseline: ${entry.url}`);
    }
    if (!entry.reason || entry.reason.trim().length < 10) {
      errors.push(`Approved removal needs a meaningful reason: ${entry.url}`);
    }
    if (![301, 308, 410].includes(entry.expectedStatus)) {
      errors.push(`Approved removal needs expectedStatus 301, 308, or 410: ${entry.url}`);
    }
    if ([301, 308].includes(entry.expectedStatus)) {
      if (!entry.replacement) {
        errors.push(`Redirected removal needs a replacement URL: ${entry.url}`);
      } else if (!currentUrls.has(entry.replacement)) {
        errors.push(
          `Approved replacement is not present in current sitemap: ${entry.replacement}`,
        );
      }
    }
    if (currentUrls.has(entry.url)) {
      warnings.push(`Approved removal is stale because the URL still exists: ${entry.url}`);
    }
  }

  for (const protectedUrl of protectedUrls) {
    if (!currentUrls.has(protectedUrl) && !removals.has(protectedUrl)) {
      errors.push(
        `Protected SEO URL disappeared without an approved migration: ${protectedUrl}`,
      );
    }
  }

  return {
    errors,
    warnings,
    protectedCount: protectedUrls.size,
    additionCount: [...currentUrls].filter((url) => !protectedUrls.has(url)).length,
  };
}

export function validateProtectedMetadata(htmlByUrl, metadataContract) {
  const errors = [];
  const warnings = [];

  for (const expected of metadataContract?.pages ?? []) {
    const actual = htmlByUrl.get(expected.url);
    if (!actual) {
      errors.push(`Protected metadata page is missing from build: ${expected.url}`);
      continue;
    }

    for (const field of [
      "title",
      "description",
      "h1",
      "robots",
      "canonical",
      "lang",
      "dir",
    ]) {
      if (actual[field] !== expected[field]) {
        errors.push(
          `${expected.url} changed protected ${field}: `
          + `${JSON.stringify(expected[field])} -> ${JSON.stringify(actual[field])}`,
        );
      }
    }
    if (
      JSON.stringify(actual.alternates) !== JSON.stringify(expected.alternates)
    ) {
      errors.push(`${expected.url} changed its protected hreflang mapping`);
    }
  }

  return { errors, warnings };
}

async function readJson(filename) {
  return JSON.parse(await fs.readFile(filename, "utf8"));
}

export async function validateSeoArtifacts({
  distDir,
  protectedUrlsPath,
  approvedRemovalsPath,
  protectedMetadataPath,
}) {
  const sitemapPath = path.join(distDir, "sitemap.xml");
  const xml = await fs.readFile(sitemapPath, "utf8");
  const entries = parseSitemap(xml);
  const sitemapValidation = validateSitemapEntries(entries, {
    xmlBytes: Buffer.byteLength(xml),
  });
  const errors = [...sitemapValidation.errors];
  const warnings = [...sitemapValidation.warnings];
  const indexFiles = await findIndexFiles(distDir);
  const htmlByUrl = new Map();
  let indexableHtmlCount = 0;

  for (const filename of indexFiles) {
    const routePath = routeForIndexFile(distDir, filename);
    const html = await fs.readFile(filename, "utf8");
    const seo = extractHtmlSeo(html);
    const expectedUrl = urlForRoute(routePath);
    htmlByUrl.set(expectedUrl, seo);
    const result = validateHtmlDocument({
      routePath,
      seo,
      sitemapUrls: sitemapValidation.urls,
      sitemapEntry: sitemapValidation.entriesByUrl.get(expectedUrl),
    });
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    if (result.indexable) indexableHtmlCount += 1;
  }

  for (const sitemapUrl of sitemapValidation.urls) {
    if (!htmlByUrl.has(sitemapUrl)) {
      errors.push(`Sitemap URL has no generated HTML artifact: ${sitemapUrl}`);
    }
  }

  const contract = await readJson(protectedUrlsPath);
  const approvals = await readJson(approvedRemovalsPath);
  const protectedValidation = validateProtectedUrls(
    sitemapValidation.urls,
    contract,
    approvals,
  );
  errors.push(...protectedValidation.errors);
  warnings.push(...protectedValidation.warnings);

  const metadataContract = await readJson(protectedMetadataPath);
  const metadataValidation = validateProtectedMetadata(
    htmlByUrl,
    metadataContract,
  );
  errors.push(...metadataValidation.errors);
  warnings.push(...metadataValidation.warnings);

  return {
    errors,
    warnings,
    stats: {
      sitemapUrls: sitemapValidation.urls.size,
      generatedPages: indexFiles.length,
      indexablePages: indexableHtmlCount,
      protectedUrls: protectedValidation.protectedCount,
      newUrls: protectedValidation.additionCount,
      protectedMetadataPages: metadataContract.pages?.length ?? 0,
    },
  };
}

export function isXmlContentType(contentType) {
  const normalized = String(contentType || "").toLowerCase();
  return XML_CONTENT_TYPES.some((type) => normalized.includes(type));
}

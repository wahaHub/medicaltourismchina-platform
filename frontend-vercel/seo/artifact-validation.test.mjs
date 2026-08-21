import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  extractHtmlSeo,
  parseSitemap,
  SITE_ORIGIN,
  validateHtmlDocument,
  validateProtectedMetadata,
  validateProtectedUrls,
  validateSeoArtifacts,
  validateSitemapEntries,
} from "./artifact-validation.mjs";

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true })
    ),
  );
});

function sitemapXml(entries) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map(({ loc, alternates }) => [
      "  <url>",
      `    <loc>${loc}</loc>`,
      ...Object.entries(alternates).map(
        ([hreflang, href]) =>
          `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`,
      ),
      "  </url>",
    ].join("\n")),
    "</urlset>",
    "",
  ].join("\n");
}

function seoHtml({
  url,
  lang,
  dir = "ltr",
  robots = "index, follow",
  title = "Medical treatment page | Medora Health",
  description = "A complete patient-facing description for medical treatment planning in China.",
  h1 = "Medical treatment in China",
  alternates = {},
}) {
  return [
    "<!doctype html>",
    `<html lang="${lang}" dir="${dir}">`,
    "<head>",
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${url}" />`,
    ...Object.entries(alternates).map(
      ([hreflang, href]) =>
        `<link rel="alternate" hreflang="${hreflang}" href="${href}" />`,
    ),
    `<meta property="og:url" content="${url}" />`,
    "</head>",
    `<body><div id="root"><main data-seo-prerender="true"><h1>${h1}</h1><p>${description}</p></main></div></body>`,
    "</html>",
  ].join("\n");
}

describe("SEO sitemap validation", () => {
  it("accepts absolute, reciprocal localized URLs with x-default", () => {
    const en = `${SITE_ORIGIN}/telemedicine`;
    const ru = `${SITE_ORIGIN}/ru/telemedicine`;
    const entries = parseSitemap(sitemapXml([
      {
        loc: en,
        alternates: { en, ru, "x-default": en },
      },
      {
        loc: ru,
        alternates: { en, ru, "x-default": en },
      },
    ]));

    const result = validateSitemapEntries(entries);
    expect(result.errors).toEqual([]);
    expect(result.urls).toEqual(new Set([en, ru]));
  });

  it("rejects utility URLs, exposed IDs, and broken hreflang targets", () => {
    const search = `${SITE_ORIGIN}/search?dept=cardiology`;
    const procedure = `${SITE_ORIGIN}/procedures/33246eb1-5dd1-400b-9a31-43607966e997`;
    const entries = parseSitemap(sitemapXml([
      {
        loc: search,
        alternates: { en: search, "x-default": search },
      },
      {
        loc: procedure,
        alternates: {
          en: procedure,
          ru: `${SITE_ORIGIN}/ru/procedures/missing`,
          "x-default": procedure,
        },
      },
    ]));

    const result = validateSitemapEntries(entries);
    expect(result.errors.join("\n")).toContain("query or hash");
    expect(result.errors.join("\n")).toContain("Non-indexable utility route");
    expect(result.errors.join("\n")).toContain("Test entity");
    expect(result.errors.join("\n")).toContain("Database UUID");
    expect(result.errors.join("\n")).toContain("missing URL");
  });
});

describe("generated HTML validation", () => {
  it("requires self-canonical initial HTML and matching HTML/sitemap hreflang", () => {
    const en = `${SITE_ORIGIN}/telemedicine`;
    const ru = `${SITE_ORIGIN}/ru/telemedicine`;
    const alternates = { en, ru, "x-default": en };
    const seo = extractHtmlSeo(seoHtml({
      url: ru,
      lang: "ru",
      h1: "Телемедицина в Китае",
      alternates,
    }));

    const result = validateHtmlDocument({
      routePath: "/ru/telemedicine",
      seo,
      sitemapUrls: new Set([en, ru]),
      sitemapEntry: { loc: ru, alternates },
    });

    expect(result.errors).toEqual([]);
    expect(result.indexable).toBe(true);
  });

  it("rejects noindex pages in the sitemap and missing prerendered content", () => {
    const url = `${SITE_ORIGIN}/ru/search`;
    const html = seoHtml({
      url,
      lang: "ru",
      robots: "noindex, follow",
      alternates: {},
    }).replace(' data-seo-prerender="true"', "");
    const result = validateHtmlDocument({
      routePath: "/ru/search",
      seo: extractHtmlSeo(html),
      sitemapUrls: new Set([url]),
    });

    expect(result.errors.join("\n")).toContain("no prerendered SEO content");
    expect(result.errors.join("\n")).toContain("noindex but is present in sitemap");
  });

  it("uses a language-aware description threshold for concise Chinese metadata", () => {
    const url = `${SITE_ORIGIN}/zh/telemedicine`;
    const alternates = { "zh-Hans": url };
    const result = validateHtmlDocument({
      routePath: "/zh/telemedicine",
      seo: extractHtmlSeo(seoHtml({
        url,
        lang: "zh-Hans",
        title: "中国远程医疗咨询｜Medora Health",
        description: "在赴华就医前申请视频问诊或专家书面第二诊疗意见。",
        h1: "中国远程医疗与专家第二诊疗意见",
        alternates,
      })),
      sitemapUrls: new Set([url]),
      sitemapEntry: { loc: url, alternates },
    });

    expect(result.errors).toEqual([]);
  });
});

describe("protected SEO contracts", () => {
  it("allows additions but rejects silent removals", () => {
    const original = `${SITE_ORIGIN}/procedures/aortic-valve-repair`;
    const addition = `${SITE_ORIGIN}/procedures/new-treatment`;
    const contract = { urls: [original] };

    expect(
      validateProtectedUrls(new Set([original, addition]), contract, {
        removals: [],
      }),
    ).toMatchObject({ errors: [], additionCount: 1 });

    expect(
      validateProtectedUrls(new Set([addition]), contract, { removals: [] })
        .errors[0],
    ).toContain("disappeared without an approved migration");
  });

  it("requires redirects to declare a replacement that remains indexable", () => {
    const oldUrl = `${SITE_ORIGIN}/procedures/old-slug`;
    const newUrl = `${SITE_ORIGIN}/procedures/new-slug`;
    const result = validateProtectedUrls(
      new Set([newUrl]),
      { urls: [oldUrl] },
      {
        removals: [{
          url: oldUrl,
          reason: "Canonical slug migration for clearer patient-facing URL.",
          expectedStatus: 301,
          replacement: newUrl,
        }],
      },
    );

    expect(result.errors).toEqual([]);
  });

  it("locks critical page metadata exactly", () => {
    const url = `${SITE_ORIGIN}/`;
    const actual = extractHtmlSeo(seoHtml({
      url,
      lang: "en",
      title: "Protected homepage title",
      h1: "Protected homepage heading",
      alternates: { en: url, "x-default": url },
    }));
    const expected = {
      url,
      title: actual.title,
      description: actual.description,
      h1: actual.h1,
      robots: actual.robots,
      canonical: actual.canonical,
      lang: actual.lang,
      dir: actual.dir,
      alternates: actual.alternates,
    };

    expect(
      validateProtectedMetadata(new Map([[url, actual]]), {
        pages: [expected],
      }).errors,
    ).toEqual([]);

    expect(
      validateProtectedMetadata(
        new Map([[url, { ...actual, title: "Changed title" }]]),
        { pages: [expected] },
      ).errors[0],
    ).toContain("changed protected title");
  });

  it("skips metadata checks for an explicitly approved URL migration", () => {
    const oldUrl = `${SITE_ORIGIN}/visa`;
    const result = validateProtectedMetadata(
      new Map(),
      { pages: [{ url: oldUrl }] },
      {
        removals: [{
          url: oldUrl,
          reason: "The Guides hub moved to a dedicated namespace.",
          expectedStatus: 308,
          replacement: `${SITE_ORIGIN}/guides`,
        }],
      },
    );

    expect(result.errors).toEqual([]);
  });
});

describe("full build artifact validation", () => {
  it("cross-checks sitemap, generated HTML, URL baseline, and metadata baseline", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "medora-seo-contract-"));
    temporaryDirectories.push(root);
    const distDir = path.join(root, "dist");
    const contractsDir = path.join(root, "contracts");
    const en = `${SITE_ORIGIN}/telemedicine`;
    const ru = `${SITE_ORIGIN}/ru/telemedicine`;
    const alternates = { en, ru, "x-default": en };
    const enSeo = extractHtmlSeo(seoHtml({
      url: en,
      lang: "en",
      alternates,
    }));

    await fs.mkdir(path.join(distDir, "telemedicine"), { recursive: true });
    await fs.mkdir(path.join(distDir, "ru", "telemedicine"), { recursive: true });
    await fs.mkdir(contractsDir, { recursive: true });
    await fs.writeFile(
      path.join(distDir, "sitemap.xml"),
      sitemapXml([
        { loc: en, alternates },
        { loc: ru, alternates },
      ]),
    );
    await fs.writeFile(
      path.join(distDir, "telemedicine", "index.html"),
      seoHtml({ url: en, lang: "en", alternates }),
    );
    await fs.writeFile(
      path.join(distDir, "ru", "telemedicine", "index.html"),
      seoHtml({
        url: ru,
        lang: "ru",
        h1: "Телемедицина в Китае",
        alternates,
      }),
    );
    await fs.writeFile(
      path.join(contractsDir, "protected-urls.json"),
      JSON.stringify({ urls: [en, ru] }),
    );
    await fs.writeFile(
      path.join(contractsDir, "approved-url-removals.json"),
      JSON.stringify({ removals: [] }),
    );
    await fs.writeFile(
      path.join(contractsDir, "protected-page-metadata.json"),
      JSON.stringify({
        pages: [{
          url: en,
          title: enSeo.title,
          description: enSeo.description,
          h1: enSeo.h1,
          robots: enSeo.robots,
          canonical: enSeo.canonical,
          lang: enSeo.lang,
          dir: enSeo.dir,
          alternates: enSeo.alternates,
        }],
      }),
    );

    const result = await validateSeoArtifacts({
      distDir,
      protectedUrlsPath: path.join(contractsDir, "protected-urls.json"),
      approvedRemovalsPath: path.join(
        contractsDir,
        "approved-url-removals.json",
      ),
      protectedMetadataPath: path.join(
        contractsDir,
        "protected-page-metadata.json",
      ),
    });

    expect(result.errors).toEqual([]);
    expect(result.stats).toMatchObject({
      sitemapUrls: 2,
      generatedPages: 2,
      indexablePages: 2,
      protectedUrls: 2,
      newUrls: 0,
      protectedMetadataPages: 1,
    });
  });
});

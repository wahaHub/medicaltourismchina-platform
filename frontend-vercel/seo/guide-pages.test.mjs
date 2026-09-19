import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { makeGuidePages, makeGuideIndexPages, markdownToGuideSeoHtml } from "./guide-pages.mjs";
import { prepareGuideBody, stripGuideEditorialSections } from "../src/lib/guide-markdown.mjs";

import { getStaticPageMetadata } from "./static-pages.mjs";
import { GUIDE_LOCALES, guideHeadingId } from "../src/lib/guide-locales.mjs";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const SLUG = "budgeting-for-flights-and-accommodation-during-medical-travel";

describe("guide SEO pages", () => {
  it("generates indexable artifacts for every available guide translation", async () => {
    const pages = await makeGuidePages(PROJECT_ROOT);
    const targetPages = pages.filter((page) => page.path.endsWith(SLUG));
    const directories = await makeGuideIndexPages(PROJECT_ROOT);
    const listedUrls = directories.flatMap((page) => page.structuredData["@graph"][1].itemListElement.map((item) => item.url));
    expect([...new Set(listedUrls)].sort()).toEqual(pages.map((page) => page.canonical).sort());
    for (const directory of directories) {
      const metadata = getStaticPageMetadata("guides", directory.locale);
      expect(directory).toMatchObject({ ...metadata.locale, indexable: metadata.indexable });
      expect(directory.structuredData["@graph"][0]).toMatchObject({ name: metadata.locale.title, description: metadata.locale.description });
      const articlePages = pages.filter((page) => page.locale === directory.locale);
      for (const article of articlePages) expect(directory.contentHtml).toContain(`href="${article.path}"`);
    }


    const manifest = JSON.parse(await fs.readFile(path.join(PROJECT_ROOT, 'src/data/guides-manifest.json'), 'utf8'));
    expect(pages).toHaveLength(manifest.categories.flatMap((category) => category.guides).reduce((total, guide) => total + guide.locales.length, 0));
    for (const page of pages) {
      expect(page.contentHtml).not.toMatch(/<h[23](?: [^>]*)?>(?:Hero Image Review|Image Review|Hero Image Prompt)<\/h[23]>/);
    }
    const targetGuide = manifest.categories.flatMap((category) => category.guides).find((guide) => guide.slug === SLUG);
    const expectedAlternates = Object.fromEntries(targetGuide.locales.map((locale) => [locale,
      `${locale === "en" ? "" : `/${locale}`}/guides/cost-insurance-guides/${SLUG}`]));
    expect(targetPages.map((page) => page.path).sort()).toEqual(Object.values(expectedAlternates).sort());

    for (const page of targetPages) {
      expect(page.indexable).toBe(true);
      expect(page.ogType).toBe("article");
      expect(page.lastmod).toBe("2026-08-04");
      if (["en", "zh"].includes(page.locale)) expect(page.title).toBe(
        page.locale === "zh"
          ? "赴华医疗机票与住宿预算：把延期和改签算进去"
          : "China Medical Travel Flight and Accommodation Budget",
      );
      expect(page.alternates).toEqual(expectedAlternates);
      expect(page.contentHtml).toContain('data-seo-article-content="true"');
      expect(page.contentHtml).toContain(`lang="${page.locale === "zh" ? "zh-Hans" : page.locale}"`);
      expect(page.contentHtml).toContain(`dir="${page.locale === "ar" ? "rtl" : "ltr"}"`);
      expect(page.contentHtml).not.toContain("SEO Metadata");
      expect(page.structuredData["@graph"][0]["@type"]).toBe("Article");
      expect(page.structuredData["@graph"][0]).not.toHaveProperty("reviewedBy");
      expect(page.structuredData["@graph"][0].inLanguage).toBe(page.locale === "zh" ? "zh-Hans" : page.locale);
      expect(page.canonical).toBe(`https://www.medicaltourismchina.health${page.path}`);
      expect(page.structuredData["@graph"][1]["@type"]).toBe("BreadcrumbList");
    }
  }, 120000);

  it("keeps each translation's own modification date in sitemap data and Article metadata", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "guide-dates-"));
    try {
      await fs.mkdir(path.join(root, "src/data"), { recursive: true });
      await fs.mkdir(path.join(root, "public/guides/care"), { recursive: true });
      await fs.writeFile(path.join(root, "src/data/guides-manifest.json"), JSON.stringify({ categories: [
        { slug: "care", title: { en: "Care", zh: "就医" }, guides: [
          { slug: "one", title: { en: "Care in China", zh: "中国就医" }, updatedDate: "2026/09/19",
            updatedDateByLocale: { en: "2026/09/19", zh: "2026/08/04" } },
        ] },
      ] }));
      await fs.writeFile(path.join(root, "src/data/guides-seo-manifest.json"), '{"guides":{}}');
      for (const filename of ["one.md", "one.zh.md"]) {
        await fs.writeFile(path.join(root, "public/guides/care", filename), "## Content\n\nPatient-authored source content.");
      }
      const pages = await makeGuidePages(root);
      expect(pages).toHaveLength(2);
      for (const page of pages) {
        const expected = page.locale === 'en' ? '2026-09-19' : '2026-08-04';
        expect(page.lastmod).toBe(expected);
        expect(page.structuredData['@graph'][0].dateModified).toBe(expected);
      }
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("escapes guide markdown while preserving indexable headings and lists", () => {
    const html = markdownToGuideSeoHtml("## Key Takeaways\n\n- Safe <script>\n\n## Content\n\nRead **this** [source](https://example.com).");

    expect(html).toContain(`<h2 id="${guideHeadingId("Key Takeaways")}">Key takeaways</h2>`);
    expect(html).toContain("<li>Safe &lt;script&gt;</li>");
    expect(html).toContain('<p>Read <strong>this</strong> <a href="https://example.com">source</a>.</p>');
    expect(html).not.toContain("<script>");
  });

  it("uses shared source heading anchors while preserving formatted heading children", () => {
    const formatted = "Clinical **review** and [sources](https://example.com)";
    const html = markdownToGuideSeoHtml(`## Content\n\n## ${formatted}\n\n## 检查与治疗`, "zh");
    expect(html).toContain(`<h2 id="${guideHeadingId("Content")}">正文</h2>`);
    expect(html).toContain(`<h2 id="${guideHeadingId(formatted)}">Clinical <strong>review</strong> and <a href="https://example.com">sources</a></h2>`);
    expect(html).toContain(`<h2 id="${guideHeadingId("检查与治疗")}">检查与治疗</h2>`);
  });

  it.each(["Image Review", "Hero Image Review", "Hero Image Prompt"])(
    "removes %s while retaining subsequent sources and clinical review content",
    (heading) => {
      const markdown = `## Hero\n\n- **Title:** Example\n\n## Content\n\nPatient guidance.\n\n## ${heading}\n\nInternal production notes.\n\n### Decision\n\nKeep original illustration.\n\n## Sources\n\n[Evidence](https://example.com)\n\n## Imaging Review Before Treatment\n\nKeep this clinical guidance.\n\n## SEO Metadata\n\n- **Meta title:** Search title\n`;
      const cleaned = stripGuideEditorialSections(markdown);
      expect(cleaned).not.toContain("Internal production notes");
      expect(cleaned).not.toContain("Keep original illustration");
      expect(cleaned).toContain("## SEO Metadata");
      expect(cleaned).toContain("[Evidence](https://example.com)");
      expect(stripGuideEditorialSections(cleaned)).toBe(cleaned);
      const body = prepareGuideBody(markdown);
      expect(body).toContain("Keep this clinical guidance.");
      expect(body).not.toContain("## Hero");
      expect(body).not.toContain("Search title");
      expect(markdownToGuideSeoHtml(markdown)).not.toContain("Internal production notes");
    },
  );

  it("handles a final editorial section with CRLF or no trailing newline", () => {
    expect(stripGuideEditorialSections("## Content\r\n\r\nKeep.\r\n\r\n## Image Review\r\n\r\nDiscard."))
      .toBe("## Content\r\n\r\nKeep.\r\n\r\n");
    expect(stripGuideEditorialSections("## Content\n\nKeep.\n\n## Hero Image Prompt"))
      .toBe("## Content\n\nKeep.\n\n");
  });
});


describe("source-backed guide directories", () => {
  it("keeps GFM tables, nested lists, references, heading levels and safe URLs", () => {
    const html = markdownToGuideSeoHtml(`## Content

#### Detailed [reference](https://example.org)

| Test | Value |
| --- | --- |
| A | **B** |

3. First
   - Nested [source][ref]

[ref]: https://example.org/evidence

[unsafe](javascript:alert%281%29)

<img src=x onerror=alert(1)>
`);
    expect(html).toContain('<h4>Detailed <a href="https://example.org">reference</a></h4>');
    expect(html).toContain("<table>");
    expect(html).toContain("<th>Test</th>");
    expect(html).toContain("<td><strong>B</strong></td>");
    expect(html).toContain('<ol start="3">');
    expect(html).toContain('<a href="https://example.org/evidence">source</a>');
    expect(html).toContain("<ul>");
    expect(html).not.toMatch(/href="javascript:|<img[^>]*onerror/);
  });

  it("uses actual nonempty sources, including Chinese-only guides, and omits phantom languages", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "guide-seo-"));
    try {
      await fs.mkdir(path.join(root, "src/data"), { recursive: true });
      await fs.mkdir(path.join(root, "public/guides/care"), { recursive: true });
      await fs.writeFile(path.join(root, "src/data/guides-manifest.json"), JSON.stringify({ categories: [
        { slug: "care", title: { en: "Care", zh: "就医" }, guides: [
          { slug: "one", locales: ["en", "zh", "fr"], title: { en: "One", zh: "一", fr: "Un" }, updatedDate: "2026/02/30" },
          { slug: "two", locales: ["en"], title: { zh: '二 <script>' } },
        ] },
      ] }));
      await fs.writeFile(path.join(root, "src/data/guides-seo-manifest.json"), JSON.stringify({ guides: {
        "care/one": { reviewedBy: { en: "Medical review required before publication" } },
      } }));
      for (const filename of ["one.md", "one.zh.md", "two.zh.md"]) {
        await fs.writeFile(path.join(root, "public/guides/care", filename), "## Content\n\n[Source](https://example.com)");
      }
      await fs.writeFile(path.join(root, "public/guides/care/one.fr.md"), " ");
      const articles = await makeGuidePages(root);
      const directories = await makeGuideIndexPages(root);
      expect(articles.map((page) => page.path)).toEqual(["/guides/care/one", "/zh/guides/care/one", "/zh/guides/care/two"]);
      expect(directories.map((page) => page.path)).toEqual(GUIDE_LOCALES.map((locale) => locale === "en" ? "/guides" : `/${locale}/guides`));
      for (const article of articles) {
        expect(article.lastmod).toBeUndefined();
        expect(article.structuredData["@graph"][0]).not.toHaveProperty("reviewedBy");
        expect(article.alternates[article.locale]).toBe(article.path);
        for (const [locale, pathname] of Object.entries(article.alternates)) {
          const alternate = articles.find((page) => page.path === pathname);
          expect(alternate.locale).toBe(locale);
          expect(alternate.alternates[article.locale]).toBe(article.path);
        }
        const directory = directories.find((page) => page.locale === article.locale);
        expect(directory.contentHtml).toContain(`href="${article.path}"`);
      }
      for (const directory of directories) {
        expect(directory.canonical).toBe(`https://www.medicaltourismchina.health${directory.path}`);
        const metadata = getStaticPageMetadata("guides", directory.locale);
        expect(directory.indexable).toBe(metadata.indexable);
        expect(directory.alternates).toEqual(Object.fromEntries(metadata.indexableLocales.map((locale) =>
          [locale, locale === "en" ? "/guides" : `/${locale}/guides`])));
        const [collection, list] = directory.structuredData["@graph"];
        expect(collection["@type"]).toBe("CollectionPage");
        expect(collection.mainEntity["@id"]).toBe(list["@id"]);
        const linkedLocale = directory.locale === "zh" ? "zh" : "en";
        expect(list.numberOfItems).toBe(articles.filter((page) => page.locale === linkedLocale).length);
        expect(list.itemListElement.map((item) => item.url)).toEqual(articles.filter((page) => page.locale === linkedLocale).map((page) => page.canonical));
        if (!["en", "zh"].includes(directory.locale)) {
          expect(directory.contentHtml).toContain('data-guide-language-notice="en"');
          expect(directory.contentHtml).toContain('hreflang="en" lang="en"');
          expect(directory.contentHtml).not.toContain(`href="/${directory.locale}/guides/`);
        }
        expect(list.itemListElement.map((item) => item.position)).toEqual(directory.locale === "zh" ? [1, 2] : [1]);
        expect(directory.contentHtml).not.toContain("<script>");
        expect(directory.contentHtml).not.toContain("/fr/");
      }
      expect(directories[1].contentHtml).toContain("二 &lt;script&gt;");
      // Publishing one actual French body switches that directory to only French sources.
      await fs.writeFile(path.join(root, "public/guides/care/one.fr.md"), "## Content\n\nTexte français.");
      const french = (await makeGuideIndexPages(root)).find((page) => page.locale === "fr");
      expect(french.contentHtml).toContain('href="/fr/guides/care/one"');
      expect(french.contentHtml).not.toContain('href="/guides/care/one"');
      expect(french.contentHtml).not.toContain('data-guide-language-notice');
      expect(french.structuredData["@graph"][1].numberOfItems).toBe(1);

    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });
});

import path from "node:path";

import { describe, expect, it } from "vitest";

import { makeGuidePages, markdownToGuideSeoHtml } from "./guide-pages.mjs";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const SLUG = "budgeting-for-flights-and-accommodation-during-medical-travel";

describe("guide SEO pages", () => {
  it("generates indexable English and Chinese artifacts for every guide", async () => {
    const pages = await makeGuidePages(PROJECT_ROOT);
    const targetPages = pages.filter((page) => page.path.endsWith(SLUG));

    expect(pages).toHaveLength(410);
    expect(targetPages.map((page) => page.path).sort()).toEqual([
      `/guides/cost-insurance-guides/${SLUG}`,
      `/zh/guides/cost-insurance-guides/${SLUG}`,
    ]);

    for (const page of targetPages) {
      expect(page.indexable).toBe(true);
      expect(page.ogType).toBe("article");
      expect(page.lastmod).toBe("2026-08-04");
      expect(page.title).toBe(
        page.locale === "zh"
          ? "赴华医疗机票与住宿预算：把延期和改签算进去"
          : "China Medical Travel Flight and Accommodation Budget",
      );
      expect(page.alternates).toEqual({
        en: `/guides/cost-insurance-guides/${SLUG}`,
        zh: `/zh/guides/cost-insurance-guides/${SLUG}`,
      });
      expect(page.contentHtml).toContain('data-seo-article-content="true"');
      expect(page.contentHtml).not.toContain("SEO Metadata");
      expect(page.structuredData["@graph"][0]["@type"]).toBe("Article");
      expect(page.structuredData["@graph"][0].reviewedBy.name).toContain("Medora Health");
      expect(page.structuredData["@graph"][1]["@type"]).toBe("BreadcrumbList");
    }
  });

  it("escapes guide markdown while preserving indexable headings and lists", () => {
    const html = markdownToGuideSeoHtml("## Key Takeaways\n\n- Safe <script>\n\n## Content\n\nRead **this** [source](https://example.com).");

    expect(html).toContain("<h2>Key Takeaways</h2>");
    expect(html).toContain("<li>Safe &lt;script&gt;</li>");
    expect(html).toContain("<p>Read this source.</p>");
    expect(html).not.toContain("<script>");
  });
});

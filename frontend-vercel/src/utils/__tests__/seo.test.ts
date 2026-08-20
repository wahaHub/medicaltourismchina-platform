import { afterEach, describe, expect, it } from "vitest";

import { setPageSeo } from "@/utils/seo";

afterEach(() => {
  document.head
    .querySelectorAll('link[rel="alternate"], link[rel="canonical"], meta[name="robots"]')
    .forEach((element) => element.remove());
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
  window.history.replaceState({}, "", "/");
});

describe("setPageSeo", () => {
  it("sets article metadata and replaces page-scoped structured data", () => {
    window.history.replaceState({}, "", "/guides/cost-insurance-guides/example");

    setPageSeo({
      title: "Example medical travel guide",
      description: "A sufficiently detailed example description for a medical travel guide page.",
      path: "/guides/cost-insurance-guides/example",
      availableLocales: ["en", "zh"],
      ogType: "article",
      structuredData: { "@context": "https://schema.org", "@type": "Article" },
    });

    expect(document.querySelector('meta[property="og:type"]')?.getAttribute("content")).toBe("article");
    expect(document.getElementById("page-structured-data")?.textContent).toContain('"@type":"Article"');

    setPageSeo({
      title: "Another page",
      description: "A sufficiently detailed description for a non-article page on the website.",
      path: "/another-page",
    });
    expect(document.getElementById("page-structured-data")).toBeNull();
  });

  it("creates a self-canonical localized URL and reciprocal language alternates", () => {
    window.history.replaceState({}, "", "/ru/telemedicine");

    setPageSeo({
      title: "Телемедицинская консультация",
      description: "Описание",
      path: "/telemedicine",
      availableLocales: ["en", "ru", "fr"],
    });

    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://www.medicaltourismchina.health/ru/telemedicine",
    );
    expect(document.documentElement.lang).toBe("ru");
    expect(document.querySelector('link[hreflang="en"]')?.getAttribute("href")).toBe(
      "https://www.medicaltourismchina.health/telemedicine",
    );
    expect(document.querySelector('link[hreflang="ru"]')?.getAttribute("href")).toBe(
      "https://www.medicaltourismchina.health/ru/telemedicine",
    );
    expect(document.querySelector('link[hreflang="x-default"]')?.getAttribute("href")).toBe(
      "https://www.medicaltourismchina.health/telemedicine",
    );
  });

  it("removes language alternates from non-indexable utility pages", () => {
    window.history.replaceState({}, "", "/ru/search?dept=oncology");

    setPageSeo({
      title: "Поиск",
      description: "Поиск",
      path: "/search",
      robots: "noindex,follow",
      includeAlternates: false,
    });

    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe(
      "noindex,follow",
    );
    expect(document.querySelectorAll('link[rel="alternate"]')).toHaveLength(0);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://www.medicaltourismchina.health/ru/search",
    );
  });

  it("sets Arabic language direction and self-canonical metadata", () => {
    window.history.replaceState({}, "", "/ar/telemedicine");

    setPageSeo({
      title: "استشارة طبية عن بُعد",
      description: "وصف",
      path: "/telemedicine",
      availableLocales: ["en", "ar"],
    });

    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://www.medicaltourismchina.health/ar/telemedicine",
    );
    expect(document.querySelector('link[hreflang="ar"]')?.getAttribute("href")).toBe(
      "https://www.medicaltourismchina.health/ar/telemedicine",
    );
  });

  it("sets Indonesian language, LTR direction, and self-canonical metadata", () => {
    window.history.replaceState({}, "", "/id/telemedicine");

    setPageSeo({
      title: "Konsultasi telemedisin",
      description: "Deskripsi",
      path: "/telemedicine",
      availableLocales: ["en", "id"],
    });

    expect(document.documentElement.lang).toBe("id");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://www.medicaltourismchina.health/id/telemedicine",
    );
    expect(document.querySelector('link[hreflang="id"]')?.getAttribute("href")).toBe(
      "https://www.medicaltourismchina.health/id/telemedicine",
    );
  });

  it("maps the API zh locale to zh-Hans hreflang in the frontend", () => {
    window.history.replaceState({}, "", "/zh/procedures/valve-replacement");

    setPageSeo({
      title: "瓣膜置换",
      description: "手术介绍",
      path: "/procedures/valve-replacement",
      availableLocales: ["en", "zh"],
    });

    expect(
      document.querySelector('link[hreflang="zh-Hans"]')?.getAttribute("href"),
    ).toBe(
      "https://www.medicaltourismchina.health/zh/procedures/valve-replacement",
    );
    expect(document.querySelector('link[hreflang="zh"]')).toBeNull();
  });
});

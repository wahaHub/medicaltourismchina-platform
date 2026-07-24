import { afterEach, describe, expect, it } from "vitest";

import { setPageSeo } from "@/utils/seo";

afterEach(() => {
  document.head
    .querySelectorAll('link[rel="alternate"], link[rel="canonical"], meta[name="robots"]')
    .forEach((element) => element.remove());
  window.history.replaceState({}, "", "/");
});

describe("setPageSeo", () => {
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
});

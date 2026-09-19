// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import guidesManifest from "../data/guides-manifest.json";
import middleware, { config } from "../../middleware";
import vercelConfig from "../../vercel.json";

vi.mock("../data/guide-route-availability.json", async (importOriginal) => {
  const original = await importOriginal<{ default: Record<string, string[]> }>();
  return { default: {
    ...original.default,
    "middleware-fixture/translated-title-only": ["en"],
    "middleware-fixture/future-translation": ["en", "es", "ar", "id"],
    "middleware-fixture/no-english": ["zh"],
  } };
});

vi.mock("../data/guides-manifest.json", async (importOriginal) => {
  const original = await importOriginal<{ default: typeof guidesManifest }>();
  return { default: { ...original.default, categories: [
    ...original.default.categories,
    { slug: "middleware-fixture", guides: [
      { slug: "translated-title-only", title: { en: "English", es: "Spanish" }, locales: ["en"] },
      { slug: "future-translation", locales: ["en", "es", "ar", "id"] },
      { slug: "no-english", locales: ["zh"] },
    ] },
  ] } };
});

const origin = "https://www.medicaltourismchina.health";
const request = (path: string) => middleware(new Request(`${origin}${path}`, {
  headers: { cookie: "language=es; session=unchanged", "accept-language": "es" },
}));

afterEach(() => vi.unstubAllGlobals());

describe("guide HTTP middleware", () => {
  it("generated route map exactly covers actual manifest guides and locales without fixtures", async () => {
    const [manifest, availability] = await Promise.all([
      vi.importActual<{ default: typeof guidesManifest }>("../data/guides-manifest.json"),
      vi.importActual<{ default: Record<string, string[]> }>("../data/guide-route-availability.json"),
    ]);
    const expected = Object.fromEntries(manifest.default.categories.flatMap((category) =>
      category.guides.map((guide) => [`${category.slug}/${guide.slug}`, [...guide.locales].sort()]),
    ));
    const actual = Object.fromEntries(Object.entries(availability.default).map(([route, locales]) =>
      [route, [...locales].sort()],
    ));
    expect(actual).toEqual(expected);
  });

  it("matches guide trees independently of existing hospital and locale matchers", () => {
    expect(config.matcher).toContain("/guides/:path*");
    expect(config.matcher).toContain("/:locale/guides/:path*");
  });

  it.each(["", "/en", "/zh", "/es", "/fr", "/de", "/ru", "/ar", "/id"])(
    "passes the %s guide index through regardless of cookies", async (prefix) => {
      expect(await request(`${prefix}/guides`)).toBeUndefined();
      expect(await request(`${prefix}/guides/?category=unknown`)).toBeUndefined();
    },
  );

  it("uses every guide's actual manifest locales, including future translations", async () => {
    vi.stubGlobal("fetch", vi.fn());
    for (const category of guidesManifest.categories) {
      for (const guide of category.guides) {
        for (const locale of ["en", "zh", "es", "fr", "de", "ru", "ar", "id"]) {
          const path = `${locale === "en" ? "" : `/${locale}`}/guides/${category.slug}/${guide.slug}`;
          const response = await request(path);
          const rawPath = `/guides/${category.slug}/${guide.slug}${locale === "en" ? "" : `.${locale}`}.md`;
          const rawResponse = await request(rawPath);
          if (guide.locales.includes(locale)) {
            expect(response, path).toBeUndefined();
            expect(rawResponse, rawPath).toBeUndefined();
          } else {
            expect(response?.status, path).toBe(404);
            expect(response?.headers.get("x-robots-tag"), path).toContain("noindex");
            expect(rawResponse?.status, rawPath).toBe(404);
            expect(rawResponse?.headers.get("x-robots-tag"), rawPath).toContain("noindex");
          }
        }
      }
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    "/guides/unknown/unknown",
    "/guides/unknown/future-translation",
    "/guides/middleware-fixture/unknown",
    "/guides/middleware-fixture",
    "/guides/middleware-fixture/future-translation/extra",
    "/guides/middleware-fixture/%ZZ",
    "/guides/middleware-fixture/future%2Ftranslation",
    "/ar/guides/unknown",
    "/id/guides/unknown/unknown",
    "/ja/guides",
    "/ja/guides/middleware-fixture/future-translation",
    "/es/guides/middleware-fixture/translated-title-only?ref=test",
    "/guides/middleware-fixture/no-english",
    "/guides/unknown/unknown.md",
    "/guides/_categories/unknown.md",
    "/guides/_categories/%ZZ.jpg",
    "/guides/middleware-fixture/.md",
    "/guides/unknown/future-translation.zh.md",
    "/guides/middleware-fixture/unknown.zh.md",
    "/guides/middleware-fixture/translated-title-only.es.md",
    "/guides/middleware-fixture/no-english.md",
    "/guides/middleware-fixture/future-translation.ja.md",
    "/guides/middleware-fixture/future-translation.en.md",
    "/guides/middleware-fixture/future-translation.zh.ar.md",
    "/guides/middleware-fixture/future-translation.md/",
    "/zh/guides/middleware-fixture/future-translation.md",
    "/guides//future-translation",
    "/guides//future-translation.md",
    "/guides/middleware-fixture//future-translation.md",
    "/guides/%ZZ/future-translation.md",
    "/guides/middleware-fixture/%ZZ.md",
    "/guides/middleware-fixture/%E0%A4%A.md",
    "/guides/%2F/future-translation.md",
    "/guides/middleware-fixture/future%5Ctranslation.md",
    "/guides/middleware-fixture/future%00translation.md",
  ])("returns dedicated noindex 404 for %s", async (path) => {
    const response = await request(path);
    expect(response?.status).toBe(404);
    expect(response?.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(response?.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(response?.headers.get("cache-control")).toBe("no-store");
    expect(response?.headers.has("set-cookie")).toBe(false);
    expect(response?.headers.has("location")).toBe(false);
    expect(await response?.text()).toContain('<meta name="robots" content="noindex,nofollow">');
  });

  it.each([
    "/guides/_categories/china-healthcare-guides.jpg",
    "/guides/middleware-fixture/future-translation.md",
    "/guides/middleware-fixture/future-translation.ar.md?raw=1",
    "/guides/middleware-fixture/no-english.zh.md",
    "/guides/middleware-fixture/%66uture-translation.ar.md",
    "/guides/middleware-fixture/future-translation/",
    "/ar/guides/middleware-fixture/future-translation/?ref=test",
    "/guides/middleware-fixture/%66uture-translation",
    "/", "/search", "/assets/main.js", "/api/patient/me", "/guides-other/example",
    "/zh/treatment", "/ar/procedures/example", "/id/work-with-us/team",
  ])("passes through %s", async (path) => {
    vi.stubGlobal("fetch", vi.fn());
    expect(await request(path)).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("preserves retired-page and limited-locale behavior", async () => {
    expect((await request("/ar/insurance"))?.status).toBe(410);
    const response = await request("/id/unsupported?ref=test");
    expect(response?.status).toBe(308);
    expect(response?.headers.get("location")).toBe(`${origin}/unsupported?ref=test`);
  });

  it("integrates with the raw-source noindex header and English-prefix redirect", async () => {
    expect(vercelConfig.headers).toContainEqual({
      source: "/guides/:category/:article.md",
      headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
    });
    expect(vercelConfig.redirects).toContainEqual({
      source: "/en/:path*", destination: "/:path*", permanent: true,
    });
    // Vercel redirects run before middleware. Validate canonical targets here;
    // unit tests do not execute Vercel's routing engine.
    for (const suffix of ["", ".md", ".ar.md"]) {
      expect(await request(`/guides/middleware-fixture/future-translation${suffix}`)).toBeUndefined();
      expect((await request(`/guides/middleware-fixture/unknown${suffix}`))?.status).toBe(404);
    }
  });
});

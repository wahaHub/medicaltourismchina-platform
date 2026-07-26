import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const PROJECT_ROOT = path.resolve(__dirname, "../..");

const SITEMAP_PATHS = [
  "/",
  "/cosmetic-surgery",
  "/telemedicine",
  "/dental-treatment",
  "/stem-cell-therapy",
  "/treatment",
  "/hospitals",
  "/packages",
  "/visa",
];

const RETIRED_PATHS = [
  "/health-packages",
  "/hollywood-smile-veneers",
  "/rhinoplasty",
  "/double-eyelid-surgery",
  "/facial-liposuction",
  "/bariatric-surgery",
  "/insurance",
  "/faq",
  "/work-with-us",
  "/why-china",
];

describe("SEO public entrypoints", () => {
  it("publishes Medora Health homepage search metadata", () => {
    const indexPath = path.join(PROJECT_ROOT, "index.html");

    expect(fs.existsSync(indexPath)).toBe(true);

    const indexHtml = fs.readFileSync(indexPath, "utf8");
    expect(indexHtml).toContain("<title>Medora Health | Medical Tourism &amp; Telemedicine in China</title>");
    expect(indexHtml).toContain('meta name="description" content="Medora Health helps international patients access specialist consultations');
    expect(indexHtml).toContain('"@type": "WebSite"');
    expect(indexHtml).toContain('"name": "Medora Health"');
    expect(indexHtml).toContain('"name": "Telemedicine Consultation"');
    expect(indexHtml).toContain('"name": "Cancer Second Opinion"');
    expect(indexHtml).not.toContain("MedChina - Premium Medical Tourism to China");
  });

  it("publishes current public sitemap URLs and excludes retired pages", () => {
    const sitemapPath = path.join(PROJECT_ROOT, "public/sitemap.xml");

    expect(fs.existsSync(sitemapPath)).toBe(true);

    const sitemap = fs.readFileSync(sitemapPath, "utf8");
    for (const publicPath of SITEMAP_PATHS) {
      expect(sitemap).toContain(`https://www.medicaltourismchina.health${publicPath}`);
    }
    for (const retiredPath of RETIRED_PATHS) {
      expect(sitemap).not.toContain(
        `https://www.medicaltourismchina.health${retiredPath}`,
      );
    }
  });

  it("publishes robots.txt pointing crawlers at the sitemap", () => {
    const robotsPath = path.join(PROJECT_ROOT, "public/robots.txt");

    expect(fs.existsSync(robotsPath)).toBe(true);

    const robots = fs.readFileSync(robotsPath, "utf8");
    expect(robots).toContain("User-agent: Googlebot");
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Sitemap: https://www.medicaltourismchina.health/sitemap.xml");
  });

  it("registers current SEO landings and removes retired routes", () => {
    const appSource = fs.readFileSync(path.join(PROJECT_ROOT, "src/App.tsx"), "utf8");

    expect(appSource).toContain('path="/cosmetic-surgery"');
    expect(appSource).toContain('path="/cancer-treatment"');
    expect(appSource).toContain('path="/dental-treatment"');
    expect(appSource).toContain('path="/stem-cell-therapy"');
    expect(appSource).toContain('path="/hospital/:id"');
    for (const retiredPath of RETIRED_PATHS) {
      expect(appSource).not.toContain(`path="${retiredPath}"`);
    }
  });

  it("keeps hospital slug redirects at the Vercel browser-route boundary", () => {
    const middlewarePath = path.join(PROJECT_ROOT, "middleware.ts");
    const vercelConfigPath = path.join(PROJECT_ROOT, "vercel.json");

    expect(fs.existsSync(middlewarePath)).toBe(true);

    const middleware = fs.readFileSync(middlewarePath, "utf8");
    expect(middleware).toContain('"/hospitals/:path*"');
    expect(middleware).toContain('"/:locale(zh|es|fr|de|ru)/hospitals/:path*"');
    expect(middleware).toContain('"/ar/:path*"');
    expect(middleware).toContain('"/id/:path*"');
    expect(middleware).toContain("/slug-resolution");
    expect(middleware).toContain("RETIRED_PUBLIC_PATHS");
    expect(middleware).toContain("status: 410");
    expect(middleware).toContain('"x-robots-tag": "noindex, nofollow"');

    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, "utf8"));
    expect(vercelConfig.rewrites.at(-1)).toEqual({
      source: "/(.*)",
      destination: "/index.html",
    });
  });

  it("builds route-specific SEO HTML after the Vite application bundle", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(PROJECT_ROOT, "package.json"), "utf8"),
    );
    expect(packageJson.scripts.build).toContain("scripts/prerender-seo.mjs");
    expect(
      fs.existsSync(path.join(PROJECT_ROOT, "scripts/prerender-seo.mjs")),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(PROJECT_ROOT, "seo/static-pages.mjs")),
    ).toBe(true);
  });

  it("prerenders localized procedure pages and hydrates API-backed alternates", () => {
    const prerender = fs.readFileSync(
      path.join(PROJECT_ROOT, "scripts/prerender-seo.mjs"),
      "utf8",
    );
    const procedureDetail = fs.readFileSync(
      path.join(PROJECT_ROOT, "src/pages/ProcedureDetail.tsx"),
      "utf8",
    );

    expect(prerender).toContain(
      'const indexableProcedureLocales = ["en", "zh", "es", "fr", "de", "ru", "ar", "id"]',
    );
    expect(prerender).toContain('ru: "в Китае"');
    expect(prerender).toContain('ar: "في الصين"');
    expect(prerender).toContain('id: "di Tiongkok"');
    expect(procedureDetail).toContain(
      "title: getProcedureSeoTitle(procedure.name, pageLocale)",
    );
    expect(procedureDetail).toContain(
      "apiData.meta.available_locales",
    );
    expect(procedureDetail).toContain("availableLocales,");
    expect(procedureDetail).not.toContain("INDEXABLE_PROCEDURE_LOCALES");
  });
});

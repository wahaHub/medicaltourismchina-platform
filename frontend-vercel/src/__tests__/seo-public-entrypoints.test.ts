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
  "/why-china",
  "/visa",
  "/faq",
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

  it("publishes the legacy public sitemap URLs", () => {
    const sitemapPath = path.join(PROJECT_ROOT, "public/sitemap.xml");

    expect(fs.existsSync(sitemapPath)).toBe(true);

    const sitemap = fs.readFileSync(sitemapPath, "utf8");
    for (const publicPath of SITEMAP_PATHS) {
      expect(sitemap).toContain(`https://www.medicaltourismchina.health${publicPath}`);
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

  it("registers legacy SEO landing and hospital compatibility routes", () => {
    const appSource = fs.readFileSync(path.join(PROJECT_ROOT, "src/App.tsx"), "utf8");

    expect(appSource).toContain('path="/cosmetic-surgery"');
    expect(appSource).toContain('path="/cancer-treatment"');
    expect(appSource).toContain('path="/dental-treatment"');
    expect(appSource).toContain('path="/stem-cell-therapy"');
    expect(appSource).toContain('path="/hollywood-smile-veneers"');
    expect(appSource).toContain('path="/rhinoplasty"');
    expect(appSource).toContain('path="/double-eyelid-surgery"');
    expect(appSource).toContain('path="/facial-liposuction"');
    expect(appSource).toContain('path="/bariatric-surgery"');
    expect(appSource).toContain('path="/hospital/:id"');
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
});

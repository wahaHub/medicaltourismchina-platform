import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const PROJECT_ROOT = path.resolve(__dirname, "../..");

describe("FAQ page shell", () => {
  it("registers a public /faq route", () => {
    const appSource = fs.readFileSync(path.join(PROJECT_ROOT, "src/App.tsx"), "utf8");

    expect(appSource).toContain('path="/faq"');
    expect(appSource).toContain('path="/work-with-us"');
  });

  it("includes a dedicated FAQ page with China medical journey guidance", () => {
    const faqPath = path.join(PROJECT_ROOT, "src/pages/FAQ.tsx");
    const faqContentPath = path.join(PROJECT_ROOT, "src/pages/faqContent.ts");

    expect(fs.existsSync(faqPath)).toBe(true);
    expect(fs.existsSync(faqContentPath)).toBe(true);

    const faqSource = fs.readFileSync(faqPath, "utf8");
    const faqContentSource = fs.readFileSync(faqContentPath, "utf8");

    expect(faqSource).toContain("faqContent");
    expect(faqContentSource).toContain("Frequently Asked Questions");
    expect(faqContentSource).toMatch(/China medical travel/i);
  });
});

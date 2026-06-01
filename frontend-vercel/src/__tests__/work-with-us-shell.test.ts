import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const PROJECT_ROOT = path.resolve(__dirname, "../..");

describe("Work With Us partnership applications", () => {
  it("registers dedicated routes for each partnership application page", () => {
    const appSource = fs.readFileSync(path.join(PROJECT_ROOT, "src/App.tsx"), "utf8");

    expect(appSource).toContain('path="/work-with-us/hospitals/apply"');
    expect(appSource).toContain('path="/work-with-us/referral-partners/apply"');
    expect(appSource).toContain('path="/work-with-us/travel-services/apply"');
  });

  it("keeps the hub page free of the inline application form", () => {
    const pageSource = fs.readFileSync(path.join(PROJECT_ROOT, "src/pages/WorkWithUs.tsx"), "utf8");

    expect(pageSource).not.toContain("PartnershipApplicationForm");
  });

  it("points each CTA to a dedicated application page", () => {
    const contentSource = fs.readFileSync(path.join(PROJECT_ROOT, "src/pages/workWithUsContent.ts"), "utf8");

    expect(contentSource).toContain('ctaHref: "/work-with-us/hospitals/apply"');
    expect(contentSource).toContain('ctaHref: "/work-with-us/referral-partners/apply"');
    expect(contentSource).toContain('ctaHref: "/work-with-us/travel-services/apply"');
  });

  it("registers a public lambda route for partnership applications", () => {
    const lambdaIndexSource = fs.readFileSync(
      path.join(PROJECT_ROOT, "infrastructure/lambda/index.mjs"),
      "utf8",
    );

    expect(lambdaIndexSource).toContain("/partnership-applications");
  });
});

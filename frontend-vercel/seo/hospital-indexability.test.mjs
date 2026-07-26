import { describe, expect, it } from "vitest";

import { isHospitalExcludedFromSeo } from "./hospital-indexability.mjs";

describe("hospital SEO indexability", () => {
  it("excludes the production test hospital by stable entity ID", () => {
    expect(isHospitalExcludedFromSeo({
      id: "33246eb1-5dd1-400b-9a31-43607966e997",
      slug: "renamed-test-hospital",
    })).toBe(true);
  });

  it("also excludes the known test slug if an API response omits the ID", () => {
    expect(isHospitalExcludedFromSeo({ slug: "ceshi-logs" })).toBe(true);
  });

  it("keeps legitimate hospitals eligible for SEO generation", () => {
    expect(isHospitalExcludedFromSeo({
      id: "hospital-1",
      slug: "fuwai-hospital",
    })).toBe(false);
  });
});

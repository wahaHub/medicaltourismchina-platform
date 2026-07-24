import { describe, expect, it } from "vitest";

import { isGeneratedHospitalSlug, isSeoSafeSlug } from "@/utils/seo-slug";

describe("SEO slug validation", () => {
  it("accepts stable descriptive slugs", () => {
    expect(isSeoSafeSlug("beijing-cancer-hospital")).toBe(true);
    expect(isSeoSafeSlug("aortic-valve-repair")).toBe(true);
  });

  it("rejects generated or unsafe procedure paths from automatic indexing", () => {
    expect(isSeoSafeSlug("前列腺结石-钬激光碎石")).toBe(false);
    expect(isSeoSafeSlug("Cancer_Treatment")).toBe(false);
    expect(isGeneratedHospitalSlug("hospital-9990cee1")).toBe(true);
    expect(isGeneratedHospitalSlug("beijing-cancer-hospital")).toBe(false);
  });
});

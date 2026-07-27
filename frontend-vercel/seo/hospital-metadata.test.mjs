import { describe, expect, it } from "vitest";
import {
  getHospitalSeoDescription,
  getHospitalSeoTitle,
  isPublishableHospitalText,
} from "./hospital-metadata.mjs";

describe("hospital metadata", () => {
  it("prefers reviewed localized hospital copy over legacy short descriptions", () => {
    expect(getHospitalSeoDescription({
      overview: "Reviewed localized overview.",
      seo_description: "Reviewed SEO description.",
      full_description: "Reviewed full description.",
      short_description: "Legacy short description.",
    }, "Fallback")).toBe("Reviewed localized overview.");
  });

  it("filters verification placeholders from titles and descriptions", () => {
    expect(isPublishableHospitalText("待查证")).toBe(false);
    expect(isPublishableHospitalText("Pending verification")).toBe(false);
    expect(getHospitalSeoTitle({ seo_title: "TBD" }, "Sample Hospital")).toBe(
      "Sample Hospital | Medora Health",
    );
    expect(getHospitalSeoDescription({
      overview: "待核实",
      seo_description: "To be verified",
      full_description: "Published full description.",
      short_description: "Legacy short description.",
    }, "Fallback")).toBe("Published full description.");
  });

  it("uses a deterministic hospital-specific fallback when no copy is publishable", () => {
    expect(getHospitalSeoDescription({
      overview: "",
      seo_description: "Verification pending",
      full_description: null,
      short_description: "待确认",
    }, "Sample Hospital information and international patient services in China.")).toBe(
      "Sample Hospital information and international patient services in China.",
    );
  });
});

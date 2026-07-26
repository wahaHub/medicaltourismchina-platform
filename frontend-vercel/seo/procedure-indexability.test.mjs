import { describe, expect, it } from "vitest";
import {
  hasProcedureCompletenessCapability,
  isResolvedProcedureLocale,
  isIndexableProcedureTranslation,
} from "./procedure-indexability.mjs";

const complete = {
  content_complete: true,
  name: "Vascular reconstruction",
  waiting_time: "2–3 days",
  stay_in_china: "About 14 days",
  surgery_detailed_description: "A detailed patient-facing description.",
  when_is_needed: "Used after specialist evaluation when clinically appropriate.",
};

describe("isIndexableProcedureTranslation", () => {
  it("requires the API completeness capability to be present", () => {
    expect(hasProcedureCompletenessCapability(complete)).toBe(true);
    expect(
      hasProcedureCompletenessCapability({
        ...complete,
        content_complete: undefined,
      }),
    ).toBe(false);
  });

  it("rejects locale fallback while accepting regional variants", () => {
    expect(isResolvedProcedureLocale("ru-RU", "ru")).toBe(true);
    expect(isResolvedProcedureLocale("zh-CN", "zh")).toBe(true);
    expect(isResolvedProcedureLocale("ar", "en")).toBe(false);
    expect(isResolvedProcedureLocale("id", undefined)).toBe(false);
  });

  it("accepts a procedure translation with meaningful list and SEO content", () => {
    expect(isIndexableProcedureTranslation(complete)).toBe(true);
  });

  it.each([
    "content_complete",
    "name",
    "waiting_time",
    "stay_in_china",
    "surgery_detailed_description",
    "when_is_needed",
  ])("rejects title-only or incomplete translations missing %s", (field) => {
    expect(
      isIndexableProcedureTranslation({
        ...complete,
        [field]: field === "content_complete" ? false : " ",
      }),
    ).toBe(false);
  });
});

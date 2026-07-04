import { describe, expect, it } from "vitest";

import { ru } from "@/i18n/translations/ru";

describe("Russian Why China translations", () => {
  it("does not leave visible English section titles or corrupted placeholders", () => {
    const whyChinaCopy = Object.entries(ru)
      .filter(([key]) => key.startsWith("whyChina."))
      .map(([, value]) => value)
      .join("\n");

    expect(whyChinaCopy).not.toMatch(/HIGH-VOLUME SKILL/);
    expect(whyChinaCopy).not.toMatch(/ADVANCED MEDICAL DIAGNOSTICS/);
    expect(whyChinaCopy).not.toMatch(/TOP-TIER HOSPITAL FACILITIES/);
    expect(whyChinaCopy).not.toMatch(/COST-EFFECTIVE EXCELLENCE/);
    expect(whyChinaCopy).not.toMatch(/SUPERIOR QUALITY/);
    expect(whyChinaCopy).not.toMatch(/CUTTING-EDGE TECHNOLOGY/);
    expect(whyChinaCopy).not.toMatch(/SPECIALIZED EXPERTISE/);
    expect(whyChinaCopy).not.toMatch(/__PH\d+__/);
    expect(whyChinaCopy).not.toMatch(/[\uFFFD\uE000-\uF8FF]/);
  });
});

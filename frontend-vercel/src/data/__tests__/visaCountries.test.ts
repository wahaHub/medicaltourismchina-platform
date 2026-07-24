import { describe, expect, it } from "vitest";
import { getCountryName } from "@/data/visaCountries";

describe("getCountryName", () => {
  it("uses the existing curated translation when one is available", () => {
    expect(getCountryName("US", "es")).toBe("Estados Unidos");
  });

  it("uses Intl region names for supported locales without a curated entry", () => {
    const arabicName = getCountryName("US", "ar");

    expect(arabicName).not.toBe("United States");
    expect(arabicName).toMatch(/[\u0600-\u06ff]/);
  });

  it("falls back to English when the requested locale is invalid", () => {
    expect(getCountryName("US", "not_a_locale")).toBe("United States");
  });

  it("preserves unknown country codes", () => {
    expect(getCountryName("ZZ", "ar")).toBe("ZZ");
  });
});

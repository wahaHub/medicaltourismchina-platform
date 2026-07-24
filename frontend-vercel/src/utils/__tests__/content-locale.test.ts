import { describe, expect, it } from "vitest";

import {
  getContentApiLocale,
  isHospitalContentLocaleIndexable,
} from "@/utils/content-locale";

describe("getContentApiLocale", () => {
  it("falls back Russian content requests to English while content data is incomplete", () => {
    expect(getContentApiLocale("ru")).toBe("en");
  });

  it("keeps locales that have complete content API coverage", () => {
    expect(getContentApiLocale("en")).toBe("en");
    expect(getContentApiLocale("zh")).toBe("zh");
    expect(getContentApiLocale("es")).toBe("es");
    expect(getContentApiLocale("fr")).toBe("fr");
    expect(getContentApiLocale("de")).toBe("de");
  });

  it("only indexes hospital locales whose body content is actually localized", () => {
    expect(isHospitalContentLocaleIndexable("en")).toBe(true);
    expect(isHospitalContentLocaleIndexable("zh")).toBe(true);
    expect(isHospitalContentLocaleIndexable("ru")).toBe(false);
    expect(isHospitalContentLocaleIndexable("fr")).toBe(false);
    expect(isHospitalContentLocaleIndexable("es")).toBe(false);
    expect(isHospitalContentLocaleIndexable("de")).toBe(false);
  });
});

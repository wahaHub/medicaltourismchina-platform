import { describe, expect, it } from "vitest";

import { getContentApiLocale } from "@/utils/content-locale";

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
});

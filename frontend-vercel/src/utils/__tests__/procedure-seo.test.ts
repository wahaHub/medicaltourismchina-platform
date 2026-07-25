import { describe, expect, it } from "vitest";

import {
  getProcedureSeoTitle,
  INDEXABLE_PROCEDURE_LOCALES,
} from "@/utils/procedure-seo";

describe("procedure SEO", () => {
  it("keeps every completed procedure locale available for hreflang", () => {
    expect(INDEXABLE_PROCEDURE_LOCALES).toEqual([
      "en",
      "zh",
      "es",
      "fr",
      "de",
      "ru",
      "ar",
      "id",
    ]);
  });

  it.each([
    ["en", "Valve replacement in China | Medora Health"],
    ["zh", "瓣膜置换 | Medora Health"],
    ["es", "Reemplazo valvular en China | Medora Health"],
    ["fr", "Remplacement valvulaire en Chine | Medora Health"],
    ["de", "Klappenersatz in China | Medora Health"],
    ["ru", "Замена клапана в Китае | Medora Health"],
    ["ar", "استبدال الصمام في الصين | Medora Health"],
    ["id", "Penggantian katup di Tiongkok | Medora Health"],
  ] as const)("builds the %s title used after hydration", (locale, expected) => {
    const names = {
      en: "Valve replacement",
      zh: "瓣膜置换",
      es: "Reemplazo valvular",
      fr: "Remplacement valvulaire",
      de: "Klappenersatz",
      ru: "Замена клапана",
      ar: "استبدال الصمام",
      id: "Penggantian katup",
    } as const;

    expect(getProcedureSeoTitle(names[locale], locale)).toBe(expected);
  });
});

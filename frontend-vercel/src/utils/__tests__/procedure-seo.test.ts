import { describe, expect, it } from "vitest";

import {
  getProcedureAvailableLocales,
  getProcedureSeoDescription,
  getProcedureSeoTitle,
  isProcedureLocaleIndexable,
} from "@/utils/procedure-seo";

describe("procedure SEO", () => {
  it("uses only supported locales returned by the procedure API", () => {
    expect(
      getProcedureAvailableLocales([
        "en-US",
        "zh-CN",
        "ru",
        "ru-RU",
        "unsupported",
      ]),
    ).toEqual(["en", "zh", "ru"]);
    expect(getProcedureAvailableLocales(undefined)).toEqual([]);
  });

  it("indexes only a complete, non-fallback locale returned by the API", () => {
    expect(
      isProcedureLocaleIndexable({
        requestedLocale: "ru",
        resolvedLocale: "ru-RU",
        pageLocale: "ru",
        availableLocales: ["en", "ru"],
      }),
    ).toBe(true);
    expect(
      isProcedureLocaleIndexable({
        requestedLocale: "ru",
        resolvedLocale: "en",
        pageLocale: "ru",
        availableLocales: ["en"],
      }),
    ).toBe(false);
    expect(
      isProcedureLocaleIndexable({
        requestedLocale: "ru",
        resolvedLocale: "ru",
        pageLocale: "ru",
        availableLocales: ["en"],
      }),
    ).toBe(false);
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

  it("uses the localized surgery description when summary fields are absent", () => {
    expect(
      getProcedureSeoDescription({
        name: "Имплантация устройства",
        surgery_detailed_description:
          "<p>Локализованное описание хирургической процедуры.</p>",
      }),
    ).toBe("Локализованное описание хирургической процедуры.");
  });

  it("matches prerender HTML cleanup and 300-character truncation", () => {
    const description = `<div>${"Localized detail ".repeat(30)}</div>`;
    const result = getProcedureSeoDescription({
      name: "Procedure",
      summary: description,
      surgery_detailed_description: "Lower-priority detail",
    });

    expect(result.length).toBeLessThanOrEqual(300);
    expect(result.endsWith("…")).toBe(true);
    expect(result).not.toContain("<div>");
    expect(result).not.toContain("Lower-priority detail");
  });
});

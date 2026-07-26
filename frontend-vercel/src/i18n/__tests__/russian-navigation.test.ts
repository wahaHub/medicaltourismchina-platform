import { describe, expect, it } from "vitest";

import { en } from "@/i18n/translations/en";
import { ru } from "@/i18n/translations/ru";

const expectedRussianNavigation = {
  "nav.home": "ГЛАВНАЯ",
  "nav.telemedicine": "ОНЛАЙН-КОНСУЛЬТАЦИЯ",
  "nav.search": "ПОИСК",
  "nav.treatment": "РЕКОМЕНДУЕМОЕ",
  "nav.packages": "ЭТАПЫ",
  "nav.hospitals": "БОЛЬНИЦЫ",
  "nav.visa": "ВИЗА",
} as const;

describe("Russian navigation translations", () => {
  it("uses Russian labels for every public navigation entry", () => {
    for (const [key, expected] of Object.entries(expectedRussianNavigation)) {
      const translationKey = key as keyof typeof expectedRussianNavigation;

      expect(ru[translationKey]).toBe(expected);
      expect(ru[translationKey]).not.toBe(en[translationKey]);
    }
  });
});

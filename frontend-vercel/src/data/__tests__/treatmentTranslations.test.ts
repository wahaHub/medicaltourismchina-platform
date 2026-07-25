import { describe, expect, it } from "vitest";
import { treatmentCategories, getCategoryName } from "@/data/treatmentCategories";
import { categories } from "@/data/treatments";
import {
  getTreatmentCardTranslation,
  treatmentCardTranslations,
} from "@/data/treatmentTranslations";

const locales = ["ru", "ar", "id"] as const;
const treatments = categories.flatMap((category) => category.treatments);

describe("treatment page translations", () => {
  it("covers every treatment card in Russian, Arabic, and Indonesian", () => {
    expect(Object.keys(treatmentCardTranslations)).toHaveLength(treatments.length);

    for (const treatment of treatments) {
      for (const locale of locales) {
        const translation = getTreatmentCardTranslation(treatment.slug, locale);
        expect(translation?.name, `${locale}:${treatment.slug}:name`).toBeTruthy();
        expect(
          translation?.description,
          `${locale}:${treatment.slug}:description`,
        ).toBeTruthy();
        expect(translation?.name).not.toBe(treatment.name);
        expect(translation?.description).not.toBe(treatment.description);
      }
    }
  });

  it("localizes every treatment category", () => {
    for (const category of treatmentCategories) {
      for (const locale of locales) {
        const localizedName = getCategoryName(category.id, locale);
        expect(localizedName, `${locale}:${category.id}`).toBeTruthy();
        expect(localizedName).not.toBe(category.nameEn);
      }
    }
  });
});

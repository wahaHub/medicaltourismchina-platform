import { describe, expect, it } from "vitest";

import { getStaticPageMetadata } from "./static-pages.mjs";

describe("static SEO page metadata", () => {
  it.each(["ru", "ar", "id"])(
    "keeps the %s treatment page indexable",
    (locale) => {
      const metadata = getStaticPageMetadata("treatment", locale);

      expect(metadata.indexable).toBe(true);
      expect(metadata.indexableLocales).toContain(locale);
      expect(metadata.locale.title).toBeTruthy();
      expect(metadata.locale.description).toBeTruthy();
      expect(metadata.locale.heading).toBeTruthy();
    },
  );
});

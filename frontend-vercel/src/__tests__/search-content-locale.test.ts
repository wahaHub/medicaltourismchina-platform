import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

describe("search content locale", () => {
  it("requests the active medical taxonomy locale instead of English fallback", () => {
    const searchPage = fs.readFileSync(
      path.join(PROJECT_ROOT, "src/pages/Search.tsx"),
      "utf8",
    );

    expect(searchPage).toContain(
      "getMedicalTaxonomyApiLocale(getApiLocale())",
    );
    expect(searchPage).not.toContain(
      'currentLanguage.code === "ar" || currentLanguage.code === "id"',
    );
  });
});

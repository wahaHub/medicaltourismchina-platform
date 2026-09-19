// @vitest-environment node
import { describe, expect, it } from "vitest";
import middleware from "../../middleware";
import { STATIC_PAGE_METADATA } from "../../seo/static-pages.mjs";
import { SHOW_TELEMEDICINE } from "../config/publicVisibility.mjs";

const origin = "https://www.medicaltourismchina.health";

describe("public telemedicine restoration", () => {
  it.each(["", "/en", "/zh", "/es", "/fr", "/de", "/ru", "/ar", "/id"])(
    "allows published page requests under %s", async (prefix) => {
      for (const suffix of ["", "/", "?source=old-link"]) {
        const response = await middleware(new Request(`${origin}${prefix}/telemedicine${suffix}`));
        expect(response).toBeUndefined();
      }
    },
  );
  it("exposes the service and all eight SEO locales", () => {
    expect(SHOW_TELEMEDICINE).toBe(true);
    expect(STATIC_PAGE_METADATA.telemedicine.public).not.toBe(false);
    expect([...STATIC_PAGE_METADATA.telemedicine.indexableLocales].sort()).toEqual(["ar","de","en","es","fr","id","ru","zh"]);
  });
  it("continues to retire unrelated withdrawn pages", async () => {
    const response = await middleware(new Request(`${origin}/insurance`));
    expect(response?.status).toBe(410);
  });
});

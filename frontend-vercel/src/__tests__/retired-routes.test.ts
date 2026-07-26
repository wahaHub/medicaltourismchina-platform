import { describe, expect, it } from "vitest";

import middleware from "../../middleware";

const RETIRED_PATHS = [
  "/health-packages",
  "/hollywood-smile-veneers",
  "/rhinoplasty",
  "/double-eyelid-surgery",
  "/facial-liposuction",
  "/bariatric-surgery",
  "/insurance",
  "/faq",
  "/work-with-us",
  "/work-with-us/hospitals/apply",
  "/why-china",
  "/hospitals/ceshi-logs",
];

describe("retired public routes", () => {
  it.each(RETIRED_PATHS)("returns 410 and noindex for %s", async (pathname) => {
    const response = await middleware(
      new Request(`https://www.medicaltourismchina.health${pathname}`),
    );

    expect(response?.status).toBe(410);
    expect(response?.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(await response?.text()).toContain('name="robots" content="noindex,nofollow"');
  });

  it("also retires localized variants", async () => {
    for (const locale of ["zh", "de", "ru", "ar", "id"]) {
      for (const pathname of ["/faq", "/hospitals/ceshi-logs"]) {
        const response = await middleware(
          new Request(
            `https://www.medicaltourismchina.health/${locale}${pathname}`,
          ),
        );
        expect(response?.status).toBe(410);
      }
    }
  });
});

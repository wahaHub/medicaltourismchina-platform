import { describe, expect, it } from "vitest";

import { ru } from "@/i18n/translations/ru";

describe("homepage stats translations", () => {
  it("localizes Russian homepage stat labels", () => {
    expect(ru["homepage.stats.commonDiseases"]).toBe("ТИПЫ ЗАБОЛЕВАНИЙ");
    expect(ru["homepage.stats.commonSurgeries"]).toBe("ВИДЫ ОПЕРАЦИЙ");
    expect(ru["homepage.stats.chineseHospitals"]).toBe("ПАРТНЕРСКИЕ БОЛЬНИЦЫ В КИТАЕ");
  });
});

import { describe, expect, it } from "vitest";

import {
  formatProcedurePrice,
  getProcedureDisplayCurrency,
} from "@/utils/procedure-pricing";

describe("procedure pricing", () => {
  it("uses the visitor country before the site language", () => {
    expect(getProcedureDisplayCurrency("US", "zh")).toBe("USD");
    expect(getProcedureDisplayCurrency("CN", "en")).toBe("CNY");
    expect(getProcedureDisplayCurrency("DE", "en")).toBe("EUR");
  });

  it("uses the language currency only when visitor country is unavailable", () => {
    expect(getProcedureDisplayCurrency(null, "zh-CN")).toBe("CNY");
    expect(getProcedureDisplayCurrency(null, "fr")).toBe("EUR");
    expect(getProcedureDisplayCurrency(null, "en")).toBe("USD");
  });

  it("converts legacy CNY display text into one visitor currency", () => {
    expect(formatProcedurePrice({ cost_usd: "CNY 89,900" }, {
      country: "US",
      language: "en",
    })).toBe("USD 12,486");
  });

  it("keeps the same source amount in CNY for a visitor in China", () => {
    expect(formatProcedurePrice({ cost_usd: "CNY 89,900" }, {
      country: "CN",
      language: "en",
    })).toBe("CNY 89,900");
  });

  it("uses normalized API fields before legacy display text", () => {
    expect(formatProcedurePrice({
      cost_usd: "CNY 89,900",
      source_price_amount: 5400,
      source_price_currency: "USD",
    }, {
      country: "US",
      language: "en",
    })).toBe("USD 5,400");
  });
})

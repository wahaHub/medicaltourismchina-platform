import { describe, expect, it } from "vitest";

import { getCarouselTransform } from "@/utils/carousel-direction";

describe("getCarouselTransform", () => {
  it("keeps the first carousel page anchored", () => {
    expect(getCarouselTransform(0, 25, false, 6)).toBe("translateX(0)");
    expect(getCarouselTransform(0, 25, true, 6)).toBe("translateX(0)");
  });

  it("moves LTR tracks left and includes the inter-card gap", () => {
    expect(getCarouselTransform(2, 25, false, 6)).toBe(
      "translateX(calc(-50% - 12px))",
    );
  });

  it("moves RTL tracks right and includes the inter-card gap", () => {
    expect(getCarouselTransform(2, 100 / 3, true, 8)).toBe(
      "translateX(calc(66.66666666666667% + 16px))",
    );
  });
});

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import TestimonialsSection from "@/components/home-v2/TestimonialsSection";

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    currentLanguage: { code: "en" },
  }),
}));

describe("TestimonialsSection", () => {
  it("does not render the Trustpilot review CTA", () => {
    const { container } = render(<TestimonialsSection />);

    expect(
      container.querySelector(
        'a[href="https://www.trustpilot.com/review/medicaltourismchina.health"]',
      ),
    ).toBeNull();
  });
});

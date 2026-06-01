import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import PackagesJourneySteps from "../PackagesJourneySteps";

const translations: Record<string, string> = {
  "journeySteps.hero.title": "China medical journey packages",
  "journeySteps.hero.subtitle": "A guided care pathway from first contact to aftercare.",
  "journeySteps.hero.eyebrow": "Guided care pathway",
  "journeySteps.cta.title": "Request your tailored treatment route",
  "journeySteps.cta.subtitle": "Tell us your medical goals and we will match hospitals, logistics, and support.",
  "journeySteps.cta.button": "Request a free quote",
  "journeySteps.step1.title": "Step 1",
  "journeySteps.step2.title": "Step 2",
  "journeySteps.step3.title": "Step 3",
  "journeySteps.step4.title": "Step 4",
  "journeySteps.step5.title": "Step 5",
  "journeySteps.step6.title": "Step 6",
};

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    currentLanguage: { code: "en" },
    t: (key: string, vars?: Record<string, number>) => {
      if (key === "journeySteps.step.label") {
        return `STEP ${vars?.n ?? ""}`;
      }
      if (key === "journeySteps.step.imageAlt") {
        return `Step ${vars?.n ?? ""} image`;
      }
      return translations[key] ?? key;
    },
  }),
}));

describe("PackagesJourneySteps", () => {
  it("renders the hospitals-aligned page shell with a hero, six step cards, and CTA", () => {
    render(
      <MemoryRouter>
        <PackagesJourneySteps />
      </MemoryRouter>,
    );

    const hero = screen.getByTestId("packages-hero");
    expect(within(hero).getByText("Guided care pathway")).toBeTruthy();
    expect(within(hero).getByRole("heading", { name: "China medical journey packages" })).toBeTruthy();

    const contentShell = screen.getByTestId("packages-content-shell");
    expect(within(contentShell).getAllByTestId("packages-step-card")).toHaveLength(6);
    const ctaLinks = screen.getAllByRole("link", { name: "Request a free quote" });
    expect(ctaLinks).toHaveLength(2);
    expect(ctaLinks.every((link) => link.getAttribute("href") === "/free-quote")).toBe(true);
  });
});

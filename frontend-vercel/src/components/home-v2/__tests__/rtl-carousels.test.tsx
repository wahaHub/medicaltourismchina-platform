import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getCarouselTransform } from "@/utils/carousel-direction";

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    currentLanguage: { code: "ar" },
  }),
}));

vi.mock("@/components/ProgressiveImage", () => ({
  default: ({ alt = "" }: { alt?: string }) => <img alt={alt} />,
}));

import TestimonialsSection from "@/components/home-v2/TestimonialsSection";
import WhyMedoraSection from "@/components/home-v2/WhyMedoraSection";

function carouselTransforms(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[style*="translateX"]'),
    (element) => element.style.transform,
  );
}

describe("Arabic homepage carousels", () => {
  it("moves hospital and doctor tracks in the RTL direction", () => {
    const { container } = render(<WhyMedoraSection />);

    screen.getAllByLabelText("aria.nextHospitals").forEach((button) => {
      fireEvent.click(button);
    });
    screen.getAllByLabelText("aria.nextDoctors").forEach((button) => {
      fireEvent.click(button);
    });

    expect(carouselTransforms(container)).toEqual([
      getCarouselTransform(1, 100, true),
      getCarouselTransform(1, 25, true, 6),
      getCarouselTransform(1, 100, true),
      getCarouselTransform(1, 100 / 3, true, 8),
    ]);
    expect(screen.getAllByLabelText("aria.previousHospitals")).toHaveLength(2);
    expect(screen.getAllByLabelText("aria.previousDoctors")).toHaveLength(2);
  });

  it("moves testimonial tracks in the RTL direction", () => {
    const { container } = render(<TestimonialsSection />);

    screen.getAllByLabelText("aria.nextTestimonial").forEach((button) => {
      fireEvent.click(button);
    });

    expect(carouselTransforms(container)).toEqual([
      getCarouselTransform(1, 100, true),
      getCarouselTransform(1, 100 / 3, true, 8),
    ]);
    expect(screen.getAllByLabelText("aria.previousTestimonial")).toHaveLength(2);
  });
});

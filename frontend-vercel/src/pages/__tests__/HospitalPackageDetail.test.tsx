import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import HospitalPackageDetail from "../HospitalPackageDetail";
import { hospitalApi } from "@/services/api/hospital";

vi.mock("@/components/TopBanner", () => ({
  default: () => <div data-testid="top-banner" />,
}));

vi.mock("@/components/Header", () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock("@/components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

vi.mock("@/components/QuoteRequestModal", () => ({
  default: ({
    isOpen,
    procedureName,
    type,
  }: {
    isOpen: boolean;
    procedureName?: string;
    type?: string;
  }) =>
    isOpen ? (
      <div data-testid="quote-request-modal">
        {type}:{procedureName}
      </div>
    ) : null,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
      <a href={to} {...props}>{children}</a>
    ),
    useParams: () => ({
      slug: "sample-hospital",
      packageSlug: "premium-lasik-vision",
    }),
  };
});

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    currentLanguage: { code: "en", apiCode: "en" },
  }),
}));

vi.mock("@/services/api/hospital", () => ({
  hospitalApi: {
    getHospitalPackageDetailBySlug: vi.fn(),
  },
}));

describe("HospitalPackageDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hospitalApi.getHospitalPackageDetailBySlug).mockResolvedValue({
      data: {
        id: "package-1",
        slug: "premium-lasik-vision",
        title: "Premium LASIK Vision Correction Package",
        subtitle: "Advanced diagnostics, treatment, and recovery support.",
        cover_image_url: "https://example.com/cover.jpg",
        gallery: [
          "https://example.com/cover.jpg",
          "https://example.com/gallery-2.jpg",
        ],
        price_label: "USD 4,800",
        duration: "5 days",
        summary: "A complete LASIK bundle with diagnostics and follow-up care.",
        tags: [
          { label: "LASIK", category: "treatment" },
          { label: "Recovery", category: "service" },
        ],
        includes: ["Initial consultation", "Surgery", "Post-op review"],
        process: [
          { step: "Assessment", desc: "Eye tests and specialist consultation." },
          { step: "Procedure", desc: "Same-day LASIK treatment." },
        ],
        cases: [
          {
            name: "Alex Chen",
            age: 31,
            country: "Canada",
            story: "Wanted a fast recovery before returning home.",
            result: "Clear vision within 24 hours.",
          },
        ],
        reviews: [
          {
            name: "Maria S.",
            country: "Singapore",
            rating: 5,
            date: "2026-04-25",
            comment: "The team was calm, clear, and very professional.",
          },
        ],
        hospital: {
          id: "hospital-1",
          slug: "sample-hospital",
          name: "Sample Hospital",
          location: "Shanghai, Shanghai",
        },
      },
      meta: {
        requested_locale: "en",
        resolved_locale: "en",
        slug: "sample-hospital",
        package_slug: "premium-lasik-vision",
        generated_at: "2026-04-25T00:00:00.000Z",
      },
    } as never);
  });

  it("renders the live package detail layout from API data", async () => {
    render(<HospitalPackageDetail />);

    await waitFor(() => {
      expect(screen.getByText("Premium LASIK Vision Correction Package")).toBeTruthy();
    });

    expect(vi.mocked(hospitalApi.getHospitalPackageDetailBySlug)).toHaveBeenCalledWith(
      "sample-hospital",
      "premium-lasik-vision",
      "en",
    );
    expect(screen.getByRole("heading", { name: "Overview" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Package Includes" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Treatment Process" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Patient Cases" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Patient Reviews" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Back to Hospital/i }).getAttribute("href")).toBe(
      "/hospitals/sample-hospital",
    );
    expect(screen.queryByText(/Package FAQ/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /Preview PDF/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Download PDF/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Request Details/i }));
    expect(screen.getByTestId("quote-request-modal").textContent).toContain(
      "quote:Premium LASIK Vision Correction Package",
    );
  });

  it("shows an unavailable state when the package request fails", async () => {
    vi.mocked(hospitalApi.getHospitalPackageDetailBySlug).mockRejectedValueOnce(new Error("Package not found"));

    render(<HospitalPackageDetail />);

    await waitFor(() => {
      expect(screen.getByText("Package unavailable")).toBeTruthy();
    });
    expect(screen.getByText("Package not found")).toBeTruthy();
  });
});

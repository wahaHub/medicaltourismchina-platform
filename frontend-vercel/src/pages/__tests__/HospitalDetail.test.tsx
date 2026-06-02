import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import HospitalDetail from "../HospitalDetail";
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
  default: () => null,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
      <a href={to} {...props}>{children}</a>
    ),
    useNavigate: () => vi.fn(),
    useParams: () => ({ slug: "sample-hospital" }),
  };
});

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    currentLanguage: { code: "en", apiCode: "en" },
    t: (key: string) => key,
  }),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/services/api/hospital", () => ({
  hospitalApi: {
    getHospitalExtendedBySlug: vi.fn(),
  },
}));

const baseHospital = {
  id: "hospital-1",
  slug: "sample-hospital",
  name: "Sample Hospital",
  display_name: "Sample Hospital",
  city: "Shanghai",
  district: "Pudong",
  province: "Shanghai",
  tier: "Tier 3A",
  hospital_type: "General",
  ownership_type: "public",
  short_description: "A sample hospital used for page tests.",
  department_count: 1,
  created_at: "2026-04-25T00:00:00.000Z",
  updated_at: "2026-04-25T00:00:00.000Z",
  overview: "Hospital overview text.",
  full_description: "Hospital full description text.",
  hero_image_url: "",
  gallery: [],
  surgeons: [],
  procedure_cases: [],
  equipment: [],
  followup_care: [],
  supported_languages: [],
  airport_services: [],
  amenities: [],
  payment_methods: [],
};

function renderPage(data: Record<string, unknown>) {
  vi.mocked(hospitalApi.getHospitalExtendedBySlug).mockResolvedValue({
    data: {
      ...baseHospital,
      ...data,
    } as never,
    meta: {
      requested_locale: "en",
      resolved_locale: "en",
      slug: "sample-hospital",
      generated_at: "2026-04-25T00:00:00.000Z",
    },
  } as never);

  return render(<HospitalDetail />);
}

describe("HospitalDetail package and review sections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hides the recommended packages section when there is no package data", async () => {
    renderPage({
      patient_reviews: [
        {
          id: "review-1",
          name: "Anna P.",
          location: "Canada",
          treatment: "Knee surgery",
          title: "Great care",
          comment: "The team was attentive and clear.",
          rating: 5,
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText("Sample Hospital")).toBeTruthy();
    });

    expect(screen.queryByRole("heading", { name: "RECOMMENDED PACKAGES" })).toBeNull();
    expect(screen.getByRole("heading", { name: "PATIENT REVIEWS" })).toBeTruthy();
  });

  it("hides the patient reviews section when there is no review data", async () => {
    renderPage({
      packages: [
        {
          id: "package-1",
          slug: "comprehensive-knee-package",
          title: "Comprehensive Knee Package",
          subtitle: "Orthopedic support bundle",
          image_url: "https://example.com/package.jpg",
          duration: "7 days",
          price_label: "USD 12,000",
          summary: "Includes consultation, surgery, and rehab support.",
          tags: ["Orthopedics", "Rehab"],
          includes: ["Consultation", "Surgery"],
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText("Sample Hospital")).toBeTruthy();
    });

    expect(screen.getByRole("heading", { name: "RECOMMENDED PACKAGES" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "PATIENT REVIEWS" })).toBeNull();
  });

  it("renders both sections when live package and review data exist", async () => {
    renderPage({
      packages: [
        {
          id: "package-1",
          slug: "comprehensive-knee-package",
          title: "Comprehensive Knee Package",
          subtitle: "Orthopedic support bundle",
          image_url: "https://example.com/package.jpg",
          duration: "7 days",
          price_label: "USD 12,000",
          summary: "Includes consultation, surgery, and rehab support.",
          tags: ["Orthopedics", "Rehab"],
          includes: ["Consultation", "Surgery"],
        },
      ],
      patient_reviews: [
        {
          id: "review-1",
          name: "Anna P.",
          location: "Canada",
          treatment: "Knee surgery",
          title: "Great care",
          comment: "The team was attentive and clear.",
          rating: 5,
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText("Sample Hospital")).toBeTruthy();
    });

    expect(screen.getByRole("heading", { name: "RECOMMENDED PACKAGES" })).toBeTruthy();
    expect(screen.getByText("Comprehensive Knee Package")).toBeTruthy();
    expect(screen.getByRole("link", { name: /View Details/i }).getAttribute("href")).toBe(
      "/hospitals/sample-hospital/packages/comprehensive-knee-package",
    );
    expect(screen.getByRole("heading", { name: "PATIENT REVIEWS" })).toBeTruthy();
    expect(screen.getByText("Great care")).toBeTruthy();
  });

  it("falls back to a stable placeholder when an equipment image fails", async () => {
    renderPage({
      equipment: [
        {
          name: "Broken scanner image",
          description: "A scanner whose old CDN image is unavailable.",
          image_url: "https://example.com/missing-equipment.png",
        },
      ],
    });

    const image = await screen.findByAltText("Broken scanner image");
    fireEvent.error(image);

    expect((image as HTMLImageElement).src).toContain("/low/root_assets/surgery_placeholder_x2.png");
  });

  it("renders the sections from handler-shaped CRM materials payloads", async () => {
    renderPage({
      packages: [
        {
          id: "package-1",
          title: "Joint Recovery Package",
          subtitle: "Post-op support",
          image_url: "https://example.com/package.jpg",
          duration: "7 days",
          price_label: "USD 12,000",
          summary: "Includes consultation, treatment, and recovery support.",
          tags: ["Orthopedics", "Rehab"],
          includes: ["Pre-op consultation", "Recovery support"],
        },
      ],
      patient_reviews: [
        {
          id: "review-1",
          patient_name: "John Zhang",
          patient_country: "Canada",
          treatment_name: "Orthopedic care",
          review_title: "Smooth recovery",
          review_comment: "The team was professional.",
          rating: 5,
          patient_avatar_url: "https://example.com/avatar.jpg",
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText("Sample Hospital")).toBeTruthy();
    });

    expect(screen.getByRole("heading", { name: "RECOMMENDED PACKAGES" })).toBeTruthy();
    expect(screen.getByText("Joint Recovery Package")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "PATIENT REVIEWS" })).toBeTruthy();
    expect(screen.getByText("Smooth recovery")).toBeTruthy();
  });

  it("uses package id as the route fallback when the package slug is missing", async () => {
    renderPage({
      packages: [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          slug: "",
          title: "关节康复套餐",
          subtitle: "术后支持",
          image_url: "https://example.com/package.jpg",
          duration: "7 days",
          price_label: "USD 12,000",
          summary: "Includes consultation, treatment, and recovery support.",
          tags: ["Orthopedics", "Rehab"],
          includes: ["Pre-op consultation", "Recovery support"],
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText("关节康复套餐")).toBeTruthy();
    });

    expect(screen.getByRole("link", { name: /View Details/i }).getAttribute("href")).toBe(
      "/hospitals/sample-hospital/packages/123e4567-e89b-12d3-a456-426614174000",
    );
  });
});

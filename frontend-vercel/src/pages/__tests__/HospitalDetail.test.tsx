import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import HospitalDetail from "../HospitalDetail";
import { hospitalApi } from "@/services/api/hospital";

const mockRoute = vi.hoisted(() => ({
  slug: "sample-hospital",
  id: undefined as string | undefined,
}));

const mockLanguage = vi.hoisted(() => ({
  code: "en",
  apiCode: "en",
}));

const mockNavigate = vi.hoisted(() => vi.fn());

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
    useNavigate: () => mockNavigate,
    useParams: () => ({ ...mockRoute }),
  };
});

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    currentLanguage: { ...mockLanguage },
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

function createHospitalResponse(
  data: Record<string, unknown>,
  locale = mockLanguage.apiCode,
  slug = mockRoute.slug,
) {
  return {
    data: {
      ...baseHospital,
      slug,
      ...data,
    },
    meta: {
      requested_locale: locale,
      resolved_locale: locale,
      slug,
      generated_at: "2026-04-25T00:00:00.000Z",
    },
  };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

function renderPage(data: Record<string, unknown>) {
  vi.mocked(hospitalApi.getHospitalExtendedBySlug).mockResolvedValue(
    createHospitalResponse(data) as never,
  );

  return render(<HospitalDetail />);
}

describe("HospitalDetail package and review sections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.slug = "sample-hospital";
    mockRoute.id = undefined;
    mockLanguage.code = "en";
    mockLanguage.apiCode = "en";
    window.history.replaceState({}, "", "/hospitals/sample-hospital");
    document.title = "Prerendered hospital title";
    document.head
      .querySelectorAll(
        'meta[name="description"], meta[name="robots"], meta[property^="og:"], '
        + 'meta[name^="twitter:"], link[rel="canonical"], link[rel="alternate"][hreflang]',
      )
      .forEach((element) => element.remove());
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

  it("prefers reviewed core specialties over legacy department data", async () => {
    renderPage({
      core_specialties: [
        {
          name: "Reviewed Cardiology",
          slug: "reviewed-cardiology",
          description: "Reviewed specialty description.",
          technologies: ["Cardiac imaging"],
        },
      ],
      departments_info: [
        {
          department_name: "旧中文科室",
          department_slug: "legacy-department",
          description: "Legacy department description.",
          capabilities: [],
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText("Reviewed Cardiology")).toBeTruthy();
    });

    expect(screen.queryByText("旧中文科室")).toBeNull();
    expect(screen.getByText("hospital.detail.coreSpecialties")).toBeTruthy();
  });

  it("renders reviewed scale, value proposition, and clinical capability fields", async () => {
    renderPage({
      annual_outpatient_visits: 1_234_567,
      patients_served_annually: 456_789,
      value_proposition: "Reviewed international patient value proposition.",
      clinical_capabilities_description: {
        icu: "24-hour intensive care support.",
        mdt: "Multidisciplinary case review.",
      },
      bed_count: null,
      staff_count: null,
    });

    await waitFor(() => {
      expect(screen.getByText("1,234,567")).toBeTruthy();
    });

    expect(screen.getByText("456,789")).toBeTruthy();
    expect(screen.getByText("Reviewed international patient value proposition.")).toBeTruthy();
    expect(screen.getByText("24-hour intensive care support.")).toBeTruthy();
    expect(screen.getByText("Multidisciplinary case review.")).toBeTruthy();
    expect(screen.queryByText("hospital.detail.bedCount")).toBeNull();
    expect(screen.queryByText("hospital.detail.staffCount")).toBeNull();
  });

  it("uses publishable hospital copy for metadata and keeps canonical SEO handling", async () => {
    window.history.replaceState({}, "", "/hospitals/sample-hospital?preview=1#overview");

    renderPage({
      overview: "Reviewed localized hospital overview.",
      short_description: "待查证",
      seo_title: "Reviewed Hospital SEO Title",
    });

    await waitFor(() => {
      expect(document.title).toBe("Reviewed Hospital SEO Title");
    });

    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      "Reviewed localized hospital overview.",
    );
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute("content")).toBe(
      "Reviewed localized hospital overview.",
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://www.medicaltourismchina.health/hospitals/sample-hospital",
    );
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe(
      "https://www.medicaltourismchina.health/hospitals/sample-hospital",
    );
  });

  it("preserves prerendered metadata during the initial hospital request", () => {
    const pendingRequest = createDeferred<ReturnType<typeof createHospitalResponse>>();
    vi.mocked(hospitalApi.getHospitalExtendedBySlug).mockReturnValue(
      pendingRequest.promise as never,
    );
    document.title = "Prerendered Sample Hospital | Medora Health";
    const prerenderedDescription = document.createElement("meta");
    prerenderedDescription.setAttribute("name", "description");
    prerenderedDescription.setAttribute("content", "Prerendered hospital description.");
    document.head.appendChild(prerenderedDescription);

    render(<HospitalDetail />);

    expect(document.title).toBe("Prerendered Sample Hospital | Medora Health");
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      "Prerendered hospital description.",
    );
  });

  it("replaces the previous hospital SEO with current-path noindex metadata when the next request fails", async () => {
    const view = renderPage({
      name: "Hospital A",
      display_name: "Hospital A",
      seo_title: "Hospital A SEO",
      overview: "Hospital A overview.",
    });

    await waitFor(() => {
      expect(document.title).toBe("Hospital A SEO");
    });

    vi.mocked(hospitalApi.getHospitalExtendedBySlug).mockRejectedValueOnce(
      new Error("Hospital B unavailable"),
    );
    mockRoute.slug = "hospital-b";
    window.history.replaceState({}, "", "/hospitals/hospital-b");
    view.rerender(<HospitalDetail />);

    await waitFor(() => {
      expect(screen.getByText("Hospital detail unavailable")).toBeTruthy();
    });

    expect(document.title).toBe("Hospital information | Medora Health");
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe(
      "noindex,follow",
    );
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://www.medicaltourismchina.health/hospitals/hospital-b",
    );
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe(
      "https://www.medicaltourismchina.health/hospitals/hospital-b",
    );
  });

  it("does not let a late route response replace the current hospital or its SEO", async () => {
    const hospitalARequest = createDeferred<ReturnType<typeof createHospitalResponse>>();
    const hospitalBRequest = createDeferred<ReturnType<typeof createHospitalResponse>>();
    vi.mocked(hospitalApi.getHospitalExtendedBySlug).mockImplementation((slug) => (
      slug === "hospital-a" ? hospitalARequest.promise : hospitalBRequest.promise
    ) as never);
    mockRoute.slug = "hospital-a";
    window.history.replaceState({}, "", "/hospitals/hospital-a");
    const view = render(<HospitalDetail />);

    await waitFor(() => {
      expect(hospitalApi.getHospitalExtendedBySlug).toHaveBeenCalledWith("hospital-a", "en");
    });

    mockRoute.slug = "hospital-b";
    window.history.replaceState({}, "", "/hospitals/hospital-b");
    view.rerender(<HospitalDetail />);

    await waitFor(() => {
      expect(hospitalApi.getHospitalExtendedBySlug).toHaveBeenCalledWith("hospital-b", "en");
    });

    hospitalBRequest.resolve(createHospitalResponse({
      name: "Hospital B",
      display_name: "Hospital B",
      seo_title: "Hospital B SEO",
      overview: "Hospital B overview.",
    }, "en", "hospital-b"));

    await waitFor(() => {
      expect(screen.getByText("Hospital B")).toBeTruthy();
      expect(document.title).toBe("Hospital B SEO");
    });

    await act(async () => {
      hospitalARequest.resolve(createHospitalResponse({
        name: "Hospital A",
        display_name: "Hospital A",
        seo_title: "Hospital A SEO",
        overview: "Hospital A overview.",
      }, "en", "hospital-a"));
      await hospitalARequest.promise;
    });

    expect(screen.queryByText("Hospital A")).toBeNull();
    expect(document.title).toBe("Hospital B SEO");
  });

  it("does not let a late locale response replace the current localized hospital", async () => {
    const englishRequest = createDeferred<ReturnType<typeof createHospitalResponse>>();
    const frenchRequest = createDeferred<ReturnType<typeof createHospitalResponse>>();
    vi.mocked(hospitalApi.getHospitalExtendedBySlug).mockImplementation((_slug, locale) => (
      locale === "fr" ? frenchRequest.promise : englishRequest.promise
    ) as never);
    const view = render(<HospitalDetail />);

    await waitFor(() => {
      expect(hospitalApi.getHospitalExtendedBySlug).toHaveBeenCalledWith(
        "sample-hospital",
        "en",
      );
    });

    mockLanguage.code = "fr";
    mockLanguage.apiCode = "fr";
    view.rerender(<HospitalDetail />);

    await waitFor(() => {
      expect(hospitalApi.getHospitalExtendedBySlug).toHaveBeenCalledWith(
        "sample-hospital",
        "fr",
      );
    });

    frenchRequest.resolve(createHospitalResponse({
      name: "Hôpital Français",
      display_name: "Hôpital Français",
      seo_title: "Hôpital Français SEO",
      overview: "Présentation française.",
    }, "fr", "sample-hospital"));

    await waitFor(() => {
      expect(screen.getByText("Hôpital Français")).toBeTruthy();
      expect(document.title).toBe("Hôpital Français SEO");
    });

    await act(async () => {
      englishRequest.resolve(createHospitalResponse({
        name: "English Hospital",
        display_name: "English Hospital",
        seo_title: "English Hospital SEO",
        overview: "English overview.",
      }, "en", "sample-hospital"));
      await englishRequest.promise;
    });

    expect(screen.queryByText("English Hospital")).toBeNull();
    expect(document.title).toBe("Hôpital Français SEO");
  });
});

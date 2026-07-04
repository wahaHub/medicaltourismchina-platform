import { render, screen, waitFor } from "@testing-library/react";
import { afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

const translations: Record<string, string> = {
  "nav.home": "HOME",
  "nav.telemedicine": "ONLINE CONSULTATION",
  "nav.search": "SEARCH",
  "nav.treatment": "FEATURED",
  "nav.packages": "STEPS",
  "nav.hospitals": "HOSPITALS",
  "nav.insurance": "INSURANCE",
  "nav.visa": "VISA",
  "nav.whyChina": "WHY CHINA",
  "nav.bookAppointment": "Book an Appointment",
  "footer.aboutUs": "About Us",
  "footer.aboutDesc": "About Medora Health",
  "footer.ourPackages": "Our Packages",
  "footer.servicePackages": "Service Packages",
  "footer.partnerTourismPackages": "Partner Tourism Packages",
  "footer.resources": "Resources",
  "footer.faq": "FAQ",
  "footer.visaInformation": "Visa Information",
  "footer.patientGuide": "Pre-Departure Patient Guidelines",
  "footer.patientStories": "Patient Stories",
  "footer.workWithUs": "Work With Us",
  "footer.forHospitals": "For Hospitals & Clinics",
  "footer.forReferralPartners": "For Referal Partners",
  "footer.forTravelPartners": "For Travel & Services Partners",
  "footer.contactUs": "Contact Us",
  "footer.copyright": "Copyright",
  "footer.privacyPolicy": "Privacy Policy",
  "footer.termsOfService": "Terms of Service",
  "footer.cookiePolicy": "Cookie Policy",
};

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    currentLanguage: { code: "en" },
    t: (key: string) => translations[key] ?? key,
  }),
}));

vi.mock("@/components/QuoteRequestModal", () => ({
  default: () => null,
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Header", () => {
  it("does not render the insurance navigation link", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link", { name: "INSURANCE" })).toBeNull();
    expect(screen.getAllByRole("link", { name: "STEPS" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "VISA" }).length).toBeGreaterThan(0);
  });
});

describe("Footer", () => {
  it("renders the updated packages, resources, and work-with-us sections", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Our Packages" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Service Packages" }).getAttribute("href")).toBe("/packages");
    expect(screen.getByText("Partner Tourism Packages")).toBeTruthy();

    expect(screen.getByRole("heading", { name: "Resources" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "FAQ" }).getAttribute("href")).toBe("/faq");
    expect(screen.getByRole("link", { name: "Visa Information" }).getAttribute("href")).toBe("/visa");
    expect(screen.getByRole("link", { name: "Pre-Departure Patient Guidelines" }).getAttribute("href")).toBe("https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/documents/pre-departure-guide.pdf");
    expect(screen.getByRole("link", { name: "Patient Stories" }).getAttribute("href")).toBe("/#testimonials");

    expect(screen.getByRole("heading", { name: "Work With Us" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "For Hospitals & Clinics" }).getAttribute("href")).toBe("/work-with-us#hospitals");
    expect(screen.getByRole("link", { name: "For Referal Partners" }).getAttribute("href")).toBe("/work-with-us#referral-partners");
    expect(screen.getByRole("link", { name: "For Travel & Services Partners" }).getAttribute("href")).toBe("/work-with-us#travel-services");
  });

  it("adds the Bangladesh contact details for Bangladesh visitors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country: "BD", isBangladesh: true }),
    }));

    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByText("RM H2 4/F CENTURY IND CTR, 33-35 AU PUI WAN ST FOTAN SHA TIN, HONG KONG")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("Address: Medora Health Bangladesh, The Glass House, 38 Gulshan Avenue, Dhaka-1212")).toBeTruthy();
      expect(screen.getByRole("link", { name: "Contact: +880 1886 420 725" }).getAttribute("href")).toBe("tel:+8801886420725");
    });
  });

  it("keeps the Bangladesh contact details hidden for non-Bangladesh visitors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country: "US", isBangladesh: false }),
    }));

    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/visitor-country", {
        headers: { accept: "application/json" },
      });
    });

    expect(screen.queryByText("Address: Medora Health Bangladesh, The Glass House, 38 Gulshan Avenue, Dhaka-1212")).toBeNull();
    expect(screen.queryByRole("link", { name: "Contact: +880 1886 420 725" })).toBeNull();
  });
});

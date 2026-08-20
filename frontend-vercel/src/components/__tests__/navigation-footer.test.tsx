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
  "nav.visa": "GUIDES",
  "nav.whyChina": "WHY CHINA",
  "nav.bookAppointment": "Book an Appointment",
  "footer.aboutUs": "About Us",
  "footer.aboutDesc": "About Medora Health",
  "footer.ourPackages": "Our Packages",
  "footer.servicePackages": "Service Packages",
  "footer.partnerTourismPackages": "Partner Tourism Packages",
  "footer.resources": "Resources",
  "footer.faq": "FAQ",
  "footer.visaInformation": "Guides",
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
  "footer.trustpilot": "Medora Health on Trustpilot",
  "footer.addressLabel": "Address:",
  "footer.contactLabel": "Contact:",
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
  it("does not render retired navigation links", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link", { name: "INSURANCE" })).toBeNull();
    expect(screen.queryByRole("link", { name: "WHY CHINA" })).toBeNull();
    expect(screen.getAllByRole("link", { name: "STEPS" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "GUIDES" }).getAttribute("href")).toBe("/guides");
  });
});

describe("Footer", () => {
  it("renders current footer links without retired page links", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Our Packages" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Service Packages" }).getAttribute("href")).toBe("/packages");
    expect(screen.getByText("Partner Tourism Packages")).toBeTruthy();

    expect(screen.getByRole("heading", { name: "Resources" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "FAQ" })).toBeNull();
    expect(screen.getByRole("link", { name: "Guides" }).getAttribute("href")).toBe("/guides");
    expect(screen.getByRole("link", { name: "Pre-Departure Patient Guidelines" }).getAttribute("href")).toBe("https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/documents/pre-departure-guide.pdf");
    expect(screen.getByRole("link", { name: "Patient Stories" }).getAttribute("href")).toBe("/#testimonials");

    expect(screen.getByRole("heading", { name: "Work With Us" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "For Hospitals & Clinics" }).getAttribute("href")).toBe("/work-with-us#hospitals");
    expect(screen.getByRole("link", { name: "For Referal Partners" }).getAttribute("href")).toBe("/work-with-us#referral-partners");
    expect(screen.getByRole("link", { name: "+86 17723081247" }).getAttribute("href")).toBe(
      "https://wa.me/8617723081247",
    );
  });

  it("adds a locale basename exactly once to Work With Us links", () => {
    render(
      <MemoryRouter basename="/zh" initialEntries={["/zh/"]}>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "For Hospitals & Clinics" }).getAttribute("href")).toBe("/zh/work-with-us#hospitals");
    expect(screen.getByRole("link", { name: "For Referal Partners" }).getAttribute("href")).toBe("/zh/work-with-us#referral-partners");
    expect(screen.getByRole("link", { name: "For Travel & Services Partners" }).getAttribute("href")).toBe("/zh/work-with-us#travel-services");
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

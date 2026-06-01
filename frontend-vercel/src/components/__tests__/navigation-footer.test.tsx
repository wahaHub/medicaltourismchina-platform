import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

const translations: Record<string, string> = {
  "nav.home": "HOME",
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
    expect(screen.getByRole("link", { name: "Pre-Departure Patient Guidelines" }).getAttribute("href")).toBe("/pre-departure-guide.pdf");
    expect(screen.getByRole("link", { name: "Patient Stories" }).getAttribute("href")).toBe("/#testimonials");

    expect(screen.getByRole("heading", { name: "Work With Us" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "For Hospitals & Clinics" }).getAttribute("href")).toBe("/work-with-us#hospitals");
    expect(screen.getByRole("link", { name: "For Referal Partners" }).getAttribute("href")).toBe("/work-with-us#referral-partners");
    expect(screen.getByRole("link", { name: "For Travel & Services Partners" }).getAttribute("href")).toBe("/work-with-us#travel-services");
  });
});

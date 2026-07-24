import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import HospitalCard, {
  isClassATertiaryHospital,
  localizeHospitalLocation,
  resolveHospitalOwnership,
} from "@/components/HospitalCard";
import type { Hospital } from "@/services/api";

const translations: Record<string, string> = {
  "hospital.photo": "Foto",
  "hospital.tier.3A": "Rumah Sakit Tersier Kelas A",
  "hospital.ownership.public": "Rumah Sakit Publik",
  "hospital.ownership.private": "Rumah Sakit Swasta",
  "hospital.officialWebsite": "Situs resmi",
  "hospital.visitWebsite": "Kunjungi situs resmi rumah sakit",
  "hospital.wiki": "Wikipedia",
  "hospital.viewWikipedia": "Lihat halaman Wikipedia",
  "hospital.establishedIn": "Didirikan pada",
  "hospital.departmentCount": "departemen",
  "hospital.annualOutpatients": "kunjungan rawat jalan per tahun",
  "hospital.viewDetails": "Lihat Detail",
};

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    currentLanguage: { code: "id" },
    t: (key: string) => translations[key] ?? key,
  }),
}));

vi.mock("@/components/HospitalProgressiveImage", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const hospital: Hospital = {
  id: "hospital-id",
  slug: "rumah-sakit-uji",
  name: "Raffles Hospital",
  display_name: "Raffles Hospital",
  city: "北京",
  district: "",
  province: "China",
  tier: "Tingkat Tiga Kelas A",
  hospital_type: "",
  ownership_type: "Swasta",
  established_year: 2001,
  annual_outpatient_visits: 1_250_000,
  official_website: "https://example.com",
  short_description: "Rumah sakit internasional dengan layanan spesialis.",
  department_count: 24,
  seo_title: "",
  seo_description: "",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("Indonesian HospitalCard", () => {
  it("recognizes localized ownership and tier values", () => {
    expect(resolveHospitalOwnership("Swasta")).toBe("private");
    expect(resolveHospitalOwnership("Publik")).toBe("public");
    expect(resolveHospitalOwnership("unknown")).toBeNull();
    expect(isClassATertiaryHospital("Tingkat Tiga Kelas A")).toBe(true);
    expect(isClassATertiaryHospital("Tingkat 3A")).toBe(true);
  });

  it("localizes known Chinese locations", () => {
    expect(localizeHospitalLocation("北京，上海", "China", "id")).toBe(
      "Beijing, Shanghai, Tiongkok",
    );
    expect(localizeHospitalLocation("北京，上海", "北京，上海，广州", "id")).toBe(
      "Beijing, Shanghai, Guangzhou",
    );
  });

  it("renders Indonesian labels without misclassifying a private hospital", () => {
    const { container } = render(
      <MemoryRouter>
        <HospitalCard hospitalData={hospital} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Rumah Sakit Swasta 🏢")).toBeTruthy();
    expect(screen.queryByText("Rumah Sakit Publik 🏛️")).toBeNull();
    expect(screen.getByText("Rumah Sakit Tersier Kelas A")).toBeTruthy();
    expect(screen.getByText("Beijing, Tiongkok")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Lihat Detail" })).toBeTruthy();
    expect(screen.getByAltText("Raffles Hospital - Foto 1")).toBeTruthy();
    expect(container.textContent).not.toMatch(/照片|depts|visits\/yr|View More/);
  });
});

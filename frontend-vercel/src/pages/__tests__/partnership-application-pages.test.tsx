import type { ReactElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PartnershipApplicationPage from "@/pages/PartnershipApplicationPage";
import WorkWithUs from "@/pages/WorkWithUs";

const languageState = {
  code: "en",
};

vi.mock("@/components/Header", () => ({
  default: () => <div>Header</div>,
}));

vi.mock("@/components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("@/components/TopBanner", () => ({
  default: () => <div>TopBanner</div>,
}));

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    currentLanguage: { code: languageState.code },
  }),
}));

function renderWithRouter(element: ReactElement, initialEntries = ["/"]) {
  return render(<MemoryRouter initialEntries={initialEntries}>{element}</MemoryRouter>);
}

describe("Work With Us routes", () => {
  beforeEach(() => {
    languageState.code = "en";
  });

  it("renders hub CTAs as links to dedicated application pages without mounting the form inline", () => {
    renderWithRouter(<WorkWithUs />, ["/work-with-us"]);

    expect(screen.queryByText("Application form")).toBeNull();
    expect(screen.getByRole("link", { name: "Apply to join our hospital network" }).getAttribute("href")).toBe(
      "/work-with-us/hospitals/apply",
    );

    fireEvent.click(screen.getByRole("button", { name: /Referral Advisors/i }));
    expect(screen.getByRole("link", { name: "Apply to become a referral partner" }).getAttribute("href")).toBe(
      "/work-with-us/referral-partners/apply",
    );

    fireEvent.click(screen.getByRole("button", { name: /Travel & Ground Services/i }));
    expect(screen.getByRole("link", { name: "Apply as a service provider" }).getAttribute("href")).toBe(
      "/work-with-us/travel-services/apply",
    );
  });

  it("renders a simplified referral partner application page shell around the form", () => {
    renderWithRouter(<PartnershipApplicationPage applicationType="referral-partners" />, [
      "/work-with-us/referral-partners/apply",
    ]);

    expect(screen.getAllByText("Apply to become a referral partner").length).toBeGreaterThan(0);
    expect(screen.getByText("Back to Work With Us")).toBeTruthy();
    expect(screen.queryByText("What to have ready before you apply")).toBeNull();
    expect(screen.queryByText("What referral partners have access to")).toBeNull();
    expect(screen.queryByText("Register online")).toBeNull();
    expect(screen.queryByText("Partner type")).toBeNull();
    expect(screen.queryByText("Patient or community profile")).toBeNull();
    expect(screen.queryByText("WeChat")).toBeNull();
    expect(screen.getByText("Application form")).toBeTruthy();
  });

  it("localizes the service provider application page shell in Chinese", () => {
    languageState.code = "zh";
    renderWithRouter(<PartnershipApplicationPage applicationType="travel-services" />, [
      "/work-with-us/travel-services/apply",
    ]);

    expect(screen.getAllByText("申请成为服务合作方").length).toBeGreaterThan(0);
    expect(screen.getByText("返回合作总览")).toBeTruthy();
    expect(screen.queryByText("与我们合作")).toBeNull();
    expect(screen.queryByText("通知方式")).toBeNull();
    expect(screen.queryByText("记录保存并发送邮件")).toBeNull();
    expect(screen.queryByText("提交前可先准备这些信息")).toBeNull();
    expect(screen.queryByText("签证与入境支持")).toBeNull();
    expect(screen.queryByText("合作标准")).toBeNull();
    expect(screen.getByText("合作申请表")).toBeTruthy();
  });
});

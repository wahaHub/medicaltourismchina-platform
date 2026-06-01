import { describe, expect, it } from "vitest";

import { getPartnershipApplicationDefinition } from "@/components/work-with-us/applicationConfig";

describe("partnership application config", () => {
  it("defines the hospital application with the expected minimum fields", () => {
    const definition = getPartnershipApplicationDefinition("hospitals", "en");
    const fieldIds = definition.fields.map((field) => field.id);

    expect(definition.submitLabel).toMatch(/hospital network/i);
    expect(fieldIds).toEqual(
      expect.arrayContaining([
        "organizationName",
        "city",
        "website",
        "contactName",
        "jobTitle",
        "email",
        "phone",
        "services",
        "readiness",
        "credentials",
      ]),
    );
  });

  it("defines a referral partner form with the streamlined required fields", () => {
    const definition = getPartnershipApplicationDefinition("referral-partners", "en");
    const fieldIds = definition.fields.map((field) => field.id);

    expect(fieldIds).toEqual(
      expect.arrayContaining([
        "organizationName",
        "country",
        "contactName",
        "email",
        "referralVolume",
        "languages",
      ]),
    );
    expect(fieldIds).not.toContain("wechat");
    expect(fieldIds).not.toContain("partnerType");
    expect(fieldIds).not.toContain("audience");
  });

  it("defines a service provider form that captures coverage and service category", () => {
    const definition = getPartnershipApplicationDefinition("travel-services", "en");
    const fieldIds = definition.fields.map((field) => field.id);

    expect(fieldIds).toEqual(
      expect.arrayContaining([
        "organizationName",
        "serviceCategory",
        "coverage",
        "contactName",
        "email",
        "languages",
        "credentials",
        "experience",
      ]),
    );
  });

  it("provides localized copy for Chinese submissions", () => {
    const definition = getPartnershipApplicationDefinition("travel-services", "zh");

    expect(definition.title).toMatch(/申请|合作/);
    expect(definition.submitLabel).toMatch(/提交/);
  });
});

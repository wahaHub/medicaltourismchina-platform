import { describe, expect, it } from "vitest";

import { ar } from "@/i18n/translations/ar";
import { en } from "@/i18n/translations/en";
import { id } from "@/i18n/translations/id";

const procedureDetailKeys = [
  "procedureDetail.costInChina",
  "procedureDetail.approxWaitingTime",
  "procedureDetail.approxCost",
  "procedureDetail.includedServices",
  "procedureDetail.notIncluded",
  "procedureDetail.stayRequired",
  "procedureDetail.hospital",
  "procedureDetail.hotel",
  "procedureDetail.totalInChina",
  "procedureDetail.whatIs",
  "procedureDetail.howPerformed",
  "procedureDetail.performed",
  "procedureDetail.recoveryProcess",
  "procedureDetail.faqs",
  "procedureDetail.services.preOperative",
  "procedureDetail.services.surgeryAnesthesia",
  "procedureDetail.services.hospitalAccommodation",
  "procedureDetail.services.postOperativeCare",
  "procedureDetail.services.medicalTeam",
  "procedureDetail.notIncluded.travel",
  "procedureDetail.notIncluded.hotelStay",
  "procedureDetail.notIncluded.personalExpenses",
  "procedureDetail.notIncluded.insurance",
  "procedureDetail.notIncluded.visaFees",
  "procedureDetail.ourServiceProcess",
  "procedureDetail.serviceProcessSubtitle",
  "procedureDetail.service1.title",
  "procedureDetail.service1.description",
  "procedureDetail.service2.title",
  "procedureDetail.service2.description",
  "procedureDetail.service3.title",
  "procedureDetail.service3.description",
  "procedureDetail.service4.title",
  "procedureDetail.service4.description",
  "procedureDetail.service5.title",
  "procedureDetail.service5.description",
  "quote.cta.button",
] as const;

describe.each([
  ["Arabic", ar],
  ["Indonesian", id],
] as const)("%s procedure detail translations", (_name, dictionary) => {
  it.each(procedureDetailKeys)("%s overrides the English fallback", (key) => {
    expect(Object.prototype.hasOwnProperty.call(dictionary, key)).toBe(true);
    expect(dictionary[key]).toBeTruthy();
    if (!(_name === "Indonesian" && key === "procedureDetail.hotel")) {
      expect(dictionary[key]).not.toBe(en[key]);
    }
  });
});

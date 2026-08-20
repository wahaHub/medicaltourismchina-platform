import { describe, expect, it } from "vitest";

import {
  buildLocaleUrl,
  getLocaleBasename,
  getLocaleFromPathname,
  localizePathname,
  stripLocaleFromPathname,
} from "@/utils/locale-routing";

describe("locale routing", () => {
  it("keeps English unprefixed and detects supported locale prefixes", () => {
    expect(getLocaleFromPathname("/telemedicine")).toBe("en");
    expect(getLocaleFromPathname("/ru/telemedicine")).toBe("ru");
    expect(getLocaleFromPathname("/ar/telemedicine")).toBe("ar");
    expect(getLocaleFromPathname("/id/telemedicine")).toBe("id");
    expect(getLocaleFromPathname("/it/telemedicine")).toBe("en");
    expect(getLocaleBasename("en")).toBeUndefined();
    expect(getLocaleBasename("fr")).toBe("/fr");
    expect(getLocaleBasename("id")).toBe("/id");
  });

  it("adds and removes locale prefixes without changing the content path", () => {
    expect(stripLocaleFromPathname("/ru/hospitals/example")).toBe("/hospitals/example");
    expect(localizePathname("/hospitals/example", "ru")).toBe("/ru/hospitals/example");
    expect(localizePathname("/fr/hospitals/example", "en")).toBe("/hospitals/example");
    expect(localizePathname("/", "ru")).toBe("/ru/");
  });

  it("preserves query parameters and package step anchors when changing language", () => {
    expect(buildLocaleUrl("fr", {
      origin: "https://www.medicaltourismchina.health",
      pathname: "/ru/search",
      search: "?dept=oncology&disease=lung-cancer",
      hash: "#results",
    } as Location)).toBe(
      "https://www.medicaltourismchina.health/fr/search?dept=oncology&disease=lung-cancer#results",
    );

    expect(buildLocaleUrl("ru", {
      origin: "https://www.medicaltourismchina.health",
      pathname: "/packages",
      search: "",
      hash: "#step-3",
    } as Location)).toBe(
      "https://www.medicaltourismchina.health/ru/packages#step-3",
    );

    expect(buildLocaleUrl("ar", {
      origin: "https://www.medicaltourismchina.health",
      pathname: "/search",
      search: "?dept=oncology",
      hash: "#results",
    } as Location)).toBe(
      "https://www.medicaltourismchina.health/ar/search?dept=oncology#results",
    );

    expect(buildLocaleUrl("id", {
      origin: "https://www.medicaltourismchina.health",
      pathname: "/search",
      search: "?dept=cardiology&disease=heart-valve",
      hash: "#results",
    } as Location)).toBe(
      "https://www.medicaltourismchina.health/id/search?dept=cardiology&disease=heart-valve#results",
    );
  });

  it.each(["ar", "id"] as const)(
    "preserves localized procedure detail paths for %s",
    (locale) => {
      expect(buildLocaleUrl(locale, {
        origin: "https://www.medicaltourismchina.health",
        pathname: "/procedures/heart-valve-replacement-repair",
        search: "?ref=search",
        hash: "",
      } as Location)).toBe(
        `https://www.medicaltourismchina.health/${locale}/procedures/heart-valve-replacement-repair?ref=search`,
      );
    },
  );

  it.each(["ar", "id"] as const)(
    "preserves localized guide detail paths for %s",
    (locale) => {
      expect(buildLocaleUrl(locale, {
        origin: "https://www.medicaltourismchina.health",
        pathname: "/guides/clinical-trials-advanced-treatments/adverse-event-reporting-in-clinical-trials-a-patient-guide",
        search: "",
        hash: "#reporting-timeline",
      } as Location)).toBe(
        `https://www.medicaltourismchina.health/${locale}/guides/clinical-trials-advanced-treatments/adverse-event-reporting-in-clinical-trials-a-patient-guide#reporting-timeline`,
      );
    },
  );

  it.each(["ar", "id"] as const)(
    "still sends unsupported %s dynamic content paths to the localized homepage",
    (locale) => {
      expect(buildLocaleUrl(locale, {
        origin: "https://www.medicaltourismchina.health",
        pathname: "/hospitals/example-hospital",
        search: "?ref=search",
        hash: "",
      } as Location)).toBe(
        `https://www.medicaltourismchina.health/${locale}/`,
      );
    },
  );
});

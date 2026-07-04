import { describe, expect, it } from "vitest";

import { doctorProfiles, getDoctorProfile } from "@/i18n/doctorNames";
import { getHospitalName, hospitalNames } from "@/i18n/hospitalNames";

describe("homepage selected profile localization", () => {
  it("provides Russian names for homepage partner hospitals", () => {
    expect(getHospitalName("10", "ru")).toBe("Шанхайский онкологический центр, Фуданьский университет");
    expect(getHospitalName("9", "ru")).toBe("Больница Жуйцзинь, Медицинская школа Шанхайского университета Цзяо Тун");
    expect(getHospitalName("14", "ru")).toBe("Первая аффилированная больница Университета Сунь Ятсена");

    Object.values(hospitalNames).forEach((hospital) => {
      expect(hospital.ru).toBeTruthy();
      expect(hospital.ru).not.toBe(hospital.en);
    });
  });

  it("provides Russian titles and descriptions for every homepage doctor", () => {
    Object.keys(doctorProfiles).forEach((id) => {
      const profile = getDoctorProfile(id as keyof typeof doctorProfiles, "ru");
      expect(profile?.title).toBeTruthy();
      expect(profile?.description).toBeTruthy();
      expect(profile?.title).not.toBe(doctorProfiles[id as keyof typeof doctorProfiles].title.en);
      expect(profile?.description).not.toBe(doctorProfiles[id as keyof typeof doctorProfiles].description.en);
    });
  });
});

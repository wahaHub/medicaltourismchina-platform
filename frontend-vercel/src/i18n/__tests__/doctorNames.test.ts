import { describe, expect, it } from "vitest";

import { doctorProfiles, getDoctorProfile, type DoctorId } from "@/i18n/doctorNames";

describe("Indonesian doctor profiles", () => {
  it("provides Indonesian titles and descriptions for every homepage doctor", () => {
    for (const doctorId of Object.keys(doctorProfiles) as DoctorId[]) {
      const english = getDoctorProfile(doctorId, "en");
      const indonesian = getDoctorProfile(doctorId, "id");

      expect(indonesian).not.toBeNull();
      expect(indonesian?.name).toBe(english?.name);
      expect(indonesian?.title).not.toBe(english?.title);
      expect(indonesian?.description).not.toBe(english?.description);
      expect(indonesian?.title).toMatch(/Dokter/);
    }
  });
});

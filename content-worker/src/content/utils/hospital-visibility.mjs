export const EXCLUDED_PUBLIC_HOSPITAL_IDS = [
  // Production test fixture. It is not public medical content.
  "33246eb1-5dd1-400b-9a31-43607966e997",
];

const EXCLUDED_PUBLIC_HOSPITAL_ID_SET = new Set(EXCLUDED_PUBLIC_HOSPITAL_IDS);
const EXCLUDED_PUBLIC_HOSPITAL_SLUGS = new Set(["ceshi-logs"]);

export function isPublicHospitalExcluded(hospital) {
  if (!hospital || typeof hospital !== "object") return true;

  const id = typeof hospital.id === "string" ? hospital.id.trim() : "";
  const slug = typeof hospital.slug === "string"
    ? hospital.slug.trim().toLowerCase()
    : "";

  return EXCLUDED_PUBLIC_HOSPITAL_ID_SET.has(id)
    || EXCLUDED_PUBLIC_HOSPITAL_SLUGS.has(slug);
}

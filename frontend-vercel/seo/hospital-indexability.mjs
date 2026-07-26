const EXCLUDED_HOSPITAL_IDS = new Set([
  // Production test fixture. It must never create public SEO routes.
  "33246eb1-5dd1-400b-9a31-43607966e997",
]);

const EXCLUDED_HOSPITAL_SLUGS = new Set([
  "ceshi-logs",
]);

export function isHospitalExcludedFromSeo(hospital) {
  if (!hospital || typeof hospital !== "object") return true;

  const id = typeof hospital.id === "string" ? hospital.id.trim() : "";
  const slug = typeof hospital.slug === "string"
    ? hospital.slug.trim().toLowerCase()
    : "";

  return EXCLUDED_HOSPITAL_IDS.has(id) || EXCLUDED_HOSPITAL_SLUGS.has(slug);
}

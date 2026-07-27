const PLACEHOLDER_TEXT_PATTERN =
  /待查证|待核实|待确认|\btbd\b|to be verified|pending verification|verification pending/i;

export function isPublishableHospitalText(value) {
  return typeof value === "string"
    && value.trim().length > 0
    && !PLACEHOLDER_TEXT_PATTERN.test(value);
}

export function getHospitalSeoTitle(row, name) {
  return isPublishableHospitalText(row?.seo_title)
    ? row.seo_title.trim()
    : `${name} | Medora Health`;
}

export function getHospitalSeoDescription(row, fallback) {
  const source = [
    row?.overview,
    row?.seo_description,
    row?.full_description,
    row?.short_description,
  ].find(isPublishableHospitalText);

  return source?.trim() || fallback;
}

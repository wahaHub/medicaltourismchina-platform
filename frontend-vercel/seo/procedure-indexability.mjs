export const REQUIRED_PROCEDURE_LIST_FIELDS = [
  "name",
  "waiting_time",
  "stay_in_china",
  "surgery_detailed_description",
  "when_is_needed",
];

function isPopulated(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function hasProcedureCompletenessCapability(row) {
  return Boolean(row && typeof row.content_complete === "boolean");
}

export function isResolvedProcedureLocale(requestedLocale, resolvedLocale) {
  const normalize = (locale) =>
    typeof locale === "string"
      ? locale.trim().toLowerCase().split(/[-_]/)[0]
      : "";
  return (
    normalize(requestedLocale) !== ""
    && normalize(requestedLocale) === normalize(resolvedLocale)
  );
}

export function isIndexableProcedureTranslation(row) {
  return Boolean(
    hasProcedureCompletenessCapability(row)
    && row.content_complete
    && REQUIRED_PROCEDURE_LIST_FIELDS.every((field) => isPopulated(row[field])),
  );
}

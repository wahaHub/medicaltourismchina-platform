const SEO_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSeoSafeSlug(slug: string | null | undefined): boolean {
  return Boolean(
    slug
    && slug.length <= 120
    && SEO_SLUG_PATTERN.test(slug),
  );
}

export function isGeneratedHospitalSlug(slug: string | null | undefined): boolean {
  return Boolean(
    slug
    && /^hospital-(?:[0-9a-f]{8,}|[0-9a-f-]{20,}|[a-z0-9]{8,})$/i.test(slug),
  );
}

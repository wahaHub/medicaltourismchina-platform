export function addFailedPhotoUrl(
  failedUrls: ReadonlySet<string>,
  failedUrl: string,
): Set<string> {
  const next = new Set(failedUrls);
  next.add(failedUrl);
  return next;
}

export function getValidHospitalPhotoUrls(
  allUrls: string[],
  failedUrls: ReadonlySet<string>,
): string[] {
  return allUrls.filter((url) => !failedUrls.has(url));
}

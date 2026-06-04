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

export function getHospitalProgressiveBaseUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null;

  try {
    const url = new URL(photoUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const hospitalsIndex = pathParts.indexOf('hospitals');
    if (hospitalsIndex === -1) return null;

    const filename = pathParts[pathParts.length - 1];
    if (!filename || /_x[123]\.(png|jpg|jpeg|webp)$/i.test(filename)) {
      return null;
    }

    const extensionMatch = filename.match(/\.(png|jpg|jpeg|webp)$/i);
    if (!extensionMatch) return null;

    const basePath = url.pathname.slice(0, -extensionMatch[0].length);
    return `${url.origin}${basePath}`;
  } catch {
    return null;
  }
}

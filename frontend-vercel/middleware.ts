const DEFAULT_CONTENT_API_BASE_URL = "https://content.medicaltourismchina.health";
const CONTENT_API_BASE_URL =
  process.env.VITE_CONTENT_API_BASE_URL
  || process.env.VITE_API_BASE_URL
  || DEFAULT_CONTENT_API_BASE_URL;

type SlugResolution =
  | { type: "canonical"; slug?: string }
  | { type: "redirect"; toSlug?: string; status?: number }
  | { type: "not_found" };

export const config = {
  matcher: [
    "/hospitals/:path*",
    "/:locale(zh|es|fr|de|ru)/hospitals/:path*",
  ],
};

function parseHospitalPath(pathname: string): {
  locale?: string;
  slug: string;
  packageSlug?: string;
} | null {
  const match = pathname.match(
    /^\/(?:(zh|es|fr|de|ru)\/)?hospitals\/([^/]+)(?:\/packages\/([^/]+))?\/?$/,
  );
  if (!match) return null;
  return {
    locale: match[1] || undefined,
    slug: decodeURIComponent(match[2]),
    packageSlug: match[3] ? decodeURIComponent(match[3]) : undefined,
  };
}

function buildTargetUrl(
  requestUrl: URL,
  toSlug: string,
  packageSlug?: string,
  locale?: string,
): URL {
  const target = new URL(requestUrl.toString());
  const prefix = locale ? `/${locale}` : "";
  target.pathname = packageSlug
    ? `${prefix}/hospitals/${encodeURIComponent(toSlug)}/packages/${encodeURIComponent(packageSlug)}`
    : `${prefix}/hospitals/${encodeURIComponent(toSlug)}`;
  return target;
}

export default async function middleware(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  const parsed = parseHospitalPath(url.pathname);
  if (!parsed) return undefined;

  try {
    const resolutionResponse = await fetch(
      `${CONTENT_API_BASE_URL.replace(/\/+$/, "")}/hospitals/${encodeURIComponent(parsed.slug)}/slug-resolution`,
      { headers: { accept: "application/json" } },
    );

    if (!resolutionResponse.ok) return undefined;

    const resolution = await resolutionResponse.json() as SlugResolution;
    if (resolution.type !== "redirect" || !resolution.toSlug) return undefined;

    return Response.redirect(
      buildTargetUrl(url, resolution.toSlug, parsed.packageSlug, parsed.locale),
      resolution.status || 301,
    );
  } catch {
    return undefined;
  }
}

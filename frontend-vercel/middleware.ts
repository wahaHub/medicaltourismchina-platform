const DEFAULT_CONTENT_API_BASE_URL = "https://content.medicaltourismchina.health";
const CONTENT_API_BASE_URL =
  process.env.VITE_CONTENT_API_BASE_URL
  || process.env.VITE_API_BASE_URL
  || DEFAULT_CONTENT_API_BASE_URL;
const ARABIC_PUBLIC_PATHS = new Set([
  "/ar",
  "/ar/telemedicine",
  "/ar/search",
  "/ar/treatment",
  "/ar/packages",
  "/ar/hospitals",
  "/ar/visa",
]);

type SlugResolution =
  | { type: "canonical"; slug?: string }
  | { type: "redirect"; toSlug?: string; status?: number }
  | { type: "not_found" };

export const config = {
  matcher: [
    "/ar",
    "/ar/:path*",
    "/hospitals/:path*",
    "/:locale(zh|es|fr|de|ru)/hospitals/:path*",
  ],
};

function normalizePathname(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

function redirectUnsupportedArabicPath(url: URL): Response | undefined {
  if (!url.pathname.startsWith("/ar/") && url.pathname !== "/ar") {
    return undefined;
  }

  if (ARABIC_PUBLIC_PATHS.has(normalizePathname(url.pathname))) {
    return undefined;
  }

  const target = new URL(url.toString());
  target.pathname = url.pathname.replace(/^\/ar(?=\/|$)/, "") || "/";
  return Response.redirect(target, 308);
}

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
  const unsupportedArabicRedirect = redirectUnsupportedArabicPath(url);
  if (unsupportedArabicRedirect) return unsupportedArabicRedirect;

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

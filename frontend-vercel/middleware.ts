import guideRouteAvailability from "./src/data/guide-route-availability.json";

const GUIDE_LOCALES = new Set(["en", "zh", "es", "fr", "de", "ru", "ar", "id"]);
const GUIDE_ROUTE = /^\/(?:([^/]+)\/)?guides(?=\/|$)(.*)$/;
const GUIDE_AVAILABILITY = new Map<string, Set<string>>(
  Object.entries(guideRouteAvailability).map(([route, locales]) => [
    route, new Set<string>(locales),
  ]),
);

function handleGuideRoute(match: RegExpMatchArray): Response | undefined {
  const locale = match[1] || "en";
  const path = normalizePathname(match[2] || "/");

  if (GUIDE_LOCALES.has(locale)) {
    if (path === "/") return undefined;
    try {
      const segments = path.slice(1).split("/").map(decodeURIComponent);
      const validSegments = segments.every((segment) => segment && !/[\\/\u0000-\u001f\u007f]/.test(segment));
      // Category images remain static assets, outside article validation.
      if (!match[1] && validSegments && segments.length > 1 && segments[0] === "_categories"
        && /\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i.test(path)) {
        return undefined;
      }
      if (segments.length === 2 && validSegments) {
        const [category, article] = segments;
        if (article.endsWith(".md")) {
          // Public filenames are slug.md (English) or slug.<locale>.md.
          // /en/* is canonicalized by vercel.json before middleware runs.
          // Other locale prefixes and trailing slashes are not static files.
          const filename = article.match(/^([^.]+?)(?:\.(zh|es|fr|de|ru|ar|id))?\.md$/);
          if (!match[1] && !match[2].endsWith("/") && filename
            && GUIDE_AVAILABILITY.get(`${category}/${filename[1]}`)?.has(filename[2] || "en")) {
            return undefined;
          }
        } else {
          // Localized titles do not imply a translated body exists. The build
          // regenerates this compact route map from public guide files.
          if (GUIDE_AVAILABILITY.get(segments.join("/"))?.has(locale)) return undefined;
        }
      }
    } catch {
      // Malformed URL encoding is an unknown guide, not a middleware failure.
    }
  }

  // Do not let the SPA fallback serve homepage HTML for unavailable guide pages.
  // Avoid caching misses so newly published translations become available at once.
  return new Response(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Guide Not Found | Medora Health</title></head><body><main><h1>Guide not found</h1><p>This guide is not available in the requested language.</p><a href="/guides">Browse guides</a></main></body></html>',
    {
      status: 404,
      headers: {
        "cache-control": "no-store",
        "content-type": "text/html; charset=utf-8",
        "x-robots-tag": "noindex, nofollow",
      },
    },
  );
}

const DEFAULT_CONTENT_API_BASE_URL = "https://content.medicaltourismchina.health";
const CONTENT_API_BASE_URL =
  process.env.VITE_CONTENT_API_BASE_URL
  || process.env.VITE_API_BASE_URL
  || DEFAULT_CONTENT_API_BASE_URL;
const LIMITED_PUBLIC_LOCALES = new Set(["ar", "id"]);
const LIMITED_PUBLIC_PATHS = new Set([
  "/",
  "/telemedicine",
  "/search",
  "/treatment",
  "/packages",
  "/hospitals",
  "/guides",
  "/visa",
  "/work-with-us",
]);
const LIMITED_PUBLIC_DYNAMIC_PATHS = [
  /^\/procedures\/[^/]+$/,
  /^\/(?:guides|visa)\/[^/]+\/[^/]+$/,
  /^\/work-with-us(?:\/.*)?$/,
];
const RETIRED_PUBLIC_PATHS = new Set([
  "/health-packages",
  "/hollywood-smile-veneers",
  "/rhinoplasty",
  "/double-eyelid-surgery",
  "/facial-liposuction",
  "/bariatric-surgery",
  "/insurance",
  "/faq",
  "/why-china",
  "/hospitals/ceshi-logs",
]);

type SlugResolution =
  | { type: "canonical"; slug?: string }
  | { type: "redirect"; toSlug?: string; status?: number }
  | { type: "not_found" };

export const config = {
  matcher: [
    "/guides/:path*",
    "/:locale/guides/:path*",
    "/ar",
    "/ar/:path*",
    "/id",
    "/id/:path*",
    "/hospitals/:path*",
    "/:locale(zh|es|fr|de|ru)/hospitals/:path*",
    "/:retired(health-packages|hollywood-smile-veneers|rhinoplasty|double-eyelid-surgery|facial-liposuction|bariatric-surgery|insurance|faq|why-china)",
    "/:locale(zh|es|fr|de|ru|ar|id)/:retired(health-packages|hollywood-smile-veneers|rhinoplasty|double-eyelid-surgery|facial-liposuction|bariatric-surgery|insurance|faq|why-china)",
    "/hospitals/ceshi-logs",
    "/:locale(zh|es|fr|de|ru|ar|id)/hospitals/ceshi-logs",
  ],
};

function normalizePathname(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "");
}

function retireRemovedPublicPage(url: URL): Response | undefined {
  const contentPath = normalizePathname(
    url.pathname.replace(/^\/(?:zh|es|fr|de|ru|ar|id)(?=\/|$)/, "") || "/",
  );
  if (
    !RETIRED_PUBLIC_PATHS.has(contentPath)
    
  ) {
    return undefined;
  }

  return new Response(
    "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex,nofollow\"><title>Page Removed | Medora Health</title></head><body><main><h1>Page removed</h1><p>This page is no longer available.</p></main></body></html>",
    {
      status: 410,
      headers: {
        "cache-control": "public, max-age=0, s-maxage=86400",
        "content-type": "text/html; charset=utf-8",
        "x-robots-tag": "noindex, nofollow",
      },
    },
  );
}

function redirectUnsupportedLimitedLocalePath(url: URL): Response | undefined {
  const localeMatch = url.pathname.match(/^\/(ar|id)(?=\/|$)/);
  const locale = localeMatch?.[1];
  if (!locale || !LIMITED_PUBLIC_LOCALES.has(locale)) {
    return undefined;
  }

  const contentPath = normalizePathname(
    url.pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/",
  );
  if (
    LIMITED_PUBLIC_PATHS.has(contentPath)
    || LIMITED_PUBLIC_DYNAMIC_PATHS.some((pattern) => pattern.test(contentPath))
  ) {
    return undefined;
  }

  const target = new URL(url.toString());
  target.pathname = url.pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/";
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
  const retiredPageResponse = retireRemovedPublicPage(url);
  if (retiredPageResponse) return retiredPageResponse;

  const guideMatch = url.pathname.match(GUIDE_ROUTE);
  if (guideMatch) return handleGuideRoute(guideMatch);

  const unsupportedLimitedLocaleRedirect = redirectUnsupportedLimitedLocalePath(url);
  if (unsupportedLimitedLocaleRedirect) return unsupportedLimitedLocaleRedirect;

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

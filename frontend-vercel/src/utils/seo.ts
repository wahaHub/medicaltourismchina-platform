export const SITE_ORIGIN = "https://www.medicaltourismchina.health";
export const SITE_NAME = "Medora Health";
export const DEFAULT_OG_IMAGE =
  "https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/Medora%20Health-logo/logo-1_x1.png";

type SeoConfig = {
  title: string;
  description: string;
  path?: string;
  image?: string;
};

function ensureMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    for (const [name, value] of Object.entries(attributes)) {
      if (name !== "content") {
        element.setAttribute(name, value);
      }
    }
    document.head.appendChild(element);
  }

  if (attributes.content) {
    element.setAttribute("content", attributes.content);
  }
}

function ensureCanonical(href: string) {
  let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", href);
}

export function setPageSeo({ title, description, path = "/", image = DEFAULT_OG_IMAGE }: SeoConfig) {
  const canonicalUrl = `${SITE_ORIGIN}${path}`;

  document.title = title;
  ensureMeta('meta[name="description"]', { name: "description", content: description });
  ensureMeta('meta[name="author"]', { name: "author", content: SITE_NAME });
  ensureMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME });
  ensureMeta('meta[property="og:title"]', { property: "og:title", content: title });
  ensureMeta('meta[property="og:description"]', { property: "og:description", content: description });
  ensureMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
  ensureMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
  ensureMeta('meta[property="og:image"]', { property: "og:image", content: image });
  ensureMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  ensureMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
  ensureMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
  ensureMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
  ensureCanonical(canonicalUrl);
}

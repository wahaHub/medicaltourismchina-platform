import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, BadgeCheck, BookOpen, Calendar, Clock } from "lucide-react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { setPageSeo, SITE_ORIGIN } from "@/utils/seo";
import { localizePathname, type SiteLocale } from "@/utils/locale-routing";
import guidesManifest from "@/data/guides-manifest.json";
import { parseGuideMetadata } from "@/lib/guide-metadata.mjs";
import { prepareGuideBody } from "@/lib/guide-markdown.mjs";
import { guideContentLocale, guideFilename, guideHeadingId, localizeGuideHeading, GUIDE_LABELS } from "@/lib/guide-locales.mjs";
import { getStaticPageMetadata } from "@/seo/static-page";

const GUIDE_LOCALES = ["en", "zh", "es", "fr", "de", "ru", "ar", "id"] as const;
type GuideLocale = (typeof GUIDE_LOCALES)[number];

interface ManifestGuide {
  slug: string;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  subcategory: string;
  excerpt: string;
  locales: string[];
  updatedDate: string;
  updatedDateByLocale?: Record<string, string>;
  readTimeMinutes: number;
}

interface ManifestCategory {
  slug: string;
  title: Record<string, string>;
  image: string | null;
  guides: ManifestGuide[];
}

function useDisplayLocale(): GuideLocale {
  const { currentLanguage } = useLanguage();
  const code = currentLanguage.code === "zh-CN" ? "zh" : currentLanguage.code;
  return (GUIDE_LOCALES as readonly string[]).includes(code) ? (code as GuideLocale) : "en";
}

function pickLocalized(record: Record<string, string> | undefined, locale: string) {
  if (!record) return "";
  return record[locale] || record.en || record.zh || Object.values(record)[0] || "";
}

export default function GuideDetail() {
  const { categorySlug, guideSlug } = useParams<{ categorySlug: string; guideSlug: string }>();
  const { t } = useLanguage();
  const displayLocale = useDisplayLocale();

  const [loadedGuide, setLoadedGuide] = useState<{ key: string; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const category = useMemo(
    () => (guidesManifest.categories as unknown as ManifestCategory[]).find((c) => c.slug === categorySlug),
    [categorySlug],
  );
  const guide = useMemo(
    () => category?.guides.find((g) => g.slug === guideSlug),
    [category, guideSlug],
  );
  const contentLocale = guideContentLocale(displayLocale, guide?.locales);
  const documentKey = `${categorySlug}/${guideSlug}/${contentLocale}`;
  const markdown = loadedGuide?.key === documentKey ? loadedGuide.text : null;
  const articleMetadata = useMemo(() => markdown ? parseGuideMetadata(markdown) : undefined, [markdown]);
  const labels = GUIDE_LABELS[displayLocale];

  useEffect(() => {
    if (!categorySlug || !guideSlug || !guide) return;
    const controller = new AbortController();
    setLoadedGuide(null);
    setError(null);
    const url = `/guides/${categorySlug}/${guideFilename(guideSlug, contentLocale)}`;

    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Guide not found");
        return response.text();
      })
      .then((text) => {
        if (controller.signal.aborted) return;
        setLoadedGuide({ key: documentKey, text });
        setError(null);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load guide");
      });
    return () => controller.abort();
  }, [categorySlug, guideSlug, contentLocale, documentKey, guide]);

  const displayTitle =
    pickLocalized(guide?.title, displayLocale)
    || guideSlug
    || "";
  const displaySubtitle = pickLocalized(guide?.subtitle, displayLocale);
  const displayUpdatedDate = guide?.updatedDateByLocale?.[displayLocale] ?? guide?.updatedDate;
  const categoryTitle = pickLocalized(category?.title, displayLocale) || "Guide";
  const metaDescription =
    articleMetadata?.seo.description
    || displaySubtitle
    || guide?.excerpt
    || `${displayTitle} — Medora Health patient guide`;
  const seoTitle = articleMetadata?.seo.title || displayTitle;
  const reviewedBy = articleMetadata?.hero.reviewedBy || "";
  const guidePath = `/guides/${categorySlug}/${guideSlug}`;
  const availableLocales = useMemo(
    () => (guide?.locales || []).filter((locale): locale is SiteLocale =>
      (GUIDE_LOCALES as readonly string[]).includes(locale)
    ),
    [guide?.locales],
  );
  const isIndexable = Boolean(guide && availableLocales.includes(displayLocale));
  const canonicalUrl = `${SITE_ORIGIN}${localizePathname(guidePath, displayLocale)}`;
  const structuredData = useMemo(() => {
    if (!guide || !category || !isIndexable) return undefined;
    const modifiedDate = displayUpdatedDate?.replaceAll("/", "-");
    const categoryImage = category.image ? `${SITE_ORIGIN}${category.image}` : undefined;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "@id": `${canonicalUrl}#article`,
          headline: displayTitle,
          description: metaDescription,
          articleSection: categoryTitle,
          ...(modifiedDate ? { dateModified: modifiedDate } : {}),
          inLanguage: displayLocale === "zh" ? "zh-Hans" : displayLocale,
          isAccessibleForFree: true,
          ...(categoryImage ? { image: categoryImage } : {}),
          mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
          author: { "@type": "Organization", "@id": `${SITE_ORIGIN}/#organization`, name: "Medora Health" },
          publisher: { "@type": "Organization", "@id": `${SITE_ORIGIN}/#organization`, name: "Medora Health" },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonicalUrl}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Medora Health", item: `${SITE_ORIGIN}/` },
            {
              "@type": "ListItem",
              position: 2,
              name: getStaticPageMetadata("guides", displayLocale).locale.heading,
              item: `${SITE_ORIGIN}${localizePathname("/guides", displayLocale)}`,
            },
            { "@type": "ListItem", position: 3, name: displayTitle, item: canonicalUrl },
          ],
        },
      ],
    };
  }, [canonicalUrl, category, categoryTitle, displayLocale, displayUpdatedDate, displayTitle, guide, isIndexable, metaDescription, reviewedBy]);

  useEffect(() => {
    // Keep the prerendered metadata until this article's source has loaded.
    if (guide && !markdown && !error) return;
    setPageSeo({
      title: seoTitle,
      description: metaDescription,
      path: guidePath,
      image: category?.image ? `${SITE_ORIGIN}${category.image}` : undefined,
      robots: isIndexable ? "index,follow" : "noindex,follow",
      includeAlternates: isIndexable,
      availableLocales,
      ogType: isIndexable ? "article" : "website",
      structuredData,
    });
  }, [availableLocales, category?.image, error, guide, guidePath, isIndexable, markdown, metaDescription, seoTitle, structuredData]);

  const renderedMarkdown = useMemo(
    () => (markdown ? prepareGuideBody(markdown) : ""),
    [markdown],
  );
  const contents = useMemo(() => [...renderedMarkdown.matchAll(/^## (.+)$/gm)]
    .map((match) => ({ text: localizeGuideHeading(match[1].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, ""), contentLocale), id: guideHeadingId(match[1]) })), [renderedMarkdown, contentLocale]);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <main className="pb-16 pt-[100px] sm:pt-[108px] xl:pt-[116px]">
        {/* Hero */}
        <section className="bg-gradient-to-br from-teal-50 via-white to-sky-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="container mx-auto max-w-4xl">
            <Link
              to="/guides"
              className="mb-6 inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t("guides.backToGuides")}
            </Link>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700 shadow-sm">
              <BookOpen className="h-3.5 w-3.5" />
              {categoryTitle}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {displayTitle}
            </h1>
            {displaySubtitle ? (
              <p className="mt-4 text-lg leading-relaxed text-slate-600">{displaySubtitle}</p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              {displayUpdatedDate ? (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {t("guides.updated", { date: displayUpdatedDate })}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {t("guides.minRead", { minutes: guide?.readTimeMinutes || 5 })}
              </span>
              {reviewedBy ? <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4" />
                {reviewedBy}
              </span> : null}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            {displayLocale !== contentLocale && <p className="mb-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{labels[5]}</p>}
            {contents.length > 0 && <nav aria-label={labels[4]} className="mb-8 rounded-xl border border-slate-200 p-5">
              <details>
                <summary className="cursor-pointer font-semibold text-slate-800">{labels[4]}</summary>
                <ul className="mt-3 space-y-2 text-sm text-teal-700">{contents.map((item) => <li key={item.id}><a href={`#${item.id}`}>{item.text}</a></li>)}</ul>
              </details>
            </nav>}
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-12 text-center">
                <p className="text-rose-700">{error}</p>
                <Link
                  to="/guides"
                  className="mt-4 inline-block text-sm font-medium text-rose-700 underline"
                >
                  {t("guides.backToGuides")}
                </Link>
              </div>
            ) : markdown ? (
              <article lang={contentLocale === "zh" ? "zh-Hans" : contentLocale} dir={contentLocale === "ar" ? "rtl" : "ltr"} className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-a:text-teal-700 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-li:marker:text-teal-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h2: ({children, node}) => {
                  const line = node?.position?.start.line;
                  const heading = line ? renderedMarkdown.split(/\r?\n/)[line - 1].replace(/^##\s+/, "") : String(children);
                  return <h2 id={guideHeadingId(heading)} className="scroll-mt-32">{typeof children === "string" ? localizeGuideHeading(children, contentLocale) : children}</h2>;
                } }}>{renderedMarkdown}</ReactMarkdown>
              </article>
            ) : (
              <div className="space-y-4">
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-5/6 rounded bg-slate-100" />
                <div className="h-4 w-2/3 rounded bg-slate-100" />
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

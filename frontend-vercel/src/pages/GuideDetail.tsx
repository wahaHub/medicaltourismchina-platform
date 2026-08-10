import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, BookOpen, Calendar, Clock } from "lucide-react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { setPageSeo } from "@/utils/seo";
import guidesManifest from "@/data/guides-manifest.json";

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

function useContentLocale(): "en" | "zh" {
  const { currentLanguage } = useLanguage();
  return currentLanguage.code === "zh" || currentLanguage.code === "zh-CN" ? "zh" : "en";
}

function pickLocalized(record: Record<string, string> | undefined, locale: string) {
  if (!record) return "";
  return record[locale] || record.en || record.zh || Object.values(record)[0] || "";
}

function stripHeroSection(markdown: string): string {
  const keyTakeawaysIndex = markdown.search(/^## Key Takeaways\s*$/m);
  if (keyTakeawaysIndex >= 0) {
    return markdown.slice(keyTakeawaysIndex).trim();
  }
  const contentIndex = markdown.search(/^## Content\s*$/m);
  if (contentIndex >= 0) {
    return markdown.slice(contentIndex).trim();
  }
  return markdown.trim();
}

export default function GuideDetail() {
  const { categorySlug, guideSlug } = useParams<{ categorySlug: string; guideSlug: string }>();
  const { t } = useLanguage();
  const displayLocale = useDisplayLocale();
  const contentLocale = useContentLocale();

  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const category = useMemo(
    () => (guidesManifest.categories as unknown as ManifestCategory[]).find((c) => c.slug === categorySlug),
    [categorySlug],
  );
  const guide = useMemo(
    () => category?.guides.find((g) => g.slug === guideSlug),
    [category, guideSlug],
  );

  useEffect(() => {
    if (!categorySlug || !guideSlug) return;

    const suffix = contentLocale === "zh" ? ".zh.md" : ".md";
    const url = `/guides/${categorySlug}/${guideSlug}${suffix}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Guide not found");
        return response.text();
      })
      .then((text) => {
        setMarkdown(text);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load guide");
      });
  }, [categorySlug, guideSlug, contentLocale]);

  const displayTitle =
    pickLocalized(guide?.title, displayLocale)
    || guideSlug
    || "";
  const displaySubtitle = pickLocalized(guide?.subtitle, displayLocale);
  const categoryTitle = pickLocalized(category?.title, displayLocale) || "Guide";
  const metaDescription =
    displaySubtitle
    || guide?.excerpt
    || `${displayTitle} — Medora Health patient guide`;

  useEffect(() => {
    setPageSeo({
      title: `${displayTitle} | Medora Health Guides`,
      description: metaDescription,
      path: `/visa/${categorySlug}/${guideSlug}`,
      robots: "index,follow",
      includeAlternates: false,
    });
  }, [displayTitle, metaDescription, categorySlug, guideSlug]);

  const renderedMarkdown = useMemo(
    () => (markdown ? stripHeroSection(markdown) : ""),
    [markdown],
  );

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <main className="pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-teal-50 via-white to-sky-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="container mx-auto max-w-4xl">
            <Link
              to="/visa"
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
              {guide?.updatedDate ? (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {t("guides.updated", { date: guide.updatedDate })}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {t("guides.minRead", { minutes: guide?.readTimeMinutes || 5 })}
              </span>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-12 text-center">
                <p className="text-rose-700">{error}</p>
                <Link
                  to="/visa"
                  className="mt-4 inline-block text-sm font-medium text-rose-700 underline"
                >
                  {t("guides.backToGuides")}
                </Link>
              </div>
            ) : markdown ? (
              <article className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-a:text-teal-700 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-li:marker:text-teal-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{renderedMarkdown}</ReactMarkdown>
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

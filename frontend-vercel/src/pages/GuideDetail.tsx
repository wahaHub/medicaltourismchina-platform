import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { setPageSeo } from "@/utils/seo";
import guidesManifest from "@/data/guides-manifest.json";

function useGuideLocale() {
  const { currentLanguage } = useLanguage();
  return currentLanguage.code === "zh" || currentLanguage.code === "zh-CN" ? "zh" : "en";
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

function parseHero(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const hero: Record<string, string> = {};
  let inHero = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "## Hero") {
      inHero = true;
      continue;
    }
    if (inHero && trimmed.startsWith("## ") && trimmed !== "## Hero") {
      break;
    }
    if (!inHero) continue;
    const match = trimmed.match(/^-\s*\*\*(.+?):\s*\*\*\s*(.*)$/);
    if (match) {
      const key = match[1].trim().toLowerCase();
      hero[key] = match[2].trim().replace(/^`+|`+$/g, "").trim();
    }
  }
  return hero;
}

export default function GuideDetail() {
  const { categorySlug, guideSlug } = useParams<{ categorySlug: string; guideSlug: string }>();
  const { currentLanguage } = useLanguage();
  const locale = useGuideLocale();

  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const category = useMemo(
    () => guidesManifest.categories.find((c) => c.slug === categorySlug),
    [categorySlug],
  );
  const guide = useMemo(
    () => category?.guides.find((g) => g.slug === guideSlug),
    [category, guideSlug],
  );

  useEffect(() => {
    if (!categorySlug || !guideSlug) return;

    const suffix = locale === "zh" ? ".zh.md" : ".md";
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
  }, [categorySlug, guideSlug, locale]);

  const hero = useMemo(() => (markdown ? parseHero(markdown) : {}), [markdown]);
  const displayTitle =
    hero.title
    || guide?.title[locale]
    || guide?.title.en
    || guide?.title.zh
    || guideSlug
    || "";
  const displaySubtitle =
    hero.subtitle
    || guide?.subtitle[locale]
    || guide?.subtitle.en
    || guide?.subtitle.zh
    || "";
  const metaDescription =
    hero["meta description"]
    || displaySubtitle
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
        <section className="bg-gradient-to-br from-teal-50 via-white to-sky-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="container mx-auto max-w-4xl">
            <Link
              to="/visa"
              className="mb-6 inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to guides
            </Link>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700 shadow-sm">
              <BookOpen className="h-3.5 w-3.5" />
              {category?.title || "Guide"}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {displayTitle}
            </h1>
            {displaySubtitle ? (
              <p className="mt-4 text-lg text-slate-600">{displaySubtitle}</p>
            ) : null}
            {guide?.updatedDate ? (
              <div className="mt-6 flex items-center text-sm text-slate-500">
                <Calendar className="mr-1.5 h-4 w-4" />
                Updated {guide.updatedDate}
              </div>
            ) : null}
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
                  Return to guides
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

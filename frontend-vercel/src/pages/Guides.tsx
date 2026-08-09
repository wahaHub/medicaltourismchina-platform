import { useEffect, useMemo, useState } from "react";
import { BookOpen, Compass, MapPin, Plane, ShieldCheck, Stethoscope, Wallet } from "lucide-react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GuideCard from "@/components/guides/GuideCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { setPageSeo } from "@/utils/seo";
import { getStaticPageMetadata } from "@/seo/static-page";
import guidesManifest from "@/data/guides-manifest.json";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "china-healthcare-guides": ShieldCheck,
  "treatment-guides": Stethoscope,
  "clinical-trials-advanced-treatments": Compass,
  "hospital-guides": MapPin,
  "patient-journey-guides": Plane,
  "cost-insurance-guides": Wallet,
  "patient-education-faq": BookOpen,
};

function useGuideLocale() {
  const { currentLanguage } = useLanguage();
  return currentLanguage.code === "zh" || currentLanguage.code === "zh-CN" ? "zh" : "en";
}

export default function Guides() {
  const { currentLanguage } = useLanguage();
  const locale = useGuideLocale();
  const { categories } = guidesManifest;

  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.slug ?? "");

  useEffect(() => {
    const metadata = getStaticPageMetadata("visa", currentLanguage.code);
    setPageSeo({
      title: metadata.locale.title,
      description: metadata.locale.description,
      path: metadata.path,
      robots: metadata.indexable ? "index,follow" : "noindex,follow",
      includeAlternates: metadata.indexable,
      availableLocales: metadata.indexableLocales,
    });
  }, [currentLanguage.code]);

  const activeGuides = useMemo(() => {
    const category = categories.find((c) => c.slug === activeCategory);
    return category?.guides ?? [];
  }, [activeCategory, categories]);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <main className="pb-16">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-sky-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-teal-700 shadow-sm">
              <BookOpen className="h-4 w-4" />
              <span>Patient resources</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Medora Health Guides
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Practical, expert-reviewed guides to help international patients understand hospitals,
              treatments, clinical trials, costs, and every step of care in China.
            </p>
          </div>
        </section>

        {/* Category tabs */}
        <section className="sticky top-[132px] z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto py-4">
              {categories.map((category) => {
                const Icon = CATEGORY_ICONS[category.slug] || BookOpen;
                const isActive = activeCategory === category.slug;
                return (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => setActiveCategory(category.slug)}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-teal-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {category.title}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Guide grid */}
        <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">
              {categories.find((c) => c.slug === activeCategory)?.title}
            </h2>
            <span className="text-sm text-slate-500">
              {activeGuides.length} guide{activeGuides.length === 1 ? "" : "s"}
            </span>
          </div>

          {activeGuides.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {activeGuides.map((guide) => (
                <GuideCard
                  key={guide.slug}
                  guide={guide}
                  categorySlug={activeCategory}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <p className="text-slate-600">No guides available in this category yet.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

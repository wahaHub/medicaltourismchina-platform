import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Compass, MapPin, Plane, RotateCcw, Search, ShieldCheck, Stethoscope, Wallet } from "lucide-react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GuideCard, { type GuideCardGuide } from "@/components/guides/GuideCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { setPageSeo, SITE_ORIGIN } from "@/utils/seo";
import { getStaticPageMetadata } from "@/seo/static-page";
import guidesManifest from "@/data/guides-manifest.json";
import { cn } from "@/lib/utils";
import { GUIDE_LABELS } from "@/lib/guide-locales.mjs";

import { GUIDE_AREAS, AREA_LABEL, ALL_AREAS_LABEL, TYPE_LABEL, guideHealthArea } from "@/lib/guide-taxonomy.mjs";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "china-healthcare-guides": ShieldCheck,
  "treatment-guides": Stethoscope,
  "clinical-trials-advanced-treatments": Compass,
  "hospital-guides": MapPin,
  "patient-journey-guides": Plane,
  "cost-insurance-guides": Wallet,
  "patient-education-faq": BookOpen,
};

const GUIDE_LOCALES = ["en", "zh", "es", "fr", "de", "ru", "ar", "id"] as const;
type GuideLocale = (typeof GUIDE_LOCALES)[number];

type ManifestGuide = GuideCardGuide;

interface ManifestCategory {
  slug: string;
  title: Record<string, string>;
  image: string | null;
  guides: ManifestGuide[];
}

interface FlatGuide extends ManifestGuide {
  categorySlug: string;
  categoryTitle: Record<string, string>;
  categoryImage: string | null;
}

function useGuideLocale(): GuideLocale {
  const { currentLanguage } = useLanguage();
  const code = currentLanguage.code === "zh-CN" ? "zh" : currentLanguage.code;
  return (GUIDE_LOCALES as readonly string[]).includes(code) ? (code as GuideLocale) : "en";
}

function pickLocalized(record: Record<string, string> | undefined, locale: string) {
  if (!record) return "";
  return record[locale] || record.en || record.zh || Object.values(record)[0] || "";
}

function parseGuideDate(value: string) {
  const normalized = value.replace(/\//g, "-");
  const timestamp = Date.parse(normalized);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export default function Guides() {
  const { currentLanguage, t } = useLanguage();
  const locale = useGuideLocale();
  const categories = guidesManifest.categories as unknown as ManifestCategory[];

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "title">("recent");
  const [conditionId, setConditionId] = useState('');
  const [healthArea, setHealthArea] = useState('');
  const [visibleCount, setVisibleCount] = useState(24);
  const labels = GUIDE_LABELS[locale];
  useEffect(() => setVisibleCount(24), [searchQuery, activeCategory, conditionId, healthArea, sortBy, locale]);

  useEffect(() => {
    const metadata = getStaticPageMetadata("guides", currentLanguage.code);
    const ownLocale = categories.flatMap((category) => category.guides
      .filter((guide) => guide.locales.includes(locale))
      .map((guide) => ({ guide, category, contentLocale: locale })));
    const entries = ownLocale.length ? ownLocale : categories.flatMap((category) => category.guides
      .filter((guide) => guide.locales.includes("en"))
      .map((guide) => ({ guide, category, contentLocale: "en" })));
    const canonical = `${SITE_ORIGIN}${locale === "en" ? "" : `/${locale}`}/guides`;
    const itemList = {
      "@type": "ItemList", "@id": `${canonical}#list`, numberOfItems: entries.length,
      itemListElement: entries.map(({ guide, category, contentLocale }, index) => ({
        "@type": "ListItem", position: index + 1, name: guide.title[contentLocale] || guide.slug,
        url: `${SITE_ORIGIN}${contentLocale === "en" ? "" : `/${contentLocale}`}/guides/${category.slug}/${guide.slug}`,
      })),
    };
    setPageSeo({
      title: metadata.locale.title,
      description: metadata.locale.description,
      path: "/guides",
      robots: metadata.indexable ? "index,follow" : "noindex,follow",
      includeAlternates: metadata.indexable,
      availableLocales: metadata.indexableLocales,
      structuredData: { "@context": "https://schema.org", "@graph": [
        { "@type": "CollectionPage", "@id": canonical, url: canonical,
          name: metadata.locale.title, description: metadata.locale.description,
          inLanguage: locale === "zh" ? "zh-Hans" : locale,
          mainEntity: { "@id": itemList["@id"] } }, itemList,
      ] },
    });
  }, [currentLanguage.code, locale, categories]);

  const allGuides = useMemo<FlatGuide[]>(() => {
    return categories.flatMap((category) =>
      category.guides.map((guide) => ({
        ...guide,
        categorySlug: category.slug,
        categoryTitle: category.title,
        categoryImage: category.image,
      })),
    );
  }, [categories]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const category of categories) {
      counts.set(category.slug, category.guides.filter(guide => (!healthArea || guideHealthArea(guide) === healthArea) && (!conditionId || guide.conditionId === conditionId)).length);
    }
    return counts;
  }, [categories, healthArea, conditionId]);
  const conditions = useMemo(() => [...new Map(allGuides.filter((g) => g.conditionId && (!healthArea || guideHealthArea(g) === healthArea))
    .map((g) => [g.conditionId, { id: g.conditionId, name: pickLocalized(g.condition, locale) }])).values()]
    .sort((a, b) => a.name.localeCompare(b.name, locale)), [allGuides, locale, healthArea]);

  const filteredGuides = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = allGuides.filter((guide) => {
      if (healthArea && guideHealthArea(guide) !== healthArea) return false;
      if (activeCategory && guide.categorySlug !== activeCategory) return false;
      if (conditionId && guide.conditionId !== conditionId) return false;
      if (!query) return true;
      const localizedTitle = pickLocalized(guide.title, locale).toLowerCase();
      const localizedSubtitle = pickLocalized(guide.subtitle, locale).toLowerCase();
      const englishTitle = (guide.title?.en ?? "").toLowerCase();
      const englishSubtitle = (guide.subtitle?.en ?? "").toLowerCase();
      return (
        localizedTitle.includes(query)
        || localizedSubtitle.includes(query)
        || englishTitle.includes(query)
        || englishSubtitle.includes(query)
      );
    });

    const sorted = [...filtered];
    if (sortBy === "title") {
      sorted.sort((a, b) =>
        pickLocalized(a.title, locale).localeCompare(pickLocalized(b.title, locale), locale),
      );
    } else {
      sorted.sort((a, b) => parseGuideDate(b.updatedDate) - parseGuideDate(a.updatedDate));
    }
    return sorted;
  }, [activeCategory, allGuides, locale, searchQuery, sortBy, conditionId, healthArea]);

  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory(null);
    setSortBy("recent");
    setConditionId('');
    setHealthArea('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBanner />
      <Header />

      <main className="pb-16 pt-[100px] sm:pt-[108px] xl:pt-[116px]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-sky-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="container mx-auto max-w-7xl">
            <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
              <Link to="/" className="transition-colors hover:text-teal-700">
                {t("guides.breadcrumbHome")}
              </Link>
              <span aria-hidden="true">›</span>
              <span className="font-medium text-teal-700">{t("guides.breadcrumbGuides")}</span>
            </nav>
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  {t("guides.heroTitle")}
                </h1>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
                  {t("guides.heroSubtitle")}
                </p>
              </div>
              <div className="relative hidden h-56 overflow-hidden rounded-2xl lg:block">
                <img
                  src="/guides/_categories/patient-education-faq.jpg"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-900/10 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-[150px] lg:self-start">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <h2 className="mb-4 text-base font-semibold text-slate-900">
                  {t("guides.sidebarTitle")}
                </h2>
                <div className="relative mb-5">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={t("guides.searchPlaceholder")}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <fieldset className="mb-5">
                  <legend className="mb-2 text-sm font-semibold text-slate-700">{AREA_LABEL[locale]}</legend>
                  <div className="space-y-1">
                    {[{id: '', label: ALL_AREAS_LABEL}, ...GUIDE_AREAS].map((area) => (
                      <button key={area.id} type="button" aria-pressed={healthArea === area.id}
                        onClick={() => { setHealthArea(area.id); setConditionId(''); }}
                        className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-start text-sm", healthArea === area.id ? "bg-teal-50 font-semibold text-teal-800" : "text-slate-700 hover:bg-slate-50")}>
                        <span>{area.label[locale]}</span>
                        <span className="text-xs text-slate-500">{allGuides.filter(g => !area.id || guideHealthArea(g) === area.id).length}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label htmlFor="guides-condition" className="mb-2 mt-5 block text-sm font-semibold text-slate-700">{labels[6]}</label>
                <select id="guides-condition" value={conditionId} onChange={(event) => setConditionId(event.target.value)} className="mb-5 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm">
                  <option value="">{labels[7]}</option>
                  {conditions.map((condition) => <option key={condition.id} value={condition.id}>{condition.name}</option>)}
                </select>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {TYPE_LABEL[locale]}
                </h3>
                <ul className="space-y-1">
                  {categories.map((category) => {
                    const Icon = CATEGORY_ICONS[category.slug] || BookOpen;
                    const isActive = activeCategory === category.slug;
                    return (
                      <li key={category.slug}>
                        <button
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => setActiveCategory(isActive ? null : category.slug)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                            isActive
                              ? "bg-teal-50 font-semibold text-teal-700"
                              : "text-slate-700 hover:bg-slate-50",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 leading-snug">
                            {pickLocalized(category.title, locale)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {categoryCounts.get(category.slug) ?? 0}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t("guides.resetFilters")}
                </button>
              </div>
            </aside>

            {/* Guide list */}
            <div>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {healthArea && <>{GUIDE_AREAS.find(area => area.id === healthArea)?.label[locale]}{activeCategory ? " · " : ""}</>}
                    {activeCategory
                      ? pickLocalized(
                          categories.find((category) => category.slug === activeCategory)?.title,
                          locale,
                        )
                      : healthArea ? null : t("guides.allGuides")}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("guides.guidesFound", { count: filteredGuides.length })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="guides-sort" className="text-sm text-slate-500">
                    {t("guides.sortBy")}:
                  </label>
                  <select
                    id="guides-sort"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value === "title" ? "title" : "recent")}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="recent">{t("guides.sortMostRecent")}</option>
                    <option value="title">{t("guides.sortTitle")}</option>
                  </select>
                </div>
              </div>

              {filteredGuides.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredGuides.slice(0, visibleCount).map((guide) => (
                    <GuideCard
                      key={`${guide.categorySlug}/${guide.slug}`}
                      guide={guide}
                      categorySlug={guide.categorySlug}
                      categoryTitle={pickLocalized(guide.categoryTitle, locale)}
                      categoryImage={guide.categoryImage}
                      locale={locale}
                      updatedLabel={t("guides.updated")}
                      minReadLabel={t("guides.minRead")}
                      readGuideLabel={t("guides.readGuide")}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-card">
                  <BookOpen className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                  <p className="text-slate-600">{t("guides.noGuides")}</p>
                </div>
              )}
              {visibleCount < filteredGuides.length && <button type="button" onClick={() => setVisibleCount((count) => count + 24)} className="mt-8 rounded-lg border border-teal-700 px-5 py-3 text-sm font-semibold text-teal-700">{labels[8]}</button>}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

import { Link } from "react-router-dom";
import { Calendar, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { guideContentLocale } from "@/lib/guide-locales.mjs";

const CONTENT_LANGUAGE_LABELS: Record<string, string> = {
  en: "English", zh: "中文", es: "Español", fr: "Français",
  de: "Deutsch", ru: "Русский", ar: "العربية", id: "Bahasa Indonesia",
};

export interface GuideCardGuide {
  slug: string;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  excerpt: string;
  subcategory: string;
  locales: string[];
  updatedDate: string;
  updatedDateByLocale?: Record<string, string>;
  readTimeMinutes: number;
  conditionId?: string;
  condition?: Record<string, string>;
  topic?: string;
}

interface GuideCardProps {
  guide: GuideCardGuide;
  categorySlug: string;
  categoryTitle: string;
  categoryImage: string | null;
  locale: string;
  updatedLabel: string;
  minReadLabel: string;
  readGuideLabel: string;
  className?: string;
}

export default function GuideCard({
  guide,
  categorySlug,
  categoryTitle,
  categoryImage,
  locale,
  updatedLabel,
  minReadLabel,
  readGuideLabel,
  className,
}: GuideCardProps) {
  const contentLocale = guideContentLocale(locale, guide.locales);
  const isFallback = contentLocale !== locale;
  const updatedDate = guide.updatedDateByLocale?.[contentLocale] ?? guide.updatedDate;
  const title = guide.title[contentLocale] || guide.slug;
  const subtitle = guide.subtitle[contentLocale] || "";
  const guidePath = `/guides/${categorySlug}/${guide.slug}`;
  const cardClassName = cn(
    "group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lg sm:flex-row",
    className,
  );

  const content = (
    <>
      <div className="relative h-40 shrink-0 overflow-hidden bg-slate-100 sm:h-auto sm:w-2/5 sm:min-w-[180px]">
        {categoryImage ? (
          <img
            src={categoryImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-50 to-sky-50 text-teal-600">
            <span className="text-3xl font-bold">{categoryTitle.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 inline-flex w-fit rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
          {categoryTitle}
        </span>
        {isFallback ? (
          <span lang={contentLocale} dir="auto" className="mb-2 w-fit rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {CONTENT_LANGUAGE_LABELS[contentLocale] || contentLocale}
          </span>
        ) : null}
        <h3 lang={contentLocale} dir="auto" className="mb-2 text-lg font-semibold leading-snug text-slate-900 group-hover:text-teal-700">
          {title}
        </h3>
        {subtitle ? (
          <p lang={contentLocale} dir="auto" className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-600">{subtitle}</p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          {updatedDate ? (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {updatedLabel.replace("{{date}}", updatedDate)}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {minReadLabel.replace("{{minutes}}", String(guide.readTimeMinutes || 5))}
          </span>
        </div>
        <div className="mt-4 flex items-center text-sm font-medium text-teal-600">
          <span>{readGuideLabel}</span>
          <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </>
  );

  // The router applies the current locale basename to Link. Crossing locales
  // must reload the document at its real path so the app selects a new basename.
  return isFallback ? (
    <a href={`${contentLocale === "en" ? "" : `/${contentLocale}`}${guidePath}`} className={cardClassName}>
      {content}
    </a>
  ) : (
    <Link to={guidePath} className={cardClassName}>{content}</Link>
  );
}

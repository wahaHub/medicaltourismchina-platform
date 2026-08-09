import { Link } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GuideCardGuide {
  slug: string;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  excerpt: string;
  subcategory: string;
  locales: string[];
  updatedDate: string;
}

interface GuideCardProps {
  guide: GuideCardGuide;
  categorySlug: string;
  locale: string;
  className?: string;
}

export default function GuideCard({ guide, categorySlug, locale, className }: GuideCardProps) {
  const title = guide.title[locale] || guide.title.en || guide.title.zh || Object.values(guide.title)[0] || guide.slug;
  const subtitle = guide.subtitle[locale] || guide.subtitle.en || guide.subtitle.zh || "";
  const excerpt = guide.excerpt || subtitle;

  return (
    <Link
      to={`/visa/${categorySlug}/${guide.slug}`}
      className={cn(
        "group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
        <BookOpen className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-semibold leading-snug text-slate-900 group-hover:text-teal-700">
        {title}
      </h3>
      {subtitle ? (
        <p className="mb-3 line-clamp-2 text-sm text-slate-600">{subtitle}</p>
      ) : null}
      {excerpt && !subtitle ? (
        <p className="mb-3 line-clamp-3 text-sm text-slate-600">{excerpt}</p>
      ) : null}
      <div className="mt-auto flex items-center text-sm font-medium text-teal-600">
        <span>Read guide</span>
        <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
      {guide.subcategory ? (
        <div className="mt-3 inline-flex self-start rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {guide.subcategory}
        </div>
      ) : null}
    </Link>
  );
}

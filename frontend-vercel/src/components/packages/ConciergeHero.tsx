import { useLanguage } from "@/contexts/LanguageContext";
import { LOW_MEDIA_BASE_URL } from "@/config/media";

export default function ConciergeHero() {
  const { t } = useLanguage();

  return (
    <section className="relative mt-[112px] sm:mt-[120px] min-h-[320px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[480px] xl:min-h-[520px] flex flex-col justify-center">
      {/* Background Image — same as original hero */}
      <div className="absolute inset-0">
        <img
          src={`${LOW_MEDIA_BASE_URL}/packages/hero_banner_x2.png`}
          alt="Concierge Medical Journey Services"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/30" />
      </div>

      {/* Title & Subtitle */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="max-w-3xl">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold mb-3 sm:mb-4 leading-tight"
            style={{ color: "#003B5C" }}
          >
            {t("concierge.hero.title")}
          </h1>
          <p
            className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl"
            style={{ color: "#003B5C" }}
          >
            {t("concierge.hero.subtitle")}
          </p>
        </div>
      </div>
    </section>
  );
}

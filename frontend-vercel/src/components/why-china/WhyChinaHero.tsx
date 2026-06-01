
import PageHero from "@/components/common/PageHero";
// Next Image removed;
import GradientText from "../ui/GradientText";
import { useLanguage } from "@/contexts/LanguageContext";
import { LOW_MEDIA_BASE_URL } from "@/config/media";

export default function WhyChinaHero() {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: `${LOW_MEDIA_BASE_URL}/why_china/save_x2.png`,
      titleKey: "whyChina.features.save.title",
      descriptionKey: "whyChina.features.save.description",
    },
    {
      icon: `${LOW_MEDIA_BASE_URL}/why_china/high_volume_skill_icon_x2.png`,
      titleKey: "whyChina.features.skill.title",
      descriptionKey: "whyChina.features.skill.description",
    },
    {
      icon: `${LOW_MEDIA_BASE_URL}/why_china/diagnois_icon_x2.png`,
      titleKey: "whyChina.features.diagnostics.title",
      descriptionKey: "whyChina.features.diagnostics.description",
    },
    {
      icon: `${LOW_MEDIA_BASE_URL}/why_china/aaa_icon_x2.png`,
      titleKey: "whyChina.features.facilities.title",
      descriptionKey: "whyChina.features.facilities.description",
    },
  ];
  
  return (
    <section className="relative w-full">
      <PageHero
        title={
          <span className="text-[#003B59]">
            {t('whyChina.hero.title')}
          </span>
        }
        subtitle={t('whyChina.hero.subtitle')}
        backgroundImage={`${LOW_MEDIA_BASE_URL}/why_china/banner_x2.png`}
        heightClassName="h-[280px] sm:h-[350px] md:h-[420px] lg:h-[430px] xl:h-[488px] 2xl:h-[488px]"
        imageObjectPosition="center center"
      />

      {/* Feature Cards - Positioned at bottom with overlap */}
      <div className="relative z-20 -mt-12 sm:-mt-16 md:-mt-20 lg:-mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full flex items-center justify-center p-2 sm:p-3">
                    <img
                      src={feature.icon}
                      alt={feature.title}
                      
                      
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <GradientText as="h3" className="text-base sm:text-lg md:text-xl font-bold text-center mb-2 sm:mb-3">
                  {t(feature.titleKey)}
                </GradientText>
                <p className="text-[#646464] text-xs sm:text-xs md:text-sm text-center leading-relaxed">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

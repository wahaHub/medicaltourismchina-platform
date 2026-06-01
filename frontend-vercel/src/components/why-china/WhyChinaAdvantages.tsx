// Next Image removed;
import GradientText from "@/components/ui/GradientText";
import { useLanguage } from "@/contexts/LanguageContext";
import { LOW_MEDIA_BASE_URL } from "@/config/media";

export default function WhyChinaAdvantages() {
  const { t } = useLanguage();

  const advantages = [
    {
      titleKey: "whyChina.advantages.cost.title",
      descriptionKey: "whyChina.advantages.cost.description",
      points: [
        "whyChina.advantages.cost.point1",
        "whyChina.advantages.cost.point2",
      ],
    },
    {
      titleKey: "whyChina.advantages.quality.title",
      descriptionKey: "whyChina.advantages.quality.description",
      points: [
        "whyChina.advantages.quality.point1",
        "whyChina.advantages.quality.point2",
        "whyChina.advantages.quality.point3",
      ],
    },
    {
      titleKey: "whyChina.advantages.technology.title",
      descriptionKey: "whyChina.advantages.technology.description",
      points: [],
    },
    {
      titleKey: "whyChina.advantages.expertise.title",
      descriptionKey: "whyChina.advantages.expertise.description",
      points: [
        "whyChina.advantages.expertise.point1",
        "whyChina.advantages.expertise.point2",
      ],
    },
  ];

  return (
    <section className="bg-white py-16 md:py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Side - Advantages List */}
          <div className="space-y-8 md:space-y-10 lg:space-y-12">
            {advantages.map((advantage, index) => (
              <div key={index} className="space-y-3 md:space-y-4">
                {/* Title */}
                <GradientText
                  as="h3"
                  className="font-bold text-lg md:text-xl lg:text-2xl uppercase tracking-wide"
                  fromColor="#52af98"
                  toColor="#038a81"
                >
                  {t(advantage.titleKey)}
                </GradientText>

                {/* Subtitle with decoration */}
                <div className="relative pl-4 border-l-2 border-[#52af98]">
                  <p className="text-[#333] text-base md:text-lg font-medium italic leading-relaxed">
                    {t(advantage.descriptionKey)}
                  </p>
                </div>

                {/* Content points */}
                {advantage.points.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {advantage.points.map((pointKey, pointIndex) => (
                      <div key={pointIndex} className="flex items-start gap-2">
                        <span className="text-[#52af98] mt-1.5 flex-shrink-0">•</span>
                        <p className="text-[#646464] text-sm md:text-base leading-relaxed">
                          {t(pointKey)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side - China Map */}
          <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center">
            <div className="relative w-full h-full">
              <img
                src={`${LOW_MEDIA_BASE_URL}/why_china/map_china_x2.png`}
                alt="China Map with Major Medical Cities"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



import { figmaColors } from "@/components/figma/design-tokens";
// Next Image removed;
import { useLanguage } from "@/contexts/LanguageContext";
import { LOW_MEDIA_BASE_URL } from "@/config/media";

export default function VisaTimeline() {
  const { t } = useLanguage();
  
  const timelineSteps = [
    {
      timeKey: "visa.timeline.step1.time",
      titleKey: "visa.timeline.step1.title",
    },
    {
      timeKey: "visa.timeline.step2.time",
      titleKey: "visa.timeline.step2.title",
    },
    {
      timeKey: "visa.timeline.step3.time",
      titleKey: "visa.timeline.step3.title",
    },
    {
      timeKey: "visa.timeline.step4.time",
      titleKey: "visa.timeline.step4.title",
    },
    {
      timeKey: "visa.timeline.step5.time",
      titleKey: "visa.timeline.step5.title",
    },
  ];

  return (
    <section className="py-10 px-0 sm:px-4 md:px-12 lg:px-20 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl px-4 sm:px-6 md:px-10 lg:px-12 mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
            <div 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0" 
            >
              <img 
                src={`${LOW_MEDIA_BASE_URL}/visa/visa_application_icon_x2.png`} 
                alt="Timeline Icon" 
                 
                
                className="w-full h-full"
              />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
                <span 
                  className="bg-gradient-to-r  from-[#038A81] to-[#003B59] bg-clip-text text-transparent"
                >
                  {t('visa.timeline.title')}
                </span>
              </h2>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-0 space-x-0 sm:space-x-2">
            {timelineSteps.map((item, index) => (
              <div key={index} className="flex mr-0 sm:mr-2">
                <div className="flex flex-col items-center mr-3 sm:mr-4 ml-0 sm:ml-1">
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#86C7B7" }}
                  >
                    <span className="text-white font-semibold text-sm sm:text-base">{index + 1}</span>
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div 
                      className="w-0.5 h-full mt-[0.5]" 
                      style={{ backgroundColor: "#86C7B7" }} 
                    />
                  )}
                </div>
                <div className="pb-6 sm:pb-8">
                  <p 
                    className="font-semibold mb-1 text-sm sm:text-base" 
                    style={{ color: "#86C7B7" }}
                  >
                    {t(item.timeKey)}
                  </p>
                  <p className="text-[#4B5563] text-sm sm:text-base">{t(item.titleKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

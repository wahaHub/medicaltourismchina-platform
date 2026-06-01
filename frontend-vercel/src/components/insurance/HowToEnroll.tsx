

// Next Image removed;
import GradientText from '@/components/ui/GradientText';
import { useLanguage } from "@/contexts/LanguageContext";

export default function HowToEnroll() {
  const { t } = useLanguage();
  
  const steps = [
    {
      image: "/insurance/how_enroll_img_1.png",
      titleKey: "insurance.enroll.step1.title",
      descriptionKey: "insurance.enroll.step1.description"
    },
    {
      image: "/insurance/how_enroll_img_2.png",
      titleKey: "insurance.enroll.step2.title",
      descriptionKey: "insurance.enroll.step2.description"
    },
    {
      image: "/insurance/how_enroll_img_3.png",
      titleKey: "insurance.enroll.step3.title",
      descriptionKey: "insurance.enroll.step3.description"
    }
  ];

  return (
    // bg-[#f2f6f9]
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <GradientText as="h2" className="text-3xl md:text-4xl font-bold mb-4">
            {t('insurance.enroll.title')}
          </GradientText>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            {t('insurance.enroll.subtitle')}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-4 md:gap-6">
                <div className="flex flex-col items-center text-center group">
                  {/* border-4 border-[#038a81] */}
                  <div className="relative w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden  mb-6 group-hover:scale-105 transition-transform shadow-lg">
                    <img
                      src={step.image}
                      alt={t(step.titleKey)}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* <h3 className="text-lg font-bold text-[#003b59] mb-3 max-w-[200px]">
                    {t(step.titleKey)}
                  </h3> */}
                  <p className="text-gray-600 text-sm max-w-[220px] leading-relaxed">
                    {t(step.descriptionKey)}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block flex-shrink-0">
                    <img
                      src="/insurance/arrow_icon.png"
                      alt="Next step"
                      
                      
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

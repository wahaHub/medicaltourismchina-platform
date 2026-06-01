import TextImageListSection, { TextImageItem } from '@/components/common/TextImageListSection';
import GradientText from '@/components/ui/GradientText';
import { useLanguage } from "@/contexts/LanguageContext";

export default function AfterAdmissionSection() {
  const { t } = useLanguage();
  
  const services: TextImageItem[] = [
    {
      title: t('hospitalAdmissions.afterAdmission.service1.title'),
      description: t('hospitalAdmissions.afterAdmission.service1.description'),
      image: '/treatment-money/care-team.png',
      imageAlt: t('hospitalAdmissions.afterAdmission.service1.imageAlt'),
    },
    {
      title: t('hospitalAdmissions.afterAdmission.service2.title'),
      description: t('hospitalAdmissions.afterAdmission.service2.description'),
      image: '/treatment-money/payment-support.png',
      imageAlt: t('hospitalAdmissions.afterAdmission.service2.imageAlt'),
    },
    {
      title: t('hospitalAdmissions.afterAdmission.service3.title'),
      description: t('hospitalAdmissions.afterAdmission.service3.description'),
      image: '/treatment-money/ward-handover.png',
      imageAlt: t('hospitalAdmissions.afterAdmission.service3.imageAlt'),
    },
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <GradientText as="h2" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            {t('hospitalAdmissions.afterAdmission.title')}
          </GradientText>
        </div>

        <div className="space-y-3 sm:space-y-3 md:space-y-4">
          {services.map((item, index) => (
            <div
              key={index}
              className="rounded-xl bg-[#e4e4e4ff] overflow-hidden shadow-sm"
            >
              <div className="grid md:grid-cols-2 gap-0 items-center">
                {/* Text Content */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2">
                    <GradientText>{item.title}</GradientText>
                  </h3>
                  <p className="text-xs sm:text-xs md:text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Image */}
                <div className="relative h-[200px] sm:h-[200px] md:h-[280px] md:min-h-[240px]">
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(270deg, rgba(244, 245, 246, 0) 52.79%, #e4e4e4ff 100%)',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import IconFeatureCard from '@/components/common/IconFeatureCard';
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContinuousCareSection() {
  const { t } = useLanguage();
  
  const services = [
    {
      title: t('postTreatment.continuous.section1.title'),
      items: [
        t('postTreatment.continuous.section1.item1'),
        t('postTreatment.continuous.section1.item2')
      ],
    },
    {
      title: t('postTreatment.continuous.section2.title'),
      items: [
        t('postTreatment.continuous.section2.item1'),
        t('postTreatment.continuous.section2.item2')
      ],
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#F0F4F3]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12 sm:mb-14 md:mb-16">
          <h2
            className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2"
            style={{
              background: 'linear-gradient(90deg, #1DA78A 8.61%, #0F638E 95.7%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('postTreatment.continuous.mainTitle')}
          </h2>
          <p className="mt-4 sm:mt-6 text-gray-600 text-xs sm:text-sm md:text-sm max-w-4xl mx-auto leading-relaxed px-4">
            {t('postTreatment.continuous.mainDescription')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 sm:p-9 md:p-10 shadow-sm hover:shadow-lg transition-shadow"
            >
              <IconFeatureCard
                title={service.title}
                description={service.items}
                titleSize="text-lg mt-48 sm:text-xl"
                descriptionSize="text-[12px]"
                showUnderline={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

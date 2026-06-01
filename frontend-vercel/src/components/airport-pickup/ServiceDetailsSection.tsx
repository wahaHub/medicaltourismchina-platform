import IconFeatureCard from '@/components/common/IconFeatureCard';
import { useLanguage } from "@/contexts/LanguageContext";

export default function ServiceDetailsSection() {
  const { t } = useLanguage();
  
  const services = [
    {
      titleKey: 'airportPickup.serviceDetails.section1.title',
      itemKeys: [
        'airportPickup.serviceDetails.section1.item1',
      ],
    },
    {
      titleKey: 'airportPickup.serviceDetails.section2.title',
      itemKeys: [
        'airportPickup.serviceDetails.section2.item1',
        'airportPickup.serviceDetails.section2.item2',
        'airportPickup.serviceDetails.section2.item3',
      ],
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12 sm:mb-14 md:mb-16">
          <h2
            className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2"
            style={{
              background: 'linear-gradient(90deg, #1DA78A 8.61%, #0F638E 95.7%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('airportPickup.serviceDetails.mainTitle')}
          </h2>
          <p className="mt-4 sm:mt-6 text-gray-600 text-xs sm:text-sm md:text-sm max-w-4xl mx-auto leading-relaxed px-4">
            {t('airportPickup.serviceDetails.mainDescription')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
          {services.map((service, index) => (
              <IconFeatureCard
                key={index}
                title={t(service.titleKey)}
                description={service.itemKeys.map(key => t(key))}
                titleSize="text-lg sm:text-xl"
                descriptionSize="text-[12px]"
                showUnderline={true}
              />
          ))}
        </div>
      </div>
    </section>
  );
}

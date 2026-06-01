import IconFeatureCard from '@/components/common/IconFeatureCard';
import { useLanguage } from "@/contexts/LanguageContext";

export default function SelectionCriteriaSection() {
  const { t } = useLanguage();
  
  const criteria = [
    {
      titleKey: 'hotelAccommodation.selection.section1.title',
      itemKeys: [
        'hotelAccommodation.selection.section1.item1',
        'hotelAccommodation.selection.section1.item2',
        'hotelAccommodation.selection.section1.item3',
      ],
    },
    {
      titleKey: 'hotelAccommodation.selection.section2.title',
      itemKeys: [
        'hotelAccommodation.selection.section2.item1',
      ],
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
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
            {t('hotelAccommodation.selection.mainTitle')}
          </h2>
          <p className="mt-4 sm:mt-6 text-gray-600 text-xs sm:text-sm md:text-sm max-w-4xl mx-auto leading-relaxed px-4">
            {t('hotelAccommodation.selection.mainDescription')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
          {criteria.map((criterion, index) => (
            <IconFeatureCard
              key={index}
              title={t(criterion.titleKey)}
              description={criterion.itemKeys.map(key => t(key))}
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

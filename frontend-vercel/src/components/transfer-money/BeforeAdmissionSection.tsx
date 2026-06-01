import GradientText from '@/components/ui/GradientText';
import IconFeatureCard from '@/components/common/IconFeatureCard';
import { useLanguage } from "@/contexts/LanguageContext";

export default function BeforeAdmissionSection() {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: '/treatment-money/hospital_icon.png',
      titleKey: 'hospitalAdmissions.beforeAdmission.feature1.title',
      descriptionKey: 'hospitalAdmissions.beforeAdmission.feature1.description',
    },
    {
      icon: '/treatment-money/bad_icon.png',
      titleKey: 'hospitalAdmissions.beforeAdmission.feature2.title',
      descriptionKey: 'hospitalAdmissions.beforeAdmission.feature2.description',
    },
    {
      icon: '/treatment-money/compass_icon.png',
      titleKey: 'hospitalAdmissions.beforeAdmission.feature3.title',
      descriptionKey: 'hospitalAdmissions.beforeAdmission.feature3.description',
    },
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <GradientText as="h2" className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
            {t('hospitalAdmissions.beforeAdmission.title')}
          </GradientText>
          <p className="text-gray-600 text-sm sm:text-base md:text-md max-w-3xl mx-auto mt-4 md:mt-6">
            {t('hospitalAdmissions.beforeAdmission.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 mt-8 md:mt-12">
          {features.map((feature, index) => (
            <IconFeatureCard
              key={index}
              icon={feature.icon}
              title={t(feature.titleKey)}
              description={t(feature.descriptionKey)}
              circleSize={{
                base: "w-20 h-20",
                sm: "sm:w-24 sm:h-24",
                md: "md:w-28 md:h-28"
              }}
              iconSize={{
                base: "w-10 h-10",
                sm: "sm:w-12 sm:h-12",
                md: "md:w-14 md:h-14"
              }}
              titleSize="text-sm sm:text-sm md:text-base lg:text-lg"
              descriptionSize="text-xs sm:text-sm"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

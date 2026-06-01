import GradientText from '@/components/ui/GradientText';
import { useLanguage } from "@/contexts/LanguageContext";

export default function UponArrivalSection() {
  const { t } = useLanguage();
  
  const services = [
    {
      image: '/treatment-money/check_in.png',
      titleKey: 'hospitalAdmissions.uponArrival.service1.title',
      descriptionKey: 'hospitalAdmissions.uponArrival.service1.description',
    },
    {
      image: '/treatment-money/admission_form.png',
      titleKey: 'hospitalAdmissions.uponArrival.service2.title',
      descriptionKey: 'hospitalAdmissions.uponArrival.service2.description',
    },
    {
      image: '/treatment-money/ward-handover.png',
      titleKey: 'hospitalAdmissions.uponArrival.service3.title',
      descriptionKey: 'hospitalAdmissions.uponArrival.service3.description',
    },
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <GradientText as="h2" className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
            {t('hospitalAdmissions.uponArrival.title')}
          </GradientText>
          <p className="text-gray-600 text-sm sm:text-sm md:text-base max-w-3xl mx-auto mt-4 md:mt-6">
            {t('hospitalAdmissions.uponArrival.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8 md:mt-12">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-48 sm:h-56 md:h-64">
                <img
                  src={service.image}
                  alt={t(service.titleKey)}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 sm:p-5 md:p-6">
                <h4 className="text-center text-base sm:text-lg font-bold text-[#038A81] mb-3 md:mb-4">
                  {t(service.titleKey)}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {t(service.descriptionKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import ProgressiveImage from "@/components/ProgressiveImage";

const LOW_MEDIA_BASE = `${(import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL || 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev').replace(/\/+$/, '')}/low`;

export default function MedicalServicesGrid() {
  const { t } = useLanguage();

  const services = [
    {
      titleKey: "homepage.services.service1.title",
      descriptionKey: "homepage.services.service1.description",
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/medical_journey/doctor_app1`,
    },
    {
      titleKey: "homepage.services.service2.title",
      descriptionKey: "homepage.services.service2.description",
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/medical_journey/doctor_app2`,
    },
    {
      titleKey: "homepage.services.service3.title",
      descriptionKey: "homepage.services.service3.description",
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/medical_journey/doctor_app3`,
    },
    {
      titleKey: "homepage.services.service4.title",
      descriptionKey: "homepage.services.service4.description",
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/medical_journey/doctor_app4`,
    },
    {
      titleKey: "homepage.services.service5.title",
      descriptionKey: "homepage.services.service5.description",
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/medical_journey/doctor_app5`,
    },
    {
      titleKey: "homepage.services.service6.title",
      descriptionKey: "homepage.services.service6.description",
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/medical_journey/doctor_app6`,
    },
    {
      titleKey: "homepage.services.service7.title",
      descriptionKey: "homepage.services.service7.description",
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/medical_journey/doctor_app7`,
    },
    {
      titleKey: "homepage.services.service8.title",
      descriptionKey: "homepage.services.service8.description",
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/medical_journey/doctor_app8`,
    },
    {
      titleKey: "homepage.services.service9.title",
      descriptionKey: "homepage.services.service9.description",
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/medical_journey/doctor_app9`,
    },
    {
      titleKey: "homepage.services.service10.title",
      descriptionKey: "homepage.services.service10.description",
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/medical_journey/doctor_app10`,
    },
  ];

  return (
    <section className="py-6 sm:py-10 md:py-16 lg:py-20">
        {/* Background Image with Gradient Overlay */}
      <div className="relative h-[200px] sm:h-[280px] md:h-[340px] lg:h-[420px] mb-8 sm:mb-12 md:mb-16">
        <img
          src={`${LOW_MEDIA_BASE}/figma-assets/medical-services-bg_x2.png`}
          alt="Medical Services Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/80 to-[#0D9488]/70" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pb-7 sm:pb-4 md:pb-0 lg:pb-0">
            <div className="text-start max-w-4xl">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-3xl xl:text-4xl font-bold text-white mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                {t('homepage.services.sectionTitle')}
              </h2>
              <p className="text-white/90 max-w-3xl text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg leading-relaxed">
                {t('homepage.services.sectionDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="relative">
          {/* All cards - 2 columns on mobile/tablet, same layout on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-2.5 md:gap-4 -mt-8 sm:-mt-12 md:-mt-20 lg:-mt-28">
            {services.map((service, index) => (
              <div key={index}>
                <Card
                  className="bg-white p-0 shadow-none overflow-hidden rounded-xl sm:rounded-2xl border-none"
                >
                  {/* Mobile/Tablet: Image on top, text below. Desktop: Side by side */}
                  <div className="flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4">
                    <div className="shrink-0 w-full md:w-48 lg:w-64 h-32 sm:h-36 md:h-36 lg:h-40 relative rounded-lg overflow-hidden">
                      <ProgressiveImage
                        baseUrl={service.imageBaseUrl}
                        alt={t(service.titleKey as any)}
                        resolutionLevels={['x1', 'x3']}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold text-[#0A4A5C] mb-1 pb-1 border-b-4 border-[#14B8A6] w-fit">
                        {t(service.titleKey as any)}
                      </h3>
                      <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-600 leading-relaxed mt-1">
                        {t(service.descriptionKey as any)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import IconFeatureGrid from "@/components/common/IconFeatureGrid";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MedicalEnquiryFeatures() {
  const { t } = useLanguage();

  const enquiryFeatures = [
    {
      icon: "/medical-enquiry/medicine_icon.png",
      title: t('medicalEnquiry.features.feature1.title'),
      description: t('medicalEnquiry.features.feature1.description'),
    },
    {
      icon: "/medical-enquiry/techniques_icon.png",
      title: t('medicalEnquiry.features.feature2.title'),
      description: t('medicalEnquiry.features.feature2.description'),
    },
    {
      icon: "/medical-enquiry/clinical_icon.png",
      title: t('medicalEnquiry.features.feature3.title'),
      description: t('medicalEnquiry.features.feature3.description'),
    },
    {
      icon: "/medical-enquiry/risk_alerts_icon.png",
      title: t('medicalEnquiry.features.feature4.title'),
      description: t('medicalEnquiry.features.feature4.description'),
    },
  ];

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 justify-center">
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 max-w-4xl mx-auto"
            style={{
              background: 'linear-gradient(90deg, #1DA78A 8.61%, #0F638E 95.7%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {t('medicalEnquiry.features.sectionTitle')}
          </h2>
          <p className="text-sm text-gray-600 max-w-4xl mx-auto">
            {t('medicalEnquiry.features.sectionDescription')}
          </p>
        </div>

        {/* Feature Grid */}
        <IconFeatureGrid items={enquiryFeatures} />
      </div>
    </section>
  );
}

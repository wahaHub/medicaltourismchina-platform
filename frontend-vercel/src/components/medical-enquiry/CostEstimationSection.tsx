import IconFeatureSection from '@/components/common/IconFeatureSection';
import { useLanguage } from "@/contexts/LanguageContext";

export default function CostEstimationSection() {
  const { t } = useLanguage();

  const services = [
    {
      icon: "/medical-enquiry/categories_icon.png",
      title: t('medicalEnquiry.costEstimation.service1.title'),
      description: t('medicalEnquiry.costEstimation.service1.description'),
    },
    {
      icon: "/medical-enquiry/standards_icon.png",
      title: t('medicalEnquiry.costEstimation.service2.title'),
      description: t('medicalEnquiry.costEstimation.service2.description'),
    },
    {
      icon: "/medical-enquiry/extras_icon.png",
      title: t('medicalEnquiry.costEstimation.service3.title'),
      description: t('medicalEnquiry.costEstimation.service3.description'),
    },
  ];

  return (
    <IconFeatureSection
      title={t('medicalEnquiry.costEstimation.sectionTitle')}
      subtitle={t('medicalEnquiry.costEstimation.sectionSubtitle')}
      description={t('medicalEnquiry.costEstimation.sectionDescription')}
      features={services}
      backgroundColor="bg-[#F0F4F3]"
    />
  );
}

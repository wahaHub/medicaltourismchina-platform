import TextImageListSection from '@/components/common/TextImageListSection';
import { useLanguage } from "@/contexts/LanguageContext";

export default function CoreValueSection() {
  const { t } = useLanguage();

  const coreValues = [
    {
      title: t('medicalEnquiry.coreValue.value1.title'),
      description: t('medicalEnquiry.coreValue.value1.description'),
      image: '/medical-enquiry/facility-2.png',
      imageAlt: t('medicalEnquiry.coreValue.value1.imageAlt'),
    },
    {
      title: t('medicalEnquiry.coreValue.value2.title'),
      description: t('medicalEnquiry.coreValue.value2.description'),
      image: '/medical-enquiry/facility-3.png',
      imageAlt: t('medicalEnquiry.coreValue.value2.imageAlt'),
    },
    {
      title: t('medicalEnquiry.coreValue.value3.title'),
      description: t('medicalEnquiry.coreValue.value3.description'),
      image: '/medical-enquiry/facility-4.png',
      imageAlt: t('medicalEnquiry.coreValue.value3.imageAlt'),
    },
  ];

  return (
    <TextImageListSection
      title={t('medicalEnquiry.coreValue.sectionTitle')}
      subtitle={t('medicalEnquiry.coreValue.sectionSubtitle')}
      items={coreValues}
      backgroundColor="bg-white"
    />
  );
}

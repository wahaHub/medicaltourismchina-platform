import TextImageListSection from '@/components/common/TextImageListSection';
import { useLanguage } from "@/contexts/LanguageContext";

export default function ServiceAdvantagesSection() {
  const { t } = useLanguage();
  
  const advantages = [
    {
      title: t('telemedicine.advantages.item1.title'),
      description: t('telemedicine.advantages.item1.description'),
      image: '/airport-pickup/booking-service.png',
      imageAlt: 'Convenience advantage',
    },
    {
      title: t('telemedicine.advantages.item2.title'),
      description: t('telemedicine.advantages.item2.description'),
      image: '/airport-pickup/transparent-pricing.png',
      imageAlt: 'Full process management',
    },
    {
      title: t('telemedicine.advantages.item3.title'),
      description: t('telemedicine.advantages.item3.description'),
      image: '/airport-pickup/transparent-pricing.png',
      imageAlt: 'Multi-scenario flexibility',
    },
    {
      title: t('telemedicine.advantages.item4.title'),
      description: t('telemedicine.advantages.item4.description'),
      image: '/airport-pickup/transparent-pricing.png',
      imageAlt: 'Work-life balance',
    },
  ];

  return (
    <TextImageListSection
      title={t('telemedicine.advantages.mainTitle')}
      items={advantages}
      backgroundColor="bg-white"
    />
  );
}

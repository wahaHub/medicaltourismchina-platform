import TextImageListSection from '@/components/common/TextImageListSection';
import { useLanguage } from "@/contexts/LanguageContext";

export default function ServiceAdvantagesSection() {
  const { t } = useLanguage();
  
  const advantages = [
    {
      title: t('postTreatment.advantages.item1.title'),
      description: t('postTreatment.advantages.item1.description'),
      image: '/airport-pickup/booking-service.png',
      imageAlt: 'Local team support',
    },
    {
      title: t('postTreatment.advantages.item2.title'),
      description: t('postTreatment.advantages.item2.description'),
      image: '/airport-pickup/transparent-pricing.png',
      imageAlt: 'Personalized service',
    },
    {
      title: t('postTreatment.advantages.item3.title'),
      description: t('postTreatment.advantages.item3.description'),
      image: '/airport-pickup/transparent-pricing.png',
      imageAlt: 'Continuous support',
    },
    {
      title: t('postTreatment.advantages.item4.title'),
      description: t('postTreatment.advantages.item4.description'),
      image: '/airport-pickup/transparent-pricing.png',
      imageAlt: 'Professional medical resources',
    },
  ];

  return (
    <TextImageListSection
      title={t('postTreatment.advantages.mainTitle')}
      items={advantages}
      backgroundColor="bg-white"
    />
  );
}

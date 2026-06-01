import TextImageListSection from '@/components/common/TextImageListSection';
import { useLanguage } from "@/contexts/LanguageContext";

export default function ServiceAdvantagesSection() {
  const { t } = useLanguage();
  
  const services = [
    {
      title: t('hotelAccommodation.advantages.item1.title'),
      description: t('hotelAccommodation.advantages.item1.description'),
      image: '/hotel-accommodation/safety-security.png',
      imageAlt: t('hotelAccommodation.advantages.item1.imageAlt'),
    },
    {
      title: t('hotelAccommodation.advantages.item2.title'),
      description: t('hotelAccommodation.advantages.item2.description'),
      image: '/hotel-accommodation/cleanliness.png',
      imageAlt: t('hotelAccommodation.advantages.item2.imageAlt'),
    },
    {
      title: t('hotelAccommodation.advantages.item3.title'),
      description: t('hotelAccommodation.advantages.item3.description'),
      image: '/hotel-accommodation/value-pricing.png',
      imageAlt: t('hotelAccommodation.advantages.item3.imageAlt'),
    },
  ];

  return (
    <TextImageListSection
      title={t('hotelAccommodation.advantages.mainTitle')}
      items={services}
      backgroundColor="bg-white"
    />
  );
}

import TextImageListSection from '@/components/common/TextImageListSection';
import { useLanguage } from "@/contexts/LanguageContext";

export default function ServiceGuaranteeSection() {
  const { t } = useLanguage();
  
  const services = [
    {
      title: t('airportPickup.guarantee.item1.title'),
      description: t('airportPickup.guarantee.item1.description'),
      image: '/airport-pickup/booking-service.png',
      imageAlt: t('airportPickup.guarantee.item1.imageAlt'),
    },
    {
      title: t('airportPickup.guarantee.item2.title'),
      description: t('airportPickup.guarantee.item2.description'),
      image: '/airport-pickup/transparent-pricing.png',
      imageAlt: t('airportPickup.guarantee.item2.imageAlt'),
    },
    {
      title: t('airportPickup.guarantee.item3.title'),
      description: t('airportPickup.guarantee.item3.description'),
      image: '/airport-pickup/support-24-7.png',
      imageAlt: t('airportPickup.guarantee.item3.imageAlt'),
    },
  ];

  return (
    <TextImageListSection
      title={t('airportPickup.guarantee.mainTitle')}
      items={services}
      backgroundColor="bg-white"
    />
  );
}

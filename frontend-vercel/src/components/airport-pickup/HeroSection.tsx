import CommonHero from '@/components/medical-enquiry/CommonHero';
import { useLanguage } from "@/contexts/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();
  
  return (
    <CommonHero
      title={t('airportPickup.hero.title')}
      subtitle={t('airportPickup.hero.subtitle')}
      backgroundImage="/airport-pickup/hero-banner.png"
      gradientFrom="#14B8A6"
      gradientTo="#0D9488"
    />
  );
}

import CommonHero from '@/components/medical-enquiry/CommonHero';
import { useLanguage } from "@/contexts/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();
  
  return (
    <CommonHero
      title={t('telemedicine.hero.title')}
      subtitle={t('telemedicine.hero.subtitle')}
      backgroundImage="/telemedicine/hero_banner.png"
      gradientFrom="#14B8A6"
      gradientTo="#0D9488"
    />
  );
}

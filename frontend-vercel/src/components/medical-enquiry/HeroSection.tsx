import CommonHero from './CommonHero';
import { useLanguage } from "@/contexts/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <CommonHero
      title={t('medicalEnquiry.hero.title')}
      subtitle={t('medicalEnquiry.hero.subtitle')}
      backgroundImage="/medical-enquiry/hero-banner.png"
      gradientFrom="#1DA78A"
      gradientTo="#0F638E"
    />
  );
}



import PageHero from "@/components/common/PageHero";
import { useLanguage } from "@/contexts/LanguageContext";

export default function InsuranceHero() {
  const { t } = useLanguage();
  
  return (
    <PageHero
      title={
        <span className="text-[#003B59]">{t('insurance.hero.title')}</span>
      }
      subtitle={t('insurance.hero.subtitle')}
      backgroundImage="/insurance/banner.png"
      gradientOverlay="linear-gradient(90deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0) 100%)"
    />
  );
}

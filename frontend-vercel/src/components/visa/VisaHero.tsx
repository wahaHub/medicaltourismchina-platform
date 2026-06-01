

import PageHero from "@/components/common/PageHero";
import { useLanguage } from "@/contexts/LanguageContext";
import { LOW_MEDIA_BASE_URL } from "@/config/media";

export default function VisaHero() {
  const { t } = useLanguage();
  
  return (
    <PageHero
      title={
        <span className="text-[#003B59] mb-0 pb-0">
          {t('visa.hero.title')}
        </span>
      }
      subtitle={t('visa.hero.subtitle')}
      backgroundImage={`${LOW_MEDIA_BASE_URL}/visa/banner_x2.png`}
      heightClassName="h-[280px] sm:h-[350px] md:h-[420px] lg:h-[430px] xl:h-[486px] 2xl:h-[486px]"
      imageObjectPosition="center center"
      className=""
    />
  );
}

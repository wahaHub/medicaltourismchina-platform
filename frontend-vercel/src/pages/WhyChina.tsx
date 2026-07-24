import { Card, CardContent } from "@/components/ui/card";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhyChinaHero from "@/components/why-china/WhyChinaHero";
import WhyChinaAdvantages from "@/components/why-china/WhyChinaAdvantages";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { setPageSeo } from "@/utils/seo";

const WhyChina = () => {
  const { currentLanguage, t } = useLanguage();

  useEffect(() => {
    const isEnglish = currentLanguage.code === "en";
    setPageSeo({
      title: `${t("whyChina.title")} | Medora Health`,
      description: t("whyChina.subtitle"),
      path: "/why-china",
      robots: isEnglish ? "index,follow" : "noindex,follow",
      includeAlternates: false,
      availableLocales: ["en"],
    });
  }, [currentLanguage.code, t]);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      <WhyChinaHero />
      <WhyChinaAdvantages />

      {/* Numbers Section - Keep from old version */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-8" style={{ color: '#14B8A6' }}>{t('whyChina.numbersTitle')}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#14B8A6' }}>{t('whyChina.numbersSuperiorQuality')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('whyChina.numbersQualityDesc')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#14B8A6' }}>{t('whyChina.numbersCostEffective')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('whyChina.numbersCostDesc')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#14B8A6' }}>{t('whyChina.numbersSpecializedExpertise')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('whyChina.numbersExpertiseDesc')}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#14B8A6' }}>{t('whyChina.numbersCuttingEdge')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('whyChina.numbersTechDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WhyChina;

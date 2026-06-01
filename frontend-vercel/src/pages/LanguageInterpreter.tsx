import { useEffect } from "react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  HeroSection,
  ComprehensiveServiceSection,
  QualityAssuranceSection,
  LanguageSupportSection,
} from "@/components/language-interpreter";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageInterpreterPage = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    document.title = t('languageInterpreter.pageTitle');
  }, [t]);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      <main className="mt-0">
        <HeroSection />
        <ComprehensiveServiceSection />
        <QualityAssuranceSection />
        <LanguageSupportSection />
      </main>

      <Footer />
    </div>
  );
};

export default LanguageInterpreterPage;


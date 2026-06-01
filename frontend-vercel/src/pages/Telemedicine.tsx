import { useEffect } from "react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  HeroSection,
  RemoteConsultationSection,
  ServiceFeaturesSection,
  ServiceAdvantagesSection,
} from "@/components/telemedicine";
import { useLanguage } from "@/contexts/LanguageContext";

const TelemedicinePage = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    document.title = t('telemedicine.pageTitle');
  }, [t]);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      <main className="mt-0">
        <HeroSection />
        <RemoteConsultationSection />
        <ServiceFeaturesSection />
        <ServiceAdvantagesSection />
      </main>

      <Footer />
    </div>
  );
};

export default TelemedicinePage;


import { useEffect } from "react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  HeroSection,
  LongTermFollowUpSection,
  ContinuousCareSection,
  ServiceAdvantagesSection,
} from "@/components/post-treatment";
import { useLanguage } from "@/contexts/LanguageContext";

const PostTreatmentSupportPage = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    document.title = t('postTreatment.pageTitle');
  }, [t]);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      <main className="mt-0">
        <HeroSection />
        <LongTermFollowUpSection />
        <ContinuousCareSection />
        <ServiceAdvantagesSection />
      </main>

      <Footer />
    </div>
  );
};

export default PostTreatmentSupportPage;


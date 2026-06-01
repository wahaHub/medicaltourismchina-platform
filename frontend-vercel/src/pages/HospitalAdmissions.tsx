import { useEffect } from "react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  HeroSection,
  BeforeAdmissionSection,
  UponArrivalSection,
  AfterAdmissionSection,
} from "@/components/transfer-money";
import { useLanguage } from "@/contexts/LanguageContext";

const HospitalAdmissionsPage = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    document.title = t('hospitalAdmissions.pageTitle');
  }, [t]);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      <main className="mt-0">
        <HeroSection />
        <BeforeAdmissionSection />
        <UponArrivalSection />
        <AfterAdmissionSection />
      </main>

      <Footer />
    </div>
  );
};

export default HospitalAdmissionsPage;


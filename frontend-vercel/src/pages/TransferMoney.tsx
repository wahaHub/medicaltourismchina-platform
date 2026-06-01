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

const TransferMoneyPage = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    document.title = t('transferMoney.pageTitle');
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

export default TransferMoneyPage;


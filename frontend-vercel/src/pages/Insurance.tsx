import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InsuranceHero from "@/components/insurance/InsuranceHero";
import InsuranceProviders from "@/components/insurance/InsuranceProviders";
import WhatsCovered from "@/components/insurance/WhatsCovered";
import CoverageTable from "@/components/insurance/CoverageTable";
import HowToEnroll from "@/components/insurance/HowToEnroll";
import InsuranceFAQ from "@/components/insurance/InsuranceFAQ";
import { useLanguage } from "@/contexts/LanguageContext";

const Insurance = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      <InsuranceHero />
      <InsuranceProviders />
      <WhatsCovered />
      <CoverageTable />
      <HowToEnroll />
      <InsuranceFAQ />
      
      <Footer />
    </div>
  );
};

export default Insurance;

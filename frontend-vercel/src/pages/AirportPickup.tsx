import { useEffect } from "react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  HeroSection,
  ServiceDetailsSection,
  VehicleOptionsSection,
  ServiceGuaranteeSection,
} from "@/components/airport-pickup";
import { useLanguage } from "@/contexts/LanguageContext";

const AirportPickupPage = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    document.title = t('airportPickup.pageTitle');
  }, [t]);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      <main className="mt-0">
        <HeroSection />
        <ServiceDetailsSection />
        <VehicleOptionsSection />
        <ServiceGuaranteeSection />
      </main>

      <Footer />
    </div>
  );
};

export default AirportPickupPage;


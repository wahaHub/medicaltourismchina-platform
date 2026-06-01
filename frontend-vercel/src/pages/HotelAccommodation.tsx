import { useEffect } from "react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  HeroSection,
  SelectionCriteriaSection,
  HotelGallerySection,
  ServiceAdvantagesSection,
} from "@/components/hotel-accommodation";
import { useLanguage } from "@/contexts/LanguageContext";

const HotelAccommodationPage = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    document.title = t('hotelAccommodation.pageTitle');
  }, [t]);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      <main className="mt-0">
        <HeroSection />
        <SelectionCriteriaSection />
        <HotelGallerySection />
        <ServiceAdvantagesSection />
      </main>

      <Footer />
    </div>
  );
};

export default HotelAccommodationPage;


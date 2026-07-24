import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VisaHero from "@/components/visa/VisaHero";
import VisaCountryDetector from "@/components/visa/VisaCountryDetector";
import VisaFreeTransit from "@/components/visa/VisaFreeTransit";
import MedicalVisa from "@/components/visa/MedicalVisa";
import VisaTimeline from "@/components/visa/VisaTimeline";
import { VisaCountryProvider } from "@/contexts/VisaCountryContext";
import { useEffect } from "react";
import { setPageSeo } from "@/utils/seo";
import { useLanguage } from "@/contexts/LanguageContext";

const Visa = () => {
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    const isEnglish = currentLanguage.code === "en";
    setPageSeo({
      title: "Visa & Travel Support | Medora Health",
      description: "Appointment booking, translation, travel planning, and follow-up care.",
      path: "/visa",
      robots: isEnglish ? "index,follow" : "noindex,follow",
      includeAlternates: false,
      availableLocales: ["en"],
    });
  }, [currentLanguage.code]);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <VisaCountryProvider>
        <VisaHero />
        <VisaCountryDetector />
        <VisaFreeTransit />
        <MedicalVisa />
        <VisaTimeline />
      </VisaCountryProvider>

      <Footer />
    </div>
  );
};

export default Visa;

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
import { getStaticPageMetadata } from "@/seo/static-page";

const Visa = () => {
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    const metadata = getStaticPageMetadata("visa", currentLanguage.code);
    setPageSeo({
      title: metadata.locale.title,
      description: metadata.locale.description,
      path: metadata.path,
      robots: metadata.indexable ? "index,follow" : "noindex,follow",
      includeAlternates: metadata.indexable,
      availableLocales: metadata.indexableLocales,
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

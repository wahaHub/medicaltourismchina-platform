
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PackagesJourneySteps } from "@/components/packages";
import { useEffect } from "react";
import { setPageSeo } from "@/utils/seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { getStaticPageMetadata } from "@/seo/static-page";

const Packages = () => {
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    const metadata = getStaticPageMetadata("packages", currentLanguage.code);
    setPageSeo({
      title: metadata.locale.title,
      description: metadata.locale.description,
      path: metadata.path,
      availableLocales: metadata.indexableLocales,
    });
  }, [currentLanguage.code]);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      <PackagesJourneySteps />

      <Footer />
    </div>
  );
};

export default Packages;

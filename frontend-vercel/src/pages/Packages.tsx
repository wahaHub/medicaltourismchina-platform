
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PackagesJourneySteps } from "@/components/packages";
import { useEffect } from "react";
import { setPageSeo } from "@/utils/seo";

const Packages = () => {
  useEffect(() => {
    setPageSeo({
      title: "Treatment Packages | Medora Health",
      description: "Compare hospitals, estimated costs, timelines, and care plans.",
      path: "/packages",
    });
  }, []);

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

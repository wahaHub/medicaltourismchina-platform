
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PackagesJourneySteps } from "@/components/packages";

const Packages = () => {
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

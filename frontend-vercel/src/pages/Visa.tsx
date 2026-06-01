import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VisaHero from "@/components/visa/VisaHero";
import VisaCountryDetector from "@/components/visa/VisaCountryDetector";
import VisaFreeTransit from "@/components/visa/VisaFreeTransit";
import MedicalVisa from "@/components/visa/MedicalVisa";
import VisaTimeline from "@/components/visa/VisaTimeline";
import { VisaCountryProvider } from "@/contexts/VisaCountryContext";

const Visa = () => {
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

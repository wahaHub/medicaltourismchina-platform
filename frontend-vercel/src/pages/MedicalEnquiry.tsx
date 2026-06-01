import { useEffect } from "react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/medical-enquiry/HeroSection";
import MedicalEnquiryFeatures from "@/components/medical-enquiry/MedicalEnquiryFeatures";
import CostEstimationSection from "@/components/medical-enquiry/CostEstimationSection";
import CoreValueSection from "@/components/medical-enquiry/CoreValueSection";

const MedicalEnquiryPage = () => {
  useEffect(() => {
    document.title = "Medical Enquiry | MedChina";
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <main className="mt-0">
        <HeroSection />
        <MedicalEnquiryFeatures />
        <CostEstimationSection />
        <CoreValueSection />
      </main>

      <Footer />
    </div>
  );
};

export default MedicalEnquiryPage;


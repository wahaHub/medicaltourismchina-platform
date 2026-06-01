import { useEffect } from "react";
import Footer from "@/components/Footer";

// New V2 Header and Banner
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";

// New V2 Components
import HeroSection from "@/components/home-v2/HeroSection";
import WhyMedoraSection from "@/components/home-v2/WhyMedoraSection";
import MedicalServicesGrid from "@/components/home-v2/MedicalServicesGrid";
import WhyChooseChinaHome from "@/components/home-v2/WhyChooseChinaHome";
import TestimonialsSection from "@/components/home-v2/TestimonialsSection";

const HomePage = () => {
  useEffect(() => {
    // Update title
    document.title = "MedChina - Premium Medical Tourism to China";
  }, []);

  return (
    <div className="min-h-screen">
      {/* New V2 Top Banner */}
      <TopBanner />
      
      {/* New V2 Header/Navigation */}
      <Header />
      
      {/* New V2 Hero Section with Stats */}
      <HeroSection />

      {/* New V2 Why Medora Section */}
      <WhyMedoraSection />

      {/* New V2 Medical Services Section */}
      <MedicalServicesGrid />
      
      {/* New V2 Why Choose China Section */}
      <WhyChooseChinaHome />
      
      {/* New V2 Testimonials Section */}
      <TestimonialsSection />

      <Footer />
    </div>
  );
};

export default HomePage;

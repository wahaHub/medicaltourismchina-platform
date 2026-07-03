import { lazy, Suspense, useEffect } from "react";

// New V2 Header and Banner
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";

// New V2 Components
import HeroSection from "@/components/home-v2/HeroSection";
import { setPageSeo } from "@/utils/seo";

const OnlineConsultationSection = lazy(() => import("@/components/home-v2/OnlineConsultationSection"));
const Footer = lazy(() => import("@/components/Footer"));
const FeaturedInSection = lazy(() => import("@/components/home-v2/FeaturedInSection"));
const WhyMedoraSection = lazy(() => import("@/components/home-v2/WhyMedoraSection"));
const MedicalServicesGrid = lazy(() => import("@/components/home-v2/MedicalServicesGrid"));
const WhyChooseChinaHome = lazy(() => import("@/components/home-v2/WhyChooseChinaHome"));
const TestimonialsSection = lazy(() => import("@/components/home-v2/TestimonialsSection"));

const HomePage = () => {
  useEffect(() => {
    setPageSeo({
      title: "Medora Health | Medical Tourism & Telemedicine in China",
      description:
        "Medora Health helps international patients access specialist consultations, second opinions, treatment planning, hospital coordination, translation, visa support, and follow-up care in China.",
      path: "/",
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* New V2 Top Banner */}
      <TopBanner />
      
      {/* New V2 Header/Navigation */}
      <Header />
      
      {/* New V2 Hero Section with Stats */}
      <HeroSection />

      <Suspense fallback={null}>
        {/* Featured Media Section */}
        <FeaturedInSection />

        {/* Online Consultation / Second Opinion Section */}
        <OnlineConsultationSection />

        {/* New V2 Why Medora Section */}
        <WhyMedoraSection />

        {/* New V2 Medical Services Section */}
        <MedicalServicesGrid />
        
        {/* New V2 Why Choose China Section */}
        <WhyChooseChinaHome />
        
        {/* New V2 Testimonials Section */}
        <TestimonialsSection />

        <Footer />
      </Suspense>
    </div>
  );
};

export default HomePage;

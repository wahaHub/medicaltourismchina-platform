import { useEffect } from "react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DoctorAppointmentHero from "@/components/doctor-appointment/DoctorAppointmentHero";
import RenownedHospitalsSection from "@/components/doctor-appointment/RenownedHospitalsSection";
import RenownedDoctorsSection from "@/components/doctor-appointment/RenownedDoctorsSection";

const DoctorAppointmentPage = () => {
  useEffect(() => {
    document.title = "Doctor Appointment | MedChina";
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      
      <main className="mt-0">
        <DoctorAppointmentHero />
        <RenownedHospitalsSection />
        <RenownedDoctorsSection />
      </main>

      <Footer />
    </div>
  );
};

export default DoctorAppointmentPage;


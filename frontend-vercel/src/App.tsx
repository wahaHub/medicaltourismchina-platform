
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PatientAuthProvider } from "@/contexts/PatientAuthContext";
import { PatientEntryProvider } from "@/contexts/PatientEntryContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ChatWidget from "@/components/chat/ChatWidget";
import PatientMessagePanel from "@/components/messaging/PatientMessagePanel";
import { PatientSessionRuntimeProvider } from "@/features/patient-sessions/PatientSessionRuntimeProvider";
import RouteScrollManager from "@/components/RouteScrollManager";
import Search from "./pages/Search";
import HomePage from "./pages/HomePage";
import Hospitals from "./pages/Hospitals";
import HospitalDetail from "./pages/HospitalDetail";
import HospitalPackageDetail from "./pages/HospitalPackageDetail";
import LegacyHospitalRedirect from "./pages/LegacyHospitalRedirect";
import Treatment from "./pages/Treatment";
import TreatmentDetail from "./pages/TreatmentDetail";
import ProcedureDetail from "./pages/ProcedureDetail";
import FeaturedTreatmentDetail from "./pages/FeaturedTreatmentDetail";
import DepartmentDetail from "./pages/DepartmentDetail";
import SeoTreatmentLanding from "./pages/SeoTreatmentLanding";
import Packages from "./pages/Packages";
import Insurance from "./pages/Insurance";
import Visa from "./pages/Visa";
import WhyChina from "./pages/WhyChina";
import FAQ from "./pages/FAQ";
import WorkWithUs from "./pages/WorkWithUs";
import PartnershipApplicationPage from "./pages/PartnershipApplicationPage";
import CaseIntakePage from "./pages/CaseIntakePage";
import CaseIntakeViewPage from "./pages/CaseIntakeViewPage";
import NotFound from "./pages/NotFound";

// New Service Pages
import DoctorAppointment from "./pages/DoctorAppointment";
import MedicalEnquiry from "./pages/MedicalEnquiry";
import HospitalAdmissions from "./pages/HospitalAdmissions";
import AirportPickup from "./pages/AirportPickup";
import HotelAccommodation from "./pages/HotelAccommodation";
import LanguageInterpreter from "./pages/LanguageInterpreter";
import Telemedicine from "./pages/Telemedicine";
import PostTreatmentSupport from "./pages/PostTreatmentSupport";
import TransferMoney from "./pages/TransferMoney";
import FreeQuote from "./pages/FreeQuote";
import PatientLoginPage from "./pages/PatientLoginPage";
import DashboardRoute from "./pages/DashboardRoute";
import HealthPackages from "./pages/HealthPackages";
import HollywoodSmileVeneers from "./pages/HollywoodSmileVeneers";
import Rhinoplasty from "./pages/Rhinoplasty";
import DoubleEyelidSurgery from "./pages/DoubleEyelidSurgery";
import FaceLiposuction from "./pages/FaceLiposuction";
import BariatricSurgery from "./pages/BariatricSurgery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <PatientAuthProvider>
              <PatientEntryProvider>
                <PatientSessionRuntimeProvider>
                  <RouteScrollManager />
                  <ChatWidget />
                  <PatientMessagePanel />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/hospitals" element={<Hospitals />} />
                    <Route path="/hospitals/:slug" element={<HospitalDetail />} />
                    <Route path="/hospitals/:slug/packages/:packageSlug" element={<HospitalPackageDetail />} />
                    <Route path="/hospital/:id" element={<LegacyHospitalRedirect />} />
                    <Route path="/treatment" element={<Treatment />} />
                    <Route path="/procedures/:slug" element={<ProcedureDetail />} />
                    <Route path="/featured-treatments/:slug" element={<FeaturedTreatmentDetail />} />
                    <Route path="/treatment/department/:department" element={<DepartmentDetail />} />
                    <Route path="/treatment/:slug" element={<TreatmentDetail />} />
                    <Route path="/packages" element={<Packages />} />
                    <Route path="/insurance" element={<Insurance />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/work-with-us" element={<WorkWithUs />} />
                    <Route path="/work-with-us/hospitals/apply" element={<PartnershipApplicationPage applicationType="hospitals" />} />
                    <Route path="/work-with-us/referral-partners/apply" element={<PartnershipApplicationPage applicationType="referral-partners" />} />
                    <Route path="/work-with-us/travel-services/apply" element={<PartnershipApplicationPage applicationType="travel-services" />} />
                    <Route path="/visa" element={<Visa />} />
                    <Route path="/why-china" element={<WhyChina />} />
                    <Route path="/medical-case-intake" element={<CaseIntakePage />} />
                    <Route path="/case-intake/:id" element={<CaseIntakeViewPage />} />
                    <Route path="/patient-login" element={<PatientLoginPage />} />
                    <Route path="/dashboard" element={<DashboardRoute />} />

                    {/* New Service Pages */}
                    <Route path="/doctor-appointment" element={<DoctorAppointment />} />
                    <Route path="/medical-enquiry" element={<MedicalEnquiry />} />
                    <Route path="/hospital-admissions" element={<HospitalAdmissions />} />
                    <Route path="/airport-pick-up" element={<AirportPickup />} />
                    <Route path="/hotel-accommodation" element={<HotelAccommodation />} />
                    <Route path="/language-interpreter" element={<LanguageInterpreter />} />
                    <Route path="/telemedicine" element={<Telemedicine />} />
                    <Route path="/post-treatment-support" element={<PostTreatmentSupport />} />
                    <Route path="/transfer-money-for-treatment" element={<TransferMoney />} />
                    <Route path="/free-quote" element={<FreeQuote />} />
                    <Route path="/health-packages" element={<HealthPackages />} />
                    <Route path="/hollywood-smile-veneers" element={<HollywoodSmileVeneers />} />
                    <Route path="/rhinoplasty" element={<Rhinoplasty />} />
                    <Route path="/double-eyelid-surgery" element={<DoubleEyelidSurgery />} />
                    <Route path="/facial-liposuction" element={<FaceLiposuction />} />
                    <Route path="/bariatric-surgery" element={<BariatricSurgery />} />
                    <Route path="/cosmetic-surgery" element={<SeoTreatmentLanding type="cosmetic" />} />
                    <Route path="/cancer-treatment" element={<SeoTreatmentLanding type="cancer" />} />
                    <Route path="/dental-treatment" element={<SeoTreatmentLanding type="dental" />} />
                    <Route path="/stem-cell-therapy" element={<SeoTreatmentLanding type="stemCell" />} />

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </PatientSessionRuntimeProvider>
              </PatientEntryProvider>
            </PatientAuthProvider>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

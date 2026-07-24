
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PatientAuthProvider } from "@/contexts/PatientAuthContext";
import { PatientEntryProvider } from "@/contexts/PatientEntryContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import RouteScrollManager from "@/components/RouteScrollManager";
import HomePage from "./pages/HomePage";
import {
  getLocaleBasename,
  getLocaleFromPathname,
} from "@/utils/locale-routing";
import { setPageSeo } from "@/utils/seo";

const Search = lazy(() => import("./pages/Search"));
const Hospitals = lazy(() => import("./pages/Hospitals"));
const HospitalDetail = lazy(() => import("./pages/HospitalDetail"));
const HospitalPackageDetail = lazy(() => import("./pages/HospitalPackageDetail"));
const LegacyHospitalRedirect = lazy(() => import("./pages/LegacyHospitalRedirect"));
const Treatment = lazy(() => import("./pages/Treatment"));
const TreatmentDetail = lazy(() => import("./pages/TreatmentDetail"));
const ProcedureDetail = lazy(() => import("./pages/ProcedureDetail"));
const FeaturedTreatmentDetail = lazy(() => import("./pages/FeaturedTreatmentDetail"));
const DepartmentDetail = lazy(() => import("./pages/DepartmentDetail"));
const SeoTreatmentLanding = lazy(() => import("./pages/SeoTreatmentLanding"));
const Packages = lazy(() => import("./pages/Packages"));
const Insurance = lazy(() => import("./pages/Insurance"));
const Visa = lazy(() => import("./pages/Visa"));
const WhyChina = lazy(() => import("./pages/WhyChina"));
const FAQ = lazy(() => import("./pages/FAQ"));
const WorkWithUs = lazy(() => import("./pages/WorkWithUs"));
const PartnershipApplicationPage = lazy(() => import("./pages/PartnershipApplicationPage"));
const CaseIntakePage = lazy(() => import("./pages/CaseIntakePage"));
const CaseIntakeViewPage = lazy(() => import("./pages/CaseIntakeViewPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Telemedicine = lazy(() => import("./pages/Telemedicine"));
const FreeQuote = lazy(() => import("./pages/FreeQuote"));
const PatientLoginPage = lazy(() => import("./pages/PatientLoginPage"));
const DashboardRoute = lazy(() => import("./pages/DashboardRoute"));
const HealthPackages = lazy(() => import("./pages/HealthPackages"));
const HollywoodSmileVeneers = lazy(() => import("./pages/HollywoodSmileVeneers"));
const Rhinoplasty = lazy(() => import("./pages/Rhinoplasty"));
const DoubleEyelidSurgery = lazy(() => import("./pages/DoubleEyelidSurgery"));
const FaceLiposuction = lazy(() => import("./pages/FaceLiposuction"));
const BariatricSurgery = lazy(() => import("./pages/BariatricSurgery"));
const LocationGuide = lazy(() => import("./pages/LocationGuide"));
const DeferredPatientMessaging = lazy(() => import("./components/DeferredPatientMessaging"));
const PatientSessionRuntimeProvider = lazy(() =>
  import("@/features/patient-sessions/PatientSessionRuntimeProvider").then((module) => ({
    default: module.PatientSessionRuntimeProvider,
  })),
);

const queryClient = new QueryClient();

function RouteFallback() {
  return <div className="min-h-[40vh] bg-white" aria-hidden="true" />;
}

function GoogleAnalyticsPageView() {
  const location = useLocation();

  useEffect(() => {
    window.gtag?.("event", "page_view", {
      page_location: window.location.href,
      page_path: `${location.pathname}${location.search}`,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
}

function DeferredPatientMessagingLoader() {
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const load = () => setCanLoad(true);
    const idleCallback = window.requestIdleCallback?.(load, { timeout: 2500 });
    const timer = window.setTimeout(load, 1800);

    return () => {
      window.clearTimeout(timer);
      if (idleCallback !== undefined) {
        window.cancelIdleCallback?.(idleCallback);
      }
    };
  }, []);

  if (!canLoad) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <DeferredPatientMessaging />
    </Suspense>
  );
}

function PatientRuntimeRoute({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <PatientSessionRuntimeProvider>{children}</PatientSessionRuntimeProvider>
    </Suspense>
  );
}

function NoIndexRoute({ children, title }: { children: ReactNode; title: string }) {
  const location = useLocation();

  useEffect(() => {
    setPageSeo({
      title,
      description: "Secure or task-focused Medora Health page.",
      path: location.pathname,
      robots: "noindex,nofollow",
      includeAlternates: false,
    });
  }, [location.pathname, title]);

  return children;
}

const activeLocale =
  typeof window === "undefined" ? "en" : getLocaleFromPathname(window.location.pathname);
const routerBasename = getLocaleBasename(activeLocale);

const App = () => (
  <BrowserRouter basename={routerBasename}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider initialLanguageCode={activeLocale}>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <GoogleAnalyticsPageView />
            <PatientAuthProvider>
              <PatientEntryProvider>
                <RouteScrollManager />
                <DeferredPatientMessagingLoader />
                <Suspense fallback={<RouteFallback />}>
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
                    <Route path="/work-with-us/hospitals/apply" element={<NoIndexRoute title="Hospital Partnership Application | Medora Health"><PartnershipApplicationPage applicationType="hospitals" /></NoIndexRoute>} />
                    <Route path="/work-with-us/referral-partners/apply" element={<NoIndexRoute title="Referral Partner Application | Medora Health"><PartnershipApplicationPage applicationType="referral-partners" /></NoIndexRoute>} />
                    <Route path="/work-with-us/travel-services/apply" element={<NoIndexRoute title="Travel Services Application | Medora Health"><PartnershipApplicationPage applicationType="travel-services" /></NoIndexRoute>} />
                    <Route path="/visa" element={<Visa />} />
                    <Route path="/why-china" element={<WhyChina />} />
                    <Route path="/locations/china/:city" element={<LocationGuide />} />
                    <Route path="/medical-case-intake" element={<NoIndexRoute title="Medical Case Intake | Medora Health"><CaseIntakePage /></NoIndexRoute>} />
                    <Route path="/case-intake/:id" element={<NoIndexRoute title="Medical Case | Medora Health"><CaseIntakeViewPage /></NoIndexRoute>} />
                    <Route path="/patient-login" element={<NoIndexRoute title="Patient Login | Medora Health"><PatientLoginPage /></NoIndexRoute>} />
                    <Route path="/dashboard" element={<NoIndexRoute title="Patient Dashboard | Medora Health"><PatientRuntimeRoute><DashboardRoute /></PatientRuntimeRoute></NoIndexRoute>} />

                    <Route path="/telemedicine" element={<Telemedicine />} />
                    <Route path="/free-quote" element={<NoIndexRoute title="Request a Treatment Quote | Medora Health"><FreeQuote /></NoIndexRoute>} />
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
                </Suspense>
              </PatientEntryProvider>
            </PatientAuthProvider>
        </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;

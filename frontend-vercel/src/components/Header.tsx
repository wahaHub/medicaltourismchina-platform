import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import QuoteRequestModal from "@/components/QuoteRequestModal";
import { BRAND_LOGO_URL } from "@/config/brandAssets";

const navLinks = [
  { label: "HOME", labelKey: "nav.home", href: "/" },
  { label: "TELEMEDICINE", labelKey: "nav.telemedicine", href: "/telemedicine" },
  { label: "SEARCH", labelKey: "nav.search", href: "/search" },
  { label: "FEATURED", labelKey: "nav.treatment", href: "/treatment" },
  { label: "TREATMENT PACKAGES", labelKey: "nav.packages", href: "/packages" },
  { label: "HOSPITALS", labelKey: "nav.hospitals", href: "/hospitals" },
  { label: "VISA & TRAVEL", labelKey: "nav.visa", href: "/visa" },
  { label: "WHY CHINA", labelKey: "nav.whyChina", href: "/why-china" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const location = useLocation();
  const { currentLanguage, t } = useLanguage();
  const visibleNavLinks =
    currentLanguage.code === "ar"
      ? navLinks.filter((link) => link.href !== "/why-china")
      : navLinks;

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="fixed top-[44px] left-0 right-0 z-50 bg-white shadow-sm w-full">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-14 sm:h-16 xl:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 min-w-0">
            <img
              src={BRAND_LOGO_URL}
              alt="Medora Health"
              className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden xl:flex items-center gap-6 xl:gap-8 flex-1 justify-center mx-8">
            {visibleNavLinks.map((link) => {
              const active = isActive(link.href);
              const label = t(link.labelKey) || link.label;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`relative pb-[22px] pt-[26px] text-[13px] tracking-wide whitespace-nowrap ${
                    active
                      ? "bg-gradient-to-r font-bold from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent"
                      : "text-gray-700 hover:text-[#1DA78A]"
                  }`}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1DA78A] to-[#0F638E] rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Separator */}
          <div className="hidden xl:block w-px h-10 bg-[#D9D9D9]"></div>

          {/* CTA Button + Mobile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 xl:ml-6 flex-shrink-0">
            {/* Desktop Button - Full Text */}
            <Button
              onClick={() => setIsConsultationModalOpen(true)}
              className="hidden xl:flex bg-gradient-to-r from-[#1DA78A] to-[#0F638E] hover:opacity-90 text-white rounded-full px-6 py-3 text-sm font-medium transition-opacity shadow-md items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('nav.bookAppointment') || 'Book an Appointment'}</span>
            </Button>
            {/* Medium Screen Button - Icon Only */}
            <Button
              onClick={() => setIsConsultationModalOpen(true)}
              className="hidden md:flex xl:hidden bg-gradient-to-r from-[#1DA78A] to-[#0F638E] hover:opacity-90 text-white rounded-full p-3 transition-opacity shadow-md"
              size="icon"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden p-1.5 sm:p-2 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="xl:hidden border-t border-gray-200 bg-white shadow-lg max-h-[calc(100vh-56px)] overflow-y-auto">
          <nav className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex flex-col gap-0.5 sm:gap-1">
              {visibleNavLinks.map((link) => {
                const active = isActive(link.href);
                const label = t(link.labelKey) || link.label;
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`relative py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all text-xs sm:text-sm font-semibold ${
                      active
                        ? "bg-gradient-to-r from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent"
                        : "text-gray-700 hover:bg-gray-50 hover:text-[#1DA78A]"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 sm:h-8 bg-gradient-to-b from-[#1DA78A] to-[#0F638E] rounded-r-full" />
                    )}
                  </Link>
                );
              })}
              
              {/* Book Appointment Button in Mobile Menu */}
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsConsultationModalOpen(true);
                  }}
                  className="w-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E] hover:opacity-90 text-white rounded-full px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-opacity shadow-md flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t('nav.bookAppointment') || 'Book an Appointment'}</span>
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Consultation Modal */}
      <QuoteRequestModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        type="consultation"
      />
    </header>
  );
}

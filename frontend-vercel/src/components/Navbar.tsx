import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { resolveUnifiedSiteAuth } from "@/components/site-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const {
    patient,
    isAuthenticated: isPatientAuthenticated,
    logout: logoutPatient,
  } = usePatientAuth();
  const { currentLanguage, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const siteAuth = resolveUnifiedSiteAuth({
    legacy: { user, isAuthenticated, logout },
    patient: { patient, isAuthenticated: isPatientAuthenticated, logout: logoutPatient },
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const openPatientLogin = () => {
    setMobileMenuOpen(false);
    navigate('/patient-login');
  };

  const navLinks = [
    { nameKey: "nav.home", href: "#" },
    { nameKey: "nav.about", href: "#about" },
    { nameKey: "nav.services", href: "#services" },
    { nameKey: "nav.destinations", href: "#destinations" },
    { nameKey: "nav.testimonials", href: "#testimonials" },
    { nameKey: "nav.resources", href: "#resources" },
    { nameKey: "nav.contact", href: "#contact" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
        scrolled ? "bg-white shadow-md py-2" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center">
          <span className="text-2xl font-bold text-mintGreen">MedChina</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.nameKey}
              href={link.href}
              className={cn(
                "font-medium text-base transition-colors",
                scrolled ? "text-gray-800 hover:text-mintGreen" : "text-white hover:text-mintGreen"
              )}
            >
              {t(link.nameKey as any)}
            </a>
          ))}
        </nav>

        {/* Right Side - Language & Auth */}
        <div className="hidden lg:flex items-center space-x-4">
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-2">
                  <span className="text-lg leading-none">{currentLanguage.flag}</span>
                  <span>{currentLanguage.code.toUpperCase()}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang)}
                    className={lang.code === currentLanguage.code ? "bg-gray-100" : ""}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {siteAuth.isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-mintGreen text-mintGreen hover:bg-mintGreen/5">
                  <User className="h-4 w-4 mr-2" />
                  {siteAuth.userLabel}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.location.href = '/dashboard'}>
                  <User className="h-4 w-4 mr-2" />
                  {t('auth.dashboard')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void siteAuth.logout?.()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('auth.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" className="border-mintGreen text-mintGreen hover:bg-mintGreen/5" onClick={openPatientLogin}>
                {t('auth.login')}
              </Button>
              <Button size="sm" className="bg-mintGreen text-white hover:bg-mintGreen/90" onClick={openPatientLogin}>
                {t('auth.signup')}
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden text-gray-800 p-2 focus:outline-none"
        >
          {mobileMenuOpen ? (
            <X className={cn("h-6 w-6", scrolled ? "text-gray-800" : "text-white")} />
          ) : (
            <Menu className={cn("h-6 w-6", scrolled ? "text-gray-800" : "text-white")} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 bg-white z-40 lg:hidden flex flex-col pt-20 px-4",
          mobileMenuOpen ? "flex" : "hidden"
        )}
      >
        <div className="flex flex-col space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.nameKey}
              href={link.href}
              className="text-gray-800 font-medium py-2 px-4 hover:bg-gray-100 rounded-md"
              onClick={toggleMobileMenu}
            >
              {t(link.nameKey as any)}
            </a>
          ))}
          <hr className="my-2" />
          <div className="py-2 px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-2 w-full justify-start">
                  <span className="text-lg leading-none">{currentLanguage.flag}</span>
                  <span>{currentLanguage.name}</span>
                  <ChevronDown className="h-3 w-3 ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang)}
                    className={lang.code === currentLanguage.code ? "bg-gray-100" : ""}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {siteAuth.isAuthenticated ? (
            <>
              <Button variant="outline" className="w-full border-mintGreen text-mintGreen hover:bg-mintGreen/5" onClick={() => window.location.href = '/dashboard'}>
                <User className="h-4 w-4 mr-2" />
                {t('auth.dashboard')}
              </Button>
              <Button variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-50" onClick={() => void siteAuth.logout?.()}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('auth.logout')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="w-full border-mintGreen text-mintGreen hover:bg-mintGreen/5" onClick={openPatientLogin}>
                {t('auth.login')}
              </Button>
              <Button className="w-full bg-mintGreen text-white hover:bg-mintGreen/90 mt-2" onClick={openPatientLogin}>
                {t('auth.signup')}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

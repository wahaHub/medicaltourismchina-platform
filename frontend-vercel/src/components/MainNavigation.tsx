
import { useState } from "react";
import { Menu, X, Heart, Package, Hospital, Shield, MapPin, Search, Home, FileText, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const MainNavigation = () => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path === '/treatment' && currentPath === '/treatment') return true;
    if (path === '/search' && currentPath === '/search') return true;
    if (path === '/packages' && currentPath === '/packages') return true;
    if (path === '/insurance' && currentPath === '/insurance') return true;
    if (path === '/visa' && currentPath === '/visa') return true;
    if (path === '/dashboard' && currentPath === '/dashboard') return true;
    if (path.startsWith('#')) return false;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };
  
  const navItems = [
    { name: t("nav.home"), href: "/", icon: <Home className="h-5 w-5" /> },
    { name: t("nav.telemedicine"), href: "/telemedicine", icon: <Stethoscope className="h-5 w-5" /> },
    { name: t("nav.search"), href: "/search", icon: <Search className="h-5 w-5" /> },
    { name: t("nav.treatment"), href: "/treatment", icon: <Heart className="h-5 w-5" /> },
    { name: t("nav.packages"), href: "/packages", icon: <Package className="h-5 w-5" /> },
    { name: t("nav.hospitals"), href: "/hospitals", icon: <Hospital className="h-5 w-5" /> },
    { name: t("nav.insurance"), href: "/insurance", icon: <Shield className="h-5 w-5" /> },
    { name: t("nav.visa"), href: "/visa", icon: <FileText className="h-5 w-5" /> },
    { name: t("nav.whyChina"), href: "/why-china", icon: <MapPin className="h-5 w-5" /> },
  ];

  return (
    <>
    <nav className="sticky top-[80px] md:top-[92px] z-40 bg-white/75 supports-[backdrop-filter]:bg-white/60 backdrop-blur-md border-b border-gray-200 py-2.5 md:py-3 px-3 md:px-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center w-full">
          <ul className="flex space-x-8">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link 
                  to={item.href}
                  className={cn(
                    "text-gray-700 hover:text-mintGreen transition-colors py-2 px-3 font-medium uppercase text-sm tracking-wider",
                    isActive(item.href) 
                      ? "text-mintGreen border-b-2 border-mintGreen" 
                      : ""
                  )}
                >
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="ml-2">{t('nav.menu')}</span>
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-0 bg-white z-50 pt-16 px-4",
        mobileMenuOpen ? "flex flex-col" : "hidden"
      )}>
        <button 
          className="absolute top-4 right-4 text-gray-700"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">{t('nav.close')}</span>
        </button>
        <ul className="flex flex-col space-y-6">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link 
                to={item.href}
                className={cn(
                  "text-gray-700 flex items-center gap-3 text-lg uppercase font-medium tracking-wider hover:text-mintGreen",
                  isActive(item.href) ? "text-mintGreen font-bold" : ""
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
    {/* Spacer not required because bar is sticky under TopUtilityBar which already reserves space */}
    </>
  );
};

export default MainNavigation;

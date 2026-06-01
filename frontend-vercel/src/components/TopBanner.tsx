import { Mail, ChevronDown, User, LogOut } from "lucide-react";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { resolveUnifiedSiteAuth } from "@/components/site-auth";

export default function TopBanner() {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const {
    patient,
    isAuthenticated: isPatientAuthenticated,
    logout: logoutPatient,
  } = usePatientAuth();
  const navigate = useNavigate();
  const siteAuth = resolveUnifiedSiteAuth({
    legacy: { user, isAuthenticated, logout },
    patient: { patient, isAuthenticated: isPatientAuthenticated, logout: logoutPatient },
  });

  const handleLanguageChange = (language: typeof SUPPORTED_LANGUAGES[0]) => {
    setLanguage(language);
  };

  const handleLogout = async () => {
    try {
      await siteAuth.logout?.();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const openPatientLogin = () => {
    navigate('/patient-login');
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[61] bg-gradient-to-r from-[#1DA78A] to-[#0F638E] text-white py-2 transition-transform duration-300"
    >
      <div className="container md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Left side - Contact Info */}
          <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm ml-4">
            <a
              href="https://wa.me/message/2K6XV4HKQ5DQN1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="hidden sm:inline">US+1 4708613825</span>
            </a>
            <div className="hidden sm:block w-px h-4 bg-white/30"></div>
            <a
              href="mailto:contact@medicaltourismchina.health"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">contact@medicaltourismchina.health</span>
            </a>
          </div>

          {/* Right side - Login/Dashboard & Language Selector */}
          <div className="flex items-center gap-2 sm:gap-3 mr-4">
            {/* Login/Dashboard Button */}
            {!siteAuth.isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 px-2 sm:px-3 text-white hover:text-white/80 hover:bg-white/10 h-7 text-xs"
                onClick={openPatientLogin}
              >
                <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">{t('auth.login')}</span>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5 px-2 sm:px-3 text-white hover:text-white/80 hover:bg-white/10 h-7 text-xs">
                    <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden md:inline">{t('auth.myDashboard')}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {siteAuth.userLabel}
                  </div>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {siteAuth.userEmail}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="w-full flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      {t('auth.dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('auth.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Language Selector */}
            <div className="hidden sm:block w-px h-4 bg-white/30"></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2 text-white hover:text-white/80 hover:bg-white/10 h-7">
                  <span className="text-base leading-none">{currentLanguage.flag}</span>
                  <span className="hidden md:inline text-xs">{currentLanguage.name}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => handleLanguageChange(language)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span>{language.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

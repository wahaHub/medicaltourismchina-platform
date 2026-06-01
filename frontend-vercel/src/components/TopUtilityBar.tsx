
import { Settings, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
// 移除 Dialog imports - 现在使用专门的认证页面
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";
import { resolveUnifiedSiteAuth } from "@/components/site-auth";
import { BRAND_LOGO_COMPACT_URL } from "@/config/brandAssets";
// 移除旧的 AWS Cognito 登录组件

const TopUtilityBar = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const {
    patient,
    isAuthenticated: isPatientAuthenticated,
    logout: logoutPatient,
  } = usePatientAuth();
  const { currentLanguage, setLanguage, t } = useLanguage();
  const siteAuth = resolveUnifiedSiteAuth({
    legacy: { user, isAuthenticated, logout },
    patient: { patient, isAuthenticated: isPatientAuthenticated, logout: logoutPatient },
  });

  const handleLanguageChange = (language: typeof SUPPORTED_LANGUAGES[0]) => {
    setLanguage(language);
    console.log('Language changed to:', language.name);
  };

  const handleLogout = async () => {
    try {
      await siteAuth.logout?.();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-primaryGreen/80 supports-[backdrop-filter]:bg-primaryGreen/70 backdrop-blur-md border-b border-white/10 shadow-sm py-3.5 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={BRAND_LOGO_COMPACT_URL} 
              alt="Medora Health Logo" 
              className="h-16 w-auto mr-3 flex-shrink-0 object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-xl md:text-2xl font-bold text-white">Medora Health</span>
              <span className="text-[11px] md:text-xs text-white/80 mt-0">Global routes to exceptional care.</span>
            </div>
          </div>
          <div className="text-white">{t('common.loading')}</div>
        </div>
      </div>
      {/* Spacer to offset fixed bar height */}
      <div aria-hidden className="h-[92px]"></div>
      </>
    );
  }

  return (
    <>
    <div className="fixed top-0 left-0 right-0 z-50 bg-primaryGreen/80 supports-[backdrop-filter]:bg-primaryGreen/70 backdrop-blur-md border-b border-white/10 shadow-sm py-2.5 md:py-3.5 px-3 md:px-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center">
          <img src={BRAND_LOGO_COMPACT_URL} alt="Medora Health Logo" className="h-10 md:h-16 w-auto mr-2 md:mr-3 flex-shrink-0 object-contain" />
          <div className="flex flex-col leading-tight">
            <span className="text-lg md:text-2xl font-bold text-white">Medora Health</span>
            <span className="hidden sm:block text-[11px] md:text-xs text-white/80 mt-0">Global routes to exceptional care.</span>
          </div>
        </div>
        
        {/* Right Side Controls */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <div className="flex items-center space-x-3 md:space-x-4 text-white">
            
            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 px-2 text-white hover:text-white/80">
                  <span className="text-lg leading-none">{currentLanguage.flag}</span>
                  <span className="hidden sm:inline">{currentLanguage.name}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => handleLanguageChange(language)}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <span>{language.flag}</span>
                    <span>{language.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Authentication Section */}
          {!siteAuth.isAuthenticated ? (
            <Link to="/patient-login">
              <button className="bg-white text-primaryGreen px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2 font-medium">
                {t('auth.login')}
              </button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-white hover:text-white/80 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {t('auth.myDashboard')}
                  <ChevronDown className="h-3 w-3" />
                </button>
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
                  <Link to="/dashboard" className="w-full flex items-center gap-2">
                    <Settings className="h-4 w-4" />
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
        </div>
      </div>
    </div>
    {/* Spacer to offset fixed bar height */}
    <div aria-hidden className="h-[80px] md:h-[92px]"></div>
    </>
  );
};

export default TopUtilityBar;

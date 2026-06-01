import { useLanguage } from "@/contexts/LanguageContext";
import { LOW_MEDIA_BASE_URL } from "@/config/media";

interface PackagesHeroEnhancedProps {
  totalSteps: number;
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function PackagesHeroEnhanced({
  totalSteps,
  currentStep,
  onStepClick,
}: PackagesHeroEnhancedProps) {
  const { t } = useLanguage();
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <section className="relative mt-[112px] sm:mt-[120px] lg:min-h-[400px] xl:min-h-[500px] flex flex-col justify-center">
      {/* Background Image - Mobile/Tablet: Fixed Height, Desktop: Full Section */}
      <div className="absolute inset-0 lg:inset-0">
        <img
          src={`${LOW_MEDIA_BASE_URL}/packages/hero_banner_x2.png`}
          alt="Packages Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/30" />
      </div>

      {/* Mobile/Tablet: Fixed Height Container with top padding for better image visibility */}
      <div className="lg:hidden relative h-[280px] sm:h-[350px] md:h-[420px] flex flex-col justify-center pt-8 sm:pt-12 md:pt-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="max-w-2xl">
            <h1 
              className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3"
              style={{ color: '#003B5C' }}
            >
              {t('packages.hero.title')}
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 line-clamp-3" style={{ color: '#003B5C' }}>
              {t('packages.hero.subtitle')}
            </p>
            
            {/* Mobile Step Indicators - Compact Design */}
            <div className="flex justify-center items-center gap-2 sm:gap-3">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center">
                  <button
                    onClick={() => onStepClick(step)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold transition-all duration-300 ${
                      step === currentStep
                        ? "bg-gradient-to-r from-[#1DA78A] to-[#0F638E] text-white scale-110 shadow-lg"
                        : "bg-white/90 text-gray-600 hover:bg-white hover:scale-105"
                    }`}
                  >
                    {step}
                  </button>
                  {index < steps.length - 1 && (
                    <div className="w-2 sm:w-3 h-0.5 bg-white/60 mx-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop: Original Layout with Padding + Step Indicators */}
      <div className="hidden lg:block container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="max-w-2xl mb-10 sm:mb-12 md:mb-16">
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-2 md:mb-2"
            style={{ color: '#003B5C' }}
          >
            {t('packages.hero.title')}
          </h1>
          <p className="text-sm sm:text-base md:text-base leading-relaxed" style={{ color: '#003B5C' }}>
            {t('packages.hero.subtitle')}
          </p>
        </div>

        {/* Progress Steps - Desktop only, Interactive */}
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center" style={{ flex: index < steps.length - 1 ? '1' : 'none' }}>
                <button
                  onClick={() => onStepClick(step)}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg relative z-20 cursor-pointer transition-all duration-300 ${
                    step === currentStep
                      ? "bg-gradient-to-r from-[#1DA78A] to-[#0F638E] scale-110"
                      : "bg-white/80 hover:bg-white hover:scale-105"
                  }`}
                  style={step !== currentStep ? { color: '#9CA3AF' } : {}}
                >
                  {step}
                </button>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-6 -mx-1.5 bg-white/60 relative z-0 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E] transition-all duration-500"
                      style={{ 
                        width: step < currentStep ? "100%" : step === currentStep ? "50%" : "0%"
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

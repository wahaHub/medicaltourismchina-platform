

// Next Image removed;
import { useLanguage } from "@/contexts/LanguageContext";

export default function InsuranceProviders() {
  const { t } = useLanguage();
  
  return (
    <section className="relative">
      {/* White Background Container - 80% width, centered, overlaps hero by 60px */}
      <div className="w-[90%] lg:w-[80%] mx-auto rounded-t-3xl relative z-10 -mt-[9%] sm:-mt-[12%] md:-mt-[14%] lg:-mt-[8%]">
        <div className="px-0 sm:px-0 md:px-8 lg:px-12 pt-12 sm:pt-16 pb-8 sm:pb-12">
          <div className="grid grid-cols-2 gap-4 sm:gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* CAP Card */}
            <div className="bg-white shadow-xl rounded-2xl hover:shadow-xl transition-shadow relative p-4 sm:p-8">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center p-4 bg-gradient-to-br from-white to-white/40">
                  <img
                    src="/insurance/vector_1.png"
                    alt="CAP Icon"
                    
                    
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h3 className="text-sm sm:text-xl md:text-2xl font-bold text-center mb-4 break-words">
                <span className="bg-gradient-to-r from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent">
                  {t('insurance.providers.cap')}
                </span>
              </h3>
            </div>

            {/* GPS Card */}
            <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-8 hover:shadow-xl transition-shadow relative">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center p-4 bg-gradient-to-br from-white to-white/40">
                  <img
                    src="/insurance/vector_2.png"
                    alt="GPS Icon"
                    
                    
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h3 className="text-sm sm:text-xl md:text-2xl font-bold text-center mb-4 break-words">
                <span className="bg-gradient-to-r from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent">
                  {t('insurance.providers.gps')}
                </span>
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

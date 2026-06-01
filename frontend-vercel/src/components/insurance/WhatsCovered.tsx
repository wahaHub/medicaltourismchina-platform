

// Next Image removed;
import { useLanguage } from "@/contexts/LanguageContext";

export default function WhatsCovered() {
  const { t } = useLanguage();
  
  const coverageItems = [
    {
      icon: "/insurance/heart_icon.png",
      titleKey: "insurance.coverage.medicalComplications.title",
      itemKeys: [
        "insurance.coverage.medicalComplications.item1",
        "insurance.coverage.medicalComplications.item2",
        "insurance.coverage.medicalComplications.item3"
      ]
    },
    {
      icon: "/insurance/flight_icon.png",
      titleKey: "insurance.coverage.evacuation.title",
      itemKeys: [
        "insurance.coverage.evacuation.item1",
        "insurance.coverage.evacuation.item2",
        "insurance.coverage.evacuation.item3"
      ]
    },
    {
      icon: "/insurance/medical_icon.png",
      titleKey: "insurance.coverage.treatmentComplications.title",
      itemKeys: [
        "insurance.coverage.treatmentComplications.item1",
        "insurance.coverage.treatmentComplications.item2",
        "insurance.coverage.treatmentComplications.item3"
      ]
    },
    {
      icon: "/insurance/baggage_icon.png",
      titleKey: "insurance.coverage.baggage.title",
      itemKeys: [
        "insurance.coverage.baggage.item1",
        "insurance.coverage.baggage.item2",
        "insurance.coverage.baggage.item3"
      ]
    },
    {
      icon: "/insurance/phone_icon.png",
      titleKey: "insurance.coverage.assistance.title",
      itemKeys: [
        "insurance.coverage.assistance.item1",
        "insurance.coverage.assistance.item2",
        "insurance.coverage.assistance.item3"
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#1DA78A] to-[#0F638E] relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-20">
        <img
          src="/insurance/covered.png"
          alt="Coverage Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">
              {t('insurance.coverage.title')}
            </span>
          </h2>
          <p className="text-white text-base max-w-3xl mx-auto">
            {t('insurance.coverage.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {coverageItems.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1"
              style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.64) 100%)'
              }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12">
                  <img
                    src={item.icon}
                    alt={t(item.titleKey)}
                    
                    
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold leading-tight pt-2">
                  <span className="bg-gradient-to-r from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent">
                    {t(item.titleKey)}
                  </span>
                </h3>
              </div>
              <ul className="space-y-2 pl-0">
                {item.itemKeys.map((detailKey, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-600 text-sm">
                    <div className="w-4 h-4 shrink-0 mt-0.5">
                      <img
                        src="/insurance/right_icon.png"
                        alt="Check"
                        
                        
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="leading-relaxed">{t(detailKey)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

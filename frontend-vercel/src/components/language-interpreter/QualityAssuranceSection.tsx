import { useLanguage } from "@/contexts/LanguageContext";

export default function QualityAssuranceSection() {
  const { t } = useLanguage();
  
  const features = [
    {
      titleKey: 'languageInterpreter.quality.feature1.title',
      descriptionKeys: [
        'languageInterpreter.quality.feature1.item1',
        'languageInterpreter.quality.feature1.item2',
      ],
    },
    {
      titleKey: 'languageInterpreter.quality.feature2.title',
      descriptionKeys: [
        'languageInterpreter.quality.feature2.item1',
      ],
    },
    {
      titleKey: 'languageInterpreter.quality.feature3.title',
      descriptionKeys: [
        'languageInterpreter.quality.feature3.item1'
      ],
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#F0F4F3]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12 sm:mb-14 md:mb-16">
          <h2
            className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold"
            style={{
              background: 'linear-gradient(90deg, #1DA78A 8.61%, #0F638E 95.7%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('languageInterpreter.quality.mainTitle')}
          </h2>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 sm:p-9 md:p-10 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                {/* Icon Circle */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-[#C8E6E0] flex items-center justify-center mb-6 sm:mb-7 md:mb-8">
                  {/* <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-[#A8D5CC]"></div> */}
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-5">
                  {t(feature.titleKey)}
                </h3>

                {/* Description */}
                <div className="text-[12px] text-gray-600 leading-relaxed text-left space-y-3">
                  {feature.descriptionKeys.map((key, idx) => (
                    <li key={idx} className="p-0 m-0">
                      {t(key)}
                    </li>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

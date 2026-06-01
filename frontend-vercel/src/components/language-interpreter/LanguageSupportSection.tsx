import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSupportSection() {
  const { t } = useLanguage();
  
  const items = [
    {
      titleKey: 'languageInterpreter.support.item1.title',
      descriptionKey: 'languageInterpreter.support.item1.description',
      image: '/language-interpreter/medical-interpretation.png',
      imageAltKey: 'languageInterpreter.support.item1.imageAlt',
    },
    {
      titleKey: 'languageInterpreter.support.item2.title',
      descriptionKey: 'languageInterpreter.support.item2.description',
      image: '/language-interpreter/multilingual-support.png',
      imageAltKey: 'languageInterpreter.support.item2.imageAlt',
    },
    {
      titleKey: 'languageInterpreter.support.item3.title',
      descriptionKey: 'languageInterpreter.support.item3.description',
      image: '/language-interpreter/emergency-interpretation.png',
      imageAltKey: 'languageInterpreter.support.item3.imageAlt',
    },
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2
            className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-bold"
            style={{
              background: 'linear-gradient(90deg, #1DA78A 8.61%, #0F638E 95.7%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('languageInterpreter.support.mainTitle')}
          </h2>
        </div>

        <div className="space-y-3 sm:space-y-3 md:space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl bg-[#e4e4e4ff] overflow-hidden shadow-sm"
            >
              <div className="grid md:grid-cols-2 gap-0 items-center">
                {/* Text Content */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#14B8A6] mb-2">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-xs sm:text-xs md:text-sm text-gray-600 leading-relaxed">
                    {t(item.descriptionKey)}
                  </p>
                </div>

                {/* Image */}
                <div className="relative h-[200px] sm:h-[200px] md:h-[280px] md:min-h-[240px]">
                  <img
                    src={item.image}
                    alt={t(item.imageAltKey)}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(270deg, rgba(244, 245, 246, 0) 52.79%, #e4e4e4ff 100%)',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

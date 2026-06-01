
import PlaceholderIcon from "@/components/ui/placeholder-icon";
import { useLanguage } from "@/contexts/LanguageContext";

const HowWeHelp = () => {
  const { t } = useLanguage();
  
  const services = [
    {
      image: "/icons_home_page/Visa-Free Access@2x.png",
      title: t('homepage.howWeHelp.visaTitle'),
      description: t('homepage.howWeHelp.visaDesc')
    },
    {
      image: "/icons_home_page/Luxury Accommodations@2x.png",
      title: t('homepage.howWeHelp.accommodationTitle'),
      description: t('homepage.howWeHelp.accommodationDesc')
    },
    {
      image: "/icons_home_page/Translation Services@2x.png",
      title: t('homepage.howWeHelp.translationTitle'),
      description: t('homepage.howWeHelp.translationDesc')
    },
    {
      image: "/icons_home_page/Medical Escort@2x.png",
      title: t('homepage.howWeHelp.escortTitle'),
      description: t('homepage.howWeHelp.escortDesc')
    },
    {
      image: "/icons_home_page/Private Transportation@2x.png",
      title: t('homepage.howWeHelp.transportTitle'),
      description: t('homepage.howWeHelp.transportDesc')
    },
    {
      image: "/icons_home_page/Concierge Service@2x.png",
      title: t('homepage.howWeHelp.conciergeTitle'),
      description: t('homepage.howWeHelp.conciergeDesc')
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            {t('homepage.howWeHelp.title')}
            <span className="text-primaryGreen text-2xl">+</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer hover:-translate-y-1 hover:scale-[1.02] group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 mb-6 transform transition-transform duration-300 group-hover:scale-110">
                  <img 
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <div className="w-12 h-1 bg-primaryGreen mb-4"></div>
                <p className="text-gray-600 text-base leading-relaxed">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeHelp;

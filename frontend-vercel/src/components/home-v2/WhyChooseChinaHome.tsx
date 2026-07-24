import { useLanguage } from "@/contexts/LanguageContext";

export default function WhyChooseChinaHome() {
  const { t } = useLanguage();

  const reasons = [
    {
      titleKey: "homepage.whyChoose.reason1.title",
      descriptionKey: "homepage.whyChoose.reason1.description",
    },
    {
      titleKey: "homepage.whyChoose.reason2.title",
      descriptionKey: "homepage.whyChoose.reason2.description",
    },
    {
      titleKey: "homepage.whyChoose.reason3.title",
      descriptionKey: "homepage.whyChoose.reason3.description",
    },
    {
      titleKey: "homepage.whyChoose.reason4.title",
      descriptionKey: "homepage.whyChoose.reason4.description",
    },
  ];

  return (
    <section className="py-8 sm:py-10 md:py-20 text-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-6 sm:mb-8 md:mb-16">
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4"
            style={{ background: 'linear-gradient(90deg, #1DA78A 8.61%, #0F638E 95.7%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            {t('homepage.whyChoose.title')}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Side - Reasons */}
          <div className="space-y-4 md:space-y-8">
            {reasons.map((reason, index) => (
              <div key={index} className="backdrop-blur-sm p-4 md:p-6 rounded-lg">
                <h3 
                  className="text-base md:text-lg lg:text-xl font-bold mb-2 md:mb-3"
                  style={{ background: 'linear-gradient(90deg, #1DA78A 8.61%, #0F638E 95.7%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  {t(reason.titleKey as any)}
                </h3>
                <p className="text-sm md:text-base text-black/90">{t(reason.descriptionKey as any)}</p>
              </div>
            ))}
          </div>

          {/* Right Side - Map Image */}
          <div className="relative backdrop-blur-sm rounded-lg p-2 md:p-4 h-[450px] md:h-[700px] flex items-center justify-center">
            <div className="relative w-full h-full">
              <img
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Group-486-1763283248559.png?width=8000&height=8000&resize=contain"
            alt={t('homepage.whyChoose.mapAlt')}
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

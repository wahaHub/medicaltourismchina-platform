

// Next Image removed;
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { LOW_MEDIA_BASE_URL } from "@/config/media";

const packageImage = (name: string) => `${LOW_MEDIA_BASE_URL}/packages/${name}_x2.png`;

const facilities = [
  {
    id: 1,
    title: "Hotel environment",
    images: [packageImage("environmental_facilities_1")],
    span: "large", // Takes full left column
  },
  {
    id: 2,
    title: "",
    images: [
      packageImage("environmental_facilities_2"),
      packageImage("environmental_facilities_3"),
    ],
    span: "small-grid", // Two small images stacked
  },
  {
    id: 3,
    title: "",
    images: [
      packageImage("environmental_facilities_4"),
      packageImage("environmental_facilities_5"),
    ],
    span: "small-grid", // Two small images stacked
  },
  {
    id: 4,
    title: "Hospital environment",
    images: [packageImage("environmental_facilities_6")],
    span: "large", // Takes full right column
  },
  {
    id: 5,
    title: "Reception translation supports multiple languages",
    images: [packageImage("environmental_facilities_7")],
    span: "large", // Takes full left column
  },
  {
    id: 6,
    title: "",
    images: [
      packageImage("environmental_facilities_8"),
      packageImage("environmental_facilities_9"),
    ],
    span: "small-grid", // Two small images stacked
  },
];

export default function EnvironmentalFacilities() {
  const { t } = useLanguage();
  
  return (
    <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Title */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold"
            style={{ color: '#1E293B' }}
          >
            {t('packages.facilities.title')}
          </h2>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Row 1: Hotel environment (large) + 2 small images */}
          <div className="relative h-[280px] sm:h-[320px] md:h-[380px] lg:h-[416px] rounded-2xl overflow-hidden group">
            <img
              src={facilities[0].images[0]}
              alt="Hotel environment"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-center">
              <h3 className="text-white text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">
                {t('packages.facilities.hotel')}
              </h3>
              <Button className="bg-gradient-to-r opacity-80 cursor-pointer from-[#1DA78A] to-[#0F638E] hover:opacity-90 text-white rounded-full px-6 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-opacity">
                {t('packages.facilities.moreDetail')}
              </Button>
            </div>
          </div>

          <div className="grid grid-rows-2 gap-3 sm:gap-4 md:gap-6">
            <div className="relative h-[135px] sm:h-[155px] md:h-[180px] lg:h-[194px] rounded-2xl overflow-hidden">
              <img
                src={facilities[1].images[0]}
                alt="Facility"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative h-[135px] sm:h-[155px] md:h-[180px] lg:h-[194px] rounded-2xl overflow-hidden">
              <img
                src={facilities[1].images[1]}
                alt="Facility"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Row 2: 2 small images + Hospital environment (large) */}
          <div className="grid grid-rows-2 gap-3 sm:gap-4 md:gap-6">
            <div className="relative h-[135px] sm:h-[155px] md:h-[180px] lg:h-[194px] rounded-2xl overflow-hidden">
              <img
                src={facilities[2].images[0]}
                alt="Facility"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative h-[135px] sm:h-[155px] md:h-[180px] lg:h-[194px] rounded-2xl overflow-hidden">
              <img
                src={facilities[2].images[1]}
                alt="Facility"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="relative h-[280px] sm:h-[320px] md:h-[380px] lg:h-[416px] rounded-2xl overflow-hidden group">
            <img
              src={facilities[3].images[0]}
              alt="Hospital environment"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-center">
              <h3 className="text-white text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">
                {t('packages.facilities.hospital')}
              </h3>
              <Button className="bg-gradient-to-r from-[#1DA78A] to-[#0F638E] hover:opacity-90 text-white rounded-full px-6 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-opacity opacity-80 cursor-pointer">
                {t('packages.facilities.moreDetail')}
              </Button>
            </div>
          </div>

          {/* Row 3: Reception translation (large) + 2 small images */}
          <div className="relative h-[280px] sm:h-[320px] md:h-[380px] lg:h-[416px] rounded-2xl overflow-hidden group">
            <img
              src={facilities[4].images[0]}
              alt="Reception translation"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-center">
              <h3 className="text-white text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">
                {t('packages.facilities.translation')}
              </h3>
              <Button className="bg-gradient-to-r from-[#1DA78A] to-[#0F638E] hover:opacity-90 text-white rounded-full px-6 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-opacity opacity-80 cursor-pointer">
                {t('packages.facilities.moreDetail')}
              </Button>
            </div>
          </div>

          <div className="grid grid-rows-2 gap-3 sm:gap-4 md:gap-6">
            <div className="relative h-[135px] sm:h-[155px] md:h-[180px] lg:h-[194px] rounded-2xl overflow-hidden">
              <img
                src={facilities[5].images[0]}
                alt="Facility"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative h-[135px] sm:h-[155px] md:h-[180px] lg:h-[194px] rounded-2xl overflow-hidden">
              <img
                src={facilities[5].images[1]}
                alt="Facility"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

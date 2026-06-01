

// Next Image removed;
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LOW_MEDIA_BASE_URL } from "@/config/media";

export default function RenownedHospitalsSection() {
  const { t } = useLanguage();

  const hospitals = [
    {
      nameKey: "doctorAppointment.hospitals.hospital1.name",
      descriptionKey: "doctorAppointment.hospitals.hospital1.description",
      image: "/figma-assets/beijing-union-medical-college-hospital.png",
      featured: true,
    },
    {
      nameKey: "doctorAppointment.hospitals.hospital2.name",
      descriptionKey: "doctorAppointment.hospitals.hospital2.description",
      image: "/figma-assets/beijing-union-medical-college-hospital.png",
      featured: false,
    },
    {
      nameKey: "doctorAppointment.hospitals.hospital3.name",
      descriptionKey: "doctorAppointment.hospitals.hospital3.description",
      image: "/figma-assets/beijing-union-medical-college-hospital.png",
      featured: false,
    },
  ];
  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Background Layer - Wave Pattern */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-[#F5F7F6]"></div>
        <img
          src={`${LOW_MEDIA_BASE_URL}/hospitals/hospital_bg_x2.png`}
          alt="Wave Pattern Background"
          className="w-full h-full object-cover opacity-90"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative" style={{ zIndex: 1 }}>
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4"
            style={{ 
              background: 'linear-gradient(90deg, #1DA78A 8.61%, #0F638E 95.7%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              backgroundClip: 'text' 
            }}
          >
            {t('doctorAppointment.hospitals.title')}
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {t('doctorAppointment.hospitals.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {hospitals.map((hospital, index) => (
            <Card 
              key={index} 
              className="overflow-hidden border-0 shadow-none cursor-pointer hover:shadow-lg group bg-[#F0F4F3] hover:bg-white flex flex-col p-0" 
              style={{ zIndex: 2 }}
            >
              <div className="relative h-40 sm:h-48 md:h-64">
                <img
                  src={hospital.image}
                  alt={hospital.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-1">
                <h3 
                  className="text-sm sm:text-base md:text-lg font-bold mb-3 md:mb-4"
                  style={{ 
                    background: 'linear-gradient(90deg, #1DA78A 8.61%, #0F638E 95.7%)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent', 
                    backgroundClip: 'text' 
                  }}
                >
                  {t(hospital.nameKey as any)}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5 flex-1 leading-relaxed">
                  {t(hospital.descriptionKey as any)}
                </p>
                <div className="flex justify-start mt-auto">
                  <button
                    className={`w-full sm:w-[70%] md:w-[60%] py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-6 rounded-full font-semibold text-[10px] sm:text-xs md:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 ${
                      hospital.featured
                        ? "bg-gradient-to-r from-[#1DA78A] to-[#0F638E] text-white hover:shadow-lg hover:from-[#188F76] hover:to-[#0C5278]"
                        : "border-2 border-[#0F638E] text-[#0F638E] bg-white hover:bg-gray-50"
                    }`}
                  >
                    {t('common.viewMore')}
                    <img 
                      src={hospital.featured ? "/right_arrow_icon.png" : "/black_right_arrow_icon.png"}
                      alt="Arrow" 
                      width={20} 
                      height={10} 
                      className="w-4 sm:w-5 h-2 sm:h-2.5 group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

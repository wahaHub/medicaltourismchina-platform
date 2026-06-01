

// Next Image removed;
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RenownedDoctorsSection() {
  const { t } = useLanguage();

  const doctors = [
    {
      nameKey: "doctorAppointment.doctors.doctor1.name",
      titleKey: "doctorAppointment.doctors.doctor1.title",
      roleKey: "doctorAppointment.doctors.doctor1.role",
      achievementsKeys: [
        "doctorAppointment.doctors.doctor1.achievement1",
        "doctorAppointment.doctors.doctor1.achievement2",
        "doctorAppointment.doctors.doctor1.achievement3"
      ],
      image: "/hospital-admissions/placeholder_doctor.png",
    },
    {
      nameKey: "doctorAppointment.doctors.doctor2.name",
      titleKey: "doctorAppointment.doctors.doctor2.title",
      roleKey: "doctorAppointment.doctors.doctor2.role",
      achievementsKeys: [
        "doctorAppointment.doctors.doctor2.achievement1",
        "doctorAppointment.doctors.doctor2.achievement2",
        "doctorAppointment.doctors.doctor2.achievement3"
      ],
      image: "/hospital-admissions/placeholder_doctor.png",
    },
    {
      nameKey: "doctorAppointment.doctors.doctor3.name",
      titleKey: "doctorAppointment.doctors.doctor3.title",
      roleKey: "doctorAppointment.doctors.doctor3.role",
      achievementsKeys: [
        "doctorAppointment.doctors.doctor3.achievement1",
        "doctorAppointment.doctors.doctor3.achievement2",
        "doctorAppointment.doctors.doctor3.achievement3"
      ],
      image: "/hospital-admissions/placeholder_doctor.png",
    },
  ];
  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
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
            {t('doctorAppointment.doctors.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          {doctors.map((doctor, index) => (
            <div key={index} className="relative">
              {/* Doctor Image with Background - 502px height, positioned absolutely to overlap card */}
              <div className="relative h-[380px] sm:h-[450px] md:h-[502px] mb-[-114.5px] sm:mb-[-114.5px] md:mb-[-114.5px] z-10 flex items-end justify-center">
                <div className="relative w-[300px] sm:w-[300px] md:w-[379px] h-full">
                  {/* Background organic shape */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src="/hospital-admissions/background_img.png"
                      alt="Background"
                      className="w-full h-full object-cover object-bottom"
                    />
                  </div>
                  {/* Doctor image on top */}
                  <div className="absolute inset-0 z-10">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-contain object-bottom"
                    />
                  </div>
                </div>
              </div>

              {/* Card with gradient background */}
              <Card 
                className="relative overflow-visible border-0 shadow-none hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col rounded-[20px] pt-[114.5px]"
              >
                {/* Gradient Background with Cross Pattern - 387.5px height */}
                <div className="absolute top-0 left-0 right-0 h-[300px] sm:h-[350px] md:h-[387.5px] overflow-hidden rounded-t-[20px] -z-10">
                  {/* Gradient Background - 55.14deg angle */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(55.14deg, #1DA78A 25.44%, #0F638E 90.88%)',
                    }}
                  />
                  
                  {/* Cross Pattern Overlay - Corner positioned */}
                  <div 
                    className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-15"
                    style={{
                      backgroundImage: `
                        repeating-linear-gradient(0deg, transparent, transparent 12px, white 12px, white 14px),
                        repeating-linear-gradient(90deg, transparent, transparent 12px, white 12px, white 14px)
                      `,
                    }}
                  />
                </div>

                {/* Doctor Info */}
                <div className="p-5 sm:p-6 flex flex-col flex-1 bg-white rounded-b-[20px] relative z-20">
                  <h3 
                    className="text-lg sm:text-xl md:text-2xl font-bold mb-1"
                    style={{ 
                      background: 'linear-gradient(90deg, #1DA78A 8.61%, #0F638E 95.7%)', 
                      WebkitBackgroundClip: 'text', 
                      WebkitTextFillColor: 'transparent', 
                      backgroundClip: 'text' 
                    }}
                  >
                    {t(doctor.nameKey as any)}
                  </h3>
                  <p 
                    className="text-sm sm:text-base font-semibold mb-3"
                    style={{ 
                      background: 'linear-gradient(90deg, #1DA78A 8.61%, #0F638E 95.7%)', 
                      WebkitBackgroundClip: 'text', 
                      WebkitTextFillColor: 'transparent', 
                      backgroundClip: 'text' 
                    }}
                  >
                    {t(doctor.titleKey as any)}
                  </p>
                  <p className="text-xs sm:text-sm italic text-[#003B59] mb-4 leading-relaxed">
                    {t(doctor.roleKey as any)}
                  </p>
                  
                  {/* Achievements */}
                  <div className="mt-auto">
                    <ul className="space-y-2">
                      {doctor.achievementsKeys.map((achievementKey, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start leading-relaxed">
                          <span className="mr-2 text-[#1DA78A] font-bold mt-0.5">•</span>
                          <span className="flex-1">{t(achievementKey as any)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



// Next Image removed;
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";

const specialtyCenters = [
  {
    id: 1,
    icon: "/hospital-detail/speciality_center_1.png",
    title: "消化内科中心",
    description:
      "GASTROENTEROLOGY CENTER\n消化内科中心作为医院的重点学科之一，拥有先进的诊疗设备和经验丰富的专家团队。专注于消化系统疾病的诊断、治疗和预防，包括胃肠道、肝脏、胰腺等器官的疾病。",
  },
  {
    id: 2,
    icon: "/hospital-detail/speciality_center_2.png",
    title: "消化内分泌科中心",
    description:
      "ENDOCRINOLOGY CENTER\n消化内分泌科中心专注于内分泌系统疾病的诊疗，包括糖尿病、甲状腺疾病、肾上腺疾病等。拥有先进的检测设备，采用多学科协作，为患者提供全方位的医疗服务和健康管理方案。",
  },
  {
    id: 3,
    icon: "/hospital-detail/speciality_center_3.png",
    title: "呼吸与危重症医学中心（含介入呼吸与睡眠医学）",
    description:
      "RESPIRATORY AND CRITICAL CARE CENTER\n呼吸与危重症医学中心集呼吸、重症、睡眠医学为一体的综合性科室。配备先进的呼吸机、ECMO等设备，提供呼吸系统疾病诊疗、危重症救治、介入呼吸治疗及睡眠障碍诊疗等全方位医疗服务。",
  },
  {
    id: 4,
    icon: "/hospital-detail/speciality_center_4.png",
    title: "胸部肿瘤与肺外科微创中心",
    description:
      "THORACIC SURGERY CENTER\n胸部肿瘤与肺外科微创中心（VATS）专注于胸部肿瘤及肺部疾病的微创治疗。采用胸腔镜等先进技术，为患者提供创伤小、恢复快的手术治疗方案。专家团队在肺癌、食管癌等胸部肿瘤治疗方面具有丰富经验。",
  },
  {
    id: 5,
    icon: "/hospital-detail/speciality_center_5.png",
    title: "中毒与急危重症医学中心",
    description:
      "EMERGENCY AND TOXICOLOGY CENTER\n中毒与急危重症医学中心是集急诊急救、中毒救治、危重症监护于一体的综合性科室。配备先进的抢救设备和专业的医疗团队，24小时为患者提供快速、专业的急救服务和中毒解毒治疗。",
  },
];

export default function SpecialtyCenters() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.offsetWidth / 4; // Approximate card width
      const scrollAmount = direction === "left" ? -cardWidth * 2 : cardWidth * 2;
      
      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });

      // Update current index
      if (direction === "left") {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      } else {
        setCurrentIndex(
          Math.min(specialtyCenters.length - itemsPerView.desktop, currentIndex + 1)
        );
      }
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-[#F2F6F9]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12 sm:mb-16">
          Speciality Centers
        </h2>

        {/* Slider Container */}
        <div className="relative">
          {/* Cards Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {specialtyCenters.map((center) => (
              <div
                key={center.id}
                className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300"
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#DEF2E7] flex items-center justify-center p-6 sm:p-8">
                    <div className="relative w-full h-full">
                      <img
                        src={center.icon}
                        alt={center.title}
                        className="w-full h-full object-cover"
                        className="object-contain"
                        
                      />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-gray-900 text-center mb-4 min-h-[3rem] leading-tight">
                  {center.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed whitespace-pre-line">
                  {center.description}
                </p>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={() => scroll("left")}
              disabled={currentIndex === 0}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-[#14B8A6] rounded-full flex items-center justify-center shadow-lg hover:bg-[#0F9488] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={currentIndex >= specialtyCenters.length - itemsPerView.desktop}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-[#14B8A6] rounded-full flex items-center justify-center shadow-lg hover:bg-[#0F9488] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

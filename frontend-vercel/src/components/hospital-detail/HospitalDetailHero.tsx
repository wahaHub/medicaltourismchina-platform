

// Next Image removed;
import { MapPin } from "lucide-react";

export default function HospitalDetailHero() {
  return (
    <div className="relative overflow-hidden mt-[112px] sm:mt-[120px]">
      {/* Background Image */}
      <div className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px]">
        <img
          src="/hospital-detail/hero_banner.png"
          alt="Shenzhen People's Hospital"
          className="w-full h-full object-cover"
          className="object-cover"
          
          
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="absolute inset-0 flex items-end pb-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
            <div className="max-w-4xl">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-3">
                <span className="bg-[#09B6D9] text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                  PUBLIC HOSPITAL
                </span>
                <span className="bg-[#FF0000] text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                  CLASS A TERTIARY
                </span>
              </div>

              {/* Hospital Name */}
              <h1 className="text-xl sm:text-xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 leading-tight">
                SHENZHEN PEOPLE'S HOSPITAL
              </h1>

              {/* Location */}
              <div className="inline-flex items-center gap-2 text-white bg-black/42 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">SHENZHEN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

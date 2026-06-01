

// Next Image removed;
import { ChevronLeft, ChevronRight, ChevronRight as ArrowRight } from "lucide-react";
import { useState } from "react";

export default function HospitalIntroduction() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const images = [
    "/hospital-detail/hospital_introduction.png",
    "/hospital-detail/facility_1.png",
    "/hospital-detail/facility_2.png",
  ];

  const stats = [
    {
      value: "3040",
      label: "BED_COUNT",
    },
    {
      value: "379.2W",
      label: "NUMBER OF EMERGENCY VISITS",
    },
    {
      value: "12w",
      label: "SURGICAL VOLUME",
    },
    {
      value: "14.8w",
      label: "DISCHARGE PATIENTS",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="relative pt-2 pb-12 sm:pb-12 md:pb-12 lg:pb-12  overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 backdrop-opacity-100">
        <img
          src="/figma-assets/about-bg.png"
          alt="Background"
          className="w-full h-full object-cover"
          className="object-cover"
          
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl relative z-10">
        {/* Hospital Stats */}
        <div className="mb-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 py-8 sm:py-12 md:py-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center relative">
                {/* Left Divider Line - Show on first item */}
                {index === 0 && (
                  <div className="hidden lg:block absolute left-10 top-1/2 -translate-y-1/2 w-[6px] h-[58px] bg-[#86C7B8] rounded-full" />
                )}

                {/* Right Divider Line - Hidden on last item in row */}
                {index < stats.length - 1 && (
                  <div className="hidden lg:block absolute -right-10 top-1/2 -translate-y-1/2 w-[6px] h-[58px] bg-[#86C7B8] rounded-full" />
                )}

                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#003B59] mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-[#374151] font-medium uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hospital Introduction Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Side - Image Slider */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden">
              <img
                src={images[currentSlide]}
                alt={`Hospital view ${currentSlide + 1}`}
                className="w-full h-full object-cover"
                className="object-cover"
                
                
              />
            </div>

            {/* Navigation Arrows */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <button
                onClick={prevSlide}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                    ? "bg-white w-6"
                    : "bg-white/50"
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Side - Content */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#003B59] mb-6">
              Hospital Introduction
            </h2>

            {/* Info Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button className="flex items-center gap-1 bg-[#003B59] pl-3 pr-4 py-2 rounded-md hover:bg-[#004a6f] transition-colors cursor-pointer">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center p-1.5">
                  <div className="relative w-full h-full">
                    <img
                      src="/hospital-detail/browser_icon.png"
                      alt="Website"
                      className="w-full h-full object-cover"
                      className="object-contain"
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-white">WEBSITE</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
              <button className="flex items-center gap-1 bg-[#003B59] pl-3 pr-4 py-2 rounded-md hover:bg-[#004a6f] transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-1.5">
                  <div className="relative w-full h-full">
                    <img
                      src="/hospital-detail/wikipedia_icon.png"
                      alt="Wikipedia"
                      className="w-full h-full object-cover"
                      className="object-contain"
                      
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-white">WIKIPEDIA</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-4 text-[#374151] leading-relaxed">
              <p className="text-sm sm:text-base">
                Shenzhen People's Hospital was founded in 1946 and is the city's oldest, largest, and most comprehensive hospital in terms of medical treatment capabilities. In June 2018, it was selected as one of the first batch of Guangdong Province's high-level hospital peak construction units. At present, a development pattern of "one hospital, five districts, and six sites" has been formed, including the hospital headquarters (medical department), Longhua branch, Bantian campus, Dongmen outpatient clinic, Dapeng Translational Medicine Innovation Center, and Bao'an Hospital (planned to be newly built). The hospital is the First Affiliated Hospital of Southern University of Science and Technology and the Second Affiliated Hospital of Jinan University School of Medicine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

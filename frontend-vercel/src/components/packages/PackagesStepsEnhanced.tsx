import { ChevronLeft, ChevronRight } from "lucide-react";

interface Step {
  id: number;
  image: string;
  title: string;
  content: string[];
}

interface PackagesStepsEnhancedProps {
  currentStep: number;
  steps: Step[];
  onPrevious: () => void;
  onNext: () => void;
}

export default function PackagesStepsEnhanced({
  currentStep,
  steps,
  onPrevious,
  onNext,
}: PackagesStepsEnhancedProps) {
  const currentStepData = steps[currentStep - 1];

  return (
    <section className="relative pb-12 sm:pb-16 md:pb-20 lg:pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Content Card - Overlapping Hero */}
        <div className="bg-white rounded-3xl shadow-none relative -mt-16 sm:-mt-18 md:-mt-22 lg:-mt-28 z-20 px-5 sm:px-6 md:px-10 lg:px-12 pt-6 sm:pt-8 md:pt-10 lg:pt-12 pb-6 sm:pb-8 md:pb-10 lg:pb-12">
          <div className="grid lg:grid-cols-[42%_58%] gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
            {/* Left - Step Image with Navigation Arrows */}
            <div className="relative h-[280px] sm:h-[320px] md:h-[340px] lg:h-[360px] rounded-2xl overflow-hidden group">
              <img
                src={currentStepData.image}
                alt={currentStepData.title}
                className="w-full h-full object-cover"
              />
              
              {/* Left Arrow - 《 */}
              <button
                onClick={onPrevious}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 z-10"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
              </button>
              
              {/* Right Arrow - 》 */}
              <button
                onClick={onNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 z-10"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
              </button>
              
              {/* Step Number Badge */}
              <div className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E] flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg">
                {currentStep}
              </div>
            </div>

            {/* Right - Step Content */}
            <div className="flex flex-col justify-center">
              <div className="mb-6 sm:mb-8">
                <h2 
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3"
                  style={{ color: '#1DA78A' }}
                >
                  {currentStep}. {currentStepData.title}
                </h2>
                {/* Teal underline border */}
                <div className="w-32 sm:w-36 md:w-42 h-1.5 sm:h-2 rounded-4xl bg-gradient-to-r from-[#1DA78A] to-[#0F638E]"></div>
              </div>
              <ul className="space-y-3 sm:space-y-4 md:space-y-5">
                {currentStepData.content.map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5 sm:gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1DA78A] mt-1.5 sm:mt-2 shrink-0" />
                    <p className="text-sm sm:text-sm md:text-base text-gray-700 leading-relaxed">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Navigation Buttons - Desktop Only (Mobile uses arrows on image) */}
          <div className="hidden lg:flex justify-center gap-4 mt-8 sm:mt-10 md:mt-12">
            <button
              onClick={onPrevious}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
            <button
              onClick={onNext}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


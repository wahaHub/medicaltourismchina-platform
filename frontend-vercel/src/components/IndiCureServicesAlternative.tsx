import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ServiceStep {
  id: number;
  image: string;
  title: string;
  description: string;
}

const IndiCureServicesAlternative = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const serviceSteps: ServiceStep[] = [
    {
      id: 1,
      image: '/proc_service_1.png',
      title: 'Choose Right Treatment',
      description: 'We Help you Choose the Right Treatment, Surgeon & Hospital'
    },
    {
      id: 2,
      image: '/proc_service_2.png',
      title: 'Consultation',
      description: 'We Arrange Video/Telephonic Consultation with the Surgeon'
    },
    {
      id: 3,
      image: '/proc_service_3.png',
      title: 'Visa & Stay',
      description: 'We Assist you with Visa & Accommodation'
    },
    {
      id: 4,
      image: '/proc_service_4.png',
      title: 'Airport Transfer',
      description: 'We Receive you at the Airport and Drop you at Hotel/Hospital'
    },
    {
      id: 5,
      image: '/proc_service_5.png',
      title: 'Hospital Support',
      description: 'We Assist you at the Hospital & Provide Post Operative Support'
    }
  ];

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Carousel navigation for mobile
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % serviceSteps.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + serviceSteps.length) % serviceSteps.length);
  };

  // Scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-16 md:py-20 lg:py-24 overflow-hidden"
      id="indicure-services"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-tiffanyBlue/10 via-white to-mintGreen/10" />
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-mintGreen/20 rounded-full blur-xl" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-tiffanyBlue/20 rounded-full blur-2xl" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header Section with Enhanced Typography */}
        <div className="text-center mb-12 md:mb-16 animate-on-scroll opacity-0">
          <div className="inline-block mb-4">
            <span className="text-sm md:text-base text-mintGreen font-semibold tracking-wider uppercase">
              Our Process
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            IndiCure Services
          </h2>
          <div className="w-24 h-1 bg-mintGreen mx-auto mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Making Medical Travel to India Affordable & Hassle-free for 10+ Years
          </p>
        </div>

        {/* Desktop View - Grid Layout */}
        {!isMobile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {serviceSteps.map((step, index) => (
              <div
                key={step.id}
                className="animate-on-scroll opacity-0 group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative">
                  {/* Card Container */}
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 h-full transform hover:-translate-y-2">
                    {/* Circular Image */}
                    <div className="relative mb-6">
                      <div className="mx-auto w-32 h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden bg-gradient-to-br from-mintGreen/20 to-tiffanyBlue/20 p-1">
                        <div className="w-full h-full rounded-full overflow-hidden bg-white">
                          <img
                            src={step.image}
                            alt={step.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      </div>
                      
                      {/* Step Number */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-mintGreen to-tiffanyBlue rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {step.id}
                        </div>
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-center">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connection Line (visible on large screens) */}
                  {index < serviceSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/3 -right-3 w-6 z-20">
                      <svg className="w-full" viewBox="0 0 24 2">
                        <path
                          d="M0 1 L24 1"
                          stroke="url(#gradient)"
                          strokeWidth="2"
                          strokeDasharray="3 3"
                          className="animate-pulse"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#A8E6CF" />
                            <stop offset="100%" stopColor="#B2EBF2" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Mobile View - Carousel */
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {serviceSteps.map((step) => (
                  <div key={step.id} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                      {/* Circular Image */}
                      <div className="relative mb-6">
                        <div className="mx-auto w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-mintGreen/20 to-tiffanyBlue/20 p-1">
                          <div className="w-full h-full rounded-full overflow-hidden bg-white">
                            <img
                              src={step.image}
                              alt={step.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        
                        {/* Step Number */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <div className="w-14 h-14 bg-gradient-to-br from-mintGreen to-tiffanyBlue rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {step.id}
                          </div>
                        </div>
                      </div>

                      {/* Text Content */}
                      <div className="text-center">
                        <h3 className="font-bold text-gray-900 mb-3 text-xl">
                          {step.title}
                        </h3>
                        <p className="text-base text-gray-600 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Controls */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
              aria-label="Previous step"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
              aria-label="Next step"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>

            {/* Carousel Indicators */}
            <div className="flex justify-center mt-6 gap-2">
              {serviceSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index 
                      ? 'w-8 bg-mintGreen' 
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Call to Action Section */}
        <div className="text-center mt-12 md:mt-16 animate-on-scroll opacity-0">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-3 bg-gradient-to-r from-mintGreen to-tiffanyBlue hover:from-mintGreen/90 hover:to-tiffanyBlue/90 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Start Your Medical Journey
            </button>
            <button className="px-8 py-3 border-2 border-mintGreen text-mintGreen hover:bg-mintGreen hover:text-white font-semibold rounded-full transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndiCureServicesAlternative;
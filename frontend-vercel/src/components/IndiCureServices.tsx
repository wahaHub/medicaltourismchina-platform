import { useEffect, useRef } from 'react';

interface ServiceStep {
  id: number;
  image: string;
  description: string;
}

const IndiCureServices = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  const serviceSteps: ServiceStep[] = [
    {
      id: 1,
      image: '/proc_service_1.png',
      description: 'We Help you Choose the Right Treatment, Surgeon & Hospital'
    },
    {
      id: 2,
      image: '/proc_service_2.png',
      description: 'We Arrange Video/Telephonic Consultation with the Surgeon'
    },
    {
      id: 3,
      image: '/proc_service_3.png',
      description: 'We Assist you with Visa & Accommodation'
    },
    {
      id: 4,
      image: '/proc_service_4.png',
      description: 'We Receive you at the Airport and Drop you at Hotel/Hospital'
    },
    {
      id: 5,
      image: '/proc_service_5.png',
      description: 'We Assist you at the Hospital & Provide Post Operative Support'
    }
  ];

  // Add scroll animation effect
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

    const cards = sectionRef.current?.querySelectorAll('.service-card');
    cards?.forEach((card) => observer.observe(card));

    return () => {
      cards?.forEach((card) => observer.unobserve(card));
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50"
      id="indicure-services"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            IndiCure Services
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Making Medical Travel to India Affordable & Hassle-free for 10+ Years
          </p>
        </div>

        {/* Service Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {serviceSteps.map((step, index) => (
            <div
              key={step.id}
              className="service-card opacity-0 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Circular Image Container */}
              <div className="relative mb-6">
                <div className="mx-auto w-40 h-40 rounded-full overflow-hidden bg-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <img
                    src={step.image}
                    alt={`Service Step ${step.id}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                
                {/* Step Number Badge */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-mintGreen rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {step.id}
                </div>
              </div>

              {/* Description Text */}
              <div className="text-center px-2">
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Optional CTA Button */}
        <div className="text-center mt-12 md:mt-16">
          <button className="px-8 py-3 bg-mintGreen hover:bg-mintGreen/90 text-white font-semibold rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Start Your Medical Journey
          </button>
        </div>
      </div>
    </section>
  );
};

export default IndiCureServices;
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import ProgressiveImage from "@/components/ProgressiveImage";

// CloudFront base URL for progressive image loading
const LOW_MEDIA_BASE = `${(import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL || 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev').replace(/\/+$/, '')}/low`;

export default function TestimonialsSection() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMobilePage, setCurrentMobilePage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileHovered, setIsMobileHovered] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<{
    name: string;
    title: string;
    story: string;
    imageBaseUrl: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Testimonials data - now with 18 stories
  const testimonials = [
    {
      name: "Emily Carter",
      title: t('homepage.testimonials.testimonial1.title'),
      story: t('homepage.testimonials.testimonial1.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/1`
    },
    {
      name: "Robert Miller",
      title: t('homepage.testimonials.testimonial2.title'),
      story: t('homepage.testimonials.testimonial2.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/2`
    },
    {
      name: "Aarav Singh",
      title: t('homepage.testimonials.testimonial3.title'),
      story: t('homepage.testimonials.testimonial3.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/3`
    },
    {
      name: "David Anderson",
      title: t('homepage.testimonials.testimonial4.title'),
      story: t('homepage.testimonials.testimonial4.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/4`
    },
    {
      name: "Sarah Thompson",
      title: t('homepage.testimonials.testimonial5.title'),
      story: t('homepage.testimonials.testimonial5.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/5`
    },
    {
      name: "Ahmed Khalid",
      title: t('homepage.testimonials.testimonial6.title'),
      story: t('homepage.testimonials.testimonial6.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/6`
    },
    {
      name: "Helena Garcia",
      title: t('homepage.testimonials.testimonial7.title'),
      story: t('homepage.testimonials.testimonial7.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/7`
    },
    {
      name: "Mark Jensen",
      title: t('homepage.testimonials.testimonial8.title'),
      story: t('homepage.testimonials.testimonial8.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/8`
    },
    {
      name: "Olivia Brown",
      title: t('homepage.testimonials.testimonial9.title'),
      story: t('homepage.testimonials.testimonial9.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/9`
    },
    {
      name: "Emily Carter",
      title: t('homepage.testimonials.testimonial10.title'),
      story: t('homepage.testimonials.testimonial10.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/10`
    },
    {
      name: "Maria Santos",
      title: t('homepage.testimonials.testimonial11.title'),
      story: t('homepage.testimonials.testimonial11.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/11`
    },
    {
      name: "Kenji Nakamura",
      title: t('homepage.testimonials.testimonial12.title'),
      story: t('homepage.testimonials.testimonial12.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/12`
    },
    {
      name: "Ahmed Hassan",
      title: t('homepage.testimonials.testimonial13.title'),
      story: t('homepage.testimonials.testimonial13.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/13`
    },
    {
      name: "Daniel Brooks",
      title: t('homepage.testimonials.testimonial14.title'),
      story: t('homepage.testimonials.testimonial14.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/14`
    },
    {
      name: "Rahul Mehta",
      title: t('homepage.testimonials.testimonial15.title'),
      story: t('homepage.testimonials.testimonial15.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/15`
    },
    {
      name: "Isabella Romano",
      title: t('homepage.testimonials.testimonial16.title'),
      story: t('homepage.testimonials.testimonial16.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/16`
    },
    {
      name: "Fatima Al-Zahra",
      title: t('homepage.testimonials.testimonial17.title'),
      story: t('homepage.testimonials.testimonial17.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/17`
    },
    {
      name: "Chen Wei",
      title: t('homepage.testimonials.testimonial18.title'),
      story: t('homepage.testimonials.testimonial18.story'),
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/witness/head/18`
    }
  ];

  const visibleCards = 3;
  const cardsPerMobilePage = 2; // 1 row with 2 cards
  const totalMobilePages = Math.ceil(testimonials.length / cardsPerMobilePage);

  // Auto-play carousel
  useEffect(() => {
    const desktopInterval = setInterval(() => {
      if (!isHovered) {
        setCurrentIndex((prev) =>
          prev + 1 >= testimonials.length - visibleCards + 1 ? 0 : prev + 1
        );
      }
    }, 3000);

    const mobileInterval = setInterval(() => {
      if (!isMobileHovered) {
        setCurrentMobilePage((prev) =>
          prev + 1 >= totalMobilePages ? 0 : prev + 1
        );
      }
    }, 3000);

    return () => {
      clearInterval(desktopInterval);
      clearInterval(mobileInterval);
    };
  }, [testimonials.length, totalMobilePages, isHovered, isMobileHovered]);

  const next = () => {
    setCurrentIndex((prev) =>
      prev + 1 >= testimonials.length - visibleCards + 1 ? 0 : prev + 1
    );
  };

  const prev = () => {
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? testimonials.length - visibleCards : prev - 1
    );
  };

  const nextMobile = () => {
    setCurrentMobilePage((prev) =>
      prev + 1 >= totalMobilePages ? 0 : prev + 1
    );
  };

  const prevMobile = () => {
    setCurrentMobilePage((prev) =>
      prev - 1 < 0 ? totalMobilePages - 1 : prev - 1
    );
  };

  const openModal = (testimonial: typeof testimonials[0]) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTestimonial(null);
  };

  return (
    <section id="testimonials" className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('${LOW_MEDIA_BASE}/figma-assets/rehabilitation-stories-bg_x2.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #1DA78A 0%, #0F638E 100%)',
          opacity: 0.9
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-2xl lg:text-3xl font-bold text-white mb-6">
            {t('homepage.testimonials.title')}
          </h2>
          {/* Group.png with "Hundreds Of Positive Reviews" text inside on the right */}
          <div className="relative inline-block">
            <img
              src={`${LOW_MEDIA_BASE}/homepage/witness/Group.png`}
              alt="Reviews badge"
              className="w-auto h-24"
            />
            <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center" style={{ paddingLeft: '45%', paddingBottom: '14px' }}>
              <p className="text-xs font-normal text-center" style={{ fontFamily: 'Poppins, sans-serif', color: 'rgb(78, 160, 136)' }}>
                {t('homepage.testimonials.reviewsBadge')}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile: 2 cards per row with Carousel */}
        <div
          className="relative md:hidden"
          onMouseEnter={() => setIsMobileHovered(true)}
          onMouseLeave={() => setIsMobileHovered(false)}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentMobilePage * 100}%)`,
              }}
            >
              {Array.from({ length: totalMobilePages }).map((_, pageIndex) => (
                <div key={pageIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-2 gap-3">
                    {testimonials
                      .slice(pageIndex * cardsPerMobilePage, (pageIndex + 1) * cardsPerMobilePage)
                      .map((testimonial, index) => (
                        <div key={index}>
                          {/* Card with Rectangle.png background - scaled for mobile */}
                          <div
                            className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                            style={{ minHeight: '280px' }}
                            onClick={() => openModal(testimonial)}
                          >
                            {/* Rectangle.png as background */}
                            <img
                              src={`${LOW_MEDIA_BASE}/homepage/witness/Rectangle.png`}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover"
                            />

                            {/* Content - scaled for mobile */}
                            <div className="relative z-10 p-4 flex flex-col items-center text-center">
                              {/* Head image - smaller for mobile */}
                              <div className="w-16 h-16 rounded-full overflow-hidden mb-3">
                                <ProgressiveImage
                                  baseUrl={testimonial.imageBaseUrl}
                                  alt={testimonial.name}
                                  resolutionLevels={['x1', 'x3']}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Title - smaller font */}
                              <p className="text-xs font-semibold text-gray-800 mb-2 leading-relaxed line-clamp-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {testimonial.title}
                              </p>

                              {/* Story - smaller font and truncated */}
                              <p className="text-[10px] text-gray-700 leading-relaxed text-left line-clamp-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {testimonial.story}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons for mobile */}
          <button
            onClick={prevMobile}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white text-[#1DA78A] p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMobile}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white text-[#1DA78A] p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop: 3 cards Carousel */}
        <div
          className="relative hidden md:block"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{ width: `calc(${100 / visibleCards}% - 16px)` }}
                >
                  {/* Card with Rectangle.png background */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: '400px' }}>
                    {/* Rectangle.png as background */}
                    <img
                      src={`${LOW_MEDIA_BASE}/homepage/witness/Rectangle.png`}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Content */}
                    <div className="relative z-10 p-8 flex flex-col items-center text-center">
                      {/* Head image - no border */}
                      <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                        <ProgressiveImage
                          baseUrl={testimonial.imageBaseUrl}
                          alt={testimonial.name}
                          resolutionLevels={['x1', 'x3']}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Title */}
                      <p className="text-sm font-semibold text-gray-800 mb-4 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {testimonial.title}
                      </p>

                      {/* Story */}
                      <p className="text-xs text-gray-700 leading-relaxed text-left" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {testimonial.story}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white text-[#1DA78A] p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white text-[#1DA78A] p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal for mobile - Full story details */}
      {isModalOpen && selectedTestimonial && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:hidden"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal content */}
            <div className="relative">
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Background image */}
              <div className="relative rounded-t-2xl overflow-visible">
                <img
                  src={`${LOW_MEDIA_BASE}/homepage/witness/Rectangle.png`}
                  alt=""
                  className="w-full h-48 object-cover rounded-t-2xl"
                />

                {/* Head image positioned on top of background */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <ProgressiveImage
                      baseUrl={selectedTestimonial.imageBaseUrl}
                      alt={selectedTestimonial.name}
                      resolutionLevels={['x1', 'x3']}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pb-6 pt-16">
                {/* Name */}
                <h3 className="text-xl font-bold text-[#1DA78A] text-center mb-3">
                  {selectedTestimonial.name}
                </h3>

                {/* Title */}
                <p className="text-sm font-semibold text-gray-800 text-center mb-4 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {selectedTestimonial.title}
                </p>

                {/* Full Story */}
                <p className="text-sm text-gray-700 leading-relaxed text-left" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {selectedTestimonial.story}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

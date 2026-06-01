import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getHospitalName, type HospitalId } from "@/i18n/hospitalNames";
import { getDoctorProfile, type DoctorId } from "@/i18n/doctorNames";
import ProgressiveImage from "@/components/ProgressiveImage";

// CloudFront base URL for low resolution images
const LOW_MEDIA_BASE = `${(import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL || 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev').replace(/\/+$/, '')}/low`;

type HomepageHospitalLocale = "en" | "zh" | "de" | "fr" | "es";

export type HomepageHospitalCard = {
  id: string;
  image: string;
  name: string;
};

const HOMEPAGE_PUBLIC_HOSPITAL_IDS: HospitalId[] = ["16", "3", "10", "9", "12", "5", "1", "6", "7", "8", "11", "15", "2", "14", "13", "4"];

const HOMEPAGE_PRIVATE_HOSPITALS = [
  {
    id: "17" as HospitalId,
    image: "https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png",
  },
  {
    id: "18" as HospitalId,
    image: "https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg",
  },
  {
    id: "19" as HospitalId,
    image: "https://d1wwcixye6at8o.cloudfront.net/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg",
  },
] as const;

function getHomepageHospitalLocale(languageCode: string): HomepageHospitalLocale {
  if (languageCode === "zh" || languageCode === "de" || languageCode === "fr" || languageCode === "es") {
    return languageCode;
  }

  return "en";
}

export function getSelectedHomepageHospitals(languageCode: string): HomepageHospitalCard[] {
  const locale = getHomepageHospitalLocale(languageCode);

  const privateHospitals = HOMEPAGE_PRIVATE_HOSPITALS.map((hospital) => ({
    id: hospital.id,
    image: hospital.image,
    name: getHospitalName(hospital.id, locale),
  }));

  const publicHospitals = HOMEPAGE_PUBLIC_HOSPITAL_IDS.map((id) => ({
    id,
    image: `${LOW_MEDIA_BASE}/homepage/hospitals/${id}.png`,
    name: getHospitalName(id, locale),
  }));

  return [...privateHospitals, ...publicHospitals];
}

export default function WhyMedoraSection() {
  const { t, currentLanguage } = useLanguage();
  const [currentHospitalIndex, setCurrentHospitalIndex] = useState(0);
  const [currentMobileHospitalPage, setCurrentMobileHospitalPage] = useState(0);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const [currentMobileDoctorPage, setCurrentMobileDoctorPage] = useState(0);
  const [isHospitalHovered, setIsHospitalHovered] = useState(false);
  const [isMobileHospitalHovered, setIsMobileHospitalHovered] = useState(false);
  const [isDoctorHovered, setIsDoctorHovered] = useState(false);
  const [isMobileDoctorHovered, setIsMobileDoctorHovered] = useState(false);

  const hospitals = getSelectedHomepageHospitals(currentLanguage.code);

  // Doctor data using numbered images and i18n (19 doctors total)
  const doctorIds: DoctorId[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"];

  const doctors = doctorIds.map(id => {
    const profile = getDoctorProfile(id, currentLanguage.code as any);
    return {
      id,
      imageBaseUrl: `${LOW_MEDIA_BASE}/homepage/doctors/${id}`,
      ...profile
    };
  });

  const visibleHospitals = 4;
  const visibleDoctors = 3;
  const hospitalsPerMobilePage = 4; // 2x2 grid
  const doctorsPerMobilePage = 4; // 2x2 grid
  const totalMobilePages = Math.ceil(hospitals.length / hospitalsPerMobilePage);
  const totalMobileDoctorPages = Math.ceil(doctors.length / doctorsPerMobilePage);

  // Auto-play carousel for hospitals and doctors
  useEffect(() => {
    const hospitalInterval = setInterval(() => {
      if (!isHospitalHovered) {
        setCurrentHospitalIndex((prev) =>
          prev + 1 >= hospitals.length - visibleHospitals + 1 ? 0 : prev + 1
        );
      }
    }, 3000);

    const mobileHospitalInterval = setInterval(() => {
      if (!isMobileHospitalHovered) {
        setCurrentMobileHospitalPage((prev) =>
          prev + 1 >= totalMobilePages ? 0 : prev + 1
        );
      }
    }, 3000);

    const doctorInterval = setInterval(() => {
      if (!isDoctorHovered) {
        setCurrentDoctorIndex((prev) =>
          prev + 1 >= doctors.length - visibleDoctors + 1 ? 0 : prev + 1
        );
      }
    }, 3000);

    const mobileDoctorInterval = setInterval(() => {
      if (!isMobileDoctorHovered) {
        setCurrentMobileDoctorPage((prev) =>
          prev + 1 >= totalMobileDoctorPages ? 0 : prev + 1
        );
      }
    }, 3000);

    return () => {
      clearInterval(hospitalInterval);
      clearInterval(mobileHospitalInterval);
      clearInterval(doctorInterval);
      clearInterval(mobileDoctorInterval);
    };
  }, [hospitals.length, doctors.length, totalMobilePages, totalMobileDoctorPages, isHospitalHovered, isMobileHospitalHovered, isDoctorHovered, isMobileDoctorHovered]);

  const nextHospitals = () => {
    setCurrentHospitalIndex((prev) =>
      prev + 1 >= hospitals.length - visibleHospitals + 1 ? 0 : prev + 1
    );
  };

  const prevHospitals = () => {
    setCurrentHospitalIndex((prev) =>
      prev - 1 < 0 ? hospitals.length - visibleHospitals : prev - 1
    );
  };

  const nextMobileHospitals = () => {
    setCurrentMobileHospitalPage((prev) =>
      prev + 1 >= totalMobilePages ? 0 : prev + 1
    );
  };

  const prevMobileHospitals = () => {
    setCurrentMobileHospitalPage((prev) =>
      prev - 1 < 0 ? totalMobilePages - 1 : prev - 1
    );
  };

  const nextDoctors = () => {
    setCurrentDoctorIndex((prev) =>
      prev + 1 >= doctors.length - visibleDoctors + 1 ? 0 : prev + 1
    );
  };

  const prevDoctors = () => {
    setCurrentDoctorIndex((prev) =>
      prev - 1 < 0 ? doctors.length - visibleDoctors : prev - 1
    );
  };

  const nextMobileDoctors = () => {
    setCurrentMobileDoctorPage((prev) =>
      prev + 1 >= totalMobileDoctorPages ? 0 : prev + 1
    );
  };

  const prevMobileDoctors = () => {
    setCurrentMobileDoctorPage((prev) =>
      prev - 1 < 0 ? totalMobileDoctorPages - 1 : prev - 1
    );
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 pt-12 sm:pt-16 lg:pt-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Why Medora - Hidden on mobile */}
        <div className="text-center mb-12 hidden md:block">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1DA78A] mb-8 mt-4">
            {t('homepage.whyMedora.title')}
          </h2>

          {/* Desktop: One large card on left, two stacked on right */}
          <div className="md:grid md:grid-cols-2 gap-6 mb-8">
            {/* Left: Public Grade A Tertiary Hospital - Large */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg h-64 md:h-96 group cursor-pointer">
              <img
                src={`${LOW_MEDIA_BASE}/homepage/why_medora_1_x2.png`}
                alt="Hospital"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              {/* Overlay Image 1 */}
              <img
                src={`${LOW_MEDIA_BASE}/homepage/why_medora_overlay_1_x2.png`}
                alt="Hospital Overlay"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute top-4 left-0 z-10 flex items-center">
                <img src={`${LOW_MEDIA_BASE}/homepage/top_1_x2.png`} alt="TOP1 Badge" className="h-8" />
                <span className="absolute left-2 text-[#1DA78A] font-bold text-sm">TOP1</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                <h3 className="text-xl font-bold mb-2" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.6)' }}>{t('homepage.whyMedora.publicHospital')}</h3>
                <p className="text-sm opacity-90" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)' }}>{t('homepage.whyMedora.publicHospitalSubtitle')}</p>
              </div>
            </div>

            {/* Right: Two stacked cards */}
            <div className="flex flex-col gap-6 h-64 md:h-96">
              {/* Top Doctors */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg flex-1 group cursor-pointer">
                <img
                  src={`${LOW_MEDIA_BASE}/homepage/why_medora_2_x2.png`}
                  alt="Doctors"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {/* Overlay Image 2 */}
                <img
                  src={`${LOW_MEDIA_BASE}/homepage/why_medora_overlay_2_x2.png`}
                  alt="Doctors Overlay"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute top-4 left-0 z-10 flex items-center">
                  <img src={`${LOW_MEDIA_BASE}/homepage/top_1_x2.png`} alt="TOP1 Badge" className="h-8" />
                  <span className="absolute left-2 text-[#1DA78A] font-bold text-sm">TOP1</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                  <h3 className="text-base font-bold mb-1" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.6)' }}>{t('homepage.whyMedora.topDoctors')}</h3>
                  <p className="text-xs opacity-90" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)' }}>{t('homepage.whyMedora.topDoctorsSubtitle')}</p>
                </div>
              </div>

              {/* Rapid Treatment */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg flex-1 group cursor-pointer">
                <img
                  src={`${LOW_MEDIA_BASE}/homepage/why_medora_3_x2.png`}
                  alt="Treatment"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {/* Overlay Image 2 */}
                <img
                  src={`${LOW_MEDIA_BASE}/homepage/why_medora_overlay_2_x2.png`}
                  alt="Treatment Overlay"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute top-4 left-0 z-10 flex items-center">
                  <img src={`${LOW_MEDIA_BASE}/homepage/top_1_x2.png`} alt="TOP1 Badge" className="h-8" />
                  <span className="absolute left-2 text-[#1DA78A] font-bold text-sm">TOP1</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                  <h3 className="text-base font-bold mb-1" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.6)' }}>{t('homepage.whyMedora.rapidTreatment')}</h3>
                  <p className="text-xs opacity-90" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)' }}>{t('homepage.whyMedora.rapidTreatmentSubtitle')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Selected Hospitals */}
        <div className="mb-16 mt-8 sm:mt-12 md:mt-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1DA78A] text-center mb-8 mt-4">
            {t('homepage.whyMedora.selectedHospitals')}
          </h2>

          {/* Mobile: 2x2 Grid with Carousel */}
          <div
            className="relative md:hidden"
            onMouseEnter={() => setIsMobileHospitalHovered(true)}
            onMouseLeave={() => setIsMobileHospitalHovered(false)}
          >
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentMobileHospitalPage * 100}%)`,
                }}
              >
                {Array.from({ length: totalMobilePages }).map((_, pageIndex) => (
                  <div
                    key={pageIndex}
                    className="w-full flex-shrink-0"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {hospitals
                        .slice(pageIndex * hospitalsPerMobilePage, (pageIndex + 1) * hospitalsPerMobilePage)
                        .map((hospital, index) => (
                          <div key={index}>
                            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                              <img
                                src={hospital.image}
                                alt={hospital.name}
                                className="w-full h-32 object-cover"
                              />
                              <div className="p-3">
                                <h3 className="text-xs font-semibold text-gray-800 text-center line-clamp-2">
                                  {hospital.name}
                                </h3>
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
              onClick={prevMobileHospitals}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white text-[#1DA78A] p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
              aria-label="Previous hospitals"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMobileHospitals}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white text-[#1DA78A] p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
              aria-label="Next hospitals"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop: Carousel */}
          <div
            className="relative hidden md:block"
            onMouseEnter={() => setIsHospitalHovered(true)}
            onMouseLeave={() => setIsHospitalHovered(false)}
          >
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out gap-6"
                style={{
                  transform: `translateX(-${currentHospitalIndex * (100 / visibleHospitals)}%)`,
                }}
              >
                {hospitals.map((hospital, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0"
                    style={{ width: `calc(${100 / visibleHospitals}% - 18px)` }}
                  >
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                      <img
                        src={hospital.image}
                        alt={hospital.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-800 text-center line-clamp-2">
                          {hospital.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <button
              onClick={prevHospitals}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-[#1DA78A] text-white p-2 rounded-full shadow-lg hover:bg-[#158970] transition-colors z-10"
              aria-label="Previous hospitals"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextHospitals}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-[#1DA78A] text-white p-2 rounded-full shadow-lg hover:bg-[#158970] transition-colors z-10"
              aria-label="Next hospitals"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Our Selected Doctors */}
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1DA78A] text-center mb-8">
            {t('homepage.whyMedora.selectedDoctors')}
          </h2>

          {/* Mobile: 2x2 Grid with Carousel */}
          <div
            className="relative md:hidden"
            onMouseEnter={() => setIsMobileDoctorHovered(true)}
            onMouseLeave={() => setIsMobileDoctorHovered(false)}
          >
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentMobileDoctorPage * 100}%)`,
                }}
              >
                {Array.from({ length: totalMobileDoctorPages }).map((_, pageIndex) => (
                  <div key={pageIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-2 gap-4">
                      {doctors
                        .slice(pageIndex * doctorsPerMobilePage, (pageIndex + 1) * doctorsPerMobilePage)
                        .map((doctor, index) => (
                          <div key={index}>
                            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                              {/* Doctor Image - larger for mobile */}
                              <div className="w-full h-40">
                                <ProgressiveImage
                                  baseUrl={doctor.imageBaseUrl}
                                  alt={doctor.name || ''}
                                  resolutionLevels={['x1', 'x3']}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {/* Doctor Info - name and title only */}
                              <div className="p-3">
                                {/* Name badge - simplified for mobile */}
                                <div className="mb-2">
                                  <div className="bg-gradient-to-r from-[#1DA78A] to-[#0F638E] text-white px-3 py-1 rounded-full inline-block">
                                    <h3 className="font-bold text-xs">{doctor.name}</h3>
                                  </div>
                                </div>
                                {/* Title - complete without truncation */}
                                <p className="text-xs font-bold text-[#1DA78A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  {doctor.title}
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
              onClick={prevMobileDoctors}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white text-[#1DA78A] p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
              aria-label="Previous doctors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMobileDoctors}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white text-[#1DA78A] p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
              aria-label="Next doctors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop: Carousel with Flip Cards */}
          <div
            className="relative hidden md:block"
            onMouseEnter={() => setIsDoctorHovered(true)}
            onMouseLeave={() => setIsDoctorHovered(false)}
          >
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out gap-6"
                style={{
                  transform: `translateX(-${currentDoctorIndex * (100 / visibleDoctors)}%)`,
                }}
              >
                {doctors.map((doctor, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 group"
                    style={{ width: `calc(${100 / visibleDoctors}% - 16px)`, perspective: '1000px' }}
                  >
                    <div
                      className="relative transition-transform duration-700"
                      style={{
                        transformStyle: 'preserve-3d',
                        height: '320px'
                      }}
                    >
                      <style>
                        {`
                          .group:hover .flip-card-inner {
                            transform: rotateY(180deg);
                          }
                        `}
                      </style>
                      <div className="flip-card-inner relative w-full h-full transition-transform duration-700" style={{ transformStyle: 'preserve-3d' }}>
                        {/* Front: Original Card */}
                        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                          <div className="bg-white rounded-xl overflow-hidden shadow-lg h-full relative">
                            <div className="flex flex-row h-full">
                              {/* Left: Text Content */}
                              <div className="flex-1 p-6 flex flex-col justify-center bg-gray-50">
                                {/* Name badge - aligned to left edge */}
                                <div className="mb-4 -ml-6">
                                  <div className="bg-gradient-to-r from-[#1DA78A] to-[#0F638E] text-white px-6 py-2 rounded-r-full inline-block">
                                    <h3 className="font-bold text-base">{doctor.name}</h3>
                                  </div>
                                </div>
                                {/* Title */}
                                <p className="text-sm font-bold text-[#1DA78A] mb-3">{doctor.title}</p>
                                {/* Description with Poppins font */}
                                <p className="text-xs text-gray-600 leading-relaxed line-clamp-4" style={{ fontFamily: 'Poppins, sans-serif' }}>{doctor.description}</p>
                              </div>
                              {/* Right: Doctor Image */}
                              <div className="w-1/2 flex-shrink-0">
                                <ProgressiveImage
                                  baseUrl={doctor.imageBaseUrl}
                                  alt={doctor.name || ''}
                                  resolutionLevels={['x1', 'x3']}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            {/* Bottom Overlay Decoration */}
                            <img
                              src={`${LOW_MEDIA_BASE}/homepage/doctors/Mask group_x3.png`}
                              alt="Decoration"
                              className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
                              style={{ height: 'auto' }}
                            />
                          </div>
                        </div>

                        {/* Back: Full Description */}
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-[#1DA78A] to-[#0F638E] rounded-xl shadow-lg p-8 flex flex-col justify-center"
                          style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                          }}
                        >
                          <div className="text-white">
                            {/* Name badge */}
                            <div className="mb-4">
                              <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full inline-block">
                                <h3 className="font-bold text-lg">{doctor.name}</h3>
                              </div>
                            </div>
                            {/* Title */}
                            <p className="text-base font-bold mb-4 opacity-90">{doctor.title}</p>
                            {/* Full Description */}
                            <p className="text-sm leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {doctor.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <button
              onClick={prevDoctors}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-[#1DA78A] text-white p-2 rounded-full shadow-lg hover:bg-[#158970] transition-colors z-10"
              aria-label="Previous doctors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextDoctors}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-[#1DA78A] text-white p-2 rounded-full shadow-lg hover:bg-[#158970] transition-colors z-10"
              aria-label="Next doctors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


import { ExternalLink, Info, Star, MapPin, Building2, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useNavigate } from "react-router-dom";
import { Hospital } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";

interface NewHospitalCardProps {
  hospitalData: Hospital;
}

interface LegacyHospitalCardProps {
  id: number;
  name: string;
  isJCIAccredited: boolean;
  rating: number;
  waitTime: string;
  cost: string;
  annualCases: number;
  image: string;
  accreditations?: string[];
  website?: string;
}

type HospitalCardProps = NewHospitalCardProps | LegacyHospitalCardProps;

const LOW_MEDIA_BASE = `${(import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL || 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev').replace(/\/+$/, '')}/low`;
const HOSPITAL_PLACEHOLDER_IMAGE_URL = `${LOW_MEDIA_BASE}/root_assets/surgery_placeholder_x2.png`;

// Generate R2 hospital photo URLs for list view fallbacks.
const generateHospitalPhotoUrls = (hospitalId: string, maxPhotos: number = 4): string[] => {
  const baseUrl = `${LOW_MEDIA_BASE}/hospitals/public`;
  const urls: string[] = [];

  for (let i = 1; i <= maxPhotos; i++) {
    urls.push(`${baseUrl}/${hospitalId}_${i}.png`);
  }

  return urls;
};

// Hospital Photo Slider Component
const HospitalPhotoSlider = ({ hospitalId, hospitalName, heroImageUrl }: { hospitalId: string, hospitalName: string, heroImageUrl?: string }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [availablePhotos, setAvailablePhotos] = useState<string[]>([]);
  const [failedPhotos, setFailedPhotos] = useState<Set<string>>(new Set());

  useEffect(() => {
    const photoUrls = generateHospitalPhotoUrls(hospitalId, 5);
    setAvailablePhotos([heroImageUrl, ...photoUrls].filter(Boolean) as string[]);
    setFailedPhotos(new Set());
    setCurrentPhotoIndex(0);
  }, [hospitalId, heroImageUrl]);

  const handleImageError = (url: string) => {
    if (url === HOSPITAL_PLACEHOLDER_IMAGE_URL) {
      return;
    }

    setFailedPhotos((previous) => {
      const next = new Set(previous);
      next.add(url);
      return next;
    });
    setCurrentPhotoIndex(0);
  };

  // Filter out failed photos for navigation
  const validPhotos = availablePhotos.filter(url => !failedPhotos.has(url));
  const displayPhotos = validPhotos.length > 0 ? validPhotos : [HOSPITAL_PLACEHOLDER_IMAGE_URL];

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (displayPhotos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % displayPhotos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (displayPhotos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length);
    }
  };

  const currentPhoto = displayPhotos[Math.min(currentPhotoIndex, displayPhotos.length - 1)];

  return (
    <div className="relative h-full w-full">
      <img
        src={currentPhoto}
        alt={`${hospitalName} - 照片 ${currentPhotoIndex + 1}`}
        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={() => handleImageError(currentPhoto)}
      />
      
      {/* Navigation arrows */}
      {displayPhotos.length > 1 && (
        <>
          <button
            onClick={prevPhoto}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-all duration-300 shadow-lg hover:scale-110"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          
          <button
            onClick={nextPhoto}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-all duration-300 shadow-lg hover:scale-110"
            aria-label="Next photo"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          
          {/* Photo dots indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {displayPhotos.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentPhotoIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Information about accreditations
const accreditationInfo = {
  "JCI Accredited": "Joint Commission International (JCI) accreditation is considered the gold standard in global health care, with accredited hospitals demonstrating a commitment to safety and quality care.",
  "3A Hospital": "3A (三级甲等) is the highest grade for hospitals in China's medical classification system, indicating the highest standards of medical care, facilities, and management.",
  "ISO 9001": "ISO 9001 is a quality management system standard that ensures organizations meet customer and regulatory requirements related to a product or service.",
  "TEMOS": "TEMOS accreditation signifies excellence in international patient care and medical tourism services.",
  "CHKS": "CHKS accreditation demonstrates that a healthcare organization meets international quality standards for patient care.",
  "GHA": "Global Healthcare Accreditation (GHA) focuses specifically on medical travel and enhancing the patient experience.",
  "DNV GL": "DNV GL's hospital accreditation program integrates ISO 9001 quality management with Medicare Conditions of Participation.",
  "HIMSS": "Healthcare Information and Management Systems Society (HIMSS) recognizes excellence in health information technology and management systems."
};

const HospitalCard = (props: HospitalCardProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Check if this is the new hospital format
  const isNewHospitalFormat = 'hospitalData' in props;
  
  // Extract data based on format
  const data = isNewHospitalFormat ? {
    id: props.hospitalData.id,
    name: props.hospitalData.name,
    slug: props.hospitalData.slug,
    is3A: props.hospitalData.tier === '三甲',
    isPrivate: props.hospitalData.ownership_type === '私立',
    annualCases: props.hospitalData.annual_outpatient_visits || 0,
    image: '/api/placeholder/400/240', // Placeholder for now
    website: props.hospitalData.official_website || '',
    wikiUrl: (props.hospitalData as any).wiki_link || `https://zh.wikipedia.org/wiki/${encodeURIComponent(props.hospitalData.name)}`,
    location: `${props.hospitalData.city}${props.hospitalData.province ? ', ' + props.hospitalData.province : ''}`,
    tier: props.hospitalData.tier,
    hospitalType: props.hospitalData.short_description,
    establishedYear: props.hospitalData.established_year,
    departmentCount: props.hospitalData.department_count,
    profileLink: `/hospitals/${props.hospitalData.slug}`
  } : {
    // Legacy format fallback
    id: props.id.toString(),
    name: props.name,
    slug: props.id.toString(),
    is3A: props.isJCIAccredited,
    isPrivate: false,
    annualCases: props.annualCases,
    image: props.image,
    website: props.website || '',
    wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(props.name)}`,
    location: '',
    tier: '',
    hospitalType: '',
    establishedYear: undefined,
    departmentCount: 0,
    profileLink: `/hospitals/${props.id}`
  };

  const handleCardClick = () => {
    navigate(data.profileLink);
  };

  return (
    <Card className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group h-full flex flex-col" onClick={handleCardClick}>
      {/* Hospital Image Slider */}
      <div className="relative h-48 sm:h-52 md:h-56 w-full overflow-hidden">
        {isNewHospitalFormat ? (
          <HospitalPhotoSlider
            hospitalId={props.hospitalData.id}
            hospitalName={data.name}
            heroImageUrl={props.hospitalData.hero_image_url}
          />
        ) : (
          <img
            src={data.image}
            alt={data.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        

        
        {/* 3A Hospital Badge - Top Left */}
        {(data.is3A || data.tier === '三甲') && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-lg">
              Class A Tertiary
            </span>
          </div>
        )}
        
        {/* Public/Private Badge - Top Right */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20">
          <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-lg ${
            !data.isPrivate 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
          }`}>
            {!data.isPrivate ? 'Public Hospital 🏛️' : 'Private Hospital 🏢'}
          </span>
        </div>
        
        {/* City Label - Bottom Left */}
        {data.location && (
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-[#52C9B5] to-[#3EAFA0] px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-lg z-20 opacity-90">
            <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white" />
            <span className="text-[10px] sm:text-xs font-medium text-white">{data.location}</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Hospital Name */}
        <h3 className="text-base sm:text-lg font-semibold text-[#14B8A6] uppercase tracking-wide line-clamp-2 mb-2 group-hover:text-teal-600 transition-colors">
          {data.name}
        </h3>
        
        {/* Action Links - Official Website & Wiki */}
        <div className="flex flex-wrap gap-2 mb-3">
          {data.website && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={data.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[10px] sm:text-xs text-[#0F638E] border border-[#0F638E] rounded-full hover:bg-[#0F638E] hover:text-white transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    {t('hospital.officialWebsite')}
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('hospital.visitWebsite')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={data.wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[10px] sm:text-xs text-[#0F638E] border border-[#0F638E] rounded-full hover:bg-[#0F638E] hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {t('hospital.wiki')}
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('hospital.viewWikipedia')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Divider */}
        <hr className="border-gray-200 my-2" />
        
        {/* Hospital Type Description */}
        {data.hospitalType && (
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2">
            {data.hospitalType}
          </p>
        )}
        
        {/* Info Tags - Established Year & Department Count */}
        <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-600">
          {data.establishedYear && (
            <span className="flex items-center gap-1">
              📅 {t('hospital.establishedIn')} {data.establishedYear}
            </span>
          )}
          {data.departmentCount > 0 && (
            <span className="flex items-center gap-1">
              🏥 {data.departmentCount} depts
            </span>
          )}
          {data.annualCases > 0 && (
            <span className="flex items-center gap-1">
              👥 {(data.annualCases / 10000).toFixed(1)}万 visits/yr
            </span>
          )}
        </div>

        {/* View More Button - New Style */}
        <div className="mt-auto pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(data.profileLink);
            }}
            className="w-full sm:w-[70%] md:w-[60%] py-2.5 sm:py-3 px-4 sm:px-6 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 bg-gradient-to-r from-[#1DA78A] to-[#0F638E] text-white hover:shadow-lg group"
          >
            View More
            <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HospitalCard;

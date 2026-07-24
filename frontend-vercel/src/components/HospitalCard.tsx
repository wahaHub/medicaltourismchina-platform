
import { ExternalLink, Info, Star, MapPin, Building2, Globe, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import HospitalProgressiveImage from "@/components/HospitalProgressiveImage";
import { useNavigate } from "react-router-dom";
import { Hospital } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface NewHospitalCardProps {
  hospitalData: Hospital & {
    wiki_link?: string;
  };
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

const HospitalCardImage = ({
  src,
  hospitalName,
  photoLabel,
}: {
  src?: string;
  hospitalName: string;
  photoLabel: string;
}) => {
  const imageUrl = src || HOSPITAL_PLACEHOLDER_IMAGE_URL;

  return (
    <div className="relative h-full w-full">
      <HospitalProgressiveImage
        src={imageUrl}
        alt={`${hospitalName} - ${photoLabel} 1`}
        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    </div>
  );
};

export type HospitalOwnership = "public" | "private" | null;

export function resolveHospitalOwnership(value?: string | null): HospitalOwnership {
  const normalized = value?.trim().toLocaleLowerCase();
  if (!normalized) return null;

  if (["公立", "public", "publik"].includes(normalized)) return "public";
  if (["私立", "private", "swasta"].includes(normalized)) return "private";
  return null;
}

export function isClassATertiaryHospital(value?: string | null): boolean {
  const normalized = value?.trim().toLocaleLowerCase().replace(/\s+/g, " ");
  return Boolean(
    normalized
    && [
      "三甲",
      "三级甲等",
      "3a",
      "tingkat 3a",
      "tingkat tiga kelas a",
      "class a tertiary",
      "tertiary class a",
    ].includes(normalized),
  );
}

const INDONESIAN_LOCATION_REPLACEMENTS: Array<[RegExp, string]> = [
  [/北京市?/g, "Beijing"],
  [/上海市?/g, "Shanghai"],
  [/广州市?/g, "Guangzhou"],
  [/深圳市?/g, "Shenzhen"],
  [/成都市?/g, "Chengdu"],
  [/重庆市?/g, "Chongqing"],
];

function localizeHospitalLocationPart(value: string, languageCode: string): string {
  if (languageCode !== "id") return value;

  let localized = value;
  for (const [pattern, replacement] of INDONESIAN_LOCATION_REPLACEMENTS) {
    localized = localized.replace(pattern, replacement);
  }

  return localized
    .replace(/\bChina\b/gi, "Tiongkok")
    .replace(/[，、]+/g, ", ")
    .replace(/\s*,\s*/g, ", ")
    .trim();
}

export function localizeHospitalLocation(
  city: string,
  province: string,
  languageCode: string,
): string {
  const parts = [city, province]
    .map((part) => localizeHospitalLocationPart(part || "", languageCode))
    .flatMap((part) => part.split(","))
    .map((part) => part.trim())
    .filter(Boolean);
  return [...new Set(parts)].join(", ");
}

export function formatAnnualOutpatients(value: number, languageCode: string): string {
  const locale = languageCode === "zh" ? "zh-CN" : languageCode;
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

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
  const { currentLanguage, t } = useLanguage();

  // Check if this is the new hospital format
  const isNewHospitalFormat = 'hospitalData' in props;
  
  // Extract data based on format
  const data = isNewHospitalFormat ? {
    id: props.hospitalData.id,
    name: props.hospitalData.name,
    slug: props.hospitalData.slug,
    is3A: isClassATertiaryHospital(props.hospitalData.tier),
    ownership: resolveHospitalOwnership(props.hospitalData.ownership_type),
    annualCases: props.hospitalData.annual_outpatient_visits || 0,
    image: '/api/placeholder/400/240', // Placeholder for now
    website: props.hospitalData.official_website || '',
    wikiUrl: props.hospitalData.wiki_link || `https://zh.wikipedia.org/wiki/${encodeURIComponent(props.hospitalData.name)}`,
    location: localizeHospitalLocation(
      props.hospitalData.city,
      props.hospitalData.province,
      currentLanguage.code,
    ),
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
    ownership: null as HospitalOwnership,
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
          <HospitalCardImage
            hospitalName={data.name}
            src={props.hospitalData.hero_image_url}
            photoLabel={t("hospital.photo")}
          />
        ) : (
          <HospitalProgressiveImage
            src={data.image}
            alt={data.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        

        
        {/* 3A Hospital Badge - Top Left */}
        {data.is3A && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-lg">
              {t("hospital.tier.3A")}
            </span>
          </div>
        )}
        
        {/* Public/Private Badge - Top Right */}
        {data.ownership && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20">
          <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-lg ${
            data.ownership === "public"
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
          }`}>
            {data.ownership === "public"
              ? `${t("hospital.ownership.public")} 🏛️`
              : `${t("hospital.ownership.private")} 🏢`}
          </span>
          </div>
        )}
        
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
              🏥 {data.departmentCount} {t("hospital.departmentCount")}
            </span>
          )}
          {data.annualCases > 0 && (
            <span className="flex items-center gap-1">
              👥 {formatAnnualOutpatients(data.annualCases, currentLanguage.code)}{" "}
              {t("hospital.annualOutpatients")}
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
            {t("hospital.viewDetails")}
            <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HospitalCard;

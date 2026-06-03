import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteRequestModal from "@/components/QuoteRequestModal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
import { LOW_MEDIA_BASE_URL } from "@/config/media";
import { hospitalApi } from "@/services/api/hospital";
import {
  AIRPORT_SERVICE_LABELS,
  AMENITY_LABELS,
  FOLLOWUP_CARE_LABELS,
  LANGUAGE_LABELS,
  PAYMENT_METHOD_LABELS,
  type HospitalExtended,
} from "@/types/hospital-extended";
import {
  getProcedureCaseDescription,
  getProcedureCaseName,
  getSurgeonBio,
  getSurgeonName,
  getSurgeonSpecialties,
  getSurgeonTitle,
} from "@/utils/i18n-helpers";
import {
  ArrowRight,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  ExternalLink,
  Maximize2,
  Globe,
  HelpCircle,
  MapPin,
  Quote,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  X,
} from "lucide-react";

type Department = {
  id: string;
  name: string;
  shortDesc: string;
  description: string;
  highlights: string[];
};

type Doctor = {
  name: string;
  title: string;
  experience: string;
  bio: string;
  specialty: string;
  image: string;
};

type EquipmentItem = {
  name: string;
  description: string;
  image: string;
};

const EQUIPMENT_PLACEHOLDER_IMAGE_URL = `${LOW_MEDIA_BASE_URL}/root_assets/surgery_placeholder_x2.png`;

type HospitalDetailPayload = HospitalExtended & Record<string, unknown>;

type PackageItem = {
  id: string;
  slug?: string;
  title: string;
  image: string;
  subtitle: string;
  summary: string;
  duration?: string;
  priceLabel?: string;
  tags: string[];
  includes: string[];
};

type ReviewItem = {
  id: string;
  label: string;
  location: string;
  treatment: string;
  title: string;
  comment: string;
  rating?: number;
};

type SuccessCase = {
  id: string;
  title: string;
  summary: string;
  image: string;
  meta: string;
  images: string[];
  providerName: string;
  caseNumber: string;
  patientAge: string;
  patientGender: string;
  procedureName: string;
};

type FaqItem = {
  q: string;
  a: string;
};

const pageFontClass = "font-['Inter',sans-serif]";
const pageShellClass =
  "bg-[linear-gradient(180deg,#f6fcfb_0%,#eef8f7_48%,#f7fbff_100%)]";
const accentTextClass = "text-[#159a90]";
const mutedTextClass = "text-slate-500";
const sectionTitleClass = `${pageFontClass} text-xl font-semibold tracking-wide text-[#159a90]`;
const cardClass =
  "border border-[#d8ece9] bg-white/95 shadow-[0_10px_30px_-18px_rgba(25,118,110,0.35)]";
const gradientButtonClass =
  "bg-gradient-to-r from-[#18a89f] via-[#1c9db3] to-[#3383d1] text-white shadow-[0_16px_40px_-20px_rgba(28,157,179,0.65)] hover:opacity-95";
const tealOutlineBadgeClass =
  "border-[#b8e4e0] bg-[#edf9f7] text-[#159a90]";
const blueOutlineBadgeClass =
  "border-[#c8dbfb] bg-[#f1f7ff] text-[#2f77c7]";
const amberBadgeClass = "border-[#f4d6a0] bg-[#fff7e8] text-[#b7791f]";
const reviewAvatarClass = "bg-[#e6f8f5] text-[#159a90]";

function formatHospitalLocation(hospital: HospitalExtended): string {
  const parts = [hospital.city, hospital.province].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "";
}

function getGoogleMapsUrl(hospital: HospitalExtended): string {
  if (hospital.latitude != null && hospital.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`;
  }

  const query = [hospital.address, hospital.city, hospital.province]
    .filter(Boolean)
    .join(", ");

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function mapHospitalDepartments(hospital: HospitalExtended): Department[] {
  if (hospital.departments_info && hospital.departments_info.length > 0) {
    return hospital.departments_info.map((department) => ({
      id: department.department_slug || department.department_name,
      name: department.department_name,
      shortDesc:
        department.specialty_center_name
        || (department.is_specialty_center ? "Specialty Center" : "Department"),
      description: department.description || "",
      highlights: department.capabilities?.filter(Boolean) || [],
    }));
  }

  if (hospital.core_specialties && hospital.core_specialties.length > 0) {
    return hospital.core_specialties.map((specialty) => ({
      id: specialty.slug || specialty.name,
      name: specialty.name,
      shortDesc: "Core Specialty",
      description: specialty.description || "",
      highlights: specialty.technologies?.filter(Boolean) || [],
    }));
  }

  return [];
}

function coerceString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function coerceStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(coerceString).filter(Boolean);
}

function collectArrayPayload(source: Record<string, unknown>, keys: string[]): unknown[] {
  for (const key of keys) {
    const value = source[key];
    if (Array.isArray(value)) {
      return value;
    }

    if (value && typeof value === "object") {
      const nestedValue = value as Record<string, unknown>;
      for (const nestedKey of ["items", "data", "list", "values"]) {
        const nested = nestedValue[nestedKey];
        if (Array.isArray(nested)) {
          return nested;
        }
      }
    }
  }

  return [];
}

function pickString(source: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
}

function slugifyPackageTitle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolvePackagePathSegment(item: PackageItem): string {
  if (item.slug?.trim()) {
    return item.slug.trim();
  }

  if (item.id.trim()) {
    return item.id.trim();
  }

  return slugifyPackageTitle(item.title);
}

function pickNumber(source: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function normalizeHospitalPackages(hospital: HospitalDetailPayload | null): PackageItem[] {
  if (!hospital) {
    return [];
  }

  const rawPackages = collectArrayPayload(hospital, [
    "packages",
    "recommended_packages",
    "recommendedPackages",
    "package_cards",
    "packageCards",
    "patient_packages",
    "patientPackages",
  ]);

  return rawPackages.flatMap((item, index) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const source = item as Record<string, unknown>;
    const title = pickString(source, ["title", "name", "package_name", "packageName"]);
    const summary = pickString(source, ["summary", "description", "details", "body"]);
    const image = pickString(source, ["image", "image_url", "imageUrl", "thumbnail_url", "thumbnailUrl"]);

    if (!title && !summary && !image) {
      return [];
    }

    return [
      {
        id: pickString(source, ["id", "slug", "package_id", "packageId"]) || `package-${index + 1}`,
        slug: pickString(source, ["slug", "package_slug", "packageSlug"]),
        title: title || "Package",
        subtitle: pickString(source, ["subtitle", "tagline", "short_description", "shortDescription"]),
        image,
        duration: pickString(source, ["duration", "timeline", "stay_duration", "stayDuration"]),
        priceLabel: pickString(source, ["price_label", "priceLabel", "price", "starting_price", "startingPrice"]),
        summary,
        tags: coerceStringArray(
          source.tags || source.highlights || source.features || source.badges || source.categories,
        ),
        includes: coerceStringArray(
          source.includes || source.inclusions || source.items || source.points || source.bullets,
        ),
      },
    ];
  });
}

function normalizeHospitalReviews(hospital: HospitalDetailPayload | null): ReviewItem[] {
  if (!hospital) {
    return [];
  }

  const rawReviews = collectArrayPayload(hospital, [
    "patient_reviews",
    "patientReviews",
    "reviews",
    "testimonials",
    "patient_testimonials",
  ]);

  return rawReviews.flatMap((item, index) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const source = item as Record<string, unknown>;
    const label = pickString(source, ["label", "name", "patient_name", "patientName", "author"]);
    const comment = pickString(source, ["comment", "body", "review", "content", "text"]);
    const title = pickString(source, ["title", "headline", "summary"]);

    if (!label && !comment && !title) {
      return [];
    }

    return [
      {
        id: pickString(source, ["id", "slug", "review_id", "reviewId"]) || `review-${index + 1}`,
        label:
          label
          || pickString(source, ["patient_name", "patientName", "reviewer_name", "reviewerName"])
          || "Patient",
        location: pickString(source, ["location", "country", "from", "origin", "patient_country", "patientCountry"]),
        treatment: pickString(
          source,
          ["treatment", "procedure", "service", "procedure_name", "procedureName", "treatment_name", "treatmentName"],
        ),
        title:
          title
          || pickString(source, ["review_title", "reviewTitle"])
          || "Patient review",
        comment: comment || pickString(source, ["review_comment", "reviewComment"]),
        rating: pickNumber(source, ["rating", "stars", "score"]),
      },
    ];
  });
}

const faqs: FaqItem[] = [
  {
    q: "海外患者来中国就医需要办理什么签证？",
    a: "建议申请医疗或旅游相关签证，医院国际部通常可以协助准备邀请函及基础就医材料。",
  },
  {
    q: "医院是否提供英文/其他语言服务？",
    a: "是的，医院可提供英文服务，并可根据预约情况协助安排其他语言支持。",
  },
  {
    q: "我可以提前在线咨询医生吗？",
    a: "可以，通常会先安排线上初步咨询，再根据病历决定到院检查与治疗流程。",
  },
  {
    q: "费用如何支付？是否支持国际信用卡？",
    a: "通常支持国际信用卡及常见电子支付方式，具体以医院收费与现场支付指引为准。",
  },
];

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center">
    <div className={`${pageFontClass} text-3xl font-bold text-[#159a90]`}>{value}</div>
    <div className={`mt-1 text-xs uppercase tracking-wider text-slate-500 ${pageFontClass}`}>
      {label}
    </div>
  </div>
);

const ReviewStars = ({ value = 0 }: { value?: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-3.5 w-3.5 ${index < value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/25"}`}
      />
    ))}
  </div>
);

const DepartmentDetail = ({ department }: { department: Department }) => (
  <div className={`space-y-3 ${pageFontClass}`}>
    <div>
      <h4 className="text-base font-semibold text-foreground">{department.name}</h4>
      <p className={`mt-0.5 text-xs ${mutedTextClass}`}>{department.shortDesc}</p>
    </div>
    <p className="text-sm leading-relaxed text-foreground/80">{department.description}</p>
    <div className="flex flex-wrap gap-1.5 pt-1">
      {department.highlights.map((highlight) => (
        <Badge
          key={highlight}
          variant="secondary"
          className={`text-[11px] font-normal ${tealOutlineBadgeClass}`}
        >
          {highlight}
        </Badge>
      ))}
    </div>
  </div>
);

const DepartmentItem = ({ department }: { department: Department }) => {
  const isMobile = useIsMobile();
  const trigger = (
    <button
      className={`group flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-[#edf9f7] hover:text-[#159a90] ${pageFontClass}`}
      type="button"
    >
      <span className="flex min-w-0 items-center gap-2">
        <Stethoscope className="h-3.5 w-3.5 shrink-0 text-[#159a90]/80 group-hover:text-[#159a90]" />
        <span className="truncate">{department.name}</span>
      </span>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
    </button>
  );

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent side="left" align="start" className="w-80 shadow-pop">
          <DepartmentDetail department={department} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent side="left" align="start" className="w-96 shadow-pop">
        <DepartmentDetail department={department} />
      </HoverCardContent>
    </HoverCard>
  );
};

export default function HospitalDetail() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [doctorIndex, setDoctorIndex] = useState(0);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState("");
  const [hospitalData, setHospitalData] = useState<HospitalExtended | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const [isDoctorBioExpanded, setIsDoctorBioExpanded] = useState(false);
  const [expandedEquipment, setExpandedEquipment] = useState<Record<string, boolean>>({});
  const [expandedCases, setExpandedCases] = useState<Record<string, boolean>>({});
  const [selectedCaseIndex, setSelectedCaseIndex] = useState<number | null>(null);
  const [promoVideoStatus, setPromoVideoStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [isPromoVideoDismissed, setIsPromoVideoDismissed] = useState(false);
  const [isPromoVideoModalOpen, setIsPromoVideoModalOpen] = useState(false);
  const locale = currentLanguage.apiCode || "zh";
  const labelLocale = currentLanguage.code === "zh" ? "zh" : "en";

  useEffect(() => {
    let isCancelled = false;

    const loadHospital = async () => {
      if (!slug && !id) {
        setHospitalData(null);
        setLoadError("Hospital identifier is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);

        if (!slug && id) {
          const hospitalsResponse = await hospitalApi.getHospitals({
            locale,
            limit: 5000,
            offset: 0,
          });
          const matchedHospital = hospitalsResponse.data.find((hospital) => hospital.id === id);

          if (!matchedHospital?.slug) {
            throw new Error("Hospital not found");
          }

          if (!isCancelled) {
            navigate(`/hospitals/${matchedHospital.slug}`, { replace: true });
          }
          return;
        }

        const response = await hospitalApi.getHospitalExtendedBySlug(slug, locale);
        if (!isCancelled) {
          setHospitalData(response.data);
        }
      } catch (error) {
        console.error("Failed to load hospital detail data:", error);
        if (!isCancelled) {
          setHospitalData(null);
          setLoadError("Failed to load hospital detail data.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadHospital();

    return () => {
      isCancelled = true;
    };
  }, [id, locale, navigate, slug]);

  useEffect(() => {
    setGalleryIndex(0);
    setDoctorIndex(0);
    setIsOverviewExpanded(false);
    setIsDoctorBioExpanded(false);
    setExpandedEquipment({});
    setExpandedCases({});
    setSelectedCaseIndex(null);
    setSelectedProcedure("");
    setIsQuoteModalOpen(false);
    setIsPromoVideoModalOpen(false);
  }, [id, slug]);

  const liveHospital = useMemo(() => {
    if (!hospitalData) {
      return null;
    }

    return {
      name: hospitalData.name,
      city: formatHospitalLocation(hospitalData),
      tier: hospitalData.tier,
      ownership: hospitalData.ownership_type,
      rating: hospitalData.tier || "",
      type: hospitalData.hospital_type,
      address: hospitalData.address || "",
      beds: hospitalData.bed_count,
      staff: hospitalData.staff_count,
      specialists:
        hospitalData.surgeons && hospitalData.surgeons.length > 0
          ? `${hospitalData.surgeons.length}+`
          : "",
      patientsPerYear:
        hospitalData.patients_served_annually != null
          ? hospitalData.patients_served_annually.toString()
          : "",
      followUp:
        hospitalData.followup_care && hospitalData.followup_care.length > 0
          ? hospitalData.followup_care
              .map((item) => FOLLOWUP_CARE_LABELS[item]?.[labelLocale] || item)
              .join(" · ")
          : "",
      languages:
        hospitalData.supported_languages && hospitalData.supported_languages.length > 0
          ? hospitalData.supported_languages.map(
              (item) => LANGUAGE_LABELS[item]?.[labelLocale] || item,
            )
          : [],
      website: hospitalData.official_website || "",
      googleMapsUrl: getGoogleMapsUrl(hospitalData),
      heroImage: hospitalData.hero_image_url || "",
      overview:
        hospitalData.overview
        || hospitalData.full_description
        || hospitalData.short_description
        || "",
    };
  }, [hospitalData, labelLocale]);

  const liveDepartments = useMemo(
    () => (hospitalData ? mapHospitalDepartments(hospitalData) : []),
    [hospitalData],
  );
  const liveMedicalTeam = useMemo<Doctor[]>(() => {
    if (!hospitalData?.surgeons || hospitalData.surgeons.length === 0) {
      return [];
    }

    return hospitalData.surgeons.map((surgeon) => ({
      name: getSurgeonName(surgeon, locale) || surgeon.name,
      title: getSurgeonTitle(surgeon, locale) || surgeon.title || "",
      experience: surgeon.experience_years ? `${surgeon.experience_years}+ years experience` : "",
      bio:
        getSurgeonBio(surgeon, locale, "intro")
        || getSurgeonBio(surgeon, locale, "expertise")
        || getSurgeonBio(surgeon, locale, "philosophy")
        || "",
      specialty:
        getSurgeonSpecialties(surgeon, locale).filter(Boolean).join(", ")
        || "",
      image:
        surgeon.images?.profile
        || surgeon.images?.hero
        || surgeon.image_url
        || "",
    }));
  }, [hospitalData, locale]);
  const currentDoctor = liveMedicalTeam[Math.min(doctorIndex, Math.max(liveMedicalTeam.length - 1, 0))] || null;
  const internationalServices = useMemo(() => {
    const airportServices =
      hospitalData?.airport_services?.map((item) => AIRPORT_SERVICE_LABELS[item]?.[labelLocale] || item) || [];
    const followUp =
      hospitalData?.followup_care?.map((item) => FOLLOWUP_CARE_LABELS[item]?.[labelLocale] || item) || [];
    const amenities =
      hospitalData?.amenities?.map((item) => AMENITY_LABELS[item]?.[labelLocale] || item) || [];
    const paymentMethods =
      hospitalData?.payment_methods?.map((item) => PAYMENT_METHOD_LABELS[item]?.[labelLocale] || item) || [];

    return {
      languages: liveHospital?.languages || [],
      followUp,
      airportServices,
      amenities,
      paymentMethods,
    };
  }, [hospitalData, labelLocale, liveHospital]);
  const liveGallery = useMemo<string[]>(() => {
    const urls = hospitalData?.gallery?.map((item) => item.url).filter((value): value is string => Boolean(value)) || [];

    return urls;
  }, [hospitalData]);
  const liveEquipment = useMemo<EquipmentItem[]>(() => {
    if (!hospitalData?.equipment || hospitalData.equipment.length === 0) {
      return [];
    }

    return hospitalData.equipment.map((item) => ({
      name: item.name,
      description: item.description || "",
      image: item.image_url || "",
    }));
  }, [hospitalData]);
  const liveSuccessCases = useMemo<SuccessCase[]>(() => {
    if (!hospitalData?.procedure_cases || hospitalData.procedure_cases.length === 0) {
      return [];
    }

    return hospitalData.procedure_cases.slice(0, 3).map((caseItem, index) => ({
      id: caseItem.id,
      title:
        getProcedureCaseName(caseItem, locale)
        || caseItem.procedure_name
        || `Case ${index + 1}`,
      summary:
        getProcedureCaseDescription(caseItem, locale)
        || caseItem.description
        || "",
      image: caseItem.image_urls?.[0] || "",
      meta:
        caseItem.provider_name
        || caseItem.case_number
        || "",
      images: caseItem.image_urls?.filter((value): value is string => Boolean(value)) || [],
      providerName: caseItem.provider_name || "",
      caseNumber: caseItem.case_number || "",
      patientAge: caseItem.patient_age || "",
      patientGender: caseItem.patient_gender || "",
      procedureName:
        getProcedureCaseName(caseItem, locale)
        || caseItem.procedure_name
        || "",
    }));
  }, [hospitalData, locale]);
  const livePackages = useMemo(
    () => normalizeHospitalPackages(hospitalData as HospitalDetailPayload | null),
    [hospitalData],
  );
  const liveReviews = useMemo(
    () => normalizeHospitalReviews(hospitalData as HospitalDetailPayload | null),
    [hospitalData],
  );
  const ratedReviews = useMemo(
    () => liveReviews.filter((review) => review.rating != null),
    [liveReviews],
  );
  const averageReviewRating = useMemo(() => {
    const ratings = ratedReviews
      .map((review) => review.rating)
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

    if (ratings.length === 0) {
      return null;
    }

    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }, [ratedReviews]);
  const selectedCase =
    selectedCaseIndex != null && liveSuccessCases[selectedCaseIndex]
      ? liveSuccessCases[selectedCaseIndex]
      : null;
  const promotionalVideoUrl = useMemo(
    () => hospitalData?.promotional_videos?.find((value): value is string => Boolean(value)) || null,
    [hospitalData],
  );
  const shouldShowOverviewToggle = (liveHospital?.overview?.length || 0) > 320;

  useEffect(() => {
    if (doctorIndex >= liveMedicalTeam.length) {
      setDoctorIndex(0);
    }
  }, [doctorIndex, liveMedicalTeam.length]);

  useEffect(() => {
    setIsDoctorBioExpanded(false);
  }, [doctorIndex]);

  useEffect(() => {
    if (galleryIndex >= liveGallery.length) {
      setGalleryIndex(0);
    }
  }, [galleryIndex, liveGallery.length]);

  useEffect(() => {
    if (selectedCaseIndex != null && selectedCaseIndex >= liveSuccessCases.length) {
      setSelectedCaseIndex(liveSuccessCases.length > 0 ? 0 : null);
    }
  }, [liveSuccessCases.length, selectedCaseIndex]);

  useEffect(() => {
    if (selectedCaseIndex == null || liveSuccessCases.length <= 1) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSelectedCaseIndex((current) =>
          current == null
            ? 0
            : (current - 1 + liveSuccessCases.length) % liveSuccessCases.length,
        );
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setSelectedCaseIndex((current) =>
          current == null ? 0 : (current + 1) % liveSuccessCases.length,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [liveSuccessCases.length, selectedCaseIndex]);

  useEffect(() => {
    setPromoVideoStatus(promotionalVideoUrl ? "loading" : "idle");
    setIsPromoVideoDismissed(false);
  }, [promotionalVideoUrl]);

  const openQuoteModal = (procedureName = "") => {
    setSelectedProcedure(procedureName || liveHospital?.name || "");
    setIsQuoteModalOpen(true);
  };
  const shouldShowDoctorBioToggle = (currentDoctor?.bio.length || 0) > 220;

  if (isLoading) {
    return (
      <div className={`min-h-screen ${pageShellClass} ${pageFontClass}`}>
        <TopBanner />
        <Header />
        <main className={`min-h-screen ${pageShellClass}`}>
          <div className="container py-12">
            <Card className={`p-8 ${cardClass}`}>
              <h1 className={`${pageFontClass} text-2xl font-semibold text-foreground`}>Loading hospital details...</h1>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loadError || !liveHospital) {
    return (
      <div className={`min-h-screen ${pageShellClass} ${pageFontClass}`}>
        <TopBanner />
        <Header />
        <main className={`min-h-screen ${pageShellClass}`}>
          <div className="container py-12">
            <Card className={`p-8 ${cardClass}`}>
              <h1 className={`${pageFontClass} text-2xl font-semibold text-foreground`}>Hospital detail unavailable</h1>
              <p className={`mt-3 text-sm ${mutedTextClass}`}>{loadError || "We couldn't load this hospital's data."}</p>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${pageShellClass} ${pageFontClass}`}>
      <TopBanner />
      <Header />

      <main className={`min-h-screen ${pageShellClass}`}>
        <header className="relative h-[44vh] min-h-[340px] w-full overflow-hidden">
          {liveHospital.heroImage ? (
            <img
              src={liveHospital.heroImage}
              alt={`${liveHospital.name} exterior`}
              className="absolute inset-0 h-full w-full object-cover"
              width={1920}
              height={800}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/40 to-foreground/10" />
          <div className="container relative flex h-full flex-col justify-end pb-8">
            <div className="mb-3 flex gap-2">
              {liveHospital.rating ? (
                <Badge className="border-0 bg-[#18a89f] text-white hover:bg-[#159a90]">
                  {liveHospital.rating}
                </Badge>
              ) : null}
              {liveHospital.type ? (
                <Badge variant="secondary" className={blueOutlineBadgeClass}>
                  {liveHospital.type}
                </Badge>
              ) : null}
            </div>
            <h1 className={`${pageFontClass} text-3xl font-bold tracking-tight text-background md:text-5xl`}>
              {liveHospital.name}
            </h1>
            <p className={`mt-1 text-sm text-background/80 md:text-base ${pageFontClass}`}>
              {liveHospital.city}
            </p>
          </div>
        </header>

        <div className="container grid gap-8 py-8 md:py-12 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 space-y-10">
            <Card className={`p-6 md:p-8 ${cardClass}`}>
              <div>
                <h2 className={`mb-4 ${sectionTitleClass}`}>HOSPITAL PHOTOS</h2>
                {liveGallery.length > 0 ? (
                  <>
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
                      <img
                        src={liveGallery[galleryIndex]}
                        alt={`${liveHospital.name} photo ${galleryIndex + 1}`}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                      <button
                        aria-label="Previous photo"
                        className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 shadow-[0_10px_24px_-14px_rgba(25,118,110,0.55)] backdrop-blur transition hover:bg-white"
                        onClick={() =>
                          setGalleryIndex((index) => (index - 1 + liveGallery.length) % liveGallery.length)
                        }
                        type="button"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        aria-label="Next photo"
                        className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 shadow-[0_10px_24px_-14px_rgba(25,118,110,0.55)] backdrop-blur transition hover:bg-white"
                        onClick={() => setGalleryIndex((index) => (index + 1) % liveGallery.length)}
                        type="button"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {liveGallery.map((src, index) => (
                        <button
                          key={src}
                          className={`aspect-[4/3] overflow-hidden rounded-md border-2 transition ${
                            index === galleryIndex
                              ? "border-[#159a90]"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                          onClick={() => setGalleryIndex(index)}
                          type="button"
                        >
                          <img
                            src={src}
                            alt={`thumbnail ${index + 1}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={`rounded-xl border border-dashed border-[#d8ece9] bg-[#f8fcfb] p-8 text-sm ${mutedTextClass}`}>
                    No hospital photos available.
                  </div>
                )}
              </div>
            </Card>

            <section>
              <h2 className={`mb-4 ${sectionTitleClass}`}>OVERVIEW</h2>
              <Card className={`p-6 md:p-8 ${cardClass}`}>
                <div className="space-y-4">
                  <p
                    className={`leading-relaxed text-foreground/80 ${pageFontClass} ${
                      isOverviewExpanded ? "" : "line-clamp-5"
                    }`}
                  >
                    {liveHospital.overview}
                  </p>
                  {shouldShowOverviewToggle && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={tealOutlineBadgeClass}
                      onClick={() => setIsOverviewExpanded((value) => !value)}
                    >
                      {isOverviewExpanded ? "Show Less" : "Read More"}
                    </Button>
                  )}
                </div>
                <div className="mt-6 grid max-w-md grid-cols-2 gap-4 border-t border-[#dcefee] pt-6">
                  {liveHospital.specialists ? <Stat label="Specialists" value={liveHospital.specialists} /> : null}
                  {liveHospital.patientsPerYear ? <Stat label="Patients/Yr" value={liveHospital.patientsPerYear} /> : null}
                </div>
              </Card>
            </section>

            {currentDoctor ? (
              <Card className={`p-6 md:p-8 ${cardClass}`}>
                <section>
                  <h2 className={`mb-4 ${sectionTitleClass}`}>MEDICAL TEAM</h2>
                  <div className="grid items-start gap-6 md:grid-cols-[280px_1fr]">
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#e8f7f5] shadow-[0_14px_34px_-22px_rgba(25,118,110,0.55)]">
                      {currentDoctor.image ? (
                        <img
                          src={currentDoctor.image}
                          alt={currentDoctor.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-sm text-slate-500">
                          No doctor photo
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h3 className={`${pageFontClass} text-2xl font-bold text-foreground`}>
                          {currentDoctor.name}
                        </h3>
                        {currentDoctor.title ? (
                          <p className={`${pageFontClass} font-medium text-[#159a90]`}>
                            {currentDoctor.title}
                          </p>
                        ) : null}
                        {currentDoctor.experience ? (
                          <p className={`${pageFontClass} text-sm ${mutedTextClass}`}>
                            {currentDoctor.experience}
                          </p>
                        ) : null}
                      </div>
                      {currentDoctor.bio ? (
                        <div className="space-y-3">
                          <p
                            className={`${pageFontClass} text-sm leading-relaxed text-foreground/80 ${
                              isDoctorBioExpanded ? "" : "line-clamp-5"
                            }`}
                          >
                            {currentDoctor.bio}
                          </p>
                          {shouldShowDoctorBioToggle && (
                            <Button
                              variant="outline"
                              size="sm"
                              className={tealOutlineBadgeClass}
                              onClick={() => setIsDoctorBioExpanded((value) => !value)}
                            >
                              {isDoctorBioExpanded ? "Show Less" : "Read More"}
                            </Button>
                          )}
                        </div>
                      ) : null}
                      {currentDoctor.specialty ? (
                        <div className="pt-2">
                          <p className={`mb-1 text-[11px] uppercase tracking-wider ${mutedTextClass} ${pageFontClass}`}>
                            Specialty
                          </p>
                          <p className={`${pageFontClass} text-sm text-foreground`}>
                            {currentDoctor.specialty}
                          </p>
                        </div>
                      ) : null}
                      <div className="flex items-center gap-3 pt-3">
                        <button
                          aria-label="Previous doctor"
                          className="grid h-9 w-9 place-items-center rounded-full border transition hover:bg-muted"
                          onClick={() =>
                            setDoctorIndex((index) => (index - 1 + liveMedicalTeam.length) % liveMedicalTeam.length)
                          }
                          type="button"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className={`${pageFontClass} tabular-nums text-sm ${mutedTextClass}`}>
                          {String(doctorIndex + 1).padStart(2, "0")} /{" "}
                          {String(liveMedicalTeam.length).padStart(2, "0")}
                        </span>
                        <button
                          aria-label="Next doctor"
                          className="grid h-9 w-9 place-items-center rounded-full border transition hover:bg-muted"
                          onClick={() => setDoctorIndex((index) => (index + 1) % liveMedicalTeam.length)}
                          type="button"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {liveMedicalTeam.map((doctor, index) => (
                      <button
                        key={doctor.name}
                        aria-label={doctor.name}
                        className={`h-14 w-14 overflow-hidden rounded-full border-2 transition ${
                          index === doctorIndex
                            ? "scale-105 border-[#159a90]"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                        onClick={() => setDoctorIndex(index)}
                        type="button"
                      >
                        {doctor.image ? (
                          <img
                            src={doctor.image}
                            alt={doctor.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-[#e8f7f5] text-[10px] text-slate-500">
                            MD
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              </Card>
            ) : null}

            {liveSuccessCases.length > 0 ? (
              <section>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <h2 className={`flex items-center gap-2 ${sectionTitleClass}`}>
                      <Sparkles className="h-5 w-5" /> SUCCESS CASES
                    </h2>
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {liveSuccessCases.map((item) => (
                    <Card key={item.id} className={`overflow-hidden ${cardClass}`}>
                      <div
                        role="button"
                        tabIndex={0}
                        className="flex h-full w-full flex-col text-left"
                        onClick={() => setSelectedCaseIndex(liveSuccessCases.findIndex((caseItem) => caseItem.id === item.id))}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedCaseIndex(liveSuccessCases.findIndex((caseItem) => caseItem.id === item.id));
                          }
                        }}
                      >
                        <div className="aspect-[4/3] overflow-hidden bg-muted">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        <div className="flex h-full flex-col p-5">
                          {item.meta ? (
                            <Badge variant="secondary" className={`mb-3 w-fit ${amberBadgeClass}`}>
                              {item.meta}
                            </Badge>
                          ) : null}
                          <h3 className={`${pageFontClass} text-base font-semibold text-foreground`}>
                            {item.title}
                          </h3>
                          {item.summary ? (
                            <div className="mt-2 space-y-3">
                              <p
                                className={`${pageFontClass} min-h-[4.5rem] text-sm leading-relaxed text-foreground/75 ${
                                  expandedCases[item.id] ? "" : "line-clamp-3"
                                }`}
                              >
                                {item.summary}
                              </p>
                              {item.summary.length > 140 ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={tealOutlineBadgeClass}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setExpandedCases((current) => ({
                                      ...current,
                                      [item.id]: !current[item.id],
                                    }));
                                  }}
                                >
                                  {expandedCases[item.id] ? "Show Less" : "Read More"}
                                </Button>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ) : null}

            {livePackages.length > 0 ? (
              <section id="packages">
                <div className="mb-4 flex items-end justify-between">
                  <h2 className={sectionTitleClass}>RECOMMENDED PACKAGES</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {livePackages.map((item) => (
                    <Link
                      key={item.id}
                      to={`/hospitals/${slug}/packages/${resolvePackagePathSegment(item)}`}
                      className="block"
                    >
                      <Card
                        className={`flex h-full flex-col overflow-hidden transition-shadow hover:shadow-[0_18px_42px_-22px_rgba(28,157,179,0.48)] ${cardClass}`}
                      >
                        <div className="relative h-44 overflow-hidden bg-[#f8fcfb]">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className={`grid h-full w-full place-items-center text-sm ${mutedTextClass}`}>
                              Package image unavailable
                            </div>
                          )}
                          {item.tags.length > 0 ? (
                            <div className="absolute left-2 top-2 flex max-w-[85%] flex-wrap gap-1">
                              {item.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className={`text-[10px] font-medium backdrop-blur-sm ${tealOutlineBadgeClass}`}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className={`${pageFontClass} line-clamp-2 font-semibold leading-snug text-foreground`}>
                            {item.title}
                          </h3>
                          {item.subtitle ? (
                            <p className={`mt-1 line-clamp-2 text-xs ${mutedTextClass} ${pageFontClass}`}>
                              {item.subtitle}
                            </p>
                          ) : null}
                          {item.summary ? (
                            <p className={`mt-3 text-sm leading-relaxed text-foreground/75 ${pageFontClass}`}>
                              {item.summary}
                            </p>
                          ) : null}
                          {item.tags.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {item.tags.map((tag, index) => (
                                <span
                                  key={tag}
                                  className={`rounded-full border px-2 py-0.5 text-[10px] ${pageFontClass} ${
                                    index % 3 === 0
                                      ? tealOutlineBadgeClass
                                      : index % 3 === 1
                                        ? blueOutlineBadgeClass
                                        : amberBadgeClass
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          {item.includes.length > 0 ? (
                            <div className="mt-4 space-y-2 border-t pt-4">
                              {item.includes.map((inclusion) => (
                                <div
                                  key={inclusion}
                                  className={`flex items-start gap-2 text-xs leading-relaxed text-foreground/70 ${pageFontClass}`}
                                >
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#18a89f]" />
                                  <span>{inclusion}</span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                          {item.duration || item.priceLabel ? (
                            <div className="mt-4 flex items-center justify-between border-t pt-4">
                              {item.duration ? (
                                <div className={`flex items-center gap-1 text-xs ${mutedTextClass} ${pageFontClass}`}>
                                  <Clock className="h-3.5 w-3.5" /> {item.duration}
                                </div>
                              ) : <span />}
                              {item.priceLabel ? (
                                <div className={`flex items-center gap-1 font-bold text-[#159a90] ${pageFontClass}`}>
                                  <DollarSign className="h-3.5 w-3.5" />
                                  <span>{item.priceLabel}</span>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                          <span
                            className={`mt-4 inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-white ${gradientButtonClass}`}
                          >
                            View Details <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {liveEquipment.length > 0 ? (
              <section>
                <h2 className={`mb-4 ${sectionTitleClass}`}>ADVANCED EQUIPMENT</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  {liveEquipment.map((item) => (
                    <Card
                      key={item.name}
                      className={`overflow-hidden transition-shadow hover:shadow-[0_18px_42px_-22px_rgba(28,157,179,0.48)] ${cardClass}`}
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-muted">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = EQUIPMENT_PLACEHOLDER_IMAGE_URL;
                            }}
                          />
                        ) : null}
                      </div>
                      <div className="p-5">
                        <h3 className={`${pageFontClass} mb-2 font-semibold text-foreground`}>
                          {item.name}
                        </h3>
                        {item.description ? (
                          <div className="space-y-3">
                            <p
                              className={`${pageFontClass} min-h-[4.5rem] text-sm leading-relaxed text-foreground/75 ${
                                expandedEquipment[item.name] ? "" : "line-clamp-3"
                              }`}
                            >
                              {item.description}
                            </p>
                            {item.description.length > 140 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className={tealOutlineBadgeClass}
                                onClick={() =>
                                  setExpandedEquipment((current) => ({
                                    ...current,
                                    [item.name]: !current[item.name],
                                  }))
                                }
                              >
                                {expandedEquipment[item.name] ? "Show Less" : "Read More"}
                              </Button>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ) : null}

            {liveReviews.length > 0 ? (
              <section id="reviews">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                  <h2 className={sectionTitleClass}>PATIENT REVIEWS</h2>
                </div>

                <div className="grid gap-5 md:grid-cols-[280px_1fr]">
                  <Card className={`h-fit p-6 ${cardClass}`}>
                    <div className="border-b pb-4 text-center">
                      <div className={`${pageFontClass} text-xs uppercase tracking-[0.18em] ${mutedTextClass}`}>
                        Verified Reviews
                      </div>
                      {averageReviewRating != null ? (
                        <>
                          <div className={`${pageFontClass} mt-2 text-5xl font-bold text-[#159a90]`}>
                            {averageReviewRating.toFixed(1)}
                          </div>
                          <div className="mt-2 flex justify-center">
                            <ReviewStars value={Math.round(averageReviewRating)} />
                          </div>
                        </>
                      ) : (
                        <div className={`${pageFontClass} mt-2 text-4xl font-bold text-[#159a90]`}>
                          {liveReviews.length}
                        </div>
                      )}
                      <div className={`mt-2 text-xs ${mutedTextClass} ${pageFontClass}`}>
                        {liveReviews.length} verified patient review{liveReviews.length === 1 ? "" : "s"}
                      </div>
                    </div>
                    {ratedReviews.length > 0 ? (
                      <div className="mt-4 space-y-2">
                        {ratedReviews.map((review, index) => (
                          <div key={`${review.id}-rating-${index}`} className={`flex items-center gap-2 text-xs ${pageFontClass}`}>
                            <span className={`w-3 ${mutedTextClass}`}>{review.rating}</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-amber-400"
                                style={{ width: `${Math.max(0, Math.min(review.rating ?? 0, 5)) * 20}%` }}
                              />
                            </div>
                            <span className={`w-12 text-right ${mutedTextClass}`}>
                              {review.location || "review"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </Card>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {liveReviews.map((review) => (
                      <Card
                        key={review.id}
                        className={`flex flex-col p-5 transition-shadow hover:shadow-[0_18px_42px_-22px_rgba(28,157,179,0.48)] ${cardClass}`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={reviewAvatarClass}>
                              {(review.label || "Patient")
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className={`${pageFontClass} truncate text-sm font-semibold`}>
                              {review.label}
                            </div>
                            {review.location ? (
                              <div className={`${pageFontClass} text-xs ${mutedTextClass}`}>
                                {review.location}
                              </div>
                            ) : null}
                          </div>
                          {review.rating != null ? <ReviewStars value={review.rating} /> : null}
                        </div>

                        {review.treatment ? (
                          <Badge
                            variant="secondary"
                            className={`mt-3 w-fit text-[10px] font-normal ${pageFontClass} ${blueOutlineBadgeClass}`}
                          >
                            {review.treatment}
                          </Badge>
                        ) : null}

                        {review.title ? (
                          <h3 className={`${pageFontClass} mt-3 text-sm font-semibold`}>
                            {review.title}
                          </h3>
                        ) : null}
                        {review.comment ? (
                          <p className={`mt-2 flex flex-1 gap-2 text-sm leading-relaxed text-foreground/75 ${pageFontClass}`}>
                            <Quote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                            <span>{review.comment}</span>
                          </p>
                        ) : null}
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            <section id="faq">
              <div className="mb-4">
                <h2 className={`flex items-center gap-2 ${sectionTitleClass}`}>
                  <HelpCircle className="h-5 w-5" /> FREQUENTLY ASKED QUESTIONS
                </h2>
                <p className={`mt-1 text-sm ${mutedTextClass} ${pageFontClass}`}>
                  海外患者关心的常见问题
                </p>
              </div>
              <Card className={`p-2 md:p-4 ${cardClass}`}>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((item, index) => (
                    <AccordionItem
                      key={item.q}
                      value={`item-${index}`}
                      className="border-b last:border-0"
                    >
                      <AccordionTrigger className={`px-3 text-left text-sm font-medium hover:text-[#159a90] md:text-base ${pageFontClass}`}>
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className={`px-3 text-sm leading-relaxed text-foreground/75 ${pageFontClass}`}>
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </section>
          </div>

          <aside className="space-y-5 self-start lg:sticky lg:top-6">
            <Card className={`p-5 ${cardClass}`}>
              <h3 className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] ${mutedTextClass} ${pageFontClass}`}>
                Hospital Information
              </h3>
              <dl className={`space-y-2.5 text-xs ${pageFontClass}`}>
                <div className="flex justify-between gap-3">
                  <dt className={mutedTextClass}>Tier</dt>
                  <dd className="text-right font-medium text-foreground">{liveHospital.tier || "Unavailable"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className={mutedTextClass}>Ownership</dt>
                  <dd className="text-right font-medium text-foreground">{liveHospital.ownership || "Unavailable"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className={`flex items-center gap-1 ${mutedTextClass}`}>
                    <BedDouble className="h-3 w-3" /> Bed Count
                  </dt>
                  <dd className="text-right font-medium text-foreground">{liveHospital.beds ?? "Unavailable"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className={`flex items-center gap-1 ${mutedTextClass}`}>
                    <Users className="h-3 w-3" /> Staff Count
                  </dt>
                  <dd className="text-right font-medium text-foreground">{liveHospital.staff ?? "Unavailable"}</dd>
                </div>
                <div className="border-t pt-2">
                  <dt className={`mb-1 flex items-center gap-1.5 ${mutedTextClass}`}>
                    <MapPin className="h-3 w-3" /> Address
                  </dt>
                  <dd className="leading-relaxed text-foreground">{liveHospital.address || "Unavailable"}</dd>
                </div>
              </dl>
              {liveHospital.googleMapsUrl ? (
                <Button asChild size="sm" variant="outline" className={`mt-4 w-full ${tealOutlineBadgeClass}`}>
                  <a href={liveHospital.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin className="mr-1.5 h-3.5 w-3.5" />
                    Google Maps
                  </a>
                </Button>
              ) : null}
            </Card>

            <section aria-labelledby="dept-heading">
              <div className="mb-2 flex items-baseline justify-between">
                <h3
                  id="dept-heading"
                  className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${mutedTextClass} ${pageFontClass}`}
                >
                  Departments 科室
                </h3>
                <span className={`text-[11px] ${mutedTextClass} ${pageFontClass}`}>
                  {liveDepartments.length}
                </span>
              </div>
              <p className={`mb-2 text-[11px] leading-relaxed text-slate-500/90 ${pageFontClass}`}>
                Hover on desktop or tap on mobile for department details
              </p>
              {liveDepartments.length > 0 ? (
                <div className="rounded-lg border border-[#d8ece9] bg-white/85 p-1 backdrop-blur">
                  {liveDepartments.map((department) => (
                    <DepartmentItem key={department.id} department={department} />
                  ))}
                </div>
              ) : (
                <div className={`rounded-lg border border-dashed border-[#d8ece9] bg-[#f8fcfb] p-4 text-xs ${mutedTextClass}`}>
                  No department data available.
                </div>
              )}
            </section>

            <Card className={`p-5 ${cardClass}`}>
              <h3 className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] ${mutedTextClass} ${pageFontClass}`}>
                International Services
              </h3>
              <div className={`mb-1 text-[11px] ${mutedTextClass} ${pageFontClass}`}>LANGUAGES</div>
              <div className="mb-3 flex flex-wrap gap-2">
                {internationalServices.languages.map((language) => (
                  <Badge
                    key={language}
                    variant="outline"
                    className={`text-xs font-normal ${pageFontClass} ${tealOutlineBadgeClass}`}
                  >
                    <Globe className="mr-1 h-3 w-3" /> {language}
                  </Badge>
                ))}
              </div>
              <div className={`mb-1 text-[11px] ${mutedTextClass} ${pageFontClass}`}>FOLLOW-UP CARE</div>
              <div className="mb-3 flex flex-wrap gap-2">
                {internationalServices.followUp.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className={`text-xs font-normal ${pageFontClass} ${blueOutlineBadgeClass}`}
                  >
                    {item}
                  </Badge>
                ))}
              </div>
              {internationalServices.airportServices.length > 0 && (
                <>
                  <div className={`mb-1 text-[11px] ${mutedTextClass} ${pageFontClass}`}>AIRPORT SERVICES</div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {internationalServices.airportServices.map((item) => (
                      <Badge key={item} variant="outline" className={`text-xs font-normal ${pageFontClass} ${amberBadgeClass}`}>
                        {item}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
              {internationalServices.amenities.length > 0 && (
                <>
                  <div className={`mb-1 text-[11px] ${mutedTextClass} ${pageFontClass}`}>AMENITIES</div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {internationalServices.amenities.map((item) => (
                      <Badge key={item} variant="outline" className={`text-xs font-normal ${pageFontClass} ${tealOutlineBadgeClass}`}>
                        {item}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
              {internationalServices.paymentMethods.length > 0 && (
                <>
                  <div className={`mb-1 text-[11px] ${mutedTextClass} ${pageFontClass}`}>PAYMENT METHODS</div>
                  <div className="flex flex-wrap gap-2">
                    {internationalServices.paymentMethods.slice(0, 4).map((item) => (
                      <Badge key={item} variant="outline" className={`text-xs font-normal ${pageFontClass} ${tealOutlineBadgeClass}`}>
                        {item}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </Card>

            <Button
              size="lg"
              className={`w-full transition-opacity ${gradientButtonClass}`}
              onClick={() => openQuoteModal()}
            >
              Get Free Quote
            </Button>
          </aside>
        </div>
      </main>

      <Footer />

      {promotionalVideoUrl && promoVideoStatus === "loading" ? (
        <video
          key={promotionalVideoUrl}
          src={promotionalVideoUrl}
          className="hidden"
          muted
          playsInline
          preload="metadata"
          onCanPlay={() => setPromoVideoStatus("ready")}
          onError={() => setPromoVideoStatus("error")}
        />
      ) : null}

      {promotionalVideoUrl && promoVideoStatus === "ready" && !isPromoVideoDismissed ? (
        <div className="pointer-events-none fixed bottom-5 right-4 z-40 hidden w-[min(504px,calc(100vw-2rem))] 2xl:w-[min(532px,calc(100vw-2rem))] xl:block">
          <Card className={`pointer-events-auto overflow-hidden border-[#9ed7d2] bg-white/95 shadow-[0_22px_50px_-24px_rgba(21,154,144,0.6)] backdrop-blur ${cardClass}`}>
            <div className="flex items-center justify-between border-b border-[#d8ece9] px-4 py-3">
              <div className="min-w-0">
                <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] text-[#159a90] ${pageFontClass}`}>
                  Hospital Promo Video
                </p>
                <p className={`truncate text-xs ${mutedTextClass} ${pageFontClass}`}>
                  {liveHospital.name}
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={tealOutlineBadgeClass}
                  onClick={() => setIsPromoVideoModalOpen(true)}
                >
                  <Maximize2 className="mr-1.5 h-3.5 w-3.5" />
                  Expand
                </Button>
                <button
                  type="button"
                  aria-label="Dismiss promotional video"
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => setIsPromoVideoDismissed(true)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="bg-slate-950">
              <video
                key={`panel-${promotionalVideoUrl}`}
                src={promotionalVideoUrl}
                className="aspect-video w-full bg-slate-950 object-cover"
                controls
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            </div>
          </Card>
        </div>
      ) : null}

      <Dialog open={isPromoVideoModalOpen} onOpenChange={setIsPromoVideoModalOpen}>
        <DialogContent className="max-h-[92vh] max-w-[min(770px,92vw)] overflow-hidden border-[#cfe9e6] bg-[linear-gradient(180deg,#f8fcfb_0%,#f3fbfa_45%,#ffffff_100%)] p-0 shadow-[0_30px_80px_-30px_rgba(21,154,144,0.45)] sm:rounded-[24px]">
          {promotionalVideoUrl ? (
            <div className={`${pageFontClass} overflow-hidden`}>
              <div className="border-b border-[#d8ece9] px-6 pb-4 pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#159a90]">
                  Hospital Promo Video
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {liveHospital.name}
                </h3>
                <p className={`mt-2 text-sm ${mutedTextClass}`}>
                  Enlarged playback view for the hospital promotional video.
                </p>
              </div>
              <div className="bg-slate-950 p-4 sm:p-6">
                <video
                  key={`modal-${promotionalVideoUrl}`}
                  src={promotionalVideoUrl}
                  className="aspect-video w-full rounded-[18px] bg-slate-950 object-cover shadow-[0_18px_42px_-22px_rgba(15,23,42,0.7)]"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedCaseIndex != null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCaseIndex(null);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden border-[#cfe9e6] bg-[linear-gradient(180deg,#f8fcfb_0%,#f3fbfa_45%,#ffffff_100%)] p-0 shadow-[0_30px_80px_-30px_rgba(21,154,144,0.45)] sm:rounded-[24px]">
          {selectedCase ? (
            <div className={`${pageFontClass} grid max-h-[92vh] overflow-hidden lg:grid-cols-[1.15fr_0.85fr]`}>
              <div className="relative border-b border-[#d8ece9] bg-[#e8f7f5] lg:border-b-0 lg:border-r">
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 lg:aspect-auto lg:h-full lg:min-h-[560px]">
                  {selectedCase.image ? (
                    <img
                      src={selectedCase.image}
                      alt={selectedCase.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-sm text-slate-500">
                      No case image
                    </div>
                  )}
                </div>
                {liveSuccessCases.length > 1 ? (
                  <>
                    <button
                      type="button"
                      aria-label="Previous success case"
                      className="absolute left-4 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-700 shadow-[0_14px_34px_-22px_rgba(25,118,110,0.55)] backdrop-blur transition hover:bg-white"
                      onClick={() =>
                        setSelectedCaseIndex((current) =>
                          current == null
                            ? 0
                            : (current - 1 + liveSuccessCases.length) % liveSuccessCases.length,
                        )
                      }
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next success case"
                      className="absolute right-4 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-700 shadow-[0_14px_34px_-22px_rgba(25,118,110,0.55)] backdrop-blur transition hover:bg-white"
                      onClick={() =>
                        setSelectedCaseIndex((current) =>
                          current == null ? 0 : (current + 1) % liveSuccessCases.length,
                        )
                      }
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                ) : null}
                {selectedCase.images.length > 1 ? (
                  <div className="absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto bg-gradient-to-t from-[#0f172a]/60 via-[#0f172a]/20 to-transparent px-5 pb-4 pt-10">
                    {selectedCase.images.slice(0, 5).map((image, index) => (
                      <div
                        key={`${selectedCase.id}-${image}`}
                        className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border ${
                          index === 0 ? "border-white/90" : "border-white/35"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${selectedCase.title} image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex max-h-[92vh] flex-col overflow-hidden">
                <div className="border-b border-[#d8ece9] px-6 pb-5 pt-6">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedCase.providerName ? (
                      <Badge variant="secondary" className={amberBadgeClass}>
                        {selectedCase.providerName}
                      </Badge>
                    ) : null}
                    {selectedCase.caseNumber ? (
                      <Badge variant="outline" className={blueOutlineBadgeClass}>
                        Case #{selectedCase.caseNumber}
                      </Badge>
                    ) : null}
                    {selectedCase.procedureName && selectedCase.procedureName !== selectedCase.title ? (
                      <Badge variant="outline" className={tealOutlineBadgeClass}>
                        {selectedCase.procedureName}
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                    {selectedCase.title}
                  </h3>
                  <p className={`mt-2 text-sm leading-relaxed text-slate-600 ${pageFontClass}`}>
                    Detailed success case overview presented in the same visual system as the hospital detail page.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {selectedCase.patientAge ? (
                      <div className="rounded-2xl border border-[#d8ece9] bg-white/90 p-4">
                        <div className={`text-[11px] uppercase tracking-[0.16em] ${mutedTextClass}`}>
                          Patient Age
                        </div>
                        <div className="mt-2 text-base font-semibold text-foreground">
                          {selectedCase.patientAge}
                        </div>
                      </div>
                    ) : null}
                    {selectedCase.patientGender ? (
                      <div className="rounded-2xl border border-[#d8ece9] bg-white/90 p-4">
                        <div className={`text-[11px] uppercase tracking-[0.16em] ${mutedTextClass}`}>
                          Patient Gender
                        </div>
                        <div className="mt-2 text-base font-semibold text-foreground">
                          {selectedCase.patientGender}
                        </div>
                      </div>
                    ) : null}
                    {selectedCase.images.length > 0 ? (
                      <div className="rounded-2xl border border-[#d8ece9] bg-white/90 p-4">
                        <div className={`text-[11px] uppercase tracking-[0.16em] ${mutedTextClass}`}>
                          Media Assets
                        </div>
                        <div className="mt-2 text-base font-semibold text-foreground">
                          {selectedCase.images.length} image{selectedCase.images.length > 1 ? "s" : ""}
                        </div>
                      </div>
                    ) : null}
                    {selectedCase.providerName ? (
                      <div className="rounded-2xl border border-[#d8ece9] bg-white/90 p-4">
                        <div className={`text-[11px] uppercase tracking-[0.16em] ${mutedTextClass}`}>
                          Provider
                        </div>
                        <div className="mt-2 text-base font-semibold text-foreground">
                          {selectedCase.providerName}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {selectedCase.summary ? (
                    <div className="mt-6 rounded-[22px] border border-[#d8ece9] bg-white/95 p-5">
                      <div className={`text-[11px] uppercase tracking-[0.16em] ${mutedTextClass}`}>
                        Case Description
                      </div>
                      <p className="mt-3 text-sm leading-7 text-foreground/80">
                        {selectedCase.summary}
                      </p>
                    </div>
                  ) : null}

                  {liveSuccessCases.length > 1 ? (
                    <div className="mt-6 flex items-center justify-between rounded-[22px] border border-[#d8ece9] bg-white/90 px-4 py-3">
                      <button
                        type="button"
                        className={`inline-flex items-center gap-2 text-sm font-medium text-[#159a90] transition hover:text-[#117e76] ${pageFontClass}`}
                        onClick={() =>
                          setSelectedCaseIndex((current) =>
                            current == null
                              ? 0
                              : (current - 1 + liveSuccessCases.length) % liveSuccessCases.length,
                          )
                        }
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>
                      <span className={`text-xs ${mutedTextClass} ${pageFontClass}`}>
                        {String((selectedCaseIndex ?? 0) + 1).padStart(2, "0")} / {String(liveSuccessCases.length).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        className={`inline-flex items-center gap-2 text-sm font-medium text-[#159a90] transition hover:text-[#117e76] ${pageFontClass}`}
                        onClick={() =>
                          setSelectedCaseIndex((current) =>
                            current == null ? 0 : (current + 1) % liveSuccessCases.length,
                          )
                        }
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        procedureName={selectedProcedure || liveHospital?.name || ""}
        type="quote"
      />
    </div>
  );
}

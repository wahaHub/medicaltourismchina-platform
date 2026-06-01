// Hospital API service
import { API_BASE_URL } from './config';
import type {
  HospitalExtended,
  HospitalExtendedResponse,
  HospitalPackageDetail,
  HospitalPackageDetailResponse,
} from '@/types/hospital-extended';
import { getImageUrl } from '@/utils/imageUrl';

export interface Hospital {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  city: string;
  district: string;
  province: string;
  address?: string;
  tier: string; // 三甲、三乙等
  hospital_type: string;
  ownership_type: string; // 公立、私立等
  established_year?: number | null;
  bed_count?: number | null;
  annual_outpatient_visits?: number | null;
  staff_count?: number | null;
  official_website?: string;
  data_source?: string;
  short_description: string;
  full_description?: string;
  departments_info?: DepartmentInfo[];
  facilities_info?: FacilitiesInfo;
  department_count: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
  hero_image_url?: string;
}

export interface DepartmentInfo {
  department_slug: string;
  department_name: string;
  description: string;
  is_specialty_center: boolean;
  specialty_center_name: string;
  rank_in_department?: number;
  capabilities?: string[];
}

export interface FacilitiesInfo {
  advanced_equipment: Equipment[];
  special_facilities: Facility[];
}

export interface Equipment {
  name: string;
  status: string;
  description: string;
}

export interface Facility {
  name: string;
  description: string;
}

export interface HospitalsResponse {
  data: Hospital[];
  meta: {
    requested_locale: string;
    resolved_locale: string;
    filters: {
      city?: string;
      search?: string;
    };
    pagination: {
      limit: number;
      offset: number;
      returned: number;
      total: number;
    };
    generated_at: string;
  };
}

export interface HospitalDetailResponse {
  data: Hospital;
  meta: {
    requested_locale: string;
    resolved_locale: string;
    slug: string;
    generated_at: string;
  };
}

export interface HospitalsFilters {
  locale?: string;
  limit?: number;
  offset?: number;
  city?: string;
  search?: string;
}

const HOSPITAL_LISTING_FALLBACK_BASE_URL =
  `${(import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL || 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev').replace(/\/+$/, '')}/low/hospitals/public`;
const PRIVATE_HOSPITAL_FALLBACK_BASE_URL =
  `${(import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL || 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev').replace(/\/+$/, '')}/low/hospitals/private`;
const CJK_REGEX = /[\u3400-\u9fff\uf900-\ufaff]/;
const LATIN_REGEX = /[A-Za-zÀ-ÖØ-öø-ÿ]/;

const KNOWN_PRIVATE_HOSPITAL_IMAGE_PREFIXES: Record<string, { prefix: string; count: number }> = {
  'eeeb46fe-7478-4250-abd1-a3954e74a212': { prefix: '重庆莱佛士医院', count: 5 },
  'hospital-eeeb46fe': { prefix: '重庆莱佛士医院', count: 5 },
};

function getHospitalFallbackHeroImageUrl(id: string | null | undefined): string | undefined {
  if (!id) return undefined;
  return `${HOSPITAL_LISTING_FALLBACK_BASE_URL}/${id}_1.png`;
}

function getHospitalFallbackGallery(
  id: string | null | undefined,
  alt: string,
  count: number = 5,
): NonNullable<HospitalExtended['gallery']> {
  if (!id) return [];

  return Array.from({ length: count }, (_, index) => ({
    url: `${HOSPITAL_LISTING_FALLBACK_BASE_URL}/${id}_${index + 1}.png`,
    alt,
    type: 'facade' as const,
  }));
}

function getKnownPrivateHospitalImageFallback(
  hospital: Hospital | HospitalExtended,
): { hero: string; gallery: NonNullable<HospitalExtended['gallery']> } | undefined {
  const fallback =
    KNOWN_PRIVATE_HOSPITAL_IMAGE_PREFIXES[hospital.id]
    || KNOWN_PRIVATE_HOSPITAL_IMAGE_PREFIXES[hospital.slug];

  if (!fallback) return undefined;

  const makeUrl = (index: number) => {
    const filename = index === 1 ? `${fallback.prefix}.png` : `${fallback.prefix}${index}.png`;
    return `${PRIVATE_HOSPITAL_FALLBACK_BASE_URL}/${encodeURIComponent(filename)}`;
  };

  const alt = cleanHospitalName(hospital.name, hospital.display_name);
  const gallery = Array.from({ length: fallback.count }, (_, index) => ({
    url: makeUrl(index + 1),
    alt,
    type: 'facade' as const,
  }));

  return {
    hero: gallery[0].url,
    gallery,
  };
}

function cleanHospitalName(
  name: string | null | undefined,
  displayName: string | null | undefined,
  locale: string = 'zh',
): string {
  const trimmedName = name?.trim() || '';
  const trimmedDisplayName = displayName?.trim() || '';

  if (!trimmedName) {
    return trimmedDisplayName;
  }

  if (locale === 'zh') {
    return trimmedDisplayName || trimmedName;
  }

  const bilingualMatch = trimmedName.match(/^(.*)\s*[（(]\s*(.*?)\s*[）)]\s*$/);
  if (!bilingualMatch) {
    return trimmedName;
  }

  const outside = bilingualMatch[1]?.trim() || '';
  const inside = bilingualMatch[2]?.trim() || '';

  const outsideHasCjk = CJK_REGEX.test(outside);
  const insideHasCjk = CJK_REGEX.test(inside);
  const outsideHasLatin = LATIN_REGEX.test(outside);
  const insideHasLatin = LATIN_REGEX.test(inside);

  if (outsideHasLatin && insideHasCjk) {
    return outside;
  }

  if (outsideHasCjk && insideHasLatin) {
    return inside;
  }

  return trimmedName;
}

function getOwnershipPriority(ownershipType?: string | null): number {
  const normalized = ownershipType?.trim().toLowerCase() ?? '';

  if (
    normalized.includes('private')
    || normalized.includes('私立')
  ) {
    return 0;
  }

  if (
    normalized.includes('public')
    || normalized.includes('公立')
  ) {
    return 1;
  }

  return 2;
}

export function sortHospitalsByOwnershipPriority<T extends Hospital>(hospitals: T[]): T[] {
  return hospitals
    .map((hospital, index) => ({ hospital, index }))
    .sort((left, right) => {
      const priorityDifference =
        getOwnershipPriority(left.hospital.ownership_type)
        - getOwnershipPriority(right.hospital.ownership_type);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return left.index - right.index;
    })
    .map(({ hospital }) => hospital);
}

function normalizeMediaUrl(value: string | null | undefined): string | undefined {
  if (!value) return value ?? undefined;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }
  const trimmedValue = value.trim();
  const normalizedPath = trimmedValue.startsWith('/') ? trimmedValue.slice(1) : trimmedValue;
  if (!normalizedPath.startsWith('crm/')) {
    return value;
  }
  return getImageUrl(normalizedPath);
}

function normalizePackageDetailMedia(
  detail: HospitalPackageDetail,
): HospitalPackageDetail {
  return {
    ...detail,
    cover_image_url: normalizeMediaUrl(detail.cover_image_url),
    gallery: Array.isArray(detail.gallery)
      ? detail.gallery.map((item) => normalizeMediaUrl(item) ?? item)
      : detail.gallery,
  };
}

function normalizeHospitalMedia<T extends Hospital | HospitalExtended>(
  hospital: T,
  locale: string = 'zh',
): T {
  const extendedHospital = hospital as HospitalExtended;
  const facilitiesInfo = (extendedHospital.facilities_info ?? {}) as { promotionalVideos?: string[] };
  const normalizedName = cleanHospitalName(hospital.name, hospital.display_name, locale);
  const knownPrivateImageFallback = getKnownPrivateHospitalImageFallback(hospital);
  const normalizedHeroImageUrl =
    knownPrivateImageFallback?.hero
    ?? normalizeMediaUrl(hospital.hero_image_url)
    ?? getHospitalFallbackHeroImageUrl(hospital.id);
  const normalizedGallery = Array.isArray(extendedHospital.gallery)
    ? extendedHospital.gallery.map((item) => ({
        ...item,
        url: normalizeMediaUrl(item.url) ?? item.url,
      }))
    : extendedHospital.gallery;
  const normalizedPromotionalVideos = (
    Array.isArray(extendedHospital.promotional_videos)
      ? extendedHospital.promotional_videos
      : Array.isArray(facilitiesInfo.promotionalVideos)
        ? facilitiesInfo.promotionalVideos
        : []
  )
    .map((item) => normalizeMediaUrl(item) ?? item)
    .filter((item): item is string => Boolean(item));
  const fallbackGallery =
    knownPrivateImageFallback?.gallery
    ?? ((!normalizedGallery || normalizedGallery.length === 0)
      ? getHospitalFallbackGallery(hospital.id, normalizedName)
      : normalizedGallery);

  return {
    ...hospital,
    name: normalizedName,
    hero_image_url: normalizedHeroImageUrl,
    gallery: fallbackGallery,
    departments_info: hospital.departments_info?.map((item) => ({
      ...item,
      ...(typeof item === 'object' && item !== null && 'image_url' in item
        ? { image_url: normalizeMediaUrl((item as { image_url?: string }).image_url) }
        : {}),
    })),
    equipment: Array.isArray(extendedHospital.equipment)
      ? extendedHospital.equipment.map((item) => ({
          ...item,
          image_url: normalizeMediaUrl(item.image_url),
        }))
      : extendedHospital.equipment,
    surgeons: Array.isArray(extendedHospital.surgeons)
      ? extendedHospital.surgeons.map((surgeon) => ({
          ...surgeon,
          image_url: normalizeMediaUrl(surgeon.image_url),
          images: surgeon.images
            ? {
                ...surgeon.images,
                hero: normalizeMediaUrl(surgeon.images.hero),
                office: normalizeMediaUrl(surgeon.images.office),
                profile: normalizeMediaUrl(surgeon.images.profile),
              }
            : surgeon.images,
        }))
      : extendedHospital.surgeons,
    procedure_cases: Array.isArray(extendedHospital.procedure_cases)
      ? extendedHospital.procedure_cases.map((procedureCase) => ({
          ...procedureCase,
          image_urls: Array.isArray(procedureCase.image_urls)
            ? procedureCase.image_urls.map((url) => normalizeMediaUrl(url) ?? url)
            : procedureCase.image_urls,
        }))
      : extendedHospital.procedure_cases,
    packages: Array.isArray(extendedHospital.packages)
      ? extendedHospital.packages.map((item) => ({
          ...item,
          image_url: normalizeMediaUrl(item.image_url) ?? item.image_url,
        }))
      : extendedHospital.packages,
    patient_reviews: Array.isArray(extendedHospital.patient_reviews)
      ? extendedHospital.patient_reviews.map((review) => ({
          ...review,
          patient_avatar_url: normalizeMediaUrl(review.patient_avatar_url) ?? review.patient_avatar_url,
          media: Array.isArray(review.media)
            ? review.media.map((mediaItem) => ({
                ...mediaItem,
                url: normalizeMediaUrl(mediaItem.url) ?? mediaItem.url,
                thumbnailUrl: normalizeMediaUrl(mediaItem.thumbnailUrl) ?? mediaItem.thumbnailUrl,
              }))
            : review.media,
        }))
      : extendedHospital.patient_reviews,
    reviews: Array.isArray(extendedHospital.reviews)
      ? extendedHospital.reviews.map((review) => ({
          ...review,
          patient_avatar_url: normalizeMediaUrl(review.patient_avatar_url) ?? review.patient_avatar_url,
          media: Array.isArray(review.media)
            ? review.media.map((mediaItem) => ({
                ...mediaItem,
                url: normalizeMediaUrl(mediaItem.url) ?? mediaItem.url,
                thumbnailUrl: normalizeMediaUrl(mediaItem.thumbnailUrl) ?? mediaItem.thumbnailUrl,
              }))
            : review.media,
        }))
      : extendedHospital.reviews,
    promotional_videos: normalizedPromotionalVideos,
  };
}

// Hospital API functions
export const hospitalApi = {
  // Get hospitals list with optional filters
  getHospitals: async (filters: HospitalsFilters = {}): Promise<HospitalsResponse> => {
    const params = new URLSearchParams();
    
    // Set default values
    params.set('locale', filters.locale || 'zh');
    params.set('limit', (filters.limit || 24).toString());
    params.set('offset', (filters.offset || 0).toString());
    
    // Add optional filters
    if (filters.city) params.set('city', filters.city);
    if (filters.search) params.set('search', filters.search);
    
    const url = `${API_BASE_URL}/hospitals?${params.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch hospitals: ${response.status}`);
    }
    
    const payload = await response.json();
    return {
      ...payload,
      data: Array.isArray(payload.data)
        ? sortHospitalsByOwnershipPriority(
            payload.data.map((hospital) => normalizeHospitalMedia(hospital, filters.locale || 'zh'))
          )
        : payload.data,
    };
  },

  // Get hospital detail by slug
  getHospitalBySlug: async (slug: string, locale: string = 'zh'): Promise<HospitalDetailResponse> => {
    const url = `${API_BASE_URL}/hospitals/${slug}?locale=${locale}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Hospital not found');
      }
      throw new Error(`Failed to fetch hospital: ${response.status}`);
    }
    
    const payload = await response.json();
    return {
      ...payload,
      data: normalizeHospitalMedia(payload.data, locale),
    };
  },

  // Search hospitals
  searchHospitals: async (query: string, locale: string = 'zh', limit: number = 20): Promise<HospitalsResponse> => {
    return hospitalApi.getHospitals({
      search: query,
      locale,
      limit
    });
  },

  // Get hospitals by city
  getHospitalsByCity: async (city: string, locale: string = 'zh', limit: number = 20): Promise<HospitalsResponse> => {
    return hospitalApi.getHospitals({
      city,
      locale,
      limit
    });
  },

  // Get extended hospital detail by slug (new schema)
  getHospitalExtendedBySlug: async (slug: string, locale: string = 'zh'): Promise<HospitalExtendedResponse> => {
    const url = `${API_BASE_URL}/hospitals/${slug}/extended?locale=${locale}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Hospital not found');
      }
      throw new Error(`Failed to fetch hospital: ${response.status}`);
    }

    const payload = await response.json();
    return {
      ...payload,
      data: normalizeHospitalMedia(payload.data, locale),
    };
  },

  getHospitalPackageDetailBySlug: async (
    slug: string,
    packageSlug: string,
    locale: string = 'zh',
  ): Promise<HospitalPackageDetailResponse> => {
    const url = `${API_BASE_URL}/hospitals/${slug}/packages/${packageSlug}?locale=${locale}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Package not found');
      }
      throw new Error(`Failed to fetch hospital package: ${response.status}`);
    }

    const payload = await response.json();
    return {
      ...payload,
      data: normalizePackageDetailMedia(payload.data),
    };
  }
};

// Re-export types
export type { HospitalExtended, HospitalExtendedResponse, HospitalPackageDetail, HospitalPackageDetailResponse };

export default hospitalApi;

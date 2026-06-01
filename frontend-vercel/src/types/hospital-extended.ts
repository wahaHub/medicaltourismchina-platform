// Extended Hospital types for new schema (2026-02-26)

// Gallery image item
export interface GalleryImage {
  url: string;
  alt: string;
  type: 'facade' | 'interior' | 'department' | 'equipment' | 'room';
}

// Equipment item
export interface HospitalEquipment {
  name: string;
  image_url?: string;
  description: string;
}

// Certification item
export interface HospitalCertification {
  name: string;
  nameEn: string;
  year: number;
  isActive: boolean;
}

// Core specialty item (i18n)
export interface CoreSpecialty {
  name: string;
  slug: string;
  image_url?: string;
  description: string;
  technologies: string[];
}

// Video testimonial item
export interface VideoTestimonial {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  patientName: string;
  patientCountry?: string;
  procedureName?: string;
  duration?: string;
}

export interface FacilitiesInfo {
  promotionalVideos?: string[];
}

export interface HospitalMaterialMediaItem {
  id?: string;
  type?: 'image' | 'video';
  url: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
}

export interface HospitalPatientReview {
  id: string;
  patient_name: string;
  patient_country?: string;
  treatment_name?: string;
  review_title?: string;
  review_comment?: string;
  rating?: number | null;
  review_date?: string | null;
  patient_avatar_url?: string;
  media?: HospitalMaterialMediaItem[];
}

export interface HospitalMaterialsPackage {
  id: string;
  slug?: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  duration?: string;
  price_label?: string;
  summary?: string;
  tags?: string[];
  includes?: string[];
}

export interface HospitalPackageDetailTag {
  label: string;
  category?: string;
}

export interface HospitalPackageDetailProcessStep {
  step: string;
  desc: string;
}

export interface HospitalPackageDetailCase {
  name: string;
  age?: number | null;
  country?: string;
  story: string;
  result: string;
}

export interface HospitalPackageDetailReview {
  name: string;
  country?: string;
  rating?: number | null;
  date?: string;
  comment: string;
}

export interface HospitalPackageDetailProvider {
  id: string;
  slug: string;
  name: string;
  location?: string;
}

export interface HospitalPackageDetail {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  cover_image_url?: string;
  gallery?: string[];
  duration?: string;
  price_label?: string;
  summary?: string;
  tags?: HospitalPackageDetailTag[];
  includes?: string[];
  process?: HospitalPackageDetailProcessStep[];
  cases?: HospitalPackageDetailCase[];
  reviews?: HospitalPackageDetailReview[];
  hospital: HospitalPackageDetailProvider;
}

// Clinical capabilities descriptions (i18n)
export interface ClinicalCapabilitiesDescription {
  icu?: string;
  emergency?: string;
  mdt?: string;
  imaging_center?: string;
  lab?: string;
  complex_case?: string;
}

// Supported language codes
export type SupportedLanguage = 'en' | 'zh' | 'kr' | 'jp' | 'ar' | 'th' | 'es' | 'ru' | 'fr' | 'de';

// Airport service types
export type AirportService = 'complimentary_transfer' | 'paid_transfer' | 'airport_assistance' | 'visa_on_arrival';

// Follow-up care types
export type FollowupCare = 'lifetime' | '1_year' | '6_months' | 'telemedicine' | 'local_partner';

// Amenity types
export type Amenity =
  | 'private_suite'
  | 'wifi'
  | 'concierge'
  | 'insurance_coord'
  | 'visa_assistance'
  | 'interpreter'
  | 'halal_food'
  | 'vegetarian'
  | 'family_accommodation'
  | 'pharmacy';

// Payment method types
export type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'wechat_pay'
  | 'alipay'
  | 'bank_transfer'
  | 'international_transfer'
  | 'paypal'
  | 'apple_pay'
  | 'google_pay'
  | 'unionpay'
  | 'insurance_direct';

// Clinical capability types
export type ClinicalCapability = 'icu' | 'emergency' | 'mdt' | 'imaging_center' | 'lab' | 'complex_case';

// Hospital status
export type HospitalStatus = 'pending' | 'approved' | 'rejected';

// Surgeon interface
export interface Surgeon {
  id: string;
  surgeon_id: string;
  hospital_id: string;
  name: string;
  title?: string;
  experience_years?: number;
  image_url?: string;
  images?: {
    hero?: string;
    office?: string;
    profile?: string;
  };
  specialties?: string[];
  languages?: string[];
  education?: string[];
  certifications?: string[];
  procedures_count?: Record<string, number>;
  bio?: {
    intro?: string;
    expertise?: string;
    philosophy?: string;
    achievements?: string;
  };
  translations?: Record<string, Record<string, unknown>>;
  created_at?: string;
  updated_at?: string;
}

// Procedure Case interface
export interface ProcedureCase {
  id: string;
  hospital_id: string;
  procedure_id?: string;
  surgeon_id?: string;
  case_number: string;
  description?: string;
  provider_name?: string;
  patient_age?: string;
  patient_gender?: string;
  image_count?: number;
  image_urls?: string[];
  procedure_name?: string;
  surgeon_name?: string;
  sort_order?: number;
  translations?: Record<string, Record<string, unknown>>;
  created_at?: string;
  updated_at?: string;
}

// Department info interface
export interface DepartmentInfo {
  department_slug: string;
  department_name: string;
  description: string;
  is_specialty_center: boolean;
  specialty_center_name: string;
  rank_in_department?: number;
  capabilities?: string[];
}

// Extended Hospital interface
export interface HospitalExtended {
  // Basic info (existing)
  id: string;
  slug: string;
  name: string;
  display_name: string;
  city: string;
  district: string;
  province: string;
  address?: string;
  tier: string;
  hospital_type: string;
  ownership_type: string;
  established_year?: number | null;
  bed_count?: number | null;
  annual_outpatient_visits?: number | null;
  staff_count?: number | null;
  official_website?: string;
  data_source?: string;
  short_description: string;
  full_description?: string;
  department_count: number;
  created_at: string;
  updated_at: string;

  // New location fields
  latitude?: number | null;
  longitude?: number | null;

  // New scale fields
  patients_served_annually?: number | null;
  international_patients_annually?: number | null;

  // New image fields
  hero_image_url?: string;
  gallery?: GalleryImage[];

  // New facility features
  supported_languages?: SupportedLanguage[];
  airport_services?: AirportService[];
  followup_care?: FollowupCare[];
  amenities?: Amenity[];
  payment_methods?: PaymentMethod[];
  clinical_capabilities?: ClinicalCapability[];

  // New equipment and certifications
  equipment?: HospitalEquipment[];
  certifications?: HospitalCertification[];
  video_testimonials?: VideoTestimonial[];
  promotional_videos?: string[];

  // New management fields
  is_active?: boolean;
  status?: HospitalStatus;

  // i18n fields
  value_proposition?: string;
  overview?: string;
  core_specialties?: CoreSpecialty[];
  clinical_capabilities_description?: ClinicalCapabilitiesDescription;
  facilities_info?: FacilitiesInfo;

  // Medical team and cases
  departments_info?: DepartmentInfo[];
  surgeons?: Surgeon[];
  procedure_cases?: ProcedureCase[];
  packages?: HospitalMaterialsPackage[];
  patient_reviews?: HospitalPatientReview[];
  reviews?: HospitalPatientReview[];
}

export interface HospitalPackageDetailResponse {
  data: HospitalPackageDetail;
  meta: {
    requested_locale: string;
    resolved_locale: string;
    slug: string;
    package_slug: string;
    generated_at: string;
  };
}

// API Response types
export interface HospitalExtendedResponse {
  data: HospitalExtended;
  meta: {
    requested_locale: string;
    resolved_locale: string;
    slug: string;
    translations_resolved?: boolean;
    generated_at: string;
  };
}

// Label maps for display
export const LANGUAGE_LABELS: Record<SupportedLanguage, { en: string; zh: string }> = {
  en: { en: 'English', zh: '英语' },
  zh: { en: 'Chinese', zh: '中文' },
  kr: { en: 'Korean', zh: '韩语' },
  jp: { en: 'Japanese', zh: '日语' },
  ar: { en: 'Arabic', zh: '阿拉伯语' },
  th: { en: 'Thai', zh: '泰语' },
  es: { en: 'Spanish', zh: '西班牙语' },
  ru: { en: 'Russian', zh: '俄语' },
  fr: { en: 'French', zh: '法语' },
  de: { en: 'German', zh: '德语' },
};

export const AIRPORT_SERVICE_LABELS: Record<AirportService, { en: string; zh: string }> = {
  complimentary_transfer: { en: 'Complimentary Airport Transfer', zh: '免费机场接送' },
  paid_transfer: { en: 'Paid Airport Transfer', zh: '付费机场接送' },
  airport_assistance: { en: 'Airport Assistance', zh: '机场协助' },
  visa_on_arrival: { en: 'Visa on Arrival Support', zh: '落地签证支持' },
};

export const FOLLOWUP_CARE_LABELS: Record<FollowupCare, { en: string; zh: string }> = {
  lifetime: { en: 'Lifetime Follow-up', zh: '终身随访' },
  '1_year': { en: '1 Year Follow-up', zh: '1年随访' },
  '6_months': { en: '6 Months Follow-up', zh: '6个月随访' },
  telemedicine: { en: 'Telemedicine Support', zh: '远程医疗支持' },
  local_partner: { en: 'Local Partner Network', zh: '当地合作伙伴' },
};

export const AMENITY_LABELS: Record<Amenity, { en: string; zh: string; icon: string }> = {
  private_suite: { en: 'Private Suite', zh: '独立套房', icon: 'bed' },
  wifi: { en: 'Free WiFi', zh: '免费WiFi', icon: 'wifi' },
  concierge: { en: 'Concierge Service', zh: '礼宾服务', icon: 'concierge-bell' },
  insurance_coord: { en: 'Insurance Coordination', zh: '保险协调', icon: 'shield' },
  visa_assistance: { en: 'Visa Assistance', zh: '签证协助', icon: 'passport' },
  interpreter: { en: 'Interpreter Service', zh: '翻译服务', icon: 'languages' },
  halal_food: { en: 'Halal Food', zh: '清真餐食', icon: 'utensils' },
  vegetarian: { en: 'Vegetarian Options', zh: '素食选择', icon: 'leaf' },
  family_accommodation: { en: 'Family Accommodation', zh: '家属住宿', icon: 'users' },
  pharmacy: { en: 'On-site Pharmacy', zh: '院内药房', icon: 'pill' },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, { en: string; zh: string; icon: string }> = {
  cash: { en: 'Cash', zh: '现金', icon: 'banknote' },
  credit_card: { en: 'Credit Card', zh: '信用卡', icon: 'credit-card' },
  debit_card: { en: 'Debit Card', zh: '借记卡', icon: 'credit-card' },
  wechat_pay: { en: 'WeChat Pay', zh: '微信支付', icon: 'smartphone' },
  alipay: { en: 'Alipay', zh: '支付宝', icon: 'smartphone' },
  bank_transfer: { en: 'Bank Transfer', zh: '银行转账', icon: 'building' },
  international_transfer: { en: 'International Wire', zh: '国际汇款', icon: 'globe' },
  paypal: { en: 'PayPal', zh: 'PayPal', icon: 'wallet' },
  apple_pay: { en: 'Apple Pay', zh: 'Apple Pay', icon: 'smartphone' },
  google_pay: { en: 'Google Pay', zh: 'Google Pay', icon: 'smartphone' },
  unionpay: { en: 'UnionPay', zh: '银联', icon: 'credit-card' },
  insurance_direct: { en: 'Direct Insurance Billing', zh: '保险直付', icon: 'shield' },
};

export const CLINICAL_CAPABILITY_LABELS: Record<ClinicalCapability, { en: string; zh: string; icon: string }> = {
  icu: { en: 'Intensive Care Unit', zh: '重症监护', icon: 'heart-pulse' },
  emergency: { en: '24/7 Emergency', zh: '24小时急诊', icon: 'siren' },
  mdt: { en: 'MDT Consultation', zh: 'MDT多学科会诊', icon: 'users' },
  imaging_center: { en: 'Advanced Imaging', zh: '先进影像中心', icon: 'scan' },
  lab: { en: 'Clinical Lab', zh: '临床检验中心', icon: 'flask-conical' },
  complex_case: { en: 'Complex Case Management', zh: '疑难病例处理', icon: 'brain' },
};

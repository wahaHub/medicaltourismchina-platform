import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteRequestModal from "@/components/QuoteRequestModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertTriangle,
  MapPin,
  Calendar,
  Building2,
  Globe,
  ExternalLink,
  Stethoscope,
  Shield,
  Users,
  ChevronLeft,
  ChevronRight,
  Camera,
  Languages,
  Plane,
  Heart,
  CreditCard,
  Award,
  Cpu,
  Phone,
  Bed,
  Wifi,
  ConciergeBell,
  FileText,
  Utensils,
  Leaf,
  Pill,
  Banknote,
  Smartphone,
  Wallet,
  CheckCircle2,
  Star,
  GraduationCap,
} from "lucide-react";
import { hospitalApi } from "@/services/api/hospital";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n";
import type {
  HospitalExtended,
  SupportedLanguage,
  AirportService,
  FollowupCare,
  Amenity,
  PaymentMethod,
} from "@/types/hospital-extended";
import {
  getSurgeonName,
  getSurgeonTitle,
  getSurgeonSpecialties,
  getSurgeonBio,
  getProcedureCaseName,
  getProcedureCaseDescription,
} from "@/utils/i18n-helpers";

// Icon mapping for amenities
const getAmenityIcon = (amenity: Amenity) => {
  const icons: Record<Amenity, React.ReactNode> = {
    private_suite: <Bed className="h-4 w-4" />,
    wifi: <Wifi className="h-4 w-4" />,
    concierge: <ConciergeBell className="h-4 w-4" />,
    insurance_coord: <Shield className="h-4 w-4" />,
    visa_assistance: <FileText className="h-4 w-4" />,
    interpreter: <Languages className="h-4 w-4" />,
    halal_food: <Utensils className="h-4 w-4" />,
    vegetarian: <Leaf className="h-4 w-4" />,
    family_accommodation: <Users className="h-4 w-4" />,
    pharmacy: <Pill className="h-4 w-4" />,
  };
  return icons[amenity] || <CheckCircle2 className="h-4 w-4" />;
};

// Icon mapping for payment methods
const getPaymentIcon = (method: PaymentMethod) => {
  const icons: Record<PaymentMethod, React.ReactNode> = {
    cash: <Banknote className="h-3.5 w-3.5" />,
    credit_card: <CreditCard className="h-3.5 w-3.5" />,
    debit_card: <CreditCard className="h-3.5 w-3.5" />,
    wechat_pay: <Smartphone className="h-3.5 w-3.5" />,
    alipay: <Smartphone className="h-3.5 w-3.5" />,
    bank_transfer: <Building2 className="h-3.5 w-3.5" />,
    international_transfer: <Globe className="h-3.5 w-3.5" />,
    paypal: <Wallet className="h-3.5 w-3.5" />,
    apple_pay: <Smartphone className="h-3.5 w-3.5" />,
    google_pay: <Smartphone className="h-3.5 w-3.5" />,
    unionpay: <CreditCard className="h-3.5 w-3.5" />,
    insurance_direct: <Shield className="h-3.5 w-3.5" />,
  };
  return icons[method] || <CreditCard className="h-3.5 w-3.5" />;
};

// Label maps
const LANGUAGE_LABELS_MAP: Record<SupportedLanguage, { en: string; zh: string }> = {
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

const AIRPORT_SERVICE_LABELS_MAP: Record<AirportService, { en: string; zh: string }> = {
  complimentary_transfer: { en: 'Complimentary Transfer', zh: '免费机场接送' },
  paid_transfer: { en: 'Paid Transfer', zh: '付费机场接送' },
  airport_assistance: { en: 'Airport Assistance', zh: '机场协助' },
  visa_on_arrival: { en: 'Visa Support', zh: '落地签支持' },
};

const FOLLOWUP_CARE_LABELS_MAP: Record<FollowupCare, { en: string; zh: string }> = {
  lifetime: { en: 'Lifetime', zh: '终身随访' },
  '1_year': { en: '1 Year', zh: '1年随访' },
  '6_months': { en: '6 Months', zh: '6个月随访' },
  telemedicine: { en: 'Telemedicine', zh: '远程医疗' },
  local_partner: { en: 'Local Partner', zh: '当地合作' },
};

const AMENITY_LABELS_MAP: Record<Amenity, { en: string; zh: string }> = {
  private_suite: { en: 'Private Suite', zh: '独立套房' },
  wifi: { en: 'Free WiFi', zh: '免费WiFi' },
  concierge: { en: 'Concierge', zh: '礼宾服务' },
  insurance_coord: { en: 'Insurance', zh: '保险协调' },
  visa_assistance: { en: 'Visa Help', zh: '签证协助' },
  interpreter: { en: 'Interpreter', zh: '翻译服务' },
  halal_food: { en: 'Halal Food', zh: '清真餐食' },
  vegetarian: { en: 'Vegetarian', zh: '素食选择' },
  family_accommodation: { en: 'Family Stay', zh: '家属住宿' },
  pharmacy: { en: 'Pharmacy', zh: '院内药房' },
};

const PAYMENT_METHOD_LABELS_MAP: Record<PaymentMethod, { en: string; zh: string }> = {
  cash: { en: 'Cash', zh: '现金' },
  credit_card: { en: 'Credit Card', zh: '信用卡' },
  debit_card: { en: 'Debit Card', zh: '借记卡' },
  wechat_pay: { en: 'WeChat Pay', zh: '微信支付' },
  alipay: { en: 'Alipay', zh: '支付宝' },
  bank_transfer: { en: 'Bank Transfer', zh: '银行转账' },
  international_transfer: { en: 'Wire Transfer', zh: '国际汇款' },
  paypal: { en: 'PayPal', zh: 'PayPal' },
  apple_pay: { en: 'Apple Pay', zh: 'Apple Pay' },
  google_pay: { en: 'Google Pay', zh: 'Google Pay' },
  unionpay: { en: 'UnionPay', zh: '银联' },
  insurance_direct: { en: 'Insurance', zh: '保险直付' },
};

// Photo Gallery Component
const PhotoGallery = ({
  gallery,
  heroImage,
  hospitalName,
  locale,
}: {
  gallery?: HospitalExtended['gallery'];
  heroImage?: string;
  hospitalName: string;
  locale: string;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const allImages = [
    ...(heroImage ? [{ url: heroImage, alt: hospitalName, type: 'facade' as const }] : []),
    ...(gallery || []),
  ];

  if (allImages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {t('hospitalProfile.photos.title', {}, locale)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 flex items-center justify-center rounded-lg">
            <div className="text-center text-gray-500">
              <Camera className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">{t('hospitalProfile.photos.noPhotos', {}, locale)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {t('hospitalProfile.photos.title', {}, locale)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-96 w-full mb-4 cursor-pointer group" onClick={() => setIsDialogOpen(true)}>
          <img
            src={allImages[currentIndex].url}
            alt={allImages[currentIndex].alt}
            className="h-full w-full object-cover rounded-lg group-hover:opacity-90 transition-opacity"
          />

          {/* Click to expand hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
              {t('hospitalProfile.photos.clickToExpand', {}, locale)}
            </div>
          </div>

          {/* Navigation arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Photo thumbnails */}
        {allImages.length > 1 && (
          <div className="grid grid-cols-6 gap-2">
            {allImages.map((photo, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img src={photo.url} alt={photo.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {allImages.length > 0 && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            {currentIndex + 1} / {allImages.length}
          </p>
        )}

        {/* Lightbox Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <div className="relative">
              <img
                src={allImages[currentIndex].url}
                alt={allImages[currentIndex].alt}
                className="w-full h-auto max-h-[80vh] object-contain"
              />

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// Main Component
const HospitalProfile = () => {
  const { slug } = useParams();
  const { currentLanguage } = useLanguage();
  const locale = currentLanguage.code === 'zh' ? 'zh' : 'en';
  const [hospital, setHospital] = useState<HospitalExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ videoUrl: string; patientName: string } | null>(null);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [selectedSurgeon, setSelectedSurgeon] = useState<any | null>(null);

  useEffect(() => {
    const loadHospital = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const response = await hospitalApi.getHospitalExtendedBySlug(slug, locale);
        setHospital(response.data);
        document.title = `${response.data.name} | Medora Health`;
      } catch (err) {
        setError('Failed to load hospital details.');
        console.error('Error loading hospital:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHospital();
  }, [slug, locale]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopBanner />
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="min-h-screen">
        <TopBanner />
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hospital Not Found</h1>
          <p className="text-gray-600 mb-4">{error || "The hospital doesn't exist."}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBanner />
      <Header />

      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Hospital Hero Section */}
          <Card className="mb-8">
            <div className="relative h-80 w-full">
              <img
                src={hospital.hero_image_url || '/api/placeholder/1200/300'}
                alt={hospital.name}
                className="h-full w-full object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 text-white w-full">
                  <h1 className="text-3xl font-bold mb-2">{hospital.name}</h1>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {hospital.city}, {hospital.province}
                    </div>
                    {hospital.established_year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {t('hospitalProfile.info.established', {}, locale)} {hospital.established_year}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hospital Photos */}
              <PhotoGallery
                gallery={hospital.gallery}
                heroImage={hospital.hero_image_url}
                hospitalName={hospital.name}
                locale={locale}
              />

              {/* Hospital Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {t('hospitalProfile.sections.overview', {}, locale)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hospital.overview ? (
                    <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: hospital.overview }} />
                  ) : hospital.full_description ? (
                    <p className="text-gray-700">{hospital.full_description}</p>
                  ) : (
                    <p className="text-gray-600">{hospital.short_description}</p>
                  )}
                </CardContent>
              </Card>

              {/* Core Specialties */}
              {hospital.core_specialties && hospital.core_specialties.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      {t('hospitalProfile.sections.specialtyCenters', {}, locale)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {hospital.core_specialties.map((specialty, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            {specialty.image_url && (
                              <img src={specialty.image_url} alt={specialty.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{specialty.name}</h3>
                              <p className="text-gray-600 text-sm">{specialty.description}</p>
                              {specialty.technologies && specialty.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {specialty.technologies.map((tech, i) => (
                                    <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{tech}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Equipment */}
              {hospital.equipment && hospital.equipment.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      {t('hospitalProfile.sections.advancedEquipment', {}, locale)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {hospital.equipment.map((equip, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-0 min-h-fit">
                            {/* Left - Image (2 columns on desktop) */}
                            {equip.image_url && (
                              <div className="md:col-span-2 h-64 md:h-full min-h-[280px]">
                                <img
                                  src={equip.image_url}
                                  alt={equip.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {/* Right - Description (3 columns on desktop) */}
                            <div className={`p-6 md:p-8 flex flex-col justify-center ${equip.image_url ? 'md:col-span-3' : 'md:col-span-5'}`}>
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                                <h4 className="text-xl md:text-2xl font-bold text-blue-900">{equip.name}</h4>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{equip.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Departments/Specialties */}
              {hospital.departments_info && hospital.departments_info.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      {t('hospitalProfile.sections.departments', {}, locale)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {hospital.departments_info.map((dept, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">
                              {(dept as any).department_name || (dept as any).department_code?.charAt(0).toUpperCase() + (dept as any).department_code?.slice(1) || 'Department'}
                            </h3>
                            {dept.is_specialty_center && (
                              <Badge className="bg-green-600">
                                {t('hospitalProfile.sections.specialtyCenter', {}, locale)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{dept.description}</p>
                          {dept.capabilities && dept.capabilities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {dept.capabilities.map((cap, i) => (
                                <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {cap}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Medical Team (Surgeons) */}
              {hospital.surgeons && hospital.surgeons.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {t('hospitalProfile.sections.medicalTeam', {}, locale)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hospital.surgeons.map((surgeon) => {
                        const surgeonName = getSurgeonName(surgeon, locale);
                        const surgeonTitle = getSurgeonTitle(surgeon, locale);
                        const surgeonSpecialties = getSurgeonSpecialties(surgeon, locale);
                        const surgeonBioIntro = getSurgeonBio(surgeon, locale, 'intro');

                        return (
                          <div
                            key={surgeon.id}
                            className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedSurgeon(surgeon)}
                          >
                            <div className="flex gap-4">
                              {(surgeon.images?.hero || surgeon.image_url) && (
                                <img
                                  src={surgeon.images?.hero || surgeon.image_url}
                                  alt={surgeonName}
                                  className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900">{surgeonName}</h3>
                                {surgeonTitle && <p className="text-sm text-blue-700">{surgeonTitle}</p>}
                                {surgeon.experience_years && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {surgeon.experience_years} {t('hospitalProfile.team.yearsExperience', {}, locale)}
                                  </p>
                                )}
                                {surgeonSpecialties && surgeonSpecialties.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {surgeonSpecialties.slice(0, 3).map((spec, i) => (
                                      <span key={i} className="text-xs bg-white text-blue-600 px-2 py-0.5 rounded">
                                        {spec}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {surgeonBioIntro && (
                                  <p className="text-xs text-gray-700 mt-2 line-clamp-2">{surgeonBioIntro}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Procedure Cases */}
              {hospital.procedure_cases && hospital.procedure_cases.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      {t('hospitalProfile.sections.successCases', {}, locale)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {hospital.procedure_cases.map((caseItem) => {
                        const procedureName = getProcedureCaseName(caseItem, locale);
                        const caseDescription = getProcedureCaseDescription(caseItem, locale);
                        const imageCount = caseItem.image_urls?.length || 0;

                        return (
                          <div
                            key={caseItem.id}
                            className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer bg-white"
                            onClick={() => setSelectedCase(caseItem)}
                          >
                            {/* Case Number and Procedure Name */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-base text-gray-900">
                                    {procedureName || t('hospitalProfile.cases.procedureCase', {}, locale)}
                                  </h3>
                                  <p className="text-sm text-gray-600 mt-1">{caseItem.case_number}</p>
                                </div>
                                {caseItem.provider_name && (
                                  <Badge variant="secondary" className="text-xs">
                                    {caseItem.provider_name}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Images - Now positioned between case number and description */}
                            {caseItem.image_urls && caseItem.image_urls.length > 0 && (
                              <div className={`${imageCount === 1 ? 'grid-cols-1' : 'grid-cols-2'} grid gap-0 bg-gray-50`}>
                                {caseItem.image_urls.slice(0, 2).map((imgUrl, idx) => (
                                  <div key={idx} className="aspect-video relative">
                                    <img
                                      src={imgUrl}
                                      alt={`${caseItem.case_number} - Image ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Description - Now at the bottom */}
                            <div className="p-4 bg-white">
                              {caseDescription && (
                                <p className="text-sm text-gray-700 mb-2 line-clamp-3">{caseDescription}</p>
                              )}
                              <div className="flex gap-3 text-sm text-gray-600">
                                {caseItem.patient_age && (
                                  <span>{t('hospitalProfile.cases.age', {}, locale)}: {caseItem.patient_age}</span>
                                )}
                                {caseItem.patient_gender && (
                                  <span>
                                    {t('hospitalProfile.cases.gender', {}, locale)}: {
                                      caseItem.patient_gender === 'male'
                                        ? t('hospitalProfile.cases.male', {}, locale)
                                        : caseItem.patient_gender === 'female'
                                        ? t('hospitalProfile.cases.female', {}, locale)
                                        : caseItem.patient_gender
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Video Testimonials */}
              {hospital.video_testimonials && hospital.video_testimonials.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      {t('hospitalProfile.sections.userReviews', {}, locale)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {hospital.video_testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                          <div
                            className="aspect-video bg-gray-900 relative group cursor-pointer"
                            onClick={() => setSelectedVideo({ videoUrl: testimonial.videoUrl, patientName: testimonial.patientName })}
                          >
                            {testimonial.thumbnailUrl ? (
                              <img
                                src={testimonial.thumbnailUrl}
                                alt={testimonial.patientName}
                                className="w-full h-full object-cover"
                              />
                            ) : testimonial.videoUrl ? (
                              <video
                                src={testimonial.videoUrl}
                                className="w-full h-full object-cover"
                                preload="metadata"
                              />
                            ) : null}
                            {/* Play button overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <div className="w-0 h-0 border-l-[18px] border-l-gray-800 border-y-[12px] border-y-transparent ml-1" />
                              </div>
                            </div>
                            {testimonial.duration && (
                              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {testimonial.duration}
                              </span>
                            )}
                          </div>
                          <div className="p-4 bg-white">
                            <p className="font-semibold text-gray-900">{testimonial.patientName}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                              {testimonial.patientCountry && (
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {testimonial.patientCountry}
                                </span>
                              )}
                              {testimonial.procedureName && (
                                <span className="flex items-center gap-1">
                                  <Stethoscope className="w-3 h-3" />
                                  {testimonial.procedureName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Video Player Modal */}
              <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
                <DialogContent className="max-w-4xl p-0">
                  {selectedVideo && (
                    <div className="relative bg-black">
                      <video
                        src={selectedVideo.videoUrl}
                        controls
                        autoPlay
                        className="w-full h-auto max-h-[80vh]"
                      >
                        {t('hospitalProfile.video.browserNotSupported', {}, locale)}
                      </video>
                      <div className="p-4 bg-white">
                        <p className="font-semibold text-gray-900">{selectedVideo.patientName}</p>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Case Detail Modal */}
              <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-50 via-white to-pink-50">
                  {selectedCase && (
                    <div className="space-y-6">
                      {/* Header with gradient background */}
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 -m-6 mb-0 p-8 rounded-t-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                            <Star className="h-6 w-6 text-white" />
                          </div>
                          <h2 className="text-2xl font-bold text-white">
                            {getProcedureCaseName(selectedCase, locale) || t('hospitalProfile.cases.procedureCase', {}, locale)}
                          </h2>
                        </div>
                        <div className="flex items-center gap-3 ml-14">
                          <p className="text-lg text-white/90">{selectedCase.case_number}</p>
                          {selectedCase.provider_name && (
                            <Badge className="bg-white/20 text-white border-white/30">
                              {selectedCase.provider_name}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* All Images with enhanced styling */}
                      {selectedCase.image_urls && selectedCase.image_urls.length > 0 && (
                        <div className="space-y-4 px-6">
                          <div className="flex items-center gap-2">
                            <Camera className="h-5 w-5 text-purple-600" />
                            <h3 className="font-semibold text-lg text-gray-900">{locale === 'zh' ? '案例图片' : 'Case Images'}</h3>
                          </div>
                          <div className={`grid gap-4 ${
                            selectedCase.image_urls.length === 1 ? 'grid-cols-1' :
                            selectedCase.image_urls.length === 2 ? 'grid-cols-2' :
                            selectedCase.image_urls.length === 3 ? 'grid-cols-2' :
                            'grid-cols-2'
                          }`}>
                            {selectedCase.image_urls.map((imgUrl: string, idx: number) => (
                              <div
                                key={idx}
                                className={`relative aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow ${
                                  selectedCase.image_urls.length === 3 && idx === 2 ? 'col-span-2' : ''
                                }`}
                              >
                                <img
                                  src={imgUrl}
                                  alt={`${selectedCase.case_number} - Image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description with icon */}
                      {getProcedureCaseDescription(selectedCase, locale) && (
                        <div className="px-6">
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="h-5 w-5 text-purple-600" />
                            <h3 className="font-semibold text-lg text-gray-900">{locale === 'zh' ? '案例描述' : 'Description'}</h3>
                          </div>
                          <div className="bg-white rounded-xl p-5 shadow-sm border border-purple-100">
                            <p className="text-gray-700 leading-relaxed">{getProcedureCaseDescription(selectedCase, locale)}</p>
                          </div>
                        </div>
                      )}

                      {/* Patient Info with gradient cards */}
                      <div className="grid grid-cols-2 gap-4 px-6 pb-2">
                        {selectedCase.patient_age && (
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-blue-600" />
                              <p className="text-sm font-medium text-blue-900">{t('hospitalProfile.cases.age', {}, locale)}</p>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">{selectedCase.patient_age}</p>
                          </div>
                        )}
                        {selectedCase.patient_gender && (
                          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-pink-600" />
                              <p className="text-sm font-medium text-pink-900">{t('hospitalProfile.cases.gender', {}, locale)}</p>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">
                              {selectedCase.patient_gender === 'male'
                                ? t('hospitalProfile.cases.male', {}, locale)
                                : selectedCase.patient_gender === 'female'
                                ? t('hospitalProfile.cases.female', {}, locale)
                                : selectedCase.patient_gender
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Surgeon Detail Modal */}
              <Dialog open={!!selectedSurgeon} onOpenChange={(open) => !open && setSelectedSurgeon(null)}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                  {selectedSurgeon && (
                    <div className="space-y-6">
                      {/* Header with Photo and gradient background */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 -m-6 mb-0 p-8 rounded-t-lg">
                        <div className="flex gap-6 items-start">
                          {(selectedSurgeon.images?.hero || selectedSurgeon.image_url) && (
                            <div className="relative">
                              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full"></div>
                              <img
                                src={selectedSurgeon.images?.hero || selectedSurgeon.image_url}
                                alt={getSurgeonName(selectedSurgeon, locale)}
                                className="w-32 h-32 rounded-full object-cover flex-shrink-0 border-4 border-white/30 relative z-10"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h2 className="text-3xl font-bold text-white mb-2">
                              {getSurgeonName(selectedSurgeon, locale)}
                            </h2>
                            {getSurgeonTitle(selectedSurgeon, locale) && (
                              <p className="text-lg text-white/90 mb-2">{getSurgeonTitle(selectedSurgeon, locale)}</p>
                            )}
                            {selectedSurgeon.experience_years && (
                              <div className="flex items-center gap-2 text-white/80">
                                <Award className="h-4 w-4" />
                                <p>{selectedSurgeon.experience_years} {t('hospitalProfile.team.yearsExperience', {}, locale)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Specialties */}
                      {getSurgeonSpecialties(selectedSurgeon, locale) && getSurgeonSpecialties(selectedSurgeon, locale).length > 0 && (
                        <div className="px-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Stethoscope className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-lg text-gray-900">{locale === 'zh' ? '专业领域' : 'Specialties'}</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {getSurgeonSpecialties(selectedSurgeon, locale).map((spec: string, i: number) => (
                              <Badge key={i} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm px-4 py-1.5 shadow-sm">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {selectedSurgeon.languages && selectedSurgeon.languages.length > 0 && (
                        <div className="px-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Languages className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-lg text-gray-900">{t('hospitalProfile.services.languages', {}, locale)}</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedSurgeon.languages.map((lang: string, i: number) => (
                              <Badge key={i} className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 text-sm px-4 py-1.5">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bio */}
                      {getSurgeonBio(selectedSurgeon, locale, 'intro') && (
                        <div className="px-6">
                          <div className="flex items-center gap-2 mb-3">
                            <User className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-lg text-gray-900">{locale === 'zh' ? '个人简介' : 'Biography'}</h3>
                          </div>
                          <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
                            <p className="text-gray-700 leading-relaxed">{getSurgeonBio(selectedSurgeon, locale, 'intro')}</p>
                          </div>
                        </div>
                      )}

                      {/* Expertise */}
                      {getSurgeonBio(selectedSurgeon, locale, 'expertise') && (
                        <div className="px-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Heart className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-lg text-gray-900">{locale === 'zh' ? '专业特长' : 'Expertise'}</h3>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 shadow-sm border border-blue-100">
                            <p className="text-gray-700 leading-relaxed">{getSurgeonBio(selectedSurgeon, locale, 'expertise')}</p>
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {selectedSurgeon.education && selectedSurgeon.education.length > 0 && (
                        <div className="px-6">
                          <div className="flex items-center gap-2 mb-3">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-lg text-gray-900">{locale === 'zh' ? '教育背景' : 'Education'}</h3>
                          </div>
                          <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
                            <ul className="space-y-3">
                              {selectedSurgeon.education.map((edu: string, i: number) => (
                                <li key={i} className="flex items-start gap-3">
                                  <div className="bg-blue-100 rounded-full p-1.5 mt-0.5">
                                    <CheckCircle2 className="h-3 w-3 text-blue-600" />
                                  </div>
                                  <span className="text-gray-700 flex-1">{edu}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {selectedSurgeon.certifications && selectedSurgeon.certifications.length > 0 && (
                        <div className="px-6 pb-2">
                          <div className="flex items-center gap-2 mb-3">
                            <Award className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-lg text-gray-900">{t('hospitalProfile.services.certifications', {}, locale)}</h3>
                          </div>
                          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 shadow-sm border border-yellow-100">
                            <ul className="space-y-3">
                              {selectedSurgeon.certifications.map((cert: string, i: number) => (
                                <li key={i} className="flex items-start gap-3">
                                  <div className="bg-yellow-100 rounded-full p-1.5 mt-0.5">
                                    <Shield className="h-3 w-3 text-yellow-600" />
                                  </div>
                                  <span className="text-gray-700 flex-1">{cert}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Hospital Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('hospitalProfile.sections.hospitalInformation', {}, locale)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Certifications */}
                  {hospital.certifications && hospital.certifications.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">{t('hospitalProfile.services.certifications', {}, locale)}</p>
                      <div className="flex flex-wrap gap-2">
                        {hospital.certifications.filter((c) => c.isActive).map((cert, idx) => (
                          <Badge key={idx} className="bg-yellow-500 text-yellow-900 text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            {locale === 'zh' ? cert.name : cert.nameEn}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-500">{t('hospitalProfile.info.tier', {}, locale)}</p>
                    <p className="font-medium">{hospital.tier}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">{t('hospitalProfile.info.ownership', {}, locale)}</p>
                    <p className="font-medium">{hospital.ownership_type}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">{t('hospitalProfile.info.location', {}, locale)}</p>
                    <p className="font-medium">{hospital.city}, {hospital.province}</p>
                  </div>

                  {hospital.address && (
                    <div>
                      <p className="text-sm text-gray-500">{t('hospitalProfile.info.address', {}, locale)}</p>
                      <p className="font-medium text-sm">{hospital.address}</p>

                      {/* Google Maps */}
                      <div className="mt-3">
                        <iframe
                          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCEnjuc36JIhgIRx7GXcfV-GX94dmNGdm8&q=${encodeURIComponent(hospital.address + ', ' + hospital.city + ', China')}`}
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="rounded-lg"
                          title={`${hospital.name} Location`}
                        />
                      </div>
                    </div>
                  )}

                  {hospital.bed_count && (
                    <div>
                      <p className="text-sm text-gray-500">{t('hospitalProfile.info.bedCount', {}, locale)}</p>
                      <p className="font-medium">{hospital.bed_count.toLocaleString()}</p>
                    </div>
                  )}

                  {hospital.annual_outpatient_visits && (
                    <div>
                      <p className="text-sm text-gray-500">{t('hospitalProfile.info.annualOutpatients', {}, locale)}</p>
                      <p className="font-medium">{hospital.annual_outpatient_visits.toLocaleString()}</p>
                    </div>
                  )}

                  {hospital.staff_count && (
                    <div>
                      <p className="text-sm text-gray-500">{t('hospitalProfile.info.staffCount', {}, locale)}</p>
                      <p className="font-medium">{hospital.staff_count.toLocaleString()}</p>
                    </div>
                  )}

                  {hospital.international_patients_annually && (
                    <div>
                      <p className="text-sm text-gray-500">{t('hospitalProfile.info.internationalPatients', {}, locale)}</p>
                      <p className="font-medium">{hospital.international_patients_annually.toLocaleString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* International Services */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('hospitalProfile.sections.internationalServices', {}, locale)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Supported Languages */}
                  {hospital.supported_languages && hospital.supported_languages.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{t('hospitalProfile.services.languages', {}, locale)}</p>
                      <div className="flex flex-wrap gap-2">
                        {hospital.supported_languages.map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-sm px-3 py-1">
                            {LANGUAGE_LABELS_MAP[lang]?.[locale] || lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Airport Services */}
                  {hospital.airport_services && hospital.airport_services.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{t('hospitalProfile.services.airportServices', {}, locale)}</p>
                      <div className="flex flex-wrap gap-2">
                        {hospital.airport_services.map((service) => (
                          <span key={service} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded">
                            {AIRPORT_SERVICE_LABELS_MAP[service]?.[locale] || service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Care */}
                  {hospital.followup_care && hospital.followup_care.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{t('hospitalProfile.services.followupCare', {}, locale)}</p>
                      <div className="flex flex-wrap gap-2">
                        {hospital.followup_care.map((care) => (
                          <span key={care} className="text-sm bg-red-50 text-red-700 px-3 py-1 rounded">
                            {FOLLOWUP_CARE_LABELS_MAP[care]?.[locale] || care}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {hospital.amenities && hospital.amenities.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{t('hospitalProfile.services.amenities', {}, locale)}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {hospital.amenities.map((amenity) => (
                          <span key={amenity} className="text-sm bg-yellow-50 text-yellow-800 px-3 py-1 rounded flex items-center gap-1">
                            {getAmenityIcon(amenity)}
                            {AMENITY_LABELS_MAP[amenity]?.[locale] || amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Methods */}
                  {hospital.payment_methods && hospital.payment_methods.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{t('hospitalProfile.services.paymentMethods', {}, locale)}</p>
                      <div className="flex flex-wrap gap-2">
                        {hospital.payment_methods.map((method) => (
                          <span key={method} className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded flex items-center gap-1.5">
                            {getPaymentIcon(method)}
                            {PAYMENT_METHOD_LABELS_MAP[method]?.[locale] || method}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('hospitalProfile.sections.relatedLinks', {}, locale)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hospital.official_website && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={hospital.official_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {t('hospitalProfile.actions.officialWebsite', {}, locale)}
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    </Button>
                  )}

                  <Button className="w-full" onClick={() => setIsQuoteModalOpen(true)}>
                    {t('hospitalProfile.actions.bookConsultation', {}, locale)}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        procedureName={hospital ? hospital.name : ''}
        type="consultation"
      />
    </div>
  );
};

export default HospitalProfile;

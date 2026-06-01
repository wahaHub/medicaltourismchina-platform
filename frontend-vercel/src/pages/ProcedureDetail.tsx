import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServicesSection from "@/components/ServicesSection";
import QuoteRequestModal from "@/components/QuoteRequestModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { 
  AlertTriangle, 
  Check,
  X,
  Clock,
  DollarSign,
  Calendar,
  ChevronRight,
  MapPin,
  Users,
  Shield,
  HeartHandshake,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getImageUrl, IMAGE_PATHS, getHighResImageUrl, getProgressiveBaseFromUrl } from "@/utils/imageUrl";
import ProgressiveImage from "@/components/ProgressiveImage";

// Real API procedure data structure
interface ProcedureData {
  id: string;
  slug: string;
  name: string;
  disease_id: string;
  disease_slug: string;
  disease_name: string;
  department_id: string;
  department_slug: string;
  department_name: string;
  waiting_time: string;
  avg_wait_days: string;
  price_min: string | null;
  price_max: string;
  cost_usd: string;
  stay_at_hospital: string;
  stay_at_hotel: string;
  stay_in_china: string;
  description?: string;
  summary?: string;
  surgery_detailed_description?: string;
  when_is_needed?: string;
  preparation_before_surgery: string;
  recovery_process: string;
  surgery_options: string;
  faqs: Record<string, string>;
  surgery_steps: {
    steps: Array<{
      step: number;
      text: string;
      guidance?: string;
    }>;
  };
  recovery_steps: {
    steps: Array<{
      step: number;
      text: string;
    }>;
  };
  image_url: string | null;
  surgery_image_url?: string | null;
  recovery_image_url?: string | null;
  updated_at: string;
}

interface ApiResponse {
  data: ProcedureData[];
  meta: {
    requested_locale: string;
    resolved_locale: string;
    total: number;
    generated_at: string;
  };
}

// Hash function to select background image based on procedure name
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const ProcedureDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getApiLocale, t } = useLanguage();
  const [procedureData, setProcedureData] = useState<ProcedureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  useEffect(() => {
    const loadProcedureDetail = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Make API call to fetch procedure data
        const apiUrl = import.meta.env.VITE_CONTENT_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'https://api.medicaltourismchina.health';
        const response = await fetch(`${apiUrl}/procedures/${slug}?locale=${getApiLocale()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch procedure data');
        }
        
        const apiData: ApiResponse = await response.json();
        
        if (!apiData.data || apiData.data.length === 0) {
          throw new Error('Procedure not found');
        }
        
        // Use the first procedure from the response
        const procedure = apiData.data[0];
        setProcedureData(procedure);
        document.title = `${procedure.name} | MedChina`;
      } catch (err) {
        setError('Failed to load procedure details. Please try again.');
        console.error('Error loading procedure:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProcedureDetail();
  }, [slug, getApiLocale]);

  // Helper function to parse cost string
  const parseCostRange = (costString?: string) => {
    if (!costString) return { min: 0, max: 0, display: 'Contact for pricing' };
    const numbers = costString.match(/\d+,?\d*/g);
    if (numbers && numbers.length >= 2) {
      return {
        min: parseInt(numbers[0].replace(',', '')),
        max: parseInt(numbers[1].replace(',', '')),
        display: costString
      };
    }
    return { min: 0, max: 0, display: costString || 'Contact for pricing' };
  };

  // Handler for opening image modal
  const handleImageClick = (imageUrl: string) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-[112px] sm:pt-[120px]">
        <TopBanner />
        <Header />
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Skeleton className="h-12 w-3/4 mb-6" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-64 w-full mb-6" />
                <Skeleton className="h-48 w-full" />
              </div>
              <div>
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !procedureData) {
    return (
      <div className="min-h-screen pt-[112px] sm:pt-[120px]">
        <TopBanner />
        <Header />
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Alert className="max-w-2xl mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error || 'Procedure not found'}</AlertDescription>
            </Alert>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const cost = parseCostRange(procedureData.cost_usd);
  
  // Select background image based on procedure name hash
  const backgroundImageNumber = (hashString(procedureData.name || '') % 18) + 1;
  // Use CloudFront URL for background image
  const backgroundImageUrl = getImageUrl(IMAGE_PATHS.searchTopbar[backgroundImageNumber as keyof typeof IMAGE_PATHS.searchTopbar]);

  return (
    <div className="min-h-screen bg-gray-50 pt-[112px] sm:pt-[120px]">
      <TopBanner />
      <Header />
      
      {/* Hero Section with Background Image */}
      <div 
        className="relative bg-cover bg-center py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImageUrl})`,
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Unified pill-shaped container with halfmoon background */}
            <div 
              className="relative overflow-hidden shadow-2xl"
              style={{
                borderRadius: '9999px', // Full pill shape
                minHeight: '120px', // Ensure minimum height for content
              }}
            >
              {/* Halfmoon as background - showing 2/3 from left side */}
              <div 
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage: `url(${getImageUrl(IMAGE_PATHS.procedureDetail.halfmoon)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: '-33% center', 
                  backgroundRepeat: 'no-repeat',
                }}
              />
              
                            {/* Content overlay */}
              <div className="relative z-10 px-6 md:px-10 py-8 text-white">
                <div className="flex flex-col items-center text-center gap-6">
                  {/* Title */}
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                    {procedureData.name + ' ' + t('procedureDetail.costInChina')}
                  </h1>

                  {/* Stats */}
                  <div className="flex items-center gap-4 md:gap-8">
                    {/* Waiting time */}
                    <div className="text-center">
                      <div className="text-white/80 text-xs md:text-sm">{t('procedureDetail.approxWaitingTime')}</div>
                      <div className="text-lg md:text-xl font-bold text-mintGreen">
                        {procedureData.waiting_time || '—'}
                      </div>
                    </div>

                    {/* Divider */}
                    <span className="w-px h-8 bg-white/40" />

                    {/* Cost */}
                    <div className="text-center">
                      <div className="text-white/80 text-xs md:text-sm">{t('procedureDetail.approxCost')}</div>
                      <div className="text-lg md:text-xl font-bold text-mintGreen">
                        {procedureData.cost_usd || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>

      {/* Stay Required and Services Section */}
      <div className="bg-white py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Mobile View: Compact 3-Column Grid */}
            <div className="md:hidden grid grid-cols-3 gap-2 items-stretch">
              {/* Included Services - Mobile */}
              <div className="rounded-lg p-2 bg-[#f0f5f6] flex flex-col">
                <h3 className="text-[10px] font-bold text-gray-800 mb-2 text-center uppercase tracking-tight">
                  Included
                </h3>
                <ul className="space-y-1.5 flex-1">
                  <li className="flex items-start gap-1">
                    <Check className="h-2.5 w-2.5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-[9px] leading-3 text-gray-600">Pre-op</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <Check className="h-2.5 w-2.5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-[9px] leading-3 text-gray-600">Surgery</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <Check className="h-2.5 w-2.5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-[9px] leading-3 text-gray-600">Hospital Stay</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <Check className="h-2.5 w-2.5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-[9px] leading-3 text-gray-600">Post-op</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <Check className="h-2.5 w-2.5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-[9px] leading-3 text-gray-600">Team</span>
                  </li>
                </ul>
              </div>

              {/* Not Included - Mobile */}
              <div className="rounded-lg p-2 bg-[#f0f5f6] flex flex-col">
                <h3 className="text-[10px] font-bold text-gray-800 mb-2 text-center uppercase tracking-tight">
                  Not Included
                </h3>
                <ul className="space-y-1.5 flex-1">
                  <li className="flex items-start gap-1">
                    <X className="h-2.5 w-2.5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-[9px] leading-3 text-gray-600">Flights</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <X className="h-2.5 w-2.5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-[9px] leading-3 text-gray-600">Hotel</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <X className="h-2.5 w-2.5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-[9px] leading-3 text-gray-600">Personal</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <X className="h-2.5 w-2.5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-[9px] leading-3 text-gray-600">Insurance</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <X className="h-2.5 w-2.5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-[9px] leading-3 text-gray-600">Visa</span>
                  </li>
                </ul>
              </div>

              {/* Stay Required - Mobile */}
              <div className="rounded-lg p-2 bg-[#f0f5f6] flex flex-col">
                <h3 className="text-[10px] font-bold text-gray-800 mb-2 text-center uppercase tracking-tight">
                  Duration
                </h3>
                <div className="space-y-2 flex-1">
                  <div>
                    <div className="text-[8px] text-gray-500 uppercase">Hospital</div>
                    <div className="text-[9px] font-medium text-gray-700 leading-3">{procedureData.stay_at_hospital || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[8px] text-gray-500 uppercase">Hotel</div>
                    <div className="text-[9px] font-medium text-gray-700 leading-3">{procedureData.stay_at_hotel || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[8px] text-gray-500 uppercase">Total</div>
                    <div className="text-[9px] font-medium text-gray-700 leading-3">{procedureData.stay_in_china || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop View: Original Grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-8">
              {/* Included Services */}
              <div className="rounded-xl p-6" style={{backgroundColor: 'rgb(240, 245, 246)'}}>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  {t('procedureDetail.includedServices')}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-light text-gray-600">{t('procedureDetail.services.preOperative')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-light text-gray-600">{t('procedureDetail.services.surgeryAnesthesia')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-light text-gray-600">{t('procedureDetail.services.hospitalAccommodation')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-light text-gray-600">{t('procedureDetail.services.postOperativeCare')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-light text-gray-600">{t('procedureDetail.services.medicalTeam')}</span>
                  </li>
                </ul>
              </div>
              
              {/* Excluded Services */}
              <div className="rounded-xl p-6" style={{backgroundColor: 'rgb(240, 245, 246)'}}>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  {t('procedureDetail.notIncluded')}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-light text-gray-600">{t('procedureDetail.notIncluded.travel')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-light text-gray-600">{t('procedureDetail.notIncluded.hotelStay')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-light text-gray-600">{t('procedureDetail.notIncluded.personalExpenses')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-light text-gray-600">{t('procedureDetail.notIncluded.insurance')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-light text-gray-600">{t('procedureDetail.notIncluded.visaFees')}</span>
                  </li>
                </ul>
              </div>

              {/* Stay Required */}
              <div className="rounded-xl p-6" style={{backgroundColor: 'rgb(240, 245, 246)'}}>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  {t('procedureDetail.stayRequired')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-light text-gray-600 flex-shrink-0" style={{minWidth: '90px'}}>{t('procedureDetail.hospital')}</span>
                    <span className="text-sm font-light text-gray-600 flex-1">{procedureData.stay_at_hospital || '—'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-light text-gray-600 flex-shrink-0" style={{minWidth: '90px'}}>{t('procedureDetail.hotel')}</span>
                    <span className="text-sm font-light text-gray-600 flex-1">{procedureData.stay_at_hotel || '—'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-light text-gray-600 flex-shrink-0" style={{minWidth: '90px'}}>{t('procedureDetail.totalInChina')}</span>
                    <span className="text-sm font-light text-gray-600 flex-1">{procedureData.stay_in_china || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <ServicesSection onQuoteRequest={() => setIsQuoteModalOpen(true)} />

      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Main Content */}
            <div className="space-y-8">
              
              {/* What is the Procedure Section */}
              <div className="py-4 md:py-8">
                <h2 className="text-xl md:text-3xl font-bold text-center mb-4 md:mb-8">{t('procedureDetail.whatIs')} {procedureData.name}?</h2>
                
                {/* Mobile View: Float Layout */}
                <div className="block md:hidden">
                  <ProgressiveImage
                    baseUrl={getProgressiveBaseFromUrl(procedureData.image_url) || ''}
                    alt="Medical Professional"
                    resolutionLevels={['x1', 'x2']}
                    fallbackUrl={getImageUrl(IMAGE_PATHS.procedureDetail.medicalEscort)}
                    className="float-right w-[40%] ml-3 mb-2 rounded-lg object-cover aspect-[3/4]"
                    imgProps={{ onClick: () => handleImageClick(getHighResImageUrl(procedureData.image_url) || getImageUrl(IMAGE_PATHS.procedureDetail.medicalEscort)) }}
                  />
                  <div className="relative">
                    <img 
                      src={getImageUrl(IMAGE_PATHS.procedureDetail.comma)} 
                      alt="Quote"
                      className="w-6 h-6 opacity-60 absolute -top-1 -left-1"
                    />
                    <p className="text-gray-700 leading-relaxed text-xs pt-4 pl-6 mb-3 font-light text-justify">
                      {procedureData.surgery_detailed_description}
                    </p>
                    {procedureData.when_is_needed && (
                      <p className="text-gray-600 leading-relaxed text-xs font-light text-justify">
                        {procedureData.when_is_needed}
                      </p>
                    )}
                  </div>
                  <div className="clear-both"></div>
                </div>

                {/* Desktop View: Flex Layout */}
                <div className="hidden md:flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/2 relative">
                    <img 
                      src={getImageUrl(IMAGE_PATHS.procedureDetail.comma)} 
                      alt="Quote"
                      className="w-8 h-8 opacity-60 absolute -top-2 -left-2"
                    />
                    <div className="pt-4 pl-12">
                      <p className="text-gray-700 leading-relaxed text-sm mb-4 font-extralight">
                        {procedureData.surgery_detailed_description}
                      </p>
                      {procedureData.when_is_needed && (
                        <p className="text-gray-600 leading-relaxed text-sm font-extralight">
                          {procedureData.when_is_needed}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="lg:w-1/2 flex-shrink-0">
                    <ProgressiveImage
                      baseUrl={getProgressiveBaseFromUrl(procedureData.image_url) || ''}
                      alt="Medical Professional"
                      resolutionLevels={['x1', 'x2']}
                      fallbackUrl={getImageUrl(IMAGE_PATHS.procedureDetail.medicalEscort)}
                      className="w-full min-h-[300px] sm:min-h-[460px] h-full object-contain rounded-2xl cursor-pointer hover:opacity-95 transition-opacity"
                      imgProps={{ onClick: () => handleImageClick(getHighResImageUrl(procedureData.image_url) || getImageUrl(IMAGE_PATHS.procedureDetail.medicalEscort)) }}
                    />
                  </div>
                </div>
              </div>



              {/* How it's Done - Surgery Steps */}
              {procedureData.surgery_steps?.steps && procedureData.surgery_steps.steps.length > 0 && (
                <div className="py-4 md:py-8">
                  <h2 className="text-xl md:text-3xl font-bold text-center mb-4 md:mb-8">{t('procedureDetail.howPerformed')} {procedureData.name} {t('procedureDetail.performed')}</h2>
                  
                  {/* Mobile View */}
                  <div className="block md:hidden">
                    <ProgressiveImage
                      baseUrl={getProgressiveBaseFromUrl(procedureData.surgery_image_url) || ''}
                      alt="Surgery Procedure"
                      resolutionLevels={['x1', 'x2']}
                      fallbackUrl={getImageUrl(IMAGE_PATHS.procedureDetail.surgeryPlaceholder)}
                      className="float-right w-[40%] ml-3 mb-2 rounded-lg object-cover aspect-[3/4]"
                      imgProps={{ onClick: () => handleImageClick(getHighResImageUrl(procedureData.surgery_image_url) || getImageUrl(IMAGE_PATHS.procedureDetail.surgeryPlaceholder)) }}
                    />
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed text-xs font-light text-justify">
                        {procedureData.surgery_detailed_description}
                      </p>
                    </div>
                    <div className="clear-both"></div>
                    
                    {/* Compact Steps */}
                    <div className="space-y-2">
                      {procedureData.surgery_steps.steps.slice(0, 4).map((step, index) => (
                        <div 
                          key={index} 
                          className="rounded-xl p-3 border border-gray-100 shadow-sm bg-white"
                        >
                          <div className="flex gap-3 items-start">
                            <div className="flex-shrink-0 mt-0.5">
                              <span className="text-teal-600 font-bold text-xs whitespace-nowrap bg-teal-50 px-1.5 py-0.5 rounded">Step {index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-700 text-xs font-light leading-relaxed">
                                {step.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:flex flex-col lg:flex-row gap-8">
                    {/* Left side - Description and Steps */}
                    <div className="lg:w-1/2 flex flex-col">
                      {/* Description */}
                      <div className="mb-8">
                        <p className="text-gray-700 leading-relaxed text-sm font-extralight">
                          {procedureData.surgery_detailed_description}
                        </p>
                      </div>
                      
                      {/* Steps */}
                      <div className="space-y-4">
                        {procedureData.surgery_steps.steps.slice(0, 4).map((step, index) => (
                          <div 
                            key={index} 
                            className="rounded-3xl p-6"
                            style={{
                              backgroundImage: `url(${getImageUrl(IMAGE_PATHS.procedureDetail.stepBackground)})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            }}
                          >
                            <div className="flex gap-4 items-center">
                              <div className="flex-shrink-0">
                                <div className="w-20 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <span className="text-gray-600 font-bold text-sm whitespace-nowrap">STEP {index + 1}.</span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-700 text-sm font-extralight leading-relaxed">
                                  {step.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Right side - Large image */}
                    <div className="lg:w-1/2 flex-shrink-0">
                      <ProgressiveImage
                        baseUrl={getProgressiveBaseFromUrl(procedureData.surgery_image_url) || ''}
                        alt="Surgery Procedure"
                        resolutionLevels={['x1', 'x2']}
                        fallbackUrl={getImageUrl(IMAGE_PATHS.procedureDetail.surgeryPlaceholder)}
                        className="w-full min-h-[300px] sm:min-h-[460px] h-full object-contain rounded-2xl cursor-pointer hover:opacity-95 transition-opacity"
                        imgProps={{ onClick: () => handleImageClick(getHighResImageUrl(procedureData.surgery_image_url) || getImageUrl(IMAGE_PATHS.procedureDetail.surgeryPlaceholder)) }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Recovery Process */}
              {procedureData.recovery_process && (
                <div className="py-4 md:py-8">
                  <h2 className="text-xl md:text-3xl font-bold text-center mb-4 md:mb-8">{t('procedureDetail.recoveryProcess')}</h2>

                  {/* Mobile View */}
                  <div className="block md:hidden">
                    <ProgressiveImage
                      baseUrl={getProgressiveBaseFromUrl(procedureData.recovery_image_url) || ''}
                      alt="Recovery Process"
                      resolutionLevels={['x1', 'x2']}
                      fallbackUrl={getImageUrl(IMAGE_PATHS.procedureDetail.recoveryPlaceholder)}
                      className="float-right w-[40%] ml-3 mb-2 rounded-lg object-cover aspect-[3/4]"
                      imgProps={{ onClick: () => handleImageClick(getHighResImageUrl(procedureData.recovery_image_url) || getImageUrl(IMAGE_PATHS.procedureDetail.recoveryPlaceholder)) }}
                    />
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed text-xs font-light text-justify">
                        {procedureData.recovery_process}
                      </p>
                    </div>
                    <div className="clear-both"></div>
                    
                    {/* Compact Recovery Steps */}
                    {procedureData.recovery_steps?.steps && procedureData.recovery_steps.steps.length > 0 && (
                      <div className="space-y-2">
                        {procedureData.recovery_steps.steps.slice(0, 4).map((step, index) => (
                          <div 
                            key={index} 
                            className="rounded-xl p-3 border border-gray-100 shadow-sm bg-white"
                          >
                            <div className="flex gap-3 items-start">
                              <div className="flex-shrink-0 mt-0.5">
                                <span className="text-teal-600 font-bold text-xs whitespace-nowrap bg-teal-50 px-1.5 py-0.5 rounded">Step {index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-700 text-xs font-light leading-relaxed">
                                  {step.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:flex flex-col lg:flex-row gap-8">
                    {/* Left side - Description and Steps */}
                    <div className="lg:w-1/2 flex flex-col">
                      {/* Description */}
                      <div className="mb-8">
                        <p className="text-gray-700 leading-relaxed text-sm font-extralight">
                          {procedureData.recovery_process}
                        </p>
                      </div>
                      
                      {/* Recovery Steps */}
                      {procedureData.recovery_steps?.steps && procedureData.recovery_steps.steps.length > 0 && (
                        <div className="space-y-4">
                          {procedureData.recovery_steps.steps.slice(0, 4).map((step, index) => (
                            <div 
                              key={index} 
                              className="rounded-3xl p-6"
                              style={{
                                backgroundImage: `url(${getImageUrl(IMAGE_PATHS.procedureDetail.stepBackground)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                              }}
                            >
                              <div className="flex gap-4 items-center">
                                <div className="flex-shrink-0">
                                  <div className="w-20 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-600 font-bold text-sm whitespace-nowrap">STEP {index + 1}.</span>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-700 text-sm font-extralight leading-relaxed">
                                    {step.text}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Right side - Large image */}
                    <div className="lg:w-1/2 flex-shrink-0">
                      <ProgressiveImage
                        baseUrl={getProgressiveBaseFromUrl(procedureData.recovery_image_url) || ''}
                        alt="Recovery Process"
                        resolutionLevels={['x1', 'x2']}
                        fallbackUrl={getImageUrl(IMAGE_PATHS.procedureDetail.recoveryPlaceholder)}
                        className="w-full min-h-[300px] sm:min-h-[460px] h-full object-contain rounded-2xl cursor-pointer hover:opacity-95 transition-opacity"
                        imgProps={{ onClick: () => handleImageClick(getHighResImageUrl(procedureData.recovery_image_url) || getImageUrl(IMAGE_PATHS.procedureDetail.recoveryPlaceholder)) }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* FAQs */}
              {procedureData.faqs && Object.keys(procedureData.faqs).length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold mb-6">{t('procedureDetail.faqs')}</h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {Object.entries(procedureData.faqs).map(([question, answer], index) => (
                      <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-left hover:no-underline">
                          <span className="font-medium">{question}</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-600">{answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

            </div>


          </div>
        </div>
      </div>
      

      
      {/* Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogPortal>
          <DialogOverlay 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            onClick={() => setIsModalOpen(false)}
          />
          <DialogPrimitive.Content 
            className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] focus:outline-none"
            onPointerDownOutside={() => setIsModalOpen(false)}
            onEscapeKeyDown={() => setIsModalOpen(false)}
          >
            <div className="relative">
              {modalImage && (
                <img 
                  src={modalImage}
                  alt="Enlarged view"
                  className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {/* Close button - more prominent */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-12 right-0 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 border border-white/20"
                aria-label="Close"
              >
                <X className="h-8 w-8" />
              </button>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        procedureName={procedureData?.name}
      />

      <Footer />
    </div>
  );
};

export default ProcedureDetailPage; 

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import TopUtilityBar from "@/components/TopUtilityBar";
import MainNavigation from "@/components/MainNavigation";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  ExternalLink, 
  MapPin, 
  Languages, 
  Calendar,
  DollarSign,
  Building2,
  Bed,
  Stethoscope,
  Award,
  Settings,
  HelpCircle,
  Link
} from "lucide-react";
import { apiService, CenterDetail } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";

const CenterDetailPage = () => {
  const { getApiLocale } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const diseaseSlug = searchParams.get("disease");
  
  const [centerData, setCenterData] = useState<CenterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCenterDetail = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getCenterDetail(slug, getApiLocale(), diseaseSlug || undefined);
        setCenterData(response.data);
        
        document.title = `${response.data.center.name} | Medora Health`;
      } catch (err) {
        setError('Failed to load center details. Please try again.');
        console.error('Error loading center:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCenterDetail();
  }, [slug, diseaseSlug, getApiLocale]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopUtilityBar />
        <MainNavigation />
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

  if (error || !centerData) {
    return (
      <div className="min-h-screen">
        <TopUtilityBar />
        <MainNavigation />
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Alert className="max-w-2xl mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error || 'Center not found'}</AlertDescription>
            </Alert>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { center } = centerData;
  const displayName = center.name || center.name_official;

  return (
    <div className="min-h-screen">
      <TopUtilityBar />
      <MainNavigation />
      
      {/* Hero Section */}
      <div className="bg-white py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                {center.logo_url && (
                  <img 
                    src={center.logo_url} 
                    alt={`${displayName} logo`}
                    className="w-16 h-16 object-contain rounded-lg"
                  />
                )}
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {displayName}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{center.city}, {center.province}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Languages className="h-4 w-4" />
                      <span>Languages: {center.serving_languages?.join(', ') || 'Not specified'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {centerData.badges?.filter(badge => badge && badge.code && badge.label).map((badge, index) => (
                      <Badge 
                        key={index} 
                        className={`${
                          badge.code === '3A' ? 'bg-red-600' : 
                          badge.code === 'JCI' ? 'bg-blue-600' : 'bg-green-600'
                        } text-white`}
                      >
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-2">
                    International patient coordination · Multidisciplinary care (MDT)
                  </p>
                  <p className="text-sm text-gray-500">
                    Educational only; plans set by the treating hospital.
                  </p>
                </div>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-64">
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  const applyUrl = diseaseSlug 
                    ? `/apply?center=${slug}&disease=${diseaseSlug}`
                    : `/apply?center=${slug}`;
                  window.open(applyUrl, '_self');
                }}
              >
                Request Eligibility Review
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.open(center.website_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Website
                </Button>
                <Button variant="outline" size="icon">
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      {center.albums && center.albums.length > 0 && (
        <div className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {center.albums.map((photo, index) => (
                <div key={index} className="relative group overflow-hidden rounded-lg">
                  <img
                    src={photo.url}
                    alt={photo.alt}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
                  <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {photo.alt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* At-a-glance Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    At a Glance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {centerData.at_a_glance.metrics.annual_surgeries.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Annual Surgeries</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {centerData.at_a_glance.metrics.inpatients.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Inpatients</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {centerData.at_a_glance.metrics.beds_total.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Beds</div>
                    </div>

                  </div>

                </CardContent>
              </Card>





              {/* Technology & Facilities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Technology & Facilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {centerData.technology?.modalities?.map((modality, index) => (
                      <Badge key={index} variant="secondary">
                        {modality}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-gray-700">{centerData.technology?.summary_md || 'Technology information not available'}</p>
                </CardContent>
              </Card>

              {/* Patient Journey */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="h-5 w-5" />
                    Patient Journey at this Center
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{centerData.patient_journey_md}</p>
                </CardContent>
              </Card>

              {/* FAQs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {centerData.faq.map((faq, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                      <p className="text-gray-700">{faq.answer_md}</p>
                      {index < centerData.faq.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>


            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accreditations</span>
                    <span className="font-medium">{centerData.badges?.filter(badge => badge && badge.code).length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Technology</span>
                    <span className="font-medium">{centerData.technology?.modalities?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Languages</span>
                    <span className="font-medium">{center.serving_languages?.length || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Get Started</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      const applyUrl = diseaseSlug 
                        ? `/apply?center=${slug}&disease=${diseaseSlug}`
                        : `/apply?center=${slug}`;
                      window.open(applyUrl, '_self');
                    }}
                  >
                    Request Consultation
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(center.website_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Official Website
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Legal Footer */}
          <div className="mt-12 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              Educational content only. Eligibility, plan and pricing are determined by the treating hospital after clinical evaluation. No outcome guarantees.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CenterDetailPage; 
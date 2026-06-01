
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HospitalsHeroEnhanced } from "@/components/hospitals";
import HospitalCard from "@/components/HospitalCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiService, Hospital } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { LOW_MEDIA_BASE_URL } from "@/config/media";

const Hospitals = () => {
  const { t, getApiLocale } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const city = searchParams.get("city");
  const search = searchParams.get("search");

  // Available cities - using English city names for clean URLs
  const cities = [
    { value: 'all', label: t('cities.all'), zhName: '' },
    { value: 'beijing', label: t('cities.beijing'), zhName: '北京' },
    { value: 'shanghai', label: t('cities.shanghai'), zhName: '上海' },
    { value: 'guangzhou', label: t('cities.guangzhou'), zhName: '广州' },
    { value: 'shenzhen', label: t('cities.shenzhen'), zhName: '深圳' },
    { value: 'chengdu', label: t('cities.chengdu'), zhName: '成都' },
    { value: 'chongqing', label: t('cities.chongqing'), zhName: '重庆' },
  ];
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(24);
  const [totalHospitals, setTotalHospitals] = useState(0);

  // Load hospitals based on query params and pagination
  useEffect(() => {
    const loadHospitals = async () => {
      try {
        setLoading(true);
        setError(null);

        const offset = (currentPage - 1) * pageSize;

        const response = await apiService.getHospitals({
          locale: getApiLocale(),
          city: city, // 直接传递英文城市名
          search: search || undefined,
          limit: pageSize,
          offset: offset
        });

        setHospitals(response.data);
        setTotalHospitals(response.meta?.pagination?.total || 0);

        // Set page title based on filters
        const cityDisplayName = city ? cities.find(c => c.value === city)?.label : null;
        if (cityDisplayName) {
          document.title = `${cityDisplayName} Hospitals | MedChina`;
        } else if (search) {
          document.title = `Search: ${search} | MedChina`;
        } else {
          document.title = "All Hospitals | MedChina";
        }
      } catch (err) {
        setError('Failed to load hospitals. Please try again.');
        console.error('Error loading hospitals:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHospitals();
  }, [city, search, currentPage, pageSize, getApiLocale]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [city, search]);

  const handleGoToSearch = () => {
    navigate('/search');
  };

  const handleCityChange = (newCity: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newCity && newCity !== 'all') {
      newSearchParams.set('city', newCity);
    } else {
      newSearchParams.delete('city');
    }
    setSearchParams(newSearchParams);
  };

  // 不再需要转换函数，数据库现在直接支持英文城市名

  return (
    <div className="min-h-screen">
      <TopBanner />
      <Header />
      
      <HospitalsHeroEnhanced
        cities={cities}
        selectedCity={city || 'all'}
        onCityChange={handleCityChange}
        search={search || undefined}
        totalHospitals={totalHospitals}
      />

      {/* Content Section with Background Pattern */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#F5F7F6]"></div>
          <img
            src={`${LOW_MEDIA_BASE_URL}/hospitals/hospital_bg_x2.png`}
            alt="Wave Pattern Background"
            className="w-full h-full object-cover opacity-90"
          />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 container mx-auto px-4">
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <Alert className="max-w-2xl mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : hospitals.length > 0 ? (
            <>
              {/* Section Title - Only show when no filters */}
              {!city && !search && (
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#14B8A6] mb-3 sm:mb-4">
                    {t('hospitals.allHospitalsTitle')}
                  </h2>
                  <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto px-4">
                    {t('hospitals.allHospitalsDesc')}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {hospitals.map((hospital) => (
                  <HospitalCard
                    key={hospital.id}
                    hospitalData={hospital}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {totalHospitals > pageSize && (
                <div className="mt-8 flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    {t('common.previous')}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, Math.ceil(totalHospitals / pageSize)) }, (_, i) => {
                      const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      const totalPages = Math.ceil(totalHospitals / pageSize);
                      
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    {Math.ceil(totalHospitals / pageSize) > 5 && currentPage < Math.ceil(totalHospitals / pageSize) - 2 && (
                      <>
                        <span className="px-2">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.ceil(totalHospitals / pageSize))}
                          className="w-10"
                        >
                          {Math.ceil(totalHospitals / pageSize)}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    disabled={currentPage === Math.ceil(totalHospitals / pageSize)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              )}
              
              {/* Page info */}
              <div className="mt-4 text-center text-sm text-gray-500">
                {t('hospitals.showingInfo', { 
                  start: ((currentPage - 1) * pageSize) + 1, 
                  end: Math.min(currentPage * pageSize, totalHospitals), 
                  total: totalHospitals 
                })}
              </div>
              
              {/* Information disclaimer */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>{t('hospitals.disclaimerTitle')}:</strong> {t('hospitals.disclaimerText')}
                </p>
              </div>
            </>
          ) : (city || search) ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('hospitals.noHospitalsFound')}</h3>
              <p className="text-gray-600">
                {city && city !== 'all'
                  ? t('hospitals.noHospitalsInCity', { city: cities.find(c => c.value === city)?.label })
                  : search
                  ? t('hospitals.noHospitalsMatching', { search })
                  : t('hospitals.noHospitalsAvailable')
                }
              </p>
              <Button className="mt-4" onClick={handleGoToSearch}>
                {t('hospitals.tryAnotherSearch')}
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('hospitals.exploreTitle')}</h3>
              <p className="text-gray-600 mb-4">
                {t('hospitals.exploreDesc')}
              </p>
              <Button onClick={handleGoToSearch}>
                {t('hospitals.searchBySpecialty')}
              </Button>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Hospitals;

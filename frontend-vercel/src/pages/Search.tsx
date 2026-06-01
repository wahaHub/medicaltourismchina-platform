import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  AlertTriangle
} from 'lucide-react';
import TopBanner from '@/components/TopBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SearchHeroEnhanced, ProcedureListModal } from '@/components/search';
import { LOW_MEDIA_BASE_URL } from "@/config/media";
import DepartmentCombobox from '@/components/DepartmentCombobox';
import DiseaseCombobox, { Disease } from '@/components/DiseaseCombobox';
import EntityCard from '@/components/EntityCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiService, Department, ProcedureCard as ProcedureCardType } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRef } from 'react';
import { getLowResImageUrl, getProgressiveBaseFromUrl } from '@/utils/imageUrl';
import ProgressiveImage from '@/components/ProgressiveImage';

const Search = () => {
  const { getApiLocale, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<string>('');
  const [procedures, setProcedures] = useState<ProcedureCardType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [diseaseSearchTerm, setDiseaseSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [diseasesLoading, setDiseasesLoading] = useState(false);
  const [proceduresLoading, setProceduresLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldAnimateButton, setShouldAnimateButton] = useState(false);
  const [shouldAnimateDiseaseInput, setShouldAnimateDiseaseInput] = useState(false);
  const navigate = useNavigate();
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [cols, setCols] = useState<number>(3); // responsive grid columns for disease grid
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Initialize from URL params
  useEffect(() => {
    const deptFromUrl = searchParams.get('dept');
    const diseaseFromUrl = searchParams.get('disease');
    if (deptFromUrl) {
      setSelectedDepartment(deptFromUrl);
    }
    if (diseaseFromUrl) {
      setSelectedDisease(diseaseFromUrl);
    }
  }, [searchParams]);

  // Load departments on component mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getDept(getApiLocale());
        setDepartments(response.data);
      } catch (err) {
        console.error('Failed to load departments:', err);
        setError(t('search.error.loadDepartments'));
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, [getApiLocale]);

  // Load diseases when department is selected
  useEffect(() => {
    const loadDiseases = async () => {
      if (!selectedDepartment) {
        setDiseases([]);
        // Only clear disease if there's no disease in URL
        const diseaseFromUrl = searchParams.get('disease');
        if (!diseaseFromUrl) {
          setSelectedDisease('');
        }
        return;
      }

      setError(null);
      setDiseasesLoading(true);
      
      try {
        // Load diseases (critical for dropdown)
        const diseasesResponse = await apiService.getDiseasesByDepartment(selectedDepartment, getApiLocale());
        setDiseases(diseasesResponse.data as any);
      } catch (err) {
        console.error('Failed to load diseases:', err);
        setDiseases([]);
      } finally {
        setDiseasesLoading(false);
      }
    };

    loadDiseases();
  }, [selectedDepartment, getApiLocale]);

  // Handle URL disease parameter after diseases are loaded
  useEffect(() => {
    const diseaseFromUrl = searchParams.get('disease');
    if (diseaseFromUrl && diseases.length > 0 && diseases.some(d => d.slug === diseaseFromUrl)) {
      setSelectedDisease(diseaseFromUrl);
    }
  }, [diseases, searchParams]);

  // Load procedures when disease is selected
  useEffect(() => {
    const loadProcedures = async () => {
      if (!selectedDisease) {
        setProcedures([]);
        return;
      }

      try {
        setProceduresLoading(true);
        setError(null);
        
        const response = await apiService.getProceduresByDisease(selectedDisease, getApiLocale());
        setProcedures(response.data as any);
      } catch (err) {
        console.error('Failed to load procedures:', err);
        setError('Failed to load procedures');
      } finally {
        setProceduresLoading(false);
      }
    };

    loadProcedures();
  }, [selectedDisease, getApiLocale]);

  // Handle department selection
  const handleDepartmentChange = (departmentSlug: string) => {
    setSelectedDepartment(departmentSlug);
    setSelectedDisease(''); // Clear disease when department changes
    setProcedures([]); // Clear procedures
    setSearchParams({ dept: departmentSlug });
    
    // Trigger initial button animation
    setShouldAnimateButton(true);
    setTimeout(() => setShouldAnimateButton(false), 1000); // Animation lasts 1 second
    
    // Also trigger disease input animation when department is selected
    setTimeout(() => {
      setShouldAnimateDiseaseInput(true);
      setTimeout(() => setShouldAnimateDiseaseInput(false), 1500);
    }, 500); // Small delay after department selection
  };

  // Handle disease selection
  const handleDiseaseChange = (diseaseSlug: string) => {
    setSelectedDisease(diseaseSlug);
    if (diseaseSlug) {
      setSearchParams({ dept: selectedDepartment, disease: diseaseSlug });
      // 移动版打开modal
      if (isMobile) {
        setShowModal(true);
      }
    } else {
      setSearchParams({ dept: selectedDepartment });
      setShowModal(false);
    }
  };

  // Periodic button animation when department is selected
  useEffect(() => {
    if (!selectedDepartment) return;

    const interval = setInterval(() => {
      setShouldAnimateButton(true);
      setTimeout(() => setShouldAnimateButton(false), 1000);
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [selectedDepartment]);

  // Handle search term change (local search)
  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
  };

  // Handle search for hospitals button click
  const handleSearchHospitals = () => {
    if (selectedDepartment) {
      let url = `/hospitals?dept=${selectedDepartment}`;
      if (selectedDisease) {
        url += `&disease=${selectedDisease}`;
      }
      navigate(url);
    }
  };

  // Get selected department info
  const selectedDept = departments.find(dept => dept.slug === selectedDepartment);
  
  // Get selected disease info
  const selectedDis = diseases.find(dis => dis.slug === selectedDisease);

  const LOW_MEDIA_BASE = `${(import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL || 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev').replace(/\/+$/, '')}/low`;

  // Progressive image base URL (without _x1/_x2/_x3 suffix) for use with EntityCard's progressiveBaseUrl
  const getDiseaseProgressiveBase = (id: string) => `${LOW_MEDIA_BASE}/disease/${id}`;
  const getDepartmentProgressiveBase = (id: string) => `${LOW_MEDIA_BASE}/department/${id}`;

  const getDepartmentImageUrl = (id: string) => `${LOW_MEDIA_BASE}/department/${id}_x2.png`;
  const getDepartmentImageUrlBySlug = (slug: string) => `${LOW_MEDIA_BASE}/department/${slug}_x2.png`;
  const getDepartmentS3Url = (id: string) => `${LOW_MEDIA_BASE}/department/${id}_x2.png`;

  const getDiseaseImageUrl = (id: string) => `${LOW_MEDIA_BASE}/disease/${id}.png`;
  const getDiseaseImageUrlBySlug = (slug: string) => `${LOW_MEDIA_BASE}/disease/${slug}.png`;
  const getDiseaseS3Url = (id: string) => `${LOW_MEDIA_BASE}/disease/${id}.png`;
  const surgeryPlaceholderUrl = `${LOW_MEDIA_BASE_URL}/root_assets/surgery_placeholder_x2.png`;

  // Track responsive columns for disease grid and detect mobile
  useEffect(() => {
    const calcCols = () => {
      if (window.innerWidth >= 1024) return 3; // lg
      if (window.innerWidth >= 768) return 2;  // md
      return 2;                                 // sm - 移动版也显示2列
    };
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 小于1024px视为移动版
    };
    const update = () => {
      setCols(calcCols());
      checkMobile();
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Smooth scroll to the selected row to align just below the sticky controls
  useEffect(() => {
    if (!selectedDisease || diseases.length === 0) return;
    const index = diseases.findIndex(d => d.slug === selectedDisease);
    if (index < 0) return;
    const rowIndex = Math.floor(index / Math.max(cols, 1));
    const el = rowRefs.current[rowIndex];
    if (!el) return;
    // Wait next frame to ensure layout/expand is applied
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const rowTopDoc = window.scrollY + rect.top;
      const controlsEl = document.getElementById('search-controls');
      const gap = 12; // keep a small gap below sticky controls
      const stickyBottomViewport = controlsEl ? controlsEl.getBoundingClientRect().bottom : 120;
      const targetY = rowTopDoc - (stickyBottomViewport + gap);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  }, [selectedDisease, diseases, cols]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBanner />
      <Header />
      
      <SearchHeroEnhanced
        departments={departments}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={handleDepartmentChange}
        diseases={diseases}
        selectedDisease={selectedDisease}
        onDiseaseChange={handleDiseaseChange}
        onSearchHospitals={handleSearchHospitals}
        searchTerm={searchTerm}
        onSearchTermChange={handleSearchTermChange}
        diseaseSearchTerm={diseaseSearchTerm}
        onDiseaseSearchTermChange={setDiseaseSearchTerm}
        shouldAnimateButton={shouldAnimateButton}
        shouldAnimateDiseaseInput={shouldAnimateDiseaseInput}
        loading={loading}
      />

      {/* Main Content (cards + expandable procedures) */}
      <div className="relative overflow-hidden">
        {/* Background Wave Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#F5F7F6]"></div>
          <img
            src={`${LOW_MEDIA_BASE_URL}/search/background_x2.png`}
            alt="Wave Pattern Background"
            className="w-full h-full object-cover opacity-90"
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('search.loading.departments')}</p>
          </div>
        ) : error ? (
          <Alert className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* Departments grid when no department selected */}
            {!selectedDepartment && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('search.selectDepartment.title')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 auto-rows-fr">
                  {departments.map((dept) => (
                    <EntityCard
                      key={dept.slug}
                      title={dept.name}
                      subtitle={dept.short_desc}
                      progressiveBaseUrl={getDepartmentProgressiveBase(dept.id)}
                      resolutionLevels={['x1', 'x2', 'x3']}
                      imageUrl={getDepartmentImageUrl(dept.id)}
                      fallbackImageUrls={[
                        getDepartmentImageUrlBySlug(dept.slug),
                        getDepartmentS3Url(dept.id),
                      ]}
                      onClick={() => handleDepartmentChange(dept.slug)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Diseases grid when department selected */}
            {selectedDepartment && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedDept?.name}</h2>
                </div>
                {diseasesLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('search.loading.departmentData', { departmentName: selectedDept?.name || 'department' })}</p>
                  </div>
                ) : diseases.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('search.noData.title')}</h3>
                    <p className="text-gray-600">{t('search.noData.message')}</p>
                  </div>
                ) : (
                  // Render diseases in rows; if a row contains the selected disease, render
                  // a full-width procedure panel below that row, grouped to keep spacing clean.
                  <div className="space-y-6">
                  {diseases.reduce<JSX.Element[]>((acc, _d, i) => {
                    if (i % cols !== 0) return acc; // start of a row
                    const rowIndex = Math.floor(i / cols);
                    const rowItems = diseases.slice(i, i + cols);
                    const slugsInRow = rowItems.map(d => d.slug);
                    const rowHasSelected = selectedDisease ? slugsInRow.includes(selectedDisease) : false;
                    acc.push(
                      <div key={`group-${rowIndex}`} className="space-y-3" ref={(el) => (rowRefs.current[rowIndex] = el)}>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 auto-rows-fr">
                          {rowItems.map((dis) => (
                            <EntityCard
                              key={dis.slug}
                              title={dis.name}
                              subtitle={(dis as any).snippet || (dis as any).short_desc || ''}
                              progressiveBaseUrl={getDiseaseProgressiveBase(dis.id)}
                              resolutionLevels={['x1', 'x2']}
                              imageUrl={getDiseaseImageUrl(dis.id)}
                              fallbackImageUrls={[
                                getDiseaseImageUrlBySlug(dis.slug),
                                getDiseaseS3Url(dis.id),
                              ]}
                              usePlaceholderOnFail={false}
                              selected={selectedDisease === dis.slug}
                              onClick={() => {
                                if (selectedDisease === dis.slug) {
                                  setSelectedDisease('');
                                  setProcedures([]);
                                  setSearchParams({ dept: selectedDepartment });
                                  setShowModal(false);
                                } else {
                                  handleDiseaseChange(dis.slug);
                                }
                              }}
                            />
                          ))}
                        </div>
                        {rowHasSelected && !isMobile && (
                          <div className="border border-emerald-200 rounded-lg bg-white shadow-sm">
                            <div className="px-4 py-3 border-b bg-emerald-50/70 text-emerald-800 font-semibold">
                              {selectedDis ? t('search.treatmentPlansFor', { name: selectedDis.name }) : t('search.relatedProcedures')}
                            </div>
                            <div className="p-4">
                              {proceduresLoading ? (
                                <div className="text-center py-6">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
                                  <p className="text-gray-600 text-sm">{t('search.loading.procedures')}</p>
                                </div>
                              ) : procedures.length === 0 ? (
                                <div className="text-center py-6">
                                  <p className="text-gray-600 text-sm">{t('search.noProcedures.message')}</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {/* Header row aligned with content columns */}
                                  <div className="hidden lg:grid grid-cols-[160px_1fr_200px_180px_300px] gap-5 px-5">
                                    <div></div>
                                    <div className="text-sm font-semibold text-gray-700">{t('search.procedureList.headers.name')}</div>
                                    <div className="text-sm font-semibold text-gray-700 text-center">{t('search.procedureList.headers.waiting')}</div>
                                    <div className="text-sm font-semibold text-gray-700 text-center">{t('search.procedureList.headers.price')}</div>
                                    <div></div>
                                  </div>
                                  {procedures.map((procedure) => (
                                    <div
                                      key={procedure.id}
                                      className="grid grid-cols-1 lg:grid-cols-[160px_1fr_200px_180px_300px] gap-5 p-5 bg-[#f2f7f8] border-0 rounded-lg items-center hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                                    >
                                      <div
                                        className="w-full lg:w-[160px] h-[200px] lg:h-[100px] rounded-md overflow-hidden bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                          const slugParts = procedure.slug.split('-');
                                          const procedureId = slugParts[slugParts.length - 1];
                                          navigate(`/procedures/${procedureId}`);
                                        }}
                                      >
                                        {getProgressiveBaseFromUrl((procedure as any).image_url) ? (
                                          <ProgressiveImage
                                            baseUrl={getProgressiveBaseFromUrl((procedure as any).image_url)!}
                                            alt={procedure.name}
                                            resolutionLevels={['x1', 'x2']}
                                            fallbackUrl={surgeryPlaceholderUrl}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                          />
                                        ) : (
                                          <img
                                            src={getLowResImageUrl((procedure as any).image_url) || surgeryPlaceholderUrl}
                                            alt={procedure.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                          />
                                        )}
                                      </div>

                                      <div className="flex-1">
                                        <h3
                                          className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer transition-colors duration-200 hover:text-[rgb(149,196,182)]"
                                          onClick={() => {
                                            const slugParts = procedure.slug.split('-');
                                            const procedureId = slugParts[slugParts.length - 1];
                                            navigate(`/procedures/${procedureId}`);
                                          }}
                                        >
                                          {procedure.name}
                                        </h3>
                                        <p
                                          className="text-xs text-gray-600 line-clamp-2 cursor-pointer transition-colors duration-200 hover:text-[rgb(149,196,182)]"
                                          onClick={() => {
                                            const slugParts = procedure.slug.split('-');
                                            const procedureId = slugParts[slugParts.length - 1];
                                            navigate(`/procedures/${procedureId}`);
                                          }}
                                        >
                                          {(procedure as any).summary || (procedure as any).description || 'Professional medical procedure with experienced specialists'}
                                        </p>
                                      </div>

                                      <div
                                        className="flex items-center justify-center gap-2 text-gray-700 cursor-pointer"
                                        onClick={() => {
                                          const slugParts = procedure.slug.split('-');
                                          const procedureId = slugParts[slugParts.length - 1];
                                          navigate(`/procedures/${procedureId}`);
                                        }}
                                      >
                                        <span className="text-sm text-emerald-600 font-medium transition-colors duration-200 hover:text-[rgb(149,196,182)]">
                                          {(procedure as any).waiting_time || (procedure as any).avg_wait_days || '3-5 days'}
                                        </span>
                                      </div>

                                      <div
                                        className="text-center cursor-pointer"
                                        onClick={() => {
                                          const slugParts = procedure.slug.split('-');
                                          const procedureId = slugParts[slugParts.length - 1];
                                          navigate(`/procedures/${procedureId}`);
                                        }}
                                      >
                                        <span className="text-base font-bold text-gray-900 transition-colors duration-200 hover:text-[rgb(149,196,182)]">
                                          {typeof (procedure as any).cost_usd === 'string'
                                            ? (procedure as any).cost_usd
                                            : typeof (procedure as any).price_max === 'string'
                                            ? (procedure as any).price_max
                                            : (procedure as any).cost_usd
                                            ? `$${(procedure as any).cost_usd.toLocaleString()}`
                                            : (procedure as any).price_max
                                            ? `$${(procedure as any).price_max.toLocaleString()}`
                                            : '$28,000'}
                                        </span>
                                      </div>

                                      <div className="flex flex-col gap-2 items-end">
                                        <button
                                          onClick={() => navigate(`/hospitals?procedure=${procedure.slug}`)}
                                          className="px-4 py-2 bg-[#94c5b8] text-white text-sm font-medium rounded-md hover:bg-[#7fb5a4] transition-colors w-[60%]"
                                        >
                                          {t('search.actions.startBooking')}
                                        </button>
                                        <button
                                          onClick={() => {
                                            const slugParts = procedure.slug.split('-');
                                            const procedureId = slugParts[slugParts.length - 1];
                                            navigate(`/procedures/${procedureId}`);
                                          }}
                                          className="px-4 py-2 bg-[#394150] text-white text-sm font-medium rounded-md hover:bg-[#2d3340] transition-colors w-[60%]"
                                        >
                                          {t('search.actions.moreDetails')}
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );

                    return acc;
                  }, [])}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Mobile Modal for Procedures */}
      <ProcedureListModal
        isOpen={isMobile && showModal && !!selectedDisease}
        onClose={() => {
          setShowModal(false);
          setSelectedDisease('');
          setProcedures([]);
          setSearchParams({ dept: selectedDepartment });
        }}
        procedures={procedures}
        loading={proceduresLoading}
        diseaseName={selectedDis?.name || ''}
      />

      <Footer />
    </div>
  );
};

export default Search;

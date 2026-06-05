import { Search } from "lucide-react";
import CompactHero from "@/components/common/CompactHero";
import DepartmentCombobox from "@/components/DepartmentCombobox";
import DiseaseCombobox from "@/components/DiseaseCombobox";
import { Button } from "@/components/ui/button";
import { Department } from "@/services/api";
import { Disease } from "@/components/DiseaseCombobox";
import { useLanguage } from "@/contexts/LanguageContext";
import { LOW_MEDIA_BASE_URL } from "@/config/media";

interface SearchHeroEnhancedProps {
  departments: Department[];
  selectedDepartment: string;
  onDepartmentChange: (departmentSlug: string) => void;
  diseases: Disease[];
  selectedDisease: string;
  onDiseaseChange: (diseaseSlug: string) => void;
  onSearchHospitals: () => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  diseaseSearchTerm: string;
  onDiseaseSearchTermChange: (term: string) => void;
  shouldAnimateButton?: boolean;
  shouldAnimateDiseaseInput?: boolean;
  loading?: boolean;
}

export default function SearchHeroEnhanced({
  departments,
  selectedDepartment,
  onDepartmentChange,
  diseases,
  selectedDisease,
  onDiseaseChange,
  onSearchHospitals,
  searchTerm,
  onSearchTermChange,
  diseaseSearchTerm,
  onDiseaseSearchTermChange,
  shouldAnimateButton = false,
  shouldAnimateDiseaseInput = false,
  loading = false,
}: SearchHeroEnhancedProps) {
  const { t } = useLanguage();
  
  return (
    <CompactHero
      backgroundImage={`${LOW_MEDIA_BASE_URL}/search/top_banner_x1.png`}
      overlayColor="bg-gradient-to-r from-[#14B8A6]/80 to-[#0F638E]/70"
    >
      <div className="max-w-4xl mx-auto w-full">
        {/* Title */}
        <div className="text-center lg:text-left mb-3 sm:mb-4 md:mb-5 lg:mb-6 px-1">
          <h1 className="text-xs sm:text-sm md:text-base lg:text-lg text-white font-bold tracking-wider uppercase">
            {t('search.label.departmentSymptoms')}
          </h1>
        </div>

        {/* Search Box */}
        <div className="w-full max-w-full bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl p-4 sm:p-5 md:p-6 lg:p-7 overflow-hidden">
          {/* Mobile Layout - Extra Compact */}
          <div className="flex flex-col gap-3 sm:hidden w-full">
            {/* Department Combobox - Mobile */}
            <div className="w-full max-w-full">
              <DepartmentCombobox
                departments={departments}
                selectedDepartment={selectedDepartment}
                onDepartmentChange={onDepartmentChange}
                searchTerm={searchTerm}
                onSearchTermChange={onSearchTermChange}
                placeholder={t('search.placeholder.medicalSpecialtyShort')}
              />
            </div>

            {/* Disease Combobox with Search Button - Mobile */}
            <div className="w-full max-w-full flex gap-2">
              <div className="flex-1 min-w-0">
                <DiseaseCombobox
                  diseases={diseases}
                  selectedDisease={selectedDisease}
                  onDiseaseChange={onDiseaseChange}
                  searchTerm={diseaseSearchTerm}
                  onSearchTermChange={onDiseaseSearchTermChange}
                  placeholder={t('search.placeholder.diseaseShort')}
                  disabled={!selectedDepartment}
                  shouldAnimate={shouldAnimateDiseaseInput}
                />
              </div>
              <Button
                className={`bg-gradient-to-r from-[#14B8A6] to-[#0F638E] text-white px-3 py-2 rounded-md hover:shadow-lg transition-all duration-300 shrink-0 flex items-center justify-center min-w-[44px] h-10 ${
                  shouldAnimateButton ? 'animate-pulse shadow-lg shadow-emerald-500/50 scale-105' : ''
                }`}
                disabled={!selectedDepartment || loading}
                onClick={onSearchHospitals}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tablet Layout - Stacked */}
          <div className="hidden sm:flex lg:hidden flex-col gap-3.5 w-full">
            {/* Department Combobox - Tablet */}
            <div className="w-full max-w-full">
              <DepartmentCombobox
                departments={departments}
                selectedDepartment={selectedDepartment}
                onDepartmentChange={onDepartmentChange}
                searchTerm={searchTerm}
                onSearchTermChange={onSearchTermChange}
                placeholder={t('search.placeholder.medicalSpecialty')}
              />
            </div>

            {/* Disease Combobox with Search Button - Tablet */}
            <div className="w-full max-w-full flex gap-3">
              <div className="flex-1 min-w-0">
                <DiseaseCombobox
                  diseases={diseases}
                  selectedDisease={selectedDisease}
                  onDiseaseChange={onDiseaseChange}
                  searchTerm={diseaseSearchTerm}
                  onSearchTermChange={onDiseaseSearchTermChange}
                  placeholder={t('search.placeholder.disease')}
                  disabled={!selectedDepartment}
                  shouldAnimate={shouldAnimateDiseaseInput}
                />
              </div>
              <Button
                className={`bg-gradient-to-r from-[#14B8A6] to-[#0F638E] text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition-all duration-300 shrink-0 flex items-center justify-center min-w-[48px] ${
                  shouldAnimateButton ? 'animate-pulse shadow-lg shadow-emerald-500/50 scale-105' : ''
                }`}
                disabled={!selectedDepartment || loading}
                onClick={onSearchHospitals}
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Desktop Layout - Side by Side */}
          <div className="hidden lg:flex items-center">
            {/* Department Combobox */}
            <div className="flex-1 border-r border-gray-200">
              <DepartmentCombobox
                departments={departments}
                selectedDepartment={selectedDepartment}
                onDepartmentChange={onDepartmentChange}
                searchTerm={searchTerm}
                onSearchTermChange={onSearchTermChange}
                placeholder={t('search.placeholder.medicalSpecialty')}
              />
            </div>

            {/* Disease Combobox */}
            <div className="flex-1">
              <DiseaseCombobox
                diseases={diseases}
                selectedDisease={selectedDisease}
                onDiseaseChange={onDiseaseChange}
                searchTerm={diseaseSearchTerm}
                onSearchTermChange={onDiseaseSearchTermChange}
                placeholder={t('search.placeholder.disease')}
                disabled={!selectedDepartment}
                shouldAnimate={shouldAnimateDiseaseInput}
              />
            </div>

            {/* Search Button */}
            <Button
              className={`bg-gradient-to-r from-[#14B8A6] to-[#0F638E] text-white px-8 py-3.5 rounded-r-lg hover:shadow-lg transition-all duration-300 shrink-0 flex items-center gap-2 font-medium ${
                shouldAnimateButton ? 'animate-pulse shadow-lg shadow-emerald-500/50 scale-105' : ''
              }`}
              disabled={!selectedDepartment || loading}
              onClick={onSearchHospitals}
            >
              <Search className="w-5 h-5" />
              <span>{t('search.button.search')}</span>
            </Button>
          </div>
        </div>
      </div>
    </CompactHero>
  );
}

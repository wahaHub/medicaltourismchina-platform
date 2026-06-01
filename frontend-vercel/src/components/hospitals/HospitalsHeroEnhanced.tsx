import { Search } from "lucide-react";
import CompactHero from "@/components/common/CompactHero";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { LOW_MEDIA_BASE_URL } from "@/config/media";

interface City {
  value: string;
  label: string;
  zhName: string;
}

interface HospitalsHeroEnhancedProps {
  cities: City[];
  selectedCity: string;
  onCityChange: (city: string) => void;
  search?: string;
  totalHospitals: number;
}

export default function HospitalsHeroEnhanced({
  cities,
  selectedCity,
  onCityChange,
  search,
  totalHospitals,
}: HospitalsHeroEnhancedProps) {
  const { t } = useLanguage();
  
  // Generate dynamic title based on filters
  const getTitle = () => {
    if (selectedCity && selectedCity !== 'all') {
      const city = cities.find(c => c.value === selectedCity);
      return `${city?.label || ''} ${t('hospitals.hero.hospitalsLabel')}`;
    }
    if (search) {
      return `${t('hospitals.hero.search')}: ${search}`;
    }
    return t('hospitals.hero.allHospitals');
  };

  return (
    <CompactHero
      backgroundImage={`${LOW_MEDIA_BASE_URL}/hospitals/header_img_x2.png`}
      overlayColor="bg-gradient-to-r from-[#14B8A6]/80 to-[#0F638E]/70"
    >
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div className="text-left mb-4 sm:mb-6">
          <h1 className="text-sm sm:text-sm md:text-sm lg:text-sm text-white font-bold tracking-wider uppercase mb-2">
            {t('hospitals.hero.filterByCity')}
          </h1>
          {/* Dynamic subtitle showing current filters */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            {getTitle()}
          </h2>
        </div>

        {/* City Filter - Simplified */}
        <div className="w-full bg-white rounded-lg shadow-2xl p-4 sm:p-5">
          <Select value={selectedCity || 'all'} onValueChange={onCityChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('hospitals.hero.selectCity')} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.value} value={city.value}>
                  {city.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CompactHero>
  );
}

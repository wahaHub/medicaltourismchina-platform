import { useState } from "react";
import { MapPin, ChevronDown, Check, AlertCircle, Plane } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVisaCountry } from "@/contexts/VisaCountryContext";
import {
  getCountryName,
  countryNames,
  getVisaStatus,
} from "@/data/visaCountries";

export default function VisaCountryDetector() {
  const { t, language } = useLanguage();
  const {
    detectedCountry,
    selectedCountry,
    activeCountry,
    visaStatus,
    isLoading,
    setSelectedCountry,
  } = useVisaCountry();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get all countries for dropdown
  const allCountries = Object.keys(countryNames).sort((a, b) => {
    const nameA = getCountryName(a, language);
    const nameB = getCountryName(b, language);
    return nameA.localeCompare(nameB);
  });

  // Filter countries based on search
  const filteredCountries = allCountries.filter((code) => {
    const name = getCountryName(code, language).toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handle country selection
  const handleSelectCountry = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  // Render visa status badge and info
  const renderVisaInfo = () => {
    if (!activeCountry || !visaStatus) return null;

    const countryName = getCountryName(activeCountry, language);

    if (visaStatus === "visa_free_240") {
      return (
        <div className="bg-gradient-to-r from-[#e8f5f1] to-[#d4f0e9] border border-[#52af98] rounded-xl p-6 mt-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#52af98] rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#52af98] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {t("visa.detector.visaFree")}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#003B59] mb-2">
                {t("visa.detector.goodNews")}
              </h3>
              <p className="text-[#333] leading-relaxed">
                {t("visa.detector.visaFree240Description").replace("{country}", countryName)}
              </p>
              <div className="mt-4 flex items-center gap-2 text-[#52af98]">
                <Plane className="w-5 h-5" />
                <span className="font-medium">{t("visa.detector.240hoursStay")}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (visaStatus === "visa_free_other") {
      return (
        <div className="bg-gradient-to-r from-[#fff8e6] to-[#fff3d4] border border-[#d4a72c] rounded-xl p-6 mt-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#d4a72c] rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#d4a72c] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {t("visa.detector.visaFreeOther")}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#003B59] mb-2">
                {t("visa.detector.specialArrangement")}
              </h3>
              <p className="text-[#333] leading-relaxed">
                {t("visa.detector.visaFreeOtherDescription").replace("{country}", countryName)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Visa required
    return (
      <div className="bg-gradient-to-r from-[#fef2f2] to-[#fee2e2] border border-[#ef4444] rounded-xl p-6 mt-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#ef4444] rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#ef4444] text-white text-xs font-semibold px-3 py-1 rounded-full">
                {t("visa.detector.visaRequired")}
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#003B59] mb-2">
              {t("visa.detector.visaNeeded")}
            </h3>
            <p className="text-[#333] leading-relaxed">
              {t("visa.detector.visaRequiredDescription").replace("{country}", countryName)}
            </p>
            <div className="mt-4">
              <p className="text-sm text-[#666]">{t("visa.detector.weCanHelp")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent">
                {t("visa.detector.title")}
              </span>
            </h2>
            <p className="text-gray-600">{t("visa.detector.subtitle")}</p>
          </div>

          {/* Country Selector */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5 text-[#52af98]" />
                <span className="font-medium">{t("visa.detector.yourLocation")}</span>
              </div>

              {/* Dropdown */}
              <div className="relative flex-1 w-full md:w-auto">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full md:w-auto min-w-[250px] flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-[#52af98] transition-colors"
                >
                  {isLoading ? (
                    <span className="text-gray-400">{t("visa.detector.detecting")}</span>
                  ) : activeCountry ? (
                    <span className="font-medium text-[#003B59]">
                      {getCountryName(activeCountry, language)}
                    </span>
                  ) : (
                    <span className="text-gray-400">{t("visa.detector.selectCountry")}</span>
                  )}
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-100">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("visa.detector.searchCountry")}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#52af98]"
                        autoFocus
                      />
                    </div>

                    {/* Country List */}
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCountries.map((code) => {
                        const status = getVisaStatus(code);
                        const isSelected = code === activeCountry;

                        return (
                          <button
                            key={code}
                            onClick={() => handleSelectCountry(code)}
                            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                              isSelected ? "bg-[#e8f5f1]" : ""
                            }`}
                          >
                            <span className={`${isSelected ? "font-medium text-[#52af98]" : "text-gray-700"}`}>
                              {getCountryName(code, language)}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                status === "visa_free_240"
                                  ? "bg-green-100 text-green-700"
                                  : status === "visa_free_other"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {status === "visa_free_240"
                                ? t("visa.detector.visaFreeShort")
                                : status === "visa_free_other"
                                  ? t("visa.detector.specialShort")
                                  : t("visa.detector.visaRequiredShort")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Auto-detected indicator */}
              {detectedCountry && !selectedCountry && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {t("visa.detector.autoDetected")}
                </span>
              )}
            </div>

            {/* Visa Status Result */}
            {renderVisaInfo()}
          </div>
        </div>
      </div>
    </section>
  );
}

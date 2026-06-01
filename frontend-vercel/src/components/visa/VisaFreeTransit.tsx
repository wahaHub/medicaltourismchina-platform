import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVisaCountry } from "@/contexts/VisaCountryContext";
import { getCountryName } from "@/data/visaCountries";
import { LOW_MEDIA_BASE_URL } from "@/config/media";

const VISA_MEDIA_BASE = `${LOW_MEDIA_BASE_URL}/visa`;

export default function VisaFreeTransit() {
  const { t, language } = useLanguage();
  const { activeCountry, visaStatus } = useVisaCountry();

  // Only show this section if the selected country has visa-free transit
  if (!activeCountry || visaStatus !== "visa_free_240") {
    return null;
  }

  const countryName = getCountryName(activeCountry, language);

  // 240-hour visa-free transit cities/regions (expanded list as of 2024)
  const cities240Keys = [
    // Major cities
    "visa.freeTransit.beijing",
    "visa.freeTransit.shanghai",
    "visa.freeTransit.guangzhou",
    "visa.freeTransit.shenzhen",
    "visa.freeTransit.chengdu",
    "visa.freeTransit.chongqing",
    "visa.freeTransit.hangzhou",
    "visa.freeTransit.nanjing",
    "visa.freeTransit.xian",
    "visa.freeTransit.tianjin",
    "visa.freeTransit.wuhan",
    "visa.freeTransit.xiamen",
    "visa.freeTransit.kunming",
    "visa.freeTransit.qingdao",
    "visa.freeTransit.dalian",
    "visa.freeTransit.shenyang",
    "visa.freeTransit.harbin",
    "visa.freeTransit.guilin",
    "visa.freeTransit.changsha",
    "visa.freeTransit.ningbo",
    "visa.freeTransit.zhengzhou",
    "visa.freeTransit.shijiazhuang",
    "visa.freeTransit.jinan",
    "visa.freeTransit.fuzhou",
  ];

  // Regions (Hainan, Greater Bay Area, etc.)
  const regionsKeys = [
    "visa.freeTransit.hainan",
    "visa.freeTransit.greaterBayArea",
  ];

  return (
    <section className="py-4 bg-white relative z-10">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-white -mt-12 sm:-mt-16 md:-mt-20 lg:-mt-[5%] rounded-2xl p-5 sm:p-6 md:p-8 lg:p-10">
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0">
                <img
                  src={`${VISA_MEDIA_BASE}/map_icon_x2.png`}
                  alt="Map Icon"
                  className="w-full h-full"
                />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                  <span className="bg-gradient-to-r from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent">
                    {t("visa.freeTransit.title")}
                  </span>
                </h2>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {t("visa.freeTransit.descriptionWithCountry").replace("{country}", countryName)}
            </p>
          </div>

          {/* 240-Hour Cities */}
          <div className="mb-6 mt-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent">
                {t("visa.freeTransit.240hoursCities")}
              </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
              {cities240Keys.map((cityKey) => (
                <div
                  key={cityKey}
                  className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-[#e8f5f1] transition-colors"
                >
                  <img
                    src={`${VISA_MEDIA_BASE}/check_x2.png`}
                    alt="Check Icon"
                    className="w-5 h-5 shrink-0"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {t(cityKey)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Special Regions */}
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              <span className="bg-gradient-to-r from-[#1DA78A] to-[#0F638E] bg-clip-text text-transparent">
                {t("visa.freeTransit.specialRegions")}
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {regionsKeys.map((regionKey) => (
                <div
                  key={regionKey}
                  className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#e8f5f1] to-[#d4f0e9] rounded-xl border border-[#52af98]/30"
                >
                  <img
                    src={`${VISA_MEDIA_BASE}/check_x2.png`}
                    alt="Check Icon"
                    className="w-6 h-6 shrink-0 mt-0.5"
                  />
                  <div>
                    <span className="text-base font-semibold text-[#003B59]">
                      {t(regionKey)}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {t(`${regionKey}Desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Box */}
          <div
            className="p-4 rounded-lg flex items-start gap-3"
            style={{ backgroundColor: "#FFF4D5" }}
          >
            <AlertCircle
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: "#9A7309" }}
            />
            <div>
              <p className="font-semibold mb-1" style={{ color: "#9A7309" }}>
                {t("visa.freeTransit.extendWarningTitle")}
              </p>
              <p className="text-sm" style={{ color: "#9A7309" }}>
                {t("visa.freeTransit.extendWarningText")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

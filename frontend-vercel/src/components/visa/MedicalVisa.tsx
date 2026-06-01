import { FileText, ClipboardCheck, Clock, Truck, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LOW_MEDIA_BASE_URL } from "@/config/media";

export default function MedicalVisa() {
  const { t } = useLanguage();

  const services = [
    {
      icon: Mail,
      titleKey: "visa.medical.invitation.title",
      descKey: "visa.medical.invitation.description",
      highlight: true, // 48-hour highlight
    },
    {
      icon: FileText,
      titleKey: "visa.medical.documents.title",
      descKey: "visa.medical.documents.description",
    },
    {
      icon: ClipboardCheck,
      titleKey: "visa.medical.review.title",
      descKey: "visa.medical.review.description",
    },
    {
      icon: Clock,
      titleKey: "visa.medical.expedited.title",
      descKey: "visa.medical.expedited.description",
    },
    {
      icon: Truck,
      titleKey: "visa.medical.tracking.title",
      descKey: "visa.medical.tracking.description",
    },
  ];

  return (
    <section className="px-0 sm:px-4 md:px-12 lg:px-12 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl px-4 sm:px-6 md:px-10 lg:px-12 mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0">
                <img
                  src={`${LOW_MEDIA_BASE_URL}/visa/union_icon_x2.png`}
                  alt="Medical Visa Icon"
                  className="w-full h-full"
                />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
                  <span className="bg-gradient-to-r from-[#038A81] to-[#003B59] bg-clip-text text-transparent">
                    {t("visa.medical.title")}
                  </span>
                </h2>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {t("visa.medical.whoNeeds")}
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className={`relative p-5 sm:p-6 rounded-xl border transition-all hover:shadow-md ${
                    service.highlight
                      ? "bg-gradient-to-br from-[#e8f5f1] to-[#d4f0e9] border-[#52af98]"
                      : "bg-white border-gray-200 hover:border-[#86c7b7]"
                  }`}
                >
                  {/* 48-hour badge for invitation letter */}
                  {service.highlight && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#038A81] to-[#003B59] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      48h
                    </div>
                  )}

                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        service.highlight ? "bg-[#52af98]" : "bg-[#86c7b7]/20"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          service.highlight ? "text-white" : "text-[#003b59]"
                        }`}
                      />
                    </div>
                    <h3
                      className={`font-semibold text-base sm:text-lg ${
                        service.highlight ? "text-[#003B59]" : "text-[#86c7b7]"
                      }`}
                    >
                      {t(service.titleKey)}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t(service.descKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

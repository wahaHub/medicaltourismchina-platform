import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { LOW_MEDIA_BASE_URL } from "@/config/media";

const consultationDoctorImage = `${LOW_MEDIA_BASE_URL}/homepage/online-consultation-doctor.webp`;

export default function OnlineConsultationSection() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section
      className="group relative cursor-pointer overflow-hidden bg-white py-12 sm:py-16 md:py-20"
      onClick={() => navigate("/telemedicine")}
    >
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-8 mt-4 text-xl font-bold text-[#1DA78A] sm:text-2xl md:text-3xl">
            {t("homepage.onlineConsultation.sectionTitle")}
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl bg-[#F0F4F3] shadow-[0_18px_50px_rgba(15,99,142,0.08)]">
          <div className="grid items-center gap-0 lg:grid-cols-[0.92fr_1.08fr]">
            <ScrollReveal direction="up" duration={0.75} className="relative z-20">
              <div className="px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
                <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F638E]">
                {t("homepage.onlineConsultation.eyebrow")}
                </div>

                <h2 className="max-w-xl text-2xl font-bold leading-tight text-[#1DA78A] sm:text-3xl lg:text-4xl">
                  {t("homepage.onlineConsultation.title")}
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#0A4A5C]/80 sm:text-base">
                  {t("homepage.onlineConsultation.description")}
                </p>

                <Link
                  to="/telemedicine"
                  onClick={(event) => event.stopPropagation()}
                  className="group mt-6 inline-flex items-center rounded-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(29,167,138,0.22)] transition-all duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] hover:brightness-105 active:scale-[0.98]"
                >
                  <span>{t("homepage.onlineConsultation.cta")}</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-3 h-4 w-4 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">
                    <path d="M7 17 17 7M9 7h8v8" className="fill-none stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" duration={0.85} delay={0.08} className="relative h-full min-h-[260px]">
              <div className="relative h-full min-h-[260px] overflow-hidden lg:min-h-[380px]">
                <img
                  src={consultationDoctorImage}
                  alt={t("homepage.onlineConsultation.imageAlt")}
                  className="h-full min-h-[260px] w-full object-cover object-center transition-transform duration-700 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.02] lg:min-h-[380px]"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[42%] bg-gradient-to-r from-[#F0F4F3] via-[#F0F4F3]/78 to-transparent lg:block" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-[#F0F4F3]/60 to-transparent lg:hidden" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

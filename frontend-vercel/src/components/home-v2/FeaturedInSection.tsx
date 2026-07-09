import bloombergLogo from "@/img/bloomberg-logo.png";
import cgtnAmericaLogo from "@/img/cgtn-america-logo.jpg";
import cgtnVideoPoster from "@/img/media/cgtn-medical-tourism-video-poster.jpg";
import cnnLogo from "@/img/cnn-logo.svg";
import zaobaoLogo from "@/img/lianhe-zaobao-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { PlayCircle } from "lucide-react";
import { useState } from "react";

const cgtnVideoUrl = "https://www.youtube.com/watch?app=desktop&v=RnsjnLuLtf8&ra=m";
const cgtnVideoEmbedUrl = "https://www.youtube.com/embed/RnsjnLuLtf8?autoplay=1&rel=0";

const featuredLogos = [
  {
    name: "CNN",
    src: cnnLogo,
    className: "h-9 sm:h-10",
    href: "https://edition.cnn.com/2026/07/08/business/asia-china-medical-tourism-cheap-healthcare-intl-hnk-dst",
  },
  {
    name: "Lianhe Zaobao",
    src: zaobaoLogo,
    className: "h-10 sm:h-11",
    href: "https://www.zaobao.com.sg/news/china/story20260524-8916502?utm_source=ios-share&utm_medium=app",
  },
  {
    name: "Bloomberg",
    src: bloombergLogo,
    className: "h-10 sm:h-11",
  },
  {
    name: "CGTN America",
    src: cgtnAmericaLogo,
    className: "h-14 sm:h-16 rounded-[4px]",
    href: cgtnVideoUrl,
  },
];

export default function FeaturedInSection() {
  const { t } = useLanguage();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section className="relative bg-white py-8 sm:py-10 lg:py-12" aria-labelledby="featured-in-heading">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 id="featured-in-heading" className="text-xl font-bold leading-tight text-[#1DA78A] sm:text-2xl md:text-3xl">
            {t("homepage.featuredIn.eyebrow")}
          </h2>
        </div>

        <div className="mt-6 rounded-[8px] border border-slate-100 bg-[#F7FAF9] px-4 py-5 shadow-sm sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.92fr_auto_1.08fr] lg:items-stretch">
            <div className="flex flex-col justify-center">
              <p className="mb-4 text-center text-sm font-semibold leading-relaxed text-slate-500 lg:text-left">
                {t("homepage.featuredIn.title")}
              </p>

              <ul className="grid grid-cols-2 gap-3">
                {featuredLogos.map((logo) => (
                  <li key={logo.name}>
                    <a
                      href={logo.href ?? undefined}
                      target={logo.href ? "_blank" : undefined}
                      rel={logo.href ? "noreferrer" : undefined}
                      aria-label={logo.href ? t("homepage.featuredIn.logoLinkAria", { media: logo.name }) : logo.name}
                      className={`flex h-24 items-center justify-center rounded-[8px] border border-slate-100 bg-white px-4 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 ${logo.href ? "cursor-pointer" : "pointer-events-none"}`}
                    >
                      <img
                        src={logo.src}
                        alt={logo.name}
                        className={`max-w-[150px] object-contain ${logo.className}`}
                        loading="lazy"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden w-px bg-slate-200/80 lg:block" aria-hidden="true" />

            <div className="flex items-center">
              <div className="relative aspect-video w-full overflow-hidden rounded-[8px] border border-slate-200 bg-slate-950 shadow-sm">
                {isVideoPlaying ? (
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={cgtnVideoEmbedUrl}
                    title="CGTN America video about China's medical tourism"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsVideoPlaying(true)}
                    className="group absolute inset-0 block h-full w-full text-left"
                    aria-label="Play CGTN America video about China's medical tourism"
                  >
                    <img
                      src={cgtnVideoPoster}
                      alt="CGTN America coverage of China's medical tourism"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                    <span className="absolute inset-0 bg-slate-950/20 transition-colors duration-300 group-hover:bg-slate-950/10" />
                    <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#0F638E] shadow-lg transition-transform duration-300 group-hover:scale-105">
                      <PlayCircle className="h-8 w-8" aria-hidden="true" />
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

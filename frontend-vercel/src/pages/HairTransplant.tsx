import { useEffect } from "react";
import { ChevronLeft, Stethoscope, Clock, Wallet, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroImage from "@/img/hair-transplant.png";

const fixedChromePadding =
  "pt-[calc(44px+3.5rem)] sm:pt-[calc(44px+4rem)] xl:pt-[calc(44px+4.5rem)]";

const COPY = {
  backHome: "Back to Home",
  heroTitle: "Hair Transplant",
  heroSubtitle: "Hair Restoration Surgery",
  heroDesc:
    "A hair transplant moves hair follicles from a donor area (back/sides of scalp) to bald or thinning areas. It is the most permanent and natural solution for androgenetic alopecia (pattern baldness) in men and women.",
  whatIsItTitle: "What Is It?",
  typesTitle: "Techniques",
  procedureTitle: "Procedure Overview",
  pricingTitle: "Pricing in China (USD)",
  pricingNote:
    "Prices are estimates for mainland China (2024–2025). Actual cost varies by city, hospital tier, surgeon experience, and individual case. Always request a formal quote after consultation.",
  ctaTitle: "Ready to Start?",
  ctaSubtitle: "Get Your Personalized Hair Transplant Plan and Quote",
  ctaButton: "Book Your Consultation",
};

const techniques = [
  {
    name: "FUE (Follicular Unit Extraction)",
    desc: "Individual follicles extracted; no linear scar; most popular globally.",
    tag: "Popular",
  },
  {
    name: "FUT (Strip Method)",
    desc: "Strip removed from scalp; maximum graft yield per session.",
    tag: "High Yield",
  },
  {
    name: "Sapphire FUE",
    desc: "Sapphire-tipped blades for finer channels; less trauma; better density.",
    tag: "Advanced",
  },
  {
    name: "DHI (Direct Hair Implantation)",
    desc: "Choi implanter pen; highest density; no shaving needed for some areas.",
    tag: "Dense",
  },
  {
    name: "Robotic (ARTAS)",
    desc: "AI-assisted FUE; precise extraction; available at select premium centers.",
    tag: "Robotic",
  },
];

const procedureSteps = [
  { label: "Duration", value: "6–10 hours under local anesthesia; outpatient procedure" },
  { label: "Grafts per session", value: "Typical: 1,500–4,000+ grafts" },
  { label: "Recovery", value: "Scabs fall off in 7–10 days; transplanted hair sheds at 2–4 weeks" },
  { label: "Full results", value: "Visible at 12–18 months" },
];

const pricing = [
  { procedure: "FUE (per graft)", price: "$1.10 – $2.80 / graft" },
  { procedure: "FUE Full Session (2,000–3,000 grafts)", price: "$2,800 – $6,900" },
  { procedure: "DHI Hair Transplant", price: "$3,500 – $8,300" },
  { procedure: "Sapphire FUE", price: "$3,500 – $7,600" },
  { procedure: "FUT Strip Method (large session)", price: "$2,100 – $5,500" },
];

export default function HairTransplant() {
  useEffect(() => {
    document.title = "Hair Transplant | Medora Health";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBanner />
      <Header />

      <main className={`${fixedChromePadding} pb-16 sm:pb-20`}>
        {/* Hero */}
        <section className="relative overflow-hidden bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-10 sm:py-14">
              <div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1DA78A] transition-colors mb-4"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {COPY.backHome}
                </Link>
                <p className="text-sm font-medium text-[#1DA78A] tracking-wide uppercase mb-2">
                  {COPY.heroSubtitle}
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A2433] leading-tight">
                  {COPY.heroTitle}
                </h1>
                <p className="mt-4 text-base text-gray-600 leading-relaxed max-w-xl">
                  {COPY.heroDesc}
                </p>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={heroImage}
                  alt="Hair Transplant Before & After"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* What Is It + Procedure */}
        <section className="bg-gray-50 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
              {/* What Is It */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Stethoscope className="h-5 w-5 text-[#1DA78A]" />
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1A2433]">{COPY.whatIsItTitle}</h2>
                </div>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  A hair transplant moves hair follicles from a donor area (back/sides of scalp) to
                  bald or thinning areas. It is the most permanent and natural solution for
                  androgenetic alopecia (pattern baldness) in men and women.
                </p>
              </div>

              {/* Procedure Overview */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Clock className="h-5 w-5 text-[#1DA78A]" />
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1A2433]">{COPY.procedureTitle}</h2>
                </div>
                <div className="space-y-4">
                  {procedureSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1DA78A]/10 text-[#1DA78A] text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-[#1A2433] uppercase tracking-wide">
                          {step.label}
                        </span>
                        <p className="text-sm text-gray-600">{step.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Techniques */}
        <section className="bg-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A2433] mb-8 text-center">
              {COPY.typesTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {techniques.map((type, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#1A2433]">{type.name}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1DA78A]/10 text-[#1DA78A]">
                      {type.tag}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{type.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-gray-50 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Wallet className="h-5 w-5 text-[#1DA78A]" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#1A2433]">{COPY.pricingTitle}</h2>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1A2433]">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Option / Procedure
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-white uppercase tracking-wider">
                      Estimated Price (USD)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pricing.map((row, i) => (
                    <tr
                      key={i}
                      className={`transition-colors hover:bg-gray-50 ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                      }`}
                    >
                      <td className="px-5 py-3.5 text-gray-700 font-medium">{row.procedure}</td>
                      <td className="px-5 py-3.5 text-right text-[#1A2433] font-bold whitespace-nowrap">
                        {row.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-gray-400 text-center leading-relaxed">
              {COPY.pricingNote}
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <CheckCircle2 className="h-10 w-10 text-[#1DA78A] mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A2433] mb-2">{COPY.ctaTitle}</h2>
            <p className="text-gray-600 mb-8">{COPY.ctaSubtitle}</p>
            <Link
              to="/free-quote"
              className="inline-flex items-center gap-2 rounded-full bg-[#1DA78A] px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#158970] hover:shadow-xl hover:-translate-y-0.5"
            >
              {COPY.ctaButton}
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

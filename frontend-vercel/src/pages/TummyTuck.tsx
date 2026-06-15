import { useEffect } from "react";
import { ChevronLeft, Stethoscope, Clock, Wallet, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroImage from "@/img/tummy-tuck.png";

const fixedChromePadding =
  "pt-[calc(44px+3.5rem)] sm:pt-[calc(44px+4rem)] xl:pt-[calc(44px+4.5rem)]";

const COPY = {
  backHome: "Back to Home",
  heroTitle: "Tummy Tuck (Abdominoplasty)",
  heroSubtitle: "Cosmetic Surgery — Abdominal Contouring",
  heroDesc:
    "Abdominoplasty (tummy tuck) removes excess abdominal skin and fat while tightening weakened muscles (diastasis recti). Creates a flatter, firmer abdomen. Very popular among post-pregnancy and post-weight-loss patients.",
  whatIsItTitle: "What Is It?",
  typesTitle: "Types",
  procedureTitle: "Procedure Overview",
  pricingTitle: "Pricing in China (USD)",
  pricingNote:
    "Prices are estimates for mainland China (2024–2025). Actual cost varies by city, hospital tier, surgeon experience, and individual case. Always request a formal quote after consultation.",
  ctaTitle: "Ready to Start?",
  ctaSubtitle: "Get Your Personalized Tummy Tuck Plan and Quote",
  ctaButton: "Book Your Consultation",
};

const types = [
  {
    name: "Mini Tummy Tuck",
    desc: "Shorter scar; lower abdomen only; no muscle repair; for mild cases.",
    tag: "Mild",
  },
  {
    name: "Standard (Full) Abdominoplasty",
    desc: "Hip-to-hip incision; belly button repositioned; full muscle repair.",
    tag: "Standard",
  },
  {
    name: "Extended Abdominoplasty",
    desc: "Addresses flanks/love handles simultaneously.",
    tag: "Extended",
  },
  {
    name: "Fleur-de-lis",
    desc: "Horizontal + vertical incisions; for massive weight loss patients.",
    tag: "MWL",
  },
  {
    name: "Mommy Makeover",
    desc: "Tummy tuck combined with breast procedures.",
    tag: "Combined",
  },
];

const procedureSteps = [
  { label: "Duration", value: "2–5 hours under general anesthesia" },
  { label: "Hospital stay", value: "1–3 days" },
  { label: "Drains", value: "Removed after 1–2 weeks" },
  { label: "Compression garment", value: "Worn for 6–8 weeks" },
  { label: "Recovery", value: "Return to work in 2–3 weeks; full recovery in 6–8 weeks" },
];

const pricing = [
  { procedure: "Mini Tummy Tuck", price: "$2,800 – $5,500" },
  { procedure: "Standard Full Abdominoplasty", price: "$4,900 – $9,700" },
  { procedure: "Extended Abdominoplasty + Liposuction", price: "$6,900 – $12,500" },
  { procedure: "Fleur-de-lis / Post-massive Weight Loss", price: "$8,300 – $16,700" },
  { procedure: "Mommy Makeover Package (tummy + breast)", price: "$9,700 – $20,800" },
];

export default function TummyTuck() {
  useEffect(() => {
    document.title = "Tummy Tuck (Abdominoplasty) | Medora Health";
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
                  alt="Tummy Tuck Before & After"
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
                  Abdominoplasty (tummy tuck) removes excess abdominal skin and fat while tightening
                  weakened muscles (diastasis recti). Creates a flatter, firmer abdomen. Very popular
                  among post-pregnancy and post-weight-loss patients.
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

        {/* Types */}
        <section className="bg-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A2433] mb-8 text-center">
              {COPY.typesTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {types.map((type, i) => (
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

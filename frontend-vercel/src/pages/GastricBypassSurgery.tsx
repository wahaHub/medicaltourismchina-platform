import { useEffect } from "react";
import { ChevronLeft, Stethoscope, Wallet, CheckCircle2, Clock, Pill } from "lucide-react";
import { Link } from "react-router-dom";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroImage from "@/img/gastric-bypass-surgery.png";

const fixedChromePadding =
  "pt-[calc(44px+3.5rem)] sm:pt-[calc(44px+4rem)] xl:pt-[calc(44px+4.5rem)]";

const COPY = {
  backHome: "Back to Home",
  heroTitle: "Gastric Bypass Surgery",
  heroSubtitle: "Bariatric Surgery — Roux-en-Y Gastric Bypass",
  heroDesc:
    "Roux-en-Y Gastric Bypass (RYGB) is the gold standard bariatric surgery. It creates a small stomach pouch and reroutes the small intestine — reducing both food intake and calorie absorption for the highest long-term weight loss of all bariatric procedures.",
  whatIsItTitle: "What Is It?",
  howItWorksTitle: "How It Works",
  procedureTitle: "Procedure Overview",
  nutritionTitle: "Nutritional Considerations",
  pricingTitle: "Pricing in China (USD)",
  pricingNote:
    "Prices are estimates for mainland China (2024–2025). Actual cost varies by city, hospital tier, surgeon experience, and individual case. Always request a formal quote after consultation.",
  ctaTitle: "Ready to Start?",
  ctaSubtitle: "Get Your Personalized Gastric Bypass Surgery Plan and Quote",
  ctaButton: "Book Your Consultation",
};

const howItWorks = [
  "Step 1: A small stomach pouch (~30ml) is created from the upper stomach.",
  "Step 2: The small intestine is divided and connected directly to the pouch (bypassing the stomach and upper small intestine).",
  "Step 3: The bypassed segment is reconnected lower down — forming a 'Y' shape.",
];

const procedureSteps = [
  { label: "Approach", value: "Laparoscopic (minimally invasive) — Duration: 2–3 hours under general anesthesia" },
  { label: "Hospital Stay", value: "3–5 days — Expected weight loss: 70–80% excess weight in 12–18 months" },
  { label: "Comorbidity Improvement", value: "Strong improvement in Type 2 diabetes, hypertension, and sleep apnea" },
];

const nutrition = [
  "Lifelong vitamin and mineral supplementation required (B12, iron, calcium, vitamin D)",
  "Small frequent meals",
  "Long-term medical follow-up essential",
];

const pricing = [
  { procedure: "Laparoscopic Gastric Bypass (standard)", price: "$8,300 – $13,900" },
  { procedure: "Gastric Bypass (private hospital, Tier 1)", price: "$12,500 – $19,400" },
  { procedure: "International patient all-inclusive package", price: "$15,300 – $22,200" },
  { procedure: "Revision Gastric Bypass (from prior surgery)", price: "$13,900 – $25,000" },
];

export default function GastricBypassSurgery() {
  useEffect(() => {
    document.title = "Gastric Bypass Surgery | MedChina";
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
                  alt="Gastric Bypass Surgery"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* What Is It */}
        <section className="bg-gray-50 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Stethoscope className="h-5 w-5 text-[#1DA78A]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#1A2433]">{COPY.whatIsItTitle}</h2>
              </div>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Roux-en-Y Gastric Bypass (RYGB) is the gold standard bariatric surgery. It creates a small stomach pouch and reroutes the small intestine — reducing both food intake and calorie absorption for the highest long-term weight loss of all bariatric procedures.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="bg-[#1DA78A]/5 rounded-2xl p-6 sm:p-8 border border-[#1DA78A]/10">
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle2 className="h-5 w-5 text-[#1DA78A]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#1A2433]">{COPY.howItWorksTitle}</h2>
              </div>
              <div className="space-y-3">
                {howItWorks.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1DA78A] text-white text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Procedure Overview */}
        <section className="bg-gray-50 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
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
        </section>

        {/* Nutritional Considerations */}
        <section className="bg-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="bg-amber-50 rounded-2xl p-6 sm:p-8 border border-amber-100">
              <div className="flex items-center gap-2 mb-5">
                <Pill className="h-5 w-5 text-amber-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#1A2433]">{COPY.nutritionTitle}</h2>
              </div>
              <div className="space-y-3">
                {nutrition.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
                      !
                    </span>
                    <p className="text-sm text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
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

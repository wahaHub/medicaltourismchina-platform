import { useEffect } from "react";
import { ChevronLeft, Stethoscope, Wallet, CheckCircle2, Users, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroImage from "@/img/gastric-sleeve-surgery.png";

const fixedChromePadding =
  "pt-[calc(44px+3.5rem)] sm:pt-[calc(44px+4rem)] xl:pt-[calc(44px+4.5rem)]";

const COPY = {
  backHome: "Back to Home",
  heroTitle: "Gastric Sleeve Surgery",
  heroSubtitle: "Bariatric Surgery — Weight Loss",
  heroDesc:
    "Sleeve gastrectomy permanently removes approximately 75–80% of the stomach, creating a banana-shaped 'sleeve.' This restricts food intake and reduces hunger hormones (ghrelin), leading to significant and sustained weight loss.",
  whatIsItTitle: "What Is It?",
  whoIsItForTitle: "Who Is It For?",
  procedureTitle: "Procedure Overview",
  risksTitle: "Risks & Considerations",
  pricingTitle: "Pricing in China (USD)",
  pricingNote:
    "Prices are estimates for mainland China (2024–2025). Actual cost varies by city, hospital tier, surgeon experience, and individual case. Always request a formal quote after consultation.",
  ctaTitle: "Ready to Start?",
  ctaSubtitle: "Get Your Personalized Gastric Sleeve Surgery Plan and Quote",
  ctaButton: "Book Your Consultation",
};

const whoIsItFor = [
  "BMI ≥ 35, or BMI ≥ 30 with obesity-related conditions (diabetes, hypertension, sleep apnea)",
  "Patients who have failed diet and exercise programs",
  "Seeking a procedure without intestinal rerouting",
];

const procedureSteps = [
  { label: "Approach", value: "Laparoscopic (minimally invasive, 4–5 small incisions)" },
  { label: "Duration", value: "60–90 minutes" },
  { label: "Hospital Stay", value: "2–3 days — No foreign body implanted; no intestinal bypass" },
  { label: "Expected Weight Loss", value: "60–70% of excess body weight within 12–18 months" },
];

const risks = [
  "Staple line leak (rare, <1%)",
  "GERD (acid reflux) may develop post-surgery",
  "Irreversible procedure — stomach cannot be fully restored",
];

const pricing = [
  { procedure: "Gastric Sleeve (standard public hospital)", price: "$6,900 – $11,100" },
  { procedure: "Gastric Sleeve (private hospital, Tier 1 city)", price: "$11,100 – $16,700" },
  { procedure: "All-inclusive package (surgery + 3-day stay)", price: "$12,500 – $18,100" },
  { procedure: "International patient package", price: "$13,900 – $20,800" },
];

export default function GastricSleeveSurgery() {
  useEffect(() => {
    document.title = "Gastric Sleeve Surgery | MedChina";
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
                  alt="Gastric Sleeve Surgery"
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
                Sleeve gastrectomy permanently removes approximately 75–80% of the stomach, creating a banana-shaped &quot;sleeve.&quot; This restricts food intake and reduces hunger hormones (ghrelin), leading to significant and sustained weight loss.
              </p>
            </div>
          </div>
        </section>

        {/* Who Is It For */}
        <section className="bg-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="bg-[#1DA78A]/5 rounded-2xl p-6 sm:p-8 border border-[#1DA78A]/10">
              <div className="flex items-center gap-2 mb-5">
                <Users className="h-5 w-5 text-[#1DA78A]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#1A2433]">{COPY.whoIsItForTitle}</h2>
              </div>
              <div className="space-y-3">
                {whoIsItFor.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1DA78A] text-white text-[10px] font-bold">
                      ✓
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

        {/* Risks & Considerations */}
        <section className="bg-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="bg-red-50 rounded-2xl p-6 sm:p-8 border border-red-100">
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#1A2433]">{COPY.risksTitle}</h2>
              </div>
              <div className="space-y-3">
                {risks.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
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

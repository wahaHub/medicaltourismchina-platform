import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PUBLIC_MEDIA_BASE_URL } from "@/config/media";
import { setPageSeo } from "@/utils/seo";

type LandingConfig = {
  title: string;
  seoTitle?: string;
  eyebrow: string;
  description: string;
  seoDescription?: string;
  canonicalPath: string;
  heroImage: string;
  procedures: Array<{
    label: string;
    href: string;
  }>;
};

const TREATMENT_IMAGE_BASE = `${PUBLIC_MEDIA_BASE_URL}/low/treatment`;

const landingContent: Record<string, LandingConfig> = {
  cosmetic: {
    title: "Cosmetic Surgery in China",
    eyebrow: "Cosmetic",
    description:
      "Plan cosmetic surgery in China with Medora Health: hospital matching, bilingual coordination, treatment planning, travel support, and post-treatment follow-up.",
    canonicalPath: "/cosmetic-surgery",
    heroImage: `${TREATMENT_IMAGE_BASE}/comprehensive-cosmetic-surgery_x2.png`,
    procedures: [
      { label: "Comprehensive Cosmetic Surgery", href: "/featured-treatments/comprehensive-cosmetic-surgery" },
      { label: "Rhinoplasty", href: "/rhinoplasty" },
      { label: "Double Eyelid Surgery", href: "/double-eyelid-surgery" },
      { label: "Facial Liposuction", href: "/facial-liposuction" },
    ],
  },
  cancer: {
    title: "Cancer Treatment in China",
    eyebrow: "Cancer",
    description:
      "Explore oncology care in China, including proton and carbon ion therapy, SBRT, CAR-T, and coordinated access to leading cancer hospitals.",
    canonicalPath: "/cancer-treatment",
    heroImage: `${TREATMENT_IMAGE_BASE}/proton-carbon-ion-therapy_x2.png`,
    procedures: [
      { label: "Proton & Carbon Ion Therapy", href: "/featured-treatments/proton-carbon-ion-therapy" },
      { label: "SBRT Radiotherapy", href: "/featured-treatments/sbrt-stereotactic-body-radiotherapy" },
      { label: "CAR-T Cell Therapy", href: "/featured-treatments/car-t-cell-therapy" },
      { label: "Cancer Care Department", href: "/treatment/department/cancer" },
    ],
  },
  dental: {
    title: "Dental Treatment in China",
    eyebrow: "Dental",
    description:
      "Access dental care in China, including veneers, smile design, implant planning, bilingual coordination, and travel support for international patients.",
    canonicalPath: "/dental-treatment",
    heroImage: `${TREATMENT_IMAGE_BASE}/all-on-4-6-dental-implants_x2.png`,
    procedures: [
      { label: "Hollywood Smile Veneers", href: "/hollywood-smile-veneers" },
      { label: "All-on-4/6 Dental Implants", href: "/featured-treatments/all-on-4-6-dental-implants" },
      { label: "Free Treatment Quote", href: "/free-quote" },
    ],
  },
  stemCell: {
    title: "Stem Cell Therapy in China",
    eyebrow: "Stem Cell",
    description:
      "Learn about regenerative medicine and stem cell therapy options in China with treatment planning, hospital coordination, and concierge travel support.",
    canonicalPath: "/stem-cell-therapy",
    heroImage: `${TREATMENT_IMAGE_BASE}/stem-cell-therapy_x2.png`,
    procedures: [
      { label: "Stem Cell Therapy", href: "/featured-treatments/stem-cell-therapy" },
      { label: "Hematopoietic Stem Cell Transplantation", href: "/featured-treatments/hematopoietic-stem-cell-transplantation" },
      { label: "Medical Enquiry", href: "/medical-enquiry" },
    ],
  },
};

export default function SeoTreatmentLanding({ type }: { type: keyof typeof landingContent }) {
  const content = landingContent[type];

  useEffect(() => {
    setPageSeo({
      title: content.seoTitle ?? `${content.title} | Medora Health`,
      description: content.seoDescription ?? content.description,
      path: content.canonicalPath,
      image: content.heroImage,
    });
  }, [content]);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <main className="pt-[112px] sm:pt-[120px]">
        <section className="bg-gradient-to-br from-teal-50 via-white to-blue-50">
          <div className="container mx-auto grid min-h-[520px] items-center gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                {content.eyebrow}
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
                {content.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                {content.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-teal-700 px-6 hover:bg-teal-800">
                  <Link to="/free-quote">
                    Get a Free Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-6">
                  <Link to="/treatment">View All Treatments</Link>
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] shadow-2xl shadow-teal-950/10">
              <img src={content.heroImage} alt={content.title} className="h-[360px] w-full object-cover lg:h-[420px]" />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-950">Related treatments</h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Start with one of the main treatment pages below, or request a coordinated plan from our patient team.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {content.procedures.map((procedure) => (
              <Link
                key={procedure.href}
                to={procedure.href}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm transition hover:border-teal-300 hover:shadow-md"
              >
                <span className="flex items-center gap-3 font-semibold">
                  <CheckCircle2 className="h-5 w-5 text-teal-700" />
                  {procedure.label}
                </span>
                <ArrowRight className="h-5 w-5 text-slate-400" />
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

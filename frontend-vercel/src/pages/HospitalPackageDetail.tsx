import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuoteRequestModal from "@/components/QuoteRequestModal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hospitalApi } from "@/services/api/hospital";
import { useLanguage } from "@/contexts/LanguageContext";
import type { HospitalPackageDetail as HospitalPackageDetailPayload } from "@/types/hospital-extended";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  Quote,
  Star,
} from "lucide-react";

const pageFontClass = "font-['Inter',sans-serif]";

const packageTagColor: Record<string, string> = {
  treatment: "border-[#b8e4e0] bg-[#edf9f7] text-[#159a90]",
  service: "border-[#c8dbfb] bg-[#f1f7ff] text-[#2f77c7]",
  audience: "border-[#f4d6a0] bg-[#fff7e8] text-[#b7791f]",
  city: "border-[#d8d4fe] bg-[#f5f3ff] text-[#6d5bd0]",
  price: "border-[#d4f2d0] bg-[#f1ffef] text-[#2d8a45]",
  style: "border-[#ffd5df] bg-[#fff1f5] text-[#c75c7f]",
};

function formatCurrencyLabel(priceLabel: string | undefined): {
  amount: string;
  currency: string;
} {
  const raw = priceLabel?.trim() ?? "";
  if (!raw) {
    return { amount: "", currency: "" };
  }

  const parts = raw.split(/\s+/);
  if (parts.length >= 2 && /^[A-Z]{3}$/.test(parts[0])) {
    return {
      currency: parts[0],
      amount: parts.slice(1).join(" "),
    };
  }

  return { amount: raw, currency: "" };
}

const HospitalPackageDetail = () => {
  const { slug, packageSlug } = useParams();
  const { currentLanguage } = useLanguage();
  const [active, setActive] = useState(0);
  const [pkg, setPkg] = useState<HospitalPackageDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  useEffect(() => {
    let activeRequest = true;

    async function loadPackageDetail() {
      if (!slug || !packageSlug) {
        setError("Package not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await hospitalApi.getHospitalPackageDetailBySlug(
          slug,
          packageSlug,
          currentLanguage.apiCode,
        );

        if (!activeRequest) return;
        setPkg(response.data);
      } catch (loadError) {
        if (!activeRequest) return;
        const message = loadError instanceof Error ? loadError.message : "Failed to load package.";
        setError(message);
      } finally {
        if (activeRequest) {
          setLoading(false);
        }
      }
    }

    void loadPackageDetail();

    return () => {
      activeRequest = false;
    };
  }, [currentLanguage.apiCode, packageSlug, slug]);

  useEffect(() => {
    setActive(0);
  }, [pkg?.id]);

  const backHref = slug ? `/hospitals/${slug}` : "/hospitals";
  const gallery = useMemo(() => {
    if (!pkg) return [];
    const merged = [pkg.cover_image_url, ...(pkg.gallery ?? [])].filter(Boolean) as string[];
    return Array.from(new Set(merged));
  }, [pkg]);
  const currentImage = gallery[active] || pkg?.cover_image_url || "";
  const price = formatCurrencyLabel(pkg?.price_label);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6fcfb_0%,#eef8f7_48%,#f7fbff_100%)]">
      <TopBanner />
      <Header />
      <main className="min-h-screen px-4 pb-16 pt-32 sm:px-6 sm:pt-36 lg:px-8">
        <div className="container">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to={backHref}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Hospital
            </Link>
          </Button>

          {loading ? (
            <Card className="p-8 shadow-card">
              <p className={`${pageFontClass} text-sm text-muted-foreground`}>
                Loading package details...
              </p>
            </Card>
          ) : error || !pkg ? (
            <Card className="p-8 shadow-card">
              <h1 className={`${pageFontClass} text-xl font-semibold text-foreground`}>
                Package unavailable
              </h1>
              <p className={`mt-2 text-sm text-muted-foreground ${pageFontClass}`}>
                {error ?? "We could not find this package."}
              </p>
            </Card>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              <div className="min-w-0 space-y-8">
                <Card className="overflow-hidden shadow-card">
                  <div className="relative h-[380px] bg-muted">
                    {currentImage ? (
                      <img
                        src={currentImage}
                        alt={pkg.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className={`grid h-full w-full place-items-center text-sm ${pageFontClass} text-muted-foreground`}>
                        Package image unavailable
                      </div>
                    )}
                  </div>
                  {gallery.length > 1 ? (
                    <div className="flex gap-2 overflow-x-auto p-3">
                      {gallery.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          onClick={() => setActive(index)}
                          className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded border-2 transition ${
                            active === index ? "border-primary" : "border-transparent opacity-70"
                          }`}
                        >
                          <img src={image} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </Card>

                <div>
                  {pkg.tags && pkg.tags.length > 0 ? (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {pkg.tags.map((tag) => (
                        <span
                          key={`${tag.category}-${tag.label}`}
                          className={`rounded-full border px-2.5 py-1 text-xs ${
                            packageTagColor[tag.category ?? ""] ?? "border-[#b8e4e0] bg-[#edf9f7] text-[#159a90]"
                          }`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <h1 className="text-2xl font-bold text-foreground md:text-3xl">{pkg.title}</h1>
                  {pkg.subtitle ? (
                    <p className="mt-2 text-muted-foreground">{pkg.subtitle}</p>
                  ) : null}
                </div>

                {pkg.summary ? (
                  <Card className="p-6 shadow-card">
                    <h2 className="mb-3 text-lg font-semibold text-primary">Overview</h2>
                    <p className="leading-relaxed text-foreground/80">{pkg.summary}</p>
                  </Card>
                ) : null}

                {pkg.includes && pkg.includes.length > 0 ? (
                  <Card className="p-6 shadow-card">
                    <h2 className="mb-4 text-lg font-semibold text-primary">Package Includes</h2>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {pkg.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ) : null}

                {pkg.process && pkg.process.length > 0 ? (
                  <Card className="p-6 shadow-card">
                    <h2 className="mb-4 text-lg font-semibold text-primary">Treatment Process</h2>
                    <ol className="space-y-4">
                      {pkg.process.map((step, index) => (
                        <li key={`${step.step}-${index}`} className="flex gap-4">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{step.step}</div>
                            <div className="text-sm text-muted-foreground">{step.desc}</div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </Card>
                ) : null}

                {pkg.cases && pkg.cases.length > 0 ? (
                  <Card className="p-6 shadow-card">
                    <h2 className="mb-4 text-lg font-semibold text-primary">Patient Cases</h2>
                    <div className="space-y-4">
                      {pkg.cases.map((patientCase, index) => (
                        <div key={`${patientCase.name}-${index}`} className="border-l-2 border-primary/40 py-1 pl-4">
                          <div className="text-sm font-semibold">
                            {patientCase.name}{" "}
                            {(patientCase.age || patientCase.country) ? (
                              <span className="font-normal text-muted-foreground">
                                · {[patientCase.age, patientCase.country].filter(Boolean).join(" · ")}
                              </span>
                            ) : null}
                          </div>
                          {patientCase.story ? (
                            <div className="mt-1 text-sm text-foreground/80">{patientCase.story}</div>
                          ) : null}
                          {patientCase.result ? (
                            <div className="mt-1 text-sm text-primary">✓ {patientCase.result}</div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : null}

                {pkg.reviews && pkg.reviews.length > 0 ? (
                  <Card className="p-6 shadow-card">
                    <h2 className="mb-4 text-lg font-semibold text-primary">Patient Reviews</h2>
                    <div className="space-y-4">
                      {pkg.reviews.map((review, index) => (
                        <div key={`${review.name}-${index}`} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold">
                              {review.name}{" "}
                              {review.country ? (
                                <span className="text-xs font-normal text-muted-foreground">
                                  · {review.country}
                                </span>
                              ) : null}
                            </div>
                            {review.rating ? (
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: review.rating }).map((_, ratingIndex) => (
                                  <Star
                                    key={`${review.name}-${ratingIndex}`}
                                    className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                                  />
                                ))}
                              </div>
                            ) : null}
                          </div>
                          {review.date ? (
                            <div className="mt-0.5 text-xs text-muted-foreground">{review.date}</div>
                          ) : null}
                          {review.comment ? (
                            <div className="mt-2 flex gap-2 text-sm text-foreground/80">
                              <Quote className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                              {review.comment}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : null}
              </div>

              <aside className="space-y-4 self-start lg:sticky lg:top-24">
                <Card className="p-6 shadow-card">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Total Price
                  </div>
                  {price.amount ? (
                    <div className="mt-1 flex items-baseline gap-1">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="text-3xl font-bold text-primary">{price.amount}</span>
                      {price.currency ? (
                        <span className="ml-1 text-sm text-muted-foreground">{price.currency}</span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-muted-foreground">Contact us for pricing</div>
                  )}
                  {pkg.duration ? (
                    <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" /> {pkg.duration}
                    </div>
                  ) : null}

                  <Button
                    size="lg"
                    className="mt-5 w-full bg-[linear-gradient(135deg,#18a89f,#3383d1)] hover:opacity-95"
                    onClick={() => setIsQuoteModalOpen(true)}
                  >
                    Request Details
                  </Button>
                </Card>

                <Card className="p-5 shadow-card">
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Provided By
                  </h3>
                  <div className="text-sm font-semibold">{pkg.hospital.name}</div>
                  {pkg.hospital.location ? (
                    <div className="mt-1 text-xs text-muted-foreground">{pkg.hospital.location}</div>
                  ) : null}
                  <Badge variant="secondary" className="mt-3 text-xs">
                    Hospital Package
                  </Badge>
                </Card>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        procedureName={pkg?.title ?? ""}
        type="quote"
      />
    </div>
  );
};

export default HospitalPackageDetail;

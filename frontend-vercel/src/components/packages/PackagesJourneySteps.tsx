import { Link } from "react-router-dom";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { PRE_DEPARTURE_GUIDE_URL } from "@/config/media";
import { cn } from "@/lib/utils";
import journeyStep1 from "@/img/step1.jpg";
import journeyStep2 from "@/img/step2.jpg";
import journeyStep3 from "@/img/step3.jpg";
import journeyStep4 from "@/img/step4.jpg";
import journeyStep5 from "@/img/step5.jpg";
import journeyStep6 from "@/img/step6.jpg";
import packagesHeroBackground from "@/img/packages-hero-bg-generated.jpg";

const BRAND_TEAL = "#14B8A6";
const BRAND_BLUE = "#0F638E";
const TITLE_INK = "#0F172A";
const BODY_COPY = "#475569";
const SURFACE_TINT = "#F5F7F6";
const TEAL_TINT = "rgba(20, 184, 166, 0.08)";
const TEAL_BORDER = "rgba(20, 184, 166, 0.18)";
const BLUE_TINT = "rgba(15, 99, 142, 0.08)";
const BLUE_BORDER = "rgba(15, 99, 142, 0.16)";
const SERVICE_PACKAGE_HREF = "/health-packages";

const STEP_IMAGES = [
  journeyStep1,
  journeyStep2,
  journeyStep3,
  journeyStep4,
  journeyStep5,
  journeyStep6,
] as const;

function StepPanel({
  children,
  className,
  tone = "teal",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "teal" | "blue";
}) {
  const isBlue = tone === "blue";

  return (
    <div
      className={cn("rounded-xl px-5 py-5 sm:px-6 sm:py-6", className)}
      style={{
        backgroundColor: isBlue ? BLUE_TINT : TEAL_TINT,
        border: `1px solid ${isBlue ? BLUE_BORDER : TEAL_BORDER}`,
        color: BODY_COPY,
      }}
    >
      {children}
    </div>
  );
}

function StepKicker({ step }: { step: number }) {
  const { t, currentLanguage } = useLanguage();

  return (
    <p
      className={cn(
        "mb-3 text-[0.75rem] font-bold tracking-[0.28em] text-[#0F638E] sm:text-[0.8125rem]",
        currentLanguage.code !== "zh" && "uppercase",
      )}
    >
      {t("journeySteps.step.label", { n: step })}
    </p>
  );
}

function Step1LabelPriceRow() {
  const { t, currentLanguage } = useLanguage();

  return (
    <div className="mb-3 flex flex-wrap items-center gap-3">
      <span
        className={cn(
          "text-[0.75rem] font-bold tracking-[0.26em] text-[#0F638E] sm:text-[0.8125rem]",
          currentLanguage.code !== "zh" && "uppercase",
        )}
      >
        {t("journeySteps.step.label", { n: 1 })}
      </span>
      <span
        className="inline-flex items-center rounded-full px-4 py-1.5 text-[0.8125rem] font-semibold shadow-sm"
        style={{ backgroundColor: TEAL_TINT, color: BRAND_BLUE }}
      >
        {t("journeySteps.step1.priceRange")}
      </span>
    </div>
  );
}

function StepImageCard({
  stepNumber,
  src,
  alt,
  reverse,
}: {
  stepNumber: number;
  src: string;
  alt: string;
  reverse?: boolean;
}) {
  return (
    <div className={cn("p-5 sm:p-6 lg:p-7", reverse && "lg:order-2")}>
      <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={src}
          alt={alt}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/20" />
        <div className="absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#14B8A6] to-[#0F638E] text-base font-bold text-white shadow-lg sm:h-12 sm:w-12 sm:text-lg">
          {stepNumber}
        </div>
      </div>
    </div>
  );
}

function InlineLink({
  to,
  href,
  children,
  bold,
}: {
  to?: string;
  href?: string;
  children: React.ReactNode;
  bold?: boolean;
}) {
  const className = cn(
    "inline-block rounded-md px-1.5 py-0.5 underline decoration-[#14B8A6] decoration-2 underline-offset-[3px]",
    "transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/30 focus-visible:ring-offset-2",
    bold ? "font-semibold" : "font-medium",
  );
  const style = { backgroundColor: TEAL_TINT, color: BRAND_BLUE } as const;

  if (to) {
    return (
      <Link to={to} className={className} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} style={style} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

const stepTitleClass =
  "text-[1.65rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[1.9rem] md:text-[2.05rem]";
const stepBodyClass = "mt-4 text-[1rem] leading-7 text-slate-600 sm:text-[1.0625rem] sm:leading-8";

function Step1LeadParagraph() {
  const { t, currentLanguage } = useLanguage();
  const step1BodyA1b = t("journeySteps.step1.bodyA1b");
  const isZh = currentLanguage.code === "zh";

  return (
    <p className={cn(stepBodyClass, "min-w-0")} style={{ color: TITLE_INK }}>
      <span className={cn(step1BodyA1b && !isZh && "lg:inline-block lg:whitespace-nowrap")}>
        <InlineLink to="/free-quote">{t("journeySteps.step1.tabPreferred")}</InlineLink>
        {t("journeySteps.step1.introMid")}
        <InlineLink to="/free-quote" bold>
          {t("journeySteps.step1.tabRecommend")}
        </InlineLink>
        {t("journeySteps.step1.introLine1End")}
      </span>
      {step1BodyA1b ? (
        <>
          <span className="lg:hidden"> </span>
          <br className="hidden lg:block" />
          {step1BodyA1b}{" "}
        </>
      ) : (
        " "
      )}
      {t("journeySteps.step1.bodyA2")}
    </p>
  );
}

function Step2Content() {
  const { t, currentLanguage } = useLanguage();

  return (
    <div className="mt-4 space-y-4 sm:space-y-5">
      <p className={stepBodyClass} style={{ color: BODY_COPY }}>
        {t("journeySteps.step2.bodyA")}
      </p>
      <StepPanel>
        <h3
          className={cn(
            "mb-3 text-[0.8rem] font-bold tracking-[0.22em] text-[#0F638E] sm:text-[0.9rem]",
            currentLanguage.code !== "zh" && "uppercase",
          )}
        >
          {t("journeySteps.step2.visaTitle")}
        </h3>
        <p className="m-0 text-[1rem] leading-7 sm:text-[1.0625rem] sm:leading-8">{t("journeySteps.step2.visa3Body")}</p>
      </StepPanel>
    </div>
  );
}

function StepArticle({
  step,
  reverse = false,
  children,
}: {
  step: number;
  reverse?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <article
      data-testid="packages-step-card"
      className="group overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(15,99,142,0.09)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_26px_55px_rgba(15,99,142,0.14)]"
    >
      <div className="grid items-center lg:grid-cols-2">
        <StepImageCard
          stepNumber={step}
          src={STEP_IMAGES[step - 1]}
          alt={t("journeySteps.step.imageAlt", { n: step })}
          reverse={reverse}
        />
        <div className={cn("p-6 sm:p-8 lg:p-10", reverse && "lg:order-1")}>{children}</div>
      </div>
    </article>
  );
}

export default function PackagesJourneySteps() {
  const { t } = useLanguage();

  return (
    <>
      <section className="relative mt-[112px] overflow-hidden sm:mt-[120px]">
        <div className="absolute inset-0 bg-slate-100">
          <img
            src={packagesHeroBackground}
            alt={t("journeySteps.hero.title")}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-white/62" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/82 to-white/10" />
        </div>

        <div className="container relative z-10 mx-auto flex min-h-[360px] max-w-7xl items-center px-4 py-12 sm:min-h-[430px] sm:px-6 lg:px-8">
          <div data-testid="packages-hero" className="max-w-4xl">
            <p className="mb-3 text-[0.75rem] font-bold uppercase tracking-[0.32em] text-[#0F638E] sm:text-[0.8125rem]">
              {t("journeySteps.hero.eyebrow")}
            </p>
            <h1 className="text-3xl font-bold leading-tight text-[#0A4A5C] sm:text-4xl lg:text-5xl">
              {t("journeySteps.hero.title")}
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-[#0A4A5C]/80 sm:text-base">
              {t("journeySteps.hero.subtitle")}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="h-auto rounded-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E] px-7 py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95"
              >
                <Link to="/free-quote">{t("journeySteps.cta.button")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 sm:py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <div className="mb-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E]" />
              <h2 className="text-2xl font-bold leading-tight text-[#0A4A5C] sm:text-3xl">
                {t("journeySteps.overview.title")}
              </h2>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-10 sm:py-14 md:py-16" style={{ backgroundColor: SURFACE_TINT }}>
        <div data-testid="packages-content-shell" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 md:space-y-8">
            <StepArticle step={1}>
              <Step1LabelPriceRow />
              <h2 className={stepTitleClass} style={{ color: TITLE_INK }}>
                {t("journeySteps.step1.title")}
              </h2>
              <Step1LeadParagraph />
              <StepPanel className="mt-5 sm:mt-6">
                <p className="m-0 text-[1rem] leading-7 italic sm:text-[1.0625rem] sm:leading-8">
                  {t("journeySteps.step1.bodyB")}
                </p>
              </StepPanel>
            </StepArticle>

            {[2, 3, 4, 5, 6].map((step) => {
              const reverse = step % 2 === 0;
              const stepKey = `step${step}` as const;

              return (
                <StepArticle key={step} step={step} reverse={reverse}>
                  <StepKicker step={step} />
                  <h2 className={stepTitleClass} style={{ color: TITLE_INK }}>
                    {t(`journeySteps.${stepKey}.title`)}
                  </h2>

                  {step === 2 && <Step2Content />}

                  {step === 3 && (
                    <p className={stepBodyClass} style={{ color: BODY_COPY }}>
                      {t("journeySteps.step3.bodyBefore")}
                      <InlineLink href={SERVICE_PACKAGE_HREF}>{t("journeySteps.step3.linkPackage")}</InlineLink>
                      {t("journeySteps.step3.bodyMid")}
                      <InlineLink href={PRE_DEPARTURE_GUIDE_URL}>{t("journeySteps.step3.linkGuide")}</InlineLink>
                      {t("journeySteps.step3.bodyAfter")}
                    </p>
                  )}

                  {step === 4 && (
                    <p className={stepBodyClass} style={{ color: BODY_COPY }}>
                      {t("journeySteps.step4.body")}
                    </p>
                  )}

                  {step === 5 && (
                    <p className={stepBodyClass} style={{ color: BODY_COPY }}>
                      {t("journeySteps.step5.bodyBefore")}
                      <InlineLink to="/why-china">{t("journeySteps.step5.linkTravel")}</InlineLink>
                      {t("journeySteps.step5.bodyAfter")}
                    </p>
                  )}

                  {step === 6 && (
                    <div className="mt-4 space-y-4 sm:space-y-5" style={{ color: BODY_COPY }}>
                      <p className="m-0 text-[1rem] leading-7 sm:text-[1.0625rem] sm:leading-8">{t("journeySteps.step6.bodyA")}</p>
                      <StepPanel>
                        <p className="m-0 text-[1rem] leading-7 sm:text-[1.0625rem] sm:leading-8">
                          {t("journeySteps.step6.bodyBBefore")}
                          <InlineLink to="/free-quote">{t("journeySteps.step6.linkReferral")}</InlineLink>
                          {t("journeySteps.step6.bodyBAfter")}
                        </p>
                      </StepPanel>
                    </div>
                  )}
                </StepArticle>
              );
            })}
          </div>

          <section className="mt-10 sm:mt-12 md:mt-14">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#1DA78A] to-[#0F638E] px-6 py-10 text-center shadow-[0_24px_55px_rgba(15,99,142,0.16)] sm:px-8 sm:py-12 md:px-12">
              <h2 className="text-[1.8rem] font-bold leading-tight tracking-tight text-white sm:text-[2rem] md:text-[2.2rem]">
                {t("journeySteps.cta.title")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
                {t("journeySteps.cta.subtitle")}
              </p>
              <Button
                asChild
                className="mt-8 h-auto rounded-full border-0 bg-white px-8 py-3.5 text-base font-semibold text-[#0F638E] shadow-lg hover:bg-white/95 sm:px-10"
              >
                <Link to="/free-quote">{t("journeySteps.cta.button")}</Link>
              </Button>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}

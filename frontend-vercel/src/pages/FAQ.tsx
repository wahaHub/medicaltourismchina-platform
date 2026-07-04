import { useEffect } from "react";
import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TopBanner from "@/components/TopBanner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { faqContent } from "./faqContent";

const FAQ = () => {
  const { currentLanguage, t } = useLanguage();
  const content = faqContent[currentLanguage.code as keyof typeof faqContent] ?? faqContent.en;

  useEffect(() => {
    document.title = currentLanguage.code === "zh" ? "中国医疗旅游常见问题 | Medora Health" : "FAQ | Medora Health";
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [currentLanguage.code]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBanner />
      <Header />

      <main className="px-4 pb-20 pt-32 sm:px-6 sm:pt-36 lg:px-8">
        <section className="mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0F638E] via-[#117C8F] to-[#1DA78A] px-6 py-12 text-white shadow-xl sm:px-10 lg:px-14">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/75">{content.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">{content.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">{content.subtitle}</p>
        </section>

        <section className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
          <Card className="rounded-[28px] border-white/70 bg-white/95 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-slate-900">
                {t("faq.questionsTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {content.questions.map((item, index) => (
                  <AccordionItem key={item.question} value={`item-${index}`} className="border-slate-200">
                    <AccordionTrigger className="text-left text-base font-semibold text-slate-900 hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-7 text-slate-600">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {content.cards.map((card) => (
              <Card key={card.title} className="rounded-[28px] border-white/60 bg-white/90 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm leading-6 text-slate-600">
                    {card.points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-[#1DA78A]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}

            <Card className="rounded-[28px] border-none bg-slate-900 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">{content.ctaTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-200">{content.ctaBody}</p>
                <Link
                  to="/free-quote"
                  className="mt-6 inline-flex items-center rounded-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {content.ctaButton}
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// This page is route-only, so the fast-refresh export restriction is not relevant here.
// eslint-disable-next-line react-refresh/only-export-components
export default FAQ;

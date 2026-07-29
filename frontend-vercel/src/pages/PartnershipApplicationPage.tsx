import { useEffect } from "react";
import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PartnershipApplicationForm } from "@/components/work-with-us/PartnershipApplicationForm";
import { workWithUsTabTheme } from "@/components/work-with-us/theme";
import TopBanner from "@/components/TopBanner";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizePathname, type SiteLocale } from "@/utils/locale-routing";
import {
  workWithUsContent,
  type WorkWithUsTabContent,
  type WorkWithUsTabId,
} from "./workWithUsContent";

type PartnershipApplicationPageProps = {
  applicationType: WorkWithUsTabId;
};

export default function PartnershipApplicationPage({ applicationType }: PartnershipApplicationPageProps) {
  const { currentLanguage } = useLanguage();
  const content = workWithUsContent[currentLanguage.code as keyof typeof workWithUsContent] ?? workWithUsContent.en;
  const locale = (currentLanguage.code === "zh" || currentLanguage.code === "ar" || currentLanguage.code === "id" ? currentLanguage.code : "en") as "en" | "zh" | "ar" | "id";
  const tab = content.tabs.find((item) => item.id === applicationType) as WorkWithUsTabContent;
  const theme = workWithUsTabTheme[applicationType];
  const localeCopy =
    locale === "zh"
      ? {
          eyebrow: "合作申请",
          backLabel: "返回合作总览",
        }
      : locale === "ar"
        ? { eyebrow: "طلب شراكة", backLabel: "العودة إلى نظرة الشراكة" }
        : locale === "id"
          ? { eyebrow: "Pengajuan kemitraan", backLabel: "Kembali ke ringkasan kemitraan" }
          : {
          eyebrow: "Partner application",
          backLabel: "Back to Work With Us",
            };

  useEffect(() => {
    document.title = `${tab.ctaLabel} | Medora Health`;
  }, [tab.ctaLabel]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBanner />
      <Header />

      <main className="px-4 pb-20 pt-32 sm:px-6 sm:pt-36 lg:px-8">
        <section className="mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-xl ring-1 ring-slate-200/70">
          <div className={`bg-gradient-to-br ${theme.sectionBg} px-6 py-10 sm:px-10 lg:px-14 lg:py-14`}>
            <div className="max-w-3xl">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">{localeCopy.eyebrow}</p>
                <Link
                  to={`${localizePathname("/work-with-us", currentLanguage.code as SiteLocale)}#${applicationType}`}
                  className="mt-4 inline-flex items-center text-sm font-semibold text-slate-500 transition hover:text-slate-800"
                >
                  {localeCopy.backLabel}
                </Link>
                <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">{tab.ctaLabel}</h1>
                <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">{tab.description}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
            <section className="mx-auto max-w-3xl">
              <PartnershipApplicationForm activeTab={applicationType} locale={locale} className="" />
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

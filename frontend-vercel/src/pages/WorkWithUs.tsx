import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { workWithUsBadgeTheme, workWithUsTabTheme } from "@/components/work-with-us/theme";
import TopBanner from "@/components/TopBanner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

import { workWithUsContent, type WorkWithUsSectionCard, type WorkWithUsTabContent, type WorkWithUsTabId } from "./workWithUsContent";

const TAB_ORDER: WorkWithUsTabId[] = ["hospitals", "referral-partners", "travel-services"];

function resolveTabFromHash(hash: string): WorkWithUsTabId {
  const candidate = decodeURIComponent(hash.replace(/^#/, "")) as WorkWithUsTabId;
  return TAB_ORDER.includes(candidate) ? candidate : "hospitals";
}

function renderStandardCard(card: WorkWithUsSectionCard) {
  return (
    <Card key={card.title} className="h-full rounded-[24px] border-slate-200/80 bg-white/95 shadow-sm">
      <CardHeader className="pb-3">
        <div className={`w-fit rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${workWithUsBadgeTheme[card.accent ?? "blue"]}`}>
          {card.title}
        </div>
      </CardHeader>
      <CardContent>
        {card.body ? <p className="text-sm leading-7 text-slate-600">{card.body}</p> : null}
        {card.bullets ? (
          <ul className="space-y-3 text-sm leading-7 text-slate-600">
            {card.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-slate-400" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function WorkWithUs() {
  const { currentLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const content = currentLanguage.code === "zh" ? workWithUsContent.zh : workWithUsContent.en;

  const tabsById = useMemo(
    () => Object.fromEntries(content.tabs.map((tab) => [tab.id, tab])) as Record<WorkWithUsTabId, WorkWithUsTabContent>,
    [content.tabs],
  );

  const [activeTab, setActiveTab] = useState<WorkWithUsTabId>(() => resolveTabFromHash(location.hash));

  useEffect(() => {
    setActiveTab(resolveTabFromHash(location.hash));
  }, [location.hash]);

  useEffect(() => {
    document.title = currentLanguage.code === "zh" ? "与我们合作 | Medora Health" : "Work With Us | Medora Health";
  }, [currentLanguage.code]);

  const tab = tabsById[activeTab];
  const theme = workWithUsTabTheme[activeTab];

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBanner />
      <Header />

      <main className="px-4 pb-20 pt-32 sm:px-6 sm:pt-36 lg:px-8">
        <section className="mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0F638E] via-[#117C8F] to-[#1DA78A] px-6 py-12 text-white shadow-xl sm:px-10 lg:px-14">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/75">{content.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">{content.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">{content.subtitle}</p>

          <div className="mt-8 flex flex-wrap gap-3 rounded-[24px] bg-white/12 p-2 backdrop-blur-sm">
            {content.tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                data-active={activeTab === item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  navigate(`/work-with-us#${item.id}`, { replace: location.pathname === "/work-with-us" });
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold text-white/80 transition hover:text-white ${workWithUsTabTheme[item.id].button}`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.tabLabel}
              </button>
            ))}
          </div>
        </section>

        <section
          id={tab.id}
          className={`mx-auto mt-10 max-w-6xl rounded-[32px] border border-white/70 bg-gradient-to-br ${theme.sectionBg} p-6 shadow-lg sm:p-8`}
        >
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-8 sm:flex-row sm:items-start">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${theme.iconBg}`}>
              {tab.icon}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{tab.heading}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{tab.description}</p>
            </div>
          </div>

          <div className="mt-8 space-y-10">
            {tab.blocks.map((block) => (
              <section key={block.label}>
                <div className="mb-5 flex items-center gap-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{block.label}</p>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {block.layout === "badges" ? (
                  <Card className="rounded-[24px] border-slate-200/80 bg-white/95 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex flex-wrap gap-3">
                        {block.cards.map((card) => (
                          <span
                            key={card.title}
                            className={`rounded-full border px-3 py-2 text-xs font-medium ${workWithUsBadgeTheme[card.accent ?? "blue"]}`}
                          >
                            {card.title}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {block.layout === "two" ? <div className="grid gap-4 md:grid-cols-2">{block.cards.map(renderStandardCard)}</div> : null}
                {block.layout === "three" ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{block.cards.map(renderStandardCard)}</div> : null}

                {block.layout === "steps" ? (
                  <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 shadow-sm">
                    {block.cards.map((card, index) => (
                      <div
                        key={card.title}
                        className={`flex gap-4 px-5 py-5 ${index !== block.cards.length - 1 ? "border-b border-slate-200" : ""}`}
                      >
                        <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${theme.step}`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
                          {card.body ? <p className="mt-1 text-sm leading-7 text-slate-600">{card.body}</p> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </div>

          <div className={`mt-10 rounded-[24px] border p-6 ${theme.callout}`}>
            <p className="text-sm leading-7 sm:text-base">{tab.callout}</p>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-8 text-center">
            <Link
              to={tab.ctaHref}
              className={`inline-flex items-center rounded-full bg-gradient-to-r px-6 py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 ${theme.cta}`}
            >
              {tab.ctaLabel}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

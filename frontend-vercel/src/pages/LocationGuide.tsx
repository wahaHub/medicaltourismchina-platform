import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, Languages, MapPin, Plane, WalletCards } from "lucide-react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "@/pages/NotFound";
import { useLanguage } from "@/contexts/LanguageContext";
import { setPageSeo } from "@/utils/seo";

type CityGuide = {
  name: string;
  province: string;
  airport: string;
  overview: string;
  medicalFocus: string;
};

const CITY_GUIDES: Record<string, CityGuide> = {
  beijing: {
    name: "Beijing",
    province: "Beijing Municipality",
    airport: "Beijing Capital International Airport (PEK) and Beijing Daxing International Airport (PKX)",
    overview: "China’s capital combines major national referral hospitals, specialist medical centers, international transport links, and a large network of accommodation options.",
    medicalFocus: "Complex referrals, oncology, cardiovascular care, neurology, orthopedics, and multidisciplinary specialist review.",
  },
  shanghai: {
    name: "Shanghai",
    province: "Shanghai Municipality",
    airport: "Shanghai Pudong International Airport (PVG) and Shanghai Hongqiao International Airport (SHA)",
    overview: "Shanghai is a major international gateway with extensive tertiary hospital capacity, international medical departments, and convenient regional transport.",
    medicalFocus: "Oncology, proton and heavy-ion therapy, cardiology, pediatrics, ophthalmology, and precision diagnostics.",
  },
  guangzhou: {
    name: "Guangzhou",
    province: "Guangdong Province",
    airport: "Guangzhou Baiyun International Airport (CAN)",
    overview: "Guangzhou is southern China’s principal medical and transport hub, with strong specialist hospitals and convenient access from Southeast Asia.",
    medicalFocus: "Oncology, respiratory medicine, organ transplantation, reproductive medicine, dentistry, and rehabilitation.",
  },
  shenzhen: {
    name: "Shenzhen",
    province: "Guangdong Province",
    airport: "Shenzhen Bao’an International Airport (SZX)",
    overview: "Shenzhen offers modern hospital infrastructure, proximity to Hong Kong, and a broad technology and life-sciences ecosystem.",
    medicalFocus: "Advanced diagnostics, oncology, rehabilitation, health screening, dentistry, and technology-assisted care.",
  },
  chengdu: {
    name: "Chengdu",
    province: "Sichuan Province",
    airport: "Chengdu Tianfu International Airport (TFU) and Chengdu Shuangliu International Airport (CTU)",
    overview: "Chengdu is western China’s leading medical center and a regional referral destination with comparatively moderate accommodation and living costs.",
    medicalFocus: "Dentistry, ophthalmology, rehabilitation, oncology, neurology, and complex regional referrals.",
  },
  chongqing: {
    name: "Chongqing",
    province: "Chongqing Municipality",
    airport: "Chongqing Jiangbei International Airport (CKG)",
    overview: "Chongqing serves a large population across southwest China and combines major teaching hospitals with growing international transport access.",
    medicalFocus: "Oncology, emergency medicine, orthopedics, cardiovascular care, and rehabilitation.",
  },
};

const COPY = {
  en: {
    eyebrow: "China medical travel destination",
    intro: (city: string) => `Plan medical care in ${city} with practical information about hospitals, travel, language support, accommodation, and local costs.`,
    hospitals: "Hospitals and specialist care",
    hospitalsBody: "Compare hospitals by specialty, international patient support, location, and the medical records required for review.",
    travel: "Airport and local transport",
    travelBody: "Confirm the receiving hospital and appointment schedule before booking flights. Transfer times vary by district and traffic.",
    language: "Medical interpretation",
    languageBody: "Arrange professional interpretation for consultations, consent, admission, discharge instructions, and follow-up communication.",
    stay: "Accommodation and daily costs",
    stayBody: "Choose accommodation based on the treating hospital, expected mobility, treatment schedule, and the needs of accompanying family members.",
    planning: "Visa and treatment planning",
    planningBody: "Visa category and supporting documents depend on nationality, purpose, and length of stay. Verify current consular requirements before travel.",
    viewHospitals: (city: string) => `View hospitals in ${city}`,
  },
  zh: {
    eyebrow: "中国医疗旅行目的地",
    intro: (city: string) => `了解在${city}就医所需的医院、交通、语言支持、住宿和当地费用信息。`,
    hospitals: "医院与专科医疗",
    hospitalsBody: "根据专科、国际患者服务、地点和病历审核要求比较医院。",
    travel: "机场与当地交通",
    travelBody: "请在预订机票前确认接诊医院和预约时间；不同区域和交通状况会影响接送时间。",
    language: "医疗翻译",
    languageBody: "为问诊、知情同意、住院、出院指导和随访沟通安排专业医疗翻译。",
    stay: "住宿与日常费用",
    stayBody: "请根据医院位置、行动能力、治疗安排和陪同家属需求选择住宿。",
    planning: "签证与治疗规划",
    planningBody: "签证类别和材料取决于国籍、访问目的和停留时间，出行前请核对最新领事要求。",
    viewHospitals: (city: string) => `查看${city}医院`,
  },
  ru: {
    eyebrow: "Направление для медицинской поездки в Китай",
    intro: (city: string) => `Практическая информация о больницах, транспорте, переводе, проживании и расходах при лечении в городе ${city}.`,
    hospitals: "Больницы и специализированная помощь",
    hospitalsBody: "Сравните больницы по специализации, поддержке иностранных пациентов, расположению и требованиям к медицинским документам.",
    travel: "Аэропорт и городской транспорт",
    travelBody: "Подтвердите больницу и дату приема до покупки билетов. Время трансфера зависит от района и дорожной ситуации.",
    language: "Медицинский перевод",
    languageBody: "Организуйте профессиональный перевод для консультаций, согласия на лечение, госпитализации, выписки и наблюдения.",
    stay: "Проживание и ежедневные расходы",
    stayBody: "Выбирайте жилье с учетом расположения больницы, мобильности пациента, графика лечения и сопровождающих.",
    planning: "Виза и планирование лечения",
    planningBody: "Категория визы и документы зависят от гражданства, цели и срока поездки. Уточните актуальные требования консульства.",
    viewHospitals: (city: string) => `Посмотреть больницы в городе ${city}`,
  },
};

export default function LocationGuide() {
  const { city } = useParams<{ city: string }>();
  const { currentLanguage } = useLanguage();
  const guide = city ? CITY_GUIDES[city] : undefined;
  const copy = COPY[currentLanguage.code as keyof typeof COPY] ?? COPY.en;
  const isEnglish = currentLanguage.code === "en";

  useEffect(() => {
    if (!guide || !city) {
      return;
    }

    setPageSeo({
      title: `${guide.name} Medical Tourism Guide | Medora Health`,
      description: copy.intro(guide.name),
      path: `/locations/china/${city}`,
      robots: isEnglish ? "index,follow" : "noindex,follow",
      includeAlternates: false,
      availableLocales: ["en"],
    });
  }, [city, copy, guide, isEnglish]);

  if (!guide || !city) {
    return <NotFound />;
  }

  const cards = [
    { icon: Building2, title: copy.hospitals, body: copy.hospitalsBody },
    { icon: Plane, title: copy.travel, body: `${copy.travelBody} ${guide.airport}.` },
    { icon: Languages, title: copy.language, body: copy.languageBody },
    { icon: WalletCards, title: copy.stay, body: copy.stayBody },
  ];

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      <main className="pt-[112px] sm:pt-[120px]">
        <section className="bg-gradient-to-br from-teal-50 via-white to-sky-50">
          <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F638E]">{copy.eyebrow}</p>
            <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              China · {guide.province}
            </div>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-[#003B5C] sm:text-5xl">
              {guide.name} Medical Tourism Guide
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{copy.intro(guide.name)}</p>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">{guide.overview}</p>
            <Link
              to={`/hospitals?city=${city}`}
              className="mt-8 inline-flex rounded-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E] px-6 py-3 font-semibold text-white shadow-md"
            >
              {copy.viewHospitals(guide.name)}
            </Link>
          </div>
        </section>

        <section className="container mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-6">
            <h2 className="text-2xl font-bold text-[#003B5C]">{copy.hospitals}</h2>
            <p className="mt-3 leading-7 text-slate-600">{guide.medicalFocus}</p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {cards.map(({ icon: Icon, title, body }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <Icon className="h-6 w-6 text-[#1DA78A]" />
                <h2 className="mt-4 text-xl font-bold text-[#003B5C]">{title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{body}</p>
              </article>
            ))}
          </div>

          <article className="mt-8 rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-[#003B5C]">{copy.planning}</h2>
            <p className="mt-3 leading-7 text-slate-600">{copy.planningBody}</p>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}

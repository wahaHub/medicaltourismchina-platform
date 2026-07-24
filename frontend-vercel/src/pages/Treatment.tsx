import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiService } from "@/services/api";
import type { FeaturedTreatmentCard } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatTreatmentPrice } from "@/utils/pricing";
import { getContentApiLocale } from "@/utils/content-locale";
import ProgressiveImage from "@/components/ProgressiveImage";
import { categories as staticTreatmentCategories } from "@/data/treatments";
import { getCategoryName, treatmentCategories } from "@/data/treatmentCategories";
import { LOW_MEDIA_BASE_URL } from "@/config/media";
import treatmentHeroBackground from "@/img/treatment-hero-bg-generated.jpg";
import { setPageSeo } from "@/utils/seo";
import { getStaticPageMetadata } from "@/seo/static-page";

const BRAND_TEAL = "#1DA78A";
const BRAND_BLUE = "#0F638E";

type DisplayTreatmentCard = FeaturedTreatmentCard & {
  fallbackImageUrl?: string;
  fallbackPrice?: string;
};

type StaticTreatmentTranslation = {
  name: string;
  description: string;
};

const STATIC_TREATMENT_TRANSLATIONS: Record<string, Partial<Record<string, StaticTreatmentTranslation>>> = {
  "proton-carbon-ion-therapy": {
    zh: {
      name: "质子重离子治疗",
      description:
        "先进质子与重离子放疗系统，由资深肿瘤放疗团队提供精准治疗，疗程更短、副作用更少，适用于多种实体瘤。",
    },
  },
  "car-t-cell-therapy": {
    zh: {
      name: "CAR-T细胞治疗",
      description:
        "中国顶尖血液中心与细胞治疗专家团队提供国际领先的CAR-T免疫治疗，为复发或难治性血液肿瘤带来更高缓解率与新的生存希望。",
    },
  },
  "sbrt-stereotactic-body-radiotherapy": {
    zh: {
      name: "SBRT立体定向体部放疗",
      description:
        "国际领先直线加速器与影像引导系统实现高精度、高剂量SBRT，疗程短、创伤小，适用于早期肿瘤和孤立转移灶控制。",
    },
  },
  "immune-cell-cryopreservation": {
    zh: {
      name: "免疫细胞冻存",
      description:
        "国家认证细胞库与前沿低温保存技术，提供安全、标准化的免疫细胞采集与储存，为未来健康管理保留优质细胞资源。",
    },
  },
  "coronary-artery-bypass-grafting": {
    zh: {
      name: "冠状动脉搭桥术（CABG）",
      description:
        "中国顶尖心血管外科团队结合微创搭桥技术，为复杂冠心病提供持久、彻底的血运重建方案。",
    },
  },
  "coronary-intervention-treatment-pci": {
    zh: {
      name: "经皮冠状动脉介入治疗（PCI）",
      description:
        "顶尖心脏介入团队结合国际领先药物支架技术，高效、安全开通狭窄或闭塞血管，帮助降低心肌梗死风险。",
    },
  },
  "spinal-endoscopy-ube-peld": {
    zh: {
      name: "脊柱内镜 / UBE / PELD",
      description:
        "脊柱微创专家团队配合先进内镜系统，提供PELD与UBE超微创解决方案，切口小、恢复快。",
    },
  },
  "total-knee-replacement": {
    zh: {
      name: "全膝关节置换",
      description:
        "关节外科专家与智能导航机器人技术协同，完成精准、快速康复的全膝关节置换，帮助患者重获无痛行走能力。",
    },
  },
  "total-hip-replacement": {
    zh: {
      name: "全髋关节置换",
      description:
        "微创入路、精准假体定位与快速康复管理，帮助恢复髋关节活动能力与生活质量。",
    },
  },
  "esd-emr-mucosal-resection": {
    zh: {
      name: "ESD / EMR黏膜下剥离或切除",
      description:
        "顶尖消化内镜团队使用先进内镜微创技术，对早期胃肠道病变进行一次性精准切除。",
    },
  },
  "poem-surgery": {
    zh: {
      name: "POEM经口内镜下肌切开术",
      description:
        "国际领先POEM技术治疗贲门失弛缓症，体表无切口、恢复快、起效迅速。",
    },
  },
  "hifu-uterine-fibroids-treatment": {
    zh: {
      name: "子宫肌瘤HIFU海扶刀治疗",
      description:
        "中国原创海扶刀聚焦超声治疗，无辐射、无切口、无瘢痕，在治疗肌瘤的同时尽量保留子宫功能。",
    },
  },
  "severe-endometriosis-laparoscopic-endoscopic-excision": {
    zh: {
      name: "重度子宫内膜异位症腹腔镜 / 内镜切除",
      description:
        "妇科内镜专家团队采用超微创手术技术，深入、彻底切除病灶，同时重视生育功能保护。",
    },
  },
  "corneal-transplant": {
    zh: {
      name: "角膜移植",
      description:
        "依托丰富眼库资源与角膜病专家团队，提供国际标准的飞秒激光辅助角膜移植，等待时间更短、精度更高。",
    },
  },
  "cataract-surgery-premium-iol": {
    zh: {
      name: "白内障手术 + 高端人工晶体",
      description:
        "白内障专家结合三焦点或景深延长型高端人工晶体，一站式改善白内障、老花、近视和散光等视觉问题。",
    },
  },
  "deep-brain-stimulation-dbs": {
    zh: {
      name: "脑深部电刺激（DBS）",
      description:
        "功能神经外科团队采用国际领先DBS技术，为帕金森、特发性震颤、肌张力障碍等疾病提供精准、可调、可逆的治疗方案。",
    },
  },
  "deep-brain-stimulation-exploratory-treatment": {
    zh: {
      name: "DBS探索性治疗",
      description:
        "在严格临床研究框架下，探索DBS在难治性抑郁、强迫症等传统治疗效果有限疾病中的潜力。",
    },
  },
  "stem-cell-therapy": {
    zh: {
      name: "干细胞治疗",
      description:
        "依托国家卫健委备案的干细胞临床研究机构，为难治性疾病提供安全、合规、前沿的研究型治疗机会。",
    },
  },
  "hematopoietic-stem-cell-transplantation": {
    zh: {
      name: "造血干细胞移植",
      description:
        "顶尖血液病治疗中心与亚洲大型移植病区集群，为白血病、淋巴瘤等疾病提供国际标准的自体或异基因移植治疗。",
    },
  },
  "comprehensive-cosmetic-surgery": {
    zh: {
      name: "综合美容整形",
      description:
        "整形外科专家结合韩式审美理念，提供安全、精准、自然的综合美容整形方案。",
    },
  },
  "artificial-cochlear-baha-hearing-reconstruction": {
    zh: {
      name: "人工耳蜗 / BAHA听力重建",
      description:
        "听觉医学中心与国际领先植入设备协作，提供精准人工耳蜗和骨传导BAHA方案，帮助恢复听力。",
    },
  },
  "all-on-4-6-dental-implants": {
    zh: {
      name: "半口 / 全口种植牙（All-on-4/6）",
      description:
        "口腔种植专家团队采用All-on-4与All-on-6即刻负重技术，帮助患者术后短时间内恢复咀嚼功能。",
    },
  },
  "deep-health-checkup": {
    zh: {
      name: "综合深度体检",
      description:
        "多学科专家团队与先进影像设备协同，提供住院或日间综合筛查，并形成个性化健康管理建议。",
    },
  },
  "urinary-stone-minimally-invasive-treatment-mini-pcnl-furs": {
    zh: {
      name: "泌尿系结石微创治疗（Mini-PCNL / fURS）",
      description:
        "泌尿外科专家团队采用Mini-PCNL与输尿管软镜等微创技术，处理肾脏及输尿管多部位结石，创伤更小、恢复更快。",
    },
  },
};

function localizeTreatmentCard(treatment: DisplayTreatmentCard, locale: string): DisplayTreatmentCard {
  const localizedTreatment = STATIC_TREATMENT_TRANSLATIONS[treatment.slug]?.[locale];

  if (!localizedTreatment) {
    return treatment;
  }

  return {
    ...treatment,
    name: localizedTreatment.name,
    hero: {
      ...treatment.hero,
      subtitle: localizedTreatment.description,
    },
  };
}

function getStaticFeaturedTreatments(locale: string): DisplayTreatmentCard[] {
  return staticTreatmentCategories.flatMap((category) =>
    category.treatments.map((treatment, index) => {
      const treatmentCard = {
        id: `${category.title}-${treatment.slug}`,
        slug: treatment.slug,
        name: treatment.name,
        treatment_type: "treatment",
        display_order: index,
        hero: {
          subtitle: treatment.description,
        },
        fallbackImageUrl: treatment.image,
        fallbackPrice: treatment.price,
      } as DisplayTreatmentCard;

      return localizeTreatmentCard(treatmentCard, locale);
    }),
  );
}

const TreatmentPage = () => {
  const { currentLanguage, getApiLocale, t } = useLanguage();
  const [featuredTreatments, setFeaturedTreatments] = useState<DisplayTreatmentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const contentApiLocale =
    currentLanguage.code === "ar" ? "en" : getContentApiLocale(getApiLocale());
  const categoryLabel =
    currentLanguage.code === "zh"
      ? "分类"
      : currentLanguage.code === "ar"
        ? "التصنيفات"
        : "Categories";
  const filterLabel =
    currentLanguage.code === "zh"
      ? "按专科筛选"
      : currentLanguage.code === "ar"
        ? "التصفية حسب التخصص"
        : "Filter by specialty";
  const allCategoriesLabel =
    currentLanguage.code === "zh"
      ? "全部项目"
      : currentLanguage.code === "ar"
        ? "جميع العلاجات"
        : "All treatments";

  useEffect(() => {
    const metadata = getStaticPageMetadata("treatment", currentLanguage.code);
    setPageSeo({
      title: metadata.locale.title,
      description: metadata.locale.description,
      path: metadata.path,
      robots: metadata.indexable ? "index,follow" : "noindex,follow",
      includeAlternates: metadata.indexable,
      availableLocales: metadata.indexableLocales,
    });
  }, [currentLanguage.code]);

  const formatPrice = (treatment: DisplayTreatmentCard) => {
    return formatTreatmentPrice(treatment, getApiLocale()) || treatment.fallbackPrice;
  };

  const formatTreatmentCount = (count: number) => {
    if (currentLanguage.code === "zh") {
      return `${count} 项治疗`;
    }
    if (currentLanguage.code === "ar") {
      return `${count} علاج`;
    }

    return `${count} ${count === 1 ? "treatment" : "treatments"}`;
  };

  const TreatmentCard = ({ treatment }: { treatment: DisplayTreatmentCard }) => {
    const price = formatPrice(treatment);

    return (
      <Link
        to={`/featured-treatments/${treatment.slug}`}
        className="group block h-full overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(15,99,142,0.09)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_26px_55px_rgba(15,99,142,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1DA78A]/40 focus-visible:ring-offset-2"
      >
        <article className="flex h-full flex-col">
          <div className="relative h-52 overflow-hidden bg-slate-100 sm:h-60">
            <ProgressiveImage
              baseUrl={`${LOW_MEDIA_BASE_URL}/treatment/${treatment.slug}`}
              alt={treatment.name}
              resolutionLevels={["x1", "x2"]}
              fallbackUrl={treatment.fallbackImageUrl}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#062A33]/45 via-transparent to-transparent" />
            {price && (
              <div className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-[#0F638E] shadow-lg">
                {price}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <h3 className="text-lg font-bold leading-snug text-[#0A4A5C] transition-colors group-hover:text-[#1DA78A] sm:text-xl">
              {treatment.name}
            </h3>
            {treatment.hero?.subtitle && (
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                {treatment.hero.subtitle}
              </p>
            )}
            <div className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-[#0F638E]">
              <span>{t("homepage.whyMedora.featuredServices.learnMore")}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </article>
      </Link>
    );
  };

  useEffect(() => {
    const loadFeaturedTreatments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getFeaturedTreatments({
          locale: contentApiLocale,
          limit: 50,
        });
        setFeaturedTreatments(response.data.map((treatment) => localizeTreatmentCard(treatment, contentApiLocale)));
      } catch (err) {
        setFeaturedTreatments(getStaticFeaturedTreatments(contentApiLocale));
        setError(null);
        console.error("Error loading featured treatments:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedTreatments();
  }, [currentLanguage, contentApiLocale, t]);

  const treatmentsByCategory = useMemo(() => {
    return treatmentCategories
      .map((category) => ({
        ...category,
        treatments: featuredTreatments.filter((treatment) => category.slugs.includes(treatment.slug)),
      }))
      .filter((category) => category.treatments.length > 0);
  }, [featuredTreatments]);

  const visibleTreatmentsByCategory = useMemo(() => {
    if (selectedCategoryId === "all") {
      return treatmentsByCategory;
    }

    return treatmentsByCategory.filter((category) => category.id === selectedCategoryId);
  }, [selectedCategoryId, treatmentsByCategory]);

  const visibleTreatmentCount = useMemo(
    () => visibleTreatmentsByCategory.reduce((count, category) => count + category.treatments.length, 0),
    [visibleTreatmentsByCategory],
  );

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <section className="relative mt-[112px] overflow-hidden sm:mt-[120px]">
        <div className="absolute inset-0 bg-slate-100">
          <img
            src={treatmentHeroBackground}
            alt={t("treatment.pageTitle")}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-white/65" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/82 to-white/10" />
        </div>
        <div className="container relative z-10 mx-auto flex min-h-[420px] max-w-7xl items-center px-4 py-12 sm:min-h-[480px] sm:px-6 lg:px-8">
          <div className="w-full">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold leading-tight text-[#0A4A5C] sm:text-4xl lg:text-5xl">
                {t("treatment.pageTitle")}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#0A4A5C]/80 sm:text-base">
                {t("treatment.pageSubtitle")}
              </p>
            </div>
            {treatmentsByCategory.length > 0 && (
              <div className="mt-7 w-full rounded-2xl border border-white/70 bg-white/90 p-3 shadow-[0_18px_45px_rgba(15,99,142,0.10)] backdrop-blur">
                <div className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.16em] text-[#0F638E]">
                  {filterLabel}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId("all")}
                    aria-pressed={selectedCategoryId === "all"}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selectedCategoryId === "all"
                        ? "bg-gradient-to-r from-[#1DA78A] to-[#0F638E] text-white shadow-md"
                        : "border border-[#1DA78A]/20 bg-white text-[#0A4A5C] hover:border-[#1DA78A]/45 hover:text-[#0F638E]"
                    }`}
                  >
                    {allCategoriesLabel}
                  </button>
                  {treatmentsByCategory.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(category.id)}
                      aria-pressed={selectedCategoryId === category.id}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        selectedCategoryId === category.id
                          ? "bg-gradient-to-r from-[#1DA78A] to-[#0F638E] text-white shadow-md"
                          : "border border-[#1DA78A]/20 bg-white text-[#0A4A5C] hover:border-[#1DA78A]/45 hover:text-[#0F638E]"
                      }`}
                    >
                      {getCategoryName(category.id, contentApiLocale)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-8 sm:py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
            <div className="rounded-2xl bg-[#F5F7F6] p-5 sm:p-6">
              <p className="text-sm font-semibold leading-6 text-[#0F638E] sm:text-base">
                {t("treatment.educationalNotice")}
              </p>
            </div>
            <div className="grid grid-cols-2 overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(15,99,142,0.09)]">
              <div className="border-r border-slate-100 p-5 text-center">
                <div className="text-3xl font-bold" style={{ color: BRAND_TEAL }}>
                  {loading || error ? "-" : visibleTreatmentCount}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("nav.treatment")}
                </div>
              </div>
              <div className="p-5 text-center">
                <div className="text-3xl font-bold" style={{ color: BRAND_BLUE }}>
                  {loading || error ? "-" : visibleTreatmentsByCategory.length}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {categoryLabel}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-16 sm:pb-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="pt-2">
              <Skeleton className="mb-8 h-10 w-72 rounded-xl" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {[...Array(6)].map((_, index) => (
                  <Skeleton key={index} className="h-[410px] rounded-2xl" />
                ))}
              </div>
            </div>
          ) : error ? (
            <Alert className="mx-auto mt-4 max-w-2xl border-[#1DA78A]/20 bg-[#F5F7F6] text-[#0A4A5C]">
              <AlertTriangle className="h-4 w-4 text-[#0F638E]" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : visibleTreatmentsByCategory.length > 0 ? (
            visibleTreatmentsByCategory.map((category, index) => (
              <section key={category.id} className={index > 0 ? "mt-16" : "mt-6"}>
                <div className="mb-7 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="mb-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E]" />
                    <h2 className="text-2xl font-bold leading-tight text-[#0A4A5C] sm:text-3xl">
                      {getCategoryName(category.id, contentApiLocale)}
                    </h2>
                  </div>
                  <div className="text-sm font-semibold text-slate-500">
                    {formatTreatmentCount(category.treatments.length)}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  {category.treatments.map((treatment) => (
                    <TreatmentCard key={treatment.id} treatment={treatment} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-2xl bg-[#F5F7F6] py-16 text-center">
              <p className="text-lg text-slate-500">{t("treatment.noTreatments")}</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TreatmentPage;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LOW_MEDIA_BASE_URL } from "@/config/media";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Clock3, Languages, ShieldCheck, Stethoscope, UserRoundCheck } from "lucide-react";
import consultationDoctorImage from "@/img/online-consultation-doctor.webp";
import expertChenImage from "@/img/telemedicine-expert-chen.webp";
import expertLiImage from "@/img/telemedicine-expert-li.webp";
import expertZhangImage from "@/img/telemedicine-expert-zhang.webp";
import planMultidisciplinaryImage from "@/img/telemedicine-plan-multidisciplinary.webp";
import planVideoConsultationImage from "@/img/telemedicine-plan-video-consultation.webp";
import planWrittenReviewImage from "@/img/telemedicine-plan-written-review.webp";
import processCaseSummaryImage from "@/img/telemedicine-process-case-summary.webp";
import processChinaAccessImage from "@/img/telemedicine-process-china-access.webp";
import processConsultationImage from "@/img/telemedicine-process-consultation.webp";
import processSecondOpinionImage from "@/img/telemedicine-process-second-opinion.webp";
import processUploadRecordsImage from "@/img/telemedicine-process-upload-records.webp";
import { setPageSeo } from "@/utils/seo";
import { getStaticPageMetadata } from "@/seo/static-page";

const CTA_HREF = "/medical-case-intake";

type Locale = "en" | "zh" | "es" | "fr" | "de" | "ru";
type TextPair = [string, string];

type Plan = {
  variant: "report" | "video" | "tumor";
  badge: string;
  title: string;
  priceUsd: number;
  chips: string[];
  cta: string;
  detailsCta: string;
  modal: {
    title: string;
    body: string;
    bestForLabel: string;
    bestFor: string;
    receiveLabel: string;
    receive: string[];
    processLabel: string;
    process: string[];
    turnaroundLabel: string;
    turnaround: string;
    cta: string;
    imageAlt: string;
  };
};

type ExpertCard = {
  name: string;
  title: string;
  specialty: string;
  hospital: string;
  credentials: string[];
  tags: string[];
  bio: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
};

type PriceDisplay = {
  locale: string;
  currency: string;
  rateFromUsd: number;
  roundTo: number;
  prefix: string;
  suffix?: string;
};

const PRICE_DISPLAYS: Record<Locale, PriceDisplay> = {
  en: { locale: "en-US", currency: "USD", rateFromUsd: 1, roundTo: 1, prefix: "From " },
  zh: { locale: "zh-CN", currency: "CNY", rateFromUsd: 7.1, roundTo: 10, prefix: "约 ", suffix: " 起" },
  es: { locale: "es-ES", currency: "EUR", rateFromUsd: 0.92, roundTo: 1, prefix: "Desde " },
  fr: { locale: "fr-FR", currency: "EUR", rateFromUsd: 0.92, roundTo: 1, prefix: "À partir de " },
  de: { locale: "de-DE", currency: "EUR", rateFromUsd: 0.92, roundTo: 1, prefix: "Ab " },
  ru: { locale: "ru-RU", currency: "RUB", rateFromUsd: 90, roundTo: 100, prefix: "От " },
};

type ModalVisualVariant = Plan["variant"];

const PLAN_IMAGES: Record<ModalVisualVariant, string> = {
  report: planVideoConsultationImage,
  video: planMultidisciplinaryImage,
  tumor: planWrittenReviewImage,
};

const PROCESS_IMAGES = [
  processUploadRecordsImage,
  processCaseSummaryImage,
  processConsultationImage,
  processSecondOpinionImage,
  processChinaAccessImage,
];

const TELEMEDICINE_EXPERT_IMAGE_BASE = `${LOW_MEDIA_BASE_URL}/telemedicine/experts`;
const EXPERT_IMAGE_CATEGORIES = [
  "oncology",
  "cardiology",
  "neurology",
  "orthopedics",
  "reproductive",
  "aesthetic-surgery",
  "stem-cell-therapy",
  "dentistry",
  "pediatrics",
  "urology",
  "endocrinology",
  "ophthalmology",
] as const;

type ExpertImageCategory = (typeof EXPERT_IMAGE_CATEGORIES)[number];

const EXPERT_IMAGES: Record<string, string> = {
  zhang: expertZhangImage,
  li: expertLiImage,
  chen: expertChenImage,
  ...Object.fromEntries(
    EXPERT_IMAGE_CATEGORIES.flatMap((category) =>
      Array.from({ length: 5 }, (_, index) => {
        const imageNumber = index + 1;
        return [`${category}-${imageNumber}`, `${TELEMEDICINE_EXPERT_IMAGE_BASE}/${category}-${imageNumber}.webp`];
      }),
    ),
  ),
};

type PageCopy = {
  metaTitle: string;
  hero: {
    label: string;
    title: string;
    subtitle: string;
    support: string;
    primaryCta: string;
    imageAlt: string;
  };
  trust: TextPair[];
  expertShowcase: {
    label: string;
    title: string;
    body: string;
    tabs: string[];
    moreTabs: string[];
    moreLabel: string;
    collapseLabel: string;
    expertCta: string;
    matchPrompt: string;
    matchCta: string;
    customTitle: string;
    customBody: string;
    customCta: string;
    featuredLabel: string;
    experts: ExpertCard[];
  };
  review: {
    label: string;
    title: string;
    body: string;
    plans: Plan[];
  };
  comparison: {
    label: string;
    title: string;
    cta: string;
    headers: string[];
    rows: string[][];
    a11yDescription: string;
  };
  process: {
    label: string;
    title: string;
    stepLabel: string;
    steps: TextPair[];
  };
  specialists: {
    label: string;
    title: string;
    body: string;
    items: TextPair[];
  };
  notice: {
    label: string;
    title: string;
    body: string;
    items: TextPair[];
  };
  faq: {
    label: string;
    title: string;
    items: TextPair[];
  };
  finalCta: {
    label: string;
    title: string;
    body: string;
    cta: string;
    note: string;
  };
};

const TELEMEDICINE_COPY: Record<Locale, PageCopy> = {
  en: {
    metaTitle: "Online Consultation with Top Chinese Specialists | Medora Health",
    hero: {
      label: "Online Consultation with Top Chinese Specialists",
      title: "Not sure about your diagnosis or treatment plan?",
      subtitle: "Get a written review, video consultation, or multidisciplinary second opinion from top Chinese specialists.",
      support: "Upload your medical records and receive expert guidance before making your next medical decision.",
      primaryCta: "Book Online Consultation",
      imageAlt: "Chinese specialist reviewing medical records for an online second opinion",
    },
    trust: [
      ["Top Chinese Doctors", "Specialists are matched based on your condition."],
      ["Medical Records First", "Reports, scans, pathology, labs, and history come first."],
      ["Multilingual Coordination", "We organize, translate, and summarize your case."],
      ["Travel Optional", "Start online. Travel only if it fits your case."],
    ],
    expertShowcase: {
      label: "Specialist matching",
      title: "Selected top Chinese specialists",
      body: "Medora matches your case with top Chinese specialists who can support written review, video consultation, and treatment direction discussion.",
      tabs: ["Oncology", "Cardiology", "Neurology", "Orthopedics", "Reproductive medicine"],
      moreTabs: ["Aesthetic surgery", "Stem cell therapy", "Dentistry", "Pediatrics", "Urology", "Endocrinology", "Ophthalmology"],
      moreLabel: "More",
      collapseLabel: "Show less",
      expertCta: "View specialist",
      matchPrompt: "Tell us about your condition and we will suggest a more suitable specialist match.",
      matchCta: "Get specialist matching advice",
      customTitle: "Need a different specialist?",
      customBody: "Tell us your diagnosis, records, preferred specialty, and consultation goal. Medora will suggest a more suitable doctor or specialist team.",
      customCta: "Tell us what you need",
      featuredLabel: "Featured match",
      experts: [
        {
          name: "Prof. Zhang Ming",
          title: "Senior Consultant",
          specialty: "Medical Oncology",
          hospital: "Shanghai tertiary hospital network",
          credentials: ["23+ years clinical experience", "Complex cancer case review", "Tertiary hospital specialist"],
          tags: ["Written review", "Video consult", "English support"],
          bio: "Focused on lung, gastrointestinal, and difficult cancer case review with practical treatment pathway discussion.",
          image: "zhang",
          imageAlt: "Senior Chinese oncology specialist in a white coat reviewing records",
        },
        {
          name: "Dr. Li Guohua",
          title: "Chief Physician",
          specialty: "Cardiology",
          hospital: "Beijing specialist center",
          credentials: ["35+ years clinical experience", "Nationally recognized specialist", "Tertiary hospital specialist"],
          tags: ["Written review", "Video consult", "English support"],
          bio: "Experienced in coronary disease, heart failure, and complex cardiovascular diagnosis and long-term management planning.",
          image: "li",
          imageAlt: "Senior Chinese cardiology physician in a modern consultation setting",
          featured: true,
        },
        {
          name: "Prof. Chen Yaqin",
          title: "Senior Consultant",
          specialty: "Neurosurgery",
          hospital: "Chengdu academic hospital network",
          credentials: ["28+ years clinical experience", "Complex surgery review", "Tertiary hospital specialist"],
          tags: ["Written review", "Video consult", "English support"],
          bio: "Supports second-opinion review for brain tumors, spinal conditions, and functional neurosurgery decisions.",
          image: "chen",
          imageAlt: "Chinese neurosurgery specialist portrait in a hospital office",
        },
      ],
    },
    review: {
      label: "Review options",
      title: "Choose your second opinion option",
      body: "Start remotely with a written review, video consultation, or multidisciplinary case review before making your next medical decision.",
      plans: [
        {
          variant: "report",
          badge: "Essential",
          title: "Written Review",
          priceUsd: 199,
          chips: ["Written Report", "Record Review", "48-72 Hours"],
          cta: "Book",
          detailsCta: "View Details",
          modal: {
            title: "Specialist Written Review",
            body: "A selected specialist reviews your medical records and provides a written second opinion to help you better understand your diagnosis, treatment plan, and next steps.",
            bestForLabel: "Best for",
            bestFor: "Patients who already have medical reports and want another expert view before making a treatment decision.",
            receiveLabel: "What you receive",
            receive: [
              "Diagnosis and case summary",
              "Key findings from your records",
              "Specialist observations",
              "Treatment considerations",
              "Suggested questions for your local doctor",
              "Recommended next steps",
              "China treatment possibility note, if relevant",
            ],
            processLabel: "Typical process",
            process: [
              "Upload your medical records",
              "Medora organizes your case summary",
              "A specialist reviews your case",
              "You receive a written second opinion report",
            ],
            turnaroundLabel: "Turnaround",
            turnaround: "Usually 48-72 hours after complete records are received.",
            cta: "Start Written Review",
            imageAlt: "Senior Chinese specialist reviewing English medical records, imaging, pathology reports, and a written report mockup",
          },
        },
        {
          variant: "video",
          badge: "Most Popular",
          title: "Video Consultation",
          priceUsd: 399,
          chips: ["Video Call", "Written Summary", "Doctor Q&A"],
          cta: "Book",
          detailsCta: "View Details",
          modal: {
            title: "Video Consultation + Written Summary",
            body: "Speak with a selected specialist by video, supported by Medora's medical coordinator, and receive a written summary after the consultation.",
            bestForLabel: "Best for",
            bestFor: "Patients who want to ask questions directly, clarify treatment options, and better understand what their medical records mean.",
            receiveLabel: "What you receive",
            receive: [
              "Medical record review before the call",
              "20-30 minute video consultation",
              "Key questions prepared in advance",
              "Doctor's main comments",
              "Written consultation summary",
              "Follow-up questions and next steps",
              "Optional China treatment discussion",
            ],
            processLabel: "Typical process",
            process: [
              "Upload your records",
              "Medora prepares your case summary",
              "Your consultation is scheduled",
              "You speak with the specialist by video",
              "You receive a written follow-up summary",
            ],
            turnaroundLabel: "Turnaround",
            turnaround: "Usually scheduled within 3-5 business days after complete records are received.",
            cta: "Book Video Consultation",
            imageAlt: "International patient speaking with a Chinese doctor by video while a medical coordinator records key notes",
          },
        },
        {
          variant: "tumor",
          badge: "Advanced Review",
          title: "Multidisciplinary Review",
          priceUsd: 1299,
          chips: ["Multiple Specialists", "Complex Cases", "Advanced Summary"],
          cta: "Request",
          detailsCta: "View Details",
          modal: {
            title: "Multidisciplinary Case Review",
            body: "For complex medical cases, Medora coordinates a deeper review involving multiple specialists when appropriate.",
            bestForLabel: "Best for",
            bestFor: "Patients facing complex cancer care, major surgery, neurological conditions, cardiac decisions, or conflicting treatment recommendations.",
            receiveLabel: "What you receive",
            receive: [
              "Comprehensive case intake",
              "Medical record, imaging, and pathology review",
              "Multispecialty case discussion",
              "Advanced written second opinion summary",
              "Treatment pathway considerations",
              "Surgery / medication / interventional treatment considerations",
              "Questions to discuss with your local doctor",
              "China hospital access recommendation, if suitable",
            ],
            processLabel: "Typical process",
            process: [
              "Submit complete medical records",
              "Medora prepares a structured case file",
              "Relevant specialists review your case",
              "A multidisciplinary summary is prepared",
              "Medora discusses possible next steps with you",
            ],
            turnaroundLabel: "Turnaround",
            turnaround: "Usually 5-7 business days after complete records are received.",
            cta: "Request Advanced Review",
            imageAlt: "Chinese hospital multidisciplinary specialist meeting reviewing CT, MRI, pathology, and treatment pathways",
          },
        },
      ],
    },
    comparison: {
      label: "Side by side",
      title: "Compare review options",
      cta: "Compare review options",
      headers: ["Feature", "Written Review", "Video Consultation", "Multidisciplinary Review"],
      a11yDescription: "Side-by-side table comparing the available online consultation review options.",
      rows: [
        ["Medical record intake", "Yes", "Yes", "Yes"],
        ["Case summary preparation", "Yes", "Yes", "Yes"],
        ["Specialist written opinion", "Yes", "Yes", "Yes"],
        ["Video discussion", "No", "Yes", "Optional / Included by package"],
        ["Medical coordinator support", "Yes", "Yes", "Yes"],
        ["Cancer-focused review", "Limited", "Available", "Comprehensive"],
        ["Multiple specialists", "No", "Sometimes", "Yes"],
        ["Treatment pathway discussion", "Basic", "Detailed", "Advanced"],
        ["China hospital matching", "Optional", "Optional", "Included if suitable"],
        ["Best for", "General second opinion", "Patients with questions", "Complex cases"],
        ["Typical delivery", "48-72 hours", "3-5 business days", "5-7 business days"],
      ],
    },
    process: {
      label: "Process",
      title: "How the second opinion process works",
      stepLabel: "Step",
      steps: [
        ["Submit Your Medical Records", "Upload diagnosis reports, imaging, pathology, lab results, treatment plans, and medication history."],
        ["Case Intake & Medical Summary", "Medora's team organizes your documents, translates key information if needed, and prepares a structured case summary."],
        ["Specialist Review or Consultation", "Your case is reviewed by a specialist, discussed in a video consultation, or evaluated by a multidisciplinary oncology team."],
        ["Receive Your Second Opinion", "You receive a written summary with key observations, treatment considerations, and suggested next steps."],
        ["Explore China Treatment Access, If Suitable", "If your case may benefit from treatment in China, Medora can help with hospital matching, cost estimates, appointments, and travel support."],
      ],
    },
    specialists: {
      label: "Specialist network",
      title: "Reviewed by selected Chinese specialists",
      body: "Medora coordinates specialist reviews based on your condition, medical records, and selected review option.",
      items: [
        ["Oncology", "Cancer diagnosis, treatment sequencing, chemotherapy, immunotherapy, targeted therapy, surgery considerations."],
        ["Surgery", "Major surgery decisions, second opinion before procedure, risk and recovery considerations."],
        ["Orthopedics", "Joint, spine, trauma, sports injury, and rehabilitation-related review."],
        ["Cardiology", "Heart disease, interventional options, surgery considerations, and long-term management discussion."],
        ["Neurology / Neurosurgery", "Brain, spine, nerve-related conditions, and complex treatment decisions."],
        ["Medical Aesthetics / Reconstructive Surgery", "Procedure planning, suitability review, surgical expectation discussion."],
      ],
    },
    notice: {
      label: "Medical notice",
      title: "Important medical notice",
      body: "Medora's second opinion service is based on the medical records you provide. It is not emergency care and does not replace your local physician. Any treatment decision should be made together with your licensed healthcare provider.",
      items: [
        ["Not Emergency Care", "For urgent symptoms or emergencies, contact local emergency services immediately."],
        ["Records-Based Review", "The review depends on the quality and completeness of the medical records provided."],
        ["Discuss With Your Local Doctor", "Use the second opinion as an additional perspective for discussion with your treating physician."],
      ],
    },
    faq: {
      label: "FAQ",
      title: "Common questions",
      items: [
        ["Is this an online diagnosis?", "No. This service is a medical record review and second opinion based on the information you provide. It helps you better understand options and discuss them with your local physician."],
        ["Which option should I choose?", "Choose Written Review for a written opinion, Video Consultation to speak with a specialist, or Multidisciplinary Review for complex cases."],
        ["Can I start with a written review and upgrade later?", "Yes. Many patients start with a written review and request video consultation or additional specialist review afterward."],
        ["What records do I need?", "Useful records include diagnosis reports, imaging results, pathology reports, lab tests, discharge summaries, treatment history, medication list, and current treatment plan."],
        ["How long does it take?", "Written reviews are typically delivered within 48-72 hours after complete records are received. Video consultations usually schedule within 3-5 business days. Oncology reviews typically take 5-7 business days."],
        ["Do I have to travel to China?", "No. The second opinion is remote. If your case is suitable and you are interested, Medora can help you explore treatment options in China."],
      ],
    },
    finalCta: {
      label: "Start remotely",
      title: "Get another expert view before your next medical decision",
      body: "Choose a written review, video consultation, or multidisciplinary case review from selected Chinese specialists.",
      cta: "Book Online Consultation",
      note: "Start remotely. No obligation to travel.",
    },
  },
  zh: {
    metaTitle: "中国顶级专家的在线诊疗 | Medora Health",
    hero: {
      label: "中国顶级专家的在线诊疗",
      title: "不确定您的诊断或治疗方案？",
      subtitle: "获得中国顶尖专科医生的书面审阅、视频问诊或多学科第二诊疗意见。",
      support: "上传病历资料，在做出下一步医疗决定前获得专业参考。",
      primaryCta: "预约在线问诊",
      imageAlt: "中国专科医生审阅线上第二诊疗意见病历资料",
    },
    trust: [
      ["中国顶尖医生", "根据您的病情匹配合适专科医生。"],
      ["病历优先", "报告、影像、病理、化验和病史先行。"],
      ["英文协调", "我们整理、翻译并总结您的病例。"],
      ["旅行可选", "先线上开始；适合时再考虑来华治疗。"],
    ],
    expertShowcase: {
      label: "专家匹配",
      title: "精选中国顶级专家",
      body: "Medora 会根据您的病情，为您匹配可提供书面审阅、视频问诊与治疗方向建议的中国资深专科医生。",
      tabs: ["肿瘤", "心血管", "神经科", "骨科", "辅助生殖"],
      moreTabs: ["整容", "干细胞", "牙科", "儿科", "泌尿科", "内分泌", "眼科"],
      moreLabel: "更多",
      collapseLabel: "收起",
      expertCta: "查看专家",
      matchPrompt: "告诉我们您的病情，我们为您匹配更合适的专家。",
      matchCta: "获取医生匹配建议",
      customTitle: "想找其他类型的医生？",
      customBody: "告诉我们您的诊断、病历资料、希望咨询的方向和目标，我们为您匹配更合适的医生或专家团队。",
      customCta: "告诉我们您需要什么医生",
      featuredLabel: "重点匹配",
      experts: [
        {
          name: "张明教授",
          title: "主任医师",
          specialty: "肿瘤内科",
          hospital: "上海三甲医院专家网络",
          credentials: ["23+ 年临床经验", "擅长复杂肿瘤病例", "三甲医院专家"],
          tags: ["书面审阅", "视频问诊", "英文支持"],
          bio: "擅长肺癌、胃肠道肿瘤及疑难肿瘤的综合诊治与个体化方案讨论。",
          image: "zhang",
          imageAlt: "中国资深肿瘤专家身穿白大褂审阅病历",
        },
        {
          name: "李国华主任医师",
          title: "主任医师",
          specialty: "心血管内科",
          hospital: "北京专科中心",
          credentials: ["35+ 年临床经验", "国内知名专家", "三甲医院专家"],
          tags: ["书面审阅", "视频问诊", "英文支持"],
          bio: "擅长冠心病、心力衰竭及复杂心血管疾病的诊断与长期管理。",
          image: "li",
          imageAlt: "中国资深心血管医生在现代诊室中进行问诊",
          featured: true,
        },
        {
          name: "陈雅琴教授",
          title: "主任医师",
          specialty: "神经外科",
          hospital: "成都高校附属医院专家网络",
          credentials: ["28+ 年临床经验", "擅长复杂手术", "三甲医院专家"],
          tags: ["书面审阅", "视频问诊", "英文支持"],
          bio: "支持脑肿瘤、脊柱疾病及功能神经外科相关重大治疗决策的第二意见评估。",
          image: "chen",
          imageAlt: "中国神经外科专家在医院办公室中的专家肖像",
        },
      ],
    },
    review: {
      label: "服务方案",
      title: "选择您的第二诊疗意见方案",
      body: "在做出下一步医疗决定前，先通过书面审阅、视频问诊或多学科病例评估远程开始。",
      plans: [
        {
          variant: "report",
          badge: "Essential",
          title: "书面审阅",
          priceUsd: 199,
          chips: ["书面报告", "病历审阅", "48-72 小时"],
          cta: "预约",
          detailsCta: "查看详情",
          modal: {
            title: "专科书面审阅",
            body: "由匹配的专科医生审阅您的病历，并提供书面第二诊疗意见，帮助您更好理解诊断、治疗方案和下一步选择。",
            bestForLabel: "适合",
            bestFor: "已经有医学报告，并希望在做治疗决定前获得另一个专家视角的患者。",
            receiveLabel: "您将收到",
            receive: ["诊断与病例摘要", "病历关键发现", "专科医生观察", "治疗考虑方向", "建议询问本地医生的问题", "建议下一步", "适合时的中国治疗可能性备注"],
            processLabel: "常规流程",
            process: ["上传病历资料", "Medora 整理病例摘要", "专科医生审阅您的病例", "您收到书面第二诊疗意见报告"],
            turnaroundLabel: "交付时间",
            turnaround: "完整病历收到后通常 48-72 小时。",
            cta: "开始书面审阅",
            imageAlt: "资深中国专科医生审阅英文病历、影像、病理报告和书面报告样张",
          },
        },
        {
          variant: "video",
          badge: "最受欢迎",
          title: "视频问诊",
          priceUsd: 399,
          chips: ["视频沟通", "书面总结", "医生答疑"],
          cta: "预约",
          detailsCta: "查看详情",
          modal: {
            title: "视频问诊 + 书面总结",
            body: "在 Medora 医疗协调员支持下，与匹配的专科医生视频沟通，并在问诊后收到书面总结。",
            bestForLabel: "适合",
            bestFor: "希望直接提问、澄清治疗选择，并更好理解病历含义的患者。",
            receiveLabel: "您将收到",
            receive: ["问诊前病历审阅", "20-30 分钟视频问诊", "提前准备关键问题", "医生主要意见", "书面问诊总结", "后续问题与建议下一步", "可选中国治疗讨论"],
            processLabel: "常规流程",
            process: ["上传病历资料", "Medora 准备病例摘要", "安排视频问诊时间", "您与专科医生视频沟通", "您收到会后书面总结"],
            turnaroundLabel: "安排时间",
            turnaround: "完整病历收到后通常 3-5 个工作日安排。",
            cta: "预约视频问诊",
            imageAlt: "国际患者在家中与中国医生视频沟通，医疗协调员记录重点",
          },
        },
        {
          variant: "tumor",
          badge: "Advanced Review",
          title: "多学科病例评估",
          priceUsd: 1299,
          chips: ["多位专家", "复杂病例", "高级总结"],
          cta: "申请",
          detailsCta: "查看详情",
          modal: {
            title: "多学科病例评估",
            body: "针对复杂医疗病例，Medora 可在适合时协调多位相关专科医生进行更深入的病例评估。",
            bestForLabel: "适合",
            bestFor: "面临复杂肿瘤治疗、重大手术、神经系统疾病、心脏治疗决策或治疗建议冲突的患者。",
            receiveLabel: "您将收到",
            receive: ["完整病例接收", "病历、影像和病理审阅", "多专科病例讨论", "高级书面第二诊疗意见总结", "治疗路径考虑", "手术 / 药物 / 介入治疗考虑", "建议与本地医生讨论的问题", "适合时的中国医院通道建议"],
            processLabel: "常规流程",
            process: ["提交完整病历资料", "Medora 准备结构化病例文件", "相关专科医生审阅病例", "形成多学科总结", "Medora 与您讨论可能的下一步"],
            turnaroundLabel: "交付时间",
            turnaround: "完整病历收到后通常 5-7 个工作日。",
            cta: "申请高级评估",
            imageAlt: "现代中国医院会议室内多位专家围绕复杂病例讨论 CT MRI 病理图和治疗路径",
          },
        },
      ],
    },
    comparison: {
      label: "方案对比",
      title: "比较第二诊疗意见方案",
      cta: "比较服务方案",
      headers: ["项目", "书面审阅", "视频问诊", "多学科评估"],
      a11yDescription: "用于比较在线第二诊疗意见方案的表格。",
      rows: [
        ["病历接收", "是", "是", "是"],
        ["病例摘要准备", "是", "是", "是"],
        ["专科书面意见", "是", "是", "是"],
        ["视频沟通", "否", "是", "视方案可选 / 包含"],
        ["医疗协调员支持", "是", "是", "是"],
        ["肿瘤聚焦评估", "有限", "可安排", "全面"],
        ["多位专家", "否", "有时", "是"],
        ["治疗路径讨论", "基础", "详细", "高级"],
        ["中国医院匹配", "可选", "可选", "适合时包含"],
        ["最适合", "一般第二意见", "有问题想沟通的患者", "复杂病例"],
        ["常规交付", "48-72 小时", "3-5 个工作日", "5-7 个工作日"],
      ],
    },
    process: {
      label: "流程",
      title: "第二诊疗意见如何进行",
      stepLabel: "步骤",
      steps: [
        ["提交病历资料", "上传诊断报告、影像、病理、化验、治疗方案和用药史。"],
        ["病例接收与医学摘要", "Medora 团队整理文件，必要时翻译关键信息，并准备结构化病例摘要。"],
        ["专科审阅或问诊", "根据所选方案，您的病例将由专科医生审阅、视频沟通或肿瘤多学科团队评估。"],
        ["收到第二诊疗意见", "您会收到包含重点观察、治疗考虑和建议下一步的书面总结。"],
        ["适合时探索中国治疗通道", "如果您的病例可能适合在中国治疗，Medora 可协助医院匹配、费用预估、预约和旅行支持。"],
      ],
    },
    specialists: {
      label: "专科网络",
      title: "由匹配的中国专科医生审阅",
      body: "Medora 根据您的病情、病历资料和所选服务方案协调专科审阅。",
      items: [
        ["肿瘤科", "癌症诊断、治疗顺序、化疗、免疫治疗、靶向治疗和手术考虑。"],
        ["外科", "重大手术决策、术前第二意见、风险与恢复考虑。"],
        ["骨科", "关节、脊柱、创伤、运动损伤和康复相关审阅。"],
        ["心脏科", "心脏病、介入选择、手术考虑和长期管理讨论。"],
        ["神经内科 / 神经外科", "脑、脊柱、神经相关疾病和复杂治疗决策。"],
        ["医学美容 / 修复外科", "手术规划、适应性审阅和预期讨论。"],
      ],
    },
    notice: {
      label: "医疗提示",
      title: "重要医疗声明",
      body: "Medora 的第二诊疗意见基于您提供的病历资料。它不是急诊服务，也不能替代您当地医生。任何治疗决定都应与您的持牌医疗服务提供者共同做出。",
      items: [
        ["非急诊服务", "如有紧急症状，请立即联系当地急救服务。"],
        ["基于病历审阅", "审阅质量取决于所提供病历的完整性和质量。"],
        ["与本地医生讨论", "将第二意见作为与主治医生讨论的补充视角。"],
      ],
    },
    faq: {
      label: "FAQ",
      title: "常见问题",
      items: [
        ["这是线上诊断吗？", "不是。这是基于您提供资料的病历审阅和第二诊疗意见，帮助您理解选项并与本地医生讨论。"],
        ["我应该选择哪个方案？", "需要书面意见可选书面审阅；希望和医生沟通可选视频问诊；复杂病例可选多学科评估。"],
        ["可以先做书面审阅再升级吗？", "可以。很多患者先从书面审阅开始，再根据需要申请视频问诊或更多专科审阅。"],
        ["需要哪些病历？", "包括诊断报告、影像、病理、化验、出院小结、治疗史、用药清单和当前治疗方案。"],
        ["需要多久？", "书面审阅通常在完整病历后 48-72 小时；视频问诊通常 3-5 个工作日安排；肿瘤评估通常 5-7 个工作日。"],
        ["必须来中国吗？", "不需要。第二诊疗意见是远程服务。如果病例适合且您感兴趣，Medora 可帮助探索中国治疗。"],
      ],
    },
    finalCta: {
      label: "远程开始",
      title: "在下一次医疗决定前，获得另一个专家视角",
      body: "选择书面审阅、视频问诊或多学科病例评估。",
      cta: "预约在线问诊",
      note: "远程开始。无需承诺来华治疗。",
    },
  },
  es: null as unknown as PageCopy,
  fr: null as unknown as PageCopy,
  de: null as unknown as PageCopy,
  ru: null as unknown as PageCopy,
};

TELEMEDICINE_COPY.es = {
  ...TELEMEDICINE_COPY.en,
  metaTitle: "Consulta en línea con especialistas chinos destacados | Medora Health",
  hero: {
    label: "Consulta en línea con especialistas chinos destacados",
    title: "¿No está seguro de su diagnóstico o plan de tratamiento?",
    subtitle: "Obtenga una revisión escrita, una consulta por video o una segunda opinión multidisciplinaria de destacados especialistas chinos.",
    support: "Suba sus expedientes médicos y reciba orientación experta antes de su próxima decisión médica.",
    primaryCta: "Reservar consulta en línea",
    imageAlt: "Especialista chino revisando expedientes médicos para una segunda opinión en línea",
  },
  trust: [
    ["Médicos chinos destacados", "Especialistas asignados según su condición."],
    ["Primero los expedientes", "Informes, imágenes, patología, análisis e historial primero."],
    ["Coordinación en inglés", "Organizamos, traducimos y resumimos su caso."],
    ["Viaje opcional", "Empiece en línea. Viaje solo si encaja con su caso."],
  ],
  expertShowcase: {
    ...TELEMEDICINE_COPY.en.expertShowcase,
    label: "Selección de especialistas",
    title: "Especialistas chinos destacados seleccionados",
    body: "Medora asigna su caso a especialistas chinos con experiencia para revisión escrita, consulta por video y orientación sobre opciones de tratamiento.",
    tabs: ["Oncología", "Cardiología", "Neurología", "Ortopedia", "Reproducción"],
    moreTabs: ["Cirugía estética", "Terapia con células madre", "Odontología", "Pediatría", "Urología", "Endocrinología", "Oftalmología"],
    moreLabel: "Más",
    collapseLabel: "Mostrar menos",
    expertCta: "Ver especialista",
    matchPrompt: "Cuéntenos su situación y le sugeriremos una combinación de especialistas más adecuada.",
    matchCta: "Obtener recomendación de especialista",
    customTitle: "¿Necesita otro especialista?",
    customBody: "Comparta su diagnóstico, registros médicos, especialidad preferida y objetivo de consulta. Medora sugerirá un médico o equipo más adecuado.",
    customCta: "Cuéntenos qué necesita",
  },
  review: {
    ...TELEMEDICINE_COPY.en.review,
    label: "Opciones de revisión",
    title: "Elija la segunda opinión adecuada para su caso",
    body: "Empiece con una revisión escrita, hable con un médico por video o solicite una revisión multidisciplinaria para casos oncológicos complejos.",
  },
  comparison: {
    ...TELEMEDICINE_COPY.en.comparison,
    label: "Comparación",
    title: "Compare las opciones de revisión",
  },
  process: {
    ...TELEMEDICINE_COPY.en.process,
    label: "Proceso",
    title: "Cómo funciona el proceso de segunda opinión",
    stepLabel: "Paso",
  },
  specialists: {
    ...TELEMEDICINE_COPY.en.specialists,
    label: "Red de especialistas",
    title: "Revisado por especialistas chinos seleccionados",
    body: "Medora coordina revisiones según su condición, expedientes médicos y opción elegida.",
  },
  finalCta: {
    label: "Empiece a distancia",
    title: "Obtenga otra perspectiva experta antes de su próxima decisión médica",
    body: "Elija una revisión escrita, consulta por video o revisión oncológica multidisciplinaria.",
    cta: "Reservar consulta en línea",
    note: "Empiece a distancia. Sin obligación de viajar.",
  },
};

TELEMEDICINE_COPY.fr = {
  ...TELEMEDICINE_COPY.en,
  metaTitle: "Consultation en ligne avec des spécialistes chinois de haut niveau | Medora Health",
  hero: {
    label: "Consultation en ligne avec des spécialistes chinois de haut niveau",
    title: "Vous n'êtes pas sûr de votre diagnostic ou de votre plan de traitement ?",
    subtitle: "Obtenez un avis écrit, une consultation vidéo ou un deuxième avis multidisciplinaire de spécialistes chinois de haut niveau.",
    support: "Téléversez vos dossiers médicaux et recevez une orientation experte avant votre prochaine décision médicale.",
    primaryCta: "Réserver une consultation en ligne",
    imageAlt: "Spécialiste chinois examinant des dossiers médicaux pour un deuxième avis en ligne",
  },
  trust: [
    ["Médecins chinois de haut niveau", "Spécialistes sélectionnés selon votre état."],
    ["Dossiers d'abord", "Rapports, imagerie, pathologie, analyses et historique d'abord."],
    ["Coordination multilingue", "Nous organisons, traduisons et résumons votre dossier."],
    ["Voyage optionnel", "Commencez en ligne. Voyagez seulement si cela convient à votre cas."],
  ],
  expertShowcase: {
    ...TELEMEDICINE_COPY.en.expertShowcase,
    label: "Sélection de spécialistes",
    title: "Spécialistes chinois de haut niveau sélectionnés",
    body: "Medora oriente votre dossier vers des spécialistes chinois expérimentés pour un avis écrit, une consultation vidéo et une discussion sur les options de traitement.",
    tabs: ["Oncologie", "Cardiologie", "Neurologie", "Orthopédie", "Médecine reproductive"],
    moreTabs: ["Chirurgie esthétique", "Thérapie par cellules souches", "Dentisterie", "Pédiatrie", "Urologie", "Endocrinologie", "Ophtalmologie"],
    moreLabel: "Plus",
    collapseLabel: "Réduire",
    expertCta: "Voir le spécialiste",
    matchPrompt: "Décrivez votre situation et nous vous proposerons une correspondance spécialiste plus adaptée.",
    matchCta: "Obtenir une recommandation de spécialiste",
    customTitle: "Besoin d'un autre spécialiste ?",
    customBody: "Indiquez votre diagnostic, vos dossiers, la spécialité souhaitée et l'objectif de consultation. Medora proposera un médecin ou une équipe plus adaptée.",
    customCta: "Dites-nous ce qu'il vous faut",
  },
  review: {
    ...TELEMEDICINE_COPY.en.review,
    label: "Options d'avis",
    title: "Choisissez le deuxième avis adapté à votre cas",
    body: "Commencez par un avis écrit, échangez avec un médecin en vidéo ou demandez une revue multidisciplinaire pour les cancers complexes.",
  },
  comparison: {
    ...TELEMEDICINE_COPY.en.comparison,
    label: "Comparaison",
    title: "Comparer les options d'avis",
  },
  process: {
    ...TELEMEDICINE_COPY.en.process,
    label: "Processus",
    title: "Comment fonctionne le deuxième avis",
    stepLabel: "Étape",
  },
  specialists: {
    ...TELEMEDICINE_COPY.en.specialists,
    label: "Réseau de spécialistes",
    title: "Examiné par des spécialistes chinois sélectionnés",
    body: "Medora coordonne les revues selon votre état, vos dossiers médicaux et l'option choisie.",
  },
  finalCta: {
    label: "Commencez à distance",
    title: "Obtenez un autre avis expert avant votre prochaine décision médicale",
    body: "Choisissez un avis écrit, une consultation vidéo ou une revue multidisciplinaire en oncologie.",
    cta: "Réserver une consultation en ligne",
    note: "Commencez à distance. Aucun voyage obligatoire.",
  },
};

TELEMEDICINE_COPY.de = {
  ...TELEMEDICINE_COPY.en,
  metaTitle: "Online-Beratung mit führenden chinesischen Spezialisten | Medora Health",
  hero: {
    label: "Online-Beratung mit führenden chinesischen Spezialisten",
    title: "Unsicher bei Diagnose oder Behandlungsplan?",
    subtitle: "Erhalten Sie eine schriftliche Prüfung, Videokonsultation oder multidisziplinäre Zweitmeinung von führenden chinesischen Spezialisten.",
    support: "Laden Sie Ihre Unterlagen hoch und erhalten Sie fachliche Orientierung vor Ihrer nächsten medizinischen Entscheidung.",
    primaryCta: "Online-Beratung buchen",
    imageAlt: "Chinesischer Spezialist prüft medizinische Unterlagen für eine Online-Zweitmeinung",
  },
  trust: [
    ["Top-Ärzte in China", "Spezialisten werden passend zu Ihrem Fall ausgewählt."],
    ["Unterlagen zuerst", "Berichte, Bildgebung, Pathologie, Laborwerte und Verlauf zuerst."],
    ["Englische Koordination", "Wir organisieren, übersetzen und fassen Ihren Fall zusammen."],
    ["Reise optional", "Starten Sie online. Reisen Sie nur, wenn es zu Ihrem Fall passt."],
  ],
  expertShowcase: {
    ...TELEMEDICINE_COPY.en.expertShowcase,
    label: "Spezialisten-Matching",
    title: "Ausgewählte führende chinesische Spezialisten",
    body: "Medora ordnet Ihren Fall erfahrenen chinesischen Spezialisten zu, die schriftliche Prüfung, Videoberatung und Diskussion zur Behandlungsrichtung unterstützen können.",
    tabs: ["Onkologie", "Kardiologie", "Neurologie", "Orthopädie", "Reproduktionsmedizin"],
  moreTabs: ["Ästhetische Chirurgie", "Stammzelltherapie", "Zahnmedizin", "Pädiatrie", "Urologie", "Endokrinologie", "Augenheilkunde"],
    moreLabel: "Mehr",
    collapseLabel: "Weniger anzeigen",
    expertCta: "Spezialist ansehen",
    matchPrompt: "Beschreiben Sie uns Ihren Fall, und wir schlagen eine passendere Spezialisten-Zuordnung vor.",
    matchCta: "Spezialisten-Matching anfragen",
    customTitle: "Benötigen Sie einen anderen Spezialisten?",
    customBody: "Teilen Sie Diagnose, Unterlagen, gewünschte Fachrichtung und Beratungsziel. Medora schlägt einen passenderen Arzt oder ein Team vor.",
    customCta: "Bedarf mitteilen",
  },
  review: {
    ...TELEMEDICINE_COPY.en.review,
    label: "Optionen",
    title: "Wählen Sie die passende Zweitmeinung für Ihren Fall",
    body: "Beginnen Sie mit einer schriftlichen Fachprüfung, sprechen Sie per Video mit einem Arzt oder beantragen Sie eine multidisziplinäre Prüfung für komplexe Krebsfälle.",
  },
  comparison: {
    ...TELEMEDICINE_COPY.en.comparison,
    label: "Vergleich",
    title: "Optionen vergleichen",
  },
  process: {
    ...TELEMEDICINE_COPY.en.process,
    label: "Ablauf",
    title: "So funktioniert die Zweitmeinung",
    stepLabel: "Schritt",
  },
  specialists: {
    ...TELEMEDICINE_COPY.en.specialists,
    label: "Spezialistennetzwerk",
    title: "Geprüft von ausgewählten chinesischen Spezialisten",
    body: "Medora koordiniert Fachprüfungen anhand Ihres Zustands, Ihrer Unterlagen und der gewählten Option.",
  },
  finalCta: {
    label: "Remote starten",
    title: "Holen Sie eine weitere Expertenmeinung vor Ihrer nächsten medizinischen Entscheidung ein",
    body: "Wählen Sie schriftliche Prüfung, Videokonsultation oder onkologische multidisziplinäre Prüfung.",
    cta: "Online-Beratung buchen",
    note: "Starten Sie remote. Keine Reiseverpflichtung.",
  },
};

TELEMEDICINE_COPY.ru = {
  ...TELEMEDICINE_COPY.en,
  metaTitle: "Онлайн-консультация с ведущими китайскими специалистами | Medora Health",
  hero: {
    label: "Онлайн-консультация с ведущими китайскими специалистами",
    title: "Не уверены в диагнозе или плане лечения?",
    subtitle: "Получите письменный обзор, видеоконсультацию или междисциплинарное второе мнение ведущих китайских специалистов.",
    support: "Загрузите медицинские документы и получите экспертные рекомендации перед следующим медицинским решением.",
    primaryCta: "Записаться на онлайн-консультацию",
    imageAlt: "Китайский специалист изучает медицинские документы для онлайн-второго мнения",
  },
  trust: [
    ["Ведущие китайские врачи", "Специалисты подбираются под ваше состояние."],
    ["Сначала документы", "Отчеты, снимки, патология, анализы и история лечения сначала."],
    ["Координация на английском", "Мы организуем, переводим и резюмируем ваш случай."],
    ["Поездка необязательна", "Начните онлайн. Поездка только если подходит вашему случаю."],
  ],
  expertShowcase: {
    ...TELEMEDICINE_COPY.en.expertShowcase,
    label: "Подбор специалиста",
    title: "Отобранные ведущие китайские специалисты",
    body: "Medora подбирает для вашего случая опытных китайских специалистов для письменного обзора, видеоконсультации и обсуждения направления лечения.",
    tabs: ["Онкология", "Кардиология", "Неврология", "Ортопедия", "Репродуктивная медицина"],
  moreTabs: ["Эстетическая хирургия", "Стволовые клетки", "Стоматология", "Педиатрия", "Урология", "Эндокринология", "Офтальмология"],
    moreLabel: "Еще",
    collapseLabel: "Свернуть",
    expertCta: "Посмотреть специалиста",
    matchPrompt: "Расскажите нам о вашем состоянии, и мы предложим более подходящего специалиста.",
    matchCta: "Получить рекомендацию специалиста",
    customTitle: "Нужен другой специалист?",
    customBody: "Расскажите о диагнозе, документах, нужной специальности и цели консультации. Medora предложит более подходящего врача или команду.",
    customCta: "Расскажите, что нужно",
  },
  review: {
    ...TELEMEDICINE_COPY.en.review,
    label: "Варианты обзора",
    title: "Выберите подходящее второе мнение для вашего случая",
    body: "Начните с письменного обзора, поговорите с врачом по видео или запросите междисциплинарный обзор для сложных онкологических случаев.",
  },
  comparison: {
    ...TELEMEDICINE_COPY.en.comparison,
    label: "Сравнение",
    title: "Сравнить варианты обзора",
  },
  process: {
    ...TELEMEDICINE_COPY.en.process,
    label: "Процесс",
    title: "Как работает второе мнение",
    stepLabel: "Шаг",
  },
  specialists: {
    ...TELEMEDICINE_COPY.en.specialists,
    label: "Сеть специалистов",
    title: "Рассматривается выбранными китайскими специалистами",
    body: "Medora координирует обзор с учетом вашего состояния, документов и выбранной опции.",
  },
  finalCta: {
    label: "Начните удаленно",
    title: "Получите еще один экспертный взгляд перед следующим медицинским решением",
    body: "Выберите письменный обзор, видеоконсультацию или онкологический междисциплинарный обзор.",
    cta: "Записаться на онлайн-консультацию",
    note: "Начните удаленно. Поездка необязательна.",
  },
};

TELEMEDICINE_COPY.es.expertShowcase.featuredLabel = "Coincidencia destacada";
TELEMEDICINE_COPY.fr.expertShowcase.featuredLabel = "Correspondance recommandée";
TELEMEDICINE_COPY.de.expertShowcase.featuredLabel = "Empfohlene Zuordnung";
TELEMEDICINE_COPY.ru.expertShowcase.featuredLabel = "Рекомендуемый подбор";

TELEMEDICINE_COPY.es.review.plans = [
  {
    ...TELEMEDICINE_COPY.en.review.plans[0],
    badge: "Básico",
    title: "Revisión escrita",
    chips: ["Informe escrito", "Revisión de registros", "48-72 horas"],
    cta: "Reservar",
    detailsCta: "Ver detalles",
    modal: {
      title: "Revisión escrita por especialista",
      body: "Un especialista seleccionado revisa sus registros médicos y prepara una segunda opinión escrita para ayudarle a entender el diagnóstico, el plan de tratamiento y los siguientes pasos.",
      bestForLabel: "Adecuado para",
      bestFor: "Pacientes que ya tienen informes médicos y desean otra perspectiva experta antes de tomar una decisión de tratamiento.",
      receiveLabel: "Qué recibe",
      receive: ["Resumen del diagnóstico y del caso", "Hallazgos clave de sus registros", "Observaciones del especialista", "Consideraciones de tratamiento", "Preguntas sugeridas para su médico local", "Siguientes pasos recomendados", "Nota sobre posibilidades de tratamiento en China, si aplica"],
      processLabel: "Proceso habitual",
      process: ["Suba sus registros médicos", "Medora organiza el resumen del caso", "Un especialista revisa su caso", "Recibe el informe escrito de segunda opinión"],
      turnaroundLabel: "Tiempo de entrega",
      turnaround: "Normalmente 48-72 horas después de recibir registros completos.",
      cta: "Iniciar revisión escrita",
      imageAlt: "Especialista chino revisando registros médicos e informe escrito",
    },
  },
  {
    ...TELEMEDICINE_COPY.en.review.plans[1],
    badge: "Más popular",
    title: "Consulta por video",
    chips: ["Videollamada", "Resumen escrito", "Preguntas al médico"],
    cta: "Reservar",
    detailsCta: "Ver detalles",
    modal: {
      title: "Consulta por video + resumen escrito",
      body: "Hable por video con un especialista seleccionado, con apoyo del coordinador médico de Medora, y reciba un resumen escrito después de la consulta.",
      bestForLabel: "Adecuado para",
      bestFor: "Pacientes que quieren hacer preguntas directamente, aclarar opciones de tratamiento y comprender mejor sus registros médicos.",
      receiveLabel: "Qué recibe",
      receive: ["Revisión de registros antes de la llamada", "Consulta por video de 20-30 minutos", "Preguntas clave preparadas con antelación", "Comentarios principales del médico", "Resumen escrito de la consulta", "Preguntas de seguimiento y próximos pasos", "Discusión opcional sobre tratamiento en China"],
      processLabel: "Proceso habitual",
      process: ["Suba sus registros", "Medora prepara el resumen del caso", "Se agenda la consulta", "Habla con el especialista por video", "Recibe un resumen escrito posterior"],
      turnaroundLabel: "Programación",
      turnaround: "Normalmente se agenda en 3-5 días hábiles tras recibir registros completos.",
      cta: "Reservar consulta por video",
      imageAlt: "Paciente internacional hablando por video con un médico chino",
    },
  },
  {
    ...TELEMEDICINE_COPY.en.review.plans[2],
    badge: "Revisión avanzada",
    title: "Revisión multidisciplinaria",
    chips: ["Varios especialistas", "Casos complejos", "Resumen avanzado"],
    cta: "Solicitar",
    detailsCta: "Ver detalles",
    modal: {
      title: "Revisión multidisciplinaria del caso",
      body: "Para casos médicos complejos, Medora coordina una revisión más profunda con varios especialistas cuando es apropiado.",
      bestForLabel: "Adecuado para",
      bestFor: "Pacientes con cáncer complejo, cirugía mayor, enfermedades neurológicas, decisiones cardíacas o recomendaciones de tratamiento contradictorias.",
      receiveLabel: "Qué recibe",
      receive: ["Admisión completa del caso", "Revisión de registros, imágenes y patología", "Discusión multispecialidad del caso", "Resumen avanzado de segunda opinión", "Consideraciones sobre la ruta de tratamiento", "Opciones quirúrgicas, farmacológicas o intervencionistas", "Preguntas para discutir con su médico local", "Recomendación de acceso hospitalario en China, si es adecuada"],
      processLabel: "Proceso habitual",
      process: ["Envíe registros médicos completos", "Medora prepara un expediente estructurado", "Especialistas relevantes revisan el caso", "Se prepara un resumen multidisciplinario", "Medora conversa con usted sobre los posibles próximos pasos"],
      turnaroundLabel: "Tiempo de entrega",
      turnaround: "Normalmente 5-7 días hábiles después de recibir registros completos.",
      cta: "Solicitar revisión avanzada",
      imageAlt: "Reunión multidisciplinaria en un hospital chino revisando imágenes y tratamiento",
    },
  },
];

TELEMEDICINE_COPY.fr.review.plans = [
  {
    ...TELEMEDICINE_COPY.en.review.plans[0],
    badge: "Essentiel",
    title: "Avis écrit",
    chips: ["Rapport écrit", "Étude du dossier", "48-72 heures"],
    cta: "Réserver",
    detailsCta: "Voir détails",
    modal: {
      title: "Avis écrit par spécialiste",
      body: "Un spécialiste sélectionné examine vos dossiers médicaux et fournit un deuxième avis écrit pour vous aider à mieux comprendre le diagnostic, le plan de traitement et les prochaines étapes.",
      bestForLabel: "Idéal pour",
      bestFor: "Les patients disposant déjà de rapports médicaux qui souhaitent un autre regard expert avant une décision thérapeutique.",
      receiveLabel: "Ce que vous recevez",
      receive: ["Résumé du diagnostic et du dossier", "Points clés issus de vos documents", "Observations du spécialiste", "Éléments à considérer pour le traitement", "Questions suggérées pour votre médecin local", "Prochaines étapes recommandées", "Note sur les possibilités de traitement en Chine, le cas échéant"],
      processLabel: "Processus habituel",
      process: ["Téléversez vos dossiers médicaux", "Medora organise le résumé du cas", "Un spécialiste examine votre dossier", "Vous recevez le rapport écrit de deuxième avis"],
      turnaroundLabel: "Délai",
      turnaround: "Généralement 48-72 heures après réception d'un dossier complet.",
      cta: "Commencer l'avis écrit",
      imageAlt: "Spécialiste chinois examinant des dossiers médicaux et un rapport écrit",
    },
  },
  {
    ...TELEMEDICINE_COPY.en.review.plans[1],
    badge: "Le plus choisi",
    title: "Consultation vidéo",
    chips: ["Appel vidéo", "Résumé écrit", "Questions au médecin"],
    cta: "Réserver",
    detailsCta: "Voir détails",
    modal: {
      title: "Consultation vidéo + résumé écrit",
      body: "Échangez en vidéo avec un spécialiste sélectionné, avec le soutien du coordinateur médical Medora, puis recevez un résumé écrit.",
      bestForLabel: "Idéal pour",
      bestFor: "Les patients qui veulent poser des questions directement, clarifier les options de traitement et mieux comprendre leurs dossiers.",
      receiveLabel: "Ce que vous recevez",
      receive: ["Revue du dossier avant l'appel", "Consultation vidéo de 20-30 minutes", "Questions clés préparées à l'avance", "Commentaires principaux du médecin", "Résumé écrit de la consultation", "Questions de suivi et prochaines étapes", "Discussion optionnelle sur un traitement en Chine"],
      processLabel: "Processus habituel",
      process: ["Téléversez vos documents", "Medora prépare le résumé du cas", "Votre consultation est programmée", "Vous parlez au spécialiste en vidéo", "Vous recevez un résumé écrit de suivi"],
      turnaroundLabel: "Planification",
      turnaround: "Généralement programmée sous 3-5 jours ouvrés après réception du dossier complet.",
      cta: "Réserver une consultation vidéo",
      imageAlt: "Patient international en consultation vidéo avec un médecin chinois",
    },
  },
  {
    ...TELEMEDICINE_COPY.en.review.plans[2],
    badge: "Avis avancé",
    title: "Revue multidisciplinaire",
    chips: ["Plusieurs spécialistes", "Cas complexes", "Synthèse avancée"],
    cta: "Demander",
    detailsCta: "Voir détails",
    modal: {
      title: "Revue multidisciplinaire du dossier",
      body: "Pour les cas médicaux complexes, Medora coordonne, si approprié, une analyse approfondie impliquant plusieurs spécialistes.",
      bestForLabel: "Idéal pour",
      bestFor: "Les patients confrontés à un cancer complexe, une chirurgie majeure, des troubles neurologiques, des décisions cardiaques ou des recommandations contradictoires.",
      receiveLabel: "Ce que vous recevez",
      receive: ["Recueil complet du dossier", "Revue des documents, imageries et pathologie", "Discussion entre plusieurs spécialités", "Synthèse avancée de deuxième avis", "Considérations sur le parcours thérapeutique", "Options chirurgicales, médicamenteuses ou interventionnelles", "Questions à discuter avec votre médecin local", "Recommandation d'accès hospitalier en Chine si adaptée"],
      processLabel: "Processus habituel",
      process: ["Soumettez un dossier médical complet", "Medora prépare un dossier structuré", "Les spécialistes concernés examinent le cas", "Une synthèse multidisciplinaire est préparée", "Medora discute avec vous des prochaines étapes possibles"],
      turnaroundLabel: "Délai",
      turnaround: "Généralement 5-7 jours ouvrés après réception du dossier complet.",
      cta: "Demander l'avis avancé",
      imageAlt: "Réunion multidisciplinaire dans un hôpital chinois examinant imagerie et traitements",
    },
  },
];

TELEMEDICINE_COPY.de.review.plans = [
  {
    ...TELEMEDICINE_COPY.en.review.plans[0],
    badge: "Basis",
    title: "Schriftliche Prüfung",
    chips: ["Schriftlicher Bericht", "Unterlagenprüfung", "48-72 Stunden"],
    cta: "Buchen",
    detailsCta: "Details",
    modal: {
      title: "Schriftliche Fachprüfung",
      body: "Ein ausgewählter Spezialist prüft Ihre medizinischen Unterlagen und erstellt eine schriftliche Zweitmeinung zu Diagnose, Behandlungsplan und nächsten Schritten.",
      bestForLabel: "Geeignet für",
      bestFor: "Patienten mit vorhandenen Befunden, die vor einer Therapieentscheidung eine weitere Experteneinschätzung wünschen.",
      receiveLabel: "Sie erhalten",
      receive: ["Diagnose- und Fallzusammenfassung", "Wichtige Befunde aus Ihren Unterlagen", "Beobachtungen des Spezialisten", "Therapieüberlegungen", "Fragen für Ihren lokalen Arzt", "Empfohlene nächste Schritte", "Hinweis zu Behandlungsmöglichkeiten in China, falls relevant"],
      processLabel: "Typischer Ablauf",
      process: ["Laden Sie Ihre Unterlagen hoch", "Medora strukturiert die Fallzusammenfassung", "Ein Spezialist prüft den Fall", "Sie erhalten den schriftlichen Zweitmeinungsbericht"],
      turnaroundLabel: "Bearbeitungszeit",
      turnaround: "In der Regel 48-72 Stunden nach Eingang vollständiger Unterlagen.",
      cta: "Schriftliche Prüfung starten",
      imageAlt: "Chinesischer Spezialist prüft medizinische Unterlagen und schriftlichen Bericht",
    },
  },
  {
    ...TELEMEDICINE_COPY.en.review.plans[1],
    badge: "Am beliebtesten",
    title: "Videokonsultation",
    chips: ["Videoanruf", "Schriftliche Zusammenfassung", "Arztfragen"],
    cta: "Buchen",
    detailsCta: "Details",
    modal: {
      title: "Videokonsultation + schriftliche Zusammenfassung",
      body: "Sprechen Sie per Video mit einem ausgewählten Spezialisten, begleitet durch Medoras medizinische Koordination, und erhalten Sie danach eine schriftliche Zusammenfassung.",
      bestForLabel: "Geeignet für",
      bestFor: "Patienten, die direkte Fragen stellen, Therapieoptionen klären und ihre Befunde besser verstehen möchten.",
      receiveLabel: "Sie erhalten",
      receive: ["Unterlagenprüfung vor dem Termin", "20-30-minütige Videokonsultation", "Vorbereitete Kernfragen", "Wichtigste Kommentare des Arztes", "Schriftliche Konsultationszusammenfassung", "Folgefragen und nächste Schritte", "Optionale Diskussion zur Behandlung in China"],
      processLabel: "Typischer Ablauf",
      process: ["Laden Sie Ihre Unterlagen hoch", "Medora bereitet die Fallzusammenfassung vor", "Der Termin wird geplant", "Sie sprechen per Video mit dem Spezialisten", "Sie erhalten eine schriftliche Nachbereitung"],
      turnaroundLabel: "Terminplanung",
      turnaround: "In der Regel innerhalb von 3-5 Werktagen nach Eingang vollständiger Unterlagen.",
      cta: "Videokonsultation buchen",
      imageAlt: "Internationaler Patient spricht per Video mit einem chinesischen Arzt",
    },
  },
  {
    ...TELEMEDICINE_COPY.en.review.plans[2],
    badge: "Erweiterte Prüfung",
    title: "Multidisziplinäre Prüfung",
    chips: ["Mehrere Spezialisten", "Komplexe Fälle", "Erweiterte Zusammenfassung"],
    cta: "Anfragen",
    detailsCta: "Details",
    modal: {
      title: "Multidisziplinäre Fallprüfung",
      body: "Bei komplexen medizinischen Fällen koordiniert Medora, wenn sinnvoll, eine vertiefte Prüfung durch mehrere Spezialisten.",
      bestForLabel: "Geeignet für",
      bestFor: "Patienten mit komplexer Krebstherapie, großen Operationen, neurologischen Erkrankungen, kardiologischen Entscheidungen oder widersprüchlichen Empfehlungen.",
      receiveLabel: "Sie erhalten",
      receive: ["Umfassende Fallaufnahme", "Prüfung von Unterlagen, Bildgebung und Pathologie", "Fallbesprechung durch mehrere Fachrichtungen", "Erweiterte schriftliche Zweitmeinung", "Überlegungen zum Behandlungspfad", "Chirurgische, medikamentöse und interventionelle Optionen", "Fragen für Ihren lokalen Arzt", "Empfehlung zum Zugang zu chinesischen Kliniken, falls passend"],
      processLabel: "Typischer Ablauf",
      process: ["Reichen Sie vollständige Unterlagen ein", "Medora erstellt eine strukturierte Falldatei", "Relevante Spezialisten prüfen den Fall", "Eine multidisziplinäre Zusammenfassung wird erstellt", "Medora bespricht mögliche nächste Schritte mit Ihnen"],
      turnaroundLabel: "Bearbeitungszeit",
      turnaround: "In der Regel 5-7 Werktage nach Eingang vollständiger Unterlagen.",
      cta: "Erweiterte Prüfung anfragen",
      imageAlt: "Multidisziplinäres Treffen in einem chinesischen Krankenhaus zu Bildgebung und Therapiepfaden",
    },
  },
];

TELEMEDICINE_COPY.ru.review.plans = [
  {
    ...TELEMEDICINE_COPY.en.review.plans[0],
    badge: "Базовый",
    title: "Письменный обзор",
    chips: ["Письменный отчет", "Анализ документов", "48-72 часа"],
    cta: "Записаться",
    detailsCta: "Подробнее",
    modal: {
      title: "Письменный обзор специалиста",
      body: "Выбранный специалист изучает ваши медицинские документы и готовит письменное второе мнение, чтобы помочь понять диагноз, план лечения и следующие шаги.",
      bestForLabel: "Подходит для",
      bestFor: "Пациентов, у которых уже есть медицинские отчеты и которым нужен еще один экспертный взгляд перед решением о лечении.",
      receiveLabel: "Что вы получите",
      receive: ["Резюме диагноза и случая", "Ключевые выводы из документов", "Наблюдения специалиста", "Соображения по лечению", "Вопросы для местного врача", "Рекомендуемые следующие шаги", "Комментарий о возможности лечения в Китае, если актуально"],
      processLabel: "Обычный процесс",
      process: ["Загрузите медицинские документы", "Medora оформляет резюме случая", "Специалист изучает ваш случай", "Вы получаете письменный отчет второго мнения"],
      turnaroundLabel: "Срок",
      turnaround: "Обычно 48-72 часа после получения полного комплекта документов.",
      cta: "Начать письменный обзор",
      imageAlt: "Китайский специалист изучает медицинские документы и письменный отчет",
    },
  },
  {
    ...TELEMEDICINE_COPY.en.review.plans[1],
    badge: "Популярно",
    title: "Видеоконсультация",
    chips: ["Видеозвонок", "Письменное резюме", "Вопросы врачу"],
    cta: "Записаться",
    detailsCta: "Подробнее",
    modal: {
      title: "Видеоконсультация + письменное резюме",
      body: "Поговорите по видео с выбранным специалистом при поддержке медицинского координатора Medora и получите письменное резюме после консультации.",
      bestForLabel: "Подходит для",
      bestFor: "Пациентов, которые хотят задать вопросы напрямую, уточнить варианты лечения и лучше понять медицинские документы.",
      receiveLabel: "Что вы получите",
      receive: ["Анализ документов до звонка", "Видеоконсультация 20-30 минут", "Заранее подготовленные ключевые вопросы", "Основные комментарии врача", "Письменное резюме консультации", "Последующие вопросы и шаги", "Дополнительное обсуждение лечения в Китае"],
      processLabel: "Обычный процесс",
      process: ["Загрузите документы", "Medora готовит резюме случая", "Консультация назначается", "Вы общаетесь со специалистом по видео", "Вы получаете письменное резюме"],
      turnaroundLabel: "Назначение",
      turnaround: "Обычно назначается в течение 3-5 рабочих дней после получения полного комплекта документов.",
      cta: "Записаться на видеоконсультацию",
      imageAlt: "Иностранный пациент говорит по видео с китайским врачом",
    },
  },
  {
    ...TELEMEDICINE_COPY.en.review.plans[2],
    badge: "Расширенный обзор",
    title: "Междисциплинарный обзор",
    chips: ["Несколько специалистов", "Сложные случаи", "Расширенное резюме"],
    cta: "Запросить",
    detailsCta: "Подробнее",
    modal: {
      title: "Междисциплинарный обзор случая",
      body: "Для сложных медицинских случаев Medora при необходимости координирует более глубокий обзор с участием нескольких специалистов.",
      bestForLabel: "Подходит для",
      bestFor: "Пациентов со сложной онкологией, крупной операцией, неврологическими состояниями, кардиологическими решениями или противоречивыми рекомендациями.",
      receiveLabel: "Что вы получите",
      receive: ["Полный сбор информации по случаю", "Анализ документов, снимков и патологии", "Обсуждение случая несколькими специальностями", "Расширенное письменное второе мнение", "Соображения по маршруту лечения", "Хирургические, лекарственные и интервенционные варианты", "Вопросы для обсуждения с местным врачом", "Рекомендация доступа к больницам Китая, если подходит"],
      processLabel: "Обычный процесс",
      process: ["Отправьте полный комплект документов", "Medora готовит структурированный файл случая", "Соответствующие специалисты изучают случай", "Готовится междисциплинарное резюме", "Medora обсуждает с вами возможные следующие шаги"],
      turnaroundLabel: "Срок",
      turnaround: "Обычно 5-7 рабочих дней после получения полного комплекта документов.",
      cta: "Запросить расширенный обзор",
      imageAlt: "Междисциплинарная встреча в китайской больнице по снимкам и лечению",
    },
  },
];

TELEMEDICINE_COPY.es.comparison = {
  label: "Comparación",
  title: "Compare las opciones de revisión",
  cta: "Comparar opciones",
  headers: ["Característica", "Revisión escrita", "Consulta por video", "Revisión multidisciplinaria"],
  a11yDescription: "Tabla comparativa de las opciones disponibles de consulta en línea.",
  rows: [
    ["Recepción de registros", "Sí", "Sí", "Sí"],
    ["Preparación del resumen", "Sí", "Sí", "Sí"],
    ["Opinión escrita del especialista", "Sí", "Sí", "Sí"],
    ["Conversación por video", "No", "Sí", "Opcional / incluida según paquete"],
    ["Apoyo de coordinador médico", "Sí", "Sí", "Sí"],
    ["Revisión centrada en cáncer", "Limitada", "Disponible", "Completa"],
    ["Varios especialistas", "No", "A veces", "Sí"],
    ["Discusión de ruta terapéutica", "Básica", "Detallada", "Avanzada"],
    ["Selección de hospital en China", "Opcional", "Opcional", "Incluida si es adecuada"],
    ["Ideal para", "Segunda opinión general", "Pacientes con preguntas", "Casos complejos"],
    ["Entrega típica", "48-72 horas", "3-5 días hábiles", "5-7 días hábiles"],
  ],
};

TELEMEDICINE_COPY.fr.comparison = {
  label: "Comparaison",
  title: "Comparer les options d'avis",
  cta: "Comparer les options",
  headers: ["Fonction", "Avis écrit", "Consultation vidéo", "Revue multidisciplinaire"],
  a11yDescription: "Tableau comparatif des options de consultation en ligne disponibles.",
  rows: [
    ["Recueil des dossiers", "Oui", "Oui", "Oui"],
    ["Préparation du résumé", "Oui", "Oui", "Oui"],
    ["Avis écrit du spécialiste", "Oui", "Oui", "Oui"],
    ["Discussion vidéo", "Non", "Oui", "Optionnelle / incluse selon l'offre"],
    ["Support coordinateur médical", "Oui", "Oui", "Oui"],
    ["Revue axée cancer", "Limitée", "Disponible", "Complète"],
    ["Plusieurs spécialistes", "Non", "Parfois", "Oui"],
    ["Discussion du parcours de traitement", "Basique", "Détaillée", "Avancée"],
    ["Orientation vers hôpital en Chine", "Optionnelle", "Optionnelle", "Incluse si adaptée"],
    ["Idéal pour", "Deuxième avis général", "Patients avec questions", "Cas complexes"],
    ["Délai habituel", "48-72 heures", "3-5 jours ouvrés", "5-7 jours ouvrés"],
  ],
};

TELEMEDICINE_COPY.de.comparison = {
  label: "Vergleich",
  title: "Optionen vergleichen",
  cta: "Optionen vergleichen",
  headers: ["Funktion", "Schriftliche Prüfung", "Videokonsultation", "Multidisziplinäre Prüfung"],
  a11yDescription: "Vergleichstabelle der verfügbaren Online-Beratungsoptionen.",
  rows: [
    ["Unterlagenaufnahme", "Ja", "Ja", "Ja"],
    ["Fallzusammenfassung", "Ja", "Ja", "Ja"],
    ["Schriftliche Fachmeinung", "Ja", "Ja", "Ja"],
    ["Videogespräch", "Nein", "Ja", "Optional / je nach Paket enthalten"],
    ["Medizinische Koordination", "Ja", "Ja", "Ja"],
    ["Krebsfokussierte Prüfung", "Begrenzt", "Verfügbar", "Umfassend"],
    ["Mehrere Spezialisten", "Nein", "Manchmal", "Ja"],
    ["Behandlungspfad", "Basis", "Detailliert", "Erweitert"],
    ["Matching mit Klinik in China", "Optional", "Optional", "Enthalten, falls passend"],
    ["Ideal für", "Allgemeine Zweitmeinung", "Patienten mit Fragen", "Komplexe Fälle"],
    ["Typische Lieferung", "48-72 Stunden", "3-5 Werktage", "5-7 Werktage"],
  ],
};

TELEMEDICINE_COPY.ru.comparison = {
  label: "Сравнение",
  title: "Сравнить варианты обзора",
  cta: "Сравнить варианты",
  headers: ["Функция", "Письменный обзор", "Видеоконсультация", "Междисциплинарный обзор"],
  a11yDescription: "Сравнительная таблица доступных вариантов онлайн-консультации.",
  rows: [
    ["Прием медицинских документов", "Да", "Да", "Да"],
    ["Подготовка резюме случая", "Да", "Да", "Да"],
    ["Письменное мнение специалиста", "Да", "Да", "Да"],
    ["Видеообсуждение", "Нет", "Да", "Опционально / входит по пакету"],
    ["Поддержка медицинского координатора", "Да", "Да", "Да"],
    ["Обзор с фокусом на онкологию", "Ограниченно", "Доступно", "Комплексно"],
    ["Несколько специалистов", "Нет", "Иногда", "Да"],
    ["Обсуждение маршрута лечения", "Базовое", "Подробное", "Расширенное"],
    ["Подбор больницы в Китае", "Опционально", "Опционально", "Включено, если подходит"],
    ["Лучше всего для", "Общего второго мнения", "Пациентов с вопросами", "Сложных случаев"],
    ["Типичный срок", "48-72 часа", "3-5 рабочих дней", "5-7 рабочих дней"],
  ],
};

TELEMEDICINE_COPY.es.process.steps = [
  ["Envíe sus registros médicos", "Suba informes de diagnóstico, imágenes, patología, análisis, planes de tratamiento e historial de medicación."],
  ["Recepción del caso y resumen médico", "El equipo de Medora organiza sus documentos, traduce información clave si hace falta y prepara un resumen estructurado."],
  ["Revisión o consulta especializada", "Su caso se revisa por un especialista, se discute por video o se evalúa por un equipo multidisciplinario."],
  ["Reciba su segunda opinión", "Recibe un resumen escrito con observaciones clave, consideraciones de tratamiento y siguientes pasos."],
  ["Explore tratamiento en China si es adecuado", "Si su caso puede beneficiarse de tratamiento en China, Medora ayuda con hospitales, costos estimados, citas y viaje."],
];

TELEMEDICINE_COPY.fr.process.steps = [
  ["Envoyez vos dossiers médicaux", "Téléversez diagnostics, imagerie, pathologie, analyses, plans de traitement et historique médicamenteux."],
  ["Recueil du cas et résumé médical", "L'équipe Medora organise vos documents, traduit les informations clés si nécessaire et prépare un résumé structuré."],
  ["Avis ou consultation spécialiste", "Votre dossier est examiné par un spécialiste, discuté en vidéo ou évalué par une équipe multidisciplinaire."],
  ["Recevez votre deuxième avis", "Vous recevez une synthèse écrite avec observations clés, considérations thérapeutiques et prochaines étapes."],
  ["Explorez l'accès au traitement en Chine si adapté", "Si votre cas peut bénéficier d'un traitement en Chine, Medora aide pour les hôpitaux, coûts, rendez-vous et voyage."],
];

TELEMEDICINE_COPY.de.process.steps = [
  ["Medizinische Unterlagen einreichen", "Laden Sie Diagnosen, Bildgebung, Pathologie, Laborwerte, Behandlungspläne und Medikamentenhistorie hoch."],
  ["Fallaufnahme und medizinische Zusammenfassung", "Medora organisiert Ihre Dokumente, übersetzt Schlüsselinformationen bei Bedarf und erstellt eine strukturierte Zusammenfassung."],
  ["Fachprüfung oder Konsultation", "Ihr Fall wird von einem Spezialisten geprüft, per Video besprochen oder multidisziplinär bewertet."],
  ["Zweitmeinung erhalten", "Sie erhalten eine schriftliche Zusammenfassung mit Beobachtungen, Therapieüberlegungen und nächsten Schritten."],
  ["Behandlungszugang in China prüfen", "Wenn China für Ihren Fall sinnvoll sein kann, hilft Medora bei Kliniken, Kostenschätzungen, Terminen und Reise."],
];

TELEMEDICINE_COPY.ru.process.steps = [
  ["Отправьте медицинские документы", "Загрузите диагнозы, снимки, патологию, анализы, планы лечения и историю лекарств."],
  ["Сбор случая и медицинское резюме", "Команда Medora организует документы, при необходимости переводит ключевую информацию и готовит структурированное резюме."],
  ["Обзор специалиста или консультация", "Ваш случай изучает специалист, обсуждается по видео или оценивается междисциплинарной командой."],
  ["Получите второе мнение", "Вы получаете письменное резюме с ключевыми наблюдениями, соображениями по лечению и следующими шагами."],
  ["Рассмотрите лечение в Китае, если подходит", "Если лечение в Китае может быть полезным, Medora помогает с больницами, стоимостью, записью и поездкой."],
];

TELEMEDICINE_COPY.es.notice = {
  label: "Aviso médico",
  title: "Aviso médico importante",
  body: "La segunda opinión de Medora se basa en los registros médicos que usted proporciona. No es atención de emergencia y no sustituye a su médico local. Toda decisión de tratamiento debe tomarse con un profesional sanitario autorizado.",
  items: [["No es urgencia", "Ante síntomas urgentes, contacte de inmediato con los servicios de emergencia locales."], ["Revisión basada en registros", "La calidad de la revisión depende de la calidad y totalidad de los documentos aportados."], ["Consúltelo con su médico", "Use la segunda opinión como una perspectiva adicional para hablar con su médico tratante."]],
};
TELEMEDICINE_COPY.fr.notice = {
  label: "Avis médical",
  title: "Avis médical important",
  body: "Le deuxième avis Medora repose sur les dossiers médicaux fournis. Ce n'est pas une urgence et cela ne remplace pas votre médecin local. Toute décision de traitement doit être prise avec un professionnel de santé autorisé.",
  items: [["Pas une urgence", "En cas de symptômes urgents, contactez immédiatement les services d'urgence locaux."], ["Avis basé sur les dossiers", "La qualité de l'avis dépend de la qualité et de l'exhaustivité des documents fournis."], ["Parlez-en à votre médecin", "Utilisez ce deuxième avis comme perspective complémentaire avec votre médecin traitant."]],
};
TELEMEDICINE_COPY.de.notice = {
  label: "Medizinischer Hinweis",
  title: "Wichtiger medizinischer Hinweis",
  body: "Medoras Zweitmeinung basiert auf den von Ihnen bereitgestellten Unterlagen. Sie ist keine Notfallversorgung und ersetzt nicht Ihren lokalen Arzt. Therapieentscheidungen sollten gemeinsam mit einem zugelassenen Gesundheitsdienstleister getroffen werden.",
  items: [["Keine Notfallversorgung", "Bei dringenden Symptomen wenden Sie sich sofort an den lokalen Notdienst."], ["Unterlagenbasierte Prüfung", "Die Qualität hängt von Vollständigkeit und Qualität der eingereichten Dokumente ab."], ["Mit Ihrem Arzt besprechen", "Nutzen Sie die Zweitmeinung als zusätzliche Perspektive im Gespräch mit Ihrem behandelnden Arzt."]],
};
TELEMEDICINE_COPY.ru.notice = {
  label: "Медицинское уведомление",
  title: "Важное медицинское уведомление",
  body: "Сервис второго мнения Medora основан на предоставленных вами медицинских документах. Это не экстренная помощь и не замена вашему местному врачу. Любое решение о лечении следует принимать вместе с лицензированным медицинским специалистом.",
  items: [["Не экстренная помощь", "При срочных симптомах немедленно обратитесь в местную службу экстренной помощи."], ["Обзор по документам", "Качество обзора зависит от полноты и качества предоставленных документов."], ["Обсудите с врачом", "Используйте второе мнение как дополнительную перспективу для обсуждения с лечащим врачом."]],
};

TELEMEDICINE_COPY.es.faq = {
  label: "Preguntas frecuentes",
  title: "Preguntas comunes",
  items: [
    ["¿Es un diagnóstico en línea?", "No. Es una revisión de registros médicos y segunda opinión basada en la información que usted proporciona."],
    ["¿Qué opción debo elegir?", "Elija revisión escrita para un informe, consulta por video para hablar con un especialista o revisión multidisciplinaria para casos complejos."],
    ["¿Puedo empezar con revisión escrita y ampliar después?", "Sí. Muchos pacientes empiezan con una revisión escrita y luego solicitan video o revisión adicional."],
    ["¿Qué registros necesito?", "Informes diagnósticos, imágenes, patología, análisis, alta hospitalaria, historial de tratamiento, medicamentos y plan actual."],
    ["¿Cuánto tarda?", "La revisión escrita suele tardar 48-72 horas; el video 3-5 días hábiles; la revisión compleja 5-7 días hábiles."],
    ["¿Tengo que viajar a China?", "No. La segunda opinión es remota. Si su caso es adecuado, Medora puede ayudarle a explorar tratamiento en China."],
  ],
};
TELEMEDICINE_COPY.fr.faq = {
  label: "FAQ",
  title: "Questions fréquentes",
  items: [
    ["Est-ce un diagnostic en ligne ?", "Non. C'est une revue de dossier et un deuxième avis basé sur les informations fournies."],
    ["Quelle option choisir ?", "Choisissez l'avis écrit pour un rapport, la vidéo pour parler à un spécialiste ou la revue multidisciplinaire pour les cas complexes."],
    ["Puis-je commencer par un avis écrit puis évoluer ?", "Oui. De nombreux patients commencent par un avis écrit puis demandent une vidéo ou une revue supplémentaire."],
    ["Quels dossiers faut-il ?", "Diagnostics, imagerie, pathologie, analyses, compte rendu de sortie, historique de traitement, médicaments et plan actuel."],
    ["Combien de temps faut-il ?", "L'avis écrit prend souvent 48-72 heures ; la vidéo 3-5 jours ouvrés ; la revue complexe 5-7 jours ouvrés."],
    ["Dois-je voyager en Chine ?", "Non. Le deuxième avis est à distance. Si votre cas s'y prête, Medora peut aider à explorer un traitement en Chine."],
  ],
};
TELEMEDICINE_COPY.de.faq = {
  label: "FAQ",
  title: "Häufige Fragen",
  items: [
    ["Ist das eine Online-Diagnose?", "Nein. Es handelt sich um eine Unterlagenprüfung und Zweitmeinung auf Basis der bereitgestellten Informationen."],
    ["Welche Option soll ich wählen?", "Wählen Sie die schriftliche Prüfung für einen Bericht, Video für ein Gespräch oder multidisziplinär für komplexe Fälle."],
    ["Kann ich mit schriftlicher Prüfung starten und später erweitern?", "Ja. Viele Patienten starten schriftlich und fragen danach Video oder weitere Fachprüfung an."],
    ["Welche Unterlagen brauche ich?", "Diagnoseberichte, Bildgebung, Pathologie, Labor, Entlassungsberichte, Therapieverlauf, Medikamente und aktueller Plan."],
    ["Wie lange dauert es?", "Schriftlich meist 48-72 Stunden; Video 3-5 Werktage; komplexe Prüfung 5-7 Werktage."],
    ["Muss ich nach China reisen?", "Nein. Die Zweitmeinung ist remote. Wenn passend, hilft Medora bei der Prüfung von Behandlungsoptionen in China."],
  ],
};
TELEMEDICINE_COPY.ru.faq = {
  label: "FAQ",
  title: "Частые вопросы",
  items: [
    ["Это онлайн-диагноз?", "Нет. Это обзор медицинских документов и второе мнение на основе предоставленной информации."],
    ["Какой вариант выбрать?", "Выберите письменный обзор для отчета, видео для разговора со специалистом или междисциплинарный обзор для сложных случаев."],
    ["Можно начать с письменного обзора и потом расширить?", "Да. Многие пациенты начинают с письменного обзора, затем запрашивают видео или дополнительный обзор."],
    ["Какие документы нужны?", "Диагнозы, снимки, патология, анализы, выписки, история лечения, список лекарств и текущий план."],
    ["Сколько это занимает?", "Письменный обзор обычно 48-72 часа; видео 3-5 рабочих дней; сложный обзор 5-7 рабочих дней."],
    ["Нужно ли ехать в Китай?", "Нет. Второе мнение удаленное. Если случай подходит, Medora поможет рассмотреть лечение в Китае."],
  ],
};

function getTelemedicineCopy(languageCode: string): PageCopy {
  if (languageCode === "zh" || languageCode === "zh-CN") return TELEMEDICINE_COPY.zh;
  if (languageCode === "es" || languageCode === "fr" || languageCode === "de" || languageCode === "ru") {
    return TELEMEDICINE_COPY[languageCode];
  }
  return TELEMEDICINE_COPY.en;
}

function getTelemedicineLocale(languageCode: string): Locale {
  if (languageCode === "zh" || languageCode === "zh-CN") return "zh";
  if (languageCode === "es" || languageCode === "fr" || languageCode === "de" || languageCode === "ru") return languageCode;
  return "en";
}

function formatPlanPrice(priceUsd: number, locale: Locale): string {
  const display = PRICE_DISPLAYS[locale];
  const converted = priceUsd * display.rateFromUsd;
  const rounded = Math.round(converted / display.roundTo) * display.roundTo;
  const formatted = new Intl.NumberFormat(display.locale, {
    style: "currency",
    currency: display.currency,
    maximumFractionDigits: 0,
  }).format(rounded);

  return `${display.prefix}${formatted}${display.suffix ?? ""}`;
}

function getRosterCategory(specialty: string): ExpertImageCategory {
  const normalized = specialty.toLowerCase();

  if (normalized.includes("oncolog") || normalized.includes("onkolog") || specialty.includes("肿瘤") || normalized.includes("онколог")) {
    return "oncology";
  }

  if (normalized.includes("cardiolog") || normalized.includes("kardiolog") || specialty.includes("心血管") || normalized.includes("кардиолог")) {
    return "cardiology";
  }

  if (normalized.includes("neurolog") || specialty.includes("神经") || normalized.includes("невролог")) {
    return "neurology";
  }

  if (normalized.includes("orthoped") || normalized.includes("orthopaed") || normalized.includes("ortop") || specialty.includes("骨科") || normalized.includes("ортопед")) {
    return "orthopedics";
  }

  if (
    normalized.includes("reproductive")
    || normalized.includes("reproducción")
    || normalized.includes("reproduktion")
    || normalized.includes("reproduct")
    || normalized.includes("ivf")
    || normalized.includes("fertility")
    || specialty.includes("辅助生殖")
    || normalized.includes("репродуктив")
  ) {
    return "reproductive";
  }

  if (
    normalized.includes("aesthetic")
    || normalized.includes("esthetic")
    || normalized.includes("estética")
    || normalized.includes("esthétique")
    || normalized.includes("schönheit")
    || specialty.includes("整容")
    || specialty.includes("美容")
  ) {
    return "aesthetic-surgery";
  }

  if (
    normalized.includes("stem cell")
    || normalized.includes("células madre")
    || normalized.includes("cellules souches")
    || normalized.includes("stammzell")
    || specialty.includes("干细胞")
  ) {
    return "stem-cell-therapy";
  }

  if (
    normalized.includes("dentistry")
    || normalized.includes("dental")
    || normalized.includes("odontolog")
    || normalized.includes("dentisterie")
    || normalized.includes("zahn")
    || specialty.includes("牙")
  ) {
    return "dentistry";
  }

  if (
    normalized.includes("pediatric")
    || normalized.includes("pediatr")
    || normalized.includes("pädiatr")
    || specialty.includes("儿科")
  ) {
    return "pediatrics";
  }

  if (normalized.includes("urolog") || specialty.includes("泌尿")) {
    return "urology";
  }

  if (normalized.includes("endocrin") || normalized.includes("endokrin") || specialty.includes("内分泌")) {
    return "endocrinology";
  }

  if (normalized.includes("ophthalm") || normalized.includes("oftalm") || normalized.includes("ophtalm") || normalized.includes("augen") || specialty.includes("眼科")) {
    return "ophthalmology";
  }

  return "oncology";
}

type RosterProfile = {
  zhName: string;
  enName: string;
  years: number;
  zhFocus: string;
  enFocus: string;
  zhBio: string;
  enBio: string;
};

const CATEGORY_HOSPITALS: Record<ExpertImageCategory, { zh: string[]; en: string[] }> = {
  oncology: {
    zh: ["上海三甲肿瘤中心专家网络", "北京肿瘤专科协作中心", "广州高校附属医院肿瘤团队", "杭州肿瘤精准诊疗协作网络", "成都区域肿瘤医学中心"],
    en: ["Shanghai tertiary oncology center network", "Beijing oncology specialist collaboration center", "Guangzhou academic oncology team", "Hangzhou precision oncology collaboration network", "Chengdu regional oncology medical center"],
  },
  cardiology: {
    zh: ["北京心血管专科协作中心", "上海三甲医院心内科专家网络", "广州心脏中心远程会诊网络", "杭州国际心血管医学协作中心", "深圳国际心血管会诊中心"],
    en: ["Beijing cardiovascular specialist collaboration center", "Shanghai tertiary cardiology network", "Guangzhou heart center remote consultation network", "Hangzhou international cardiovascular medicine network", "Shenzhen international cardiology consultation center"],
  },
  neurology: {
    zh: ["上海神经内科远程会诊网络", "北京神经疾病专科协作中心", "杭州脑血管病专家协作网络", "成都神经疑难病会诊中心", "深圳国际神经内科咨询中心"],
    en: ["Shanghai neurology remote consultation network", "Beijing neurological disease specialist collaboration center", "Hangzhou cerebrovascular specialist network", "Chengdu complex neurological disease consultation center", "Shenzhen international neurology consultation center"],
  },
  orthopedics: {
    zh: ["上海骨科运动医学协作网络", "北京脊柱疾病远程会诊中心", "广州关节外科专家协作中心", "成都创伤骨科与脊柱协作中心", "杭州国际骨科康复协作网络"],
    en: ["Shanghai orthopedic sports medicine collaboration network", "Beijing spine disease remote consultation center", "Guangzhou joint surgery specialist collaboration center", "Chengdu trauma orthopedics and spine collaboration center", "Hangzhou international orthopedic rehabilitation network"],
  },
  reproductive: {
    zh: ["上海辅助生殖医学协作中心", "北京生殖内分泌远程会诊网络", "广州妇产与生殖医学专家网络", "杭州男性生殖与辅助生殖协作中心", "深圳国际生殖医学咨询中心"],
    en: ["Shanghai assisted reproduction medicine collaboration center", "Beijing reproductive endocrinology remote consultation network", "Guangzhou obstetrics, gynecology, and reproductive medicine network", "Hangzhou male fertility and assisted reproduction collaboration center", "Shenzhen international reproductive medicine consultation center"],
  },
  "aesthetic-surgery": {
    zh: ["上海整形外科专家协作中心", "北京美容外科远程会诊网络", "广州医学美容协作中心", "成都修复整形专家网络", "杭州国际美容医学咨询中心"],
    en: ["Shanghai plastic surgery specialist collaboration center", "Beijing aesthetic surgery remote consultation network", "Guangzhou medical aesthetics collaboration center", "Chengdu reconstructive aesthetics specialist network", "Hangzhou international aesthetic medicine consultation center"],
  },
  "stem-cell-therapy": {
    zh: ["上海再生医学临床评估网络", "北京细胞治疗随访协作中心", "广州神经修复医学协作网络", "成都再生医学多学科会诊中心", "深圳国际再生医学咨询中心"],
    en: ["Shanghai regenerative medicine clinical review network", "Beijing cell therapy follow-up collaboration center", "Guangzhou neuro-regeneration medicine network", "Chengdu regenerative medicine MDT center", "Shenzhen international regenerative medicine consultation center"],
  },
  dentistry: {
    zh: ["上海口腔种植修复协作中心", "北京美学修复远程咨询网络", "广州口腔颌面外科专家网络", "成都复杂口腔重建中心", "杭州国际口腔医学咨询中心"],
    en: ["Shanghai dental implant and prosthodontic center", "Beijing aesthetic dentistry remote consultation network", "Guangzhou oral and maxillofacial specialist network", "Chengdu complex dental reconstruction center", "Hangzhou international dental consultation center"],
  },
  pediatrics: {
    zh: ["上海儿童专科远程会诊网络", "北京儿童呼吸与过敏协作中心", "广州儿童神经发育专家网络", "成都儿童疑难病会诊中心", "深圳国际儿科咨询中心"],
    en: ["Shanghai pediatric specialist remote consultation network", "Beijing pediatric respiratory and allergy center", "Guangzhou pediatric neurodevelopment specialist network", "Chengdu pediatric complex disease consultation center", "Shenzhen international pediatrics consultation center"],
  },
  urology: {
    zh: ["上海泌尿外科专家协作中心", "北京女性泌尿与盆底医学网络", "广州泌尿结石远程会诊中心", "成都泌尿疑难病会诊中心", "深圳国际泌尿医学咨询中心"],
    en: ["Shanghai urology specialist collaboration center", "Beijing female urology and pelvic floor network", "Guangzhou urinary stone remote consultation center", "Chengdu complex urology consultation center", "Shenzhen international urology consultation center"],
  },
  endocrinology: {
    zh: ["上海内分泌代谢病协作中心", "北京甲状腺疾病远程会诊网络", "广州肥胖与代谢医学专家网络", "成都疑难内分泌疾病会诊中心", "深圳国际内分泌咨询中心"],
    en: ["Shanghai endocrinology and metabolism center", "Beijing thyroid disease remote consultation network", "Guangzhou obesity and metabolic medicine network", "Chengdu complex endocrinology consultation center", "Shenzhen international endocrinology consultation center"],
  },
  ophthalmology: {
    zh: ["上海眼科专科协作中心", "北京眼底病远程会诊网络", "广州青光眼专家协作中心", "成都疑难眼病会诊中心", "深圳国际眼科咨询中心"],
    en: ["Shanghai ophthalmology specialist collaboration center", "Beijing retinal disease remote consultation network", "Guangzhou glaucoma specialist collaboration center", "Chengdu complex eye disease consultation center", "Shenzhen international ophthalmology consultation center"],
  },
};

const SPECIALTY_ROSTER_PROFILES: Record<ExpertImageCategory, RosterProfile[]> = {
  oncology: [
    { zhName: "王建国", enName: "Wang Jianguo", years: 16, zhFocus: "肺癌与消化道肿瘤第二意见", enFocus: "Lung and GI cancer second opinions", zhBio: "长期参与胸部肿瘤和胃肠道肿瘤疑难病例评估，擅长把影像、病理和既往治疗记录整合成清晰的下一步方案。", enBio: "Reviews complex thoracic and gastrointestinal cancer cases by connecting imaging, pathology, treatment history, and practical next-step options." },
    { zhName: "刘美琳", enName: "Liu Meilin", years: 20, zhFocus: "乳腺与妇科肿瘤综合治疗", enFocus: "Breast and gynecologic oncology", zhBio: "专注乳腺癌、卵巢癌及复发病例系统治疗评估，帮助患者比较手术、放疗、化疗、靶向及免疫治疗选择。", enBio: "Focuses on breast, ovarian, and recurrent cancer cases, helping patients compare surgery, radiotherapy, systemic therapy, targeted treatment, and immunotherapy paths." },
    { zhName: "陈昊", enName: "Chen Hao", years: 8, zhFocus: "肝胆胰与胃肠肿瘤评估", enFocus: "Hepatobiliary and GI tumor review", zhBio: "擅长为消化系统肿瘤患者梳理检查结果和治疗记录，明确分期、基因检测和多学科讨论的优先级。", enBio: "Helps digestive-system cancer patients clarify staging, prior treatment records, molecular testing needs, and whether an MDT review is appropriate." },
    { zhName: "赵静", enName: "Zhao Jing", years: 24, zhFocus: "靶向与免疫治疗方案评估", enFocus: "Targeted and immunotherapy review", zhBio: "关注分子检测结果与临床治疗选择的匹配，适合需要比较免疫、靶向、放疗或临床研究可能性的患者。", enBio: "Connects molecular test results with treatment choices for patients comparing immunotherapy, targeted therapy, radiotherapy, or research options." },
    { zhName: "孙立民", enName: "Sun Limin", years: 15, zhFocus: "头颈部与胸部肿瘤会诊", enFocus: "Head-neck and thoracic tumor review", zhBio: "擅长把局部治疗和全身治疗放在同一张路径图中比较，帮助患者判断不同方案的目标、风险与时间窗口。", enBio: "Compares local and systemic treatment options in one pathway, clarifying goals, risks, and timing for patients facing major decisions." },
  ],
  cardiology: [
    { zhName: "李国华", enName: "Li Guohua", years: 26, zhFocus: "冠心病与支架术后方案评估", enFocus: "Coronary disease and post-stent review", zhBio: "擅长评估冠脉 CTA、造影报告、用药记录与既往介入治疗，帮助患者判断是否需要进一步检查或调整治疗策略。", enBio: "Reviews coronary CTA, angiography reports, medication history, and prior interventions to clarify whether further testing or treatment adjustment is needed." },
    { zhName: "周晓岚", enName: "Zhou Xiaolan", years: 16, zhFocus: "心律失常与房颤管理", enFocus: "Arrhythmia and atrial fibrillation care", zhBio: "关注心律失常、房颤、抗凝用药和消融术前评估，可协助患者整理心电图、Holter 与既往治疗信息。", enBio: "Focuses on arrhythmia, atrial fibrillation, anticoagulation, and pre-ablation review, organizing ECG, Holter, and treatment history for specialist discussion." },
    { zhName: "黄志远", enName: "Huang Zhiyuan", years: 9, zhFocus: "心衰与瓣膜病治疗路径", enFocus: "Heart failure and valve disease pathways", zhBio: "擅长把超声心动图、BNP、既往住院记录和药物方案放在一起评估，帮助患者理解保守、介入或手术选择。", enBio: "Combines echocardiography, BNP, hospitalization records, and medication plans to help patients understand conservative, interventional, or surgical options." },
    { zhName: "马成峰", enName: "Ma Chengfeng", years: 15, zhFocus: "高危心血管病例评估", enFocus: "High-risk cardiovascular case review", zhBio: "适合需要在重大手术前评估心脏风险、比较治疗选择或制定长期随访计划的国际患者。", enBio: "Supports international patients who need cardiac risk review before major procedures, treatment comparison, or a long-term follow-up plan." },
    { zhName: "沈嘉宁", enName: "Shen Jianing", years: 12, zhFocus: "高血压与代谢心血管风险管理", enFocus: "Hypertension and metabolic cardiac risk", zhBio: "擅长把血压记录、血脂血糖、肾功能和用药耐受性放在一起评估，为长期管理提供可执行建议。", enBio: "Reviews blood pressure logs, lipid and glucose data, kidney function, and medication tolerance to shape practical long-term management advice." },
  ],
  neurology: [
    { zhName: "许安然", enName: "Xu Anran", years: 10, zhFocus: "头痛、癫痫与睡眠障碍评估", enFocus: "Headache, epilepsy, and sleep disorder review", zhBio: "擅长整理脑 MRI、脑电图、既往用药和发作记录，帮助患者明确诊断方向、用药调整重点与下一步检查计划。", enBio: "Organizes brain MRI, EEG, medication history, and symptom timelines to clarify diagnostic direction, treatment priorities, and next-step testing." },
    { zhName: "顾清妍", enName: "Gu Qingyan", years: 17, zhFocus: "帕金森病与运动障碍第二意见", enFocus: "Parkinson's disease and movement disorder second opinions", zhBio: "关注帕金森病、震颤、肌张力障碍等运动障碍疾病，擅长结合病程、影像和药物反应评估下一步治疗选择。", enBio: "Focuses on Parkinson's disease, tremor, dystonia, and other movement disorders, connecting clinical course, imaging, and medication response to practical options." },
    { zhName: "林嘉明", enName: "Lin Jiaming", years: 15, zhFocus: "卒中后康复与复发风险评估", enFocus: "Post-stroke recovery and recurrence risk review", zhBio: "擅长为脑梗、短暂性脑缺血发作和脑血管狭窄患者梳理检查结果，明确二级预防、康复和复查重点。", enBio: "Helps stroke, TIA, and vascular stenosis patients organize reports and clarify secondary prevention, rehabilitation, and follow-up priorities." },
    { zhName: "邵文德", enName: "Shao Wende", years: 20, zhFocus: "周围神经病与神经免疫病例", enFocus: "Peripheral nerve and neuroimmunology cases", zhBio: "适合长期症状反复、诊断不清或检查结果复杂的患者，可协助比较神经免疫、代谢和周围神经病变的可能性。", enBio: "Supports patients with recurrent symptoms, unclear diagnoses, or complex findings by comparing neuroimmune, metabolic, and peripheral nerve possibilities." },
    { zhName: "唐若曦", enName: "Tang Ruoxi", years: 12, zhFocus: "头晕眩晕与认知问题评估", enFocus: "Dizziness, vertigo, and cognitive symptom review", zhBio: "擅长把症状时间线、影像、实验室检查和用药反应整理成清晰摘要，帮助患者理解需要优先处理的问题。", enBio: "Turns symptom timelines, imaging, lab results, and medication responses into concise summaries so patients can understand what should be addressed first." },
  ],
  orthopedics: [
    { zhName: "沈博文", enName: "Shen Bowen", years: 11, zhFocus: "肩膝关节与运动损伤评估", enFocus: "Shoulder, knee, and sports injury review", zhBio: "擅长结合 MRI、X 光和既往治疗记录，帮助患者比较保守治疗、关节镜手术和康复方案的适用性。", enBio: "Reviews MRI, X-ray, and prior treatment records to help patients compare conservative care, arthroscopic surgery, and rehabilitation options." },
    { zhName: "罗明轩", enName: "Luo Mingxuan", years: 12, zhFocus: "颈腰椎退变与椎间盘问题", enFocus: "Cervical and lumbar degeneration review", zhBio: "关注颈椎病、腰椎间盘突出、椎管狭窄等问题，帮助患者理解影像严重程度与症状之间的关系。", enBio: "Focuses on cervical spondylosis, lumbar disc herniation, and spinal stenosis, helping patients connect imaging severity with real symptoms." },
    { zhName: "周远航", enName: "Zhou Yuanhang", years: 24, zhFocus: "髋膝关节置换方案评估", enFocus: "Hip and knee replacement pathway review", zhBio: "适合需要比较关节置换时机、假体选择、翻修风险或术后康复计划的患者进行远程第二意见。", enBio: "Supports patients comparing joint replacement timing, implant choices, revision risks, and realistic postoperative rehabilitation plans." },
    { zhName: "范志强", enName: "Fan Zhiqiang", years: 17, zhFocus: "复杂骨折与创伤后畸形评估", enFocus: "Complex fracture and post-traumatic deformity review", zhBio: "擅长评估复杂骨折、陈旧性损伤和创伤后功能受限病例，帮助患者理解手术目标、风险和恢复周期。", enBio: "Reviews complex fractures, old injuries, and post-traumatic function limits so patients can understand surgical goals, risks, and recovery timelines." },
    { zhName: "孟晓云", enName: "Meng Xiaoyun", years: 14, zhFocus: "骨质疏松与慢性关节疼痛", enFocus: "Osteoporosis and chronic joint pain", zhBio: "专注慢性关节疼痛、骨质疏松相关骨折风险和术后康复管理，适合需要长期计划的国际患者。", enBio: "Focuses on chronic joint pain, osteoporosis-related fracture risk, and post-surgery rehabilitation management for patients who need a long-term plan." },
  ],
  reproductive: [
    { zhName: "何志峰", enName: "He Zhifeng", years: 11, zhFocus: "试管婴儿方案与促排评估", enFocus: "IVF protocol and ovarian stimulation review", zhBio: "擅长结合激素、AMH、B 超、既往促排和胚胎记录，帮助患者判断试管婴儿方案是否需要调整。", enBio: "Reviews hormones, AMH, ultrasound findings, previous stimulation cycles, and embryo records to clarify whether an IVF plan should be adjusted." },
    { zhName: "陈丽芳", enName: "Chen Lifang", years: 10, zhFocus: "卵巢功能与反复移植失败评估", enFocus: "Ovarian reserve and recurrent implantation failure review", zhBio: "关注卵巢储备下降、反复移植失败和高龄备孕病例，擅长把检查结果转化为清晰的下一周期策略。", enBio: "Focuses on diminished ovarian reserve, recurrent implantation failure, and advanced maternal age cases, turning records into practical next-cycle strategy questions." },
    { zhName: "郭雅雯", enName: "Guo Yawen", years: 8, zhFocus: "多囊卵巢与排卵障碍管理", enFocus: "PCOS and ovulation disorder management", zhBio: "擅长为月经不规律、多囊卵巢、排卵障碍和备孕时间较长的患者梳理检查重点与治疗路径。", enBio: "Helps patients with irregular cycles, PCOS, ovulation disorders, or prolonged time trying to conceive organize key tests and treatment pathways." },
    { zhName: "袁世杰", enName: "Yuan Shijie", years: 8, zhFocus: "男性因素不育评估", enFocus: "Male-factor infertility review", zhBio: "专注男性因素不育、精液质量异常和取精相关决策，帮助夫妇理解是否需要进一步男科或胚胎实验室评估。", enBio: "Focuses on male-factor infertility, abnormal semen parameters, and sperm retrieval decisions, clarifying when additional andrology or lab review is needed." },
    { zhName: "邓瑞华", enName: "Deng Ruihua", years: 9, zhFocus: "疑难生殖病例多学科评估", enFocus: "Complex fertility case MDT review", zhBio: "适合经历多次失败周期、胚胎质量不稳定或反复流产的患者，协助比较检查、用药和实验室策略。", enBio: "Supports patients after multiple failed cycles, unstable embryo quality, or recurrent pregnancy loss by comparing testing, medication, and lab strategy options." },
  ],
  "aesthetic-surgery": [
    { zhName: "林志诚", enName: "Lin Zhicheng", years: 18, zhFocus: "面部年轻化与轮廓方案评估", enFocus: "Facial rejuvenation and contour planning", zhBio: "擅长把面部比例、皮肤松弛、既往填充或手术记录纳入评估，帮助患者比较微创与手术方案。", enBio: "Evaluates facial proportions, skin laxity, and prior filler or surgery history to help patients compare minimally invasive and surgical options." },
    { zhName: "叶思敏", enName: "Ye Simin", years: 6, zhFocus: "眼鼻整形与术前设计", enFocus: "Eyelid and rhinoplasty pre-op design", zhBio: "关注东方眼鼻审美、疤痕风险和恢复期管理，可协助患者判断方案是否自然、稳定且符合个人面部条件。", enBio: "Focuses on Asian eyelid and nasal aesthetics, scar risk, and recovery planning so patients can assess whether a plan fits their facial structure." },
    { zhName: "韩俊", enName: "Han Jun", years: 18, zhFocus: "身体塑形与脂肪移植评估", enFocus: "Body contouring and fat grafting review", zhBio: "擅长比较吸脂、脂肪填充和皮肤收紧方案，帮助患者理解预期效果、恢复周期和二次调整可能性。", enBio: "Compares liposuction, fat grafting, and skin tightening options while clarifying realistic outcomes, recovery, and revision considerations." },
    { zhName: "蒋惠兰", enName: "Jiang Huilan", years: 8, zhFocus: "修复整形与复杂术后评估", enFocus: "Revision aesthetics and complex post-op review", zhBio: "适合既往整形效果不理想、存在不对称或疤痕问题的患者，协助判断修复时机和风险边界。", enBio: "Supports patients with unsatisfactory prior procedures, asymmetry, or scarring by clarifying revision timing, risks, and realistic limits." },
    { zhName: "邱泽宇", enName: "Qiu Zeyu", years: 7, zhFocus: "注射美容与综合抗衰计划", enFocus: "Injectables and integrated anti-aging plans", zhBio: "擅长为注射、光电和手术抗衰方案做阶段规划，帮助患者避免过度治疗并控制恢复时间。", enBio: "Plans staged injectable, device-based, and surgical anti-aging options to help patients avoid overtreatment and manage downtime." },
  ],
  "stem-cell-therapy": [
    { zhName: "陈启明", enName: "Chen Qiming", years: 6, zhFocus: "退行性疾病综合评估", enFocus: "Degenerative disease suitability review", zhBio: "擅长结合诊断、既往治疗、影像和功能状态，判断患者是否适合进一步了解再生医学或康复联合方案。", enBio: "Reviews diagnosis, prior treatments, imaging, and functional status to assess whether regenerative medicine or rehabilitation-linked options merit discussion." },
    { zhName: "吴雅婷", enName: "Wu Yating", years: 20, zhFocus: "慢病病历整理与风险沟通", enFocus: "Chronic case preparation and risk communication", zhBio: "关注患者安全、适应证边界和远程随访资料整理，帮助患者形成适合医生快速判断的病例摘要。", enBio: "Focuses on patient safety, indication boundaries, and follow-up record preparation, turning complex histories into specialist-ready summaries." },
    { zhName: "梁国栋", enName: "Liang Guodong", years: 12, zhFocus: "神经系统疾病功能评估", enFocus: "Neurologic function assessment", zhBio: "擅长为神经系统疾病患者整理功能评分、影像资料和康复记录，明确远程评估时需要回答的核心问题。", enBio: "Organizes functional scores, imaging, and rehabilitation records for neurologic cases so remote specialists can focus on the key clinical questions." },
    { zhName: "彭素梅", enName: "Peng Sumei", years: 13, zhFocus: "复杂病例多学科适应证评估", enFocus: "Complex case multidisciplinary suitability review", zhBio: "适合诊断复杂、既往治疗较多或存在多系统问题的患者，协助比较现有证据、潜在获益与风险控制。", enBio: "Supports complex cases with multiple prior treatments or multisystem issues by comparing available evidence, potential benefit, and risk controls." },
    { zhName: "宋景然", enName: "Song Jingran", years: 9, zhFocus: "治疗前资料审核与随访计划", enFocus: "Pre-treatment record review and follow-up planning", zhBio: "擅长把实验室检查、影像、用药和既往治疗时间线整理成结构化摘要，为远程问诊和后续随访做准备。", enBio: "Structures labs, imaging, medications, and treatment timelines into concise summaries for remote consultation and follow-up planning." },
  ],
  dentistry: [
    { zhName: "赵明远", enName: "Zhao Mingyuan", years: 22, zhFocus: "全口种植与咬合重建评估", enFocus: "Full-mouth implant and bite reconstruction review", zhBio: "擅长综合 CBCT、牙周状况和既往修复记录，帮助患者比较种植数量、骨增量和临时修复方案。", enBio: "Reviews CBCT, periodontal status, and prior restorations to compare implant count, bone augmentation, and provisional restoration options." },
    { zhName: "罗雅婷", enName: "Luo Yating", years: 12, zhFocus: "贴面与微笑设计", enFocus: "Veneers and smile design", zhBio: "关注牙色、牙形、牙龈线和面部比例，帮助患者判断贴面、冠修复或正畸联合方案是否合适。", enBio: "Focuses on tooth shade, shape, gum line, and facial proportion to compare veneers, crowns, or orthodontic-combined plans." },
    { zhName: "邓凯", enName: "Deng Kai", years: 9, zhFocus: "复杂拔牙与颌面外科评估", enFocus: "Complex extraction and oral surgery review", zhBio: "擅长判断阻生牙、囊肿、骨缺损及种植前外科处理的风险，为患者明确手术路径和恢复重点。", enBio: "Assesses impacted teeth, cysts, bone defects, and pre-implant surgical needs to clarify procedural pathways and recovery priorities." },
    { zhName: "秦慧敏", enName: "Qin Huimin", years: 22, zhFocus: "疑难修复与多学科口腔重建", enFocus: "Complex prosthodontic and multidisciplinary reconstruction", zhBio: "适合多颗缺失、咬合紊乱或既往修复失败的患者，协助比较阶段治疗、种植和固定修复策略。", enBio: "Supports patients with multiple missing teeth, bite collapse, or failed restorations by comparing staged care, implants, and fixed prosthetic strategies." },
    { zhName: "高子轩", enName: "Gao Zixuan", years: 9, zhFocus: "牙周治疗与长期维护计划", enFocus: "Periodontal care and long-term maintenance", zhBio: "擅长整理牙周袋深度、影像和洁治记录，帮助患者判断种植或修复前是否需要先控制炎症。", enBio: "Reviews periodontal charting, imaging, and cleaning history to clarify whether inflammation control is needed before implants or restorations." },
  ],
  pediatrics: [
    { zhName: "郑文涛", enName: "Zheng Wentao", years: 7, zhFocus: "儿童慢病与疑难症状评估", enFocus: "Pediatric chronic and complex symptom review", zhBio: "擅长把生长曲线、化验、影像和既往用药记录放在一起评估，帮助家庭明确下一步检查和转诊重点。", enBio: "Combines growth charts, labs, imaging, and medication history to help families clarify next tests and referral priorities." },
    { zhName: "冯晓宁", enName: "Feng Xiaoning", years: 6, zhFocus: "哮喘、过敏与反复感染管理", enFocus: "Asthma, allergy, and recurrent infection care", zhBio: "关注反复咳喘、过敏原检测和长期用药安全，帮助家长理解急性发作与长期控制计划。", enBio: "Focuses on recurrent wheeze, allergy testing, and long-term medication safety, helping parents distinguish acute care from control plans." },
    { zhName: "钱昊", enName: "Qian Hao", years: 9, zhFocus: "发育迟缓与神经行为问题", enFocus: "Developmental delay and neurobehavioral review", zhBio: "擅长整理发育评估、康复记录和学校反馈，帮助家庭判断是否需要进一步神经、遗传或康复评估。", enBio: "Reviews developmental assessments, therapy records, and school feedback to clarify whether neurologic, genetic, or rehabilitation review is needed." },
    { zhName: "陆雅琴", enName: "Lu Yaqin", years: 13, zhFocus: "儿童疑难病多学科会诊", enFocus: "Pediatric complex disease MDT review", zhBio: "适合诊断不清、症状跨系统或多次治疗效果有限的儿童病例，协助梳理病史并制定分层检查计划。", enBio: "Supports unclear, multisystem, or treatment-resistant pediatric cases by organizing history and building a staged diagnostic plan." },
    { zhName: "曹睿", enName: "Cao Rui", years: 6, zhFocus: "儿童消化与营养问题评估", enFocus: "Pediatric digestive and nutrition review", zhBio: "擅长整理喂养、体重增长、腹痛腹泻和过敏相关资料，帮助家庭明确营养、消化或免疫方向。", enBio: "Organizes feeding, weight gain, abdominal pain, diarrhea, and allergy records to clarify nutrition, digestive, or immune-related directions." },
  ],
  urology: [
    { zhName: "胡志强", enName: "Hu Zhiqiang", years: 23, zhFocus: "前列腺疾病与泌尿肿瘤评估", enFocus: "Prostate disease and urologic oncology review", zhBio: "擅长结合 PSA、MRI、病理和既往治疗记录，帮助患者比较活检、手术、放疗或随访策略。", enBio: "Reviews PSA, MRI, pathology, and prior treatment records to compare biopsy, surgery, radiotherapy, or surveillance strategies." },
    { zhName: "宋婉清", enName: "Song Wanqing", years: 15, zhFocus: "女性泌尿与盆底功能障碍", enFocus: "Female urology and pelvic floor dysfunction", zhBio: "关注尿失禁、反复尿路感染和盆底功能问题，帮助患者理解保守、药物和手术治疗路径。", enBio: "Focuses on urinary incontinence, recurrent UTI, and pelvic floor issues, helping patients compare conservative, medication, and surgical care." },
    { zhName: "徐凯", enName: "Xu Kai", years: 7, zhFocus: "复杂结石与微创手术路径", enFocus: "Complex stone disease and minimally invasive pathways", zhBio: "擅长根据 CT、结石位置、肾功能和感染风险判断体外碎石、输尿管镜或经皮肾镜方案。", enBio: "Uses CT, stone location, kidney function, and infection risk to compare shockwave, ureteroscopic, or percutaneous approaches." },
    { zhName: "姚明德", enName: "Yao Mingde", years: 15, zhFocus: "复杂泌尿重建与术后问题评估", enFocus: "Complex urologic reconstruction and post-op review", zhBio: "适合既往手术后恢复不佳、狭窄、功能障碍或复发问题患者，协助判断二次评估和修复可能性。", enBio: "Supports patients with poor recovery, strictures, dysfunction, or recurrence after prior procedures by clarifying re-evaluation and revision options." },
    { zhName: "贺景晨", enName: "He Jingchen", years: 7, zhFocus: "男科与排尿功能评估", enFocus: "Andrology and voiding function review", zhBio: "擅长整理症状评分、尿流率、激素和用药记录，帮助患者明确是否需要进一步男科或功能检查。", enBio: "Reviews symptom scores, uroflow, hormone data, and medication history to clarify whether additional andrology or functional testing is needed." },
  ],
  endocrinology: [
    { zhName: "张瑞平", enName: "Zhang Ruiping", years: 22, zhFocus: "糖尿病与复杂代谢管理", enFocus: "Diabetes and complex metabolic management", zhBio: "擅长把血糖记录、并发症筛查、体重和用药耐受性放在一起评估，帮助患者制定长期管理重点。", enBio: "Combines glucose logs, complication screening, weight history, and medication tolerance to shape long-term management priorities." },
    { zhName: "何晓梅", enName: "He Xiaomei", years: 5, zhFocus: "甲状腺结节与功能异常评估", enFocus: "Thyroid nodules and dysfunction review", zhBio: "关注超声、穿刺结果、甲功和抗体变化，帮助患者判断随访、药物、消融或手术路径。", enBio: "Reviews ultrasound, biopsy, thyroid function, and antibody trends to compare follow-up, medication, ablation, or surgery pathways." },
    { zhName: "傅天成", enName: "Fu Tiancheng", years: 15, zhFocus: "肥胖、脂肪肝与胰岛素抵抗", enFocus: "Obesity, fatty liver, and insulin resistance", zhBio: "擅长整合体重史、肝功能、血脂血糖和生活方式因素，评估药物、营养和手术前后的管理方案。", enBio: "Integrates weight history, liver function, lipids, glucose, and lifestyle factors to review medication, nutrition, and peri-surgical management options." },
    { zhName: "梁静", enName: "Liang Jing", years: 18, zhFocus: "垂体、肾上腺与疑难内分泌病", enFocus: "Pituitary, adrenal, and complex endocrine disease", zhBio: "适合激素结果复杂、症状不典型或诊断不清的患者，协助判断是否需要动态试验、影像或多学科评估。", enBio: "Supports patients with complex hormone results, atypical symptoms, or unclear diagnoses by clarifying dynamic testing, imaging, or MDT needs." },
    { zhName: "戴子涵", enName: "Dai Zihan", years: 9, zhFocus: "多囊卵巢与代谢风险评估", enFocus: "PCOS and metabolic risk review", zhBio: "擅长整理月经、激素、体重和代谢指标，为备孕、减重或长期内分泌管理提供下一步建议。", enBio: "Organizes menstrual history, hormones, weight, and metabolic markers to guide fertility planning, weight care, or long-term endocrine management." },
  ],
  ophthalmology: [
    { zhName: "袁光明", enName: "Yuan Guangming", years: 15, zhFocus: "白内障与复杂屈光问题", enFocus: "Cataract and complex refractive review", zhBio: "擅长结合验光、眼轴、角膜地形图和既往手术记录，帮助患者比较晶体、激光或联合治疗方案。", enBio: "Reviews refraction, axial length, corneal topography, and prior surgery history to compare lens, laser, or combined treatment options." },
    { zhName: "苏婉婷", enName: "Su Wanting", years: 6, zhFocus: "眼底病与糖尿病视网膜病变", enFocus: "Retinal disease and diabetic retinopathy", zhBio: "关注 OCT、眼底照相、荧光造影和全身代谢控制，帮助患者判断注射、激光或随访策略。", enBio: "Uses OCT, fundus imaging, angiography, and systemic metabolic control data to compare injection, laser, or monitoring strategies." },
    { zhName: "蒋一鸣", enName: "Jiang Yiming", years: 17, zhFocus: "青光眼与视神经损伤评估", enFocus: "Glaucoma and optic nerve damage review", zhBio: "擅长分析眼压曲线、视野、OCT 和用药反应，帮助患者理解药物、激光和手术控制目标。", enBio: "Analyzes pressure trends, visual fields, OCT, and medication response to clarify medication, laser, and surgery control targets." },
    { zhName: "侯美兰", enName: "Hou Meilan", years: 5, zhFocus: "复杂眼病多学科第二意见", enFocus: "Complex ophthalmic second opinions", zhBio: "适合多次治疗效果有限、合并全身疾病或诊断存在分歧的眼病患者，协助梳理证据和治疗优先级。", enBio: "Supports patients with limited treatment response, systemic disease overlap, or diagnostic disagreement by organizing evidence and treatment priorities." },
    { zhName: "丁泽宇", enName: "Ding Zeyu", years: 10, zhFocus: "干眼、角膜与术后不适评估", enFocus: "Dry eye, cornea, and post-op discomfort review", zhBio: "擅长整理角膜检查、泪膜评估和术后症状时间线，帮助患者明确需要优先处理的表面疾病问题。", enBio: "Reviews corneal tests, tear film data, and post-op symptom timelines to clarify ocular surface issues that should be addressed first." },
  ],
};

function getRosterTitle(profile: RosterProfile, locale: Locale): { title: string; displayName: string } {
  const isZh = locale === "zh";
  const isSenior = profile.years >= 28;
  const isChief = profile.years >= 18;

  if (isZh) {
    return {
      title: isSenior ? "教授 / 主任医师" : isChief ? "主任医师" : "副主任医师",
      displayName: `${profile.zhName}${isSenior ? "教授" : isChief ? "主任医师" : "副主任医师"}`,
    };
  }

  return {
    title: isSenior ? "Professor / Chief Physician" : isChief ? "Chief Physician" : "Associate Chief Physician",
    displayName: `${isSenior ? "Prof." : "Dr."} ${profile.enName}`,
  };
}

function buildExpertRoster(specialty: string, locale: Locale): ExpertCard[] {
  const category = getRosterCategory(specialty);
  const roster = SPECIALTY_ROSTER_PROFILES[category];
  const hospitals = CATEGORY_HOSPITALS[category];
  const isZh = locale === "zh";

  return roster.map((profile, index) => {
    const { title, displayName } = getRosterTitle(profile, locale);

    return {
      name: displayName,
      title,
      specialty,
      hospital: isZh ? hospitals.zh[index] : hospitals.en[index],
      credentials: isZh
        ? [`${profile.years}+ 年临床经验`, profile.zhFocus, "三甲医院专家"]
        : [`${profile.years}+ years clinical experience`, profile.enFocus, "Tertiary hospital specialist"],
      tags: isZh ? ["书面审阅", "视频问诊", "英文支持"] : ["Written review", "Video consult", "English support"],
      bio: isZh ? profile.zhBio : profile.enBio,
      image: `${category}-${index + 1}`,
      imageAlt: isZh ? `${specialty}中国专科医生代表头像` : `Representative Chinese ${specialty} specialist portrait`,
      featured: index === 1,
    };
  });
}

function SectionHeader({
  label,
  title,
  body,
  centered = true,
}: {
  label?: string;
  title: string;
  body?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto mb-10 max-w-3xl text-center sm:mb-12" : "mb-10 max-w-3xl sm:mb-12"}>
      {label ? (
        <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.2em] text-[#1DA78A] sm:text-sm">
          {label}
        </span>
      ) : null}
      <h2 className="text-2xl font-bold leading-tight text-[#003B5C] sm:text-3xl md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {body ? <p className="mt-4 text-sm leading-relaxed text-gray-500 sm:text-base md:text-lg">{body}</p> : null}
    </div>
  );
}

function PrimaryLink({ to = CTA_HREF, children }: { to?: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center rounded-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-700/10 transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
    >
      {children}
      <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-2 h-4 w-4">
        <path d="M7 17 17 7M9 7h8v8" className="fill-none stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
          <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#1DA78A]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function VisualPanel({ variant = "report" }: { variant?: "report" | "video" | "tumor" | "hospital" }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1DA78A]/10 via-transparent to-[#0F638E]/10" />
      <div className="relative p-5 sm:p-6">
        <div className="rounded-2xl bg-[#F0F4F3] p-4">
          {variant === "video" ? (
            <div className="grid grid-cols-[1.1fr_0.9fr] gap-4">
              <div className="rounded-xl bg-[#0F638E] p-4">
                <div className="h-24 rounded-lg bg-white/25" />
                <div className="mt-4 space-y-2">
                  <span className="block h-2 rounded-full bg-white/60" />
                  <span className="block h-2 w-3/4 rounded-full bg-white/30" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="aspect-square rounded-xl bg-white" />
                <div className="h-16 rounded-xl bg-white" />
              </div>
            </div>
          ) : variant === "tumor" ? (
            <div className="grid grid-cols-[0.9fr_1.1fr] gap-4">
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl bg-white p-3">
                    <span className="h-8 w-8 rounded-full bg-[#1DA78A]/15" />
                    <span className="h-2 flex-1 rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-[#003B5C] p-4">
                <div className="grid grid-cols-2 gap-3">
                  <span className="aspect-square rounded-lg bg-white/20" />
                  <span className="aspect-square rounded-lg bg-[#1DA78A]/40" />
                  <span className="col-span-2 h-16 rounded-lg bg-white/15" />
                </div>
              </div>
            </div>
          ) : variant === "hospital" ? (
            <div className="h-56 rounded-xl bg-[#003B5C] p-5">
              <div className="grid h-full grid-cols-5 gap-2">
                {Array.from({ length: 20 }).map((_, index) => (
                  <span key={index} className="rounded bg-white/15" />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[1.2fr_0.8fr] gap-4">
              <div className="rounded-xl bg-white p-5">
                <span className="block h-3 w-36 rounded-full bg-[#0F638E]/25" />
                <span className="mt-5 block h-2.5 rounded-full bg-slate-200" />
                <span className="mt-3 block h-2.5 w-5/6 rounded-full bg-slate-200" />
                <span className="mt-3 block h-2.5 w-2/3 rounded-full bg-slate-200" />
                <div className="mt-6 grid grid-cols-3 gap-2">
                  <span className="h-14 rounded-lg bg-[#1DA78A]/12" />
                  <span className="h-14 rounded-lg bg-[#0F638E]/12" />
                  <span className="h-14 rounded-lg bg-[#1DA78A]/12" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="aspect-square rounded-xl bg-[#003B5C]" />
                <div className="h-16 rounded-xl bg-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, body, index }: { title: string; body: string; index: number }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E] text-sm font-bold text-white">
        {String(index + 1).padStart(2, "0")}
      </div>
      <h3 className="text-lg font-bold text-[#003B5C]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-gray-500">{body}</p>
    </div>
  );
}

function PlanVisual({ variant }: { variant: ModalVisualVariant }) {
  const image = PLAN_IMAGES[variant];

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#F0F4F3]">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#003B5C]/35 via-transparent to-transparent" />
    </div>
  );
}

function ExpertCardView({ expert, cta, featuredLabel }: { expert: ExpertCard; cta: string; featuredLabel: string }) {
  const image = EXPERT_IMAGES[expert.image] ?? expert.image;

  return (
    <article className={`group relative flex min-h-[390px] overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 hover:-translate-y-1 ${expert.featured ? "ring-2 ring-[#1DA78A]/55" : ""}`}>
      {expert.featured && (
        <div className="absolute right-0 top-0 z-20 rounded-bl-2xl bg-gradient-to-r from-[#1DA78A] to-[#0F638E] px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-teal-800/10">
          {featuredLabel}
        </div>
      )}
      <div className="absolute left-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F7F3] text-[#1DA78A] shadow-sm">
        <ShieldCheck className="h-[18px] w-[18px]" />
      </div>
      <div className="grid w-full grid-cols-1 sm:grid-cols-[0.92fr_1.08fr]">
        <div className="relative aspect-[0.92/1] min-h-[240px] overflow-hidden bg-[#F0F4F3] sm:aspect-auto sm:min-h-full">
          <img src={image} alt={expert.imageAlt} loading="lazy" decoding="async" className="h-full w-full object-cover object-[center_18%] transition-transform duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/15 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-white/10 sm:to-white" />
        </div>
        <div className="flex flex-col p-5 sm:p-6">
          <div>
            <h3 className="text-xl font-bold leading-tight text-[#003B5C]">{expert.name}</h3>
            <p className="mt-1.5 text-sm font-semibold text-[#1DA78A]">{expert.specialty}</p>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">{expert.hospital}</p>
          </div>

          <div className="mt-4 space-y-2">
            {expert.credentials.map((credential, index) => {
              const Icon = index === 0 ? Clock3 : index === 1 ? UserRoundCheck : Stethoscope;
              return (
                <div key={credential} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <Icon className="h-3.5 w-3.5 flex-none text-slate-400" />
                  <span>{credential}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {expert.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[#F0F4F3] px-2.5 py-1 text-[11px] font-semibold text-[#0F638E]">
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-600">{expert.bio}</p>

          <Link
            to={CTA_HREF}
            className={`mt-auto inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-300 active:scale-[0.98] ${expert.featured ? "bg-gradient-to-r from-[#1DA78A] to-[#0F638E] text-white shadow-lg shadow-teal-700/10 hover:opacity-90" : "border border-[#1DA78A]/45 text-[#0F638E] hover:bg-[#F0F4F3]"}`}
          >
            {cta}
          </Link>
        </div>
      </div>
    </article>
  );
}

function CustomExpertMatchCard({ title, body, cta }: { title: string; body: string; cta: string }) {
  return (
    <article className="flex min-h-[390px] flex-col justify-between rounded-2xl border border-dashed border-[#1DA78A]/45 bg-white/90 p-6 shadow-card">
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F7F3] text-[#1DA78A]">
          <Languages className="h-6 w-6" />
        </div>
        <h3 className="mt-6 text-xl font-bold leading-tight text-[#003B5C]">{title}</h3>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{body}</p>
      </div>
      <Link
        to={CTA_HREF}
        className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-700/10 transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
      >
        {cta}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </article>
  );
}

function ExpertShowcaseSection({ showcase, locale }: { showcase: PageCopy["expertShowcase"]; locale: Locale }) {
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const [selectedTab, setSelectedTab] = useState(showcase.tabs[0]);
  const visibleTabs = showMoreTabs ? [...showcase.tabs, ...showcase.moreTabs] : showcase.tabs;
  const roster = buildExpertRoster(selectedTab, locale);

  useEffect(() => {
    setSelectedTab(showcase.tabs[0]);
    setShowMoreTabs(false);
  }, [showcase]);

  return (
    <section className="relative overflow-hidden bg-[#F7FAF9] py-12 sm:py-16 md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(29,167,138,0.12),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(15,99,142,0.1),transparent_30%)]" />
      <div className="relative mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 2xl:px-10">
        <SectionHeader label={showcase.label} title={showcase.title} body={showcase.body} />

        <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-3">
          {visibleTabs.map((tab, index) => (
            <button
              key={tab}
              className={`min-w-[128px] rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition-all duration-300 active:scale-[0.98] ${selectedTab === tab ? "bg-gradient-to-r from-[#1DA78A] to-[#0F638E] text-white shadow-teal-700/10" : "bg-white text-slate-600 hover:text-[#0F638E]"}`}
              type="button"
              onClick={() => setSelectedTab(tab)}
              aria-pressed={selectedTab === tab}
            >
              {tab}
            </button>
          ))}
          <button
            className="min-w-[128px] rounded-full border border-[#1DA78A]/30 bg-white px-5 py-3 text-sm font-semibold text-[#0F638E] shadow-sm transition-all duration-300 hover:border-[#1DA78A]/60 hover:bg-[#E8F7F3] active:scale-[0.98]"
            type="button"
            onClick={() => setShowMoreTabs((current) => !current)}
            aria-expanded={showMoreTabs}
          >
            {showMoreTabs ? showcase.collapseLabel : showcase.moreLabel}
          </button>
        </div>

        <div className="mx-auto mt-10 grid max-w-[1500px] gap-6 xl:grid-cols-3 2xl:gap-7">
          {roster.map((expert, index) => (
            <ScrollReveal key={expert.name} direction="up" delay={index * 0.06}>
              <ExpertCardView expert={expert} cta={showcase.expertCta} featuredLabel={showcase.featuredLabel} />
            </ScrollReveal>
          ))}
          <ScrollReveal direction="up" delay={0.36}>
            <CustomExpertMatchCard title={showcase.customTitle} body={showcase.customBody} cta={showcase.customCta} />
          </ScrollReveal>
        </div>

        <div className="mx-auto mt-10 flex max-w-5xl flex-col items-center justify-between gap-5 rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-card sm:flex-row sm:px-8">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#E8F7F3] text-[#1DA78A]">
              <Languages className="h-6 w-6" />
            </span>
            <p className="text-base font-semibold leading-relaxed text-[#003B5C]">{showcase.matchPrompt}</p>
          </div>
          <Link
            to={CTA_HREF}
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-700/10 transition-all duration-300 hover:opacity-90 active:scale-[0.98] sm:w-auto"
          >
            {showcase.matchCta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ModalHeroImage({ variant, alt }: { variant: ModalVisualVariant; alt: string }) {
  const image = PLAN_IMAGES[variant];

  return (
    <div className="relative h-60 overflow-hidden rounded-t-2xl sm:h-80">
      <img src={image} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#003B5C]/45 via-transparent to-transparent" />
    </div>
  );
}

function ModalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-[#0F638E]">{title}</h4>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function PlanCard({ plan, featured, locale }: { plan: Plan; featured?: boolean; locale: Locale }) {
  const price = formatPlanPrice(plan.priceUsd, locale);

  return (
    <Dialog>
      <div className={`group flex h-full flex-col rounded-2xl bg-white p-3 shadow-card ${featured ? "ring-2 ring-[#1DA78A]/40" : ""}`}>
        <PlanVisual variant={plan.variant} />
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center justify-between gap-3">
            <span className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${featured ? "bg-[#1DA78A] text-white" : "bg-[#F0F4F3] text-[#0F638E]"}`}>
              {plan.badge}
            </span>
            <span className="text-lg font-bold text-[#003B5C]">{price}</span>
          </div>
          <h3 className="mt-5 text-2xl font-bold leading-tight text-[#003B5C]">{plan.title}</h3>
          <div className="mt-5 flex flex-wrap gap-2">
            {plan.chips.map((chip) => (
              <span key={chip} className="rounded-full bg-[#F0F4F3] px-3 py-1.5 text-xs font-semibold text-slate-600">
                {chip}
              </span>
            ))}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-3 pt-7">
            <DialogTrigger asChild>
              <button className="rounded-full bg-gradient-to-r from-[#1DA78A] to-[#0F638E] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-700/10 transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:opacity-90 active:scale-[0.98]">
                {plan.cta}
              </button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <button className="rounded-full bg-[#F0F4F3] px-4 py-3 text-sm font-semibold text-[#003B5C] transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-[#E4ECEA] active:scale-[0.98]">
                {plan.detailsCta}
              </button>
            </DialogTrigger>
          </div>
        </div>
      </div>

      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto border-0 bg-white p-0 shadow-2xl shadow-slate-900/20 sm:rounded-2xl">
        <ModalHeroImage variant={plan.variant} alt={plan.modal.imageAlt} />
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
          <div>
            <DialogTitle className="text-2xl font-bold leading-tight text-[#003B5C] sm:text-3xl">
              {plan.modal.title}
            </DialogTitle>
            <DialogDescription className="mt-4 text-base leading-relaxed text-slate-600">
              {plan.modal.body}
            </DialogDescription>
            <div className="mt-6 rounded-2xl bg-[#F0F4F3] p-5">
              <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-[#0F638E]">{plan.modal.bestForLabel}</h4>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{plan.modal.bestFor}</p>
            </div>
            <div className="mt-6">
              <PrimaryLink>{plan.modal.cta}</PrimaryLink>
            </div>
          </div>
          <div className="space-y-6">
            <ModalSection title={plan.modal.receiveLabel}>
              <BulletList items={plan.modal.receive} />
            </ModalSection>
            <ModalSection title={plan.modal.processLabel}>
              <ol className="space-y-3">
                {plan.modal.process.map((item, index) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-600">
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#1DA78A] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </ModalSection>
            <div className="rounded-2xl bg-[#003B5C] p-5 text-white">
              <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">{plan.modal.turnaroundLabel}</h4>
              <p className="mt-3 text-sm leading-relaxed text-white/85">{plan.modal.turnaround}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ComparisonDialog({ comparison }: { comparison: PageCopy["comparison"] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center rounded-full bg-[#F0F4F3] px-6 py-3 text-sm font-semibold text-[#003B5C] shadow-lg shadow-slate-900/5 transition-all duration-300 hover:bg-[#E4ECEA] active:scale-[0.98]">
          {comparison.cta}
          <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-2 h-4 w-4">
            <path d="M4 7h16M4 12h16M4 17h16" className="fill-none stroke-current stroke-[1.8]" strokeLinecap="round" />
          </svg>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto border-0 bg-white p-0 shadow-2xl shadow-slate-900/20 sm:rounded-2xl">
        <div className="border-b border-slate-100 bg-[#F0F4F3] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0F638E]">{comparison.label}</p>
          <DialogTitle className="mt-3 text-2xl font-bold leading-tight text-[#003B5C] sm:text-3xl">
            {comparison.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {comparison.a11yDescription}
          </DialogDescription>
        </div>
        <div className="p-4 sm:p-6">
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-gradient-to-r from-[#1DA78A] to-[#0F638E] text-white">
                  <tr>
                    {comparison.headers.map((head) => (
                      <th key={head} className="px-5 py-4 font-semibold">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparison.rows.map((row) => (
                    <tr key={row[0]} className="hover:bg-[#F0F4F3]/55">
                      {row.map((cell, index) => (
                        <td key={`${row[0]}-${index}`} className={index === 0 ? "px-5 py-4 font-semibold text-[#003B5C]" : "px-5 py-4 text-slate-600"}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TelemedicinePage() {
  const { currentLanguage } = useLanguage();
  const copy = getTelemedicineCopy(currentLanguage.code);
  const locale = getTelemedicineLocale(currentLanguage.code);

  useEffect(() => {
    const metadata = getStaticPageMetadata("telemedicine", currentLanguage.code);
    setPageSeo({
      title: metadata.locale.title,
      description: metadata.locale.description,
      path: metadata.path,
      availableLocales: metadata.indexableLocales,
    });
  }, [currentLanguage.code]);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <main>
        <section className="relative mt-[112px] flex min-h-[360px] flex-col justify-center overflow-hidden sm:mt-[120px] md:min-h-[430px] lg:min-h-[520px]">
          <div className="absolute inset-0">
            <img src={consultationDoctorImage} alt={copy.hero.imageAlt} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-white/70" />
            <div className="absolute inset-y-0 left-0 w-[62%] bg-gradient-to-r from-white via-white/90 to-transparent" />
          </div>

          <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#0F638E] sm:text-sm">{copy.hero.label}</p>
              <h1 className="text-2xl font-bold leading-tight text-[#003B5C] sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem]">
                {copy.hero.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#003B5C] sm:text-base md:text-lg">{copy.hero.subtitle}</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{copy.hero.support}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <PrimaryLink>{copy.hero.primaryCta}</PrimaryLink>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-10 sm:py-12 md:py-16">
          <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {copy.trust.map(([title, body], index) => (
              <InfoCard key={title} title={title} body={body} index={index} />
            ))}
          </div>
        </section>

        <ExpertShowcaseSection showcase={copy.expertShowcase} locale={locale} />

        <section id="review-options" className="bg-white py-12 sm:py-16 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader label={copy.review.label} title={copy.review.title} body={copy.review.body} />
            <div className="grid gap-6 lg:grid-cols-3">
              {copy.review.plans.map((plan, index) => (
                <ScrollReveal key={plan.title} direction="up" delay={index * 0.06}>
                  <PlanCard plan={plan} featured={index === 1} locale={locale} />
                </ScrollReveal>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <ComparisonDialog comparison={copy.comparison} />
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader label={copy.process.label} title={copy.process.title} />
            <div className="space-y-6">
              {copy.process.steps.map(([title, body], index) => {
                const stepNumber = String(index + 1).padStart(2, "0");
                return (
                  <ScrollReveal key={title} direction="up" delay={index * 0.04}>
                    <div className="grid items-center gap-6 rounded-2xl bg-[#F0F4F3] p-5 sm:p-6 md:grid-cols-[0.74fr_1.26fr]">
                      <div className="relative aspect-[5/3] overflow-hidden rounded-2xl bg-white shadow-card">
                        <img
                          src={PROCESS_IMAGES[index]}
                          alt={title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#003B5C]/45 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-sm font-bold text-[#0F638E] shadow-lg shadow-slate-900/10">
                          {stepNumber}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-[#0F638E]">
                          {copy.process.stepLabel} {index + 1}
                        </p>
                        <h3 className="text-xl font-bold text-[#003B5C] sm:text-2xl">{title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{body}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader label={copy.notice.label} title={copy.notice.title} body={copy.notice.body} />
            <div className="grid gap-5 md:grid-cols-3">
              {copy.notice.items.map(([title, body], index) => (
                <InfoCard key={title} title={title} body={body} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F0F4F3] py-12 sm:py-16 md:py-20">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <SectionHeader label={copy.faq.label} title={copy.faq.title} />
            <div className="space-y-4">
              {copy.faq.items.map(([question, answer]) => (
                <details key={question} className="rounded-2xl bg-white px-6 py-5 shadow-card">
                  <summary className="cursor-pointer text-base font-semibold text-[#003B5C] sm:text-lg">{question}</summary>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-8 overflow-hidden rounded-2xl bg-[#F0F4F3] p-6 sm:p-8 lg:grid-cols-[1fr_0.82fr] lg:p-10">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#0F638E]">{copy.finalCta.label}</p>
                <h2 className="text-2xl font-bold leading-tight text-[#003B5C] sm:text-3xl md:text-4xl">{copy.finalCta.title}</h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{copy.finalCta.body}</p>
                <div className="mt-6">
                  <PrimaryLink>{copy.finalCta.cta}</PrimaryLink>
                </div>
                <p className="mt-4 text-sm text-slate-500">{copy.finalCta.note}</p>
              </div>
              <VisualPanel variant="video" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

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

TELEMEDICINE_COPY.es.faq.items = [
  ["¿Es un diagnóstico en línea?", "No. Es una revisión de registros médicos y segunda opinión basada en la información que usted proporciona."],
  ["¿Qué opción debo elegir?", "Elija revisión escrita para un informe, consulta por video para hablar con un especialista o revisión multidisciplinaria para casos complejos."],
  ["¿Puedo empezar con revisión escrita y ampliar después?", "Sí. Muchos pacientes empiezan con una revisión escrita y luego solicitan video o revisión adicional."],
  ["¿Qué registros necesito?", "Informes diagnósticos, imágenes, patología, análisis, alta hospitalaria, historial de tratamiento, medicamentos y plan actual."],
  ["¿Cuánto tarda?", "La revisión escrita suele tardar 48-72 horas; el video 3-5 días hábiles; la revisión compleja 5-7 días hábiles."],
  ["¿Tengo que viajar a China?", "No. La segunda opinión es remota. Si su caso es adecuado, Medora puede ayudarle a explorar tratamiento en China."],
];
TELEMEDICINE_COPY.fr.faq.items = [
  ["Est-ce un diagnostic en ligne ?", "Non. C'est une revue de dossier et un deuxième avis basé sur les informations fournies."],
  ["Quelle option choisir ?", "Choisissez l'avis écrit pour un rapport, la vidéo pour parler à un spécialiste ou la revue multidisciplinaire pour les cas complexes."],
  ["Puis-je commencer par un avis écrit puis évoluer ?", "Oui. De nombreux patients commencent par un avis écrit puis demandent une vidéo ou une revue supplémentaire."],
  ["Quels dossiers faut-il ?", "Diagnostics, imagerie, pathologie, analyses, compte rendu de sortie, historique de traitement, médicaments et plan actuel."],
  ["Combien de temps faut-il ?", "L'avis écrit prend souvent 48-72 heures ; la vidéo 3-5 jours ouvrés ; la revue complexe 5-7 jours ouvrés."],
  ["Dois-je voyager en Chine ?", "Non. Le deuxième avis est à distance. Si votre cas s'y prête, Medora peut aider à explorer un traitement en Chine."],
];
TELEMEDICINE_COPY.de.faq.items = [
  ["Ist das eine Online-Diagnose?", "Nein. Es handelt sich um eine Unterlagenprüfung und Zweitmeinung auf Basis der bereitgestellten Informationen."],
  ["Welche Option soll ich wählen?", "Wählen Sie die schriftliche Prüfung für einen Bericht, Video für ein Gespräch oder multidisziplinär für komplexe Fälle."],
  ["Kann ich mit schriftlicher Prüfung starten und später erweitern?", "Ja. Viele Patienten starten schriftlich und fragen danach Video oder weitere Fachprüfung an."],
  ["Welche Unterlagen brauche ich?", "Diagnoseberichte, Bildgebung, Pathologie, Labor, Entlassungsberichte, Therapieverlauf, Medikamente und aktueller Plan."],
  ["Wie lange dauert es?", "Schriftlich meist 48-72 Stunden; Video 3-5 Werktage; komplexe Prüfung 5-7 Werktage."],
  ["Muss ich nach China reisen?", "Nein. Die Zweitmeinung ist remote. Wenn passend, hilft Medora bei der Prüfung von Behandlungsoptionen in China."],
];
TELEMEDICINE_COPY.ru.faq.items = [
  ["Это онлайн-диагноз?", "Нет. Это обзор медицинских документов и второе мнение на основе предоставленной информации."],
  ["Какой вариант выбрать?", "Выберите письменный обзор для отчета, видео для разговора со специалистом или междисциплинарный обзор для сложных случаев."],
  ["Можно начать с письменного обзора и потом расширить?", "Да. Многие пациенты начинают с письменного обзора, затем запрашивают видео или дополнительный обзор."],
  ["Какие документы нужны?", "Диагнозы, снимки, патология, анализы, выписки, история лечения, список лекарств и текущий план."],
  ["Сколько это занимает?", "Письменный обзор обычно 48-72 часа; видео 3-5 рабочих дней; сложный обзор 5-7 рабочих дней."],
  ["Нужно ли ехать в Китай?", "Нет. Второе мнение удаленное. Если случай подходит, Medora поможет рассмотреть лечение в Китае."],
];

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

function buildExpertRoster(specialty: string, locale: Locale): ExpertCard[] {
  const category = getRosterCategory(specialty);
  const experienceYears = [12, 16, 20, 24, 28];

  if (locale === "zh") {
    const names = ["周远航教授", "林嘉明主任医师", "许安然副主任医师", "沈博文主任医师", "顾清妍教授"];
    const titles = ["教授 / 主任医师", "主任医师", "副主任医师", "主任医师", "教授 / 主任医师"];
    const hospitals = ["上海三甲医院专家网络", "北京专科医学中心", "广州高校附属医院专家网络", "成都区域医学中心", "杭州国际医疗协作中心"];
    const focus = ["疑难病例第二意见", "复杂治疗路径评估", "手术与非手术方案比较", "跨学科病例讨论", "长期治疗计划优化"];

    return names.map((name, index) => ({
      name,
      title: titles[index],
      specialty,
      hospital: hospitals[index],
      credentials: [`${experienceYears[index]}+ 年临床经验`, focus[index], "三甲医院专家"],
      tags: ["书面审阅", "视频问诊", "英文支持"],
      bio: `专注${specialty}相关复杂病例评估，可协助患者理解诊断、治疗选择与下一步决策。`,
      image: `${category}-${index + 1}`,
      imageAlt: `${specialty}中国专科医生代表头像`,
      featured: index === 1,
    }));
  }

  const localizedRoster = {
    en: {
      names: ["Prof. Victor Zhang", "Dr. Helen Li", "Dr. Michael Chen", "Dr. Grace Wu", "Prof. Daniel Huang"],
      titles: ["Senior Consultant", "Chief Physician", "Associate Chief Physician", "Chief Physician", "Senior Consultant"],
      hospitals: ["Shanghai tertiary hospital network", "Beijing specialist center", "Guangzhou academic hospital network", "Chengdu regional medical center", "Hangzhou international care network"],
      focus: ["Second-opinion case review", "Complex treatment pathway assessment", "Surgical and non-surgical option comparison", "Multispecialty case discussion", "Long-term care planning"],
      tags: ["Written review", "Video consult", "English support"],
      experience: "years clinical experience",
      tertiary: "Tertiary hospital specialist",
      bio: (value: string) => `Focused on ${value.toLowerCase()} case review, helping patients understand diagnosis, treatment choices, and practical next steps.`,
      imageAlt: (value: string) => `Representative Chinese ${value} specialist portrait`,
    },
    es: {
      names: ["Prof. Victor Zhang", "Dra. Helen Li", "Dr. Michael Chen", "Dra. Grace Wu", "Prof. Daniel Huang"],
      titles: ["Consultor sénior", "Médica jefe", "Médico jefe asociado", "Médica jefe", "Consultor sénior"],
      hospitals: ["Red de hospitales terciarios de Shanghái", "Centro especializado de Pekín", "Red académica hospitalaria de Guangzhou", "Centro médico regional de Chengdu", "Red internacional de atención de Hangzhou"],
      focus: ["Revisión de segunda opinión", "Evaluación de rutas de tratamiento complejas", "Comparación de opciones quirúrgicas y no quirúrgicas", "Discusión multispecialidad del caso", "Planificación de atención a largo plazo"],
      tags: ["Revisión escrita", "Consulta por video", "Soporte en inglés"],
      experience: "años de experiencia clínica",
      tertiary: "Especialista de hospital terciario",
      bio: (value: string) => `Enfocado en revisión de casos de ${value.toLowerCase()}, ayudando a entender diagnóstico, opciones de tratamiento y próximos pasos.`,
      imageAlt: (value: string) => `Retrato representativo de especialista chino en ${value}`,
    },
    fr: {
      names: ["Pr Victor Zhang", "Dre Helen Li", "Dr Michael Chen", "Dre Grace Wu", "Pr Daniel Huang"],
      titles: ["Consultant senior", "Médecin chef", "Médecin chef adjoint", "Médecin chef", "Consultant senior"],
      hospitals: ["Réseau hospitalier tertiaire de Shanghai", "Centre spécialisé de Pékin", "Réseau hospitalier universitaire de Guangzhou", "Centre médical régional de Chengdu", "Réseau international de soins de Hangzhou"],
      focus: ["Revue de deuxième avis", "Évaluation de parcours complexes", "Comparaison options chirurgicales et non chirurgicales", "Discussion multidisciplinaire du dossier", "Planification de soins à long terme"],
      tags: ["Avis écrit", "Consultation vidéo", "Support anglais"],
      experience: "ans d'expérience clinique",
      tertiary: "Spécialiste d'hôpital tertiaire",
      bio: (value: string) => `Spécialisé dans la revue de cas en ${value.toLowerCase()}, avec aide à la compréhension du diagnostic, des choix de traitement et des prochaines étapes.`,
      imageAlt: (value: string) => `Portrait représentatif d'un spécialiste chinois en ${value}`,
    },
    de: {
      names: ["Prof. Victor Zhang", "Dr. Helen Li", "Dr. Michael Chen", "Dr. Grace Wu", "Prof. Daniel Huang"],
      titles: ["Leitender Berater", "Chefärztin", "Stellvertretender Chefarzt", "Chefärztin", "Leitender Berater"],
      hospitals: ["Tertiäres Kliniknetzwerk Shanghai", "Spezialzentrum Peking", "Akademisches Kliniknetzwerk Guangzhou", "Regionales Medizinzentrum Chengdu", "Internationales Versorgungsnetzwerk Hangzhou"],
      focus: ["Zweitmeinungsprüfung", "Bewertung komplexer Behandlungspfade", "Vergleich chirurgischer und nicht-chirurgischer Optionen", "Multidisziplinäre Fallbesprechung", "Langfristige Versorgungsplanung"],
      tags: ["Schriftliche Prüfung", "Videokonsultation", "Englische Unterstützung"],
      experience: "Jahre klinische Erfahrung",
      tertiary: "Spezialist an tertiärer Klinik",
      bio: (value: string) => `Fokussiert auf Fallprüfungen in ${value.toLowerCase()} und hilft Patienten, Diagnose, Therapieoptionen und nächste Schritte zu verstehen.`,
      imageAlt: (value: string) => `Repräsentatives Porträt eines chinesischen Spezialisten für ${value}`,
    },
    ru: {
      names: ["Проф. Виктор Чжан", "Д-р Хелен Ли", "Д-р Майкл Чэнь", "Д-р Грейс У", "Проф. Дэниел Хуан"],
      titles: ["Старший консультант", "Главный врач", "Заместитель главного врача", "Главный врач", "Старший консультант"],
      hospitals: ["Сеть третичных больниц Шанхая", "Специализированный центр Пекина", "Академическая больничная сеть Гуанчжоу", "Региональный медицинский центр Чэнду", "Международная сеть помощи Ханчжоу"],
      focus: ["Обзор для второго мнения", "Оценка сложного маршрута лечения", "Сравнение хирургических и нехирургических вариантов", "Междисциплинарное обсуждение случая", "Планирование долгосрочного лечения"],
      tags: ["Письменный обзор", "Видеоконсультация", "Поддержка на английском"],
      experience: "лет клинического опыта",
      tertiary: "Специалист третичной больницы",
      bio: (value: string) => `Фокус на обзоре случаев по направлению ${value.toLowerCase()}, чтобы помочь понять диагноз, варианты лечения и практические следующие шаги.`,
      imageAlt: (value: string) => `Представительный портрет китайского специалиста по направлению ${value}`,
    },
  } as const;

  const copy = localizedRoster[locale === "zh" ? "en" : locale];

  return copy.names.map((name, index) => ({
    name,
    title: copy.titles[index],
    specialty,
    hospital: copy.hospitals[index],
    credentials: [`${experienceYears[index]}+ ${copy.experience}`, copy.focus[index], copy.tertiary],
    tags: [...copy.tags],
    bio: copy.bio(specialty),
    image: `${category}-${index + 1}`,
    imageAlt: copy.imageAlt(specialty),
    featured: index === 1,
  }));
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
    setPageSeo({
      title: "Telemedicine Consultation | Medora Health",
      description: "Video or written specialist review before you travel.",
      path: "/telemedicine",
    });
  }, []);

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

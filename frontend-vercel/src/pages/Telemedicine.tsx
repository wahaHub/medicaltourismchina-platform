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

type RosterLocale = "en" | "zh";

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

const EXPERT_IMAGES: Record<string, string> = {
  zhang: expertZhangImage,
  li: expertLiImage,
  chen: expertChenImage,
  "oncology-1": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/oncology-1.webp`,
  "oncology-2": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/oncology-2.webp`,
  "oncology-3": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/oncology-3.webp`,
  "oncology-4": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/oncology-4.webp`,
  "oncology-5": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/oncology-5.webp`,
  "oncology-6": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/oncology-6.webp`,
  "cardiology-1": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/cardiology-1.webp`,
  "cardiology-2": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/cardiology-2.webp`,
  "cardiology-3": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/cardiology-3.webp`,
  "cardiology-4": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/cardiology-4.webp`,
  "neurology-1": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/neurology-1.webp`,
  "neurology-2": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/neurology-2.webp`,
  "neurology-3": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/neurology-3.webp`,
  "neurology-4": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/neurology-4.webp`,
  "neurology-5": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/neurology-5.webp`,
  "orthopedics-1": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/orthopedics-1.webp`,
  "orthopedics-2": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/orthopedics-2.webp`,
  "orthopedics-3": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/orthopedics-3.webp`,
  "orthopedics-4": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/orthopedics-4.webp`,
  "orthopedics-5": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/orthopedics-5.webp`,
  "reproductive-1": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/reproductive-20260615-1.webp`,
  "reproductive-2": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/reproductive-20260615-2.webp`,
  "reproductive-3": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/reproductive-20260615-3.webp`,
  "reproductive-4": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/reproductive-20260615-4.webp`,
  "reproductive-5": `${TELEMEDICINE_EXPERT_IMAGE_BASE}/reproductive-20260615-5.webp`,
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
      body: "Medora matches your case with experienced Chinese specialists who can support written review, video consultation, and treatment direction discussion.",
      tabs: ["Oncology", "Cardiology", "Neurology", "Orthopedics", "Reproductive medicine"],
      moreTabs: ["Aesthetic surgery", "Stem cell therapy", "Dentistry", "Pediatrics", "Rare diseases", "Urology", "Endocrinology", "Ophthalmology"],
      moreLabel: "More",
      collapseLabel: "Show less",
      expertCta: "View specialist",
      matchPrompt: "Tell us about your condition and we will suggest a more suitable specialist match.",
      matchCta: "Get specialist matching advice",
      customTitle: "Need a different specialist?",
      customBody: "Tell us your diagnosis, records, preferred specialty, and consultation goal. Medora will suggest a more suitable doctor or specialist team.",
      customCta: "Tell us what you need",
      experts: [
        {
          name: "Prof. Zhang Ming",
          title: "Senior Consultant",
          specialty: "Medical Oncology",
          hospital: "Shanghai tertiary hospital network",
          credentials: ["30+ years clinical experience", "Complex cancer case review", "Tertiary hospital specialist"],
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
            bestFor: "Patients facing complex cancer care, major surgery, rare disease, neurological conditions, cardiac decisions, or conflicting treatment recommendations.",
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
      moreTabs: ["整容", "干细胞", "牙科", "儿科", "罕见病", "泌尿科", "内分泌", "眼科"],
      moreLabel: "更多",
      collapseLabel: "收起",
      expertCta: "查看专家",
      matchPrompt: "告诉我们您的病情，我们为您匹配更合适的专家。",
      matchCta: "获取医生匹配建议",
      customTitle: "想找其他类型的医生？",
      customBody: "告诉我们您的诊断、病历资料、希望咨询的方向和目标，我们为您匹配更合适的医生或专家团队。",
      customCta: "告诉我们您需要什么医生",
      experts: [
        {
          name: "张明教授",
          title: "主任医师",
          specialty: "肿瘤内科",
          hospital: "上海三甲医院专家网络",
          credentials: ["30+ 年临床经验", "擅长复杂肿瘤病例", "三甲医院专家"],
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
            bestFor: "面临复杂肿瘤治疗、重大手术、罕见病、神经系统疾病、心脏治疗决策或治疗建议冲突的患者。",
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
    moreTabs: ["Cirugía estética", "Terapia con células madre", "Odontología", "Pediatría", "Enfermedades raras", "Urología", "Endocrinología", "Oftalmología"],
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
    moreTabs: ["Chirurgie esthétique", "Thérapie par cellules souches", "Dentisterie", "Pédiatrie", "Maladies rares", "Urologie", "Endocrinologie", "Ophtalmologie"],
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
    moreTabs: ["Ästhetische Chirurgie", "Stammzelltherapie", "Zahnmedizin", "Pädiatrie", "Seltene Erkrankungen", "Urologie", "Endokrinologie", "Augenheilkunde"],
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
    moreTabs: ["Эстетическая хирургия", "Стволовые клетки", "Стоматология", "Педиатрия", "Редкие заболевания", "Урология", "Эндокринология", "Офтальмология"],
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

function getRosterLocale(showcase: PageCopy["expertShowcase"]): RosterLocale {
  return showcase.moreLabel === "更多" ? "zh" : "en";
}

function getRosterCategory(specialty: string): "oncology" | "cardiology" | "neurology" | "orthopedics" | "reproductive" | "other" {
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

  return "other";
}

function buildExpertRoster(specialty: string, rosterLocale: RosterLocale): ExpertCard[] {
  const imageOrder: ExpertCard["image"][] = ["zhang", "li", "chen", "li", "zhang", "chen"];
  const category = getRosterCategory(specialty);

  if (category === "oncology") {
    if (rosterLocale === "zh") {
      return [
        {
          name: "王钧教授",
          title: "教授 / 主任医师",
          specialty,
          hospital: "上海三甲肿瘤中心专家网络",
          credentials: ["34+ 年肿瘤临床经验", "肺癌与消化道肿瘤第二意见", "多学科会诊核心专家"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "长期参与胸部肿瘤和胃肠道肿瘤疑难病例评估，擅长将影像、病理与既往治疗史整合成清晰的下一步方案建议。",
          image: "oncology-1",
          imageAlt: "王钧教授肿瘤内科专家头像",
        },
        {
          name: "陈丽华主任医师",
          title: "主任医师",
          specialty,
          hospital: "北京肿瘤专科协作中心",
          credentials: ["31+ 年临床经验", "乳腺与妇科肿瘤综合治疗", "国际患者病历审阅"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "专注乳腺癌、卵巢癌及复杂复发病例的系统治疗评估，帮助患者理解手术、放疗、化疗及靶向治疗之间的取舍。",
          image: "oncology-2",
          imageAlt: "陈丽华主任医师肿瘤专家头像",
          featured: true,
        },
        {
          name: "周启明主任医师",
          title: "主任医师",
          specialty,
          hospital: "广州高校附属医院肿瘤团队",
          credentials: ["24+ 年临床经验", "肝胆胰与胃肠肿瘤评估", "复杂治疗路径梳理"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "擅长为消化系统肿瘤患者梳理已有检查结果和治疗记录，明确是否需要进一步分期、基因检测或多学科讨论。",
          image: "oncology-3",
          imageAlt: "周启明主任医师肿瘤专家头像",
        },
        {
          name: "林若兰教授",
          title: "教授 / 主任医师",
          specialty,
          hospital: "杭州肿瘤精准诊疗协作网络",
          credentials: ["29+ 年临床经验", "靶向与免疫治疗方案评估", "复发转移病例第二意见"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "关注分子检测结果与临床治疗选择的匹配，适合需要比较免疫、靶向、放疗或临床研究可能性的患者。",
          image: "oncology-4",
          imageAlt: "林若兰教授肿瘤专家头像",
        },
        {
          name: "赵明远主任医师",
          title: "主任医师",
          specialty,
          hospital: "成都区域肿瘤医学中心",
          credentials: ["27+ 年临床经验", "头颈部与胸部肿瘤会诊", "放化疗联合方案评估"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "擅长把局部治疗和全身治疗放在同一张治疗路径图中比较，帮助患者判断不同方案的目标、风险与时间窗口。",
          image: "oncology-5",
          imageAlt: "赵明远主任医师肿瘤专家头像",
        },
        {
          name: "许嘉宁副主任医师",
          title: "副主任医师",
          specialty,
          hospital: "深圳国际肿瘤会诊协作中心",
          credentials: ["21+ 年临床经验", "病历整理与远程会诊", "长期随访计划优化"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "熟悉国际患者远程问诊流程，擅长把复杂病史整理成医生可快速判断的摘要，并提出后续检查和复诊重点。",
          image: "oncology-6",
          imageAlt: "许嘉宁副主任医师肿瘤专家头像",
        },
      ];
    }

    return [
      {
        name: "Prof. Jun Wang",
        title: "Professor / Chief Physician",
        specialty,
        hospital: "Shanghai tertiary oncology center network",
        credentials: ["34+ years oncology experience", "Lung and GI cancer second opinions", "Multidisciplinary review lead"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Reviews complex thoracic and gastrointestinal cancer cases by connecting imaging, pathology, treatment history, and practical next-step options.",
        image: "oncology-1",
        imageAlt: "Prof. Jun Wang oncology specialist portrait",
      },
      {
        name: "Dr. Lihua Chen",
        title: "Chief Physician",
        specialty,
        hospital: "Beijing oncology specialist collaboration center",
        credentials: ["31+ years clinical experience", "Breast and gynecologic oncology", "International record review"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Focuses on breast, ovarian, and recurrent cancer cases, helping patients compare surgery, radiotherapy, systemic therapy, and targeted treatment paths.",
        image: "oncology-2",
        imageAlt: "Dr. Lihua Chen oncology specialist portrait",
        featured: true,
      },
      {
        name: "Dr. Qiming Zhou",
        title: "Chief Physician",
        specialty,
        hospital: "Guangzhou academic oncology team",
        credentials: ["24+ years clinical experience", "Hepatobiliary and GI tumor review", "Treatment pathway assessment"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Helps digestive-system cancer patients clarify staging, prior treatment records, molecular testing needs, and whether an MDT review is appropriate.",
        image: "oncology-3",
        imageAlt: "Dr. Qiming Zhou oncology specialist portrait",
      },
      {
        name: "Prof. Ruolan Lin",
        title: "Professor / Chief Physician",
        specialty,
        hospital: "Hangzhou precision oncology collaboration network",
        credentials: ["29+ years clinical experience", "Targeted and immunotherapy review", "Recurrent metastatic case assessment"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Connects molecular test results with treatment choices for patients comparing immunotherapy, targeted therapy, radiotherapy, or research options.",
        image: "oncology-4",
        imageAlt: "Prof. Ruolan Lin oncology specialist portrait",
      },
      {
        name: "Dr. Mingyuan Zhao",
        title: "Chief Physician",
        specialty,
        hospital: "Chengdu regional oncology medical center",
        credentials: ["27+ years clinical experience", "Head-neck and thoracic tumor review", "Combined radiochemotherapy planning"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Compares local and systemic treatment options in one pathway, clarifying goals, risks, and timing for patients facing major decisions.",
        image: "oncology-5",
        imageAlt: "Dr. Mingyuan Zhao oncology specialist portrait",
      },
      {
        name: "Dr. Jianing Xu",
        title: "Associate Chief Physician",
        specialty,
        hospital: "Shenzhen international oncology consultation center",
        credentials: ["21+ years clinical experience", "Remote case preparation", "Follow-up planning optimization"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Experienced in remote international case intake, turning complex histories into concise specialist-ready summaries and follow-up priorities.",
        image: "oncology-6",
        imageAlt: "Dr. Jianing Xu oncology specialist portrait",
      },
    ];
  }

  if (category === "cardiology") {
    if (rosterLocale === "zh") {
      return [
        {
          name: "陆承志主任医师",
          title: "主任医师",
          specialty,
          hospital: "北京心血管专科协作中心",
          credentials: ["23+ 年心血管临床经验", "冠心病与支架术后方案评估", "远程第二意见"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "擅长评估冠脉 CTA、造影报告、用药记录与既往介入治疗，帮助患者判断是否需要进一步检查或调整治疗策略。",
          image: "cardiology-1",
          imageAlt: "陆承志主任医师心血管专家头像",
        },
        {
          name: "沈柏舟副主任医师",
          title: "副主任医师",
          specialty,
          hospital: "上海三甲医院心内科专家网络",
          credentials: ["18+ 年临床经验", "心律失常与房颤管理", "长期用药计划审阅"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "关注心律失常、房颤、抗凝用药和消融术前评估，可协助患者整理心电图、Holter 与既往治疗信息。",
          image: "cardiology-2",
          imageAlt: "沈柏舟副主任医师心血管专家头像",
          featured: true,
        },
        {
          name: "高文睿主任医师",
          title: "主任医师",
          specialty,
          hospital: "广州心脏中心远程会诊网络",
          credentials: ["22+ 年临床经验", "心衰与瓣膜病治疗路径", "复杂病例多学科沟通"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "擅长把超声心动图、BNP、既往住院记录和药物方案放在一起评估，帮助患者理解保守、介入或手术选择。",
          image: "cardiology-3",
          imageAlt: "高文睿主任医师心血管专家头像",
        },
        {
          name: "韩士杰教授",
          title: "教授 / 主任医师",
          specialty,
          hospital: "杭州国际心血管医学协作中心",
          credentials: ["30+ 年临床经验", "高危心血管病例评估", "术前风险与康复计划"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "适合需要在重大手术前评估心脏风险、比较治疗选择或制定长期随访计划的国际患者。",
          image: "cardiology-4",
          imageAlt: "韩士杰教授心血管专家头像",
        },
      ];
    }

    return [
      {
        name: "Dr. Chengzhi Lu",
        title: "Chief Physician",
        specialty,
        hospital: "Beijing cardiovascular specialist collaboration center",
        credentials: ["23+ years cardiology experience", "Coronary disease and post-stent review", "Remote second opinions"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Reviews coronary CTA, angiography reports, medication history, and prior interventions to clarify whether further testing or treatment adjustment is needed.",
        image: "cardiology-1",
        imageAlt: "Dr. Chengzhi Lu cardiology specialist portrait",
      },
      {
        name: "Dr. Baizhou Shen",
        title: "Associate Chief Physician",
        specialty,
        hospital: "Shanghai tertiary cardiology network",
        credentials: ["18+ years clinical experience", "Arrhythmia and atrial fibrillation care", "Long-term medication review"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Focuses on arrhythmia, atrial fibrillation, anticoagulation, and pre-ablation review, organizing ECG, Holter, and treatment history for specialist discussion.",
        image: "cardiology-2",
        imageAlt: "Dr. Baizhou Shen cardiology specialist portrait",
        featured: true,
      },
      {
        name: "Dr. Wenrui Gao",
        title: "Chief Physician",
        specialty,
        hospital: "Guangzhou heart center remote consultation network",
        credentials: ["22+ years clinical experience", "Heart failure and valve disease pathways", "Complex case coordination"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Combines echocardiography, BNP, hospitalization records, and medication plans to help patients understand conservative, interventional, or surgical options.",
        image: "cardiology-3",
        imageAlt: "Dr. Wenrui Gao cardiology specialist portrait",
      },
      {
        name: "Prof. Shijie Han",
        title: "Professor / Chief Physician",
        specialty,
        hospital: "Hangzhou international cardiovascular medicine network",
        credentials: ["30+ years clinical experience", "High-risk cardiovascular case review", "Pre-op risk and recovery planning"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Supports international patients who need cardiac risk review before major procedures, treatment comparison, or a long-term follow-up plan.",
        image: "cardiology-4",
        imageAlt: "Prof. Shijie Han cardiology specialist portrait",
      },
    ];
  }

  if (category === "neurology") {
    if (rosterLocale === "zh") {
      return [
        {
          name: "林予涵副主任医师",
          title: "副主任医师",
          specialty,
          hospital: "上海神经内科远程会诊网络",
          credentials: ["14+ 年神经内科经验", "头痛、癫痫与睡眠障碍评估", "影像与用药记录审阅"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "擅长整理脑 MRI、脑电图、既往用药和发作记录，帮助患者明确诊断方向、用药调整重点与下一步检查计划。",
          image: "neurology-1",
          imageAlt: "林予涵副主任医师神经科专家头像",
        },
        {
          name: "谭书怡教授",
          title: "教授 / 主任医师",
          specialty,
          hospital: "北京神经疾病专科协作中心",
          credentials: ["27+ 年临床经验", "帕金森病与运动障碍第二意见", "长期治疗路径优化"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "关注帕金森病、震颤、肌张力障碍等运动障碍疾病，擅长结合病程、影像和药物反应评估下一步治疗选择。",
          image: "neurology-2",
          imageAlt: "谭书怡教授神经科专家头像",
          featured: true,
        },
        {
          name: "赵孟溪主任医师",
          title: "主任医师",
          specialty,
          hospital: "杭州脑血管病专家协作网络",
          credentials: ["19+ 年临床经验", "卒中后康复与复发风险评估", "慢性脑血管病管理"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "擅长为脑梗、短暂性脑缺血发作和脑血管狭窄患者梳理检查结果，明确二级预防、康复和复查重点。",
          image: "neurology-3",
          imageAlt: "赵孟溪主任医师神经科专家头像",
        },
        {
          name: "乔建成教授",
          title: "教授 / 主任医师",
          specialty,
          hospital: "成都神经疑难病会诊中心",
          credentials: ["33+ 年临床经验", "周围神经病与神经免疫病例", "疑难诊断第二意见"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "适合长期症状反复、诊断不清或检查结果复杂的患者，可协助比较神经免疫、代谢和周围神经病变的可能性。",
          image: "neurology-4",
          imageAlt: "乔建成教授神经科专家头像",
        },
        {
          name: "何文静副主任医师",
          title: "副主任医师",
          specialty,
          hospital: "深圳国际神经内科咨询中心",
          credentials: ["16+ 年临床经验", "头晕眩晕与认知问题评估", "远程病历摘要整理"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "擅长把症状时间线、影像、实验室检查和用药反应整理成清晰摘要，帮助患者理解需要优先处理的问题。",
          image: "neurology-5",
          imageAlt: "何文静副主任医师神经科专家头像",
        },
      ];
    }

    return [
      {
        name: "Dr. Yuhan Lin",
        title: "Associate Chief Physician",
        specialty,
        hospital: "Shanghai neurology remote consultation network",
        credentials: ["14+ years neurology experience", "Headache, epilepsy, and sleep disorder review", "Imaging and medication record assessment"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Organizes brain MRI, EEG, medication history, and symptom timelines to clarify diagnostic direction, treatment priorities, and next-step testing.",
        image: "neurology-1",
        imageAlt: "Dr. Yuhan Lin neurology specialist portrait",
      },
      {
        name: "Prof. Shuyi Tan",
        title: "Professor / Chief Physician",
        specialty,
        hospital: "Beijing neurological disease specialist collaboration center",
        credentials: ["27+ years clinical experience", "Parkinson's disease and movement disorder second opinions", "Long-term treatment pathway optimization"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Focuses on Parkinson's disease, tremor, dystonia, and other movement disorders, connecting clinical course, imaging, and medication response to practical treatment options.",
        image: "neurology-2",
        imageAlt: "Prof. Shuyi Tan neurology specialist portrait",
        featured: true,
      },
      {
        name: "Dr. Mengxi Zhao",
        title: "Chief Physician",
        specialty,
        hospital: "Hangzhou cerebrovascular specialist network",
        credentials: ["19+ years clinical experience", "Post-stroke recovery and recurrence risk review", "Chronic cerebrovascular disease management"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Helps stroke, TIA, and vascular stenosis patients organize reports and clarify secondary prevention, rehabilitation, and follow-up priorities.",
        image: "neurology-3",
        imageAlt: "Dr. Mengxi Zhao neurology specialist portrait",
      },
      {
        name: "Prof. Jiancheng Qiao",
        title: "Professor / Chief Physician",
        specialty,
        hospital: "Chengdu complex neurological disease consultation center",
        credentials: ["33+ years clinical experience", "Peripheral nerve and neuroimmunology cases", "Difficult diagnosis second opinions"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Supports patients with recurrent symptoms, unclear diagnoses, or complex findings by comparing neuroimmune, metabolic, and peripheral nerve possibilities.",
        image: "neurology-4",
        imageAlt: "Prof. Jiancheng Qiao neurology specialist portrait",
      },
      {
        name: "Dr. Wenjing He",
        title: "Associate Chief Physician",
        specialty,
        hospital: "Shenzhen international neurology consultation center",
        credentials: ["16+ years clinical experience", "Dizziness, vertigo, and cognitive symptom review", "Remote medical summary preparation"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Turns symptom timelines, imaging, lab results, and medication responses into concise summaries so patients can understand what should be addressed first.",
        image: "neurology-5",
        imageAlt: "Dr. Wenjing He neurology specialist portrait",
      },
    ];
  }

  if (category === "orthopedics") {
    if (rosterLocale === "zh") {
      return [
        {
          name: "许凯文主任医师",
          title: "主任医师",
          specialty,
          hospital: "上海骨科运动医学协作网络",
          credentials: ["21+ 年骨科临床经验", "肩膝关节与运动损伤评估", "术前影像第二意见"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "擅长结合 MRI、X 光和既往治疗记录，帮助患者比较保守治疗、关节镜手术和康复方案的适用性。",
          image: "orthopedics-1",
          imageAlt: "许凯文主任医师骨科专家头像",
        },
        {
          name: "方亦如副主任医师",
          title: "副主任医师",
          specialty,
          hospital: "北京脊柱疾病远程会诊中心",
          credentials: ["17+ 年临床经验", "颈腰椎退变与椎间盘问题", "疼痛与神经症状路径评估"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "关注颈椎病、腰椎间盘突出、椎管狭窄等问题，帮助患者理解影像严重程度与症状之间的关系。",
          image: "orthopedics-2",
          imageAlt: "方亦如副主任医师骨科专家头像",
          featured: true,
        },
        {
          name: "李振主任医师",
          title: "主任医师",
          specialty,
          hospital: "广州关节外科专家协作中心",
          credentials: ["24+ 年临床经验", "髋膝关节置换方案评估", "术后恢复与翻修病例审阅"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "适合需要比较关节置换时机、假体选择、翻修风险或术后康复计划的患者进行远程第二意见。",
          image: "orthopedics-3",
          imageAlt: "李振主任医师骨科专家头像",
        },
        {
          name: "任昊教授",
          title: "教授 / 主任医师",
          specialty,
          hospital: "成都创伤骨科与脊柱协作中心",
          credentials: ["29+ 年临床经验", "复杂骨折与创伤后畸形评估", "手术风险与康复计划"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "擅长评估复杂骨折、陈旧性损伤和创伤后功能受限病例，帮助患者理解手术目标、风险和恢复周期。",
          image: "orthopedics-4",
          imageAlt: "任昊教授骨科专家头像",
        },
        {
          name: "周美霖主任医师",
          title: "主任医师",
          specialty,
          hospital: "杭州国际骨科康复协作网络",
          credentials: ["20+ 年临床经验", "骨质疏松与慢性关节疼痛", "康复与长期管理计划"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "专注慢性关节疼痛、骨质疏松相关骨折风险和术后康复管理，适合需要长期计划的国际患者。",
          image: "orthopedics-5",
          imageAlt: "周美霖主任医师骨科专家头像",
        },
      ];
    }

    return [
      {
        name: "Dr. Kaiwen Xu",
        title: "Chief Physician",
        specialty,
        hospital: "Shanghai orthopedic sports medicine collaboration network",
        credentials: ["21+ years orthopedic experience", "Shoulder, knee, and sports injury review", "Pre-surgery imaging second opinions"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Reviews MRI, X-ray, and prior treatment records to help patients compare conservative care, arthroscopic surgery, and rehabilitation options.",
        image: "orthopedics-1",
        imageAlt: "Dr. Kaiwen Xu orthopedic specialist portrait",
      },
      {
        name: "Dr. Yiru Fang",
        title: "Associate Chief Physician",
        specialty,
        hospital: "Beijing spine disease remote consultation center",
        credentials: ["17+ years clinical experience", "Cervical and lumbar degeneration review", "Pain and nerve symptom pathway assessment"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Focuses on cervical spondylosis, lumbar disc herniation, and spinal stenosis, helping patients connect imaging severity with real symptoms.",
        image: "orthopedics-2",
        imageAlt: "Dr. Yiru Fang orthopedic specialist portrait",
        featured: true,
      },
      {
        name: "Dr. Zhen Li",
        title: "Chief Physician",
        specialty,
        hospital: "Guangzhou joint surgery specialist collaboration center",
        credentials: ["24+ years clinical experience", "Hip and knee replacement pathway review", "Post-op recovery and revision case assessment"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Supports patients comparing joint replacement timing, implant choices, revision risks, and realistic postoperative rehabilitation plans.",
        image: "orthopedics-3",
        imageAlt: "Dr. Zhen Li orthopedic specialist portrait",
      },
      {
        name: "Prof. Hao Ren",
        title: "Professor / Chief Physician",
        specialty,
        hospital: "Chengdu trauma orthopedics and spine collaboration center",
        credentials: ["29+ years clinical experience", "Complex fracture and post-traumatic deformity review", "Surgical risk and recovery planning"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Reviews complex fractures, old injuries, and post-traumatic function limits so patients can understand surgical goals, risks, and recovery timelines.",
        image: "orthopedics-4",
        imageAlt: "Prof. Hao Ren orthopedic specialist portrait",
      },
      {
        name: "Dr. Meilin Zhou",
        title: "Chief Physician",
        specialty,
        hospital: "Hangzhou international orthopedic rehabilitation network",
        credentials: ["20+ years clinical experience", "Osteoporosis and chronic joint pain", "Rehabilitation and long-term management planning"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Focuses on chronic joint pain, osteoporosis-related fracture risk, and post-surgery rehabilitation management for patients who need a long-term plan.",
        image: "orthopedics-5",
        imageAlt: "Dr. Meilin Zhou orthopedic specialist portrait",
      },
    ];
  }

  if (category === "reproductive") {
    if (rosterLocale === "zh") {
      return [
        {
          name: "吴瀚主任医师",
          title: "主任医师",
          specialty,
          hospital: "上海辅助生殖医学协作中心",
          credentials: ["24+ 年生殖医学经验", "试管婴儿方案与促排评估", "复杂不孕病历第二意见"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "擅长结合激素、AMH、B 超、既往促排和胚胎记录，帮助患者判断试管婴儿方案是否需要调整。",
          image: "reproductive-1",
          imageAlt: "吴瀚主任医师辅助生殖专家头像",
        },
        {
          name: "梁静怡主任医师",
          title: "主任医师",
          specialty,
          hospital: "北京生殖内分泌远程会诊网络",
          credentials: ["26+ 年临床经验", "卵巢功能与反复移植失败评估", "国际患者病历审阅"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "关注卵巢储备下降、反复移植失败和高龄备孕病例，擅长把检查结果转化为清晰的下一周期策略。",
          image: "reproductive-2",
          imageAlt: "梁静怡主任医师辅助生殖专家头像",
          featured: true,
        },
        {
          name: "罗嘉敏副主任医师",
          title: "副主任医师",
          specialty,
          hospital: "广州妇产与生殖医学专家网络",
          credentials: ["18+ 年临床经验", "多囊卵巢与排卵障碍管理", "孕前评估与远程随访"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "擅长为月经不规律、多囊卵巢、排卵障碍和备孕时间较长的患者梳理检查重点与治疗路径。",
          image: "reproductive-3",
          imageAlt: "罗嘉敏副主任医师辅助生殖专家头像",
        },
        {
          name: "孙启航主任医师",
          title: "主任医师",
          specialty,
          hospital: "杭州男性生殖与辅助生殖协作中心",
          credentials: ["22+ 年临床经验", "男性因素不育评估", "精液分析与手术取精路径审阅"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "专注男性因素不育、精液质量异常和取精相关决策，帮助夫妇理解是否需要进一步男科或胚胎实验室评估。",
          image: "reproductive-4",
          imageAlt: "孙启航主任医师辅助生殖专家头像",
        },
        {
          name: "何承远教授",
          title: "教授 / 主任医师",
          specialty,
          hospital: "深圳国际生殖医学咨询中心",
          credentials: ["30+ 年临床经验", "疑难生殖病例多学科评估", "胚胎质量与反复流产方案讨论"],
          tags: ["书面审阅", "视频问诊", "多语种协调"],
          bio: "适合经历多次失败周期、胚胎质量不稳定或反复流产的患者，协助比较检查、用药和实验室策略。",
          image: "reproductive-5",
          imageAlt: "何承远教授辅助生殖专家头像",
        },
      ];
    }

    return [
      {
        name: "Dr. Han Wu",
        title: "Chief Physician",
        specialty,
        hospital: "Shanghai assisted reproduction medicine collaboration center",
        credentials: ["24+ years reproductive medicine experience", "IVF protocol and ovarian stimulation review", "Complex infertility second opinions"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Reviews hormones, AMH, ultrasound findings, previous stimulation cycles, and embryo records to clarify whether an IVF plan should be adjusted.",
        image: "reproductive-1",
        imageAlt: "Dr. Han Wu reproductive medicine specialist portrait",
      },
      {
        name: "Dr. Jingyi Liang",
        title: "Chief Physician",
        specialty,
        hospital: "Beijing reproductive endocrinology remote consultation network",
        credentials: ["26+ years clinical experience", "Ovarian reserve and recurrent implantation failure review", "International record assessment"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Focuses on diminished ovarian reserve, recurrent implantation failure, and advanced maternal age cases, turning records into practical next-cycle strategy questions.",
        image: "reproductive-2",
        imageAlt: "Dr. Jingyi Liang reproductive medicine specialist portrait",
        featured: true,
      },
      {
        name: "Dr. Jiamin Luo",
        title: "Associate Chief Physician",
        specialty,
        hospital: "Guangzhou obstetrics, gynecology, and reproductive medicine network",
        credentials: ["18+ years clinical experience", "PCOS and ovulation disorder management", "Preconception review and remote follow-up"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Helps patients with irregular cycles, PCOS, ovulation disorders, or prolonged time trying to conceive organize key tests and treatment pathways.",
        image: "reproductive-3",
        imageAlt: "Dr. Jiamin Luo reproductive medicine specialist portrait",
      },
      {
        name: "Dr. Qihang Sun",
        title: "Chief Physician",
        specialty,
        hospital: "Hangzhou male fertility and assisted reproduction collaboration center",
        credentials: ["22+ years clinical experience", "Male-factor infertility review", "Semen analysis and sperm retrieval pathway assessment"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Focuses on male-factor infertility, abnormal semen parameters, and sperm retrieval decisions, clarifying when additional andrology or lab review is needed.",
        image: "reproductive-4",
        imageAlt: "Dr. Qihang Sun reproductive medicine specialist portrait",
      },
      {
        name: "Prof. Chengyuan He",
        title: "Professor / Chief Physician",
        specialty,
        hospital: "Shenzhen international reproductive medicine consultation center",
        credentials: ["30+ years clinical experience", "Complex fertility case MDT review", "Embryo quality and recurrent pregnancy loss planning"],
        tags: ["Written review", "Video consult", "Multilingual support"],
        bio: "Supports patients after multiple failed cycles, unstable embryo quality, or recurrent pregnancy loss by comparing testing, medication, and lab strategy options.",
        image: "reproductive-5",
        imageAlt: "Prof. Chengyuan He reproductive medicine specialist portrait",
      },
    ];
  }

  if (rosterLocale === "zh") {
    const names = ["周远航教授", "林嘉明主任医师", "许安然教授", "沈博文主任医师", "顾清妍教授", "韩立成主任医师"];
    const hospitals = ["上海三甲医院专家网络", "北京专科医学中心", "广州高校附属医院专家网络", "成都区域医学中心", "杭州国际医疗协作中心", "深圳三甲医院专家网络"];
    const focus = ["疑难病例第二意见", "复杂治疗路径评估", "手术与非手术方案比较", "跨学科病例讨论", "国际患者远程问诊", "长期治疗计划优化"];

    return names.map((name, index) => ({
      name,
      title: index % 2 === 0 ? "教授 / 主任医师" : "主任医师",
      specialty,
      hospital: hospitals[index],
      credentials: [`${26 + index * 2}+ 年临床经验`, focus[index], "三甲医院专家"],
      tags: ["书面审阅", "视频问诊", "英文支持"],
      bio: `专注${specialty}相关复杂病例评估，可协助患者理解诊断、治疗选择与下一步决策。`,
      image: imageOrder[index],
      imageAlt: `${specialty}中国专科医生代表头像`,
      featured: index === 1,
    }));
  }

  const names = ["Prof. Victor Zhang", "Dr. Helen Li", "Prof. Michael Chen", "Dr. Grace Wu", "Prof. Daniel Huang", "Dr. Sophia Lin"];
  const hospitals = ["Shanghai tertiary hospital network", "Beijing specialist center", "Guangzhou academic hospital network", "Chengdu regional medical center", "Hangzhou international care network", "Shenzhen tertiary hospital network"];
  const focus = ["Second-opinion case review", "Complex treatment pathway assessment", "Surgical and non-surgical option comparison", "Multispecialty case discussion", "International video consultation", "Long-term care planning"];

  return names.map((name, index) => ({
    name,
    title: index % 2 === 0 ? "Senior Consultant" : "Chief Physician",
    specialty,
    hospital: hospitals[index],
    credentials: [`${26 + index * 2}+ years clinical experience`, focus[index], "Tertiary hospital specialist"],
    tags: ["Written review", "Video consult", "English support"],
    bio: `Focused on ${specialty.toLowerCase()} case review, helping patients understand diagnosis, treatment choices, and practical next steps.`,
    image: imageOrder[index],
    imageAlt: `Representative Chinese ${specialty} specialist portrait`,
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

function ExpertCardView({ expert, cta }: { expert: ExpertCard; cta: string }) {
  const image = EXPERT_IMAGES[expert.image] ?? expert.image;

  return (
    <article className={`group relative flex min-h-[390px] overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 hover:-translate-y-1 ${expert.featured ? "ring-2 ring-[#1DA78A]/55" : ""}`}>
      {expert.featured && (
        <div className="absolute right-0 top-0 z-20 rounded-bl-2xl bg-gradient-to-r from-[#1DA78A] to-[#0F638E] px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-teal-800/10">
          Featured match
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

function ExpertShowcaseSection({ showcase }: { showcase: PageCopy["expertShowcase"] }) {
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const [selectedTab, setSelectedTab] = useState(showcase.tabs[0]);
  const visibleTabs = showMoreTabs ? [...showcase.tabs, ...showcase.moreTabs] : showcase.tabs;
  const roster = buildExpertRoster(selectedTab, getRosterLocale(showcase));

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
              <ExpertCardView expert={expert} cta={showcase.expertCta} />
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
            Side-by-side table comparing the available online consultation review options.
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

        <ExpertShowcaseSection showcase={copy.expertShowcase} />

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

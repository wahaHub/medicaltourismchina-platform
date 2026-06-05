import { useEffect } from "react";
import { Link } from "react-router-dom";

import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import consultationDoctorImage from "@/img/online-consultation-doctor.jpg";
import planMultidisciplinaryImage from "@/img/telemedicine-plan-multidisciplinary.jpg";
import planVideoConsultationImage from "@/img/telemedicine-plan-video-consultation.jpg";
import planWrittenReviewImage from "@/img/telemedicine-plan-written-review.jpg";
import processCaseSummaryImage from "@/img/telemedicine-process-case-summary.jpg";
import processChinaAccessImage from "@/img/telemedicine-process-china-access.jpg";
import processConsultationImage from "@/img/telemedicine-process-consultation.jpg";
import processSecondOpinionImage from "@/img/telemedicine-process-second-opinion.jpg";
import processUploadRecordsImage from "@/img/telemedicine-process-upload-records.jpg";

const CTA_HREF = "/medical-case-intake";

type Locale = "en" | "zh" | "es" | "fr" | "de" | "ru";
type TextPair = [string, string];

type Plan = {
  variant: "report" | "video" | "tumor";
  badge: string;
  title: string;
  price: string;
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
      ["English Coordination", "We organize, translate, and summarize your case."],
      ["Travel Optional", "Start online. Travel only if it fits your case."],
    ],
    review: {
      label: "Review options",
      title: "Choose your second opinion option",
      body: "Start remotely with a written review, video consultation, or multidisciplinary case review before making your next medical decision.",
      plans: [
        {
          variant: "report",
          badge: "Essential",
          title: "Written Review",
          price: "From $399",
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
          price: "From $699",
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
          price: "From $1,499",
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
    review: {
      label: "服务方案",
      title: "选择您的第二诊疗意见方案",
      body: "在做出下一步医疗决定前，先通过书面审阅、视频问诊或多学科病例评估远程开始。",
      plans: [
        {
          variant: "report",
          badge: "Essential",
          title: "书面审阅",
          price: "From $399",
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
          price: "From $699",
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
          price: "From $1,499",
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
    ["Coordination en anglais", "Nous organisons, traduisons et résumons votre dossier."],
    ["Voyage optionnel", "Commencez en ligne. Voyagez seulement si cela convient à votre cas."],
  ],
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

function PlanCard({ plan, featured }: { plan: Plan; featured?: boolean }) {
  return (
    <Dialog>
      <div className={`group flex h-full flex-col rounded-2xl bg-white p-3 shadow-card ${featured ? "ring-2 ring-[#1DA78A]/40" : ""}`}>
        <PlanVisual variant={plan.variant} />
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center justify-between gap-3">
            <span className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${featured ? "bg-[#1DA78A] text-white" : "bg-[#F0F4F3] text-[#0F638E]"}`}>
              {plan.badge}
            </span>
            <span className="text-lg font-bold text-[#003B5C]">{plan.price}</span>
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

  useEffect(() => {
    document.title = copy.metaTitle;
  }, [copy.metaTitle]);

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

        <section id="review-options" className="bg-white py-12 sm:py-16 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader label={copy.review.label} title={copy.review.title} body={copy.review.body} />
            <div className="grid gap-6 lg:grid-cols-3">
              {copy.review.plans.map((plan, index) => (
                <ScrollReveal key={plan.title} direction="up" delay={index * 0.06}>
                  <PlanCard plan={plan} featured={index === 1} />
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

        <section className="bg-[#F0F4F3] py-12 sm:py-16 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader label={copy.specialists.label} title={copy.specialists.title} body={copy.specialists.body} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {copy.specialists.items.map(([title, body], index) => (
                <InfoCard key={title} title={title} body={body} index={index} />
              ))}
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

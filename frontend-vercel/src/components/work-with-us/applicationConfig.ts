import type { PartnershipApplicationType } from "@/services/api/partnershipApplications";

export type PartnershipApplicationLocale = "en" | "zh";

export type PartnershipFieldDefinition = {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "tel" | "url" | "textarea" | "select";
  required?: boolean;
  storage?: "root" | "details";
  fullWidth?: boolean;
  options?: Array<{ label: string; value: string }>;
};

export type PartnershipApplicationDefinition = {
  title: string;
  description: string;
  promise: string;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
  fields: PartnershipFieldDefinition[];
};

const baseFields = {
  organizationName: {
    id: "organizationName",
    type: "text",
    required: true,
    storage: "root",
  },
  website: {
    id: "website",
    type: "url",
    storage: "root",
  },
  contactName: {
    id: "contactName",
    type: "text",
    required: true,
    storage: "root",
  },
  jobTitle: {
    id: "jobTitle",
    type: "text",
    storage: "root",
  },
  email: {
    id: "email",
    type: "email",
    required: true,
    storage: "root",
  },
  phone: {
    id: "phone",
    type: "tel",
    storage: "root",
  },
  whatsapp: {
    id: "whatsapp",
    type: "tel",
    storage: "root",
  },
  wechat: {
    id: "wechat",
    type: "text",
    storage: "root",
  },
  country: {
    id: "country",
    type: "text",
    storage: "root",
  },
  city: {
    id: "city",
    type: "text",
    storage: "root",
  },
  notes: {
    id: "notes",
    type: "textarea",
    storage: "root",
    fullWidth: true,
  },
} as const;

const copy = {
  en: {
    hospitals: {
      title: "Apply to join our hospital network",
      description: "Share the essentials first. We only ask for the information needed to understand your clinical strengths and international patient readiness.",
      promise: "Partnership review starts within 2 business days. If there is a fit, our team will follow up for documents and onboarding.",
      submitLabel: "Submit hospital network application",
      successTitle: "Hospital application received",
      successMessage: "Thank you. Our partnerships team has your hospital application and will review it shortly.",
      fields: [
        { ...baseFields.organizationName, label: "Hospital or clinic name", placeholder: "Shanghai Example Hospital" },
        { ...baseFields.city, label: "Primary city", placeholder: "Shanghai" },
        { ...baseFields.website, label: "Website", placeholder: "https://example.com" },
        { ...baseFields.contactName, label: "Primary contact", placeholder: "Dr. Lin Chen" },
        { ...baseFields.jobTitle, label: "Role or title", placeholder: "International patient director" },
        { ...baseFields.email, label: "Work email", placeholder: "partner@example.com" },
        { ...baseFields.phone, label: "Phone", placeholder: "+86 ..." },
        { ...baseFields.whatsapp, label: "WhatsApp", placeholder: "+1 ..." },
        { ...baseFields.wechat, label: "WeChat", placeholder: "WeChat ID" },
        {
          id: "services",
          label: "Key departments or procedures",
          placeholder: "Cardiology, oncology, orthopedic surgery, robotic surgery...",
          type: "textarea",
          required: true,
          storage: "details",
          fullWidth: true,
        },
        {
          id: "readiness",
          label: "International patient readiness",
          placeholder: "English-speaking coordinators, translated discharge notes, itemized estimates, admission flow...",
          type: "textarea",
          required: true,
          storage: "details",
          fullWidth: true,
        },
        {
          id: "credentials",
          label: "Accreditation or license notes",
          placeholder: "Class 3A, JCI, specialist center credentials, compliance notes...",
          type: "textarea",
          required: true,
          storage: "details",
          fullWidth: true,
        },
        {
          ...baseFields.notes,
          label: "Anything else we should know?",
          placeholder: "Share standout departments, international case volume, languages, or upcoming expansion plans.",
        },
      ],
    },
    "referral-partners": {
      title: "Apply to become a referral partner",
      description: "Share the essentials first. We only ask for the information needed to understand your market coverage and referral readiness.",
      promise: "We review partner applications quickly and will reach out if we see a strong fit with Medora's patient-first model.",
      submitLabel: "Submit referral partner application",
      successTitle: "Referral partner application received",
      successMessage: "Thank you. We have your referral partner application and will follow up if we would like to continue onboarding.",
      fields: [
        { ...baseFields.organizationName, label: "Organization name", placeholder: "Global Wellness Advisors" },
        { ...baseFields.country, label: "Primary country or market", placeholder: "United Arab Emirates" },
        { ...baseFields.website, label: "Website or social profile", placeholder: "https://example.com" },
        { ...baseFields.contactName, label: "Primary contact", placeholder: "Maya Rahman" },
        { ...baseFields.jobTitle, label: "Role or title", placeholder: "Founder" },
        { ...baseFields.email, label: "Work email", placeholder: "maya@example.com" },
        { ...baseFields.phone, label: "Phone", placeholder: "+971 ..." },
        { ...baseFields.whatsapp, label: "WhatsApp", placeholder: "+971 ..." },
        {
          id: "referralVolume",
          label: "Estimated monthly referral volume",
          placeholder: "For example: 5-10 qualified patient introductions per month",
          type: "text",
          required: true,
          storage: "details",
        },
        {
          id: "languages",
          label: "Languages and markets covered",
          placeholder: "English, Arabic, Russian...",
          type: "text",
          required: true,
          storage: "details",
        },
        {
          ...baseFields.notes,
          label: "Additional context",
          placeholder: "Tell us how you earn trust with patients or what makes your network especially relevant.",
        },
      ],
    },
    "travel-services": {
      title: "Apply as a service provider",
      description: "This short application helps us understand your service footprint, operating credentials, and fit for medical travel support.",
      promise: "If your coverage and standards match our needs, we will contact you for vetting and onboarding.",
      submitLabel: "Submit service provider application",
      successTitle: "Service provider application received",
      successMessage: "Thank you. We have your service provider application and will be in touch if we would like to move forward.",
      fields: [
        { ...baseFields.organizationName, label: "Company name", placeholder: "Shanghai Medical Mobility Co." },
        {
          id: "serviceCategory",
          label: "Service category",
          placeholder: "Select a category",
          type: "select",
          required: true,
          storage: "details",
          options: [
            { label: "Interpreter services", value: "Interpreter services" },
            { label: "Ground transport", value: "Ground transport" },
            { label: "Accommodation", value: "Accommodation" },
            { label: "Visa support", value: "Visa support" },
            { label: "Companion or caregiver services", value: "Companion or caregiver services" },
            { label: "Other", value: "Other" },
          ],
        },
        {
          id: "coverage",
          label: "Coverage cities",
          placeholder: "Shanghai, Hangzhou, Suzhou...",
          type: "text",
          required: true,
          storage: "details",
        },
        { ...baseFields.website, label: "Website", placeholder: "https://example.com" },
        { ...baseFields.contactName, label: "Primary contact", placeholder: "Alicia Sun" },
        { ...baseFields.jobTitle, label: "Role or title", placeholder: "Operations manager" },
        { ...baseFields.email, label: "Work email", placeholder: "ops@example.com" },
        { ...baseFields.phone, label: "Phone", placeholder: "+86 ..." },
        { ...baseFields.whatsapp, label: "WhatsApp", placeholder: "+44 ..." },
        { ...baseFields.wechat, label: "WeChat", placeholder: "Optional" },
        {
          id: "languages",
          label: "Languages supported",
          placeholder: "English, Arabic, Russian...",
          type: "text",
          required: true,
          storage: "details",
        },
        {
          id: "credentials",
          label: "License or operating credentials",
          placeholder: "Business license, transport permit, hospitality credentials, interpreter certification...",
          type: "textarea",
          required: true,
          storage: "details",
          fullWidth: true,
        },
        {
          id: "experience",
          label: "Medical traveler experience",
          placeholder: "Describe the kinds of patients or high-support cases you already serve.",
          type: "textarea",
          required: true,
          storage: "details",
          fullWidth: true,
        },
        {
          ...baseFields.notes,
          label: "Additional notes",
          placeholder: "Anything else that helps us understand your reliability, scheduling model, or patient support standards.",
        },
      ],
    },
  },
  zh: {
    hospitals: {
      title: "申请加入医院合作网络",
      description: "先提交最核心的信息即可。我们只收集判断合作匹配度所需的最少内容。",
      promise: "我们通常会在 2 个工作日内开始审核；如有进一步合作意向，会联系您补充材料并安排入驻流程。",
      submitLabel: "提交医院合作申请",
      successTitle: "已收到医院合作申请",
      successMessage: "感谢提交。我们的合作团队已收到贵机构申请，会尽快审核。",
      fields: [
        { ...baseFields.organizationName, label: "医院或诊所名称", placeholder: "上海示例医院" },
        { ...baseFields.city, label: "所在城市", placeholder: "上海" },
        { ...baseFields.website, label: "官网", placeholder: "https://example.com" },
        { ...baseFields.contactName, label: "主要联系人", placeholder: "陈琳" },
        { ...baseFields.jobTitle, label: "职位", placeholder: "国际患者中心负责人" },
        { ...baseFields.email, label: "工作邮箱", placeholder: "partner@example.com" },
        { ...baseFields.phone, label: "电话", placeholder: "+86 ..." },
        { ...baseFields.whatsapp, label: "WhatsApp", placeholder: "+1 ..." },
        { ...baseFields.wechat, label: "微信", placeholder: "微信号" },
        {
          id: "services",
          label: "重点科室或项目",
          placeholder: "请填写核心科室、重点治疗项目或国际患者常见需求。",
          type: "textarea",
          required: true,
          storage: "details",
          fullWidth: true,
        },
        {
          id: "readiness",
          label: "国际患者接待能力",
          placeholder: "例如英文协调员、英文病历摘要、美元明细报价、国际患者接诊流程等。",
          type: "textarea",
          required: true,
          storage: "details",
          fullWidth: true,
        },
        {
          id: "credentials",
          label: "资质与认证说明",
          placeholder: "例如三甲、JCI、重点专科认证、合规记录等。",
          type: "textarea",
          required: true,
          storage: "details",
          fullWidth: true,
        },
        {
          ...baseFields.notes,
          label: "补充说明",
          placeholder: "可补充国际患者量级、语言支持、特色专科或扩展计划。",
        },
      ],
    },
    "referral-partners": {
      title: "申请成为转介合作伙伴",
      description: "先提交最核心的信息即可。我们只收集判断覆盖市场与转介协作能力所需的最少内容。",
      promise: "我们会优先筛选与 Medora 患者优先原则高度匹配的合作方。",
      submitLabel: "提交转介合作申请",
      successTitle: "已收到转介合作申请",
      successMessage: "感谢提交。我们已收到您的转介合作申请，如匹配会尽快联系您。",
      fields: [
        { ...baseFields.organizationName, label: "机构名称", placeholder: "Global Wellness Advisors" },
        { ...baseFields.country, label: "主要国家或市场", placeholder: "阿联酋" },
        { ...baseFields.website, label: "官网或社媒主页", placeholder: "https://example.com" },
        { ...baseFields.contactName, label: "主要联系人", placeholder: "Maya Rahman" },
        { ...baseFields.jobTitle, label: "职位", placeholder: "创始人" },
        { ...baseFields.email, label: "工作邮箱", placeholder: "maya@example.com" },
        { ...baseFields.phone, label: "电话", placeholder: "+971 ..." },
        { ...baseFields.whatsapp, label: "WhatsApp", placeholder: "+971 ..." },
        {
          id: "referralVolume",
          label: "预计每月转介量",
          placeholder: "例如：每月 5-10 个高意向患者线索",
          type: "text",
          required: true,
          storage: "details",
        },
        {
          id: "languages",
          label: "覆盖语言与市场",
          placeholder: "英语、阿拉伯语、俄语等",
          type: "text",
          required: true,
          storage: "details",
        },
        {
          ...baseFields.notes,
          label: "补充说明",
          placeholder: "可补充您的社群信任基础、服务方式或合作亮点。",
        },
      ],
    },
    "travel-services": {
      title: "申请成为服务合作方",
      description: "这份申请会帮助我们理解您的服务范围、运营资质和医疗旅客支持经验。",
      promise: "如服务能力与我们的需求匹配，我们会继续联系您完成审核与入驻。",
      submitLabel: "提交服务合作申请",
      successTitle: "已收到服务合作申请",
      successMessage: "感谢提交。我们已收到您的服务合作申请，如需进一步推进会尽快联系您。",
      fields: [
        { ...baseFields.organizationName, label: "公司名称", placeholder: "上海医疗接待服务有限公司" },
        {
          id: "serviceCategory",
          label: "服务类别",
          placeholder: "请选择服务类别",
          type: "select",
          required: true,
          storage: "details",
          options: [
            { label: "医学翻译", value: "医学翻译" },
            { label: "接送与交通", value: "接送与交通" },
            { label: "住宿服务", value: "住宿服务" },
            { label: "签证支持", value: "签证支持" },
            { label: "陪护服务", value: "陪护服务" },
            { label: "其他", value: "其他" },
          ],
        },
        {
          id: "coverage",
          label: "覆盖城市",
          placeholder: "上海、杭州、苏州等",
          type: "text",
          required: true,
          storage: "details",
        },
        { ...baseFields.website, label: "官网", placeholder: "https://example.com" },
        { ...baseFields.contactName, label: "主要联系人", placeholder: "孙 Alicia" },
        { ...baseFields.jobTitle, label: "职位", placeholder: "运营经理" },
        { ...baseFields.email, label: "工作邮箱", placeholder: "ops@example.com" },
        { ...baseFields.phone, label: "电话", placeholder: "+86 ..." },
        { ...baseFields.whatsapp, label: "WhatsApp", placeholder: "+44 ..." },
        { ...baseFields.wechat, label: "微信", placeholder: "可选" },
        {
          id: "languages",
          label: "可支持语言",
          placeholder: "英语、阿拉伯语、俄语等",
          type: "text",
          required: true,
          storage: "details",
        },
        {
          id: "credentials",
          label: "经营资质或许可",
          placeholder: "例如营业执照、运输许可、住宿资质、翻译证书等。",
          type: "textarea",
          required: true,
          storage: "details",
          fullWidth: true,
        },
        {
          id: "experience",
          label: "医疗旅客服务经验",
          placeholder: "请说明您服务过的患者类型、陪诊经验或高支持场景经验。",
          type: "textarea",
          required: true,
          storage: "details",
          fullWidth: true,
        },
        {
          ...baseFields.notes,
          label: "补充说明",
          placeholder: "可补充排班能力、响应机制、患者安全标准等。",
        },
      ],
    },
  },
} as const;

export function getPartnershipApplicationDefinition(
  type: PartnershipApplicationType,
  locale: PartnershipApplicationLocale,
): PartnershipApplicationDefinition {
  const localizedCopy = copy[locale] ?? copy.en;
  return localizedCopy[type];
}

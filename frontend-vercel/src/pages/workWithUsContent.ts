export type WorkWithUsTabId = "hospitals" | "referral-partners" | "travel-services";

export interface WorkWithUsSectionCard {
  title: string;
  body?: string;
  bullets?: string[];
  accent?: "blue" | "green" | "teal" | "amber" | "coral";
}

export interface WorkWithUsContentBlock {
  label: string;
  layout: "two" | "three" | "badges" | "steps";
  cards: WorkWithUsSectionCard[];
}

export interface WorkWithUsTabContent {
  id: WorkWithUsTabId;
  tabLabel: string;
  icon: string;
  heading: string;
  description: string;
  callout: string;
  ctaLabel: string;
  ctaHref: string;
  blocks: WorkWithUsContentBlock[];
}

export const workWithUsContent = {
  en: {
    eyebrow: "Work with us",
    title: "Join China's trusted medical tourism network",
    subtitle:
      "We bring together verified hospitals, trusted referral advisors, and experienced travel providers so international patients can access safe, coordinated, and well-supported care in China.",
    tabs: [
      {
        id: "hospitals",
        tabLabel: "Hospitals & Clinics",
        icon: "🏥",
        heading: "Hospitals & Clinics",
        description:
          "We partner with licensed, vetted hospitals and specialist clinics across mainland China that can support international patients with clear processes and dependable follow-through.",
        callout:
          "Our Patient Charter requires transparent pricing, timely responses to patient inquiries, and a designated English-speaking contact for every international case. We continuously review compliance and remove partners who fall short.",
        ctaLabel: "Apply to join our hospital network",
        ctaHref: "/work-with-us/hospitals/apply",
        blocks: [
          {
            label: "Our standards for partner hospitals",
            layout: "two",
            cards: [
              {
                title: "Licensing & accreditation",
                accent: "blue",
                bullets: [
                  "Valid Class 2 or Class 3 hospital license issued by China's National Health Commission.",
                  "Specialist departments certified by the relevant medical board.",
                  "JCI accreditation or an equivalent quality certification is preferred.",
                  "Clean regulatory compliance record with no unresolved patient safety violations.",
                ],
              },
              {
                title: "International patient readiness",
                accent: "blue",
                bullets: [
                  "English-speaking patient coordinator or interpreter on staff.",
                  "Ability to provide itemized cost estimates in USD before treatment.",
                  "Dedicated international patient admission pathway.",
                  "Medical records and discharge summaries available in English.",
                ],
              },
            ],
          },
          {
            label: "What patients can expect from our hospital partners",
            layout: "three",
            cards: [
              {
                title: "Transparent pricing",
                accent: "teal",
                body: "Every partner hospital commits to clear, itemized cost estimates in USD before procedures begin.",
              },
              {
                title: "Responsive communication",
                accent: "teal",
                body: "A dedicated English-speaking point of contact supports each international patient with a 48-hour response commitment.",
              },
              {
                title: "Continuity of care",
                accent: "teal",
                body: "Patients leave with English discharge materials and follow-up guidance they can share with their local doctors.",
              },
            ],
          },
          {
            label: "How hospitals join our network",
            layout: "steps",
            cards: [
              {
                title: "Submit an application",
                body: "Share your departments, procedures, international patient capacity, and language capabilities.",
              },
              {
                title: "Document review",
                body: "Our medical affairs team reviews licenses, accreditations, and credentials within 5 to 7 business days.",
              },
              {
                title: "Quality audit",
                body: "An onboarding specialist conducts an on-site or virtual walkthrough to assess international patient readiness.",
              },
              {
                title: "Partnership agreement",
                body: "Approved hospitals sign our Partnership Agreement and formally commit to the Patient Charter.",
              },
              {
                title: "Listed on the platform",
                body: "Hospital profiles, procedures, and pricing are published for patients worldwide once onboarding is complete.",
              },
            ],
          },
        ],
      },
      {
        id: "referral-partners",
        tabLabel: "Referral Advisors",
        icon: "🤝",
        heading: "Referral Advisors & Patient Advocates",
        description:
          "We work with trusted advisors, facilitators, and community organizations who help patients evaluate care options in China with transparency and patient-first judgment.",
        callout:
          "Every patient referred through an advisor receives the same care standards, pricing transparency, and platform protections as direct patients. Advisors never control clinical decisions, hospital assignments, or pricing.",
        ctaLabel: "Apply to become a referral partner",
        ctaHref: "/work-with-us/referral-partners/apply",
        blocks: [
          {
            label: "Who we work with",
            layout: "badges",
            cards: [
              { title: "Healthcare consultants", accent: "green" },
              { title: "Medical facilitators", accent: "teal" },
              { title: "Overseas Chinese community organizations", accent: "green" },
              { title: "Wellness & integrative health clinics", accent: "teal" },
              { title: "Corporate health & employee benefits advisors", accent: "green" },
              { title: "Immigration & relocation consultants", accent: "teal" },
              { title: "Online health communities & patient groups", accent: "green" },
              { title: "Insurance & financial wellness advisors", accent: "teal" },
            ],
          },
          {
            label: "Our standards for referral partners",
            layout: "two",
            cards: [
              {
                title: "What we require",
                accent: "green",
                bullets: [
                  "A legally registered business or organization in your country.",
                  "Genuine access to patients or communities seeking medical care.",
                  "Completion of our free partner orientation.",
                  "Agreement to our Patient-First Code of Conduct.",
                ],
              },
              {
                title: "Patient-first commitments",
                accent: "green",
                bullets: [
                  "Represent hospital capabilities accurately and never exaggerate outcomes.",
                  "Never collect patient payments or deposits directly.",
                  "Disclose your role as a referring advisor when asked.",
                  "Refer patients only to procedures appropriate for their condition.",
                ],
              },
            ],
          },
          {
            label: "What referral partners have access to",
            layout: "three",
            cards: [
              {
                title: "Patient resources",
                accent: "teal",
                body: "Procedure guides, hospital profiles, pricing information, and patient education materials in multiple languages.",
              },
              {
                title: "Case support",
                accent: "teal",
                body: "Our case managers handle medical coordination, scheduling, and hospital communication for each referred patient.",
              },
              {
                title: "Partner portal",
                accent: "teal",
                body: "Partners can submit patient inquiries, track case progress, and review updated hospital and procedure information.",
              },
            ],
          },
          {
            label: "How to become a referral partner",
            layout: "steps",
            cards: [
              {
                title: "Register online",
                body: "Tell us about your organization, target markets, referral volume, and business registration details.",
              },
              {
                title: "Complete the orientation",
                body: "Finish a short program covering the platform, referral process, patient safety, and compliance.",
              },
              {
                title: "Sign the partner agreement",
                body: "Commit to our Patient-First Code of Conduct and receive portal access and referral tools.",
              },
              {
                title: "Start helping patients",
                body: "Submit inquiries through the portal while our medical team manages downstream clinical coordination.",
              },
            ],
          },
        ],
      },
      {
        id: "travel-services",
        tabLabel: "Travel & Ground Services",
        icon: "✈️",
        heading: "Travel & Ground Service Providers",
        description:
          "We work with licensed travel agencies, interpreters, transportation operators, and accommodation providers who understand the needs of international medical travelers.",
        callout:
          "Patient safety is non-negotiable. Every active patient case must have a 24/7 emergency contact, and any failure to meet patient care obligations results in immediate removal from the platform.",
        ctaLabel: "Apply as a service provider",
        ctaHref: "/work-with-us/travel-services/apply",
        blocks: [
          {
            label: "Who we work with",
            layout: "badges",
            cards: [
              { title: "Licensed inbound travel agencies", accent: "amber" },
              { title: "Airport transfer & transport operators", accent: "coral" },
              { title: "Medical interpreter services", accent: "amber" },
              { title: "Serviced apartment & hotel providers", accent: "coral" },
              { title: "Medical visa consultants", accent: "amber" },
              { title: "Post-surgery recovery retreat operators", accent: "coral" },
              { title: "Patient companion & caregiver services", accent: "amber" },
              { title: "Meal delivery & dietary support services", accent: "coral" },
            ],
          },
          {
            label: "Services we connect patients with",
            layout: "three",
            cards: [
              {
                title: "Arrival & transfers",
                accent: "amber",
                bullets: [
                  "Airport pickup and drop-off in medical-ready vehicles.",
                  "Hospital escort on admission day.",
                  "Daily transport between accommodation and hospital.",
                  "Pharmacy and errand runs during recovery.",
                ],
              },
              {
                title: "Accommodation",
                accent: "amber",
                bullets: [
                  "Hotels or serviced apartments near the treating hospital.",
                  "Options suitable for accompanying family members.",
                  "Recovery-friendly setups with dietary catering.",
                  "Flexible check-in aligned with discharge dates.",
                ],
              },
              {
                title: "Language & guidance",
                accent: "amber",
                bullets: [
                  "Certified medical interpreters for English, Arabic, Russian, and more.",
                  "Hospital appointment accompaniment.",
                  "Help navigating payments, prescriptions, and paperwork.",
                  "WeChat Pay and Alipay setup assistance.",
                ],
              },
            ],
          },
          {
            label: "Visa & entry support",
            layout: "two",
            cards: [
              {
                title: "Medical visa guidance",
                accent: "coral",
                bullets: [
                  "Coordination of hospital invitation letters for medical visa applications.",
                  "Country-specific guidance on visa requirements and timelines.",
                  "Transit-visa eligibility checks for qualifying nationalities.",
                ],
              },
              {
                title: "Pre-arrival preparation",
                accent: "coral",
                bullets: [
                  "Document checklist before departure.",
                  "Emergency contact registration and companion arrangements.",
                  "Local SIM, navigation apps, and payment setup guidance.",
                ],
              },
            ],
          },
          {
            label: "Our standards for travel & service partners",
            layout: "two",
            cards: [
              {
                title: "Requirements to join",
                accent: "amber",
                bullets: [
                  "Valid business license in your area of operation.",
                  "Experience serving medical travelers or vulnerable patients.",
                  "24/7 emergency contact availability for active cases.",
                  "Compliance with local transportation and hospitality regulations.",
                ],
              },
              {
                title: "Patient care obligations",
                accent: "amber",
                bullets: [
                  "Accompany patients to hospital appointments when contracted to do so.",
                  "Never leave a patient without a point of contact during their stay.",
                  "Escalate patient safety concerns to our case management team immediately.",
                  "Maintain confidentiality of all patient health and personal information.",
                ],
              },
            ],
          },
          {
            label: "How to join as a service provider",
            layout: "steps",
            cards: [
              {
                title: "Submit your service profile",
                body: "Describe your services, coverage cities, supported languages, and experience with medical travelers.",
              },
              {
                title: "Review & vetting",
                body: "Our partnerships team reviews credentials and may request a short call to assess service quality.",
              },
              {
                title: "Onboarding",
                body: "Set up listings, availability, and pricing in the provider portal and complete our patient care standards training.",
              },
              {
                title: "Start supporting patients",
                body: "Receive case assignments matched to your city and service type while our case managers stay involved.",
              },
            ],
          },
        ],
      },
    ] as WorkWithUsTabContent[],
  },
  zh: {
    eyebrow: "与我们合作",
    title: "加入值得信赖的中国医疗旅游合作网络",
    subtitle:
      "我们连接经过审核的医院、可靠的转介顾问和成熟的在地服务提供方，让国际患者在中国获得更安全、更顺畅、更有支持的医疗旅程。",
    tabs: [
      {
        id: "hospitals",
        tabLabel: "医院与诊所",
        icon: "🏥",
        heading: "医院与诊所",
        description:
          "我们只与中国大陆具备执照、通过审核、并能满足国际患者接待标准的医院和专科诊所合作。",
        callout:
          "我们的《患者服务承诺》要求合作医院提供透明报价、及时回复患者咨询，并为每个国际病例指定英语联络人。未能持续达标的机构会被移出网络。",
        ctaLabel: "申请加入医院合作网络",
        ctaHref: "/work-with-us/hospitals/apply",
        blocks: [
          {
            label: "合作医院标准",
            layout: "two",
            cards: [
              {
                title: "资质与认证",
                accent: "blue",
                bullets: [
                  "具备中国国家卫生健康主管部门颁发的二级或三级医院资质。",
                  "重点专科具备相应专业资质或认证。",
                  "优先考虑 JCI 或同等级质量认证机构。",
                  "无未解决的重大患者安全违规记录。",
                ],
              },
              {
                title: "国际患者接待能力",
                accent: "blue",
                bullets: [
                  "院内配备英文协调员或医学翻译。",
                  "可在治疗前提供美元计价的明细预估。",
                  "有独立的国际患者接诊流程。",
                  "可提供英文病历摘要和出院材料。",
                ],
              },
            ],
          },
          {
            label: "患者可期待的合作医院体验",
            layout: "three",
            cards: [
              {
                title: "透明报价",
                accent: "teal",
                body: "所有合作医院都需在治疗前给出清晰、可拆分的费用说明。",
              },
              {
                title: "响应及时",
                accent: "teal",
                body: "每位国际患者都有明确联络窗口，并承诺在合理时限内反馈。",
              },
              {
                title: "照护连续性",
                accent: "teal",
                body: "患者离院时可带走英文出院资料与后续随访建议，方便回国衔接。",
              },
            ],
          },
          {
            label: "加入流程",
            layout: "steps",
            cards: [
              { title: "提交申请", body: "提供科室、可开展项目、国际患者容量与语言支持信息。" },
              { title: "文件审核", body: "医疗事务团队审核执照、认证与服务资质。" },
              { title: "质量评估", body: "入驻专员进行现场或线上走查，确认国际患者准备度。" },
              { title: "签署合作协议", body: "审核通过后签署合作协议并承诺遵守患者服务标准。" },
              { title: "平台上线", body: "完成入驻后，医院简介、服务项目和报价信息可在平台展示。" },
            ],
          },
        ],
      },
      {
        id: "referral-partners",
        tabLabel: "转介合作伙伴",
        icon: "🤝",
        heading: "转介顾问与患者倡导方",
        description:
          "我们与值得信赖的顾问、医疗协调人和社群组织合作，帮助患者更透明地评估来华医疗选择。",
        callout:
          "通过转介进入平台的患者，享有与直接访问平台患者完全一致的标准、价格透明度与流程保护。转介方不会决定临床方案、医院分配或价格。",
        ctaLabel: "申请成为转介合作伙伴",
        ctaHref: "/work-with-us/referral-partners/apply",
        blocks: [
          {
            label: "合作对象",
            layout: "badges",
            cards: [
              { title: "医疗顾问", accent: "green" },
              { title: "医疗协调机构", accent: "teal" },
              { title: "海外华人社群组织", accent: "green" },
              { title: "健康与整合医疗机构", accent: "teal" },
              { title: "企业健康与福利顾问", accent: "green" },
              { title: "移民与安家顾问", accent: "teal" },
              { title: "线上病友社区与患者组织", accent: "green" },
              { title: "保险与财务健康顾问", accent: "teal" },
            ],
          },
          {
            label: "合作标准",
            layout: "two",
            cards: [
              {
                title: "基础要求",
                accent: "green",
                bullets: [
                  "在所在国家或地区合法注册。",
                  "确有接触潜在患者或相关社群的渠道。",
                  "完成我们的免费合作伙伴培训。",
                  "同意遵守以患者为先的行为准则。",
                ],
              },
              {
                title: "患者优先承诺",
                accent: "green",
                bullets: [
                  "不得夸大医院能力或治疗效果。",
                  "不得直接向患者收取订金或治疗款。",
                  "在患者询问时应清晰披露自己的转介身份。",
                  "仅推荐与患者情况相适配的治疗方向。",
                ],
              },
            ],
          },
          {
            label: "合作伙伴可获得的支持",
            layout: "three",
            cards: [
              { title: "患者资料", accent: "teal", body: "可分享多语言项目介绍、医院资料、价格信息和患者教育材料。" },
              { title: "病例支持", accent: "teal", body: "我们的案例经理负责后续医疗协调、预约安排和院方沟通。" },
              { title: "合作伙伴后台", accent: "teal", body: "可提交患者线索、查看进度，并获取最新医院与项目信息。" },
            ],
          },
          {
            label: "加入流程",
            layout: "steps",
            cards: [
              { title: "线上注册", body: "提交机构背景、覆盖市场、预计转介量和营业登记信息。" },
              { title: "完成培训", body: "学习平台流程、患者安全标准和合规要求。" },
              { title: "签署协议", body: "确认遵守合作守则并获得后台权限与转介工具。" },
              { title: "开始帮助患者", body: "通过后台提交患者需求，由我们的医疗团队继续推进临床协调。" },
            ],
          },
        ],
      },
      {
        id: "travel-services",
        tabLabel: "旅行与在地服务",
        icon: "✈️",
        heading: "旅行与地接服务合作方",
        description:
          "我们与持证旅行社、翻译、接送服务和住宿供应方合作，支持国际患者在中国的就医旅程。",
        callout:
          "患者安全不可妥协。每个在服务中的患者案例都必须有 24/7 紧急联系人，任何未履行照护义务的情况都会导致立即下线。",
        ctaLabel: "申请成为服务合作方",
        ctaHref: "/work-with-us/travel-services/apply",
        blocks: [
          {
            label: "合作对象",
            layout: "badges",
            cards: [
              { title: "持证入境旅行社", accent: "amber" },
              { title: "机场接送与交通服务商", accent: "coral" },
              { title: "医学翻译服务", accent: "amber" },
              { title: "服务式公寓与酒店", accent: "coral" },
              { title: "医疗签证顾问", accent: "amber" },
              { title: "术后康复休养机构", accent: "coral" },
              { title: "患者陪护服务", accent: "amber" },
              { title: "餐饮配送与营养支持", accent: "coral" },
            ],
          },
          {
            label: "我们可连接的服务内容",
            layout: "three",
            cards: [
              {
                title: "抵达与接送",
                accent: "amber",
                bullets: [
                  "机场接送和医疗友好型车辆安排。",
                  "住院日陪同入院。",
                  "住宿与医院之间的日常往返。",
                  "恢复期药房和生活事务协助。",
                ],
              },
              {
                title: "住宿安排",
                accent: "amber",
                bullets: [
                  "医院附近酒店或服务式公寓。",
                  "适合陪同家属入住的选择。",
                  "更利于恢复的环境和餐饮支持。",
                  "与出院日期联动的灵活入住安排。",
                ],
              },
              {
                title: "语言与在地引导",
                accent: "amber",
                bullets: [
                  "多语种医学翻译支持。",
                  "门诊和住院期间陪同。",
                  "协助处理付款、取药和手续。",
                  "微信支付、支付宝等工具设置协助。",
                ],
              },
            ],
          },
          {
            label: "签证与入境支持",
            layout: "two",
            cards: [
              {
                title: "医疗签证指导",
                accent: "coral",
                bullets: [
                  "协助准备医院邀请函等签证材料。",
                  "按护照国家提供签证要求与时效建议。",
                  "协助判断符合条件旅客的过境政策适用性。",
                ],
              },
              {
                title: "出发前准备",
                accent: "coral",
                bullets: [
                  "出发前文件清单。",
                  "紧急联系人登记与陪同安排。",
                  "本地 SIM 卡、导航与支付工具准备建议。",
                ],
              },
            ],
          },
          {
            label: "合作标准",
            layout: "two",
            cards: [
              {
                title: "加入要求",
                accent: "amber",
                bullets: [
                  "在服务所在地持有有效经营资质。",
                  "有服务医疗旅客或脆弱患者群体的经验。",
                  "在活跃病例期间提供 24/7 紧急联络。",
                  "遵守当地交通与住宿监管要求。",
                ],
              },
              {
                title: "患者照护义务",
                accent: "amber",
                bullets: [
                  "若合同约定，应按时陪同患者就医。",
                  "患者在中国停留期间不得失联或无人响应。",
                  "发现安全风险时立即上报案例管理团队。",
                  "严格保护患者健康与个人隐私信息。",
                ],
              },
            ],
          },
          {
            label: "加入流程",
            layout: "steps",
            cards: [
              { title: "提交服务资料", body: "说明服务内容、覆盖城市、支持语言和医疗旅客服务经验。" },
              { title: "审核评估", body: "合作团队审核资质，并可能安排短会评估服务质量。" },
              { title: "入驻培训", body: "完成后台开通、价格与档期设置，以及患者照护标准培训。" },
              { title: "开始服务患者", body: "根据城市和服务类型接收匹配案例，同时由我们的案例经理全程协同。" },
            ],
          },
        ],
      },
    ] as WorkWithUsTabContent[],
  },
} as const;

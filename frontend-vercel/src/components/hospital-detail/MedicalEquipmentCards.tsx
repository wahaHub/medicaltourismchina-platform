

// Next Image removed;

const equipmentData = [
  {
    id: 1,
    image: "/hospital-detail/radio_surgery_banner.png",
    title: "STEREOTACTIC RADIOSURGERY SYSTEM (SRS/SBRT PLATFORM, SUCH AS GAMMA KNIFE/EDGE)",
    description:
      "High dose precision radiotherapy for intracranial/extracranial lesions, with sub millimeter level localization and real-time imaging guidance, significantly shortens the course of treatment and reduces the dose to surrounding tissues.",
    textPosition: "left",
  },
  {
    id: 2,
    image: "/hospital-detail/dsct.png",
    title: "高端PET-CT分子影像系统",
    description:
      "用于肿瘤分期、疗效评估与复发监测，以及心肌代谢与部分神经退行性疾病评估；具备高灵敏度探测器与低剂量成像流程。",
    textPosition: "left",
  },
  {
    id: 3,
    image: "/hospital-detail/dsct.png",
    title: "双源超高端CT（DSCT）",
    description:
      "双球管高时间分辨率，心脏冠脉成像可在高心率下获得清晰图像；能谱成像助力痛风、结石成分鉴别与肿瘤定量分析。",
    textPosition: "left",
  },
  {
    id: 4,
    image: "/hospital-detail/dsct.png",
    title: "混合手术室（Hybrid OR）",
    description:
      "集成高端数字血管机与外科无菌手术平台，实现TAVR、主动脉支架、复杂肿瘤切除+血管重建等介入-外科同台治疗。",
    textPosition: "left",
  },
  {
    id: 5,
    image: "/hospital-detail/dsct.png",
    title: "达芬奇XI手术机器人系统",
    description:
      "具备多臂协同、Firefly荧光成像与腕式器械，适用于泌尿、普外、妇科、胸外等高精度微创手术，降低失血与并发症。",
    textPosition: "left",
  },
  {
    id: 6,
    image: "/hospital-detail/dsct.png",
    title: "结构性心脏介入平台（TAVR/TEER+影像融合）",
    description:
      "基于三维成像与术中融合导航，实现重度主动脉瓣狭窄与二尖瓣反流的微创经导管治疗，覆盖围术期超声/麻醉与重症管理。",
    textPosition: "left",
  },
  {
    id: 7,
    image: "/hospital-detail/dsct.png",
    title: "核素治疗中心（放射性核素精准治疗）",
    description:
      "规范开展I-131甲状腺癌/甲亢治疗，并具备开展符合监管要求的Lu-177相关临床研究与示范应用条件（以官方公布为准），配置屏蔽病房与放射安全管理体系。",
    textPosition: "left",
  },
];

export default function MedicalEquipmentCards() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
        <div className="space-y-6 sm:space-y-8">
          {equipmentData.map((equipment) => (
            <div
              key={equipment.id}
              className="relative h-[225px] sm:h-[270px] md:h-[340px] rounded-2xl sm:rounded-3xl overflow-hidden group"
            >
              {/* Background Image */}
              <img
                src={equipment.image}
                alt={equipment.title}
                className="w-full h-full object-cover"
                className="object-cover"
                
                
              />

              {/* Gradient Overlay - 0% opacity (transparent) to 45% opacity black, covering 50% width from left */}
              <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-l from-transparent via-black/30 to-black/45" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-6 sm:px-8 lg:px-12">
                  <div className="max-w-md lg:max-w-lg">
                    <h3 className="text-lg sm:text-base md:text-md lg:text-lg font-semibold text-white leading-[1.5]">
                      {equipment.title}
                    </h3>
                    <p className="text-xxs sm:text-xxs md:text-xs text-white/90 leading-relaxed">
                      {equipment.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export type TreatmentCardTranslation = {
  name: string;
  description: string;
};

type TreatmentCardLocale = "ru" | "ar" | "id";

export const treatmentCardTranslations: Record<
  string,
  Record<TreatmentCardLocale, TreatmentCardTranslation>
> = {
  "proton-carbon-ion-therapy": {
    ru: {
      name: "Протонная терапия и терапия тяжёлыми ионами",
      description:
        "Современные системы протонной терапии и терапии тяжёлыми ионами позволяют точно воздействовать на солидные опухоли. Лечение проводит опытная команда радиационных онкологов с целью сократить курс и уменьшить воздействие на здоровые ткани.",
    },
    ar: {
      name: "العلاج بالبروتونات والأيونات الثقيلة",
      description:
        "تتيح أنظمة العلاج بالبروتونات والأيونات الثقيلة استهداف الأورام الصلبة بدقة. ويقدم العلاج فريق متخصص في علاج الأورام بالإشعاع بهدف تقصير مدة العلاج وتقليل التأثير في الأنسجة السليمة.",
    },
    id: {
      name: "Terapi Proton dan Ion Berat",
      description:
        "Sistem terapi proton dan ion berat modern memungkinkan penargetan tumor padat secara presisi. Perawatan diberikan oleh tim onkologi radiasi berpengalaman untuk membantu mempersingkat rangkaian terapi dan mengurangi paparan pada jaringan sehat.",
    },
  },
  "car-t-cell-therapy": {
    ru: {
      name: "Терапия CAR-T-клетками",
      description:
        "Специализированные гематологические центры и команды клеточной терапии проводят CAR-T-терапию для пациентов с рецидивирующими или рефрактерными опухолями крови после оценки показаний.",
    },
    ar: {
      name: "العلاج بخلايا CAR-T",
      description:
        "تقدم مراكز أمراض الدم المتخصصة وفرق العلاج الخلوي علاج CAR-T للمرضى المصابين بأورام دموية ناكسة أو مقاومة للعلاج، وذلك بعد تقييم مدى ملاءمة الحالة.",
    },
    id: {
      name: "Terapi Sel CAR-T",
      description:
        "Pusat hematologi khusus dan tim terapi sel menyediakan terapi CAR-T bagi pasien dengan keganasan darah yang kambuh atau sulit merespons pengobatan, setelah dilakukan penilaian kelayakan.",
    },
  },
  "sbrt-stereotactic-body-radiotherapy": {
    ru: {
      name: "Стереотаксическая лучевая терапия тела (SBRT)",
      description:
        "Линейные ускорители и системы навигации по изображениям обеспечивают высокоточную SBRT с большой дозой за сеанс. Метод применяется для некоторых ранних опухолей и ограниченных метастазов после врачебной оценки.",
    },
    ar: {
      name: "العلاج الإشعاعي التجسيمي للجسم (SBRT)",
      description:
        "توفر المسرعات الخطية وأنظمة التوجيه بالتصوير علاج SBRT عالي الدقة وبجرعات مرتفعة لكل جلسة. ويمكن استخدامه لبعض الأورام المبكرة والنقائل المحدودة بعد تقييم الطبيب.",
    },
    id: {
      name: "Radioterapi Tubuh Stereotaktik (SBRT)",
      description:
        "Akselerator linear dan navigasi berbasis pencitraan mendukung SBRT berpresisi tinggi dengan dosis tinggi per sesi. Metode ini dapat digunakan untuk tumor stadium awal tertentu dan metastasis terbatas setelah evaluasi dokter.",
    },
  },
  "immune-cell-cryopreservation": {
    ru: {
      name: "Криоконсервация иммунных клеток",
      description:
        "Сертифицированные клеточные банки используют стандартизированные методы сбора и криогенного хранения иммунных клеток для их возможного применения в будущем в соответствии с медицинскими показаниями и нормами.",
    },
    ar: {
      name: "الحفظ بالتبريد للخلايا المناعية",
      description:
        "تستخدم بنوك الخلايا المعتمدة إجراءات موحدة لجمع الخلايا المناعية وحفظها بالتبريد لإمكانية استخدامها مستقبلاً وفق المؤشرات الطبية واللوائح المعمول بها.",
    },
    id: {
      name: "Kriopreservasi Sel Imun",
      description:
        "Bank sel tersertifikasi menggunakan prosedur standar untuk pengambilan dan penyimpanan kriogenik sel imun agar dapat dipertimbangkan untuk penggunaan di masa mendatang sesuai indikasi medis dan ketentuan yang berlaku.",
    },
  },
  "coronary-artery-bypass-grafting": {
    ru: {
      name: "Аортокоронарное шунтирование (АКШ)",
      description:
        "Кардиохирургическая команда выполняет коронарное шунтирование, включая малоинвазивные подходы для отдельных пациентов, чтобы восстановить кровоснабжение при сложной ишемической болезни сердца.",
    },
    ar: {
      name: "جراحة مجازة الشريان التاجي (CABG)",
      description:
        "يجري فريق جراحة القلب عمليات مجازة الشريان التاجي، بما في ذلك أساليب طفيفة التوغل لبعض المرضى، بهدف استعادة تدفق الدم في حالات مرض الشرايين التاجية المعقدة.",
    },
    id: {
      name: "Bedah Pintas Arteri Koroner (CABG)",
      description:
        "Tim bedah jantung melakukan operasi pintas koroner, termasuk pendekatan minimal invasif untuk pasien tertentu, guna memulihkan aliran darah pada penyakit arteri koroner yang kompleks.",
    },
  },
  "coronary-intervention-treatment-pci": {
    ru: {
      name: "Чрескожное коронарное вмешательство (ЧКВ)",
      description:
        "Команда интервенционной кардиологии проводит ЧКВ с применением современных стентов для расширения суженных или закупоренных коронарных артерий и восстановления кровотока.",
    },
    ar: {
      name: "التدخل التاجي عبر الجلد (PCI)",
      description:
        "يجري فريق أمراض القلب التداخلية إجراء PCI باستخدام دعامات حديثة لتوسيع الشرايين التاجية المتضيقة أو المسدودة واستعادة تدفق الدم.",
    },
    id: {
      name: "Intervensi Koroner Perkutan (PCI)",
      description:
        "Tim kardiologi intervensi melakukan PCI dengan teknologi stent modern untuk membuka arteri koroner yang menyempit atau tersumbat dan memulihkan aliran darah.",
    },
  },
  "spinal-endoscopy-ube-peld": {
    ru: {
      name: "Эндоскопическая хирургия позвоночника / UBE / PELD",
      description:
        "Специалисты по малоинвазивной хирургии позвоночника применяют эндоскопические методы PELD и UBE через небольшие разрезы, когда они подходят пациенту по результатам обследования.",
    },
    ar: {
      name: "تنظير العمود الفقري / UBE / PELD",
      description:
        "يستخدم متخصصو جراحة العمود الفقري طفيفة التوغل تقنيات PELD وUBE بالمنظار عبر شقوق صغيرة عندما تكون مناسبة للحالة بعد التقييم.",
    },
    id: {
      name: "Endoskopi Tulang Belakang / UBE / PELD",
      description:
        "Spesialis bedah tulang belakang minimal invasif menggunakan teknik endoskopi PELD dan UBE melalui sayatan kecil bila sesuai berdasarkan hasil evaluasi pasien.",
    },
  },
  "total-knee-replacement": {
    ru: {
      name: "Тотальное эндопротезирование коленного сустава",
      description:
        "Ортопедическая команда использует точное планирование и, при наличии показаний, навигационные технологии для замены повреждённого коленного сустава и последующей программы восстановления.",
    },
    ar: {
      name: "الاستبدال الكامل لمفصل الركبة",
      description:
        "يستخدم فريق جراحة العظام التخطيط الدقيق، وعند ملاءمة الحالة تقنيات الملاحة الجراحية، لاستبدال مفصل الركبة المتضرر ووضع برنامج للتعافي بعد العملية.",
    },
    id: {
      name: "Penggantian Lutut Total",
      description:
        "Tim ortopedi menggunakan perencanaan presisi dan, bila sesuai, teknologi navigasi untuk mengganti sendi lutut yang rusak serta menyusun program pemulihan setelah operasi.",
    },
  },
  "total-hip-replacement": {
    ru: {
      name: "Тотальное эндопротезирование тазобедренного сустава",
      description:
        "Малоинвазивные доступы, точное позиционирование импланта и программа ускоренного восстановления помогают вернуть подвижность тазобедренного сустава и улучшить качество жизни.",
    },
    ar: {
      name: "الاستبدال الكامل لمفصل الورك",
      description:
        "تساعد الأساليب طفيفة التوغل والتموضع الدقيق للمفصل الصناعي وبرنامج التعافي المعزز على استعادة حركة الورك وتحسين جودة الحياة.",
    },
    id: {
      name: "Penggantian Pinggul Total",
      description:
        "Pendekatan minimal invasif, penempatan implan yang presisi, dan program pemulihan dipercepat membantu memulihkan mobilitas pinggul dan meningkatkan kualitas hidup.",
    },
  },
  "esd-emr-mucosal-resection": {
    ru: {
      name: "Эндоскопическая диссекция или резекция слизистой (ESD / EMR)",
      description:
        "Команда эндоскопистов применяет малоинвазивные методы ESD и EMR для удаления отдельных ранних поражений желудочно-кишечного тракта без открытой операции.",
    },
    ar: {
      name: "تشريح أو استئصال الغشاء المخاطي بالمنظار (ESD / EMR)",
      description:
        "يستخدم فريق التنظير تقنيتي ESD وEMR طفيفتي التوغل لإزالة بعض الآفات المبكرة في الجهاز الهضمي من دون جراحة مفتوحة.",
    },
    id: {
      name: "Diseksi atau Reseksi Mukosa Endoskopik (ESD / EMR)",
      description:
        "Tim endoskopi menggunakan teknik ESD dan EMR minimal invasif untuk mengangkat lesi saluran cerna stadium awal tertentu tanpa operasi terbuka.",
    },
  },
  "poem-surgery": {
    ru: {
      name: "Пероральная эндоскопическая миотомия (POEM)",
      description:
        "POEM — эндоскопический метод лечения ахалазии без наружных разрезов. Решение о процедуре принимается после оценки симптомов, исследований моторики и общего состояния пациента.",
    },
    ar: {
      name: "بضع العضلة بالتنظير عبر الفم (POEM)",
      description:
        "إجراء POEM هو علاج بالمنظار لتعذر الارتخاء المريئي من دون شقوق خارجية. ويُتخذ قرار الإجراء بعد تقييم الأعراض واختبارات الحركة والحالة العامة للمريض.",
    },
    id: {
      name: "Miotomi Endoskopik Peroral (POEM)",
      description:
        "POEM merupakan terapi endoskopik untuk akalasia tanpa sayatan luar. Keputusan tindakan dibuat setelah menilai gejala, pemeriksaan motilitas, dan kondisi pasien secara keseluruhan.",
    },
  },
  "hifu-uterine-fibroids-treatment": {
    ru: {
      name: "HIFU-терапия миомы матки",
      description:
        "Высокоинтенсивный фокусированный ультразвук (HIFU) воздействует на миоматозные узлы без хирургического разреза и ионизирующего излучения, помогая сохранить матку у подходящих пациенток.",
    },
    ar: {
      name: "علاج أورام الرحم الليفية بالموجات فوق الصوتية المركزة (HIFU)",
      description:
        "تستهدف الموجات فوق الصوتية المركزة عالية الكثافة الأورام الليفية من دون شق جراحي أو إشعاع مؤين، مع السعي إلى الحفاظ على الرحم لدى المريضات المناسبات.",
    },
    id: {
      name: "Terapi HIFU untuk Mioma Rahim",
      description:
        "Ultrasonografi terfokus intensitas tinggi (HIFU) menargetkan mioma tanpa sayatan bedah atau radiasi pengion, dengan tujuan mempertahankan rahim pada pasien yang sesuai.",
    },
  },
  "severe-endometriosis-laparoscopic-endoscopic-excision": {
    ru: {
      name: "Лапароскопическое иссечение тяжёлого эндометриоза",
      description:
        "Гинекологическая команда выполняет лапароскопическое или эндоскопическое иссечение очагов глубокого эндометриоза с учётом анатомии, симптомов и планов пациентки на беременность.",
    },
    ar: {
      name: "استئصال الانتباذ البطاني الرحمي الشديد بالمنظار",
      description:
        "يجري فريق أمراض النساء استئصال بؤر الانتباذ البطاني الرحمي العميق بالمنظار مع مراعاة التشريح والأعراض وخطط المريضة المستقبلية للحمل.",
    },
    id: {
      name: "Eksisi Endometriosis Berat dengan Laparoskopi",
      description:
        "Tim ginekologi melakukan eksisi laparoskopik atau endoskopik untuk endometriosis dalam dengan mempertimbangkan anatomi, gejala, dan rencana kehamilan pasien.",
    },
  },
  "corneal-transplant": {
    ru: {
      name: "Трансплантация роговицы",
      description:
        "Специалисты по заболеваниям роговицы проводят трансплантацию с использованием подходящей донорской ткани и выбранной хирургической техники после полной оценки состояния глаза.",
    },
    ar: {
      name: "زراعة القرنية",
      description:
        "يجري اختصاصيو أمراض القرنية عملية الزراعة باستخدام نسيج متبرع مناسب وتقنية جراحية مختارة بعد تقييم شامل لحالة العين.",
    },
    id: {
      name: "Transplantasi Kornea",
      description:
        "Spesialis kornea melakukan transplantasi menggunakan jaringan donor dan teknik bedah yang sesuai setelah evaluasi menyeluruh terhadap kondisi mata.",
    },
  },
  "cataract-surgery-premium-iol": {
    ru: {
      name: "Операция по удалению катаракты с премиальной ИОЛ",
      description:
        "Удаление катаракты с имплантацией трифокальной или ИОЛ с расширенной глубиной фокуса может одновременно корректировать несколько нарушений зрения после индивидуального подбора линзы.",
    },
    ar: {
      name: "جراحة الساد مع عدسة داخل العين متقدمة",
      description:
        "يمكن لجراحة الساد مع زرع عدسة ثلاثية البؤر أو ممتدة عمق التركيز معالجة عدة مشكلات بصرية في الوقت نفسه بعد اختيار العدسة المناسبة لكل مريض.",
    },
    id: {
      name: "Operasi Katarak dengan IOL Premium",
      description:
        "Operasi katarak dengan lensa trifokal atau lensa berjangkauan fokus luas dapat menangani beberapa gangguan penglihatan sekaligus setelah pemilihan lensa yang disesuaikan untuk pasien.",
    },
  },
  "deep-brain-stimulation-dbs": {
    ru: {
      name: "Глубокая стимуляция мозга (DBS)",
      description:
        "Функциональная нейрохирургическая команда применяет регулируемую DBS для отдельных пациентов с болезнью Паркинсона, эссенциальным тремором, дистонией и другими двигательными расстройствами.",
    },
    ar: {
      name: "التحفيز العميق للدماغ (DBS)",
      description:
        "يستخدم فريق جراحة الأعصاب الوظيفية تقنية DBS القابلة للضبط لبعض مرضى باركنسون والرعاش الأساسي وخلل التوتر واضطرابات الحركة الأخرى.",
    },
    id: {
      name: "Stimulasi Otak Dalam (DBS)",
      description:
        "Tim bedah saraf fungsional menggunakan DBS yang dapat disesuaikan untuk pasien tertentu dengan penyakit Parkinson, tremor esensial, distonia, dan gangguan gerak lainnya.",
    },
  },
  "deep-brain-stimulation-exploratory-treatment": {
    ru: {
      name: "Экспериментальное применение DBS",
      description:
        "Потенциальное применение DBS при тяжёлой депрессии, ОКР и других резистентных состояниях изучается только в рамках строго контролируемых клинических исследований.",
    },
    ar: {
      name: "الاستخدام الاستكشافي للتحفيز العميق للدماغ",
      description:
        "تُدرس الاستخدامات المحتملة لتقنية DBS في الاكتئاب الشديد والوسواس القهري والحالات المقاومة الأخرى ضمن أطر بحثية سريرية صارمة فقط.",
    },
    id: {
      name: "Penggunaan Eksploratif DBS",
      description:
        "Potensi penggunaan DBS untuk depresi berat, OCD, dan kondisi resisten lainnya hanya dipelajari dalam kerangka penelitian klinis yang dikendalikan secara ketat.",
    },
  },
  "stem-cell-therapy": {
    ru: {
      name: "Терапия стволовыми клетками",
      description:
        "Исследовательские программы со стволовыми клетками проводятся в зарегистрированных клинических учреждениях для отдельных трудноизлечимых заболеваний после строгой оценки соответствия критериям исследования.",
    },
    ar: {
      name: "العلاج بالخلايا الجذعية",
      description:
        "تُجرى برامج أبحاث الخلايا الجذعية في مؤسسات سريرية مسجلة لبعض الأمراض صعبة العلاج، وبعد تقييم صارم لمدى استيفاء معايير الدراسة.",
    },
    id: {
      name: "Terapi Sel Punca",
      description:
        "Program penelitian sel punca dijalankan di institusi klinis yang terdaftar untuk penyakit tertentu yang sulit ditangani, setelah penilaian ketat terhadap kelayakan mengikuti penelitian.",
    },
  },
  "hematopoietic-stem-cell-transplantation": {
    ru: {
      name: "Трансплантация гемопоэтических стволовых клеток",
      description:
        "Гематологические центры проводят аутологичную и аллогенную трансплантацию по поводу лейкозов, лимфом и других заболеваний крови в соответствии с международными протоколами.",
    },
    ar: {
      name: "زراعة الخلايا الجذعية المكوّنة للدم",
      description:
        "تجري مراكز أمراض الدم زراعة ذاتية أو خيفية لعلاج اللوكيميا واللمفوما وأمراض الدم الأخرى وفق بروتوكولات علاجية معتمدة.",
    },
    id: {
      name: "Transplantasi Sel Punca Hematopoietik",
      description:
        "Pusat hematologi melakukan transplantasi autologus maupun alogenik untuk leukemia, limfoma, dan penyakit darah lainnya sesuai protokol perawatan yang berlaku.",
    },
  },
  "comprehensive-cosmetic-surgery": {
    ru: {
      name: "Комплексная эстетическая хирургия",
      description:
        "Пластические хирурги разрабатывают индивидуальный план эстетических операций с учётом анатомии, целей пациента, безопасности и естественности предполагаемого результата.",
    },
    ar: {
      name: "الجراحة التجميلية الشاملة",
      description:
        "يضع جراحو التجميل خطة مخصصة للإجراءات التجميلية تراعي تشريح المريض وأهدافه والسلامة والمظهر الطبيعي المتوقع للنتيجة.",
    },
    id: {
      name: "Bedah Estetika Komprehensif",
      description:
        "Dokter bedah plastik menyusun rencana prosedur estetika yang disesuaikan dengan anatomi, tujuan pasien, keamanan, dan hasil yang tampak alami.",
    },
  },
  "artificial-cochlear-baha-hearing-reconstruction": {
    ru: {
      name: "Кохлеарная имплантация / слуховая реконструкция BAHA",
      description:
        "Специалисты по слуху подбирают кохлеарные импланты или костно-проводящие системы BAHA в зависимости от типа и степени потери слуха и результатов обследования.",
    },
    ar: {
      name: "زراعة القوقعة / إعادة تأهيل السمع بنظام BAHA",
      description:
        "يختار اختصاصيو السمع زراعة القوقعة أو أنظمة BAHA بالتوصيل العظمي وفق نوع فقدان السمع ودرجته ونتائج التقييم.",
    },
    id: {
      name: "Implan Koklea / Rekonstruksi Pendengaran BAHA",
      description:
        "Spesialis pendengaran memilih implan koklea atau sistem konduksi tulang BAHA berdasarkan jenis dan tingkat gangguan pendengaran serta hasil evaluasi.",
    },
  },
  "all-on-4-6-dental-implants": {
    ru: {
      name: "Имплантация зубов на всю или половину дуги All-on-4/6",
      description:
        "Команда имплантологов применяет концепции All-on-4 и All-on-6 для восстановления зубного ряда на четырёх или шести имплантах с возможностью немедленной нагрузки у подходящих пациентов.",
    },
    ar: {
      name: "زراعة أسنان للفك الكامل أو نصف الفك بنظام All-on-4/6",
      description:
        "يستخدم فريق زراعة الأسنان مفهومي All-on-4 وAll-on-6 لترميم قوس الأسنان على أربع أو ست زرعات، مع إمكانية التحميل الفوري لدى المرضى المناسبين.",
    },
    id: {
      name: "Implan Gigi Satu Lengkung atau Setengah Lengkung All-on-4/6",
      description:
        "Tim implantologi menggunakan konsep All-on-4 dan All-on-6 untuk memulihkan lengkung gigi dengan empat atau enam implan, dengan kemungkinan pembebanan segera pada pasien yang sesuai.",
    },
  },
  "deep-health-checkup": {
    ru: {
      name: "Комплексное углублённое обследование здоровья",
      description:
        "Многопрофильная команда проводит комплексный скрининг в стационарном или дневном формате с применением лабораторных и визуализирующих исследований и последующими персональными рекомендациями.",
    },
    ar: {
      name: "الفحص الصحي الشامل والمتعمق",
      description:
        "يجري فريق متعدد التخصصات فحصاً شاملاً بنظام الإقامة أو الزيارة النهارية باستخدام التحاليل والتصوير، ثم يقدم توصيات صحية مخصصة.",
    },
    id: {
      name: "Pemeriksaan Kesehatan Komprehensif",
      description:
        "Tim multidisiplin melakukan skrining menyeluruh dalam layanan rawat inap atau harian dengan pemeriksaan laboratorium dan pencitraan, dilanjutkan dengan rekomendasi kesehatan yang dipersonalisasi.",
    },
  },
  "urinary-stone-minimally-invasive-treatment-mini-pcnl-furs": {
    ru: {
      name: "Малоинвазивное лечение мочевых камней: Mini-PCNL и fURS",
      description:
        "Урологическая команда применяет Mini-PCNL и гибкую уретерореноскопию для удаления камней почек и мочеточника с выбором метода по размеру и расположению камня.",
    },
    ar: {
      name: "العلاج طفيف التوغل لحصوات المسالك البولية: Mini-PCNL وfURS",
      description:
        "يستخدم فريق المسالك البولية تقنيتي Mini-PCNL وتنظير الحالب المرن لإزالة حصوات الكلى والحالب، مع اختيار الطريقة وفق حجم الحصوة وموقعها.",
    },
    id: {
      name: "Terapi Batu Saluran Kemih Minimal Invasif: Mini-PCNL dan fURS",
      description:
        "Tim urologi menggunakan Mini-PCNL dan ureterorenoskopi fleksibel untuk menangani batu ginjal dan ureter, dengan pemilihan metode berdasarkan ukuran dan lokasi batu.",
    },
  },
};

export function getTreatmentCardTranslation(
  slug: string,
  locale: string,
): TreatmentCardTranslation | undefined {
  if (locale !== "ru" && locale !== "ar" && locale !== "id") return undefined;
  return treatmentCardTranslations[slug]?.[locale];
}

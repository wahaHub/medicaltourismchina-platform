// Treatment Categories Data
// 特色医疗项目分类数据

export interface TreatmentCategory {
  id: string;
  nameZh: string;
  nameEn: string;
  nameDe: string;
  nameFr: string;
  nameEs: string;
  nameRu: string;
  nameAr: string;
  nameId: string;
  color: string;
  slugs: string[];
}

export const treatmentCategories: TreatmentCategory[] = [
  {
    id: 'cancer-oncology',
    nameZh: '肿瘤与癌症',
    nameEn: 'Cancer & Oncology',
    nameDe: 'Krebs & Onkologie',
    nameFr: 'Cancer & Oncologie',
    nameEs: 'Cáncer y Oncología',
    nameRu: 'Рак и онкология',
    nameAr: 'السرطان والأورام',
    nameId: 'Kanker dan Onkologi',
    color: '#E91E63',
    slugs: [
      'proton-carbon-ion-therapy',
      'sbrt-stereotactic-body-radiotherapy',
      'car-t-cell-therapy',
      'immune-cell-cryopreservation'
    ]
  },
  {
    id: 'cardiovascular',
    nameZh: '心血管疾病',
    nameEn: 'Cardiovascular',
    nameDe: 'Herz-Kreislauf',
    nameFr: 'Cardiovasculaire',
    nameEs: 'Cardiovascular',
    nameRu: 'Сердечно-сосудистые заболевания',
    nameAr: 'أمراض القلب والأوعية الدموية',
    nameId: 'Kardiovaskular',
    color: '#F44336',
    slugs: [
      'coronary-artery-bypass-grafting',
      'coronary-intervention-treatment-pci'
    ]
  },
  {
    id: 'orthopedics',
    nameZh: '骨科与关节',
    nameEn: 'Orthopedics & Joint',
    nameDe: 'Orthopädie & Gelenke',
    nameFr: 'Orthopédie & Articulations',
    nameEs: 'Ortopedia y Articulaciones',
    nameRu: 'Ортопедия и суставы',
    nameAr: 'العظام والمفاصل',
    nameId: 'Ortopedi dan Sendi',
    color: '#FF9800',
    slugs: [
      'total-knee-replacement',
      'total-hip-replacement',
      'spinal-endoscopy-ube-peld'
    ]
  },
  {
    id: 'digestive',
    nameZh: '消化系统',
    nameEn: 'Digestive System',
    nameDe: 'Verdauungssystem',
    nameFr: 'Système Digestif',
    nameEs: 'Sistema Digestivo',
    nameRu: 'Пищеварительная система',
    nameAr: 'الجهاز الهضمي',
    nameId: 'Sistem Pencernaan',
    color: '#4CAF50',
    slugs: [
      'esd-emr-mucosal-resection',
      'poem-surgery'
    ]
  },
  {
    id: 'gynecology',
    nameZh: '妇科疾病',
    nameEn: 'Gynecology',
    nameDe: 'Gynäkologie',
    nameFr: 'Gynécologie',
    nameEs: 'Ginecología',
    nameRu: 'Гинекология',
    nameAr: 'أمراض النساء',
    nameId: 'Ginekologi',
    color: '#E91E63',
    slugs: [
      'hifu-uterine-fibroids-treatment',
      'severe-endometriosis-laparoscopic-endoscopic-excision'
    ]
  },
  {
    id: 'ophthalmology',
    nameZh: '眼科治疗',
    nameEn: 'Ophthalmology',
    nameDe: 'Augenheilkunde',
    nameFr: 'Ophtalmologie',
    nameEs: 'Oftalmología',
    nameRu: 'Офтальмология',
    nameAr: 'طب العيون',
    nameId: 'Oftalmologi',
    color: '#2196F3',
    slugs: [
      'corneal-transplant',
      'cataract-surgery-premium-iol'
    ]
  },
  {
    id: 'neurosurgery',
    nameZh: '神经外科',
    nameEn: 'Neurosurgery',
    nameDe: 'Neurochirurgie',
    nameFr: 'Neurochirurgie',
    nameEs: 'Neurocirugía',
    nameRu: 'Нейрохирургия',
    nameAr: 'جراحة الأعصاب',
    nameId: 'Bedah Saraf',
    color: '#9C27B0',
    slugs: [
      'deep-brain-stimulation-dbs',
      'deep-brain-stimulation-exploratory-treatment'
    ]
  },
  {
    id: 'stem-cell',
    nameZh: '干细胞与再生医学',
    nameEn: 'Stem Cell & Regenerative',
    nameDe: 'Stammzellen & Regenerativ',
    nameFr: 'Cellules Souches & Régénération',
    nameEs: 'Células Madre y Regenerativa',
    nameRu: 'Стволовые клетки и регенеративная медицина',
    nameAr: 'الخلايا الجذعية والطب التجديدي',
    nameId: 'Sel Punca dan Kedokteran Regeneratif',
    color: '#00BCD4',
    slugs: [
      'stem-cell-therapy',
      'hematopoietic-stem-cell-transplantation'
    ]
  },
  {
    id: 'other-specialties',
    nameZh: '其他专科',
    nameEn: 'Other Specialties',
    nameDe: 'Andere Fachgebiete',
    nameFr: 'Autres Spécialités',
    nameEs: 'Otras Especialidades',
    nameRu: 'Другие специальности',
    nameAr: 'تخصصات أخرى',
    nameId: 'Spesialisasi Lainnya',
    color: '#607D8B',
    slugs: [
      'urinary-stone-minimally-invasive-treatment-mini-pcnl-furs',
      'all-on-4-6-dental-implants',
      'artificial-cochlear-baha-hearing-reconstruction',
      'comprehensive-cosmetic-surgery',
      'deep-health-checkup'
    ]
  }
];

export const getCategoryName = (categoryId: string, locale: string): string => {
  const category = treatmentCategories.find(c => c.id === categoryId);
  if (!category) return '';

  switch (locale) {
    case 'zh': return category.nameZh;
    case 'en': return category.nameEn;
    case 'de': return category.nameDe;
    case 'fr': return category.nameFr;
    case 'es': return category.nameEs;
    case 'ru': return category.nameRu;
    case 'ar': return category.nameAr;
    case 'id': return category.nameId;
    default: return category.nameEn;
  }
};

export const getCategoryBySlug = (slug: string): TreatmentCategory | undefined => {
  return treatmentCategories.find(cat => cat.slugs.includes(slug));
};

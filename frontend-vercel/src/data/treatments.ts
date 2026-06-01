export type Treatment = {
  name: string;
  price: string;
  description: string;
  image: string;
  slug: string;
};

export type Category = {
  title: string;
  icon: string;
  treatments: Treatment[];
};

const CDN = `${(import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL || 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev').replace(/\/+$/, '')}/low/treatment`;
const PLACEHOLDER = `${(import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL || 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev').replace(/\/+$/, '')}/low/root_assets/surgery_placeholder_x2.png`;

export const categories: Category[] = [
  {
    title: "Cancer & Oncology",
    icon: "🎯",
    treatments: [
      {
        name: "Proton and Heavy Ion Therapy",
        price: "$24,307–$47,183",
        description:
          "Advanced international proton and heavy ion therapy systems with a top oncology radiation team — 'stereotactic blasting' style precise radiotherapy with shorter courses and fewer side effects for solid tumors.",
        image: `${CDN}/proton-carbon-ion-therapy_x2.png`,
        slug: "proton-carbon-ion-therapy",
      },
      {
        name: "CAR-T Cell Therapy",
        price: "$142,837–$184,444",
        description:
          "China's top hematology center and cell therapy expert team deliver internationally leading CAR-T immunotherapy, bringing high remission rates and renewed survival hope for relapsed/refractory blood tumors.",
        image: `${CDN}/car-t-cell-therapy_x2.png`,
        slug: "car-t-cell-therapy",
      },
      {
        name: "SBRT Stereotactic Body Radiotherapy",
        price: "$5,719",
        description:
          "Internationally leading linear accelerators and precise image-guided navigation deliver high-precision, high-dose SBRT — short course, minimal trauma, effective control of early tumors and isolated metastases.",
        image: `${CDN}/sbrt-stereotactic-body-radiotherapy_x2.png`,
        slug: "sbrt-stereotactic-body-radiotherapy",
      },
      {
        name: "Immune Cell Cryopreservation",
        price: "$5,719",
        description:
          "Nationally certified cell banks and cutting-edge biopreservation technology deliver safe, standardized immune cell collection and storage — preserving your healthiest cell seeds for future health management.",
        image: `${CDN}/immune-cell-cryopreservation_x2.png`,
        slug: "immune-cell-cryopreservation",
      },
    ],
  },
  {
    title: "Cardiovascular",
    icon: "❤️",
    treatments: [
      {
        name: "Coronary Artery Bypass Grafting (CABG)",
        price: "$13,842",
        description:
          "China's top cardiovascular surgery team and minimally invasive bypass technology offer a lasting, thorough revascularization solution for complex coronary artery disease.",
        image: `${CDN}/coronary-artery-bypass-grafting_x2.png`,
        slug: "coronary-artery-bypass-grafting",
      },
      {
        name: "Percutaneous Coronary Intervention (PCI)",
        price: "$80,000",
        description:
          "Top interventional cardiology team with globally leading drug-eluting stent technology — efficient, safe PCI to quickly open blocked vessels and prevent myocardial infarction.",
        image: `${CDN}/coronary-intervention-treatment-pci_x2.png`,
        slug: "coronary-intervention-treatment-pci",
      },
    ],
  },
  {
    title: "Orthopedics & Joint",
    icon: "🦴",
    treatments: [
      {
        name: "Spinal Endoscopy / UBE / PELD",
        price: "$3,574",
        description:
          "Top spinal minimally invasive expert team with global leading endoscopy systems (joimax®, Spinendos®). Ultra-minimally invasive PELD/UBE solutions with rapid recovery.",
        image: `${CDN}/spinal-endoscopy-ube-peld_x2.png`,
        slug: "spinal-endoscopy-ube-peld",
      },
      {
        name: "Total Knee Replacement",
        price: "$80,000",
        description:
          "Top joint surgery experts and intelligent navigation robot technology deliver precise, rapid-recovery total knee replacement — walk on the same day, regain pain-free mobility.",
        image: PLACEHOLDER,
        slug: "total-knee-replacement",
      },
      {
        name: "Total Hip Replacement",
        price: "$8,024",
        description:
          "Minimally invasive approach, precise alignment, and fast recovery for restored mobility and quality of life.",
        image: `${CDN}/total-hip-replacement_x2.png`,
        slug: "total-hip-replacement",
      },
    ],
  },
  {
    title: "Digestive System",
    icon: "🩺",
    treatments: [
      {
        name: "ESD / EMR Submucosal Dissection / Resection",
        price: "$786",
        description:
          "Top digestive endoscopy team and advanced endoscopic microsurgery technology deliver ultra-minimally invasive ESD/EMR for one-time removal of early gastrointestinal lesions.",
        image: `${CDN}/esd-emr-mucosal-resection_x2.png`,
        slug: "esd-emr-mucosal-resection",
      },
      {
        name: "POEM Surgery",
        price: "$1,001",
        description:
          "Internationally leading POEM (Peroral Endoscopic Myotomy) for achalasia — no surface incisions, rapid recovery, immediate results.",
        image: `${CDN}/poem-surgery_x2.png`,
        slug: "poem-surgery",
      },
    ],
  },
  {
    title: "Gynecology",
    icon: "🌸",
    treatments: [
      {
        name: "Uterine Fibroids HIFU (Haifu Knife)",
        price: "$2,860",
        description:
          "China's original Haifu Knife® (HIFU) focused ultrasound — no radiation, no incisions, no scars. Perfectly preserves the uterus and its function.",
        image: `${CDN}/hifu-uterine-fibroids-treatment_x2.png`,
        slug: "hifu-uterine-fibroids-treatment",
      },
      {
        name: "Severe Endometriosis: Laparoscopic / Endoscopic Excision",
        price: "$4,289",
        description:
          "Top gynecological endoscopy team and ultra-minimally invasive surgical techniques — deep, thorough lesion excision while protecting fertility function.",
        image: `${CDN}/severe-endometriosis-laparoscopic-endoscopic-excision_x2.png`,
        slug: "severe-endometriosis-laparoscopic-endoscopic-excision",
      },
    ],
  },
  {
    title: "Ophthalmology",
    icon: "👁️",
    treatments: [
      {
        name: "Corneal Transplant",
        price: "$4,289",
        description:
          "Extensive eye bank network and top corneal disease experts deliver international-standard femtosecond laser-assisted corneal transplants with shorter wait times and high precision.",
        image: `${CDN}/corneal-transplant_x2.png`,
        slug: "corneal-transplant",
      },
      {
        name: "Cataract Surgery + Trifocal / Premium IOL",
        price: "$1,430",
        description:
          "Top cataract experts and leading trifocal/extended-depth-of-focus premium IOL technologies — a one-stop visual upgrade addressing cataracts, presbyopia, myopia, and astigmatism.",
        image: `${CDN}/cataract-surgery-premium-iol_x2.png`,
        slug: "cataract-surgery-premium-iol",
      },
    ],
  },
  {
    title: "Neurosurgery",
    icon: "🧠",
    treatments: [
      {
        name: "Deep Brain Stimulation (DBS)",
        price: "$80,000",
        description:
          "Top functional neurosurgery team and world-leading DBS technology — precise, reversible, adjustable 'pacemaker' for Parkinson's, essential tremor, dystonia and more.",
        image: `${CDN}/deep-brain-stimulation-dbs_x2.png`,
        slug: "deep-brain-stimulation-dbs",
      },
      {
        name: "DBS Exploratory Treatment",
        price: "$4,289",
        description:
          "Under a rigorous clinical research framework, exploring DBS potential for refractory mental disorders such as depression and OCD where traditional therapies have failed.",
        image: `${CDN}/deep-brain-stimulation-exploratory-treatment_x2.png`,
        slug: "deep-brain-stimulation-exploratory-treatment",
      },
    ],
  },
  {
    title: "Stem Cell & Regenerative",
    icon: "🧬",
    treatments: [
      {
        name: "Stem Cell Therapy",
        price: "$14,298",
        description:
          "A National Health Commission–approved stem cell clinical research filing institution offering safe, compliant, cutting-edge research opportunities for refractory diseases.",
        image: `${CDN}/stem-cell-therapy_x2.png`,
        slug: "stem-cell-therapy",
      },
      {
        name: "Hematopoietic Stem Cell Transplantation",
        price: "$42,894",
        description:
          "Top hematology treatment center and Asia's largest transplant ward cluster — international-standard allogeneic/autologous transplantation for leukemia, lymphoma, and more.",
        image: `${CDN}/hematopoietic-stem-cell-transplantation_x2.png`,
        slug: "hematopoietic-stem-cell-transplantation",
      },
    ],
  },
  {
    title: "Other Specialties",
    icon: "✨",
    treatments: [
      {
        name: "Comprehensive Cosmetic Surgery",
        price: "$1,430–$28,596",
        description:
          "Top plastic surgery experts blended with Korean cosmetic surgery concepts — safe, precise, natural comprehensive cosmetic surgery solutions.",
        image: `${CDN}/comprehensive-cosmetic-surgery_x2.png`,
        slug: "comprehensive-cosmetic-surgery",
      },
      {
        name: "Cochlear Implant / BAHA Hearing Reconstruction",
        price: "$80,000",
        description:
          "Top auditory medical center with globally leading implant devices — precise cochlear implant and bone conduction (BAHA) solutions to restore hearing.",
        image: `${CDN}/artificial-cochlear-baha-hearing-reconstruction_x2.png`,
        slug: "artificial-cochlear-baha-hearing-reconstruction",
      },
      {
        name: "Full / Half Arch Dental Implants (All-on-4/6®)",
        price: "$28,596",
        description:
          "Top dental implant team and globally leading All-on-4®/All-on-6® immediate-loading technology — wear teeth within 24 hours post-surgery.",
        image: `${CDN}/all-on-4-6-dental-implants_x2.png`,
        slug: "all-on-4-6-dental-implants",
      },
      {
        name: "Comprehensive Health Examination (Inpatient/Daytime)",
        price: "$1,001",
        description:
          "Multidisciplinary team of top experts and advanced imaging equipment — inpatient/daytime comprehensive health screening with personalized health management.",
        image: PLACEHOLDER,
        slug: "deep-health-checkup",
      },
      {
        name: "Minimally Invasive Urinary Stones: Mini-PCNL & fURS",
        price: "$4,289",
        description:
          "Top urology team with leading minimally invasive stone removal — Mini-PCNL and fURS for stones anywhere in the kidney and ureter, no surface incisions.",
        image: `${CDN}/urinary-stone-minimally-invasive-treatment-mini-pcnl-furs_x2.png`,
        slug: "urinary-stone-minimally-invasive-treatment-mini-pcnl-furs",
      },
    ],
  },
];

export const totalTreatments = categories.reduce((s, c) => s + c.treatments.length, 0);

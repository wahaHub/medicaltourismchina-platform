export type MockPackageTag = {
  label: string;
  category: "treatment" | "service" | "audience" | "city" | "price" | "style";
};

export type MockPatientCase = {
  name: string;
  age: number;
  country: string;
  story: string;
  result: string;
};

export type MockPatientReview = {
  name: string;
  country: string;
  rating: number;
  date: string;
  comment: string;
};

export type MockHospitalPackageDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  coverImage: string;
  gallery: string[];
  priceUSD: string;
  duration: string;
  summary: string;
  includes: string[];
  process: Array<{ step: string; desc: string }>;
  tags: MockPackageTag[];
  cases: MockPatientCase[];
  reviews: MockPatientReview[];
};

export const packageTagColor: Record<MockPackageTag["category"], string> = {
  treatment: "border-[#b8e4e0] bg-[#edf9f7] text-[#159a90]",
  service: "border-[#c8dbfb] bg-[#f1f7ff] text-[#2f77c7]",
  audience: "border-[#f4d6a0] bg-[#fff7e8] text-[#b7791f]",
  city: "border-[#e1d4fb] bg-[#f6f0ff] text-[#6c49b8]",
  price: "border-[#fbc8d4] bg-[#fff1f4] text-[#c34668]",
  style: "border-[#d6ecd1] bg-[#f2faef] text-[#4c8a3d]",
};

export const packageFaq = [
  {
    q: "What is included in the package price?",
    a: "This mock package includes treatment, coordination, translation support, and the services listed under Package Includes. Flights and personal expenses are not included unless stated otherwise.",
  },
  {
    q: "Can this package be customized?",
    a: "Yes. This first version is using mock data only, but the final experience is intended to support custom medical package structures based on the hospital portal.",
  },
  {
    q: "How long should patients stay in China?",
    a: "Please refer to the Duration field in the package card. The stay length usually includes pre-op evaluation, treatment, and immediate follow-up.",
  },
  {
    q: "Can I get a formal quotation after reviewing the package?",
    a: "Yes. The detailed quotation and care coordination flow will be connected in a later step. This page currently focuses on matching the target package detail UI.",
  },
];

export const mockPackageProvider = {
  name: "Chengdu Aidi Eye Hospital",
  city: "Chengdu, Sichuan",
  type: "PRIVATE HOSPITAL",
};

const img = (seed: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const mockPackages: MockHospitalPackageDetail[] = [
  {
    id: "pkg-001",
    slug: "premium-lasik-vision",
    title: "Premium LASIK Vision Correction Package",
    subtitle: "SMILE laser correction with screening, procedure, and one-year follow-up",
    coverImage: img("1559757175-5700dde675bc"),
    gallery: [
      img("1559757175-5700dde675bc"),
      img("1576091160550-2173dba999ef"),
      img("1582719471384-894fbb16e074"),
      img("1551601651-2a8555f1a136"),
    ],
    priceUSD: "3,800",
    duration: "5-7 days in China",
    summary:
      "A mock premium vision package designed for overseas patients, covering pre-op exams, specialist consultation, procedure day, recovery support, and structured follow-up.",
    includes: [
      "20+ pre-operative ophthalmology checks",
      "Lead surgeon consultation and surgery",
      "One-month medication kit",
      "Airport transfer and English coordination",
      "Four follow-up touchpoints within one year",
    ],
    process: [
      { step: "Day 1", desc: "Arrival, airport pickup, and hotel check-in." },
      { step: "Day 2", desc: "Full screening and surgeon consultation." },
      { step: "Day 3", desc: "Procedure day with same-day monitoring." },
      { step: "Day 4", desc: "Post-op review and medication briefing." },
      { step: "Day 5", desc: "Departure and remote follow-up setup." },
    ],
    tags: [
      { label: "Vision Correction", category: "treatment" },
      { label: "Surgery Package", category: "service" },
      { label: "Overseas Patients", category: "audience" },
      { label: "Chengdu", category: "city" },
      { label: "3,000-5,000 USD", category: "price" },
    ],
    cases: [
      {
        name: "Mr. Ahmad",
        age: 32,
        country: "Malaysia",
        story: "Wanted to stop relying on glasses and return to diving after treatment.",
        result: "Returned to normal activities within days with stable vision recovery.",
      },
      {
        name: "Ms. Tanaka",
        age: 28,
        country: "Japan",
        story: "Had long-term discomfort from contact lenses and wanted a faster solution.",
        result: "Recovered quickly and reported a smooth post-op experience.",
      },
    ],
    reviews: [
      {
        name: "Sarah K.",
        country: "Singapore",
        rating: 5,
        date: "2024-08-12",
        comment: "The international coordination felt polished and the experience was easier than I expected.",
      },
      {
        name: "David L.",
        country: "Australia",
        rating: 5,
        date: "2024-09-03",
        comment: "Strong value for the level of care. I'd confidently recommend it.",
      },
    ],
  },
  {
    id: "pkg-002",
    slug: "cataract-premium-iol",
    title: "Premium Cataract Surgery with Multifocal IOL",
    subtitle: "Advanced cataract surgery with imported multifocal lens support",
    coverImage: img("1631815589968-fdb09a223b1e"),
    gallery: [
      img("1631815589968-fdb09a223b1e"),
      img("1581595220892-b0739db3ba8c"),
      img("1666214280557-f1b5022eb634"),
    ],
    priceUSD: "8,500",
    duration: "7-10 days in China",
    summary:
      "A mock premium cataract package focused on imported lens selection, staged surgery planning, inpatient support, and extended follow-up coordination.",
    includes: [
      "Lens measurement and full diagnostic workup",
      "Imported multifocal IOL package",
      "Lead surgeon operation scheduling",
      "Medication and inpatient support",
      "One-year follow-up coordination",
    ],
    process: [
      { step: "Day 1-2", desc: "Diagnostics, measurements, and treatment planning." },
      { step: "Day 3", desc: "First-eye procedure and monitored recovery." },
      { step: "Day 5", desc: "Second-eye procedure if clinically suitable." },
      { step: "Day 7", desc: "Final review and discharge planning." },
    ],
    tags: [
      { label: "Cataract Treatment", category: "treatment" },
      { label: "Surgery Package", category: "service" },
      { label: "Senior Patients", category: "audience" },
      { label: "Chengdu", category: "city" },
      { label: "5,000-10,000 USD", category: "price" },
    ],
    cases: [
      {
        name: "Mr. Wong",
        age: 68,
        country: "Hong Kong",
        story: "Wanted clearer daily vision and less dependence on additional reading glasses.",
        result: "Reported strong near and distance vision after staged recovery.",
      },
    ],
    reviews: [
      {
        name: "Helen M.",
        country: "UK",
        rating: 5,
        date: "2024-07-19",
        comment: "The care felt premium from consultation through follow-up.",
      },
    ],
  },
  {
    id: "pkg-003",
    slug: "comprehensive-eye-checkup",
    title: "Comprehensive Eye Health Screening",
    subtitle: "High-end screening package with same-day bilingual reporting",
    coverImage: img("1576086213369-97a306d36557"),
    gallery: [
      img("1576086213369-97a306d36557"),
      img("1579684385127-1ef15d508118"),
    ],
    priceUSD: "450",
    duration: "1 day",
    summary:
      "A mock eye screening product for international patients who want a full same-day assessment, imaging, specialist interpretation, and a polished summary of next steps.",
    includes: [
      "30+ diagnostic checks",
      "OCT and wide-angle imaging",
      "Specialist interpretation session",
      "Bilingual summary report",
      "Recommended next-step guidance",
    ],
    process: [
      { step: "Morning", desc: "Arrival, registration, and full diagnostic cycle." },
      { step: "Afternoon", desc: "Specialist review, findings explanation, and discharge." },
    ],
    tags: [
      { label: "Health Screening", category: "treatment" },
      { label: "Checkup Package", category: "service" },
      { label: "Overseas Patients", category: "audience" },
      { label: "Chengdu", category: "city" },
      { label: "Under 1,000 USD", category: "price" },
    ],
    cases: [
      {
        name: "Ms. Patel",
        age: 45,
        country: "India",
        story: "Booked a screening package because of family glaucoma history.",
        result: "Received an early-risk assessment and follow-up guidance.",
      },
    ],
    reviews: [
      {
        name: "John D.",
        country: "USA",
        rating: 5,
        date: "2024-11-02",
        comment: "Very thorough and easy to understand even as an overseas patient.",
      },
    ],
  },
];

export function slugifyPackageTitle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "package-detail";
}

function humanizePackageSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getMockHospitalPackageDetail(packageSlug: string): MockHospitalPackageDetail {
  const directMatch = mockPackages.find((item) => item.slug === packageSlug);
  if (directMatch) {
    return directMatch;
  }

  const fallback = mockPackages[0];
  const derivedTitle = humanizePackageSlug(packageSlug || fallback.slug);

  return {
    ...fallback,
    id: `mock-${packageSlug || fallback.slug}`,
    slug: packageSlug || fallback.slug,
    title: derivedTitle || fallback.title,
    subtitle: "Mock detail page mirrored from Hospital Navigator for UI parity",
  };
}

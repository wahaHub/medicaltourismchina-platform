# GEO Conversion Stack Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a conversion-focused GEO launch surface for MedicalTourismChina that exposes approved high-value answer targets through crawlable static HTML, structured data, sitemap entries, `llms.txt`, and reusable React landing pages.

**Architecture:** Keep the current Vite React app, but add a shared GEO page configuration that powers the React renderer, metadata, sitemap, `llms.txt`, and static HTML generation. Phase 1A routes must produce route-specific HTML before React hydration; Phase 1B routes stay in the config/backlog until evidence and approval gates are satisfied.

**Tech Stack:** Vite, React, React Router, TypeScript/JavaScript ES modules, Vitest, Vercel static output, XML/text generation scripts.

---

## Chunk 1: Business Coverage And Data Model

This chunk locks the keyword/answer-target inventory and the shared data model. It directly addresses the user's review priority: "有没有把所有的网站现有值钱业务关键词都覆盖" and "这样设计是否合理".

### Business Coverage Matrix

The first implementation must cover the current site's valuable business inventory in three tiers:

| Tier | Status | Business areas | Action |
| --- | --- | --- | --- |
| Phase 1A launch | Publish now | Medical treatment in China for foreigners, hospitals for foreigners, international patient services, China medical visa, medical interpreter, medical second opinion, dental implants, All-on-4/All-on-6 full/half arch implants, veneers, rhinoplasty, double eyelid surgery, cancer treatment, proton/carbon ion therapy | Build routes, static HTML, sitemap, `llms.txt`, schema, internal links |
| Phase 1B gated | Keep visible but unpublished | CAR-T, stem cell therapy, Parkinson's stem cell therapy, autism stem cell therapy, bariatric surgery, SBRT, immune cell cryopreservation, HIFU uterine fibroids, deep brain stimulation, PCI/coronary intervention, cancer surgery, cardiology/cardiothoracic surgery, hematology treatment, stem cell transplant | Store in config as `draft`/gated; exclude routes, sitemap, `llms.txt` until approved |
| Phase 2 backlog | Covered in inventory, not first release | Gastric sleeve, gastric bypass, adjustable gastric band, diabetes stem cell therapy, longevity stem cell therapy, Hollywood smile adjacent dental pages, dental crowns, dentures, full mouth restoration, facial liposuction, breast augmentation, breast reduction, tummy tuck, arm lift, hair transplant, hospital admissions, doctor appointment, hotel/accommodation, airport pickup, post-treatment support, insurance, transfer money for treatment, health packages | Add to `coverageNotes` or backlog section so future GEO expansion does not miss existing business lines |

Source inventory signals verified in the current codebase:

- `frontend-vercel/src/data/treatments.ts` contains proton/heavy ion therapy, SBRT, immune cell cryopreservation, CABG, PCI, HIFU uterine fibroids, DBS, and Full/Half Arch Dental Implants All-on-4/6.
- `frontend-vercel/src/pages/Telemedicine.tsx` contains the online consultation / second opinion service copy.
- Existing page files and translations contain gastric sleeve, gastric bypass, adjustable gastric band, diabetes/longevity/Parkinson's/autism stem-cell pages, dental crowns, dentures, full mouth restoration, cosmetic procedures, hospital admissions, accommodation, airport pickup, post-treatment support, insurance, transfer money, and health packages.
- Brand strings currently mix `MedChina` and `Medora Health`, so GEO entity consistency is part of this plan rather than a cosmetic cleanup.

### Task 1: Create Shared GEO Page Types And Config

**Files:**
- Create: `frontend-vercel/src/geo/geo-page-types.ts`
- Create: `frontend-vercel/src/geo/geo-page-data.js`
- Create: `frontend-vercel/src/geo/geo-publish-gate.js`
- Create: `frontend-vercel/src/geo/geo-pages.ts`
- Create: `frontend-vercel/src/geo/geo-coverage.ts`
- Test: `frontend-vercel/src/geo/__tests__/geo-pages.test.ts`

- [ ] **Step 1: Write failing tests for required GEO config fields**

Create `frontend-vercel/src/geo/__tests__/geo-pages.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { geoPages, phase1AGeoPages, phase1BGatedPages, isPublishableGeoPage } from '../geo-pages';
import {
  expectedPhase1APaths,
  expectedPhase1BPaths,
  expectedPhase2BusinessAreas,
} from '../geo-coverage';

const requiredFields = [
  'path',
  'phase',
  'title',
  'description',
  'canonicalUrl',
  'primaryAnswerTarget',
  'secondaryAnswerTargets',
  'h1',
  'quickAnswer',
  'patientIntent',
  'medicalEntity',
  'locationEntity',
  'sections',
  'faqItems',
  'relatedLinks',
  'primaryCta',
  'schemaType',
  'medicalDisclaimer',
  'claimRiskLevel',
  'evidenceSources',
  'lastReviewedAt',
  'reviewOwner',
  'approvalStatus',
  'canonicalStrategy',
  'htmlFallback',
] as const;

const requiredSectionKinds = [
  'who_this_is_for',
  'china_care_options',
  'cost_timeline_records',
  'how_medora_helps',
  'risks_limits_suitability',
] as const;

describe('geo page config', () => {
  it('defines required fields for every GEO page', () => {
    expect(geoPages.length).toBeGreaterThanOrEqual(16);

    for (const page of geoPages) {
      for (const field of requiredFields) {
        expect(page[field], `${page.path} missing ${field}`).toBeDefined();
      }
      expect(page.path).toMatch(/^\/[a-z0-9-]+$/);
      expect(page.canonicalUrl).toBe(`https://www.medicaltourismchina.health${page.path}`);
      expect(page.faqItems.length, `${page.path} FAQ count`).toBeGreaterThanOrEqual(5);
      expect(page.quickAnswer.length, `${page.path} quick answer`).toBeGreaterThan(160);
      expect(page.relatedLinks.length, `${page.path} related links`).toBeGreaterThanOrEqual(2);

      const sectionKinds = page.sections.map((section) => section.kind);
      for (const kind of requiredSectionKinds) {
        expect(sectionKinds, `${page.path} missing section kind ${kind}`).toContain(kind);
      }
    }
  });

  it('launches only approved Phase 1A pages', () => {
    expect(phase1AGeoPages.map((page) => page.path)).toEqual([
      '/medical-treatment-in-china-for-foreigners',
      '/dental-implants-china',
      '/all-on-4-all-on-6-dental-implants-china',
      '/hollywood-smile-veneers-china',
      '/rhinoplasty-china',
      '/double-eyelid-surgery-china',
      '/hospitals-in-china-for-foreigners',
      '/international-patient-services-china',
      '/china-medical-visa',
      '/medical-interpreter-china',
      '/medical-second-opinion-china',
      '/cancer-treatment-china',
      '/proton-carbon-ion-therapy-china',
    ]);

    for (const page of phase1AGeoPages) {
      expect(isPublishableGeoPage(page), `${page.path} publish gate`).toBe(true);
      expect(page.htmlFallback.quickAnswer).toContain(page.primaryAnswerTarget);
    }
  });

  it('requires high-risk pages to be explicitly approved for publish', () => {
    const highRiskPages = geoPages.filter((page) => page.claimRiskLevel === 'high');

    for (const page of highRiskPages) {
      expect(isPublishableGeoPage(page)).toBe(page.approvalStatus === 'approved-for-publish');
      if (page.approvalStatus === 'approved-for-publish') {
        expect(page.evidenceSources.length, `${page.path} evidence sources`).toBeGreaterThan(0);
        expect(
          page.evidenceSources.some((source) => /^https:\/\//.test(source.url ?? '')) || Boolean(page.approvalArtifact || page.reviewTicket),
          `${page.path} needs a public HTTPS evidence source or approval artifact/review ticket`,
        ).toBe(true);
        expect(
          page.evidenceSources.every((source) => !/^internal .*positioning$/i.test(source.label.trim())),
          `${page.path} must not rely on vague internal positioning labels`,
        ).toBe(true);
        expect(
          Boolean(page.medicalReviewer?.trim() || page.legalReviewer?.trim()),
          `${page.path} needs medicalReviewer or legalReviewer`,
        ).toBe(true);
        expect(page.reviewOwner.trim(), `${page.path} review owner`).not.toBe('');
        expect(page.lastReviewedAt, `${page.path} review date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(page.medicalDisclaimer.toLowerCase()).toContain('does not replace medical advice');
        expect(page.medicalDisclaimer.toLowerCase()).toContain('eligibility');
      }
    }
  });

  it('requires medium-risk treatment pages to be medically reviewed before publish', () => {
    const mediumRiskPages = geoPages.filter((page) => page.claimRiskLevel === 'medium');

    for (const page of mediumRiskPages) {
      expect(['medical-reviewed', 'approved-for-publish']).toContain(page.approvalStatus);
      expect(isPublishableGeoPage(page), `${page.path} medium-risk publish gate`).toBe(true);
    }
  });

  it('keeps Phase 1B medical-risk pages gated', () => {
    expect(phase1BGatedPages.map((page) => page.path)).toEqual([
      '/car-t-cell-therapy-china',
      '/stem-cell-therapy-china',
      '/parkinsons-stem-cell-therapy-china',
      '/autism-stem-cell-therapy-china',
      '/bariatric-surgery-china',
      '/sbrt-radiotherapy-china',
      '/immune-cell-cryopreservation-china',
      '/hifu-uterine-fibroids-china',
      '/deep-brain-stimulation-china',
      '/coronary-intervention-pci-china',
      '/cancer-surgery-china',
      '/cardiology-cardiothoracic-surgery-china',
      '/hematology-treatment-china',
      '/stem-cell-transplant-china',
    ]);

    for (const page of phase1BGatedPages) {
      expect(['draft', 'content-reviewed', 'medical-reviewed', 'legal-reviewed']).toContain(page.approvalStatus);
    }
  });

  it('locks valuable business coverage across Phase 1A, Phase 1B, and Phase 2 backlog', () => {
    expect(phase1AGeoPages.map((page) => page.path)).toEqual(expectedPhase1APaths);
    expect(phase1BGatedPages.map((page) => page.path)).toEqual(expectedPhase1BPaths);

    const coverageText = geoPages
      .flatMap((page) => [page.path, page.primaryAnswerTarget, ...(page.coverageNotes ?? [])])
      .join('\n')
      .toLowerCase();

    for (const businessArea of expectedPhase2BusinessAreas) {
      expect(coverageText, `missing business coverage: ${businessArea}`).toContain(businessArea.toLowerCase());
    }
  });

  it('uses Service schema for operational support pages', () => {
    const servicePaths = [
      '/medical-treatment-in-china-for-foreigners',
      '/hospitals-in-china-for-foreigners',
      '/international-patient-services-china',
      '/china-medical-visa',
      '/medical-interpreter-china',
      '/medical-second-opinion-china',
    ];

    for (const path of servicePaths) {
      expect(geoPages.find((page) => page.path === path)?.schemaType).toBe('Service');
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npx vitest run src/geo/__tests__/geo-pages.test.ts
```

Expected: FAIL because `src/geo/geo-pages.ts` does not exist.

- [ ] **Step 3: Add TypeScript types**

Create `frontend-vercel/src/geo/geo-page-types.ts`:

```ts
export type GeoPhase = '1A' | '1B' | '2';
export type ClaimRiskLevel = 'low' | 'medium' | 'medium-high' | 'high';
export type ApprovalStatus =
  | 'draft'
  | 'content-reviewed'
  | 'medical-reviewed'
  | 'legal-reviewed'
  | 'approved-for-publish';

export type GeoCta = {
  label: string;
  href: string;
  intent: 'free_quote' | 'medical_enquiry' | 'case_intake' | 'advisor' | 'service_enquiry' | 'hospital_matching';
};

export type GeoFaqItem = {
  question: string;
  answer: string;
};

export type GeoSection = {
  kind:
    | 'who_this_is_for'
    | 'china_care_options'
    | 'cost_timeline_records'
    | 'how_medora_helps'
    | 'risks_limits_suitability'
    | 'related_options'
    | 'custom';
  heading: string;
  body: string;
  bullets?: string[];
};

export type GeoRelatedLink = {
  label: string;
  href: string;
};

export type GeoEvidenceSource = {
  label: string;
  url?: string;
  note?: string;
};

export type GeoHtmlFallback = {
  quickAnswer: string;
  faqs: GeoFaqItem[];
};

export type GeoPage = {
  path: string;
  phase: GeoPhase;
  title: string;
  description: string;
  canonicalUrl: string;
  primaryAnswerTarget: string;
  secondaryAnswerTargets: string[];
  h1: string;
  quickAnswer: string;
  patientIntent: string;
  medicalEntity: string;
  locationEntity: string;
  sections: GeoSection[];
  faqItems: GeoFaqItem[];
  relatedLinks: GeoRelatedLink[];
  primaryCta: GeoCta;
  secondaryCta?: GeoCta;
  schemaType: 'MedicalWebPage' | 'Service' | 'WebPage';
  medicalDisclaimer: string;
  claimRiskLevel: ClaimRiskLevel;
  evidenceSources: GeoEvidenceSource[];
  lastReviewedAt: string;
  reviewOwner: string;
  medicalReviewer?: string;
  legalReviewer?: string;
  approvalArtifact?: string;
  reviewTicket?: string;
  approvalStatus: ApprovalStatus;
  canonicalStrategy: string;
  htmlFallback: GeoHtmlFallback;
  coverageNotes?: string[];
};
```

- [ ] **Step 4: Add shared JavaScript page data**

Create `frontend-vercel/src/geo/geo-page-data.js`.

Use plain ES module exports so both Vite and Node build scripts can import the same data:

```js
const SITE_ORIGIN = 'https://www.medicaltourismchina.health';

const disclaimer =
  'Medora Health coordinates international patient support and hospital matching. This page is informational and does not replace medical advice. Final eligibility, treatment planning, pricing, and timing depend on clinician review, hospital evaluation, diagnosis, records, and local regulations.';

const cta = {
  freeQuote: { label: 'Get a free quote', href: '/free-quote', intent: 'free_quote' },
  medicalEnquiry: { label: 'Request a medical enquiry', href: '/medical-enquiry', intent: 'medical_enquiry' },
  caseIntake: { label: 'Submit medical records', href: '/medical-case-intake', intent: 'case_intake' },
  advisor: { label: 'Talk to an advisor', href: '/medical-enquiry', intent: 'advisor' },
  service: { label: 'Request service support', href: '/medical-enquiry', intent: 'service_enquiry' },
  hospitalMatching: { label: 'Request hospital matching', href: '/medical-enquiry', intent: 'hospital_matching' },
};

const commonOperationalSections = [
  {
    heading: 'How Medora supports international patients',
    body: 'Medora helps patients prepare records, compare suitable hospital options, coordinate appointments, arrange language support, and plan travel details before and during care in China.',
    bullets: ['Record preparation', 'Hospital coordination', 'Interpreter support', 'Travel and follow-up planning'],
  },
];

const makeUrl = (path) => `${SITE_ORIGIN}${path}`;
```

Then define every page from the coverage matrix. Keep copy concise, conservative, and useful. The first entry should follow this shape:

```js
export const geoPageData = [
  {
    path: '/dental-implants-china',
    phase: '1A',
    title: 'Dental Implants in China for International Patients | Medora Health',
    description: 'Compare dental implant options in China, including full-mouth planning, All-on-4/All-on-6 pathways, timelines, travel support, and quote coordination for international patients.',
    canonicalUrl: makeUrl('/dental-implants-china'),
    primaryAnswerTarget: 'dental implants China',
    secondaryAnswerTargets: ['dental implant cost China', 'full mouth dental implants China', 'dental implants abroad'],
    h1: 'Dental Implants in China for International Patients',
    quickAnswer: 'Dental implants in China may be considered by international patients who want coordinated planning for implant surgery, prosthetics, travel, and follow-up. Medora helps patients compare suitable dental providers, prepare records and imaging, understand timeline questions, and request a quote before travel. Final pricing and treatment planning depend on oral examination, imaging, implant system, bone condition, and clinician review.',
    patientIntent: 'Compare dental implant options, likely cost drivers, timeline, and whether travel to China is practical.',
    medicalEntity: 'Dental implants',
    locationEntity: 'China',
    sections: [
      {
        kind: 'cost_timeline_records',
        heading: 'What patients should compare',
        body: 'Patients should compare implant systems, surgical planning, bone grafting needs, prosthetic materials, number of visits, warranty expectations, and follow-up plans.',
        bullets: ['Implant brand and prosthetic design', 'CBCT or imaging requirements', 'Bone grafting and sinus lift needs', 'Temporary and final teeth timeline'],
      },
      ...commonOperationalSections,
    ],
    faqItems: [
      { question: 'Can foreigners get dental implants in China?', answer: 'Yes, international patients can evaluate dental implant treatment in China, but the final plan depends on imaging, oral health, bone condition, and clinician review.' },
      { question: 'How long should I stay in China for dental implants?', answer: 'The stay varies by procedure. Some patients need staged visits, especially for grafting or full-arch work. Medora helps clarify the likely timeline after records and imaging are reviewed.' },
      { question: 'Can I get a dental implant quote before travel?', answer: 'A preliminary quote may be possible after sharing dental records, imaging, goals, and medical history. A final quote usually requires provider evaluation.' },
      { question: 'What records should I prepare?', answer: 'Useful records include recent dental photos, panoramic X-rays or CBCT scans, dental history, medication list, and any previous implant or extraction records.' },
      { question: 'How does Medora help with dental implant planning?', answer: 'Medora coordinates provider matching, quote requests, appointment planning, translation, travel support, and follow-up preparation.' },
    ],
    relatedLinks: [
      { label: 'All-on-4/All-on-6 dental implants in China', href: '/all-on-4-all-on-6-dental-implants-china' },
      { label: 'Hollywood smile veneers in China', href: '/hollywood-smile-veneers-china' },
      { label: 'Free treatment quote', href: '/free-quote' },
    ],
    primaryCta: cta.freeQuote,
    secondaryCta: cta.medicalEnquiry,
    schemaType: 'MedicalWebPage',
    medicalDisclaimer: disclaimer,
    claimRiskLevel: 'medium',
    evidenceSources: [{ label: 'Internal dental service positioning', note: 'Operational and planning guidance only; no outcome claims.' }],
    lastReviewedAt: '2026-06-05',
    reviewOwner: 'Medora content owner',
    approvalStatus: 'medical-reviewed',
    canonicalStrategy: 'New China-specific GEO page is canonical for this answer target; existing dental category pages should link here.',
    htmlFallback: {
      quickAnswer: 'Dental implants China: international patients can use Medora to compare dental providers, prepare imaging, coordinate quotes, and plan travel support. Final treatment and pricing depend on clinician review.',
      faqs: [],
    },
  },
];
```

Add the remaining entries from this exact implementation table. Each row must become one full `geoPageData` object with the same required fields as `/dental-implants-china`. Do not use placeholder medical claims. If a page lacks safe detail, keep it operational: records needed, questions to ask, how Medora coordinates, and when review is required.

| Path | Phase | Risk | Approval | Primary CTA | Required page angle |
| --- | --- | --- | --- | --- | --- |
| `/medical-treatment-in-china-for-foreigners` | `1A` | `low` | `content-reviewed` | `cta.advisor` | General GEO entry page answering whether foreigners can access medical treatment in China; summarize records, hospital matching, visa, interpreter, travel, payment, and follow-up |
| `/all-on-4-all-on-6-dental-implants-china` | `1A` | `medium` | `medical-reviewed` | `cta.freeQuote` | Full/half arch implant planning across All-on-4 and All-on-6, imaging, staged visits, prosthetic design, quote coordination |
| `/hollywood-smile-veneers-china` | `1A` | `medium` | `medical-reviewed` | `cta.freeQuote` | Smile design, veneers/crowns decision, photos, bite review, aesthetic planning |
| `/rhinoplasty-china` | `1A` | `medium` | `medical-reviewed` | `cta.freeQuote` | Natural-style rhinoplasty planning, surgeon matching, imaging/photos, recovery stay |
| `/double-eyelid-surgery-china` | `1A` | `medium` | `medical-reviewed` | `cta.freeQuote` | Eyelid procedure planning, photos, suitability, recovery expectations |
| `/hospitals-in-china-for-foreigners` | `1A` | `low` | `content-reviewed` | `cta.hospitalMatching` | How foreigners evaluate Chinese hospitals, language support, admission, payment, records |
| `/international-patient-services-china` | `1A` | `low` | `content-reviewed` | `cta.advisor` | Medora service entity page: records, matching, appointments, interpreter, travel, follow-up |
| `/china-medical-visa` | `1A` | `low` | `content-reviewed` | `cta.service` | Medical travel visa planning, invitation/appointment letters where applicable, stay timeline, disclaimer that rules change |
| `/medical-interpreter-china` | `1A` | `low` | `content-reviewed` | `cta.service` | Interpreter support for hospital visits, records, consent conversations, medication instructions |
| `/medical-second-opinion-china` | `1A` | `low` | `content-reviewed` | `cta.medicalEnquiry` | Remote record review, online consultation, written summary, translation support, and China treatment access discussion if suitable |
| `/cancer-treatment-china` | `1A` | `high` | `approved-for-publish` | `cta.medicalEnquiry` | Conservative oncology coordination page: record review, hospital matching, therapy questions, no success rates |
| `/proton-carbon-ion-therapy-china` | `1A` | `high` | `approved-for-publish` | `cta.caseIntake` | Conservative proton, heavy ion, and carbon ion evaluation page: eligibility review, records, radiation plan questions, no availability promises |
| `/car-t-cell-therapy-china` | `1B` | `high` | `draft` | `cta.medicalEnquiry` | Gated CAR-T page in config only; no route/sitemap/llms until evidence approval |
| `/stem-cell-therapy-china` | `1B` | `high` | `draft` | `cta.medicalEnquiry` | Gated general stem-cell page in config only; no route/sitemap/llms until evidence approval |
| `/parkinsons-stem-cell-therapy-china` | `1B` | `high` | `draft` | `cta.caseIntake` | Gated Parkinson's stem-cell page in config only; no route/sitemap/llms until evidence approval |
| `/autism-stem-cell-therapy-china` | `1B` | `high` | `draft` | `cta.advisor` | Gated autism stem-cell page in config only; no route/sitemap/llms until evidence approval |
| `/bariatric-surgery-china` | `1B` | `medium-high` | `draft` | `cta.medicalEnquiry` | Gated bariatric overview page in config only; no route/sitemap/llms until medical review |
| `/sbrt-radiotherapy-china` | `1B` | `high` | `draft` | `cta.caseIntake` | Gated SBRT stereotactic radiotherapy page; no route/sitemap/llms until oncology evidence approval |
| `/immune-cell-cryopreservation-china` | `1B` | `high` | `draft` | `cta.medicalEnquiry` | Gated immune cell cryopreservation page; no route/sitemap/llms until evidence/legal review |
| `/hifu-uterine-fibroids-china` | `1B` | `high` | `draft` | `cta.medicalEnquiry` | Gated HIFU / Haifu Knife uterine fibroids page; no route/sitemap/llms until gynecology evidence approval |
| `/deep-brain-stimulation-china` | `1B` | `high` | `draft` | `cta.caseIntake` | Gated DBS neurology/neurosurgery page; no route/sitemap/llms until evidence approval |
| `/coronary-intervention-pci-china` | `1B` | `high` | `draft` | `cta.caseIntake` | Gated PCI/coronary intervention page; no route/sitemap/llms until cardiology evidence approval |
| `/cancer-surgery-china` | `1B` | `high` | `draft` | `cta.caseIntake` | Gated cancer surgery page; no route/sitemap/llms until surgical oncology evidence approval |
| `/cardiology-cardiothoracic-surgery-china` | `1B` | `high` | `draft` | `cta.caseIntake` | Gated cardiology and cardiothoracic surgery page; no route/sitemap/llms until evidence approval |
| `/hematology-treatment-china` | `1B` | `high` | `draft` | `cta.medicalEnquiry` | Gated hematology treatment page; no route/sitemap/llms until evidence approval |
| `/stem-cell-transplant-china` | `1B` | `high` | `draft` | `cta.caseIntake` | Gated hematopoietic stem cell transplant page; no route/sitemap/llms until evidence approval |

Visa compliance rule: `/china-medical-visa` must not state a fixed visa category as universally applicable. Copy must say visa type and required documents depend on nationality, stay length, treatment purpose, invitation or appointment documents, and current embassy, consulate, or China Visa Application Service Center rules. CTA language can offer visa support, but the page must not read as legal advice.

Each object must include at least these five FAQs:

1. `Can foreigners evaluate [answer target] in China?`
2. `What records or photos should I prepare?`
3. `Can I get a quote or treatment plan before travel?`
4. `How long might the process or stay take?`
5. `How does Medora help international patients?`

For high-risk pages, add a sixth FAQ:

6. `How is eligibility decided?`

Each object must include at least these section kinds:

1. `who_this_is_for`
2. `china_care_options`
3. `cost_timeline_records`
4. `how_medora_helps`
5. `risks_limits_suitability`

If the visible heading differs from the kind, keep the `kind` stable for testing and use a natural `heading` for the user.

Phase 2 backlog items do not need full public page objects in this chunk, but they must be captured in a `coverageNotes` field on the closest relevant parent page:

- Dental backlog on `/dental-implants-china`: dental crowns, dentures, full mouth restoration, full mouth implants.
- Cosmetic backlog on `/rhinoplasty-china` or `/double-eyelid-surgery-china`: facial liposuction, breast augmentation, breast reduction, tummy tuck, arm lift, hair transplant.
- Bariatric backlog on `/bariatric-surgery-china`: gastric sleeve, gastric bypass, adjustable gastric band.
- Stem-cell backlog on `/stem-cell-therapy-china`: diabetes stem cell therapy, longevity stem cell therapy.
- Service backlog on `/international-patient-services-china`: hospital admissions, doctor appointment, hotel/accommodation, airport pickup, post-treatment support, insurance, transfer money for treatment, health packages.

Operational pages must use `schemaType: 'Service'`. Dental, cosmetic, cancer, proton, bariatric, and other treatment pages should use `schemaType: 'MedicalWebPage'` unless the content is purely operational.

High-risk Phase 1A pages, currently `/cancer-treatment-china` and `/proton-carbon-ion-therapy-china`, must not use only internal positioning as evidence. Their `evidenceSources` must include at least one public `https://` source URL, or the page must include an `approvalArtifact` / `reviewTicket`; they also need `reviewOwner`, `medicalReviewer` or `legalReviewer`, `lastReviewedAt`, and `approvalStatus: 'approved-for-publish'`.

Split content entry work by cluster during implementation:

1. Service entry cluster: `/medical-treatment-in-china-for-foreigners`, `/hospitals-in-china-for-foreigners`, `/international-patient-services-china`, `/china-medical-visa`, `/medical-interpreter-china`, `/medical-second-opinion-china`.
2. Dental cluster: `/dental-implants-china`, `/all-on-4-all-on-6-dental-implants-china`, `/hollywood-smile-veneers-china`.
3. Cosmetic cluster: `/rhinoplasty-china`, `/double-eyelid-surgery-china`.
4. Conservative authority cluster: `/cancer-treatment-china`, `/proton-carbon-ion-therapy-china`.
5. Gated medical backlog cluster: Phase 1B pages only, with `draft` status unless approval fields are supplied.

After each cluster is added, run `npx vitest run src/geo/__tests__/geo-pages.test.ts` before continuing.

- [ ] **Step 5: Add explicit coverage constants**

Create `frontend-vercel/src/geo/geo-coverage.ts`:

```ts
export const expectedPhase1APaths = [
  '/medical-treatment-in-china-for-foreigners',
  '/dental-implants-china',
  '/all-on-4-all-on-6-dental-implants-china',
  '/hollywood-smile-veneers-china',
  '/rhinoplasty-china',
  '/double-eyelid-surgery-china',
  '/hospitals-in-china-for-foreigners',
  '/international-patient-services-china',
  '/china-medical-visa',
  '/medical-interpreter-china',
  '/medical-second-opinion-china',
  '/cancer-treatment-china',
  '/proton-carbon-ion-therapy-china',
] as const;

export const expectedPhase1BPaths = [
  '/car-t-cell-therapy-china',
  '/stem-cell-therapy-china',
  '/parkinsons-stem-cell-therapy-china',
  '/autism-stem-cell-therapy-china',
  '/bariatric-surgery-china',
  '/sbrt-radiotherapy-china',
  '/immune-cell-cryopreservation-china',
  '/hifu-uterine-fibroids-china',
  '/deep-brain-stimulation-china',
  '/coronary-intervention-pci-china',
  '/cancer-surgery-china',
  '/cardiology-cardiothoracic-surgery-china',
  '/hematology-treatment-china',
  '/stem-cell-transplant-china',
] as const;

export const expectedPhase2BusinessAreas = [
  'gastric sleeve',
  'gastric bypass',
  'adjustable gastric band',
  'diabetes stem cell therapy',
  'longevity stem cell therapy',
  'dental crowns',
  'dentures',
  'full mouth restoration',
  'full mouth implants',
  'facial liposuction',
  'breast augmentation',
  'breast reduction',
  'tummy tuck',
  'arm lift',
  'hair transplant',
  'hospital admissions',
  'doctor appointment',
  'hotel accommodation',
  'airport pickup',
  'post-treatment support',
  'insurance',
  'transfer money for treatment',
  'health packages',
] as const;
```

- [ ] **Step 6: Add shared JavaScript publish gate**

Create `frontend-vercel/src/geo/geo-publish-gate.js`:

```js
export function isPublishableGeoPage(page) {
  if (page.phase !== '1A') return false;
  if (page.claimRiskLevel === 'high') {
    return (
      page.approvalStatus === 'approved-for-publish'
      && page.evidenceSources.length > 0
      && (page.evidenceSources.some((source) => /^https:\/\//.test(source.url ?? '')) || Boolean(page.approvalArtifact || page.reviewTicket))
      && page.evidenceSources.every((source) => !/^internal .*positioning$/i.test(source.label.trim()))
      && page.reviewOwner.trim().length > 0
      && Boolean(page.medicalReviewer?.trim() || page.legalReviewer?.trim())
      && /^\d{4}-\d{2}-\d{2}$/.test(page.lastReviewedAt)
      && page.medicalDisclaimer.toLowerCase().includes('does not replace medical advice')
      && page.medicalDisclaimer.toLowerCase().includes('eligibility')
    );
  }
  if (page.claimRiskLevel === 'medium-high') {
    return page.approvalStatus === 'medical-reviewed' || page.approvalStatus === 'approved-for-publish';
  }
  if (page.claimRiskLevel === 'medium') {
    return page.approvalStatus === 'medical-reviewed' || page.approvalStatus === 'approved-for-publish';
  }
  return ['content-reviewed', 'medical-reviewed', 'approved-for-publish'].includes(page.approvalStatus);
}
```

This is the only publish gate implementation. Frontend helpers and Node scripts must import this function instead of reimplementing approval logic.

- [ ] **Step 7: Add typed wrapper and approved-page helpers**

Create `frontend-vercel/src/geo/geo-pages.ts`:

```ts
import type { GeoPage } from './geo-page-types';
import { geoPageData } from './geo-page-data.js';
import { isPublishableGeoPage as isPublishableGeoPageJs } from './geo-publish-gate.js';

export const geoPages = geoPageData as GeoPage[];

export function isPublishableGeoPage(page: GeoPage): boolean {
  return isPublishableGeoPageJs(page);
}

export const phase1AGeoPages = geoPages.filter((page) => (
  isPublishableGeoPage(page)
));

export const phase1BGatedPages = geoPages.filter((page) => page.phase === '1B');

export const phase2BacklogPages = geoPages.filter((page) => page.phase === '2');

export const geoPageByPath = new Map(geoPages.map((page) => [page.path, page]));
export const approvedGeoPageByPath = new Map(phase1AGeoPages.map((page) => [page.path, page]));

export function getApprovedGeoPage(pathname: string): GeoPage | undefined {
  return approvedGeoPageByPath.get(pathname);
}
```

- [ ] **Step 8: Run tests**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npx vitest run src/geo/__tests__/geo-pages.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit chunk 1**

```bash
git add src/geo
git commit -m "feat(geo): add answer target inventory"
```

---

## Chunk 2: React Renderer, Metadata, And Routes

This chunk makes approved Phase 1A pages visible in the app while keeping Phase 1B gated.

### Task 2: Add Brand Entity Constants And Metadata Helpers

**Files:**
- Create: `frontend-vercel/src/geo/brand-entity.js`
- Create: `frontend-vercel/src/geo/brand-entity.ts`
- Create: `frontend-vercel/src/lib/seo/geo-metadata.ts`
- Test: `frontend-vercel/src/lib/seo/__tests__/brand-entity.test.ts`
- Test: `frontend-vercel/src/lib/seo/__tests__/geo-metadata.test.ts`

- [ ] **Step 1: Write failing brand entity tests**

Create `frontend-vercel/src/lib/seo/__tests__/brand-entity.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { brandEntity, buildOrganizationJsonLd } from '@/geo/brand-entity';

describe('brand entity', () => {
  it('uses Medora Health as the primary entity and MedChina as an alternate name', () => {
    expect(brandEntity.name).toBe('Medora Health');
    expect(brandEntity.alternateName).toContain('MedChina');
    expect(brandEntity.url).toBe('https://www.medicaltourismchina.health/');
  });

  it('builds Organization JSON-LD for GEO pages and llms assets', () => {
    expect(buildOrganizationJsonLd()).toEqual(expect.objectContaining({
      '@type': 'MedicalOrganization',
      name: 'Medora Health',
      alternateName: expect.arrayContaining(['MedChina']),
      url: 'https://www.medicaltourismchina.health/',
    }));
  });
});
```

- [ ] **Step 2: Add brand entity constants**

Create `frontend-vercel/src/geo/brand-entity.js`:

```js
export const brandEntity = {
  name: 'Medora Health',
  alternateName: ['MedChina', 'Medical Tourism China'],
  url: 'https://www.medicaltourismchina.health/',
  email: 'contact@medicaltourismchina.health',
};

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: brandEntity.name,
    alternateName: [...brandEntity.alternateName],
    url: brandEntity.url,
    email: brandEntity.email,
  };
}
```

Create `frontend-vercel/src/geo/brand-entity.ts` as the typed frontend wrapper:

```ts
export { brandEntity, buildOrganizationJsonLd } from './brand-entity.js';
```

Node build scripts must import `../src/geo/brand-entity.js`, not the TypeScript wrapper, because the public asset generator runs before Vite compiles TypeScript.

Implementation should use this object for GEO schema provider, `llms.txt`, `llms-full.txt`, and any new Organization JSON-LD. Do not introduce new `MedChina` primary-brand strings in GEO code. Existing legacy page titles can be handled by a later cleanup, but GEO assets must consistently use `Medora Health` with `MedChina` as `alternateName`.

Generated GEO assets must allow `MedChina` only as an alternate name or legacy alias. They must not use `MedChina` as a page title, provider name, schema `name`, or `llms.txt` heading.

Also update `frontend-vercel/index.html` so the default title, description, author, Open Graph title, and Open Graph description use `Medora Health` as the primary brand. Add an Organization / MedicalOrganization JSON-LD script that uses `Medora Health` as `name` and `MedChina` as `alternateName`. This protects the site-wide entity baseline even before route-specific GEO pages hydrate.

Add a test expectation in `brand-entity.test.ts` or a separate shell-entrypoint test that `index.html` contains:

```text
Medora Health
alternateName
MedChina
MedicalOrganization
```

- [ ] **Step 3: Run brand entity tests**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npx vitest run src/lib/seo/__tests__/brand-entity.test.ts
```

Expected: PASS after implementation.

- [ ] **Step 4: Write failing metadata tests**

Create `frontend-vercel/src/lib/seo/__tests__/geo-metadata.test.ts`:

```ts
import { afterEach, describe, expect, it } from 'vitest';
import type { GeoPage } from '@/geo/geo-page-types';
import { applyGeoMetadata, buildGeoJsonLd } from '../geo-metadata';

const page = {
  path: '/dental-implants-china',
  title: 'Dental Implants in China | Medora Health',
  description: 'Compare dental implant options in China.',
  canonicalUrl: 'https://www.medicaltourismchina.health/dental-implants-china',
  h1: 'Dental Implants in China',
  primaryAnswerTarget: 'dental implants China',
  quickAnswer: 'Dental implants China answer.',
  faqItems: [
    { question: 'Can foreigners get dental implants in China?', answer: 'Yes, after provider review.' },
    { question: 'Can I get a quote?', answer: 'A preliminary quote may be possible after records.' },
    { question: 'How long does it take?', answer: 'Timing depends on the plan.' },
    { question: 'What records are needed?', answer: 'Photos and imaging are useful.' },
    { question: 'How does Medora help?', answer: 'Medora coordinates matching and travel support.' },
  ],
  schemaType: 'MedicalWebPage',
  primaryCta: { label: 'Get a free quote', href: '/free-quote', intent: 'free_quote' },
  medicalDisclaimer: 'Informational only.',
} as GeoPage;

afterEach(() => {
  document.head.innerHTML = '';
  document.title = '';
});

describe('geo metadata', () => {
  it('applies route-specific head tags', () => {
    applyGeoMetadata(page);

    expect(document.title).toBe(page.title);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(page.description);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(page.canonicalUrl);
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(page.title);
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(page.canonicalUrl);
  });

  it('builds FAQ and breadcrumb JSON-LD', () => {
    const schema = buildGeoJsonLd(page);

    expect(schema).toEqual(expect.arrayContaining([
      expect.objectContaining({ '@type': 'BreadcrumbList' }),
      expect.objectContaining({ '@type': 'FAQPage' }),
      expect.objectContaining({ '@type': 'MedicalWebPage' }),
      expect.objectContaining({ '@type': 'MedicalOrganization', alternateName: expect.arrayContaining(['MedChina']) }),
    ]));
  });

  it('preserves Service schema type for operational GEO pages', () => {
    const schema = buildGeoJsonLd({ ...page, schemaType: 'Service', medicalEntity: 'International patient services' });
    expect(schema).toEqual(expect.arrayContaining([
      expect.objectContaining({ '@type': 'Service' }),
    ]));
  });

  it('replaces stale GEO JSON-LD tags', () => {
    applyGeoMetadata(page);
    applyGeoMetadata({ ...page, path: '/rhinoplasty-china', canonicalUrl: 'https://www.medicaltourismchina.health/rhinoplasty-china' });

    expect(document.querySelectorAll('script[data-geo-json-ld="true"]').length).toBe(3);
    expect(document.head.textContent).not.toContain('/dental-implants-china');
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npx vitest run src/lib/seo/__tests__/geo-metadata.test.ts
```

Expected: FAIL because `geo-metadata.ts` does not exist.

- [ ] **Step 6: Implement metadata helper**

Create `frontend-vercel/src/lib/seo/geo-metadata.ts`:

```ts
import type { GeoPage } from '@/geo/geo-page-types';
import { brandEntity, buildOrganizationJsonLd } from '@/geo/brand-entity';

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function buildGeoJsonLd(page: GeoPage) {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.medicaltourismchina.health/' },
      { '@type': 'ListItem', position: 2, name: page.h1, item: page.canonicalUrl },
    ],
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': page.schemaType,
    name: page.h1,
    headline: page.h1,
    description: page.description,
    url: page.canonicalUrl,
    about: page.medicalEntity,
    areaServed: page.locationEntity,
    provider: {
      '@type': 'MedicalOrganization',
      name: brandEntity.name,
      alternateName: [...brandEntity.alternateName],
      url: brandEntity.url,
    },
  };

  return [breadcrumb, faq, webPage, buildOrganizationJsonLd()];
}

export function applyGeoMetadata(page: GeoPage) {
  document.title = page.title;
  upsertMeta('meta[name="description"]', { name: 'description', content: page.description });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: page.title });
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: page.description });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: page.canonicalUrl });
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
  upsertCanonical(page.canonicalUrl);

  document.querySelectorAll('script[data-geo-json-ld="true"]').forEach((script) => script.remove());
  for (const schema of buildGeoJsonLd(page)) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.geoJsonLd = 'true';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}
```

- [ ] **Step 7: Run metadata tests**

```bash
npx vitest run src/lib/seo/__tests__/geo-metadata.test.ts
```

Expected: PASS.

### Task 3: Add GEO Landing Renderer And Routes

**Files:**
- Create: `frontend-vercel/src/pages/GeoLandingPage.tsx`
- Modify: `frontend-vercel/src/App.tsx`
- Test: `frontend-vercel/src/__tests__/geo-public-entrypoints.test.tsx`

- [ ] **Step 1: Write failing route tests**

Create `frontend-vercel/src/__tests__/geo-public-entrypoints.test.tsx`:

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { phase1AGeoPages, phase1BGatedPages } from '@/geo/geo-pages';

const appSource = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');

describe('GEO public entrypoints', () => {
  it('registers every approved Phase 1A GEO route', () => {
    for (const page of phase1AGeoPages) {
      expect(appSource).toContain(`path="${page.path}"`);
      expect(appSource).toContain(`geoPath="${page.path}"`);
    }
  });

  it('does not register gated Phase 1B routes', () => {
    for (const page of phase1BGatedPages) {
      expect(appSource).not.toContain(`path="${page.path}"`);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/geo-public-entrypoints.test.tsx
```

Expected: FAIL because no GEO routes exist.

- [ ] **Step 3: Implement `GeoLandingPage`**

Create `frontend-vercel/src/pages/GeoLandingPage.tsx`:

```tsx
import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import TopBanner from '@/components/TopBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { getApprovedGeoPage } from '@/geo/geo-pages';
import { applyGeoMetadata } from '@/lib/seo/geo-metadata';

type GeoLandingPageProps = {
  geoPath: string;
};

export default function GeoLandingPage({ geoPath }: GeoLandingPageProps) {
  const page = getApprovedGeoPage(geoPath);

  useEffect(() => {
    if (page) applyGeoMetadata(page);
  }, [page]);

  if (!page) return <Navigate to="/404" replace />;

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      <main className="pt-[112px] sm:pt-[120px]">
        <section className="border-b border-slate-200 bg-white">
          <div className="container mx-auto px-4 py-14">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Medora GEO Guide</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">{page.quickAnswer}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-teal-700 px-6 hover:bg-teal-800">
                <Link to={page.primaryCta.href}>
                  {page.primaryCta.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {page.secondaryCta ? (
                <Button asChild variant="outline" className="rounded-full px-6">
                  <Link to={page.secondaryCta.href}>{page.secondaryCta.label}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="container mx-auto grid gap-10 px-4 py-14 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-10">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-bold text-slate-950">{section.heading}</h2>
                <p className="mt-4 leading-7 text-slate-700">{section.body}</p>
                {section.bullets?.length ? (
                  <ul className="mt-5 grid gap-3">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-slate-700">
                        <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-teal-700" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <section>
              <h2 className="text-2xl font-bold text-slate-950">Common questions</h2>
              <div className="mt-5 divide-y divide-slate-200 rounded-lg border border-slate-200">
                {page.faqItems.map((item) => (
                  <details key={item.question} className="px-5 py-4">
                    <summary className="cursor-pointer font-semibold text-slate-950">{item.question}</summary>
                    <p className="mt-3 leading-7 text-slate-700">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-lg border border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-950">Next step</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{page.patientIntent}</p>
              <Button asChild className="mt-5 w-full bg-teal-700 hover:bg-teal-800">
                <Link to={page.primaryCta.href}>{page.primaryCta.label}</Link>
              </Button>
            </div>
            <div className="rounded-lg border border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-950">Related guides</h2>
              <div className="mt-4 grid gap-3">
                {page.relatedLinks.map((link) => (
                  <Link key={link.href} to={link.href} className="text-sm font-medium text-teal-700 hover:text-teal-900">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <p className="text-xs leading-5 text-slate-500">{page.medicalDisclaimer}</p>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Register explicit approved Phase 1A routes**

Modify `frontend-vercel/src/App.tsx`:

```tsx
import GeoLandingPage from "./pages/GeoLandingPage";
```

Add routes above the catch-all:

```tsx
<Route path="/medical-treatment-in-china-for-foreigners" element={<GeoLandingPage geoPath="/medical-treatment-in-china-for-foreigners" />} />
<Route path="/dental-implants-china" element={<GeoLandingPage geoPath="/dental-implants-china" />} />
<Route path="/all-on-4-all-on-6-dental-implants-china" element={<GeoLandingPage geoPath="/all-on-4-all-on-6-dental-implants-china" />} />
<Route path="/hollywood-smile-veneers-china" element={<GeoLandingPage geoPath="/hollywood-smile-veneers-china" />} />
<Route path="/rhinoplasty-china" element={<GeoLandingPage geoPath="/rhinoplasty-china" />} />
<Route path="/double-eyelid-surgery-china" element={<GeoLandingPage geoPath="/double-eyelid-surgery-china" />} />
<Route path="/hospitals-in-china-for-foreigners" element={<GeoLandingPage geoPath="/hospitals-in-china-for-foreigners" />} />
<Route path="/international-patient-services-china" element={<GeoLandingPage geoPath="/international-patient-services-china" />} />
<Route path="/china-medical-visa" element={<GeoLandingPage geoPath="/china-medical-visa" />} />
<Route path="/medical-interpreter-china" element={<GeoLandingPage geoPath="/medical-interpreter-china" />} />
<Route path="/medical-second-opinion-china" element={<GeoLandingPage geoPath="/medical-second-opinion-china" />} />
<Route path="/cancer-treatment-china" element={<GeoLandingPage geoPath="/cancer-treatment-china" />} />
<Route path="/proton-carbon-ion-therapy-china" element={<GeoLandingPage geoPath="/proton-carbon-ion-therapy-china" />} />
```

- [ ] **Step 5: Run route and metadata tests**

```bash
npx vitest run src/__tests__/geo-public-entrypoints.test.tsx src/lib/seo/__tests__/geo-metadata.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit chunk 2**

```bash
git add src/pages/GeoLandingPage.tsx src/App.tsx src/lib/seo src/geo/brand-entity.js src/geo/brand-entity.ts src/__tests__/geo-public-entrypoints.test.tsx
git commit -m "feat(geo): render approved answer landing pages"
```

---

## Chunk 3: Static HTML, Sitemap, llms Assets, And Vercel Routing

This chunk makes GEO pages crawler-visible before React hydration.

### Task 4: Generate Public Machine-Readable Assets

**Files:**
- Create: `frontend-vercel/scripts/generate-geo-public-assets.mjs`
- Modify: `frontend-vercel/package.json`
- Modify generated/source asset: `frontend-vercel/public/sitemap.xml`
- Create generated/source asset: `frontend-vercel/public/llms.txt`
- Create generated/source asset: `frontend-vercel/public/llms-full.txt`
- Test: `frontend-vercel/src/__tests__/geo-public-assets.test.ts`

- [ ] **Step 1: Write failing public asset tests**

Create `frontend-vercel/src/__tests__/geo-public-assets.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { phase1AGeoPages, phase1BGatedPages } from '@/geo/geo-pages';

function readPublic(file: string) {
  return readFileSync(resolve(process.cwd(), 'public', file), 'utf8');
}

describe('GEO public assets', () => {
  it('includes approved Phase 1A pages in sitemap and llms assets', () => {
    const sitemap = readPublic('sitemap.xml');
    const llms = readPublic('llms.txt');
    const llmsFull = readPublic('llms-full.txt');

    for (const page of phase1AGeoPages) {
      expect(sitemap).toContain(`<loc>${page.canonicalUrl}</loc>`);
      expect(llms).toContain(page.canonicalUrl);
      expect(llmsFull).toContain(page.primaryAnswerTarget);
      expect(llmsFull).toContain(page.canonicalUrl);
    }
  });

  it('preserves existing non-GEO sitemap URLs while adding GEO URLs', () => {
    const sitemap = readPublic('sitemap.xml');

    expect(sitemap).toContain('<loc>https://www.medicaltourismchina.health/</loc>');
    expect(sitemap).toContain('<loc>https://www.medicaltourismchina.health/hospitals</loc>');
    expect(sitemap).toContain('<loc>https://www.medicaltourismchina.health/visa</loc>');
    expect(sitemap).toContain('<loc>https://www.medicaltourismchina.health/faq</loc>');
  });

  it('excludes gated Phase 1B pages from public machine-readable assets', () => {
    const combined = `${readPublic('sitemap.xml')}\n${readPublic('llms.txt')}\n${readPublic('llms-full.txt')}`;

    for (const page of phase1BGatedPages) {
      expect(combined).not.toContain(page.path);
      expect(combined).not.toContain(page.canonicalUrl);
      expect(combined).not.toContain(page.primaryAnswerTarget);
    }
  });

  it('uses Medora Health as the GEO asset primary brand', () => {
    const combined = `${readPublic('llms.txt')}\n${readPublic('llms-full.txt')}`;

    expect(combined).toContain('Medora Health');
    expect(combined).toContain('Alternate names: MedChina, Medical Tourism China');
    expect(combined).not.toMatch(/^#\s*MedChina\b/m);
    expect(combined).not.toMatch(/\bname:\s*MedChina\b/i);
    expect(combined).not.toMatch(/\bprovider:\s*MedChina\b/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/geo-public-assets.test.ts
```

Expected: FAIL because `llms.txt` and `llms-full.txt` do not exist and sitemap is incomplete.

- [ ] **Step 3: Add public asset generator**

Create `frontend-vercel/scripts/generate-geo-public-assets.mjs`:

```js
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { geoPageData } from '../src/geo/geo-page-data.js';
import { isPublishableGeoPage } from '../src/geo/geo-publish-gate.js';
import { brandEntity } from '../src/geo/brand-entity.js';

const root = resolve(import.meta.dirname, '..');
const publicDir = resolve(root, 'public');

const phase1A = geoPageData.filter(isPublishableGeoPage);

const baselineUrls = [
  'https://www.medicaltourismchina.health/',
  'https://www.medicaltourismchina.health/cosmetic-surgery',
  'https://www.medicaltourismchina.health/cancer-treatment',
  'https://www.medicaltourismchina.health/dental-treatment',
  'https://www.medicaltourismchina.health/stem-cell-therapy',
  'https://www.medicaltourismchina.health/treatment',
  'https://www.medicaltourismchina.health/hospitals',
  'https://www.medicaltourismchina.health/packages',
  'https://www.medicaltourismchina.health/why-china',
  'https://www.medicaltourismchina.health/visa',
  'https://www.medicaltourismchina.health/faq',
  'https://www.medicaltourismchina.health/medical-enquiry',
  'https://www.medicaltourismchina.health/free-quote',
  'https://www.medicaltourismchina.health/medical-case-intake',
];

function readExistingSitemapUrls() {
  const sitemapPath = resolve(publicDir, 'sitemap.xml');
  if (!existsSync(sitemapPath)) return [];
  const sitemap = readFileSync(sitemapPath, 'utf8');
  return [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
}

function xmlEscape(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function writeSitemap() {
  const urls = Array.from(new Set([
    ...baselineUrls,
    ...readExistingSitemapUrls(),
    ...phase1A.map((page) => page.canonicalUrl),
  ]));

  const body = urls.map((url) => [
    '  <url>',
    `    <loc>${xmlEscape(url)}</loc>`,
    '    <changefreq>weekly</changefreq>',
    '  </url>',
  ].join('\n')).join('\n');

  writeFileSync(resolve(publicDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
}

function writeLlms() {
  const lines = [
    `# ${brandEntity.name} / Medical Tourism China`,
    '',
    `${brandEntity.name} helps international patients explore medical treatment, hospital coordination, travel support, interpreter support, and follow-up planning in China.`,
    `Alternate names: ${brandEntity.alternateName.join(', ')}`,
    '',
    '## Approved GEO answer pages',
    ...phase1A.map((page) => `- ${page.primaryAnswerTarget}: ${page.canonicalUrl}`),
    '',
    '## Safety',
    'Content is informational. Treatment eligibility, timing, and pricing require clinician and hospital review.',
  ];
  writeFileSync(resolve(publicDir, 'llms.txt'), `${lines.join('\n')}\n`);
}

function writeLlmsFull() {
  const sections = phase1A.map((page) => [
    `## ${page.primaryAnswerTarget}`,
    `URL: ${page.canonicalUrl}`,
    `Quick answer: ${page.quickAnswer}`,
    `Patient intent: ${page.patientIntent}`,
    `Medical entity: ${page.medicalEntity}`,
    `Location entity: ${page.locationEntity}`,
    `Primary CTA: ${page.primaryCta.label} (${page.primaryCta.href})`,
    'Sections:',
    ...page.sections.map((section) => `- ${section.heading}: ${section.body}`),
    'FAQs:',
    ...page.faqItems.map((item) => `- Q: ${item.question}\n  A: ${item.answer}`),
  ].join('\n'));

  writeFileSync(resolve(publicDir, 'llms-full.txt'), [
    '# Medora Health GEO Answer Directory',
    '',
    'This file summarizes approved Phase 1A GEO pages only. Gated Phase 1B medical-risk pages are excluded until approved for publish.',
    '',
    ...sections,
  ].join('\n'));
}

mkdirSync(publicDir, { recursive: true });
writeSitemap();
writeLlms();
writeLlmsFull();
```

- [ ] **Step 4: Wire asset generation into build**

Modify `frontend-vercel/package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "node scripts/generate-geo-public-assets.mjs && vite build && node scripts/generate-geo-static-html.mjs",
  "build:vite": "vite build",
  "build:dev": "node scripts/generate-geo-public-assets.mjs && vite build --mode development && node scripts/generate-geo-static-html.mjs",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

Do not remove existing sitemap URLs when adding GEO URLs. The script must merge baseline URLs, current sitemap entries, and approved Phase 1A GEO URLs.

Do not use `npm run build` inside the build script.

- [ ] **Step 5: Generate assets and run tests**

```bash
node scripts/generate-geo-public-assets.mjs
npx vitest run src/__tests__/geo-public-assets.test.ts
```

Expected: PASS.

### Task 5: Generate Static Route HTML

**Files:**
- Create: `frontend-vercel/scripts/generate-geo-static-html.mjs`
- Create: `frontend-vercel/scripts/verify-geo-static-html.mjs`
- Modify: `frontend-vercel/vercel.json`
- Test: `frontend-vercel/src/__tests__/geo-vercel-rewrites.test.ts`

- [ ] **Step 1: Write failing Vercel rewrite test**

Create `frontend-vercel/src/__tests__/geo-vercel-rewrites.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import vercelConfig from '../../vercel.json';
import { phase1AGeoPages, phase1BGatedPages } from '@/geo/geo-pages';

describe('Vercel GEO rewrites', () => {
  it('routes approved GEO pages to their static HTML files before SPA fallback', () => {
    const rewrites = vercelConfig.rewrites ?? [];
    const fallbackIndex = rewrites.findIndex((rewrite) => rewrite.source === '/(.*)');

    for (const page of phase1AGeoPages) {
      const rewriteIndex = rewrites.findIndex((rewrite) => rewrite.source === page.path);
      expect(rewriteIndex, `${page.path} rewrite`).toBeGreaterThanOrEqual(0);
      expect(rewriteIndex, `${page.path} before fallback`).toBeLessThan(fallbackIndex);
      expect(rewrites[rewriteIndex].destination).toBe(`${page.path}/index.html`);

      const slashRewriteIndex = rewrites.findIndex((rewrite) => rewrite.source === `${page.path}/`);
      expect(slashRewriteIndex, `${page.path}/ trailing slash rewrite`).toBeGreaterThanOrEqual(0);
      expect(slashRewriteIndex, `${page.path}/ before fallback`).toBeLessThan(fallbackIndex);
      expect(rewrites[slashRewriteIndex].destination).toBe(`${page.path}/index.html`);
    }
  });

  it('does not rewrite gated Phase 1B pages to static GEO files', () => {
    const sources = (vercelConfig.rewrites ?? []).map((rewrite) => rewrite.source);
    for (const page of phase1BGatedPages) {
      expect(sources).not.toContain(page.path);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/geo-vercel-rewrites.test.ts
```

Expected: FAIL because Vercel rewrites for GEO pages do not exist.

- [ ] **Step 3: Add static HTML generator**

Create `frontend-vercel/scripts/generate-geo-static-html.mjs`:

```js
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { geoPageData } from '../src/geo/geo-page-data.js';
import { isPublishableGeoPage } from '../src/geo/geo-publish-gate.js';
import { brandEntity, buildOrganizationJsonLd } from '../src/geo/brand-entity.js';

const root = resolve(import.meta.dirname, '..');
const distDir = resolve(root, 'dist');
const indexPath = resolve(distDir, 'index.html');

const phase1A = geoPageData.filter(isPublishableGeoPage);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildJsonLd(page) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.medicaltourismchina.health/' },
        { '@type': 'ListItem', position: 2, name: page.h1, item: page.canonicalUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': page.schemaType,
      name: page.h1,
      headline: page.h1,
      description: page.description,
      url: page.canonicalUrl,
      about: page.medicalEntity,
      areaServed: page.locationEntity,
      provider: {
        '@type': 'MedicalOrganization',
        name: brandEntity.name,
        alternateName: [...brandEntity.alternateName],
        url: brandEntity.url,
      },
    },
    buildOrganizationJsonLd(),
  ];
}

function injectHead(html, page) {
  const jsonLd = buildJsonLd(page)
    .map((schema) => `<script type="application/ld+json" data-geo-json-ld="true">${JSON.stringify(schema)}</script>`)
    .join('\n    ');

  const head = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(page.canonicalUrl)}" />`,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(page.canonicalUrl)}" />`,
    '<meta property="og:type" content="website" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    jsonLd,
  ].join('\n    ');

  return html
    .replace(/<title>.*?<\/title>/s, '')
    .replace(/<meta name="description"[^>]*>\s*/s, '')
    .replace(/<link rel="canonical"[^>]*>\s*/g, '')
    .replace(/<meta property="og:title"[^>]*>\s*/g, '')
    .replace(/<meta property="og:description"[^>]*>\s*/g, '')
    .replace(/<meta property="og:url"[^>]*>\s*/g, '')
    .replace(/<meta property="og:type"[^>]*>\s*/g, '')
    .replace(/<meta name="twitter:card"[^>]*>\s*/g, '')
    .replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/g, '')
    .replace('</head>', `    ${head}\n  </head>`);
}

function buildFallbackBody(page) {
  const sections = page.sections.map((section) => {
    const bullets = section.bullets?.length
      ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>`
      : '';
    return `<section data-section-kind="${escapeHtml(section.kind)}"><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body)}</p>${bullets}</section>`;
  }).join('');

  const faqs = page.faqItems.map((item) => (
    `<section><h2>${escapeHtml(item.question)}</h2><p>${escapeHtml(item.answer)}</p></section>`
  )).join('');

  const relatedLinks = page.relatedLinks.map((link) => (
    `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`
  )).join('');

  const evidence = page.evidenceSources.map((source) => (
    `<li>${escapeHtml(source.label)}${source.url ? `: <a href="${escapeHtml(source.url)}">${escapeHtml(source.url)}</a>` : ''}${source.note ? ` — ${escapeHtml(source.note)}` : ''}</li>`
  )).join('');

  return [
    '<div id="root"><div id="geo-static-fallback">',
    `<h1>${escapeHtml(page.h1)}</h1>`,
    `<p>${escapeHtml(page.htmlFallback.quickAnswer || page.quickAnswer)}</p>`,
    `<p><strong>Patient intent:</strong> ${escapeHtml(page.patientIntent)}</p>`,
    `<p><strong>Medical entity:</strong> ${escapeHtml(page.medicalEntity)}</p>`,
    `<p><strong>Location:</strong> ${escapeHtml(page.locationEntity)}</p>`,
    `<p><a href="${escapeHtml(page.primaryCta.href)}">${escapeHtml(page.primaryCta.label)}</a></p>`,
    sections,
    relatedLinks ? `<section><h2>Related options</h2><ul>${relatedLinks}</ul></section>` : '',
    faqs,
    `<p><strong>Review owner:</strong> ${escapeHtml(page.reviewOwner)}</p>`,
    `<p><strong>Last reviewed:</strong> ${escapeHtml(page.lastReviewedAt)}</p>`,
    evidence ? `<section><h2>Evidence and review notes</h2><ul>${evidence}</ul></section>` : '',
    `<p>${escapeHtml(page.medicalDisclaimer)}</p>`,
    '</div></div>',
  ].join('');
}

const baseHtml = readFileSync(indexPath, 'utf8');

for (const page of phase1A) {
  const outputPath = resolve(distDir, page.path.slice(1), 'index.html');
  mkdirSync(dirname(outputPath), { recursive: true });
  const html = injectHead(baseHtml, page).replace('<div id="root"></div>', buildFallbackBody(page));
  writeFileSync(outputPath, html);
}
```

The fallback must live inside `#root`, not as a sibling before `#root`. React's `createRoot(document.getElementById('root'))` will replace the static fallback when the app mounts, so crawlers see fallback content but hydrated users do not see duplicate content.

- [ ] **Step 4: Add exact Vercel rewrites before fallback**

Modify `frontend-vercel/vercel.json` and insert these before `{ "source": "/(.*)", "destination": "/index.html" }`:

```json
{ "source": "/medical-treatment-in-china-for-foreigners", "destination": "/medical-treatment-in-china-for-foreigners/index.html" },
{ "source": "/dental-implants-china", "destination": "/dental-implants-china/index.html" },
{ "source": "/all-on-4-all-on-6-dental-implants-china", "destination": "/all-on-4-all-on-6-dental-implants-china/index.html" },
{ "source": "/hollywood-smile-veneers-china", "destination": "/hollywood-smile-veneers-china/index.html" },
{ "source": "/rhinoplasty-china", "destination": "/rhinoplasty-china/index.html" },
{ "source": "/double-eyelid-surgery-china", "destination": "/double-eyelid-surgery-china/index.html" },
{ "source": "/hospitals-in-china-for-foreigners", "destination": "/hospitals-in-china-for-foreigners/index.html" },
{ "source": "/international-patient-services-china", "destination": "/international-patient-services-china/index.html" },
{ "source": "/china-medical-visa", "destination": "/china-medical-visa/index.html" },
{ "source": "/medical-interpreter-china", "destination": "/medical-interpreter-china/index.html" },
{ "source": "/medical-second-opinion-china", "destination": "/medical-second-opinion-china/index.html" },
{ "source": "/cancer-treatment-china", "destination": "/cancer-treatment-china/index.html" },
{ "source": "/proton-carbon-ion-therapy-china", "destination": "/proton-carbon-ion-therapy-china/index.html" },
```

- [ ] **Step 5: Run rewrite test**

```bash
npx vitest run src/__tests__/geo-vercel-rewrites.test.ts
```

Expected: PASS.

- [ ] **Step 6: Add served-build verification script**

Create `frontend-vercel/scripts/verify-geo-static-html.mjs`:

```js
import { geoPageData } from '../src/geo/geo-page-data.js';
import { isPublishableGeoPage } from '../src/geo/geo-publish-gate.js';

const origin = process.env.GEO_VERIFY_ORIGIN || 'http://127.0.0.1:4173';

const pages = geoPageData.filter(isPublishableGeoPage);

function assertContains(html, marker, pagePath) {
  if (!html.includes(marker)) {
    throw new Error(`${pagePath} missing static marker: ${marker}`);
  }
}

function assertMatchCount(html, pattern, expectedCount, pagePath, label) {
  const matches = html.match(pattern) ?? [];
  if (matches.length !== expectedCount) {
    throw new Error(`${pagePath} expected ${expectedCount} ${label}, found ${matches.length}`);
  }
}

for (const page of pages) {
  for (const requestPath of [page.path, `${page.path}/`]) {
    const response = await fetch(`${origin}${requestPath}`);
    if (!response.ok) {
      throw new Error(`${requestPath} returned HTTP ${response.status}`);
    }
    const html = await response.text();
    assertContains(html, `<title>${page.title}</title>`, requestPath);
    assertContains(html, `name="description"`, requestPath);
    assertContains(html, `rel="canonical" href="${page.canonicalUrl}"`, requestPath);
    assertMatchCount(html, /rel="canonical"/g, 1, requestPath, 'canonical tag');
    assertMatchCount(html, /property="og:url"/g, 1, requestPath, 'og:url tag');
    assertContains(html, `property="og:title" content="${page.title}"`, requestPath);
    assertContains(html, `property="og:url" content="${page.canonicalUrl}"`, requestPath);
    if (html.includes('MedChina - Premium Medical Tourism')) {
      throw new Error(`${requestPath} contains stale MedChina default title`);
    }
    assertContains(html, page.htmlFallback.quickAnswer || page.quickAnswer, requestPath);
    assertContains(html, page.patientIntent, requestPath);
    assertContains(html, page.medicalEntity, requestPath);
    assertContains(html, page.locationEntity, requestPath);
    assertContains(html, page.primaryCta.label, requestPath);
    assertContains(html, page.sections[0].heading, requestPath);
    assertContains(html, page.sections[0].body, requestPath);
    assertContains(html, page.relatedLinks[0].label, requestPath);
    assertContains(html, page.faqItems[0].question, requestPath);
    assertContains(html, page.reviewOwner, requestPath);
    assertContains(html, page.lastReviewedAt, requestPath);
    if (page.claimRiskLevel === 'high') {
      const evidenceMarker = page.evidenceSources.find((source) => source.url)?.url
        || page.approvalArtifact
        || page.reviewTicket
        || page.evidenceSources[0]?.label;
      assertContains(html, evidenceMarker, requestPath);
      assertContains(html, page.medicalReviewer || page.legalReviewer, requestPath);
    }
    assertContains(html, 'application/ld+json', requestPath);
  }
}
```

- [ ] **Step 7: Build and verify static files**

```bash
npm run build
test -f dist/dental-implants-china/index.html
rg -n "Dental Implants in China|application/ld\\+json|Can foreigners get dental implants" dist/dental-implants-china/index.html
rg -n "CAR-T therapy in China" dist || true
```

Expected:
- Build succeeds.
- `dist/dental-implants-china/index.html` exists.
- Static HTML contains the route-specific title/H1, JSON-LD, and FAQ.
- The CAR-T gated page does not appear as a generated static route.

- [ ] **Step 8: Verify served HTML with curl-equivalent script**

Start preview in a second shell or background session:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

Then run:

```bash
GEO_VERIFY_ORIGIN=http://127.0.0.1:4173 node scripts/verify-geo-static-html.mjs
curl -sL http://127.0.0.1:4173/dental-implants-china | rg -n "<title>Dental Implants in China|rel=\"canonical\"|application/ld\\+json|Can foreigners get dental implants|Get a free quote"
```

Expected:
- Verification script exits 0.
- `curl` sees route-specific title, canonical, JSON-LD, FAQ, and CTA before JavaScript execution.

- [ ] **Step 9: Commit chunk 3**

```bash
git add package.json vercel.json public/sitemap.xml public/llms.txt public/llms-full.txt scripts src/__tests__/geo-public-assets.test.ts src/__tests__/geo-vercel-rewrites.test.ts
git commit -m "feat(geo): generate crawlable answer assets"
```

---

## Chunk 4: Internal Linking And Existing Route Alignment

This chunk makes new GEO pages discoverable from existing high-value pages without cluttering main navigation.

### Task 6: Link Existing Business Pages To GEO Targets

**Files:**
- Modify: `frontend-vercel/src/pages/SeoTreatmentLanding.tsx`
- Modify: `frontend-vercel/src/pages/HollywoodSmileVeneers.tsx`
- Modify: `frontend-vercel/src/pages/Rhinoplasty.tsx`
- Modify: `frontend-vercel/src/pages/DoubleEyelidSurgery.tsx`
- Modify: `frontend-vercel/src/pages/Visa.tsx`
- Modify: `frontend-vercel/src/pages/Hospitals.tsx`
- Modify: `frontend-vercel/src/pages/Telemedicine.tsx`
- Modify: `frontend-vercel/src/pages/HomePage.tsx`
- Test: `frontend-vercel/src/__tests__/geo-internal-links.test.ts`

- [ ] **Step 1: Write failing internal link tests**

Create `frontend-vercel/src/__tests__/geo-internal-links.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function src(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

describe('GEO internal links', () => {
  it('links category pages to GEO answer targets', () => {
    const seoLanding = src('src/pages/SeoTreatmentLanding.tsx');
    expect(seoLanding).toContain('/cancer-treatment-china');
    expect(seoLanding).toContain('/dental-implants-china');
    expect(seoLanding).toContain('/rhinoplasty-china');
  });

  it('links existing high-value detail pages to their GEO canonical guides', () => {
    expect(src('src/pages/HollywoodSmileVeneers.tsx')).toContain('/hollywood-smile-veneers-china');
    expect(src('src/pages/Rhinoplasty.tsx')).toContain('/rhinoplasty-china');
    expect(src('src/pages/DoubleEyelidSurgery.tsx')).toContain('/double-eyelid-surgery-china');
  });

  it('links operational pages to service GEO guides', () => {
    expect(src('src/pages/Visa.tsx')).toContain('/china-medical-visa');
    expect(src('src/pages/Hospitals.tsx')).toContain('/hospitals-in-china-for-foreigners');
    expect(src('src/pages/Telemedicine.tsx')).toContain('/medical-second-opinion-china');
    expect(src('src/pages/HomePage.tsx')).toContain('/medical-treatment-in-china-for-foreigners');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/geo-internal-links.test.ts
```

Expected: FAIL until links are added.

- [ ] **Step 3: Add contextual links**

Add a small "Related patient guides" section near the lower half of each target page. Use existing `Link` and `Button` patterns; do not add global nav clutter.

For `SeoTreatmentLanding.tsx`, extend `landingContent` entries with related GEO links:

```ts
relatedGuides: [
  { label: 'Cancer treatment in China guide', href: '/cancer-treatment-china' },
  { label: 'Proton and carbon ion therapy in China guide', href: '/proton-carbon-ion-therapy-china' },
]
```

Render after "Related treatments":

```tsx
{content.relatedGuides?.length ? (
  <section className="container mx-auto px-4 pb-16">
    <h2 className="text-2xl font-bold text-slate-950">Related patient guides</h2>
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {content.relatedGuides.map((guide) => (
        <Link key={guide.href} to={guide.href} className="rounded-lg border border-slate-200 p-4 font-semibold text-teal-700 hover:border-teal-300">
          {guide.label}
        </Link>
      ))}
    </div>
  </section>
) : null}
```

For existing detail/service pages, add one concise link block near the CTA or FAQ area:

```tsx
<Link to="/rhinoplasty-china" className="font-semibold text-teal-700 hover:text-teal-900">
  Read the international patient guide to rhinoplasty in China
</Link>
```

- [ ] **Step 4: Run internal link tests**

```bash
npx vitest run src/__tests__/geo-internal-links.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit chunk 4**

```bash
git add src/pages src/__tests__/geo-internal-links.test.ts
git commit -m "feat(geo): link existing pages to answer guides"
```

---

## Chunk 5: End-To-End Verification And Review Until Clean

This chunk verifies the implementation and runs the requested review loop. The review must focus on:

1. Whether all existing valuable website business keywords are covered in Phase 1A, Phase 1B, or Phase 2 backlog.
2. Whether the design and implementation are strategically reasonable for GEO, not just traditional SEO.

### Task 7: Run Narrow And Full Verification

**Files:**
- No new files unless fixes are required by verification.

- [ ] **Step 1: Run GEO-specific tests**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npx vitest run \
  src/geo/__tests__/geo-pages.test.ts \
  src/lib/seo/__tests__/geo-metadata.test.ts \
  src/__tests__/geo-public-entrypoints.test.tsx \
  src/__tests__/geo-public-assets.test.ts \
  src/__tests__/geo-vercel-rewrites.test.ts \
  src/__tests__/geo-internal-links.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run broader app tests**

```bash
npx vitest run
```

Expected: PASS, or document unrelated existing failures with exact test names and reason.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Verify route-specific static HTML**

```bash
for path in \
  medical-treatment-in-china-for-foreigners \
  dental-implants-china \
  all-on-4-all-on-6-dental-implants-china \
  hollywood-smile-veneers-china \
  rhinoplasty-china \
  double-eyelid-surgery-china \
  hospitals-in-china-for-foreigners \
  international-patient-services-china \
  china-medical-visa \
  medical-interpreter-china \
  medical-second-opinion-china \
  cancer-treatment-china \
  proton-carbon-ion-therapy-china
do
  test -f "dist/$path/index.html"
  rg -n "application/ld\\+json|canonical|Medora" "dist/$path/index.html"
done
```

Expected: every approved Phase 1A route has a static HTML file with JSON-LD, canonical, and Medora copy.

- [ ] **Step 5: Verify served route-specific static HTML**

Start preview if not already running:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

Run:

```bash
GEO_VERIFY_ORIGIN=http://127.0.0.1:4173 node scripts/verify-geo-static-html.mjs
```

Expected: script exits 0 and fails if any Phase 1A route lacks route-specific title, description, canonical, quick-answer text, CTA, FAQ, or JSON-LD.

- [ ] **Step 6: Verify gated routes are excluded**

```bash
test ! -d dist/car-t-cell-therapy-china
test ! -d dist/stem-cell-therapy-china
test ! -d dist/parkinsons-stem-cell-therapy-china
test ! -d dist/autism-stem-cell-therapy-china
test ! -d dist/bariatric-surgery-china
test ! -d dist/sbrt-radiotherapy-china
test ! -d dist/immune-cell-cryopreservation-china
test ! -d dist/hifu-uterine-fibroids-china
test ! -d dist/deep-brain-stimulation-china
test ! -d dist/coronary-intervention-pci-china
test ! -d dist/cancer-surgery-china
test ! -d dist/cardiology-cardiothoracic-surgery-china
test ! -d dist/hematology-treatment-china
test ! -d dist/stem-cell-transplant-china
```

Expected: all commands pass.

- [ ] **Step 7: Verify production robots and Cloudflare crawler policy**

Run against production after deploy or preview promotion:

```bash
curl -sL https://www.medicaltourismchina.health/robots.txt | tee /tmp/medicaltourismchina-robots.txt
curl -sL https://www.medicaltourismchina.health/llms.txt | tee /tmp/medicaltourismchina-llms.txt
curl -sL https://www.medicaltourismchina.health/sitemap.xml | tee /tmp/medicaltourismchina-sitemap.xml
rg -n "Googlebot|Bingbot|GPTBot|ChatGPT-User|ClaudeBot|PerplexityBot|Google-Extended|CCBot|Bytespider|Amazonbot|Disallow" /tmp/medicaltourismchina-robots.txt
rg -n "Medora Health|dental-implants-china|proton-carbon-ion-therapy-china|medical-second-opinion-china" /tmp/medicaltourismchina-llms.txt /tmp/medicaltourismchina-sitemap.xml
```

Then record the Cloudflare Managed Content Signals setting from the Cloudflare dashboard or deployment owner.

Before Phase 1A GEO is considered live:

- Confirm production `robots.txt` is the actual policy being served, not only the repo copy.
- Confirm production `llms.txt` and `sitemap.xml` are served and contain approved Phase 1A canonical URLs.
- Confirm `Googlebot` and `Bingbot` are allowed.
- Decide and record the policy for `GPTBot`, `ChatGPT-User`, `ClaudeBot`, and `PerplexityBot`.
- Decide and record whether `Google-Extended`, `CCBot`, `Bytespider`, and `Amazonbot` remain blocked.
- If AI crawler exposure is not approved, mark launch status as `search-only, AI-crawler exposure pending`.

Expected: crawler policy is explicitly recorded. Do not claim Phase 1A is live for GEO/AI discovery if Cloudflare production robots still blocks the approved AI discovery crawlers.

### Task 8: Review Until Clean

**Files:**
- Potentially modify files from earlier chunks if review finds validated issues.

- [ ] **Step 1: Freeze review scope**

Capture:

```bash
git status --short --branch
git log --oneline -5
git diff --stat HEAD~4..HEAD
```

Record:
- Implemented Phase 1A pages.
- Gated Phase 1B pages.
- Phase 2 backlog coverage.
- Verification commands and results.
- Known uncertainty: Cloudflare production robots settings require external confirmation.

- [ ] **Step 2: Dispatch reviewer**

Use `review-until-clean` reviewer prompt. Ask specifically:

```text
Review the GEO Conversion Stack implementation.

Primary review questions:
1. Does the keyword/answer-target inventory cover all valuable existing business lines in the site, either as Phase 1A launched pages, Phase 1B gated pages, or Phase 2 backlog?
2. Is the design strategically reasonable for GEO/LLMO/AEO rather than only traditional SEO?

Also check:
- Phase 1A pages have crawlable static HTML before React hydration.
- Phase 1B medical-risk pages are not routed, added to sitemap, or included in llms assets.
- Existing high-value routes link to relevant GEO guides.
- JSON-LD and metadata are consistent.
- No unsupported medical claims or doorway-page patterns were introduced.
```

- [ ] **Step 3: Route reviewer findings through receiver**

Use a separate receiving subagent. It should:
- Validate whether each review finding is technically correct.
- Separate must-fix coverage gaps from nice-to-have future expansion.
- Reject review comments that would force unsafe high-risk medical pages into Phase 1A without evidence approval.

- [ ] **Step 4: Fix only validated findings**

For every validated finding:
- Add missing coverage as Phase 1A/1B/2 config entry, not necessarily as a public route.
- Fix any static HTML, sitemap, `llms`, schema, or routing inconsistency.
- Re-run the narrow relevant tests.

- [ ] **Step 5: Repeat review loop**

Repeat reviewer -> receiver -> fix -> verify until reviewer says no meaningful findings remain.

- [ ] **Step 6: Main-agent recheck**

Before final commit, personally inspect:

```bash
git diff --stat
git diff -- frontend-vercel/src/geo frontend-vercel/scripts frontend-vercel/public frontend-vercel/src/pages frontend-vercel/src/lib/seo frontend-vercel/vercel.json frontend-vercel/package.json
```

Confirm:
- No unrelated existing worktree changes were reverted.
- Phase 1A, Phase 1B, and Phase 2 coverage is explicit.
- Static/prerendered HTML requirement is still enforced.
- Review loop is clean.

- [ ] **Step 7: Commit final reviewed implementation**

Use `detailed-commit-messages`:

```bash
git add frontend-vercel/src/geo frontend-vercel/scripts frontend-vercel/public frontend-vercel/src/pages frontend-vercel/src/lib/seo frontend-vercel/src/__tests__ frontend-vercel/vercel.json frontend-vercel/package.json
git commit
```

Commit body must include:
- Coverage findings.
- Review-until-clean loop result.
- Verification commands.
- Remaining crawler-policy/Cloudflare uncertainties.

---

## Notes For Implementers

- Do not publish high-risk Phase 1B pages just to improve keyword coverage. Coverage means the business area is accounted for in config/backlog; public launch still depends on evidence and approval.
- Do not rely on client-side `document.title` for GEO launch success. `curl -sL` against the built/served route must see page-specific content.
- Do not crowd global navigation. Use contextual links from relevant pages and generated machine-readable assets.
- Avoid medical certainty. The safest conversion language for serious conditions is "submit records", "request treatment plan review", and "compare options after clinician evaluation".
- Keep existing user flows intact: `/free-quote`, `/medical-enquiry`, `/medical-case-intake`, `/hospitals`, and current treatment pages should remain usable.

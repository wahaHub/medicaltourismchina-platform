# SEO Keyword Expansion Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first SEO keyword expansion wave for MedicalTourismChina: 32 China-core and global-comparison landing pages with reusable metadata, structured data, sitemap coverage, route registration, internal links, static prerendered HTML, and tests.

**Architecture:** Keep the current Vite React SPA and add a reusable SEO landing system driven by a typed content config. The first wave renders normally in React, then prerenders the 32 SEO routes into route-specific static HTML after `vite build` so the deployed site is not relying only on client-side metadata for these pages.

**Tech Stack:** Vite, React 18, React Router, TypeScript, Vitest, jsdom, Playwright-driven prerender script, static `public/sitemap.xml`.

---

## Source Spec

- Design spec: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/docs/superpowers/specs/2026-06-05-seo-keyword-expansion-design.md`
- App root: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel`

## First-Wave URL Scope

Implement exactly these 32 SEO routes in this phase:

1. `/dental-implants-china`
2. `/all-on-6-dental-implants-china`
3. `/all-on-4-dental-implants-china`
4. `/full-mouth-dental-implants-china-cost`
5. `/dental-veneers-china`
6. `/stem-cell-therapy-china`
7. `/autism-stem-cell-therapy-china`
8. `/parkinsons-stem-cell-therapy-china`
9. `/diabetes-stem-cell-therapy-china`
10. `/hematopoietic-stem-cell-transplant-china`
11. `/cancer-treatment-china`
12. `/proton-therapy-china`
13. `/carbon-ion-therapy-china`
14. `/car-t-cell-therapy-china`
15. `/rhinoplasty-china`
16. `/double-eyelid-surgery-china`
17. `/breast-augmentation-china`
18. `/hair-transplant-china`
19. `/gastric-sleeve-surgery-china`
20. `/gastric-bypass-surgery-china`
21. `/bariatric-surgery-china`
22. `/hospitals-in-china-for-foreigners`
23. `/best-hospitals-in-china-for-foreigners`
24. `/international-patient-services-china`
25. `/china-medical-visa`
26. `/medical-interpreter-china`
27. `/china-medical-second-opinion`
28. `/best-country-for-dental-implants`
29. `/medical-tourism-for-dental-implants`
30. `/best-country-for-stem-cell-therapy`
31. `/medical-tourism-for-stem-cell-therapy`
32. `/cancer-treatment-abroad`

Do not add city doorway pages, unrelated country pages, or broad global-directory pages in this phase.

## Keyword Coverage Rationale

This first wave must cover the strongest existing business inventory visible in the current app, not every possible service or treatment page. The route set above maps to:

- Core medical tourism brand intent: keep `medical tourism China` and `medical tourism in China` anchored to the existing homepage and `/why-china`; do not duplicate that intent with a new first-wave URL.
- Dental: existing dental treatment, All-on-4/6 featured treatment, Hollywood Smile/Veneers page, dental implant pricing intent.
- Stem cell and regenerative medicine: existing stem cell category, autism, Parkinson's, diabetes, and hematopoietic stem cell transplantation content.
- Cancer and advanced oncology: existing cancer category, proton/heavy ion featured treatment, CAR-T featured treatment, and broader cancer-treatment-abroad comparison intent.
- Cosmetic and aesthetic surgery: existing rhinoplasty, double eyelid surgery, breast augmentation, and hair transplant pages.
- Bariatric and weight loss: existing bariatric, gastric sleeve, and gastric bypass pages.
- International patient operations: hospitals for foreigners, hospital matching, international patient services, visa, interpreter, and second opinion/telemedicine.

The plan intentionally does not include every specialty in `src/data/treatments.ts` or every existing standalone page as a first-wave landing page. Cardiology, orthopedics, gynecology, ophthalmology, urinary stones, hearing reconstruction, health checkups, facial liposuction, dental crowns, full mouth restoration, adjustable gastric band, tummy tuck, breast reduction, arm lift, and longevity stem cell therapy are valuable but less central to this first launch. Preserve their existing routes and links, then evaluate them for a second SEO wave after Search Console and conversion data from this launch.

## Implementation Guardrails From Plan Review

- Keep the 32-route scope. Do not add extra first-wave pages during implementation without a new review.
- Use `Medora Health` as the canonical public brand for new SEO metadata, structured data, base HTML, and new landing pages. Treat `MedChina` as legacy copy that should not be introduced into new SEO assets.
- Avoid duplicate content between `/proton-therapy-china` and `/carbon-ion-therapy-china`. The proton page should focus on proton therapy access, planning, cost/timeline, and comparison to conventional radiotherapy. The carbon ion page should explicitly cover `carbon ion therapy China`, `heavy ion therapy China`, how carbon ion differs from proton therapy, and where it may be evaluated for harder-to-treat tumors.
- Make `/china-medical-second-opinion` cover `telemedicine China second opinion` as a secondary keyword through the config and page sections, even though the URL remains shorter.
- For `/best-hospitals-in-china-for-foreigners`, do not present an unsourced ranking. Title and body copy should frame the page around how to evaluate matched hospitals, international-patient support, specialties, language support, admission workflow, and quote readiness.
- For stem cell and cancer pages, prefer cautious language and explicit record-review prompts. Avoid guarantee language, cure claims, or broad eligibility claims.
- Do not ship thin medical pages. Each first-wave page must read as a patient decision guide, not a keyword wrapper.

## File Structure

Create:

- `frontend-vercel/src/seo/brand.ts`
  - Owns the canonical public brand name, site URL, default social image, and helper title suffix.
- `frontend-vercel/src/seo/landing-pages.ts`
  - Owns typed first-wave landing page content and keyword metadata.
  - Exports `seoLandingPages`, `seoLandingPageByPath`, and `FIRST_WAVE_SEO_PATHS`.
- `frontend-vercel/src/seo/useSeoMeta.ts`
  - Owns client-side title, meta, canonical, Open Graph, Twitter, and JSON-LD tag management.
  - Replaces stale JSON-LD tags on route change.
- `frontend-vercel/src/pages/SeoKeywordLandingPage.tsx`
  - Owns reusable rendering for China-core, service, and global-comparison SEO pages.
  - Reads one page config and renders hero, overview sections, cost/timeline, suitability, risk notes, China value, comparison rows, FAQ, and related links.
- `frontend-vercel/src/seo/__tests__/landing-pages.test.ts`
  - Validates first-wave URL coverage and config completeness.
- `frontend-vercel/src/seo/__tests__/useSeoMeta.test.tsx`
  - Validates metadata and JSON-LD behavior.
- `frontend-vercel/src/seo/__tests__/brand.test.ts`
  - Validates canonical brand usage for SEO config and base metadata helpers.
- `frontend-vercel/scripts/prerender-seo.mjs`
  - Builds route-specific static HTML files for the 32 first-wave SEO routes after Vite build.
- `frontend-vercel/src/seo/__tests__/prerender-config.test.ts`
  - Validates the prerender route list matches `FIRST_WAVE_SEO_PATHS`.

Modify:

- `frontend-vercel/package.json`
  - Add prerender scripts and required dev dependencies.
- `frontend-vercel/package-lock.json`
  - Capture dependency changes.
- `frontend-vercel/index.html`
  - Normalize base title, description, author, and Open Graph brand to `Medora Health`.
- `frontend-vercel/vercel.json`
  - Update only if verification shows the catch-all SPA rewrite prevents prerendered `dist/<route>/index.html` files from being served for first-wave SEO routes.
- `frontend-vercel/src/App.tsx`
  - Register each first-wave SEO route using the reusable page renderer.
- `frontend-vercel/public/sitemap.xml`
  - Add first-wave SEO URLs.
- `frontend-vercel/src/__tests__/seo-public-entrypoints.test.ts`
  - Extend route and sitemap assertions.
- `frontend-vercel/src/pages/SeoTreatmentLanding.tsx`
  - Add contextual related links to the new keyword pages only if this can be done cleanly without redesigning the page.
- `frontend-vercel/src/pages/HomePage.tsx`
  - Normalize the homepage title brand to `Medora Health` if it still writes `MedChina`.

Do not modify:

- Private dashboard routes.
- Auth routes.
- Patient-session state.
- Backend API code.
- Existing hospital slug middleware.

## Chunk 1: SEO Config And Keyword Coverage

### Task 1: Write brand and config coverage tests

**Files:**
- Create: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/seo/__tests__/brand.test.ts`
- Create: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/seo/__tests__/landing-pages.test.ts`
- Create later: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/seo/brand.ts`
- Create later: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/seo/landing-pages.ts`

- [ ] **Step 1: Write failing tests for canonical SEO brand**

Test requirements:

```ts
import { describe, expect, it } from "vitest";
import { SEO_BRAND_NAME, buildSeoTitle } from "../brand";

describe("SEO brand", () => {
  it("uses Medora Health as the canonical public brand", () => {
    expect(SEO_BRAND_NAME).toBe("Medora Health");
    expect(buildSeoTitle("Dental Implants China")).toBe("Dental Implants China | Medora Health");
  });
});
```

- [ ] **Step 2: Write failing tests for exact first-wave route coverage**

Test requirements:

```ts
import { describe, expect, it } from "vitest";
import { FIRST_WAVE_SEO_PATHS, seoLandingPages } from "../landing-pages";

const expectedPaths = [
  "/dental-implants-china",
  "/all-on-6-dental-implants-china",
  "/all-on-4-dental-implants-china",
  "/full-mouth-dental-implants-china-cost",
  "/dental-veneers-china",
  "/stem-cell-therapy-china",
  "/autism-stem-cell-therapy-china",
  "/parkinsons-stem-cell-therapy-china",
  "/diabetes-stem-cell-therapy-china",
  "/hematopoietic-stem-cell-transplant-china",
  "/cancer-treatment-china",
  "/proton-therapy-china",
  "/carbon-ion-therapy-china",
  "/car-t-cell-therapy-china",
  "/rhinoplasty-china",
  "/double-eyelid-surgery-china",
  "/breast-augmentation-china",
  "/hair-transplant-china",
  "/gastric-sleeve-surgery-china",
  "/gastric-bypass-surgery-china",
  "/bariatric-surgery-china",
  "/hospitals-in-china-for-foreigners",
  "/best-hospitals-in-china-for-foreigners",
  "/international-patient-services-china",
  "/china-medical-visa",
  "/medical-interpreter-china",
  "/china-medical-second-opinion",
  "/best-country-for-dental-implants",
  "/medical-tourism-for-dental-implants",
  "/best-country-for-stem-cell-therapy",
  "/medical-tourism-for-stem-cell-therapy",
  "/cancer-treatment-abroad",
];

describe("SEO landing page config", () => {
  it("defines the exact first-wave SEO URL set", () => {
    expect(FIRST_WAVE_SEO_PATHS).toEqual(expectedPaths);
    expect(seoLandingPages.map((page) => page.path)).toEqual(expectedPaths);
  });
});
```

- [ ] **Step 3: Write failing tests for valuable business keyword coverage**

Assert that the config covers these terms across `primaryKeyword` and `secondaryKeywords`, while each page still keeps one clean `primaryKeyword`:

```text
dental implants China
all on 6 dental implants China
all on 4 dental implants China
full mouth dental implants China cost
dental veneers China
stem cell therapy China
autism stem cell therapy China
Parkinson's stem cell therapy China
diabetes stem cell therapy China
hematopoietic stem cell transplant China
cancer treatment China
proton therapy China
carbon ion therapy China
CAR T cell therapy China
rhinoplasty China
double eyelid surgery China
breast augmentation China
hair transplant China
gastric sleeve surgery China
gastric bypass surgery China
bariatric surgery China
hospitals in China for foreigners
best hospitals in China for foreigners
international patient services China
China medical visa
medical interpreter China
China medical second opinion
telemedicine China second opinion
best country for dental implants
medical tourism for dental implants
best country for stem cell therapy
medical tourism for stem cell therapy
cancer treatment abroad
```

- [ ] **Step 4: Write failing tests for config completeness and content depth**

For every landing page, require:

```text
path
title
description
canonicalUrl
primaryKeyword
h1
summary
heroCta.primary
sections length >= 5
recordsNeeded length >= 3
evaluationProcess length >= 3
quoteFactors length >= 3
followUpPlan length >= 2
chinaValue
faqItems length between 4 and 6
relatedLinks length >= 3
schema
```

For comparison pages, require `comparisonRows.length >= 3`.

Also assert no first-wave title, description, or H1 contains `MedChina`.

- [ ] **Step 5: Run tests and verify failure**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npx vitest run src/seo/__tests__/brand.test.ts src/seo/__tests__/landing-pages.test.ts
```

Expected: FAIL because `src/seo/brand.ts` and `src/seo/landing-pages.ts` do not exist yet.

### Task 2: Implement canonical brand and typed SEO landing config

**Files:**
- Create: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/seo/brand.ts`
- Create: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/seo/landing-pages.ts`

- [ ] **Step 1: Define SEO brand constants**

Define:

```ts
export const SEO_BRAND_NAME = "Medora Health";
export const SEO_SITE_URL = "https://www.medicaltourismchina.health";
export const SEO_DEFAULT_IMAGE_URL = "https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/Medora%20Health-logo/logo-1_x1.png";

export function buildSeoTitle(title: string): string {
  return `${title} | ${SEO_BRAND_NAME}`;
}
```

- [ ] **Step 2: Define TypeScript content types**

Define focused types:

```ts
export type SeoLandingPageKind = "china-treatment" | "china-service" | "global-comparison";

export type SeoLandingPage = {
  kind: SeoLandingPageKind;
  path: string;
  title: string;
  description: string;
  canonicalUrl: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  eyebrow: string;
  h1: string;
  summary: string;
  heroCta: {
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
  sections: Array<{ title: string; body: string; bullets?: string[] }>;
  recordsNeeded: string[];
  evaluationProcess: string[];
  quoteFactors: string[];
  followUpPlan: string[];
  costTimeline?: Array<{ label: string; value: string; note?: string }>;
  suitability: string[];
  riskNotes: string[];
  chinaValue: { title: string; body: string; bullets: string[] };
  comparisonRows?: Array<{ destination: string; strengths: string; tradeoffs: string; bestFor: string }>;
  faqItems: Array<{ question: string; answer: string }>;
  relatedLinks: Array<{ label: string; href: string; description?: string }>;
  schema: "MedicalWebPage" | "WebPage" | "Service";
};
```

- [ ] **Step 3: Add the 32 page configs**

Use medically cautious, patient-useful copy. Keep each page config concise but not thin:

- At least 5 decision-guide sections.
- Explicit records-needed bullets.
- Explicit remote-evaluation/process bullets.
- Explicit quote-factor bullets explaining why pricing varies.
- Explicit follow-up-plan bullets.
- 4 FAQ items minimum.
- At least 3 related links.
- Risk notes for every treatment page.
- Comparison rows for the 5 global comparison pages.
- `Medora Health` as the brand in title/metadata when the brand is mentioned.
- No `cure`, `guaranteed`, `best hospital ranking`, or broad eligibility claims.

- [ ] **Step 4: Add helper exports**

Export:

```ts
export const FIRST_WAVE_SEO_PATHS = seoLandingPages.map((page) => page.path);
export const seoLandingPageByPath = new Map(seoLandingPages.map((page) => [page.path, page]));
export function getSeoLandingPage(path: string): SeoLandingPage | undefined;
```

- [ ] **Step 5: Run config tests**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npx vitest run src/seo/__tests__/brand.test.ts src/seo/__tests__/landing-pages.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit chunk 1**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform
git add frontend-vercel/src/seo/brand.ts frontend-vercel/src/seo/landing-pages.ts frontend-vercel/src/seo/__tests__/brand.test.ts frontend-vercel/src/seo/__tests__/landing-pages.test.ts
git commit -m "feat(seo): define keyword landing page config"
```

## Chunk 2: Metadata Helper

### Task 3: Write metadata helper tests

**Files:**
- Create: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/seo/__tests__/useSeoMeta.test.tsx`
- Create later: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/seo/useSeoMeta.ts`

- [ ] **Step 1: Test tag creation and updates**

Render a test component that calls `useSeoMeta(page)` and assert:

- `document.title` equals page title.
- `meta[name="description"]` exists and matches.
- `link[rel="canonical"]` exists and matches.
- Open Graph tags exist and match.
- `meta[name="twitter:card"]` exists and uses `summary_large_image`.

- [ ] **Step 2: Test JSON-LD replacement on route/page change**

Render once with one page, rerender with another page, and assert:

- Only current SEO JSON-LD tags remain.
- FAQ JSON-LD question count matches the current page.
- Breadcrumb JSON-LD uses the current page path.

- [ ] **Step 3: Run tests and verify failure**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npx vitest run src/seo/__tests__/useSeoMeta.test.tsx
```

Expected: FAIL because `useSeoMeta` does not exist.

### Task 4: Implement `useSeoMeta`

**Files:**
- Create: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/seo/useSeoMeta.ts`

- [ ] **Step 1: Implement meta tag helpers**

Implement small helpers:

```ts
function upsertMeta(selector: string, attrs: Record<string, string>): void;
function upsertLink(selector: string, attrs: Record<string, string>): void;
function replaceSeoJsonLd(items: Array<Record<string, unknown>>): void;
```

Mark JSON-LD tags with `data-seo-json-ld="true"` so they can be replaced safely.

- [ ] **Step 2: Implement schema builders**

Build:

- `BreadcrumbList`
- `FAQPage`
- `MedicalWebPage` or `WebPage`
- `Service` for service pages

- [ ] **Step 3: Implement hook**

`useSeoMeta(page)` should update tags in a `useEffect` keyed by the page path/title/description/FAQ data.

- [ ] **Step 4: Run metadata tests**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npx vitest run src/seo/__tests__/useSeoMeta.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit chunk 2**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform
git add frontend-vercel/src/seo/useSeoMeta.ts frontend-vercel/src/seo/__tests__/useSeoMeta.test.tsx
git commit -m "feat(seo): add landing page metadata helper"
```

## Chunk 3: Landing Page Renderer And Routes

### Task 5: Implement reusable SEO landing page renderer

**Files:**
- Create: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/pages/SeoKeywordLandingPage.tsx`

- [ ] **Step 1: Render page shell from config**

Use existing app components where appropriate:

- `TopBanner`
- `Header`
- `Footer`
- `Button`
- `Accordion` for FAQ if useful

Render:

- Hero with eyebrow, H1, summary, CTAs.
- Overview sections.
- Records needed before review.
- Remote evaluation / process steps.
- Quote factors.
- Follow-up plan.
- Cost/timeline cards when provided.
- Suitability and risk notes.
- China value section.
- Comparison table when `comparisonRows` exists.
- Related links.
- FAQ.

- [ ] **Step 2: Add medical safety tone in UI copy**

Keep visible text factual and decision-oriented. Avoid guarantees. Use the config's risk notes and suitability sections prominently enough that pages do not read like medical promises.

- [ ] **Step 3: Use metadata hook**

Call `useSeoMeta(page)` at the top of the component.

- [ ] **Step 4: Handle missing config**

If the page prop is missing, render `NotFound` or return a clear fallback via routing. Do not silently render empty content.

### Task 6: Register SEO routes in `App.tsx`

**Files:**
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/App.tsx`

- [ ] **Step 1: Import renderer and config**

Add imports:

```ts
import SeoKeywordLandingPage from "./pages/SeoKeywordLandingPage";
import { seoLandingPages } from "@/seo/landing-pages";
```

- [ ] **Step 2: Register explicit route entries**

Inside `<Routes>`, map config pages before the catch-all:

```tsx
{seoLandingPages.map((page) => (
  <Route
    key={page.path}
    path={page.path}
    element={<SeoKeywordLandingPage page={page} />}
  />
))}
```

Place this near existing SEO/treatment routes and above `path="*"`.

- [ ] **Step 3: Run route smoke test manually**

Start dev server:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npm run dev -- --host 127.0.0.1
```

Open a few paths:

- `/dental-implants-china`
- `/best-country-for-stem-cell-therapy`
- `/china-medical-visa`

Expected: each page renders a complete SEO landing page.

### Task 7: Extend public entrypoint tests

**Files:**
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/__tests__/seo-public-entrypoints.test.ts`

- [ ] **Step 1: Import first-wave paths**

Use `FIRST_WAVE_SEO_PATHS` from `src/seo/landing-pages`.

- [ ] **Step 2: Assert sitemap contains every first-wave path**

Extend existing sitemap test to loop over `FIRST_WAVE_SEO_PATHS`.

- [ ] **Step 3: Assert App registers SEO route mapping**

Assert `App.tsx` contains the reusable route mapping and `SeoKeywordLandingPage`.

- [ ] **Step 4: Run public entrypoint tests**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npx vitest run src/__tests__/seo-public-entrypoints.test.ts
```

Expected before sitemap edit: FAIL because sitemap does not include new paths.

### Task 8: Normalize base public brand metadata

**Files:**
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/index.html`
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/pages/HomePage.tsx`

- [ ] **Step 1: Update base HTML metadata**

Change the base title, author, description, and Open Graph title/description to use `Medora Health`.

Keep the medical tourism China keyword intent in the title and description. Do not remove the existing logo/social image unless replacing it with the same Medora Health logo URL from `brand.ts`.

- [ ] **Step 2: Update homepage client title**

If `HomePage.tsx` still writes `MedChina - Premium Medical Tourism to China`, change it to a Medora Health title aligned with the base HTML.

- [ ] **Step 3: Add a focused brand assertion**

Extend `seo-public-entrypoints.test.ts` or `brand.test.ts` to assert:

- `index.html` does not contain `MedChina`.
- `index.html` contains `Medora Health`.
- The homepage title string in `HomePage.tsx` does not introduce `MedChina`.

Do not mass-edit every legacy page title in this first chunk unless the implementation remains small and testable. First-wave SEO pages and base metadata are the priority.

## Chunk 4: Sitemap And Internal Links

### Task 9: Expand sitemap

**Files:**
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/public/sitemap.xml`

- [ ] **Step 1: Add 32 first-wave URLs**

Add one `<url>` per first-wave path using:

```xml
<loc>https://www.medicaltourismchina.health/dental-implants-china</loc>
```

Use priority:

- `0.9` for China-core treatment and service pages.
- `0.8` for global comparison pages.

- [ ] **Step 2: Run sitemap test**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npx vitest run src/__tests__/seo-public-entrypoints.test.ts
```

Expected: PASS.

### Task 10: Add contextual links from existing SEO category pages

**Files:**
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/pages/SeoTreatmentLanding.tsx`

- [ ] **Step 1: Add related keyword links to landing content**

For each existing category landing:

- cosmetic: link to `/rhinoplasty-china`, `/double-eyelid-surgery-china`, `/breast-augmentation-china`, `/hair-transplant-china`.
- dental: link to `/dental-implants-china`, `/all-on-6-dental-implants-china`, `/all-on-4-dental-implants-china`, `/full-mouth-dental-implants-china-cost`, `/dental-veneers-china`, `/best-country-for-dental-implants`.
- stem cell: link to `/stem-cell-therapy-china`, `/autism-stem-cell-therapy-china`, `/parkinsons-stem-cell-therapy-china`, `/diabetes-stem-cell-therapy-china`, `/hematopoietic-stem-cell-transplant-china`, `/best-country-for-stem-cell-therapy`.
- cancer: link to `/cancer-treatment-china`, `/proton-therapy-china`, `/carbon-ion-therapy-china`, `/car-t-cell-therapy-china`, `/cancer-treatment-abroad`.
- bariatric: link from `/bariatric-surgery` and related treatment content to `/bariatric-surgery-china`, `/gastric-sleeve-surgery-china`, and `/gastric-bypass-surgery-china`.

- [ ] **Step 2: Keep the UI simple**

Reuse the existing related treatments card grid. Do not redesign this page.

- [ ] **Step 3: Run a narrow build/type check**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit chunks 3-4**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform
git add frontend-vercel/src/App.tsx frontend-vercel/src/pages/SeoKeywordLandingPage.tsx frontend-vercel/src/__tests__/seo-public-entrypoints.test.ts frontend-vercel/public/sitemap.xml frontend-vercel/src/pages/SeoTreatmentLanding.tsx frontend-vercel/index.html frontend-vercel/src/pages/HomePage.tsx
git commit -m "feat(seo): publish first wave keyword landing routes"
```

## Chunk 5: Static Prerender For SEO Routes

### Task 11: Write prerender route parity tests

**Files:**
- Create: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/seo/__tests__/prerender-config.test.ts`
- Create later: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/scripts/prerender-seo.mjs`

- [ ] **Step 1: Write failing test for prerender route parity**

The test should read `scripts/prerender-seo.mjs` and assert the script references `FIRST_WAVE_SEO_PATHS` rather than maintaining a separate hard-coded route list.

If direct source assertion feels brittle, export a small helper from the script and import it in the test. The important invariant is one route source of truth.

- [ ] **Step 2: Write failing test for package script**

Assert `package.json` contains:

```json
{
  "scripts": {
    "build": "vite build && npm run prerender:seo",
    "build:raw": "vite build",
    "prerender:seo": "node scripts/prerender-seo.mjs"
  }
}
```

The exact script names can differ, but `npm run build` must produce prerendered SEO HTML in this phase.

- [ ] **Step 3: Run test and verify failure**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npx vitest run src/seo/__tests__/prerender-config.test.ts
```

Expected: FAIL because the prerender script and package scripts do not exist yet.

### Task 12: Implement Playwright-driven prerender

**Files:**
- Create: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/scripts/prerender-seo.mjs`
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/package.json`
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/package-lock.json`
- Modify if needed: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/vercel.json`

- [ ] **Step 1: Add dev dependencies**

Install a minimal runtime for prerendering:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npm install --save-dev playwright tsx
```

Use `tsx` so the Node script can import `FIRST_WAVE_SEO_PATHS` from the TypeScript SEO config without duplicating the 32-route list.

- [ ] **Step 2: Add build scripts**

Update scripts:

```json
{
  "build": "vite build && npm run prerender:seo",
  "build:raw": "vite build",
  "prerender:seo": "tsx scripts/prerender-seo.mjs"
}
```

- [ ] **Step 3: Implement prerender script**

Script behavior:

1. Import `FIRST_WAVE_SEO_PATHS` from `../src/seo/landing-pages.ts`.
2. Start a local static server for `dist` using `vite preview --host 127.0.0.1 --port 4173`.
3. Use Playwright Chromium to visit each first-wave path.
4. Wait until the page has the expected H1 and the document title is not the base fallback.
5. Capture `await page.content()`.
6. Write HTML to `dist/<route>/index.html`.
7. Preserve Vite asset links and scripts from the rendered document.
8. Shut down the browser and preview server in `finally`.

The script must fail the build if any first-wave route:

- returns a blank page,
- keeps the fallback title,
- lacks a canonical tag,
- lacks at least one SEO JSON-LD script,
- lacks an H1,
- or cannot be written to `dist/<route>/index.html`.

- [ ] **Step 4: Run prerender config test**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npx vitest run src/seo/__tests__/prerender-config.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run raw build then prerender**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npm run build:raw
npm run prerender:seo
```

Expected:

- `dist/dental-implants-china/index.html` exists.
- `dist/cancer-treatment-abroad/index.html` exists.
- Those files contain route-specific title, meta description, canonical, H1, and JSON-LD.

- [ ] **Step 6: Run full build**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npm run build
```

Expected: PASS and prerender files exist afterward.

- [ ] **Step 7: Verify Vercel/static-serving behavior locally**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npx vite preview --host 127.0.0.1 --port 4173
curl -s http://127.0.0.1:4173/dental-implants-china | rg \"Dental Implants|canonical|application/ld\\+json\"
```

Expected: the response body contains route-specific prerendered content, not only the base root div.

- [ ] **Step 8: Verify Vercel rewrite behavior**

Inspect `vercel.json`. The current project has a catch-all rewrite to `/index.html`; implementation must verify this rewrite does not override real prerendered files.

Run at least one Vercel-equivalent check:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npm run build
npx vercel dev --listen 127.0.0.1:4174
curl -s http://127.0.0.1:4174/dental-implants-china | rg "Dental Implants|canonical|application/ld\\+json"
```

If `vercel dev` is unavailable or requires auth, document that limitation and perform the closest local static-serving check plus a Vercel preview deployment check before production launch.

If Vercel routing serves `/index.html` instead of `dist/<route>/index.html`, update `vercel.json` so static prerendered files win before the SPA fallback. One acceptable approach is to add explicit first-wave route rewrites before the final catch-all:

```json
{
  "source": "/dental-implants-china",
  "destination": "/dental-implants-china/index.html"
}
```

Generate or list these entries from `FIRST_WAVE_SEO_PATHS`; do not hand-maintain a partial list. Keep API rewrites before SEO/static rewrites, and keep the final `/(.*)` fallback last.

Do not continue to launch if route-specific HTML cannot be fetched through Vercel-equivalent routing.

- [ ] **Step 9: Commit chunk 5**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform
git add frontend-vercel/package.json frontend-vercel/package-lock.json frontend-vercel/scripts/prerender-seo.mjs frontend-vercel/src/seo/__tests__/prerender-config.test.ts frontend-vercel/vercel.json
git commit -m "feat(seo): prerender keyword landing pages"
```

## Chunk 6: Verification, Review, And Copy Safety

### Task 13: Run full verification

**Files:**
- No file changes expected.

- [ ] **Step 1: Run SEO tests**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npx vitest run src/seo/__tests__/brand.test.ts src/seo/__tests__/landing-pages.test.ts src/seo/__tests__/useSeoMeta.test.tsx src/seo/__tests__/prerender-config.test.ts src/__tests__/seo-public-entrypoints.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run build**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npm run build
```

Expected: PASS, including prerender.

- [ ] **Step 3: Verify prerendered HTML directly**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
test -f dist/dental-implants-china/index.html
test -f dist/stem-cell-therapy-china/index.html
test -f dist/cancer-treatment-abroad/index.html
rg \"Medora Health|canonical|application/ld\\+json\" dist/dental-implants-china/index.html
rg \"Medora Health|canonical|application/ld\\+json\" dist/cancer-treatment-abroad/index.html
```

Expected: PASS.

- [ ] **Step 4: Run browser smoke checks**

Use the Browser plugin or Playwright/browser equivalent to inspect:

- `/dental-implants-china`
- `/autism-stem-cell-therapy-china`
- `/breast-augmentation-china`
- `/cancer-treatment-abroad`
- `/china-medical-visa`

Check:

- Page renders without console errors.
- H1 is visible.
- CTA links work.
- FAQ section is visible.
- Comparison table appears on comparison pages.
- Text does not overlap on desktop and mobile widths.
- Document source for prerendered routes includes route-specific title/description/canonical before app hydration.

### Task 14: Run medical copy safety review

**Files:**
- Review `frontend-vercel/src/seo/landing-pages.ts`.

- [ ] **Step 1: Run banned-claim text scan**

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
rg -i \"guarantee|guaranteed|cure|cured|best hospital ranking|success rate|world.?class\" src/seo/landing-pages.ts
```

Expected: no unsafe guarantee/cure/ranking claims. If `world-class` or similar language appears in a cautious context, replace it with specific, supportable language.

- [ ] **Step 2: Manually review high-risk pages**

Review configs for:

- `/stem-cell-therapy-china`
- `/autism-stem-cell-therapy-china`
- `/parkinsons-stem-cell-therapy-china`
- `/diabetes-stem-cell-therapy-china`
- `/hematopoietic-stem-cell-transplant-china`
- `/cancer-treatment-china`
- `/proton-therapy-china`
- `/carbon-ion-therapy-china`
- `/car-t-cell-therapy-china`
- `/cancer-treatment-abroad`

Check that each page asks for records/doctor review and avoids broad claims of eligibility or outcome.

### Task 15: Run `review-until-clean`

**Files:**
- Review full implementation diff after chunks 1-5.

- [ ] **Step 1: Freeze review scope**

Capture:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform
git status --short --branch
git diff --stat HEAD~2..HEAD
```

If implementation used different commit granularity, compare from the pre-implementation SHA.

- [ ] **Step 2: Dispatch reviewer**

Ask reviewer to focus on:

- Whether all current valuable business keywords are covered.
- Whether China-core + global-comparison design is strategically sound.
- Whether medical safety language is cautious enough.
- Whether route/sitemap/config coverage is complete.
- Whether the 32 SEO routes are actually prerendered as route-specific HTML.
- Whether brand naming is consistent enough for first-wave SEO pages and base metadata.
- Whether implementation stays inside first-wave scope.

- [ ] **Step 3: Route findings through receiver**

Use a separate receiver subagent to evaluate findings before making changes.

- [ ] **Step 4: Fix verified findings and rerun verification**

Run the narrow relevant tests after each fix.

- [ ] **Step 5: Repeat until reviewer says no meaningful findings remain**

Do not commit final combined changes until the latest review is clean and the main agent rechecks the final diff.

### Task 16: Final commit

**Files:**
- All implementation files from prior chunks.

- [ ] **Step 1: Self-audit final diff**

Check:

- No unrelated files staged.
- `artifacts/` remains untouched unless explicitly requested.
- Every first-wave route is in config, route map, sitemap, and tests.
- Every first-wave route is prerendered into `dist/<route>/index.html` during build.
- Base metadata and first-wave SEO metadata use `Medora Health`, not `MedChina`.
- Every high-value existing business cluster listed in "Keyword Coverage Rationale" has at least one first-wave landing page or an explicit second-wave deferral.
- No medical guarantee language slipped in.
- Verification commands actually passed.

- [ ] **Step 2: Commit with detailed history**

Use `detailed-commit-messages` if requested by the review workflow, or write a clear commit message summarizing:

- SEO landing system.
- 32 first-wave URLs.
- Metadata/schema helper.
- Static prerendering for first-wave SEO routes.
- Brand metadata normalization.
- Sitemap and route coverage.
- Verification run.

## Known Constraints

- This phase makes the 32 first-wave SEO landing routes server-visible through static prerendered HTML. It does not solve raw-HTML SEO for every dynamic hospital, procedure, dashboard, or legacy route.
- The content should be concise enough to ship, but each page must meet the patient decision-guide floor in the config tests. Search Console data should guide later split/merge decisions.
- High-risk medical topics, especially stem cell and cancer pages, need one extra copy-safety read before deploy and again after any later content expansion.
- Playwright prerender must be verified in the local/Vercel build environment. If Vercel cannot run the prerender step reliably, stop and choose a deploy-safe prerender or SSR/SSG path before launch.
- Static sitemap entries are acceptable for this phase; dynamic API sitemap generation is future work.

# SEO Keyword Expansion Design

Date: 2026-06-05

## Context

`medicaltourismchina-platform` is a Vite React frontend deployed from `frontend-vercel`. The live site already ranks strongly for the exact phrase `medical tourism china`, but the public SEO surface is much smaller than the product and content inventory.

Current observations:

- `public/sitemap.xml` exposes only 11 public URLs.
- `index.html` has one global title and description for the whole app.
- Many routes update `document.title` after client render, but most pages do not define server-visible per-page metadata, canonical URLs, Open Graph tags, or structured data.
- The app has a useful inventory of treatment-specific React pages, including dental implants, stem cell therapies, bariatric procedures, cosmetic procedures, and support services.
- Several treatment-specific files are not registered as public routes in `App.tsx`, so they cannot currently act as indexable landing pages.
- Dynamic procedure, featured-treatment, hospital, and hospital-package URLs exist, but the sitemap does not enumerate them.

The approved SEO strategy is **China Core + Global Comparison**: keep China as the commercial and content authority, then use broader medical tourism and treatment-abroad keywords as comparison entry points that direct patients toward China-specific evaluation and quote flows.

## Goals

- Expand the site from one strong generic SEO keyword into a focused cluster of high-intent treatment, service, hospital, and comparison keywords.
- Publish the first SEO wave as reusable landing-page infrastructure rather than one-off pages.
- Use existing treatment content and images where possible.
- Preserve the current Vite React app for this phase instead of migrating to Next.js or a full SSR stack.
- Make every new SEO page independently understandable to search engines and users through route-specific metadata, canonical URLs, headings, internal links, FAQ content, and sitemap inclusion.
- Keep page scope medically responsible: describe treatment options, cost ranges, coordination workflows, risks, and patient suitability without promising outcomes.
- Prefer conversion paths that already exist: free quote, medical enquiry, case intake, treatment listings, hospital pages, and related treatment pages.

## Non-Goals

- Do not build a generic worldwide medical tourism directory in this phase.
- Do not claim that China is always the best destination for every treatment.
- Do not create thin city/country doorway pages without meaningful comparison or patient-useful content.
- Do not migrate the frontend to SSR/SSG in this phase.
- Do not change backend content APIs or CRM publishing workflows in this phase.
- Do not alter private dashboard, hospital dashboard, authentication, or patient-session behavior.
- Do not automatically generate medical claims from unverified data.

## Recommended Approach

Implement a first-wave SEO landing system inside the existing Vite app:

```text
seo landing config
  -> reusable SEO landing page renderer
  -> route registration
  -> metadata/canonical/schema helper
  -> sitemap entries
  -> tests
```

This gives the site a larger keyword surface now while keeping the future path open for SSR/SSG. If organic growth becomes a major channel, the same page configuration can later feed a prerender or framework migration.

## SEO Rendering Limitation

This phase intentionally keeps the current Vite SPA deployment. The first implementation will improve route coverage, client-rendered metadata, sitemap coverage, internal linking, and page content, but it will not fully solve the server-rendered HTML limitation by itself.

Planning must treat this as a first-wave SEO expansion with an explicit constraint:

- Google can render JavaScript, so client-rendered pages can still be indexed.
- Server-returned HTML will continue to share the same base `index.html` until a prerender, SSR, or SSG phase is added.
- The implementation must not claim that route-specific metadata is server-visible in this phase.
- The SEO landing config should be structured so a later prerender/SSR pass can reuse the same data without rewriting page content.

If this first wave needs stronger server-visible SEO before launch, add a separate prerender workstream before deployment. That workstream is outside this phase unless explicitly approved.

## Keyword Strategy

### Cluster 1: China Core Treatment Pages

These are high-intent pages where the patient is already evaluating China.

| URL | Primary Keyword | Secondary Keywords |
| --- | --- | --- |
| `/dental-implants-china` | dental implants China | dental implant cost China, full mouth dental implants China |
| `/all-on-6-dental-implants-china` | all on 6 dental implants China | all-on-6 cost China, full arch implants China |
| `/stem-cell-therapy-china` | stem cell therapy China | regenerative medicine China, stem cell treatment abroad |
| `/autism-stem-cell-therapy-china` | autism stem cell therapy China | stem cell therapy for autism abroad |
| `/parkinsons-stem-cell-therapy-china` | Parkinson's stem cell therapy China | Parkinson's treatment abroad |
| `/diabetes-stem-cell-therapy-china` | diabetes stem cell therapy China | diabetes treatment abroad |
| `/cancer-treatment-china` | cancer treatment China | oncology treatment in China |
| `/proton-therapy-china` | proton therapy China | proton therapy abroad, cancer radiotherapy China |
| `/car-t-cell-therapy-china` | CAR T cell therapy China | CAR-T therapy abroad, cancer immunotherapy China |
| `/rhinoplasty-china` | rhinoplasty China | nose job China, Asian rhinoplasty China |
| `/gastric-sleeve-surgery-china` | gastric sleeve surgery China | bariatric surgery China, weight loss surgery China |

### Cluster 2: Hospital And Service Pages

These pages answer operational questions international patients search before they trust a destination.

| URL | Primary Keyword | Purpose |
| --- | --- | --- |
| `/hospitals-in-china-for-foreigners` | hospitals in China for foreigners | Explain hospital selection, language support, admission, payment, and international coordination. |
| `/best-hospitals-in-china-for-foreigners` | best hospitals in China for foreigners | Guide users toward evaluated hospital matching without publishing unverified rankings. |
| `/international-patient-services-china` | international patient services China | Describe coordination services across records, matching, appointments, translation, and follow-up. |
| `/china-medical-visa` | China medical visa | Consolidate visa eligibility, invitation letters, stay planning, and medical travel requirements. |
| `/medical-interpreter-china` | medical interpreter China | Target patients worried about language and medical communication. |
| `/china-medical-second-opinion` | China medical second opinion | Connect telemedicine, record review, and specialist matching. |

### Cluster 3: Global Comparison Entry Pages

These pages target broader medical tourism searches and then steer users into China-specific treatment pages.

| URL | Primary Keyword | Comparison Frame |
| --- | --- | --- |
| `/best-country-for-dental-implants` | best country for dental implants | Compare China, Turkey, Mexico, Thailand, and the patient's home market. |
| `/medical-tourism-for-dental-implants` | medical tourism for dental implants | Explain what to compare: implant brands, surgical planning, prosthetics, warranty, follow-up. |
| `/best-country-for-stem-cell-therapy` | best country for stem cell therapy | Compare China, Panama, Mexico, Germany, and Thailand with strong safety disclaimers. |
| `/medical-tourism-for-stem-cell-therapy` | medical tourism for stem cell therapy | Explain regulatory review, indications, protocols, records, and consultation workflow. |
| `/cancer-treatment-abroad` | cancer treatment abroad | Compare China, Germany, Japan, Singapore, and the US across access, therapy type, cost, and wait time. |

## Page Design

All first-wave SEO pages should share one reusable page shell with configurable content blocks.

### Required Page Sections

Each page must include:

- H1 containing the primary keyword or a close exact-match phrase.
- Short above-the-fold summary that states what the page helps the patient decide.
- A trust-oriented CTA to `Free Quote`, `Medical Enquiry`, or `Case Intake`.
- Treatment or service overview.
- Cost, timeline, or access considerations where relevant.
- Patient suitability and risk/limitation section.
- China-specific value section, written carefully and without absolute claims.
- Related treatment/service links.
- FAQ section with 4-6 questions.

Comparison pages must also include:

- A comparison table for destination options.
- A clear explanation of why China may be appropriate for some patients.
- Links into the matching China core treatment pages.
- A disclaimer that destination choice depends on diagnosis, records, provider quality, legal/regulatory context, budget, and follow-up needs.

### Medical Safety Language

Pages should avoid:

- Guaranteed cure or success-rate claims unless sourced and qualified.
- Ranking hospitals as "best" without criteria.
- Saying a treatment is appropriate for everyone.
- Presenting experimental or controversial therapies as settled standard care.

Pages should prefer:

- "may be considered", "can be evaluated", "depends on diagnosis and records".
- "request a treatment plan", "compare hospital options", "verify protocol and eligibility".
- Explicit prompts for medical record review before pricing or treatment selection.

## Metadata And Structured Data

Add a reusable metadata helper that can set or update:

- `document.title`
- `meta[name="description"]`
- `link[rel="canonical"]`
- `meta[property="og:title"]`
- `meta[property="og:description"]`
- `meta[property="og:url"]`
- `meta[property="og:type"]`
- `meta[name="twitter:card"]`

Each SEO landing page config should provide:

```text
path
title
description
canonicalUrl
primaryKeyword
secondaryKeywords
h1
summary
eyebrow
heroCta
sections
costTimeline
suitability
riskNotes
chinaValue
comparisonRows
faqItems
relatedLinks
schema
```

Field responsibilities:

- `heroCta`: primary and secondary CTA labels and links.
- `sections`: ordered content sections for general overview, treatment/service details, and patient decision criteria.
- `costTimeline`: optional structured cost, stay, wait-time, or access details.
- `suitability`: bullets describing who may be a fit and who needs extra review.
- `riskNotes`: medically cautious limitations, uncertainty, or follow-up considerations.
- `chinaValue`: China-specific advantages written without absolute claims.
- `comparisonRows`: required for global comparison pages and omitted for China-core pages unless useful.
- `faqItems`: 4-6 patient-facing questions and answers.
- `relatedLinks`: internal links to quote, medical enquiry, case intake, treatment categories, and related landing pages.

Structured data should be emitted through JSON-LD where possible:

- `BreadcrumbList` for navigation context.
- `FAQPage` for FAQ sections.
- `MedicalWebPage` or `WebPage` depending on content confidence and schema fit.
- `Service` for service-oriented pages such as interpreter, visa support, and second opinion.

The helper should replace prior schema tags for the current page to avoid duplicate stale JSON-LD when the user navigates client-side.

## Routing

Register all first-wave SEO URLs in `App.tsx`.

Existing treatment page files can be reused in either of two ways:

- Use the reusable SEO landing shell for `*-china` URLs and link to the existing detailed page if it already exists.
- Register an alias route to an existing detailed page only when that page already matches the keyword intent and can receive improved metadata.

The preferred first-wave route pattern is explicit, human-readable, and keyword-bearing:

```text
/all-on-6-dental-implants-china
/autism-stem-cell-therapy-china
/china-medical-visa
/best-country-for-stem-cell-therapy
```

Do not remove current URLs. Where a current URL overlaps a new SEO URL, preserve the old URL and add internal links to the new canonical SEO landing page. Later, analytics can decide whether to redirect old pages.

## Sitemap

Expand `public/sitemap.xml` to include:

- Existing public routes.
- First-wave SEO landing pages.
- Existing treatment/detail pages that are publicly registered and useful.

For the first implementation pass, static sitemap entries are acceptable. A future pass can generate sitemap entries from API data and SEO config.

Sitemap entries should use the canonical `https://www.medicaltourismchina.health` host.

## Internal Linking

Internal links should make the new pages discoverable without relying only on the sitemap.

Add links from:

- SEO landing pages to related treatment/service pages.
- Existing category landing pages to the new keyword-specific pages.
- Treatment pages to the relevant China-core SEO pages.
- Global comparison pages to China-core treatment pages.

The footer or main navigation should not become crowded in the first phase. Prefer contextual related links and selected category-page links.

## Error Handling And Edge Cases

- If a landing-page slug is unknown, show the existing `NotFound` route.
- If metadata helper cannot find an existing tag, it should create the tag rather than fail.
- If a page lacks an image, use the existing brand/social image fallback.
- If a comparison page has no destination-specific detail for a country, omit that row rather than publish filler.
- If future API-driven page generation fails, static first-wave pages should remain unaffected.
- If client-side navigation changes pages, stale title, description, canonical, and JSON-LD from the previous route must be replaced.

## Testing

Add or update tests to verify:

- `App.tsx` registers each first-wave SEO route.
- `public/sitemap.xml` contains each first-wave SEO URL.
- The SEO config contains required fields for every landing page.
- FAQ data is present and non-empty for every landing page.
- The metadata helper creates or updates canonical, description, Open Graph, and JSON-LD tags.
- Current legacy SEO routes remain registered.

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
npm test
npm run build
```

If `npm test` is not defined in `frontend-vercel/package.json`, run the closest existing Vitest command from `frontend-vercel`, such as `npx vitest run`, and still run `npm run build` from the same directory.

## Rollout

1. Add the SEO landing config and metadata helper.
2. Add the reusable SEO landing page renderer.
3. Register first-wave routes.
4. Expand sitemap.
5. Add tests.
6. Build locally.
7. Deploy.
8. Submit the updated sitemap in Google Search Console.
9. Track impressions, clicks, indexed pages, and queries by page group.

## Future Work

- Add prerendering or migrate SEO-critical pages to SSR/SSG once the first wave proves query demand.
- Generate dynamic sitemap entries from procedure, featured-treatment, hospital, and package APIs.
- Create city-specific pages only when each page can include real hospital/service content.
- Add sourced editorial content for high-risk medical topics.
- Use Search Console data to split, merge, or retire pages after ranking signals accumulate.

## Success Criteria

- At least 20 new SEO-focused public URLs are registered and included in sitemap.
- Each first-wave page has unique metadata, canonical URL, FAQ content, and related links.
- Existing public routes and patient flows remain unchanged.
- Build and SEO tests pass.
- New pages are ready for Google Search Console submission after deploy.

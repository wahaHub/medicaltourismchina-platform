# GEO Conversion Stack Design

Date: 2026-06-05

This design is aligned with the 2026-06-05 GEO Conversion Stack Implementation Plan v2. If route lists conflict during implementation, the authoritative launch lists are `expectedPhase1APaths` and `expectedPhase1BPaths` in the implementation plan and matching GEO coverage tests.

## Context

`medicaltourismchina-platform` is a Vite React frontend deployed from `frontend-vercel` for `https://www.medicaltourismchina.health/`. The live site already has a useful medical tourism product surface: China treatment pages, hospital pages, service pages, FAQ content, case intake, medical enquiry, quote flows, and a patient chat widget.

The current public discovery surface is still weak for GEO, LLMO, and answer-engine discovery:

- The app is a client-rendered SPA, so many public URLs initially return the same generic HTML shell.
- `index.html` has one global title and description for all pages.
- Several pages update metadata only after client render.
- `public/sitemap.xml` exposes only a small subset of registered public routes.
- Structured data is not yet a consistent part of public pages.
- The live `robots.txt` is affected by Cloudflare Managed Content Signals and currently blocks several major AI crawlers.
- There is no `llms.txt`, answer-target directory, or machine-readable summary of what Medora helps international patients do.

The business goal is to make Medora more visible to search engines and large language models, then convert high-intent international patients into medical enquiries, case-intake submissions, quote requests, and advisor handoffs.

## Terminology

Use **GEO Answer Targets** instead of only "keywords".

A GEO answer target is a high-intent user question cluster that combines:

- Search phrase
- User question
- Medical entity
- Location entity
- Patient intent
- Trust evidence
- Clear answer
- Conversion path

Example:

```text
Keyword: proton and carbon ion therapy China
Question: Where can international patients evaluate proton, heavy ion, or carbon ion therapy in China?
Entity: proton therapy, carbon ion therapy, heavy ion therapy, cancer treatment, China, Medora Health
Answer: Explain availability, suitability review, hospital matching, timeline, records needed, and Medora's role.
CTA: Submit records or request a medical enquiry.
```

This differs from traditional SEO. SEO can rank a page for a phrase. GEO needs a page or machine-readable asset that an AI system can confidently cite, summarize, and use when answering a user's question.

## Goals

- Launch the fastest practical GEO surface without a full frontend migration.
- Target both high-value severe-disease leads and faster-converting dental, cosmetic, and bariatric leads.
- Make Medora understandable as a China medical tourism coordination entity, not only a collection of treatment pages.
- Publish reusable page, metadata, schema, sitemap, and machine-readable content infrastructure that can expand later.
- Preserve existing user flows and conversion paths.
- Keep all medical content responsible, qualified, and non-promissory.
- Create a foundation that can later move to SSR, SSG, or API-driven content generation.

## Non-Goals

- Do not build a generic worldwide medical tourism directory in this phase.
- Do not migrate the frontend to Next.js, Remix, or another SSR framework in the first GEO launch.
- Do not publish unverified hospital rankings or success-rate claims.
- Do not claim any treatment is suitable for every patient.
- Do not create thin doorway pages that only repeat keywords.
- Do not alter private dashboard, hospital dashboard, auth, patient-session, or CRM behavior.
- Do not automatically generate medical claims from unverified source data.

## Recommended Approach

Build a **GEO Conversion Stack** inside the existing Vite frontend:

```text
GEO answer target config
  -> reusable GEO landing renderer
  -> route registration
  -> metadata and JSON-LD helper
  -> sitemap expansion
  -> llms.txt and llms-full.txt
  -> contextual internal links
  -> conversion CTA wiring
```

This gives the site a stronger GEO surface quickly while keeping the long-term path open for SSR or static prerendering. The first phase should favor speed, clarity, and expandability over a large architectural migration.

### First-Phase Rendering Decision

Client-rendered metadata alone is not enough for GEO. Some search crawlers can render JavaScript, but many AI fetchers, link preview systems, and retrieval crawlers may read only the initial HTML response. Because the current SPA returns the same generic shell for many public URLs, the first GEO launch must include **lightweight static HTML generation or prerendering for first-wave GEO routes**.

The first implementation should avoid a full framework migration, but it should ensure each Phase 1A GEO URL has route-specific initial HTML containing:

- Page title and description.
- Canonical URL.
- H1 or quick-answer text.
- Primary CTA link.
- FAQ text.
- JSON-LD.

Acceptable implementation paths:

1. Generate static HTML variants during `npm run build` for configured GEO routes by reusing `dist/index.html` and injecting route-specific head/body fallback content.
2. Use a Vite prerender approach if it can be added with low risk and verified locally.
3. Add edge-level HTML injection only if Vercel/Cloudflare behavior makes static generation impractical.

Phase 1A is not complete unless `curl -sL <GEO URL>` returns route-specific title, description, canonical, quick-answer text, and JSON-LD without requiring client-side JavaScript.

## Strategic Positioning

Use two simultaneous tracks:

1. **Authority and high-ticket track**
   - Cancer treatment
   - Proton and carbon ion therapy
   - CAR-T therapy
   - Stem cell therapy and selected stem-cell-related indications
   - Goal: high-value medical enquiries, record reviews, case-intake submissions, and care-team handoffs.

2. **Fast conversion track**
   - Dental implants
   - All-on-4 and All-on-6 full/half arch implants
   - Hollywood smile veneers
   - Rhinoplasty
   - Double eyelid surgery
   - Bariatric surgery
   - Goal: faster quote requests, package enquiries, and consultation bookings.

Support both tracks with operational trust pages:

- Medical treatment in China for foreigners
- Hospitals in China for foreigners
- International patient services in China
- China medical visa support
- Medical interpreter support in China
- Medical second opinion in China

## First-Wave GEO Answer Targets

The launch should be split into two waves. **Phase 1A** ships lower-risk operational and fast-conversion pages plus two authority pages that can be written conservatively. **Phase 1B** adds medically higher-risk pages only after source review and approval.

### Phase 1A Launch Targets

| URL | Primary Answer Target | Core User Question | Primary CTA | Risk |
| --- | --- | --- | --- | --- |
| `/medical-treatment-in-china-for-foreigners` | medical treatment in China for foreigners | Can foreigners get medical treatment in China, and how does the process work? | Advisor consultation | Low |
| `/dental-implants-china` | dental implants China | Is China a good option for dental implants? | Free quote | Medium |
| `/all-on-4-all-on-6-dental-implants-china` | All-on-4 and All-on-6 dental implants China | How do I compare All-on-4, All-on-6, full-arch, and half-arch dental implants in China? | Free quote | Medium |
| `/hollywood-smile-veneers-china` | Hollywood smile veneers China | How can I plan smile design or veneers in China? | Free quote | Medium |
| `/rhinoplasty-china` | rhinoplasty China | How do international patients plan rhinoplasty in China? | Free quote | Medium |
| `/double-eyelid-surgery-china` | double eyelid surgery China | What should foreigners know about double eyelid surgery in China? | Free quote | Medium |
| `/hospitals-in-china-for-foreigners` | hospitals in China for foreigners | How do foreigners choose hospitals in China? | Hospital matching | Low |
| `/international-patient-services-china` | international patient services China | What support do international patients need in China? | Advisor consultation | Low |
| `/china-medical-visa` | China medical visa | Do I need a visa or invitation letter for treatment in China? | Visa support enquiry | Low |
| `/medical-interpreter-china` | medical interpreter China | Can I get medical interpretation during hospital visits in China? | Service enquiry | Low |
| `/medical-second-opinion-china` | medical second opinion China | Can I get a remote second opinion from China-based specialists before traveling? | Case intake | Low |
| `/cancer-treatment-china` | cancer treatment in China | Can international patients access cancer treatment in China? | Medical enquiry | High |
| `/proton-carbon-ion-therapy-china` | proton and carbon ion therapy China | Where can I evaluate proton, heavy ion, or carbon ion therapy options in China? | Submit records | High |

Phase 1A authority pages must stay conservative: they should explain evaluation, record review, hospital matching, and questions to ask. They should not publish unsupported success rates, availability claims, or treatment eligibility promises.

### Phase 1B Review-Gated Targets

| URL | Primary Answer Target | Core User Question | Primary CTA | Risk |
| --- | --- | --- | --- | --- |
| `/car-t-cell-therapy-china` | CAR-T therapy in China | Can I get CAR-T therapy in China as an international patient? | Medical enquiry | High |
| `/stem-cell-therapy-china` | stem cell therapy in China | What should foreigners know before considering stem cell therapy in China? | Medical enquiry | High |
| `/parkinsons-stem-cell-therapy-china` | Parkinson's stem cell therapy China | Can Parkinson's patients evaluate stem cell therapy in China? | Submit records | High |
| `/autism-stem-cell-therapy-china` | autism stem cell therapy China | What should families ask before considering autism stem cell therapy in China? | Advisor consultation | High |
| `/bariatric-surgery-china` | bariatric surgery China | Can I get weight-loss surgery in China as an international patient? | Medical enquiry | Medium-high |
| `/sbrt-radiotherapy-china` | SBRT radiotherapy China | Can international patients evaluate SBRT radiotherapy options in China? | Submit records | High |
| `/immune-cell-cryopreservation-china` | immune cell cryopreservation China | What should patients ask before considering immune cell cryopreservation in China? | Medical enquiry | High |
| `/hifu-uterine-fibroids-china` | HIFU uterine fibroids China | Can patients evaluate HIFU or Haifu Knife for uterine fibroids in China? | Medical enquiry | High |
| `/deep-brain-stimulation-china` | deep brain stimulation China | Can neurological patients evaluate DBS options in China? | Submit records | High |
| `/coronary-intervention-pci-china` | PCI coronary intervention China | Can cardiac patients evaluate coronary intervention or PCI in China? | Submit records | High |
| `/cancer-surgery-china` | cancer surgery China | Can international patients evaluate cancer surgery options in China? | Submit records | High |
| `/cardiology-cardiothoracic-surgery-china` | cardiology and cardiothoracic surgery China | Can international patients evaluate cardiac treatment or cardiothoracic surgery in China? | Submit records | High |
| `/hematology-treatment-china` | hematology treatment China | Can international patients evaluate hematology treatment options in China? | Medical enquiry | High |
| `/stem-cell-transplant-china` | stem cell transplant China | Can patients evaluate hematopoietic stem cell transplant options in China? | Submit records | High |

Phase 1B pages must not ship until evidence sources, medical review, and legal/business approval are recorded in config.

### Authority And High-Ticket Targets

| URL | Primary Answer Target | Core User Question | Primary CTA |
| --- | --- | --- | --- |
| `/cancer-treatment-china` | cancer treatment in China | Can international patients access cancer treatment in China? | Medical enquiry |
| `/proton-carbon-ion-therapy-china` | proton and carbon ion therapy China | Where can I evaluate proton, heavy ion, or carbon ion therapy options in China? | Submit records |
| `/car-t-cell-therapy-china` | CAR-T therapy in China | Can I get CAR-T therapy in China as an international patient? | Medical enquiry |
| `/stem-cell-therapy-china` | stem cell therapy in China | What should foreigners know before considering stem cell therapy in China? | Medical enquiry |
| `/parkinsons-stem-cell-therapy-china` | Parkinson's stem cell therapy China | Can Parkinson's patients evaluate stem cell therapy in China? | Submit records |
| `/autism-stem-cell-therapy-china` | autism stem cell therapy China | What should families ask before considering autism stem cell therapy in China? | Advisor consultation |
| `/sbrt-radiotherapy-china` | SBRT radiotherapy China | Can international patients evaluate SBRT radiotherapy options in China? | Submit records |
| `/deep-brain-stimulation-china` | deep brain stimulation China | Can neurological patients evaluate DBS options in China? | Submit records |
| `/coronary-intervention-pci-china` | PCI coronary intervention China | Can cardiac patients evaluate coronary intervention or PCI in China? | Submit records |
| `/cancer-surgery-china` | cancer surgery China | Can international patients evaluate cancer surgery options in China? | Submit records |
| `/cardiology-cardiothoracic-surgery-china` | cardiology and cardiothoracic surgery China | Can international patients evaluate cardiac treatment or cardiothoracic surgery in China? | Submit records |
| `/hematology-treatment-china` | hematology treatment China | Can international patients evaluate hematology treatment options in China? | Medical enquiry |
| `/stem-cell-transplant-china` | stem cell transplant China | Can patients evaluate hematopoietic stem cell transplant options in China? | Submit records |

### Fast Conversion Targets

| URL | Primary Answer Target | Core User Question | Primary CTA |
| --- | --- | --- | --- |
| `/dental-implants-china` | dental implants China | Is China a good option for dental implants? | Free quote |
| `/all-on-4-all-on-6-dental-implants-china` | All-on-4 and All-on-6 dental implants China | How do I compare All-on-4, All-on-6, full-arch, and half-arch dental implants in China? | Free quote |
| `/hollywood-smile-veneers-china` | Hollywood smile veneers China | How can I plan smile design or veneers in China? | Free quote |
| `/rhinoplasty-china` | rhinoplasty China | How do international patients plan rhinoplasty in China? | Free quote |
| `/double-eyelid-surgery-china` | double eyelid surgery China | What should foreigners know about double eyelid surgery in China? | Free quote |
| `/bariatric-surgery-china` | bariatric surgery China | Can I get weight-loss surgery in China as an international patient? | Medical enquiry |

### Operational Trust Targets

| URL | Primary Answer Target | Core User Question | Primary CTA |
| --- | --- | --- | --- |
| `/medical-treatment-in-china-for-foreigners` | medical treatment in China for foreigners | Can foreigners get medical treatment in China, and how does the process work? | Advisor consultation |
| `/hospitals-in-china-for-foreigners` | hospitals in China for foreigners | How do foreigners choose hospitals in China? | Hospital matching |
| `/international-patient-services-china` | international patient services China | What support do international patients need in China? | Advisor consultation |
| `/china-medical-visa` | China medical visa | Do I need a visa or invitation letter for treatment in China? | Visa support enquiry |
| `/medical-interpreter-china` | medical interpreter China | Can I get medical interpretation during hospital visits in China? | Service enquiry |
| `/medical-second-opinion-china` | medical second opinion China | Can I get a remote second opinion from China-based specialists before traveling? | Case intake |

## GEO Page Model

Each page should be driven by structured config instead of one-off content files.

Required fields:

```text
path
title
description
canonicalUrl
primaryAnswerTarget
secondaryAnswerTargets
h1
quickAnswer
patientIntent
medicalEntity
locationEntity
sections
faqItems
relatedLinks
primaryCta
schemaType
medicalDisclaimer
claimRiskLevel
evidenceSources
lastReviewedAt
reviewOwner
medicalReviewer
legalReviewer
approvalArtifact
reviewTicket
approvalStatus
canonicalStrategy
htmlFallback
```

The config should be reusable for:

- Route registration
- Page rendering
- Metadata
- JSON-LD
- Sitemap entries
- Future prerender or SSR migration
- Future `llms-full.txt` generation

`claimRiskLevel` should be one of `low`, `medium`, `medium-high`, or `high`.

`approvalStatus` should be one of:

- `draft`
- `content-reviewed`
- `medical-reviewed`
- `legal-reviewed`
- `approved-for-publish`

Only low-risk operational pages can ship after content review alone. Medical treatment pages require at least `medical-reviewed`. High-risk pages require `approved-for-publish`.

`evidenceSources` should list the public or internal sources used to support medical, visa, cost, timeline, or service claims. Sources can be empty only for purely operational brand/service claims that make no medical assertion.

High-risk published pages need a stricter evidence gate. At least one evidence source must be an `https://` public URL, or the page must include an `approvalArtifact` or `reviewTicket` that points to a recorded medical/legal approval. Vague labels such as "Internal oncology positioning" are not sufficient by themselves. High-risk pages also need `medicalReviewer` or `legalReviewer`; `reviewOwner: Medora content owner` alone is not enough for `/cancer-treatment-china`, `/proton-carbon-ion-therapy-china`, or any Phase 1B high-risk page promoted later.

Evidence and review information for high-risk published pages must be visible in the static fallback HTML and represented in JSON-LD or adjacent machine-readable page metadata. The build should fail if evidence exists only in config but cannot be seen by crawlers or reviewers.

`htmlFallback` should contain the text inserted into initial static/prerendered HTML for crawlers and AI fetchers.

## Page Structure

Every GEO landing page should include:

1. **H1**
   Use the primary answer target or a close natural phrase.

2. **Quick Answer**
   A short 80-120 word summary written so a search engine or LLM can quote it. It should answer the main question directly, mention Medora's role, and avoid exaggerated claims.

3. **Who This Is For**
   Describe patient profiles, decision stage, and record needs.

4. **China Care Options**
   Explain the treatment or service options available for evaluation in China.

5. **Cost, Timeline, And Records Needed**
   Use ranges and qualifiers where available. Always state that final plans depend on record review and provider evaluation.

6. **How Medora Helps**
   Include hospital matching, record review coordination, appointment planning, interpreter support, visa support, accommodation, and post-treatment follow-up where relevant.

7. **Risks, Limits, And Suitability**
   Clearly say that treatment selection depends on diagnosis, test results, safety, legal/regulatory context, and clinician review.

8. **Related Options**
   Link to related GEO pages, treatment pages, hospital pages, case intake, medical enquiry, and free quote.

9. **FAQ**
   Include 5-7 question-and-answer items written in natural language matching likely AI prompts.

10. **CTA**
   Use one primary conversion path per page:
   - Free quote for dental and cosmetic pages.
   - Medical enquiry or record submission for cancer, CAR-T, proton/carbon ion therapy, bariatric, and stem-cell pages.
   - Advisor consultation or service enquiry for operational pages.

## Metadata And Structured Data

Add a reusable helper that can create or update:

- `document.title`
- `meta[name="description"]`
- `link[rel="canonical"]`
- `meta[property="og:title"]`
- `meta[property="og:description"]`
- `meta[property="og:url"]`
- `meta[property="og:type"]`
- `meta[name="twitter:card"]`
- JSON-LD script tags

JSON-LD should include:

- `BreadcrumbList` for every GEO landing page.
- `FAQPage` for every page with FAQ content.
- `MedicalWebPage` for medical treatment pages when appropriate.
- `Service` for medical interpreter, visa, international patient service, and hospital matching pages.
- `Organization` or `MedicalOrganization` on machine-readable brand pages and the homepage.

The helper must remove stale page-specific JSON-LD on client-side navigation before inserting the next page's schema.

This helper is not sufficient by itself. It must share the same config with the static HTML/prerender step so route-specific metadata and JSON-LD are present both before and after React hydration.

Generated GEO HTML must clean stale head tags from the base SPA shell before injecting route-specific metadata. Each generated Phase 1A HTML file must contain exactly one canonical tag, one current `og:url`, current `og:title`, current description, and no stale default title such as `MedChina - Premium Medical Tourism`.

## llms.txt And Machine-Readable Assets

Add `public/llms.txt` as a concise AI-oriented site directory:

- Medora identity
- What the site helps patients do
- High-value treatment pages
- Fast-conversion treatment pages
- Operational support pages
- Safety and disclaimer pages
- Preferred canonical URLs

Add `public/llms-full.txt` as a fuller machine-readable summary:

- Short profile of Medora
- Explanation of international patient services
- Page summaries for approved Phase 1A GEO pages only
- FAQ-style answer targets
- Contact and conversion paths
- Medical safety statement

These files are not a ranking guarantee. They are supporting assets. The primary GEO foundation remains crawlable pages, structured data, sitemap entries, clear answers, and trust signals.

Phase 1B pages must not appear in `llms.txt` or `llms-full.txt` until their config status is `approved-for-publish`.

## Robots And AI Crawler Policy

The live site should align crawler policy with the business goal.

Recommended policy:

- Keep `Googlebot`, `Bingbot`, and normal search crawlers allowed.
- Allow reputable answer/search retrieval crawlers where the goal is citation, grounding, or search-style answers.
- Continue reserving rights against unrestricted model training where desired.
- Avoid accidentally blocking every major AI crawler if the goal is to be discovered and recommended by AI systems.

Because Cloudflare Managed Content Signals currently appear in the live `robots.txt`, the implementation plan must include a Cloudflare settings check before assuming `public/robots.txt` alone controls production.

### Phase 1A Crawler Policy Matrix

The production crawler policy should be explicit before launch:

| Crawler / agent | Phase 1A policy | Reason |
| --- | --- | --- |
| `Googlebot` | Allow | Core search indexing |
| `Bingbot` | Allow | Bing search and many answer surfaces |
| `Twitterbot` / `facebookexternalhit` | Allow | Link previews and social sharing |
| `GPTBot` | Allow for Phase 1A if legal/business accepts AI discovery | Needed if the business chooses AI discovery over strict blocking |
| `ChatGPT-User` / OpenAI search-style fetchers | Allow where identifiable | Supports user-requested browsing and answer grounding |
| `ClaudeBot` | Allow for Phase 1A if legal/business accepts Anthropic discovery | Supports AI discovery |
| `PerplexityBot` | Allow | Answer-engine citation opportunity |
| `Google-Extended` | Default disallow until legal/business approves | This controls extended Google AI uses, not normal Googlebot search |
| `CCBot` | Default disallow unless legal approves | Broad common-crawl style collection |
| `Bytespider` | Default disallow unless legal approves | Higher training concern |
| `Amazonbot` | Default disallow until legal/business approves | Confirm desired AI/search exposure |

If legal/business review is not available before Phase 1A, ship app-level `public/robots.txt` with normal search crawlers allowed and document that Cloudflare Managed Content Signals must be adjusted before expecting major AI crawler exposure.

Production launch gate: before Phase 1A is considered live for GEO, the team must either approve each conditional crawler row above or explicitly mark the launch as **search-only, AI-crawler exposure pending**. The implementation plan should include this as a verification checklist item, not an optional note.

The live launch gate must check production assets, not only local build output:

```bash
curl -sL https://www.medicaltourismchina.health/robots.txt
curl -sL https://www.medicaltourismchina.health/llms.txt
curl -sL https://www.medicaltourismchina.health/sitemap.xml
```

If the business goal is AI discovery but production `robots.txt` still blocks approved AI discovery crawlers such as `GPTBot`, `ChatGPT-User`, `ClaudeBot`, or `PerplexityBot`, the launch status must be recorded as **search-only, AI-crawler exposure pending Cloudflare/legal approval**.

## Sitemap And Discoverability

Expand `public/sitemap.xml` to include:

- Existing high-value public routes.
- All first-wave GEO pages.
- Current treatment, service, visa, FAQ, and hospital list pages.
- Public dynamic hospital and package URLs where they can be enumerated reliably.

For the first phase, static sitemap entries are acceptable for GEO pages. Future phases can generate sitemap entries from the GEO config and content APIs.

Phase 1A sitemap entries must include the Phase 1A GEO URLs only. Phase 1B URLs should not be added to sitemap until their approval status is `approved-for-publish`.

## Internal Linking

Internal links should create an entity graph:

- Homepage links to the main treatment and support clusters.
- Existing `/cancer-treatment`, `/dental-treatment`, `/cosmetic-surgery`, and `/stem-cell-therapy` pages link to the new GEO pages.
- GEO pages link to related treatment pages, hospital pages, and conversion flows.
- Operational trust pages link back into high-ticket and fast-conversion pages.
- Footer or top navigation should remain uncluttered; prefer contextual links and selected resource sections.

## Existing URL And Canonical Strategy

Several GEO URLs overlap existing pages. The first phase should not delete or redirect existing pages until analytics and content quality are verified.

Canonical strategy:

| Existing URL | New GEO URL | Strategy |
| --- | --- | --- |
| `/treatments` / `/why-china` / homepage medical-tourism intent | `/medical-treatment-in-china-for-foreigners` | New GEO page is canonical for the explicit foreign-patient treatment-process answer target; existing pages remain broader navigation and brand pages |
| Full/Half Arch Dental Implants All-on-4/6 treatment content | `/all-on-4-all-on-6-dental-implants-china` | New GEO page is canonical for All-on-4, All-on-6, full-arch, and half-arch comparison intent; do not narrow this back to All-on-6 only |
| `/hollywood-smile-veneers` | `/hollywood-smile-veneers-china` | New GEO page is canonical for China-specific answer target; existing page remains treatment/detail page and links to GEO page |
| `/rhinoplasty` | `/rhinoplasty-china` | New GEO page is canonical for China-specific answer target; existing page remains treatment/detail page and links to GEO page |
| `/double-eyelid-surgery` | `/double-eyelid-surgery-china` | New GEO page is canonical for China-specific answer target; existing page remains treatment/detail page and links to GEO page |
| `/bariatric-surgery` | `/bariatric-surgery-china` | Hold for Phase 1B; existing page remains primary until GEO page is reviewed |
| `/cancer-treatment` | `/cancer-treatment-china` | New GEO page is canonical for answer target; existing category page links to GEO page and related treatments |
| Proton and Heavy Ion Therapy featured content | `/proton-carbon-ion-therapy-china` | New GEO page is canonical for proton, heavy ion, and carbon ion evaluation intent; do not split or publish narrower proton-only GEO copy in Phase 1A |
| `/telemedicine` / online consultation service content | `/medical-second-opinion-china` | New GEO page is canonical for remote record review and China medical second-opinion answer intent; existing telemedicine page remains service detail and links to GEO page |
| `/stem-cell-therapy` | `/stem-cell-therapy-china` | Hold for Phase 1B; existing page remains primary until reviewed |

Do not canonicalize existing pages to new GEO pages unless the content intent clearly matches and the page owner approves. The safer first launch is cross-linking plus clear canonical tags on the new pages.

Trailing slash behavior must be predictable. `/path` and `/path/` should either both serve route-specific static HTML with the same canonical URL or one should canonicalize/redirect cleanly to the other. A trailing slash request must not fall back to the generic SPA shell.

## Content Safety Rules

All GEO content must avoid:

- Cure guarantees.
- Guaranteed savings claims unless sourced and qualified.
- Success-rate claims without verifiable context.
- Saying a treatment is approved, standard, or appropriate for all patients unless verified.
- "Best hospital" claims without criteria.
- Presenting experimental therapies as settled medicine.

All GEO content should prefer:

- "May be considered after specialist review."
- "Depends on diagnosis, records, hospital evaluation, and local regulations."
- "Request a treatment plan."
- "Compare options with a qualified clinician."
- "Medora coordinates, but does not replace medical advice."

## Evidence And Review Workflow

Every GEO page must pass a risk-appropriate content review before publishing.

Review requirements:

| Risk level | Examples | Required approval before publish |
| --- | --- | --- |
| Low | interpreter, international patient services, hospital matching process | Content owner review |
| Medium | dental implants, cosmetic surgery, general procedure planning | Content owner review and medical-safety copy check |
| Medium-high | bariatric surgery, complex surgical planning | Medical review |
| High | cancer treatment, proton/carbon ion therapy, CAR-T, stem cell therapy, autism/Parkinson's pages, SBRT, HIFU, DBS, PCI, cancer surgery, cardiology/cardiothoracic surgery, hematology, stem-cell transplant | Medical review plus legal/business approval |

High-risk pages must include:

- At least one public `https://` evidence source, or a concrete `approvalArtifact` / `reviewTicket`.
- Medical reviewer or legal reviewer for high-risk pages.
- Review owner.
- Last reviewed date.
- Clear treatment-suitability disclaimer.
- Explicit instruction that final eligibility and pricing require medical record review.
- Evidence and review notes visible in static fallback HTML and represented in JSON-LD or adjacent machine-readable metadata.

Any high-risk page without these fields must remain in config as `draft` and must not be routed, added to sitemap, or included in `llms.txt`.

The `/china-medical-visa` page has its own compliance rule. It must not state a fixed visa category as universally applicable. Copy must say visa type and required documents depend on nationality, stay length, treatment purpose, invitation or appointment documents, and current embassy, consulate, or China Visa Application Service Center rules. CTA language can offer visa support, but the page must not read as legal advice.

## Conversion Paths

Map each page to one primary CTA:

| Page Type | Primary CTA | Secondary CTA |
| --- | --- | --- |
| Dental and cosmetic | Free quote | Medical enquiry |
| Cancer, CAR-T, proton/carbon ion therapy | Medical enquiry or record submission | Case intake |
| Stem cell | Medical enquiry | Advisor consultation |
| Bariatric | Medical enquiry | Free quote |
| Visa/interpreter/services | Advisor consultation | Service enquiry |
| Hospital support | Hospital matching | Medical enquiry |

The CTA copy should match the user's decision stage. For serious medical conditions, "submit records" and "request a treatment plan" are safer and more credible than aggressive sales language.

## Future Expansion

After the first wave proves traffic and conversions, expand in three directions:

1. **Country-specific patient pages**
   - `medical treatment in China for Americans`
   - `medical treatment in China for UK patients`
   - `medical treatment in China for Middle East patients`

2. **Comparison answer targets**
   - `best country for dental implants`
   - `cancer treatment abroad`
   - `best country for stem cell therapy`

3. **Programmatic content from APIs**
   - Hospital profile summaries
   - Procedure directories
   - Package pages
   - Doctor or department pages if source data quality is strong enough

The existing GEO config should be structured so these expansions do not require redesigning the page system.

## Error Handling And Edge Cases

- Unknown GEO paths should fall through to the existing `NotFound` route.
- Metadata helper should create missing tags instead of failing.
- JSON-LD helper should avoid duplicate stale schema when navigating between SPA routes.
- If image data is missing, use the existing brand image fallback.
- If a cost or timeline cannot be supported, omit it or say that it requires record review.
- If Cloudflare overrides `robots.txt`, production verification must check the live URL after deploy.
- If static/prerendered route-specific HTML cannot be generated and verified for a Phase 1A page, that page must not be treated as launched for GEO and should not be added to sitemap, `llms.txt`, or `llms-full.txt`.

## Testing

Add or update tests to verify:

- Every Phase 1A GEO path is registered in `App.tsx`.
- Phase 1B paths are not registered unless approval status is `approved-for-publish`.
- Every GEO config entry has required fields.
- Every GEO page has at least 5 FAQ items.
- Every GEO page has a primary CTA.
- Metadata helper creates or updates title, description, canonical, Open Graph, Twitter card, and JSON-LD.
- JSON-LD tags are replaced on route change.
- Static/prerendered HTML for every Phase 1A GEO route contains route-specific title, canonical, quick-answer text, and JSON-LD before React hydration.
- Static/prerendered HTML contains exactly one canonical tag, current Open Graph title/URL, no stale default metadata, and no stale default Organization JSON-LD that conflicts with route-specific schema.
- `/path` and `/path/` requests either both return route-specific static HTML or canonicalize predictably.
- High-risk published Phase 1A pages expose evidence/review details in static fallback HTML and JSON-LD or adjacent machine-readable metadata.
- `public/sitemap.xml` includes every approved Phase 1A GEO URL and excludes unapproved Phase 1B URLs.
- `public/llms.txt` and `public/llms-full.txt` include approved Phase 1A canonical URLs and exclude unapproved Phase 1B URLs.

## Success Metrics

Track these after launch:

- Google Search Console impressions and clicks for first-wave GEO URLs.
- Bing Webmaster indexing for first-wave GEO URLs.
- Number of GEO pages indexed.
- Quote submissions from dental and cosmetic pages.
- Medical enquiries and case-intake submissions from cancer, CAR-T, proton therapy, bariatric, and stem-cell pages.
- Chat/advisor handoffs from GEO pages.
- AI/search referral traffic where available.
- Whether AI answer engines cite, summarize, or surface Medora pages for target queries.

## Implementation Sequence

1. Create the GEO answer target config with Phase 1A and Phase 1B status fields.
2. Add reusable GEO page renderer.
3. Add shared metadata and JSON-LD helper.
4. Add lightweight static HTML/prerender generation for approved Phase 1A GEO routes.
5. Register approved Phase 1A routes only.
6. Add approved Phase 1A page content.
7. Expand sitemap with approved Phase 1A URLs.
8. Add `llms.txt` and `llms-full.txt` for approved Phase 1A URLs only.
9. Add contextual internal links from existing treatment and support pages.
10. Review and adjust crawler policy in production, including Cloudflare Managed Content Signals.
11. Add tests.
12. Build and verify live-like HTML, sitemap, robots, and machine-readable files.
13. Prepare Phase 1B pages only after evidence and approval fields are complete.

## Open Questions For Implementation

- Which production crawler policy should be used for each major AI crawler after legal/business review?
- Should serious-condition pages require a stronger disclaimer component than fast-conversion pages?
- Which lead form should each page use if both `Free Quote` and `Medical Enquiry` are available?
- Can dynamic hospital and package URLs be reliably generated from the content API during build, or should they remain a later phase?

## Resolved Implementation Decisions

- `llms-full.txt` must be generated from the same GEO config as the React pages, sitemap, static HTML, and `llms.txt` to prevent drift.

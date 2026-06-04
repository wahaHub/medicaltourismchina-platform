# Hospital Canonical Slug Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add SEO-safe canonical hospital slugs with old-slug 301 redirects while preserving hospital IDs and CRM/materials content.

**Architecture:** China Supabase remains the public read model. A new `hospital_slug_aliases` table records old slugs, content-worker exposes a canonical-slug resolver and uses it for JSON/API compatibility, and Vercel middleware performs real browser-level 301 redirects before the SPA fallback. Migration scripts generate preflight and verification artifacts before any live slug update.

**Tech Stack:** Supabase SQL, Cloudflare Worker-style Node modules, Vercel Vite frontend, Vercel Routing Middleware, Vitest, Node.js scripts.

---

## Scope Notes

- The current worktree contains unrelated frontend edits in `frontend-vercel/src/components/HospitalCard.tsx`, `frontend-vercel/src/pages/HomePage.tsx`, `frontend-vercel/src/pages/HospitalDetail.tsx`, and related files. Do not stage or modify those unless implementation proves they are directly required.
- The browser SEO redirect must happen before `frontend-vercel/vercel.json` rewrites every route to `/index.html`.
- Use the current content API base URL from `VITE_CONTENT_API_BASE_URL` or `VITE_API_BASE_URL`; do not make middleware call same-origin `/hospitals/...` because that can loop through the SPA route.
- Keep all hospital materials keyed by existing `hospital_id`.

## File Structure

- Create `sql/2026-06-04_hospital_slug_aliases.sql`: China Supabase DDL for alias table and indexes.
- Create `content-worker/src/content/utils/hospital-slug-resolution.mjs`: shared resolver for canonical slug, alias redirect, and current-slug lookup by `hospital_id`.
- Modify `content-worker/src/content/utils/response.mjs`: add a small `redirect(status, location, body?)` helper.
- Modify `content-worker/src/content/handlers/hospitals.mjs`: use the resolver in detail, extended, and package handlers; add a resolver endpoint handler.
- Modify `content-worker/src/router.mjs`: route `GET /hospitals/:slug/slug-resolution` before detail routes.
- Create `frontend-vercel/middleware.ts`: Vercel browser-route 301 redirects for `/hospitals/:slug` and `/hospitals/:slug/packages/:packageSlug`.
- Create `frontend-vercel/src/__tests__/hospital-slug-middleware.test.ts`: unit tests for middleware redirect and pass-through behavior.
- Modify `frontend-vercel/src/__tests__/seo-public-entrypoints.test.ts`: assert middleware file exists and Vercel catch-all remains after API rewrites.
- Create `content-worker/src/content/utils/__tests__/hospital-slug-resolution.test.mjs`: resolver unit tests with fake Supabase query builders.
- Create `scripts/hospital_slug_migration_preflight.mjs`: read proposed slug mappings and emit JSON with collision/material-count checks.
- Create `scripts/hospital_slug_migration_verify.mjs`: verify old 301, new 200, sitemap inclusion/exclusion, and sample image status.
- Create `data/hospital_slug_migration_candidates.json`: first-batch candidate mapping, initially with known IDs where confirmed and placeholders omitted until preflight resolves them.
- Create `docs/superpowers/specs/2026-06-04-hospital-canonical-slug-read-model-design.md`: already exists; do not rewrite except if implementation uncovers a spec correction.

## Chunk 1: SQL Alias Table And Migration Inputs

### Task 1: Add China Supabase Alias DDL

**Files:**
- Create: `sql/2026-06-04_hospital_slug_aliases.sql`

- [ ] **Step 1: Write the SQL migration file**

```sql
begin;

create table if not exists public.hospital_slug_aliases (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  old_slug text not null,
  new_slug text not null,
  redirect_status integer not null default 301,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint hospital_slug_aliases_old_slug_unique unique (old_slug),
  constraint hospital_slug_aliases_no_self_alias check (old_slug <> new_slug),
  constraint hospital_slug_aliases_redirect_status_check check (redirect_status in (301, 302))
);

create index if not exists hospital_slug_aliases_hospital_id_idx
  on public.hospital_slug_aliases (hospital_id);

create index if not exists hospital_slug_aliases_new_slug_idx
  on public.hospital_slug_aliases (new_slug);

create or replace function public.set_hospital_slug_aliases_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists hospital_slug_aliases_set_updated_at on public.hospital_slug_aliases;
create trigger hospital_slug_aliases_set_updated_at
before update on public.hospital_slug_aliases
for each row
execute function public.set_hospital_slug_aliases_updated_at();

comment on column public.hospital_slug_aliases.new_slug is
  'Audit snapshot only. Runtime redirect resolution must use hospital_id -> hospitals.slug as the current canonical slug.';

commit;
```

- [ ] **Step 2: Verify SQL is syntactically inspectable**

Run:

```bash
rg -n "hospital_slug_aliases|old_slug|new_slug" sql/2026-06-04_hospital_slug_aliases.sql
```

Expected: all table, constraints, and indexes are present.

### Task 2: Add Candidate Schema And First-Batch Candidate File

**Files:**
- Create: `data/hospital_slug_migration_candidates.json`
- Create: `scripts/validate_hospital_slug_candidates.mjs`

- [ ] **Step 1: Write candidate JSON**

Use this shape:

```json
{
  "confirmed": [
    {
      "hospitalId": "4f22747e-91d0-47d7-8ae3-f3e818ef962e",
      "oldSlug": "hospital-mm4eqlha",
      "newSlug": "chongqing-hygeia-hospital",
      "nameHint": "重庆海吉亚医院",
      "reason": "canonical_slug_cleanup",
      "packageSlugSamples": [],
      "homepageFeatured": true
    }
  ],
  "unresolved": [
    { "nameHint": "广东祈福医院 Clifford Hospital", "proposedSlug": "clifford-hospital" },
    { "nameHint": "广州泰和肿瘤医院", "proposedSlug": "guangzhou-concord-cancer-center" },
    { "nameHint": "成都爱迪眼科医院", "proposedSlug": "chengdu-aidi-eye-hospital" },
    { "nameHint": "GoBroad Healthcare Group", "proposedSlug": "gobroad-healthcare-group" }
  ]
}
```

Only include `confirmed` mappings with confirmed `hospitalId`, `oldSlug`, and `newSlug`. Put the remaining target hospitals in `unresolved` so preflight can report what still needs manual ID/slug confirmation instead of silently omitting them.

- [ ] **Step 2: Write candidate validation script**

Validate:

```text
root object has confirmed[] and unresolved[]
confirmed entries require hospitalId, oldSlug, newSlug, nameHint, reason
oldSlug !== newSlug
oldSlug unique
newSlug unique within confirmed
hospitalId unique within confirmed
packageSlugSamples is optional but must be an array when present
homepageFeatured is optional and defaults to false
unresolved entries require nameHint and proposedSlug
unresolved proposedSlug values are unique and do not collide with confirmed newSlug values
```

The script should exit nonzero with a clear message on invalid input.

- [ ] **Step 3: Validate JSON**

Run:

```bash
node scripts/validate_hospital_slug_candidates.mjs data/hospital_slug_migration_candidates.json
```

Expected: `ok`.

## Chunk 2: Content Worker Canonical Slug Resolver

### Task 3: Add Response Redirect Helper

**Files:**
- Modify: `content-worker/src/content/utils/response.mjs`

- [ ] **Step 1: Write a failing check by inspection target**

Expected final helper:

```js
export const redirect = (status, location, body = '') => ({
  statusCode: status,
  headers: {
    Location: location,
    ...CORS_HEADERS,
  },
  body: typeof body === 'string' ? body : JSON.stringify(body),
})
```

- [ ] **Step 2: Implement helper**

Add `redirect` next to `json`.

- [ ] **Step 3: Run syntax check**

Run:

```bash
npm run check
```

Expected: no `node --check` failures.

### Task 4: Implement Slug Resolution Utility

**Files:**
- Create: `content-worker/src/content/utils/hospital-slug-resolution.mjs`
- Create: `content-worker/src/content/utils/__tests__/hospital-slug-resolution.test.mjs`

- [ ] **Step 1: Write resolver tests with a fake Supabase client**

Cover:

```text
canonical slug -> { type: "canonical", slug }
unknown slug -> { type: "not_found" }
old slug alias -> reads alias.hospital_id, then current hospitals.slug
alias stale new_slug -> returns current hospitals.slug, not alias.new_slug
self alias or missing current hospital -> not_found
```

- [ ] **Step 2: Implement resolver**

Use dependency injection so tests do not hit Supabase:

```js
export const createHospitalSlugResolver = ({ supa }) => async (slug, locale = 'zh') => {
  // 1. v_hospital_details by slug + locale
  // 2. hospital_slug_aliases by old_slug
  // 3. hospitals by alias.hospital_id, selecting id, slug, status
}
```

Return values:

```js
{ type: 'canonical', slug, hospitalId: data.id }
{ type: 'redirect', fromSlug: slug, toSlug: current.slug, status: alias.redirect_status || 301, hospitalId: current.id }
{ type: 'not_found' }
```

- [ ] **Step 3: Run resolver tests**

Run:

```bash
node --test content-worker/src/content/utils/__tests__/hospital-slug-resolution.test.mjs
```

Expected: all resolver tests pass.

### Task 5: Wire Resolver Into Hospital Handlers

**Files:**
- Modify: `content-worker/src/content/handlers/hospitals.mjs`
- Modify: `content-worker/src/router.mjs`
- Create: `content-worker/src/content/handlers/__tests__/hospitals-slug-routing.test.mjs`

- [ ] **Step 1: Add handler/router tests**

Create a Node test that imports the router handler and stubs the Supabase clients or the resolver module as needed. Cover:

```text
GET /hospitals/canonical-slug -> 200 JSON detail
GET /hospitals/old-slug -> 301 Location: /hospitals/canonical-slug
GET /hospitals/old-slug?locale=en -> 301 preserves ?locale=en
GET /hospitals/old-slug/extended -> 301 Location: /hospitals/canonical-slug/extended
GET /hospitals/old-slug/extended?locale=en -> 301 preserves ?locale=en
GET /hospitals/old-slug/packages/pkg-a -> 301 Location: /hospitals/canonical-slug/packages/pkg-a
GET /hospitals/old-slug/packages/pkg-a?locale=en -> 301 preserves ?locale=en
GET /hospitals/missing-slug -> 404
GET /hospitals/old-slug/slug-resolution -> 200 redirect payload
```

If module stubbing is awkward in Node ESM, move the route decision into a small pure function and test that function directly.

- [ ] **Step 2: Update detail and extended handlers**

Behavior:

```text
canonical slug -> existing JSON 200
alias slug detail -> 301 Location: /hospitals/:canonicalSlug
alias slug extended -> 301 Location: /hospitals/:canonicalSlug/extended
not found -> existing 404
```

Preserve query strings such as `locale=en` in worker redirects.

- [ ] **Step 3: Update package detail handler**

Behavior:

```text
canonical hospital slug -> existing package lookup
alias hospital slug -> 301 Location: /hospitals/:canonicalSlug/packages/:packageSlug
not found -> existing 404
```

- [ ] **Step 4: Add resolver endpoint**

Add:

```text
GET /hospitals/:slug/slug-resolution
```

Response examples:

```json
{ "type": "canonical", "slug": "chongqing-hygeia-hospital" }
{ "type": "redirect", "fromSlug": "hospital-mm4eqlha", "toSlug": "chongqing-hygeia-hospital", "status": 301 }
{ "type": "not_found" }
```

Route this before `/hospitals/:slug` so `slug-resolution` is not treated as a hospital slug.

- [ ] **Step 5: Run worker checks**

Run:

```bash
npm run check
node --test content-worker/src/content/utils/__tests__/hospital-slug-resolution.test.mjs
node --test content-worker/src/content/handlers/__tests__/hospitals-slug-routing.test.mjs
```

Expected: all pass.

## Chunk 3: Vercel Browser-Level 301 Redirects

### Task 6: Add Vercel Middleware

**Files:**
- Create: `frontend-vercel/middleware.ts`
- Create: `frontend-vercel/src/__tests__/hospital-slug-middleware.test.ts`
- Modify: `frontend-vercel/src/__tests__/seo-public-entrypoints.test.ts`

- [ ] **Step 1: Write middleware tests**

Cover:

```text
/hospitals/hospital-mm4eqlha -> 301 /hospitals/chongqing-hygeia-hospital
/hospitals/hospital-mm4eqlha?locale=en -> preserves query
/hospitals/hospital-mm4eqlha/packages/pkg-a -> 301 /hospitals/chongqing-hygeia-hospital/packages/pkg-a
/hospitals/chongqing-hygeia-hospital -> pass through
/hospitals -> pass through
content API unavailable -> pass through rather than breaking page
```

Mock `fetch` explicitly for redirect payloads, canonical payloads, non-OK responses, and thrown network errors.

- [ ] **Step 2: Implement middleware**

Use Vercel Routing Middleware to intercept only browser routes:

```ts
export const config = {
  matcher: ['/hospitals/:path*'],
};
```

Implementation outline:

```ts
const CONTENT_API_BASE_URL =
  process.env.VITE_CONTENT_API_BASE_URL
  || process.env.VITE_API_BASE_URL
  || 'https://api.medicaltourismchina.health';

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/hospitals\/([^/]+)(?:\/packages\/([^/]+))?\/?$/);
  if (!match) return;

  const [, slug, packageSlug] = match;
  const resolution = await fetch(`${CONTENT_API_BASE_URL}/hospitals/${encodeURIComponent(slug)}/slug-resolution`, {
    headers: { accept: 'application/json' },
  });
  if (!resolution.ok) return;

  const payload = await resolution.json();
  if (payload?.type !== 'redirect' || !payload.toSlug) return;

  const target = new URL(request.url);
  target.pathname = packageSlug
    ? `/hospitals/${payload.toSlug}/packages/${packageSlug}`
    : `/hospitals/${payload.toSlug}`;
  return Response.redirect(target, payload.status || 301);
}
```

If Vercel requires middleware helpers from an official package, keep the implementation minimal and add only the required dependency/import. Prefer standards-based `Request`, `Response`, and `fetch` if the deployment supports it.

- [ ] **Step 3: Assert SEO route boundary**

Extend `seo-public-entrypoints.test.ts` to assert:

```text
frontend-vercel/middleware.ts exists
middleware matcher mentions /hospitals/:path*
vercel.json catch-all rewrite to /index.html remains last
```

- [ ] **Step 4: Run frontend tests**

Run:

```bash
npx vitest run src/__tests__/hospital-slug-middleware.test.ts src/__tests__/seo-public-entrypoints.test.ts
```

Expected: all tests pass.

## Chunk 4: Preflight, Verification, And Final Checks

### Task 7: Add Preflight Script

**Files:**
- Create: `scripts/hospital_slug_migration_preflight.mjs`

- [ ] **Step 1: Implement dry-run preflight**

Inputs:

```bash
node scripts/hospital_slug_migration_preflight.mjs \
  data/hospital_slug_migration_candidates.json \
  --out artifacts/hospital_slug_migration_preflight.json
```

Write the exact before-state snapshot to `artifacts/hospital_slug_migration_preflight.json` and also print the same JSON to stdout. Create the `artifacts/` directory if needed. This artifact is the required input to post-migration verification.

Output JSON:

```json
{
  "generatedAt": "2026-06-04T...",
  "candidates": [
    {
      "hospitalId": "...",
      "oldSlug": "...",
      "newSlug": "...",
      "currentHospital": { "id": "...", "slug": "...", "name": "...", "name_en": "..." },
      "slugCollision": null,
      "materialCounts": {
        "gallery": 11,
        "surgeons": 8,
        "equipment": 6,
        "procedure_cases": 9,
        "reviews": 3,
        "packages": 2
      },
      "packageSlugSamples": ["premium-care-package"],
      "representativeImageUrls": ["https://.../hero.png"],
      "homepageFeatured": true,
      "homepageFeaturedImageSamples": ["https://.../homepage-card.png"],
      "ready": true,
      "warnings": []
    }
  ],
  "unresolved": [
    {
      "nameHint": "广东祈福医院 Clifford Hospital",
      "proposedSlug": "clifford-hospital",
      "matches": [],
      "ready": false,
      "warnings": ["No confirmed hospitalId; resolve manually before migration"]
    }
  ]
}
```

Do not write to Supabase in this script.

- [ ] **Step 2: Run local syntax check**

Run:

```bash
node --check scripts/hospital_slug_migration_preflight.mjs
```

Expected: no syntax errors.

### Task 8: Add Verification Script

**Files:**
- Create: `scripts/hospital_slug_migration_verify.mjs`

- [ ] **Step 1: Implement post-migration verification**

Inputs:

```bash
node scripts/hospital_slug_migration_verify.mjs \
  artifacts/hospital_slug_migration_preflight.json \
  --base-url https://www.medicaltourismchina.health
```

Checks:

```text
new browser detail URL returns 200
new detail API returns 200
new extended API returns 200
material counts after migration are greater than or equal to preflight counts for gallery, surgeons, equipment, procedure_cases, reviews, and packages
old browser URL returns exactly 301 to new URL
old browser URL with query string returns exactly 301 and preserves query string
old package URL returns exactly 301 for every package slug in packageSlugSamples
sitemap includes new URL
sitemap excludes old URL
representative image samples return 200
homepage featured hospital image samples from the preflight artifact return 200 when homepageFeatured is true
```

The verification script must fail fast if the input artifact does not contain `materialCounts`, `packageSlugSamples`, or `representativeImageUrls` for a confirmed candidate. An empty `packageSlugSamples` array is allowed only when preflight found zero active packages and records a warning explaining that package redirect coverage was skipped for that hospital.
If `homepageFeatured` is true, `homepageFeaturedImageSamples` must be present and nonempty; otherwise homepage image verification cannot be skipped.

Output JSON to stdout and exit nonzero on blocking failures:

```json
{
  "candidates": [
    {
      "hospitalId": "...",
      "oldSlug": "hospital-mm4eqlha",
      "newSlug": "chongqing-hygeia-hospital",
      "browserNewUrl200": true,
      "detailApi200": true,
      "extendedApi200": true,
      "materialCountsBefore": { "gallery": 11, "surgeons": 8, "equipment": 6, "procedure_cases": 9, "reviews": 3, "packages": 2 },
      "materialCountsAfter": { "gallery": 11, "surgeons": 8, "equipment": 6, "procedure_cases": 9, "reviews": 3, "packages": 2 },
      "oldSlug301": true,
      "oldSlugQueryPreserved": true,
      "packageOldSlug301": true,
      "sitemapHasNewSlug": true,
      "sitemapNotHasOldSlug": true,
      "representativeImageSamples": [{ "url": "https://...", "status": 200 }],
      "homepageFeaturedImageSamples": [{ "url": "https://...", "status": 200 }],
      "blockingFailures": []
    }
  ]
}
```

- [ ] **Step 2: Run syntax check**

Run:

```bash
node --check scripts/hospital_slug_migration_verify.mjs
```

Expected: no syntax errors.

- [ ] **Step 3: Add deployed smoke check command to final verification notes**

After deployment and live alias rows exist, run:

```bash
curl -I https://www.medicaltourismchina.health/hospitals/hospital-mm4eqlha
curl -I "https://www.medicaltourismchina.health/hospitals/hospital-mm4eqlha?locale=en"
curl -I https://www.medicaltourismchina.health/hospitals/hospital-mm4eqlha/packages/<sample-package-slug>
curl -I "https://www.medicaltourismchina.health/hospitals/hospital-mm4eqlha/packages/<sample-package-slug>?locale=en"
```

Expected: all return `301`; `Location` points at `/hospitals/chongqing-hygeia-hospital`, and query-string checks preserve `?locale=en`.

### Task 9: Run Full Local Verification

**Files:**
- No new files unless tests require updates.

- [ ] **Step 1: Run worker checks**

Run:

```bash
cd content-worker
npm run check
node --test src/content/utils/__tests__/hospital-slug-resolution.test.mjs
```

Expected: all pass.

- [ ] **Step 2: Run targeted frontend tests**

Run:

```bash
cd frontend-vercel
npx vitest run src/__tests__/hospital-slug-middleware.test.ts src/__tests__/seo-public-entrypoints.test.ts src/services/api/__tests__/hospital.test.ts
```

Expected: all pass.

- [ ] **Step 3: Run frontend build**

Run:

```bash
cd frontend-vercel
npm run build
```

Expected: build succeeds. Existing duplicate i18n key and chunk-size warnings may appear; do not treat those as failures unless new errors appear.

- [ ] **Step 4: Confirm working tree scope**

Run:

```bash
git status --short --branch
git diff --name-only
```

Expected: changed files are limited to this plan's scope plus pre-existing unrelated frontend edits that remain unstaged.

## Review And Commit Sequence

- [ ] Run `review-until-clean` once after the plan is written and before implementation. The reviewer should evaluate this plan against the approved spec.
- [ ] Implement chunks in order.
- [ ] Run `review-until-clean` on the final code diff.
- [ ] Use `detailed-commit-messages` to commit only the files from this implementation scope, explicitly noting pre-existing unrelated frontend edits if still present.

## Deployment Notes

- Deploy content-worker first so `/hospitals/:slug/slug-resolution` is available.
- Deploy frontend second so middleware can call the live resolver.
- Apply SQL before enabling real alias rows.
- Do not publish canonical slug sitemap entries until new slugs return 200 and old slugs redirect.

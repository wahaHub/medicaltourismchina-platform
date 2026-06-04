# Hospital Source Media Unification Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move hospital profile ownership to CRM-authored data and publish one China Supabase public read model with stable canonical slugs and public R2 media URLs.

**Architecture:** CRM remains the authoring source for editable hospital profiles, materials, galleries, surgeons, equipment, cases, packages, and reviews. China Supabase remains the public read model consumed by `medicaltourismchina-platform`; the public views expose canonical slugs and normalized media URLs only. Legacy China-only hospitals stay readable while they are gradually onboarded into CRM.

**Tech Stack:** Supabase Postgres views/tables, CRM v2 Supabase repositories, Cloudflare R2 public media, Cloudflare content worker, Vercel frontend, Node operational scripts.

---

## Evidence From 2026-06-04 Inventory

Artifacts:
- `artifacts/hospital_source_media_inventory.zh.json`
- `artifacts/hospital_source_media_inventory.zh.summary.json`
- `artifacts/hospital_media_url_checks.zh.json`

Current state:
- 67 approved China public hospitals are exposed by `v_hospital_summary` and `v_hospital_details`.
- 67/67 have China detail rows.
- 7/67 have matching CRM `hospitals` rows.
- 1/67 has CRM `hospital_material_packages` or `hospital_material_reviews`.
- 60/67 have no media URLs in the detail/material sources.
- 6 hospitals have rich profile detail outside CRM materials tables.
- 3 hospitals still reference legacy `d1wwcixye6at8o.cloudfront.net` media.
- Image sample checks found 0 working sampled URLs: legacy CloudFront fetches failed, current R2 CRM-storage references returned 404/timeout, and expected low fallback paths returned 404/timeout.

Important hospital rows:
- `hospital-mm4eqlha` / 重庆海吉亚医院: CRM hospital exists, CRM materials missing, 37 media URLs all legacy CloudFront.
- `hospital-mm9xx6oc` / 成都爱迪眼科医院: CRM hospital exists, CRM materials missing, 23 media URLs all legacy CloudFront.
- `hospital-f100fb70` / 广州泰和肿瘤医院: CRM hospital exists, CRM materials missing, 17 media URLs all legacy CloudFront.
- `hospital-9990cee1` / 广东祈福医院 Clifford Hospital: CRM hospital exists, CRM materials missing, 1 R2 CRM-storage URL sampled as timeout, low fallback missing.
- `hospital-d71e7cc9` / GoBroad Healthcare Group (GHG): CRM hospital exists, CRM materials missing, 49 R2 CRM-storage URLs, sampled URLs returned 404/timeout.
- `chongqing-emergency-medical-center`: China-only public hospital, no CRM hospital row, no media. This is not the same entity as `hospital-mm4eqlha`.

Root cause:
- Hospital data is not unified. The live platform reads China public views, while only a small subset of hospitals exists in CRM.
- Rich editable-looking hospital content is stored directly in China `hospitals` / `hospital_i18n` JSON fields for several hospitals, not in CRM materials tables.
- Media URL strings point at several incompatible storage schemes. Some point to a retired/blocked legacy CloudFront host; some point to R2 keys that are not present at the configured public base URL.
- The platform cannot fix this purely in frontend code because the public read model already contains broken or non-existent asset URLs.

## File Structure

- Modify `scripts/hospital_source_media_inventory.mjs`: keep the inventory script as the preflight gate for every migration batch.
- Create `scripts/hospital_media_migration_manifest.mjs`: produce a deterministic media copy/update manifest from inventory artifacts.
- Create `scripts/hospital_read_model_migration_preflight.mjs`: validate one batch before any DB write.
- Create `scripts/hospital_read_model_migration_verify.mjs`: verify slugs, aliases, media URLs, and public API responses after each batch.
- Create `sql/2026-06-04_hospital_public_read_model_unification.sql`: add alias/read-model support needed for canonical slugs and normalized media.
- Modify CRM v2 China repository files in `../medical-crm-v2/packages/infrastructure/supabase-china/`: publish CRM-authored hospital material data into China public tables/views.
- Modify content worker hospital handlers only if the read model cannot fully preserve the existing API response shape.

## Chunk 1: Freeze The Current Public Surface

### Task 1: Preserve Inventory As The Migration Baseline

**Files:**
- Modify: `scripts/hospital_source_media_inventory.mjs`
- Modify: `scripts/README.md`
- Create: `artifacts/hospital_source_media_inventory.zh.json`
- Create: `artifacts/hospital_source_media_inventory.zh.summary.json`
- Create: `artifacts/hospital_media_url_checks.zh.json`

- [x] **Step 1: Run source/media inventory**

Run:

```bash
node scripts/hospital_source_media_inventory.mjs \
  --locale zh \
  --limit 500 \
  --image-sample-limit 5 \
  --out artifacts/hospital_source_media_inventory.zh.json
```

Expected: JSON report with 67 hospitals and source/media warnings.

- [x] **Step 2: Run sampled URL checks with timeout**

Run:

```bash
node scripts/hospital_source_media_inventory.mjs \
  --locale zh \
  --limit 500 \
  --check-images \
  --image-sample-limit 5 \
  --image-timeout-ms 8000 \
  --out artifacts/hospital_source_media_inventory.zh.images.json
```

Expected: bad legacy/R2 URLs show as `404`, `timeout`, or fetch error instead of hanging forever.

- [ ] **Step 3: Commit the hardened inventory tool**

Run:

```bash
node --check scripts/hospital_source_media_inventory.mjs
git diff --check -- scripts/hospital_source_media_inventory.mjs scripts/README.md
git add scripts/hospital_source_media_inventory.mjs scripts/README.md
git commit -m "chore(hospitals): harden source media inventory"
```

Expected: commit contains only inventory tooling/docs changes.

## Chunk 2: Canonicalize The Six CRM-Backed Generated-Slug Hospitals

### Task 2: Prepare Slug Alias Batch

**Files:**
- Modify: `data/hospital_slug_migration_candidates.json`
- Use: `sql/2026-06-04_hospital_slug_aliases.sql`
- Use: `scripts/hospital_slug_migration_preflight.mjs`
- Use: `scripts/hospital_slug_migration_verify.mjs`

- [ ] **Step 1: Add all six generated-slug CRM hospitals to candidate JSON**

Map:

```json
[
  {
    "hospitalId": "4f22747e-91d0-47d7-8ae3-f3e818ef962e",
    "oldSlug": "hospital-mm4eqlha",
    "newSlug": "chongqing-hygeia-hospital"
  },
  {
    "hospitalId": "d4b86613-9459-487b-8b2a-e4b531548436",
    "oldSlug": "hospital-mm9xx6oc",
    "newSlug": "chengdu-aidi-eye-hospital"
  },
  {
    "hospitalId": "f100fb70-3f9a-49c3-b85f-4efa3d73d696",
    "oldSlug": "hospital-f100fb70",
    "newSlug": "guangzhou-concord-cancer-center"
  },
  {
    "hospitalId": "9990cee1-cc3b-4146-991e-0a0cc035b8c0",
    "oldSlug": "hospital-9990cee1",
    "newSlug": "clifford-hospital"
  },
  {
    "hospitalId": "d71e7cc9-6d5a-4dc4-b228-1ff58105c853",
    "oldSlug": "hospital-d71e7cc9",
    "newSlug": "gobroad-healthcare-group"
  },
  {
    "hospitalId": "eeeb46fe-7478-4250-abd1-a3954e74a212",
    "oldSlug": "hospital-eeeb46fe",
    "newSlug": "raffles-hospital-beijing"
  }
]
```

- [ ] **Step 2: Run slug preflight**

Run:

```bash
node scripts/validate_hospital_slug_candidates.mjs data/hospital_slug_migration_candidates.json
node scripts/hospital_slug_migration_preflight.mjs data/hospital_slug_migration_candidates.json
```

Expected: every old slug exists, every new slug is free, package route impacts are listed.

- [ ] **Step 3: Apply slug SQL in China Supabase only after preflight is clean**

Expected DB changes:
- Update `hospitals.slug` to canonical English slug.
- Insert old generated slug into `hospital_slug_aliases`.
- Keep sitemap exposing only canonical slug.
- Keep old slug returning 301 to canonical slug through worker/frontend middleware.

## Chunk 3: Normalize Media Ownership For The Six CRM Rows

### Task 3: Build Media Migration Manifest

**Files:**
- Create: `scripts/hospital_media_migration_manifest.mjs`
- Create: `data/hospital_media_migration_manifest.json`

- [ ] **Step 1: Extract every media URL for the six CRM-backed generated-slug hospitals**

Input: `artifacts/hospital_source_media_inventory.zh.json`.

Output row shape:

```json
{
  "hospitalId": "4f22747e-91d0-47d7-8ae3-f3e818ef962e",
  "slug": "chongqing-hygeia-hospital",
  "kind": "gallery",
  "oldUrl": "https://d1wwcixye6at8o.cloudfront.net/...",
  "targetKey": "hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/001.jpg",
  "targetUrl": "https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/gallery/001.jpg",
  "sourceStatus": "missing_or_blocked"
}
```

- [ ] **Step 2: Decide media source per row**

Rules:
- If old URL still downloads, copy bytes to canonical R2 key.
- If old URL is unavailable, use local archived assets if present.
- If no source exists, mark as `needs_reupload` and do not write that URL into the read model.
- Never publish a public read model URL until HEAD/GET range check passes.

- [ ] **Step 3: Commit manifest**

Run:

```bash
node --check scripts/hospital_media_migration_manifest.mjs
git add scripts/hospital_media_migration_manifest.mjs data/hospital_media_migration_manifest.json
git commit -m "chore(hospitals): prepare media migration manifest"
```

## Chunk 4: Move Rich Detail Into CRM Materials Shape

### Task 4: Backfill CRM Materials From China Detail JSON

**Files:**
- Create: `scripts/hospital_crm_materials_backfill_plan.mjs`
- Create: `data/hospital_crm_materials_backfill.json`
- Modify: `../medical-crm-v2/packages/infrastructure/supabase-china/china-medical-materials.repository.ts`

- [ ] **Step 1: Convert China view arrays to CRM material sections**

Mappings:
- `gallery` -> CRM hospital gallery/material image entries.
- `equipment` -> CRM equipment materials.
- `surgeons` -> CRM surgeon materials.
- `procedure_cases` -> CRM cases.
- `patient_reviews` -> `hospital_material_reviews`.
- package rows stay in `hospital_material_packages`.

- [ ] **Step 2: Run dry-run validation**

Expected:
- Six CRM-backed generated-slug hospitals can be represented from CRM hospital/material tables.
- No broken media URL is inserted.
- Original China detail JSON is retained until public read model verification passes.

- [ ] **Step 3: Apply backfill batch by batch**

Batch order:
1. Clifford Hospital and Raffles Beijing, because they have smaller media sets.
2. Guangzhou Concord, Chengdu Aidi, Chongqing Hygeia.
3. GoBroad, because it has the largest media set.

## Chunk 5: Publish Unified China Public Read Model

### Task 5: Update Views To Prefer CRM-Published Rows

**Files:**
- Create: `sql/2026-06-04_hospital_public_read_model_unification.sql`
- Modify if needed: `content-worker/src/content/handlers/hospitals.mjs`
- Test: `content-worker/src/content/handlers/__tests__/hospitals-slug-routing.test.mjs`

- [ ] **Step 1: Add or update public read-model tables/views**

Expected:
- `v_hospital_summary` and `v_hospital_details` expose the same fields consumed today.
- For CRM-backed rows, media arrays come from CRM-published materials with verified R2 URLs.
- For legacy China-only rows, existing readable fields remain intact.
- Views do not emit broken media URLs.

- [ ] **Step 2: Verify public API compatibility**

Run:

```bash
cd content-worker
npm run check
node --test src/content/handlers/__tests__/hospitals-slug-routing.test.mjs
```

Expected: existing hospital list/detail response shape stays compatible.

## Chunk 6: SEO And Production Verification

### Task 6: Verify Canonical URLs, Sitemap, And Images

**Files:**
- Use: `scripts/hospital_slug_migration_verify.mjs`
- Use: `scripts/hospital_source_media_inventory.mjs`
- Modify if needed: `frontend-vercel/src/__tests__/seo-public-entrypoints.test.ts`

- [ ] **Step 1: Verify old slug redirects**

Expected:
- `/hospitals/hospital-mm4eqlha` returns 301 to `/hospitals/chongqing-hygeia-hospital`.
- Old generated slugs are not in sitemap.
- Canonical English slugs are in sitemap.

- [ ] **Step 2: Verify image URLs**

Run:

```bash
node scripts/hospital_source_media_inventory.mjs \
  --locale zh \
  --limit 500 \
  --check-images \
  --image-sample-limit 10 \
  --image-timeout-ms 8000 \
  --out artifacts/hospital_source_media_inventory.after.json
```

Expected:
- The six CRM-backed migrated hospitals have no legacy CloudFront media.
- Published R2 URLs return 2xx/3xx.
- Low fallback URLs are either present and valid or not referenced by the read model.

- [ ] **Step 3: Deploy and smoke test**

Run:

```bash
python3 scripts/deploy_platform.py --targets content-worker,frontend --allow-dirty
```

Expected:
- Hospital list images render for the six migrated hospitals.
- Hospital detail gallery/surgeon/equipment/case images render for migrated hospitals.
- `chongqing-emergency-medical-center` remains a separate China-only hospital unless explicitly merged later.


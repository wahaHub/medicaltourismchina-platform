# Hospital Canonical Slug And Public Read Model Design

Date: 2026-06-04

## Context

`medicaltourismchina-platform` currently reads hospital list and detail data from the China Supabase public views `v_hospital_summary` and `v_hospital_details`. Some hospitals use generated slugs such as `hospital-mm4eqlha`, some use human-readable English slugs such as `chongqing-emergency-medical-center`, and hospital media is split across low fallback images, `hospital_photos/public/{id}/...`, legacy S3/CloudFront URLs, and R2.

CRM v2 already has regular-hospital materials workflows for info, gallery, surgeons, equipment, cases, reviews, packages, and materials uploads. The desired direction is:

```text
CRM hospitals / materials
  -> publish/sync
  -> China Supabase public read model
  -> medicaltourismchina-platform content-worker
  -> frontend
```

The immediate design goal is to make public hospital URLs canonical and SEO-safe while preserving existing hospital content.

## Goals

- Use human-readable English canonical slugs for public hospital URLs.
- Preserve existing hospital IDs so gallery, surgeons, equipment, cases, reviews, and packages remain attached.
- Keep old hospital URLs working through redirects instead of allowing accidental 404s.
- Expose only canonical hospital URLs in sitemap output.
- Keep `medicaltourismchina-platform` reading one public read model rather than directly chasing multiple CRM/internal tables.
- Make the migration reversible and verifiable per hospital.

## Non-Goals

- Do not duplicate hospital rows to represent old slugs.
- Do not directly update `v_hospital_details` as if it were a source table.
- Do not redesign CRM materials editing screens in this phase.
- Do not migrate every hospital in one unsafe batch before validating the first set.

## Recommended Approach

Use canonical slugs in the China `hospitals` source table and add a China Supabase alias table for old slugs.

Example canonical hospital row:

```text
hospitals.id = 4f22747e-91d0-47d7-8ae3-f3e818ef962e
hospitals.slug = chongqing-hygeia-hospital
```

Example alias row:

```text
old_slug = hospital-mm4eqlha
new_slug = chongqing-hygeia-hospital
hospital_id = 4f22747e-91d0-47d7-8ae3-f3e818ef962e
redirect_status = 301
```

This keeps the public URL clean while preserving existing materials that are keyed by `hospital_id`.

## Data Model

Add a lightweight alias table in China Supabase:

```sql
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
```

Migration for one hospital:

```sql
insert into public.hospital_slug_aliases (
  hospital_id,
  old_slug,
  new_slug,
  redirect_status,
  reason
)
values (
  '4f22747e-91d0-47d7-8ae3-f3e818ef962e',
  'hospital-mm4eqlha',
  'chongqing-hygeia-hospital',
  301,
  'canonical_slug_cleanup'
)
on conflict (old_slug) do update
set
  hospital_id = excluded.hospital_id,
  new_slug = excluded.new_slug,
  redirect_status = excluded.redirect_status,
  reason = excluded.reason,
  updated_at = now();

update public.hospitals
set slug = 'chongqing-hygeia-hospital',
    updated_at = now()
where id = '4f22747e-91d0-47d7-8ae3-f3e818ef962e';
```

Before changing a slug, verify that the target slug is not already owned by another hospital:

```sql
select id, slug, name
from public.hospitals
where slug in ('hospital-mm4eqlha', 'chongqing-hygeia-hospital');
```

## Worker Routing

There are two separate route surfaces:

- Browser HTML routes served by Vercel/frontend:
  - `/hospitals/:slug`
  - `/hospitals/:slug/packages/:packageSlug`
- JSON/API routes served by the content worker:
  - hospital detail endpoint used by `hospitalApi.getHospitalBySlug`
  - hospital extended endpoint used by `hospitalApi.getHospitalExtendedBySlug`
  - hospital package detail endpoint used by `hospitalApi.getHospitalPackageDetailBySlug`

SEO-critical redirects must happen on the browser HTML surface, because Google and users request the Vercel page URL first. The content worker should also support alias redirects or canonical metadata for API callers, but API-only redirects are not sufficient for SEO.

The content worker and any Vercel redirect layer should share the same logical resolution rule:

```text
resolveHospitalSlug(identifier)
  -> { type: "canonical", slug, hospitalId? }
  -> { type: "redirect", fromSlug, toSlug, status }
  -> { type: "not_found" }
```

The resolver must not blindly trust `hospital_slug_aliases.new_slug`. It should use `hospital_slug_aliases.hospital_id` to read the current `hospitals.slug` and use the stored `new_slug` only as an audit snapshot or fallback. This prevents stale alias rows from redirecting to dead URLs after a later canonical slug edit.

For browser `GET /hospitals/:slug` on Vercel:

```text
1. If the slug is canonical, serve the SPA page normally.
2. If the slug is an alias, return 301 Location: /hospitals/:current_hospitals_slug.
3. Preserve relevant query string parameters.
4. Normalize trailing slash behavior consistently with the rest of the site.
```

For browser `GET /hospitals/:slug/packages/:packageSlug` on Vercel:

```text
1. If the hospital slug is canonical, serve the SPA page normally.
2. If the hospital slug is an alias, return 301 Location: /hospitals/:current_hospitals_slug/packages/:packageSlug.
3. Preserve relevant query string parameters.
4. Normalize trailing slash behavior consistently with the rest of the site.
```

For content-worker hospital detail and extended JSON/API requests:

```text
1. Query v_hospital_details where slug = requested slug.
2. If found, return 200.
3. If not found, query hospital_slug_aliases where old_slug = requested slug.
4. If alias is found, resolve hospital_id to current hospitals.slug.
5. Return either a 301 to the canonical API path or a structured canonical redirect response, depending on frontend client needs.
6. Otherwise return 404.
```

For content-worker package detail JSON/API requests:

```text
1. Resolve the hospital slug using the same alias rule.
2. If alias is found, redirect or return canonical metadata for the API path with the same package slug.
3. If canonical, fetch package detail normally.
5. Otherwise return 404.
```

The existing frontend route `/hospital/:id` can continue redirecting to `/hospitals/:slug`. It is not required to move that behavior into the worker in this phase.

## Read Model Behavior

`v_hospital_summary` and `v_hospital_details` should expose the current canonical slug from the China `hospitals` source row.

Do not manually update a view. If the view does not currently read `hospitals.slug`, update the view definition so it derives from the canonical source table. If it already reads `hospitals.slug`, updating the source row is enough.

The platform should continue to read the public views. CRM materials should publish/sync into the public read model instead of requiring the frontend to understand every internal materials table.

## SEO Rules

- Sitemap includes only canonical hospital URLs.
- Old alias URLs never appear in sitemap.
- Old browser hospital URLs return a real HTTP `301` to the canonical URL from the Vercel/frontend route surface.
- Old browser package URLs return a real HTTP `301` to the canonical hospital path with the same package slug.
- API endpoints may also redirect, but API redirects do not replace browser-level SEO redirects.
- Canonical/meta URLs should use the new slug.
- Existing hospital IDs must not change.
- Query strings should be preserved unless a parameter is known to be unsafe or obsolete.
- Trailing slash behavior should match the rest of the production site.

This avoids SEO interruption because indexed old URLs remain valid and transfer to the new canonical paths.

## Initial Migration Scope

Start with the hospitals most affected by generated slugs or media inconsistency:

- Chongqing Hygeia Hospital.
- Clifford Hospital / Guangdong Clifford Hospital.
- Guangzhou Taihe Cancer Hospital.
- Chengdu Aidi Eye Hospital.
- GoBroad Healthcare Group.

After these pass verification, expand to other generated `hospital-*` slugs.

## Verification

For each migrated hospital, record:

```text
hospital_id
old_slug
new_slug
current_name
english_name
detail_200
extended_200
gallery_count_before / after
surgeons_count_before / after
equipment_count_before / after
procedure_cases_count_before / after
packages_count_before / after
image_200_sample_count
old_slug_301
package_old_slug_301
old_slug_query_301_preserves_query
sitemap_has_new_slug
sitemap_not_has_old_slug
```

Acceptance criteria:

- New slug detail and extended endpoints return 200.
- Old slug returns 301, not 404.
- Package URLs under old hospital slug return 301 to the new hospital slug.
- `hospital_id` is unchanged.
- Gallery, surgeons, equipment, cases, reviews, and package counts do not drop unless explicitly approved as bad-data cleanup.
- Sitemap includes new slugs and excludes old aliases.
- Representative image URLs return 200.
- Homepage featured hospitals still display images.

## Rollback

Generate rollback SQL for each migrated hospital:

```sql
update public.hospitals
set slug = '<old_slug>',
    updated_at = now()
where id = '<hospital_id>';

delete from public.hospital_slug_aliases
where old_slug = '<old_slug>';
```

Rollback should restore old public paths. Media and materials should not need rollback if hospital IDs were preserved.

## Risks And Mitigations

- Risk: target slug already belongs to another hospital.
  Mitigation: preflight slug collision query before every update.

- Risk: worker only queries canonical slug and old URLs 404.
  Mitigation: implement alias fallback and 301 before updating sitemap.

- Risk: view definition does not expose updated canonical slug.
  Mitigation: inspect and update `v_hospital_summary` / `v_hospital_details` definitions before data migration.

- Risk: materials disappear after slug change.
  Mitigation: preserve `hospital_id` and verify material counts before and after.

- Risk: sitemap publishes new URLs before they resolve.
  Mitigation: deploy worker support first, migrate one batch, verify endpoints, then update sitemap generation/static sitemap.

# SEO contract

This directory protects the URLs and metadata already published to Google Search
Console. The contract is intentionally stricter than a normal sitemap test.

## What is enforced

`npm run build` generates the production HTML and sitemap, then validates:

- valid XML and the sitemap protocol namespace;
- absolute, unique HTTPS URLs on the canonical `www` origin;
- no search, filter, admin, retired, test-entity, UUID, or generated-slug URLs;
- one generated HTML document for every sitemap URL;
- every indexable generated page is present in the sitemap;
- no `noindex` generated page is present in the sitemap;
- exactly one title, description, robots tag, canonical, `og:url`, and H1;
- self-referencing canonical and matching `og:url`;
- initial HTML contains prerendered H1 and content;
- locale-correct `<html lang>` and Arabic `dir="rtl"`;
- valid, reciprocal hreflang links and an English `x-default`;
- identical hreflang mappings in HTML and sitemap;
- no silent removal of a URL in `contracts/protected-urls.json`;
- no unreviewed metadata change on a page in
  `contracts/protected-page-metadata.json`.

## Normal commands

```bash
npm run test:seo:unit
npm run test:seo:artifact
npm run test:seo
npm run test:seo:production
```

`test:seo` runs the deterministic tests and a complete production-style build.
`test:seo:production` checks the live sitemap, all sitemap hreflang relationships,
the protected URL set, critical pages, and representative procedure/hospital
detail pages.

## Adding content

New indexable URLs are allowed automatically. They do not require a baseline
update. The validator reports the number of new URLs for review.

## Removing or changing a URL

Never delete a protected URL silently. Add an entry to
`contracts/approved-url-removals.json`:

```json
{
  "url": "https://www.medicaltourismchina.health/procedures/old-slug",
  "reason": "The canonical slug was intentionally changed after SEO review.",
  "expectedStatus": 301,
  "replacement": "https://www.medicaltourismchina.health/procedures/new-slug"
}
```

Use `301` or `308` when a replacement exists. Use `410` for intentionally
retired content with no replacement. Redirect behavior must also be verified in
production before the migration is considered complete.

Keep historical URLs in `protected-urls.json`; the approved removal documents why
they no longer appear in the sitemap.

## Changing protected metadata

Titles, descriptions, H1 text, canonical values, language attributes, robots
rules, and hreflang mappings for critical entry pages are exact contracts. Update
only the affected entry in `protected-page-metadata.json` after reviewing the SEO
change.

## Baseline capture

`npm run seo:contract:capture` was used to create the initial baseline from the
production site. It refuses to overwrite an existing baseline. Do not run it as a
routine update command.

An emergency full replacement requires:

```bash
SEO_CONTRACT_ALLOW_OVERWRITE=1 npm run seo:contract:capture
```

This removes historical protection and therefore requires explicit review of the
complete sitemap and metadata diff.

# China article editorial and SEO release — 2026-09-19

This release implements the reviewed title proposal across 510 articles and eight languages. Article URLs and clinical source sections are preserved. Country-level scope is reflected in the SEO title, visible H1, article cards and selected introductions; genuinely city-specific guides retain their city. Articles 151 and 168 remain general-topic exceptions.

Each of the 305 recently imported articles receives an authored SEO title and summary in every language instead of relying on the opening paragraph as a metadata fallback. Nineteen articles receive a specific introductory paragraph covering patient preparation and access verification in China. Existing clinical recommendations, evidence qualifications and citation links are preserved. These are editorial and discoverability changes, not a new medical review or verification of treatment availability.

Native language edits were prepared by parallel Codex subagents. No OpenAI API, translation API or external model CLI was used.

## Assets

- `index.html`: searchable before/after comparison, with separate SEO title, H1, description and added introduction fields.
- `approved-comparison.json`: approved English/Chinese title decisions.
- `input-<locale>.json`: original metadata and source context.
- `edits-<locale>.json`: reviewed, source-owned native metadata and selective introductions.
- `application-<locale>.json`: source hashes, field-level change counts and checks that clinical body and citation targets are preserved.
- `published-comparison.json`: complete eight-language before/after dataset, generated during artifact verification.
- `validation.json`: checks against all 4,080 generated article pages.
- `production-validation.json`: production verification receipt, added after deployment.

## Implementation

`apply-guide-editorial-release.mjs` validates a complete locale pack before writing any Markdown. The source articles own all SEO values; no runtime keyword suffix is injected. The normal manifest builder and prerender pipeline regenerate guide metadata, directory links, HTML, canonical and hreflang links, Open Graph/Twitter metadata, Article structured data and sitemap entries.

Modification dates now track each translation independently. Only edited source articles receive the release date; one locale's modification no longer changes every other locale's sitemap date. Existing URL and protected metadata contracts remain in force. Expected output is 11,910 sitemap URLs, including 4,080 article URLs and all eight Telemedicine URLs.

## Verification

```sh
npm run test:seo:unit
npm run build
node scripts/verify-guide-editorial-release.mjs
npm run test:seo:production
```

The release verifier checks all 4,080 source/HTML title, H1 and description values, unique H1, canonical URL, nine hreflang alternates, Article metadata, OG/Twitter titles, sitemap membership and matching per-locale modification dates. Application reports check preserved clinical body and reference links.

Google considers visible headings and other page signals when generating title links; concise, accurate titles and language consistency are intentional. See [Google title-link guidance](https://developers.google.com/search/docs/appearance/title-link). Sitemap dates represent actual edits, following [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap). Deployment and valid sitemap inclusion do not establish that Google has already recrawled or indexed a page.

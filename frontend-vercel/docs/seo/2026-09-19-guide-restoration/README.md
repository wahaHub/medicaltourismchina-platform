# Restore the published guide library

The September 19 production release contained only 410 article URLs because the complete multilingual library and its rendering pipeline had not reached main. This change restores 510 guides in eight languages (4,080 article URLs) on top of the current main branch. It retains all 410 existing Markdown files byte-for-byte, including today's editorial cleanup, and leaves the current video, interpretation, and navigation code intact.

The change restores 3,670 missing Markdown files; source-backed language selection; native article bodies, canonical URLs and reciprocal hreflang; all eight guide directories; disease classification for 305 imported articles across 17 conditions; and 404/noindex handling for unavailable articles. Browser rendering and prerendered HTML share the same editorial-note removal helper.

The complete generated sitemap has 11,910 URLs. The protected URL contract now retains all 11,910 public URLs plus three existing approved legacy redirects. The build fails if a protected article or language disappears. A regression test also checks the 510-per-language baseline and the existence of every protected native source. The original URL contract and approved redirects have not been reduced or replaced.

## Validation

- 106 SEO unit tests passed.
- 116 targeted metadata, taxonomy, article-card, middleware, telemedicine and video interpretation tests passed (the metadata tests overlap the SEO suite).
- Full build: 11,934 route HTML files, 11,910 indexable URLs; protected URL and metadata validation passed.
- Compared with the pre-recovery production sitemap: no prior URL removed.
- Compared with main before this change: all 410 existing Markdown files unchanged. All 3,670 added files match the previously validated translation workspace.
- Independent review confirmed 305 guides retain disease metadata and existing video/i18n/navigation files remain unchanged.

The import inventory committed here contains only the fields required for guide classification, without local source paths or drafting artifacts. No external translation or model API was used. Production verification is recorded separately after deployment.

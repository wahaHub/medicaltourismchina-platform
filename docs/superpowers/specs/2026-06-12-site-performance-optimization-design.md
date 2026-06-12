# Site Performance Optimization Design

Date: 2026-06-12

## Context

`medicaltourismchina-platform` is a Vite React single-page app deployed from `frontend-vercel` to `https://www.medicaltourismchina.health/`, fronted by Cloudflare and Vercel. The site is already deployed, but desktop page load feels slow on `https://www.medicaltourismchina.health/` and must also be optimized on `https://www.medicaltourismchina.health/telemedicine`.

The current evidence does not support "no CDN" as the main cause:

- `www.medicaltourismchina.health` resolves through Cloudflare.
- The root HTML is small, around 1.6 KB, and Vercel returns `x-vercel-cache: HIT`.
- The root HTML response is usually around 0.8-1.8s TTFB from the tested network.
- The main JavaScript asset is the dominant frontend bottleneck: `/assets/index-BoIvw4vv.js` is about 3.07 MB uncompressed and about 834 KB gzip-compressed.
- Repeated downloads of the compressed main JS took about 3.7-5.4s from the tested network.
- Cloudflare returned `MISS` or `REVALIDATED` for the hashed JS asset, not a stable edge `HIT`.
- Google Fonts requests were slow or timed out in the tested environment.
- `https://ipapi.co/country_code/` returned a Cloudflare challenge `403`, making first-visit language detection unreliable.
- `content.medicaltourismchina.health/departments?locale=zh` returned a small JSON response in about 2.6s and did not show strong CDN cache behavior.

The current frontend entrypoint pulls too much code into the first page load. `frontend-vercel/src/App.tsx` statically imports public pages, patient dashboard routes, hospital dashboard dependencies, chat components, authentication providers, and heavy supporting libraries. `frontend-vercel/src/i18n/translations/*.ts` also ships all six language files in the main app bundle; the translation source alone is about 1.43 MB.

The `/telemedicine` route has additional page-specific pressure:

- `frontend-vercel/src/pages/Telemedicine.tsx` is about 1,598 lines.
- It embeds large multi-language page copy directly in the page module.
- It statically imports the hero image plus expert, plan, and process images.
- Telemedicine image sources are individually about 204-400 KB and total several megabytes before downstream optimization.
- The hero image currently lacks explicit eager/fetch-priority handling, while below-the-fold image imports still become part of route dependency discovery.
- The page uses `ScrollReveal`, which should be checked for JavaScript and animation cost after route splitting.

## Goals

- Make the root page and `/telemedicine` feel fast on desktop without changing the core product behavior.
- Reduce initial JavaScript downloaded for the root page by splitting route, dashboard, chat, auth, and language payloads.
- Reduce `/telemedicine` route payload and improve image loading order.
- Make static hashed assets cache predictably at the CDN/browser layer.
- Remove or isolate slow third-party dependencies from the critical path.
- Add repeatable measurement so regressions are caught before deployment.
- Preserve existing SEO and GEO discovery flows while improving performance.

## Non-Goals

- Do not migrate the app from Vite to Next.js, Remix, Astro, or another rendering framework in this phase.
- Do not redesign the site visually.
- Do not remove patient, hospital, CRM, case-intake, or chat features.
- Do not change medical content claims or pricing logic except where content is moved into separate modules.
- Do not make Cloudflare-only tuning the sole fix; CDN prewarming cannot compensate for an oversized critical bundle.
- Do not remove, weaken, or bypass the existing SEO/GEO route, metadata, sitemap, robots, `llms.txt`, structured-data, or prerender/static-HTML plan.

## Performance Targets

Targets should be measured on production after deploy and on local preview builds before deploy.

| Surface | Metric | Target |
| --- | --- | --- |
| Root `/` | Initial gzip JS required before first render | Under 350 KB |
| Root `/` | Largest single JS chunk | Under 450 KB gzip |
| Root `/` | LCP on desktop production trace | Under 2.5s where network allows |
| Root `/` | Total Blocking Time | Under 200ms |
| Root `/` | External render-blocking font requests | 0 |
| `/telemedicine` | Initial route chunk gzip | Under 450 KB |
| `/telemedicine` | Hero image transfer | Under 150 KB at desktop display size |
| `/telemedicine` | Below-the-fold images | Lazy-loaded and not blocking LCP |
| Public content API GETs | Cacheable public list/detail endpoints | CDN/browser cache headers present |
| Static hashed assets | Cache policy | `public, max-age=31536000, immutable` |

## Architecture

Use the existing Vite React app and optimize the critical path in layers:

```text
Route shell
  -> minimal providers needed on public pages
  -> route-level lazy imports
  -> deferred chat/auth/dashboard modules
  -> dynamic language catalog loading
  -> page-specific image optimization
  -> CDN and HTTP cache policy
  -> measurement and bundle budgets
```

This keeps the current app architecture intact while stopping public visitors from downloading private dashboard, hospital workflow, all languages, and non-current routes before seeing the first page.

## SEO And GEO Compatibility

This performance work must be compatible with the existing SEO/GEO strategy documented in:

- `docs/superpowers/specs/2026-06-05-geo-conversion-stack-design.md`
- `docs/superpowers/plans/2026-06-05-geo-conversion-stack.md`
- `docs/superpowers/plans/2026-06-05-seo-keyword-expansion.md`

Performance changes must not treat the app as only a client-rendered SPA. The GEO plan explicitly requires approved GEO/SEO routes to expose route-specific crawlable HTML before React hydration.

This phase is **performance-only**. It must not publish, unpublish, merge, split, canonicalize, or otherwise resolve SEO/GEO discovery routes. The GEO and SEO documents currently contain overlapping route strategies that require a separate owner decision before route-publishing work begins.

Implementation boundary for this performance phase:

- Do not add, publish, prerender, sitemap, or list in `llms.txt` / `llms-full.txt` any GEO Phase 1B gated medical route, even if another SEO plan lists it as first-wave. This includes `/stem-cell-therapy-china`, `/autism-stem-cell-therapy-china`, `/parkinsons-stem-cell-therapy-china`, `/car-t-cell-therapy-china`, and `/bariatric-surgery-china`, unless medical/legal/content owners explicitly approve promotion.
- If the SEO keyword plan conflicts with the GEO gated policy, the GEO gated policy wins for this performance phase.
- Do not add or change publishing/canonical strategy for `/proton-therapy-china` or `/carbon-ion-therapy-china`. The approved GEO Phase 1A oncology answer page remains `/proton-carbon-ion-therapy-china` until a later SEO/GEO owner decision defines separate intent, canonical, and internal-link rules.
- Do not change the canonical role of `/all-on-4-all-on-6-dental-implants-china`. If later SEO work publishes `/all-on-4-dental-implants-china` or `/all-on-6-dental-implants-china`, that work must first define whether those are supporting pages or independent canonical pages, with explicit no-duplicate-content rules.
- Performance implementation may preserve existing routes and metadata, but it must not introduce new discovery routes or alter sitemap/`llms.txt` coverage as a side effect.

Required preservation rules:

- Do not remove approved SEO/GEO routes from `App.tsx` or route config during code splitting.
- Do not lazy-load a route in a way that causes crawlers or prerender/static HTML generation to receive only the generic SPA shell for approved SEO/GEO pages.
- Do not remove or duplicate canonical tags, route-specific titles, descriptions, Open Graph tags, Twitter card tags, or JSON-LD.
- Do not leave stale JSON-LD from a prior route after client-side navigation.
- Do not remove first-wave SEO/GEO URLs from `sitemap.xml`.
- Do not add draft, unapproved, or Phase 1B gated GEO URLs to `sitemap.xml`, `llms.txt`, or `llms-full.txt`.
- Do not change canonical strategy for overlapping pages such as `/telemedicine`, `/medical-second-opinion-china`, and `/china-medical-second-opinion` without checking the GEO and SEO specs. `/telemedicine` remains a service-detail page; `/medical-second-opinion-china` is the GEO answer target for remote China second opinion; `/china-medical-second-opinion` is the SEO keyword-expansion target for China medical second opinion / telemedicine secondary intent. Performance work must not merge, redirect, canonicalize, remove, or drop prerender/sitemap coverage for either approved discovery URL unless a later SEO/GEO owner explicitly resolves that route strategy.
- Do not block search or approved AI discovery crawlers through `robots.txt`, Cloudflare Managed Content Signals, or overly broad cache/security rules.
- Do not optimize away visible FAQ, quick-answer, trust, disclaimer, or CTA copy that is also represented in structured data.
- Structured data must describe visible page content only; performance refactors must keep JSON-LD and rendered copy sourced from the same content config or verified equivalent source.

SEO/GEO launch gates:

- `curl -sL <approved SEO/GEO URL>` must return route-specific title, description, canonical, H1 or quick-answer text, and JSON-LD without requiring client-side JavaScript.
- Each approved SEO/GEO route must have exactly one canonical tag and current `og:url`.
- `curl -sL https://www.medicaltourismchina.health/sitemap.xml` must still include approved launch URLs and exclude gated URLs.
- `curl -sL https://www.medicaltourismchina.health/robots.txt` must match the intended crawler policy after Cloudflare settings are applied.
- If `llms.txt` or `llms-full.txt` exists in the implementation branch, they must remain generated from the same approved GEO config and must not list unapproved pages.
- Performance budgets are not considered met if the route becomes faster by dropping crawlable metadata, structured data, sitemap coverage, or GEO answer content.

## Scope

### Root Page

Optimize `https://www.medicaltourismchina.health/` by reducing global app startup cost.

Primary files likely involved:

- `frontend-vercel/src/App.tsx`
- `frontend-vercel/src/main.tsx`
- `frontend-vercel/src/contexts/LanguageContext.tsx`
- `frontend-vercel/src/i18n/index.ts`
- `frontend-vercel/src/i18n/translations/*.ts`
- `frontend-vercel/src/components/chat/ChatWidget.tsx`
- `frontend-vercel/src/components/messaging/PatientMessagePanel.tsx`
- `frontend-vercel/src/contexts/AuthContext.tsx`
- `frontend-vercel/src/contexts/PatientAuthContext.tsx`
- `frontend-vercel/index.html`
- `frontend-vercel/src/index.css`
- `frontend-vercel/vercel.json`
- `content-api/index.mjs`
- `content-api/handlers/*.mjs`

### Telemedicine Page

Optimize `https://www.medicaltourismchina.health/telemedicine` as a route-level performance project.

Primary files likely involved:

- `frontend-vercel/src/pages/Telemedicine.tsx`
- `frontend-vercel/src/pages/telemedicine/telemedicineCopy.ts` or equivalent new module
- `frontend-vercel/src/pages/telemedicine/telemedicineImages.ts` or equivalent new module
- `frontend-vercel/src/components/animations/ScrollReveal.tsx`
- `frontend-vercel/src/img/online-consultation-doctor.jpg`
- `frontend-vercel/src/img/telemedicine-*.jpg`
- `frontend-vercel/vite.config.ts`

## Recommended Implementation Plan

### Phase 1: Establish Baseline And Budgets

- Add a repeatable measurement script for root and `/telemedicine`.
- Capture current production and local preview values for:
  - HTML TTFB.
  - JS/CSS transfer size.
  - Number of requests.
  - LCP candidate and image source.
  - Total Blocking Time or main-thread long tasks.
  - CDN cache headers for HTML, JS, CSS, images, and public API endpoints.
- Add bundle visualization or static chunk-size reporting after `npm run build`.
- Fail CI or at least print warnings when the main initial chunk exceeds the agreed budget.

Acceptance:

- A single command documents root and `/telemedicine` performance before and after the work.
- Build output clearly shows initial chunks and route chunks.

### Phase 2: Route-Level Code Splitting

- Convert page imports in `frontend-vercel/src/App.tsx` to `React.lazy`.
- Add a shared route fallback that is visually small and does not cause layout shift.
- Keep the root page import as small as practical; load other public routes only when matched.
- Lazy-load private/dashboard/hospital/case-intake pages behind their routes.
- Ensure route-level splitting does not break scroll restoration, route guards, or 404 handling.
- Preserve SEO/GEO route registration and static/prerender HTML generation for approved SEO/GEO pages.
- If a prerender/static HTML route list exists, it must be generated from the same route/config source as the React routes or covered by parity tests.

Acceptance:

- The root route no longer includes all public pages in the first JS chunk.
- `/dashboard`, `/medical-case-intake`, hospital dashboard, and auth-heavy routes are separate chunks.
- `npm run build` produces multiple route chunks instead of one dominant app bundle.
- Approved SEO/GEO routes still return route-specific static/prerendered HTML before hydration.

### Phase 3: Defer Public-Page Noncritical Runtime

- Move `ChatWidget` and `PatientMessagePanel` out of the root critical path.
- Load chat after idle time, after a short delay, or after user intent depending on business preference.
- Avoid bootstrapping patient-session refresh logic on public pages unless a restore token exists.
- Avoid initializing Supabase/Auth heavy paths for anonymous public visitors before first paint.
- Keep visible conversion CTAs intact, especially links to `/medical-case-intake` and quote flows.
- Preserve the existing patient/session contract:
  - Anonymous public-page visits should render without patient auth work on the critical path.
  - Logged-in patient visits to public pages must still recognize the session after deferred auth loads.
  - Restore-token flows must still run before protected dashboard content is shown.
  - Existing chat/widget conversations must still restore when the widget or panel opens.
  - Direct dashboard refresh must still bootstrap patient session state before dashboard data loads.

Acceptance:

- Anonymous visits to `/` and `/telemedicine` do not download patient dashboard or hospital dashboard dependencies in the initial chunk.
- Chat still appears and works after deferred loading.
- Existing patient restore-token, logged-in public-page, existing chat session, and dashboard-refresh behavior remains covered by tests.

### Phase 4: Dynamic Language Loading

- Replace eager imports of all translation dictionaries with dynamic imports by active locale.
- Keep a minimal fallback dictionary or default-language critical copy available so the app can render immediately.
- Persist selected language as today.
- Remove first-paint dependency on `ipapi.co`.
- If location-based language detection remains, run it after initial render with a short timeout and no blocking loading state.
- Prefer browser language and saved language for initial render.
- Keep the public `t(key, params, locale)` contract synchronous. Do not make render-time translation calls return promises or empty placeholders.
- Load dictionaries asynchronously into provider/module state, then expose the currently available dictionary synchronously.
- Missing or not-yet-loaded keys must fall back deterministically: selected locale -> English or Chinese fallback -> key string.
- Language switching must not unmount the current page, close chat, reset forms, clear patient-entry state, or blank visible content while a locale chunk loads.

Acceptance:

- Initial root page load includes only the current or fallback language, not all six translation files.
- A failed `ipapi.co` call cannot block rendering.
- Language switching still works for `en`, `zh`, `es`, `fr`, `de`, and `ru`.
- Missing-key behavior is covered by a regression test.

### Phase 5: Font Optimization

- Remove duplicate Google Fonts loading from `frontend-vercel/index.html` and `frontend-vercel/src/index.css`.
- Prefer system font stacks or self-hosted WOFF2 files.
- If self-hosting is used, preload only the critical regular/semibold weights required above the fold.
- Ensure `font-display: swap` is used.

Acceptance:

- Root and `/telemedicine` have zero render-blocking requests to `fonts.googleapis.com` or `fonts.gstatic.com`.
- Typography remains visually acceptable.

### Phase 6: Static Asset Cache Policy

- Configure Vercel headers for hashed assets under `/assets/*`.
- Use immutable long-lived cache for hashed JS/CSS/images.
- Keep HTML revalidation conservative so deployments are picked up quickly.
- Confirm Cloudflare does not override hashed asset caching with frequent revalidation.
- If necessary, add a Cloudflare Cache Rule for `/assets/*`.

Recommended policy:

```json
{
  "source": "/assets/(.*)",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=31536000, immutable"
    }
  ]
}
```

Acceptance:

- `curl -I https://www.medicaltourismchina.health/assets/<hash>.js` returns immutable long-lived cache headers.
- Repeated asset requests show stable CDN cache behavior.

### Phase 7: Public Content API Caching

- Identify public read-only endpoints used by public pages and add caching by explicit allowlist, not by broad route pattern.
- Initial cache allowlist candidates:
  - `GET /departments`
  - `GET /departments/:slug/capability`
  - `GET /departments/:slug/diseases`
  - `GET /diseases/:slug/procedures`
  - `GET /procedures`
  - `GET /procedures/:slug`
  - `GET /featured-treatments`
  - `GET /featured-treatments/type/:type`
  - `GET /featured-treatments/:slug`
- Keep hospital and package endpoints uncached by default until each route is separately reviewed for freshness and privacy.
- Do not cache `GET /hospitals/:slug/extended` or `GET /hospitals/:slug/packages/:packageSlug` unless a later audit confirms the CRM-aggregated package, price, status, and review data can safely be cached.
- Add `Cache-Control` headers for public GET responses.
- Use `s-maxage` and `stale-while-revalidate` for CDN caching.
- Keep authenticated, patient, CRM, booking, and write endpoints uncached.
- Only cache successful `200` responses.
- Never cache requests or responses with `Authorization`, `Cookie`, patient/session tokens, or user-specific payloads.
- Cache keys must include full path, query string, locale, and any other request parameter that changes response content.

Recommended policy for public read endpoints:

```text
Cache-Control: public, max-age=60, s-maxage=600, stale-while-revalidate=86400
```

Acceptance:

- Public GET endpoints return explicit cache headers.
- Cacheable routes are listed in code or config as an allowlist.
- Private/authenticated endpoints do not become cacheable.
- Hospital extended/package endpoints remain uncached unless a separate audit explicitly opts them in.
- Public API TTFB improves after CDN warmup.

### Phase 8: Telemedicine Route Optimization

- Split `Telemedicine.tsx` into smaller modules:
  - page component
  - localized copy/data
  - plan cards
  - expert cards
  - process section
  - FAQ/final CTA
- Move large telemedicine copy into locale-specific dynamic modules.
- Choose one source of truth for Telemedicine copy. Prefer route-local dynamic copy for the rewritten page, or use a global i18n namespace, but do not keep active page copy in both places.
- If route-local dynamic copy becomes the source of truth, remove unused global `telemedicine.*` keys or mark them deprecated with tests proving the page no longer reads them.
- If global i18n remains the source of truth, split that namespace dynamically instead of creating a parallel `telemedicineCopy.ts`.
- Preserve the SEO/GEO relationship between `/telemedicine` and `/medical-second-opinion-china`:
  - `/telemedicine` remains the service-detail route for online consultation.
  - `/medical-second-opinion-china` remains the GEO answer target for China second-opinion intent.
  - `/china-medical-second-opinion` remains the SEO keyword-expansion target where that SEO plan is implemented.
  - Keep or add contextual links between the two where the GEO plan expects them.
  - Do not canonicalize `/telemedicine` to `/medical-second-opinion-china`, `/medical-second-opinion-china` to `/china-medical-second-opinion`, or either discovery URL to the other unless the SEO/GEO owner explicitly approves that intent change.
- Keep only the selected locale copy in the route chunk.
- Convert below-the-fold image loading to use URLs or dynamic imports that do not inflate critical route startup.
- Optimize the hero image:
  - Generate modern formats if the pipeline supports it.
  - Provide stable width/height or aspect-ratio.
  - Mark the hero image eager with high fetch priority if it is the LCP image.
  - Keep below-the-fold images `loading="lazy"` and `decoding="async"`.
- Consider a small `srcset` or responsive image helper for telemedicine assets.
- Check `ScrollReveal` for unnecessary work on initial render; disable or simplify animation when `prefers-reduced-motion` is enabled.

Acceptance:

- `/telemedicine` has its own route chunk and no longer lives in the root initial JS.
- `/telemedicine` does not load all locale copy before first render.
- The hero image is the only image prioritized above the fold.
- Below-the-fold expert, plan, and process images do not compete with LCP.
- The page still displays the same content and conversion CTAs.
- `/telemedicine` retains its intended title, canonical, service-detail content, internal links to relevant GEO pages, and any SEO/GEO metadata already required by the GEO plan.

### Phase 9: Image Compression

- Audit `frontend-vercel/src/img` and `frontend-vercel/dist/assets` for images over 200 KB.
- Re-encode telemedicine and treatment images to WebP or AVIF where supported by the build/deploy pipeline.
- Keep source originals if needed, but ship compressed derivatives.
- Avoid visual degradation on medical/trust imagery.

Acceptance:

- Telemedicine hero transfer is under 150 KB at desktop display size.
- Below-the-fold telemedicine images are preferably under 120 KB each.
- Existing alt text remains intact.

### Phase 10: Verification And Release

- Run unit tests for language switching, route rendering, auth restore behavior, and telemedicine rendering.
- Run SEO/GEO route, metadata, sitemap, robots, and structured-data tests from the GEO/SEO plans if they exist in the branch.
- Run production build.
- Run local preview and test:
  - `/`
  - `/telemedicine`
  - `/dashboard`
  - `/medical-case-intake`
  - `/hospitals`
  - `/hospitals/:slug`
  - language switching
  - chat open and handoff flows
- Run the regression smoke matrix:
  - anonymous visitor opens `/` and `/telemedicine`
  - logged-in patient opens `/` and `/telemedicine`
  - visitor with restore token opens `/dashboard`
  - existing chat/widget session restores after deferred load
  - dashboard direct refresh bootstraps before protected data renders
  - chat handoff, panel open, panel close, and mobile chat display still work
- Run the SEO/GEO smoke matrix:
  - approved SEO/GEO URLs return route-specific HTML with title, description, canonical, quick-answer/H1 text, and JSON-LD before hydration
  - both second-opinion discovery URLs remain covered when present: `/medical-second-opinion-china` from the GEO plan and `/china-medical-second-opinion` from the SEO keyword-expansion plan
  - overlapping service/GEO pages keep their intended canonical strategy and internal links
  - sitemap contains approved URLs and excludes gated URLs
  - robots.txt reflects intended crawler policy after Cloudflare settings
  - `llms.txt` and `llms-full.txt`, if present, contain only approved GEO URLs
  - client-side navigation replaces stale SEO/GEO JSON-LD instead of accumulating duplicates
- Deploy to preview.
- Measure preview against the baseline.
- Deploy production only when root and `/telemedicine` meet or clearly improve toward the performance targets.

Acceptance:

- Root and `/telemedicine` are faster by measured JS transfer and LCP/TBT indicators.
- No route, auth, chat, or case-intake regression is found in smoke tests.
- No SEO/GEO metadata, prerender/static HTML, sitemap, robots, `llms.txt`, canonical, JSON-LD, or internal-link regression is found.
- Cache headers are confirmed on production.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Route splitting breaks route guards or providers | Add smoke tests for dashboard, patient login, and case-intake restore-token paths. |
| Route splitting breaks SEO/GEO static HTML or route metadata | Keep route/config parity tests and verify approved SEO/GEO URLs with `curl -sL` before deploy. |
| Dynamic language loading causes flashes or missing text | Keep a small default fallback and test all supported locales. |
| Deferring chat hurts conversion | Load chat after idle/delay rather than removing it; keep CTA links visible immediately. |
| CDN cache rules serve stale app shell | Only use immutable cache for hashed `/assets/*`; keep HTML revalidation short. |
| Public API caching leaks private data | Cache only audited public GET endpoints; never cache patient/CRM/auth/write endpoints. |
| Telemedicine image compression hurts trust visuals | Review desktop and mobile screenshots before shipping. |
| Performance changes weaken GEO answer quality | Keep visible quick-answer, FAQ, trust, disclaimer, CTA, and JSON-LD content aligned with the GEO config. |

## Measurement Commands

Use these as starting points during implementation.

```bash
curl -L -s -o /tmp/mtc-home.html -w 'url=%{url_effective}\nhttp=%{http_code}\nttfb=%{time_starttransfer}\ntotal=%{time_total}\nsize=%{size_download}\n' https://www.medicaltourismchina.health/
```

```bash
ENTRY_JS=$(curl -L -s https://www.medicaltourismchina.health/ \
  | perl -ne 'print $1 if /<script[^>]+src="([^"]+index-[^"]+\.js)"/')
curl --compressed -L -s -o /dev/null -D - \
  -w 'asset='"$ENTRY_JS"'\nhttp=%{http_code}\nttfb=%{time_starttransfer}\ntotal=%{time_total}\nsize=%{size_download}\n' \
  "https://www.medicaltourismchina.health$ENTRY_JS"
```

```bash
npm run build
```

```bash
npm run preview
```

## Definition Of Done

- The root page and `/telemedicine` have measured before/after results.
- The root page no longer downloads the whole application before first render.
- `/telemedicine` is route-split and has optimized image priority.
- Google Fonts and `ipapi.co` are not blocking first render.
- Static hashed assets are served with immutable long-lived cache headers.
- Public content API GET endpoints have safe CDN cache headers.
- Smoke tests pass for public routes, private routes, language switching, chat, and case intake.
- SEO/GEO tests or smoke checks pass for approved routes, canonical tags, metadata, JSON-LD, sitemap, robots, `llms.txt`/`llms-full.txt` when present, and service-to-GEO internal links.

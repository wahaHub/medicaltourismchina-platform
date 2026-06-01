# Medical Tourism China Frontend Vercel Bundle

This folder is a standalone Vite frontend copy intended to be used as the Vercel project root.

It is intentionally separate from the original `china-medical-journeys` app root. R2 and the new content API are wired only in this bundle.

## Environment

Configure these in Vercel:

```dotenv
VITE_CONTENT_API_BASE_URL=https://medicaltourismchina-content-worker.contact-82c.workers.dev
VITE_ACTION_API_BASE_URL=https://medicaltourismchina-content-worker.contact-82c.workers.dev
VITE_CRM_API_BASE_URL=https://crmapi.medicaltourismchina.health
VITE_PUBLIC_MEDIA_BASE_URL=https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev
VITE_SUPABASE_URL=https://jjlrlwopsdmxkqyjshuc.supabase.co
VITE_SUPABASE_ANON_KEY=<vercel-secret>
VITE_DISABLE_SUPABASE=false
VITE_HOSPITAL_SITE_FILTER=
```

When `media.medicaltourismchina.health` is ready, change only `VITE_PUBLIC_MEDIA_BASE_URL`.

`VITE_CONTENT_API_BASE_URL` is for read-only public content and can point at the Cloudflare Worker. `VITE_ACTION_API_BASE_URL` points at the same Worker HTTPS origin; the Worker proxies only the write/email/CRM action routes to the Lightsail content API so browser requests avoid mixed-content blocking.

## Local Build

```bash
npm install
npm run build
```

## Route Scope

The public frontend keeps the marketing/site routes, hospital listing/detail pages, treatments, work-with-us pages, quote/case intake entry points, and chat widget.

The migration bundle does not ship public routes for old admin surfaces:

- `/login`
- `/hospital/*`
- `/auth`
- `/dashboard`
- `/dashboard/*`

Some unused source files from the original app remain in the copy so the bundle can be compared against upstream easily, but those routes are no longer registered in `src/App.tsx`.

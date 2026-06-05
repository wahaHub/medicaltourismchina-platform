# MedicalTourismChina Migration Bundle

This bundle is built from the `main` branch on `codex/migration-bundle-r2`.

It is a local migration sandbox, not the production frontend. The current app source remains unchanged. R2 is configured here for the migration handoff and smoke checks.

## Local Pieces

- `content-worker/`: Cloudflare Worker for read-only public content routes.
- `content-api/`: Lightsail Node container for write/email/CRM routes and as the fallback full API.
- `frontend-vercel/`: Vite frontend bundle ready to use as the Vercel project root.
- `scripts/`: R2 and smoke helpers.
- `sql/`: current Supabase schema snapshot.

## R2

Use the current public R2 URL:

```text
https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev
```

The uploaded assets live under:

```text
/low/...
```

## Target Architecture

- Public read routes (`/departments`, `/hospitals`, `/procedures`, `/featured-treatments`) can run on Cloudflare Workers.
- Mutating routes (`/booking-requests`, `/case-intakes/token-submit`, `/partnership-applications`, `/featured-treatments/:slug/track`) stay on the Lightsail API because they send email, create CRM data, or mutate state.
- Static/media image URLs point at R2 through `VITE_PUBLIC_MEDIA_BASE_URL`.
- The Vercel frontend uses `VITE_CONTENT_API_BASE_URL` for read routes and `VITE_ACTION_API_BASE_URL` for write routes.

Current Worker URL:

```text
https://content.medicaltourismchina.health
```

## Run Worker Locally

```bash
cd migration-bundle/content-worker
cp .dev.vars.example .dev.vars
npm install
npm run check
npx wrangler dev --local --ip 127.0.0.1 --port 8788
```

Smoke/parity from the bundle root:

```bash
CONTENT_API_BASE_URL=http://127.0.0.1:8788 bash scripts/smoke-content-api.sh
NEW_CONTENT_API_BASE_URL=http://127.0.0.1:8788 node scripts/compare-content-api.mjs
```

## Run Lightsail API Locally

```bash
cd migration-bundle/content-api
npm install
npm start
```

The server loads env from `content-api/.env.local`, parent `.env.local` files, or `MIGRATION_CONTENT_API_ENV_FILE`.

Smoke test:

```bash
CONTENT_API_BASE_URL=http://127.0.0.1:8787 ../scripts/smoke-content-api.sh
```

## What Is Not Included

- Old AWS deployment scripts.
- Old `centers`, `consultations`, `quotes`, `webhooks`, `user`, and auth middleware routes.
- `node_modules`, Lambda zip files, Terraform state, or Medplum deployment material.

# Medical Tourism China Content Worker

Cloudflare Worker bundle for read-only public content API routes.

This is intentionally narrower than `../content-api`: it serves low-cost public reads from Supabase and R2-backed image URLs, while write/email/CRM actions stay on the Lightsail API.

## Routes

- `GET /health`
- `GET /departments`
- `GET /departments/:slug/capability`
- `GET /departments/:slug/diseases`
- `GET /diseases/:slug/procedures`
- `GET /procedures`
- `GET /procedures/:slug`
- `GET /hospitals`
- `GET /hospitals/:slug`
- `GET /hospitals/:slug/extended`
- `GET /hospitals/:slug/packages/:packageSlug`
- `GET /featured-treatments`
- `GET /featured-treatments/type/:type`
- `GET /featured-treatments/:slug`

The Worker does not expose:

- `POST /booking-requests`
- `POST /case-intakes/token-submit`
- `POST /partnership-applications`
- `POST /featured-treatments/:slug/track`

Those stay in `../content-api` because they send email, create CRM records, or mutate data.

## Secrets

Set the Supabase service role as a Worker secret:

```bash
cd migration-bundle/content-worker
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Optional CRM secrets are only needed if `GET /hospitals/:slug/extended` and package detail should include CRM-backed package/review data:

```bash
npx wrangler secret put CRM_SUPABASE_URL
npx wrangler secret put CRM_SUPABASE_SERVICE_ROLE_KEY
```

## Local Test

```bash
cd migration-bundle/content-worker
cp .dev.vars.example .dev.vars
npm install
npm run check
npx wrangler dev --local --ip 127.0.0.1 --port 8788
```

Then from the migration bundle root:

```bash
CONTENT_API_BASE_URL=http://127.0.0.1:8788 bash scripts/smoke-content-api.sh
NEW_CONTENT_API_BASE_URL=http://127.0.0.1:8788 node scripts/compare-content-api.mjs
```

## Deploy

R2 S3 access keys are not enough for Worker deploys. Wrangler needs either:

- an authenticated `wrangler login`, or
- `CLOUDFLARE_API_TOKEN` with permission to edit Workers in the target account.

After auth and secrets:

```bash
cd migration-bundle/content-worker
npm run deploy
```

Current deployed Worker URL:

```text
https://medicaltourismchina-content-worker.contact-82c.workers.dev
```

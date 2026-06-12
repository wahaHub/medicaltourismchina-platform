# Deployment Scripts

This folder contains operational scripts for the standalone MedicalTourismChina platform repo.

## Unified Deploy

Use `deploy_platform.py` as the default deployment entrypoint:

```bash
python3 scripts/deploy_platform.py --targets frontend
```

The script runs from the repo root and can deploy one or more components.

## Token-Based Ops Helper

Use `ops_platform.py` when a teammate wants to deploy or read logs with tokens
instead of interactive dashboard login.

It reads tokens from environment variables:

```bash
export VERCEL_TOKEN="..."
export VERCEL_SCOPE="medora-beautys-projects"

export CLOUDFLARE_API_TOKEN="..."
export CLOUDFLARE_ACCOUNT_ID="82cdbf36c265c0d9e4b4e1c6100c26d7"
```

The Vercel project is linked in `frontend-vercel/.vercel/project.json`:

- project: `frontend-vercel`
- org/team id: `team_ty00kcdSND6uqBEDQWpft0Zf`

The Cloudflare Worker is linked in `content-worker/wrangler.toml`:

- account id: `82cdbf36c265c0d9e4b4e1c6100c26d7`
- worker name: `medicaltourismchina-content-worker`

Verify tokens first:

```bash
python3 scripts/ops_platform.py vercel-whoami
python3 scripts/ops_platform.py vercel-list --environment production

python3 scripts/ops_platform.py cf-token-verify
python3 scripts/ops_platform.py worker-deployments
```

Deploy the Vercel frontend with `VERCEL_TOKEN`:

```bash
python3 scripts/ops_platform.py vercel-deploy
```

Deploy the Cloudflare Worker with `CLOUDFLARE_API_TOKEN`:

```bash
python3 scripts/ops_platform.py worker-deploy
```

Read logs:

```bash
python3 scripts/ops_platform.py vercel-list --environment production
python3 scripts/ops_platform.py vercel-logs <deployment-url-or-id>

python3 scripts/ops_platform.py worker-tail --format pretty
```

Optional Lightsail logs:

```bash
# content-api Docker logs, if that optional service is deployed
python3 scripts/ops_platform.py content-api-logs \
  --content-api-host <lightsail-host-or-ip> \
  --content-api-ssh-key /path/to/LightsailDefaultKey-us-west-2.pem \
  --since 30m

# CRM API journalctl logs through the sibling medical-crm-v2 repo
python3 scripts/ops_platform.py crm-logs \
  --crm-ssh-key /path/to/LightsailDefaultKey-us-west-2.pem \
  --since 30
```

Smoke-test the deployed content Worker/API:

```bash
python3 scripts/ops_platform.py content-smoke
```

You can also delegate to the existing deployment script:

```bash
python3 scripts/ops_platform.py deploy-platform --targets frontend,content-worker --allow-dirty
```

Notes:

- The old Vercel and Cloudflare tokens from screenshots were not valid in API
  checks. Regenerate or recopy them before handing this to a teammate.
- `worker-tail` uses Wrangler and may require a token with Workers read/tail
  permissions. If tail fails but deploy works, use Cloudflare dashboard logs or
  adjust the API token permissions.

## Targets

- `frontend`: deploys `frontend-vercel/` to Vercel.
- `content-worker`: checks and deploys `content-worker/` to Cloudflare Workers.
- `content-api`: deploys `content-api/` to Lightsail using `content-api/scripts/deploy-lightsail.sh`.
- `crm-api`: deploys the sibling CRM API repo using `medical-crm-v2/scripts/deploy_v2.py`.
- `all`: runs `frontend`, `content-worker`, `content-api`, and `crm-api` in that order.

Aliases:

- `worker` means `content-worker`.
- `api` means `content-api`.
- `crm` means `crm-api`.

## Common Commands

Deploy only the Vercel frontend:

```bash
python3 scripts/deploy_platform.py --targets frontend
```

Deploy frontend plus the Cloudflare content worker:

```bash
python3 scripts/deploy_platform.py --targets frontend,content-worker
```

## Hospital Source And Media Inventory

Use `hospital_source_media_inventory.mjs` before changing hospital slugs, media paths, or read-model ownership. It is read-only: it queries China Supabase and, when configured, CRM Supabase, then writes a JSON report showing which hospitals are split across China public tables, CRM hospital/materials tables, low fallback media, legacy S3/CloudFront media, and R2 media.

Required China Supabase env:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Optional CRM env, needed to detect CRM `hospitals`, `hospital_material_packages`, and `hospital_material_reviews` coverage:

```bash
CRM_SUPABASE_URL=...
CRM_SUPABASE_SERVICE_ROLE_KEY=...
```

Generate an inventory artifact:

```bash
SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
CRM_SUPABASE_URL=... \
CRM_SUPABASE_SERVICE_ROLE_KEY=... \
node scripts/hospital_source_media_inventory.mjs \
  --locale zh \
  --limit 500 \
  --out artifacts/hospital_source_media_inventory.json
```

Optionally sample-check media URLs:

```bash
node scripts/hospital_source_media_inventory.mjs \
  --locale zh \
  --limit 500 \
  --check-images \
  --image-sample-limit 5 \
  --image-timeout-ms 8000 \
  --out artifacts/hospital_source_media_inventory.json
```

Key fields in the report:

- `sources`: whether a hospital exists in China summary/detail/source table and CRM hospital/material tables.
- `counts`: gallery, surgeons, equipment, procedure cases, reviews, and CRM package/review counts.
- `media.summary.bySource`: distribution across R2, R2 low fallback, R2 hospital photos, legacy S3/CloudFront, CRM storage keys, and other HTTP media.
- `warnings`: likely migration risks such as legacy media references, missing CRM hospital row, missing detail row, or rich detail that exists outside CRM materials.

Generate a deterministic media migration manifest from a full inventory:

```bash
node scripts/hospital_source_media_inventory.mjs \
  --locale zh \
  --limit 500 \
  --image-sample-limit 1000 \
  --out artifacts/hospital_source_media_inventory.zh.full-media.json

node scripts/hospital_media_migration_manifest.mjs \
  --inventory artifacts/hospital_source_media_inventory.zh.full-media.json \
  --candidates data/hospital_slug_migration_candidates.json \
  --out data/hospital_media_migration_manifest.json
```

The manifest does not upload files or write database rows. It maps each unique source URL for confirmed slug-migration hospitals to the intended public R2 key/URL so the copy/reupload and read-model update can be reviewed before execution.

Deploy the CRM API to Lightsail:

```bash
python3 scripts/deploy_platform.py \
  --targets crm-api \
  --crm-ssh-key ~/Downloads/LightsailDefaultKey-us-west-2.pem \
  --crm-allow-dirty
```

Deploy the optional `content-api` container to Lightsail:

```bash
python3 scripts/deploy_platform.py \
  --targets content-api \
  --content-api-host <lightsail-host-or-ip> \
  --content-api-env-file <local-env-file> \
  --content-api-ssh-key <ssh-key>
```

Dry-run a full deployment plan:

```bash
python3 scripts/deploy_platform.py \
  --targets all \
  --dry-run \
  --allow-dirty \
  --content-api-host <lightsail-host-or-ip> \
  --content-api-env-file <local-env-file> \
  --crm-ssh-key ~/Downloads/LightsailDefaultKey-us-west-2.pem \
  --crm-allow-dirty
```

## Important Options

- `--targets`: comma-separated target list. Default is `frontend`.
- `--allow-dirty`: allow deployment while this platform repo has uncommitted changes.
- `--dry-run`: print commands without executing them.
- `--vercel-scope`: Vercel team/scope. Default is `medora-beautys-projects`.
- `--content-api-host`: Lightsail host/IP for `content-api`.
- `--content-api-env-file`: local env file copied to `content-api` remote as `.env`.
- `--content-api-ssh-key`: SSH key for the `content-api` host.
- `--crm-repo`: path to the CRM repo. Default is `../medical-crm-v2`.
- `--crm-branch`: CRM branch deployed by `deploy_v2.py`. Default is `feature/phase-2bc`.
- `--crm-ssh-key`: SSH key for CRM API Lightsail deployment.
- `--crm-allow-dirty`: passes `--allow-dirty` through to the CRM deployment script.

## Preconditions

For `frontend`:

- Vercel CLI is installed and logged into the `medora-beautys-projects` scope.
- `frontend-vercel/.vercel/project.json` points to the intended Vercel project.

For `content-worker`:

- `npm install` has been run in `content-worker/`.
- Wrangler is logged in.
- Cloudflare secrets required by the worker are already configured.

For `content-api`:

- The Lightsail host is reachable by SSH.
- Docker or Docker Compose is available on the remote host.
- The env file supplied by `--content-api-env-file` contains required runtime variables.

For `crm-api`:

- The CRM repo exists at `--crm-repo`.
- The SSH key can access the CRM API Lightsail host.
- The CRM remote `.env` is already present on that server.

## Notes

- The script refuses to deploy from a dirty platform repo unless `--allow-dirty` is supplied.
- `content-api` and `crm-api` require explicit environment/SSH inputs because those targets mutate remote servers.
- The script intentionally delegates to each component's existing deploy command instead of duplicating low-level deployment logic.

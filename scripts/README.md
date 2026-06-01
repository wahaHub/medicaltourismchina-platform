# Deployment Scripts

This folder contains operational scripts for the standalone MedicalTourismChina platform repo.

## Unified Deploy

Use `deploy_platform.py` as the default deployment entrypoint:

```bash
python3 scripts/deploy_platform.py --targets frontend
```

The script runs from the repo root and can deploy one or more components.

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

# Content API Lightsail Deploy

This folder is the Docker deploy target for the public Medical Tourism China content API.

## Required Host Setup

- A Lightsail instance with Docker and Docker Compose.
- SSH access from this machine.
- A reverse proxy such as nginx or Caddy.
- DNS for the API hostname pointing to the Lightsail instance.
- Firewall open for HTTP/HTTPS. The container port can stay bound to `127.0.0.1`.

Recommended hostname:

```text
api.medicaltourismchina.health
```

## Runtime Env

Create a local env file outside the repository, then pass it to the deploy script with `LIGHTSAIL_ENV_FILE`.

```dotenv
SUPABASE_URL=https://jjlrlwopsdmxkqyjshuc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-secret>
CRM_SUPABASE_URL=
CRM_SUPABASE_SERVICE_ROLE_KEY=
PORT=8787
HOST=0.0.0.0
ALLOWED_ORIGINS=https://medicaltourismchina.health,https://www.medicaltourismchina.health,https://*.vercel.app,http://localhost:3000,http://127.0.0.1:3000
PUBLIC_MEDIA_BASE_URL=https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev
DEBUG_LOGS=false
```

Do not commit the env file.

## Deploy

```bash
export LIGHTSAIL_HOST=<ip-or-host>
export LIGHTSAIL_USER=ubuntu
export LIGHTSAIL_REMOTE_DIR=/opt/medicaltourismchina-content-api
export LIGHTSAIL_ENV_FILE=/absolute/path/to/content-api.env

./scripts/deploy-lightsail.sh
```

The script copies this folder to the host, uploads the env file as `.env`, runs `docker compose up -d --build`, and checks `/health` on the host.

## Reverse Proxy

Example nginx server block:

```nginx
server {
    listen 80;
    server_name api.medicaltourismchina.health;

    location / {
        proxy_pass http://127.0.0.1:8787;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Terminate TLS with Certbot, Caddy, or your existing host-level TLS setup.

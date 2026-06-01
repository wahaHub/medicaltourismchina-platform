#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

: "${LIGHTSAIL_HOST:?Set LIGHTSAIL_HOST to the Lightsail IP or hostname}"
: "${LIGHTSAIL_USER:=ubuntu}"
: "${LIGHTSAIL_REMOTE_DIR:=/opt/medicaltourismchina-content-api}"
: "${LIGHTSAIL_ENV_FILE:?Set LIGHTSAIL_ENV_FILE to a local content-api env file}"

if [[ ! -f "$LIGHTSAIL_ENV_FILE" ]]; then
  echo "LIGHTSAIL_ENV_FILE does not exist: $LIGHTSAIL_ENV_FILE" >&2
  exit 1
fi

REMOTE="${LIGHTSAIL_USER}@${LIGHTSAIL_HOST}"
SSH_OPTS=()
RSYNC_SSH=(ssh)

if [[ -n "${SSH_KEY:-}" ]]; then
  SSH_OPTS=(-i "$SSH_KEY")
  RSYNC_SSH=(ssh -i "$SSH_KEY")
fi

ssh "${SSH_OPTS[@]}" "$REMOTE" "sudo mkdir -p '$LIGHTSAIL_REMOTE_DIR' && sudo chown -R '$LIGHTSAIL_USER':'$LIGHTSAIL_USER' '$LIGHTSAIL_REMOTE_DIR'"
rsync -az --delete \
  -e "${RSYNC_SSH[*]}" \
  --exclude node_modules \
  --exclude .env \
  --exclude .env.local \
  --exclude npm-debug.log \
  "$ROOT_DIR"/ "$REMOTE":"$LIGHTSAIL_REMOTE_DIR"/

scp "${SSH_OPTS[@]}" "$LIGHTSAIL_ENV_FILE" "$REMOTE":"$LIGHTSAIL_REMOTE_DIR/.env"

ssh "${SSH_OPTS[@]}" "$REMOTE" "cd '$LIGHTSAIL_REMOTE_DIR' && if docker compose version >/dev/null 2>&1; then docker compose up -d --build; else set -a && . ./.env && set +a && docker build -t medicaltourismchina-content-api:latest . && docker rm -f medicaltourismchina-content-api >/dev/null 2>&1 || true && docker run -d --name medicaltourismchina-content-api --restart unless-stopped --env-file .env -p 127.0.0.1:\${PORT:-8787}:\${PORT:-8787} medicaltourismchina-content-api:latest; fi"
ssh "${SSH_OPTS[@]}" "$REMOTE" "cd '$LIGHTSAIL_REMOTE_DIR' && set -a && . ./.env && set +a && curl -fsS http://127.0.0.1:\${PORT:-8787}/health"

echo "Content API deployed to ${REMOTE}:${LIGHTSAIL_REMOTE_DIR}"

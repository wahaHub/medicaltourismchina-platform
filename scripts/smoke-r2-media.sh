#!/usr/bin/env bash
set -euo pipefail

PUBLIC_MEDIA_BASE_URL="${PUBLIC_MEDIA_BASE_URL:-https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev}"
BASE="${PUBLIC_MEDIA_BASE_URL%/}"

check() {
  local path="$1"
  local status
  status="$(curl -sS -o /dev/null -w "%{http_code}" "${BASE}${path}")"
  if [[ "$status" != "200" ]]; then
    echo "FAIL ${path}: HTTP ${status}" >&2
    exit 1
  fi
  echo "OK ${path}"
}

check "/low/airport-pickup/pickup-icon_x1.png"
check "/low/department/06685af5-9e64-4f12-956e-bfbdec4d5bbb_x2.png"
check "/low/Medora%20Health-logo/logo-1_x1.png"

#!/usr/bin/env bash
set -euo pipefail

CONTENT_API_BASE_URL="${CONTENT_API_BASE_URL:-http://127.0.0.1:8787}"
BASE="${CONTENT_API_BASE_URL%/}"

echo "Checking content API: ${BASE}"

check() {
  local path="$1"
  local status
  status="$(curl -sS -o /tmp/medicaltourismchina-content-api-smoke.json -w "%{http_code}" "${BASE}${path}")"
  if [[ "$status" != "200" ]]; then
    echo "FAIL ${path}: HTTP ${status}" >&2
    cat /tmp/medicaltourismchina-content-api-smoke.json >&2 || true
    exit 1
  fi
  echo "OK ${path}"
}

check "/health"
check "/departments?locale=en"
check "/hospitals?locale=en&limit=3&offset=0"
check "/hospitals/hospital-mm4eqlha/extended?locale=en"
check "/hospitals/xinhua-hospital-shanghai-jiao-tong-university-school-of-medicine/extended?locale=en"
check "/procedures?locale=en&limit=3"
check "/featured-treatments?locale=en"

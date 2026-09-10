#!/usr/bin/env bash
# External uptime probe — run from a second host or cron every 1–5 minutes.
# Usage: DOMAIN=https://one-good.example.ir ./deploy/uptime-check.sh
set -euo pipefail
DOMAIN="${DOMAIN:?set DOMAIN=https://your.domain}"
BASE="${DOMAIN%/}"

fail=0
check() {
  local path="$1"
  local code
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 "${BASE}${path}" || echo "000")
  if [[ "$code" != "200" && "$code" != "301" && "$code" != "302" ]]; then
    echo "FAIL ${path} → HTTP ${code}"
    fail=1
  else
    echo "OK   ${path} → HTTP ${code}"
  fi
}

check "/"
check "/api/health"
check "/donation/callback"

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi
echo "All probes passed"

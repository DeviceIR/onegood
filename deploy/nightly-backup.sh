#!/usr/bin/env bash
# Nightly backup wrapper for production VPS.
# Requires: pg_dump, AWS CLI or s3cmd configured for Arvan Object Storage.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

: "${DATABASE_URL:?DATABASE_URL required}"
: "${BACKUP_S3_URI:=}"  # e.g. s3://hafez-private/backups/

npm run backup
LATEST=$(ls -t backups/*.dump 2>/dev/null | head -1 || true)
if [[ -z "${LATEST}" ]]; then
  echo "No dump found"
  exit 1
fi

if [[ -n "${BACKUP_S3_URI}" ]]; then
  # Arvan-compatible: aws --endpoint-url "$S3_ENDPOINT" s3 cp ...
  ENDPOINT_ARGS=()
  if [[ -n "${S3_ENDPOINT:-}" ]]; then
    ENDPOINT_ARGS=(--endpoint-url "$S3_ENDPOINT")
  fi
  aws "${ENDPOINT_ARGS[@]}" s3 cp "$LATEST" "${BACKUP_S3_URI%/}/$(basename "$LATEST")"
  echo "Uploaded $LATEST → $BACKUP_S3_URI"
else
  echo "Wrote $LATEST (set BACKUP_S3_URI to upload)"
fi

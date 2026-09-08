#!/usr/bin/env bash
# PostgreSQL binaries on PATH; isolated synthetic cluster, Unix socket only.
set -euo pipefail
if [[ "${UMBRA_ALLOW_LOCAL_CONSENT_DB_TEST:-}" != "true" ]]; then
  printf 'Not run: requires explicit authorization to create a synthetic local database and apply SQL.\n' >&2
  exit 2
fi
consent_test_dir="$(mktemp -d /tmp/umbra-consent.XXXXXX)"
consent_source_dir="$(cd "$(dirname "$0")" && pwd)"
initdb -D "$consent_test_dir/data" -A trust --no-locale >/dev/null
trap 'pg_ctl -D "$consent_test_dir/data" -m fast -w stop >/dev/null 2>&1 || true' EXIT
pg_ctl -D "$consent_test_dir/data" -l "$consent_test_dir/server.log" -o "-h '' -k $consent_test_dir -p 55439" -w start >/dev/null
psql -X -h "$consent_test_dir" -p 55439 -d postgres -v ON_ERROR_STOP=1 -f "$consent_source_dir/atomic-local.sql"
printf 'Synthetic PostgreSQL cluster stopped; retained at %s\n' "$consent_test_dir"

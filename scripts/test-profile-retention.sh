#!/usr/bin/env bash
set -euo pipefail
# Disposable, synthetic PostgreSQL cluster. Never connects to existing databases.
retention_test_dir="$(mktemp -d /tmp/umbra-retention.XXXXXX)"
retention_repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
initdb -D "$retention_test_dir/data" -A trust --no-locale >/dev/null
trap 'pg_ctl -D "$retention_test_dir/data" -m fast -w stop >/dev/null 2>&1 || true' EXIT
pg_ctl -D "$retention_test_dir/data" -l "$retention_test_dir/server.log" -o "-h '' -k $retention_test_dir -p 55440" -w start >/dev/null
psql -X -h "$retention_test_dir" -p 55440 -d postgres -v ON_ERROR_STOP=1 -f "$retention_repo_dir/supabase/tests/profile_retention.sql"
printf 'PASS: retention preserves user results. Synthetic cluster retained at %s\n' "$retention_test_dir"

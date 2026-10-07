#!/usr/bin/env bash
# Dumps the stackcendra database to $BACKUP_DIR (custom format), keeping the
# newest $KEEP dumps.
#
# Usage: deploy/scripts/backup.sh [label]   (label defaults to "manual")
set -euo pipefail
cd "$(dirname "$0")/.."

BACKUP_DIR="${BACKUP_DIR:-/data/backups}"
KEEP="${KEEP:-7}"
PG_CONTAINER="${PG_CONTAINER:-pg}"
label="${1:-manual}"

db_user="$(grep -E '^DB_USER=' .env | cut -d= -f2-)"
db_name="$(grep -E '^DB_NAME=' .env | cut -d= -f2-)"
out="$BACKUP_DIR/stackcendra-$label-$(date -u +%Y%m%dT%H%M%SZ).dump"

docker exec "$PG_CONTAINER" pg_dump -U "$db_user" -d "$db_name" -Fc >"$out.tmp"
mv "$out.tmp" "$out"
echo "backup: $out ($(du -h "$out" | cut -f1))"

# shellcheck disable=SC2012 # names are ours, no odd characters
ls -1t "$BACKUP_DIR"/stackcendra-*.dump | tail -n +"$((KEEP + 1))" | xargs -r rm --

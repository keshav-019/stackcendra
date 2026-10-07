#!/usr/bin/env bash
# Deploys one web image on the VM: backup -> migrations (run from the new
# image, db/migrations) -> swap the container -> health check, rolling back
# to the previous image if the new one does not come up healthy.
#
# Usage: deploy/scripts/deploy.sh <image>
#   e.g. deploy/scripts/deploy.sh ghcr.io/keshav-019/stackcendra-web:<commit-sha>
# The caller must already be logged in to the registry if it is private.
set -euo pipefail
cd "$(dirname "$0")/.."

image="${1:?usage: deploy.sh <image>}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-90}"
CONTAINER=stackcendra

log() { echo "[deploy $(date -u +%H:%M:%S)] $*"; }

wait_healthy() {
  local status
  for ((i = 0; i < HEALTH_TIMEOUT; i += 3)); do
    status=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' "$CONTAINER" 2>/dev/null || echo missing)
    [[ "$status" == healthy ]] && return 0
    sleep 3
  done
  log "$CONTAINER is '$status' after ${HEALTH_TIMEOUT}s"
  return 1
}

# --- preflight ---------------------------------------------------------------
[[ -f .env ]] || { log "missing deploy/.env on this VM (see deploy/README.md)"; exit 1; }
if [[ "$(docker inspect -f '{{.State.Health.Status}}' pg 2>/dev/null)" != healthy ]]; then
  log "postgres container 'pg' is not healthy, refusing to deploy"
  exit 1
fi

# --- 1. pull first: nothing changes if the image is unavailable --------------
log "pulling $image"
docker pull -q "$image"

# --- 2. backup, then migrations ----------------------------------------------
log "backing up database"
./scripts/backup.sh deploy
log "running migrations from the new image"
WEB_IMAGE="$image" docker compose run --rm --no-deps -T web node scripts/migrate.mjs

# --- 3. swap the container ---------------------------------------------------
previous=$(docker image inspect -f '{{.Id}}' stackcendra-web:current 2>/dev/null || true)
if [[ -n "$previous" ]]; then
  docker tag "$previous" stackcendra-web:previous
fi
docker tag "$image" stackcendra-web:current
log "starting $CONTAINER from $image"
docker compose up -d --no-deps web

# --- 4. health check, rollback on failure ------------------------------------
if ! wait_healthy; then
  log "new container is unhealthy; last log lines:"
  docker logs --tail 30 "$CONTAINER" 2>&1 || true
  if [[ -n "$previous" ]]; then
    log "rolling back to previous image ${previous:7:12}"
    docker tag "$previous" stackcendra-web:current
    docker compose up -d --no-deps web
    if wait_healthy; then
      log "rollback healthy"
    else
      log "ROLLBACK ALSO UNHEALTHY, check the $CONTAINER container"
    fi
  fi
  log "note: migrations already applied are not reverted (backup is in /data/backups)"
  exit 1
fi
log "$CONTAINER healthy on $image"

# --- 5. cleanup: keep current + previous, drop older registry tags -----------
keep_ids="$(docker image inspect -f '{{.Id}}' stackcendra-web:current stackcendra-web:previous 2>/dev/null | sort -u)"
docker images --format '{{.Repository}}:{{.Tag}} {{.ID}}' "ghcr.io/keshav-019/stackcendra-web" | while read -r ref id; do
  full=$(docker image inspect -f '{{.Id}}' "$id")
  grep -qxF "$full" <<<"$keep_ids" || docker rmi "$ref" >/dev/null 2>&1 || true
done
docker image prune -f >/dev/null
log "done"

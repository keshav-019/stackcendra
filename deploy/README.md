# Deployment (VM)

Besides Vercel (which builds `main` into stackcendra.com on its own), the app
runs self-hosted on the VM `vanisher.projectyourown.com`:

| What | Where |
|---|---|
| Next.js server (UI + `/api/*` routes), container `stackcendra` | port 8080 |
| PostgreSQL database `stackcendra`, owned by role `stackcendra` | shared `pg` container (breachsphire stack), port 5432, TLS only |

The app container joins the breachsphire stack's Docker network
(`breachsphire_default`) and reaches Postgres as `postgres` with
`sslmode=verify-full`, using that stack's CA (`~/breachsphire/deploy/certs/ca.crt`).

On the VM everything lives in `~/stackcendra`: `deploy/` (this directory) and
`db/migrations/`, both copied there by CI. Backups go to `/data/backups`.

## How a deploy happens

Every push to `main` (except docs-only changes) runs
[`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml):

1. **check**: `npm ci`, lint, unit tests, `next build`, shellcheck these scripts.
2. **image**: build the [`Dockerfile`](../Dockerfile) (Next.js standalone) and
   push `ghcr.io/keshav-019/stackcendra-web:<commit-sha>` (and `:main`).
3. **deploy** (environment `vm-production`, `main` only): SSH in with the deploy
   key, copy `deploy/` and `db/migrations/` to `~/stackcendra`, log in to GHCR
   for this job only, then run [`scripts/deploy.sh`](scripts/deploy.sh):
   pull image → back up DB → apply pending migrations → swap the container →
   health check (`/api/health`, which also checks the DB) → **roll back to the
   previous image** if it is not healthy within 90 s → prune old images.

Pull requests run steps 1–2 without pushing or deploying. A deploy can also be
started by hand: Actions → CI/CD → Run workflow (on `main`).

## Database migrations

`db/migrations/NNNN_name.sql`, applied in order by
[`scripts/migrate.sh`](scripts/migrate.sh) and recorded in
`migrations.schema_migrations`. Each file runs in one transaction. Migrations
are forward-only: add a new numbered file, never edit an applied one. A
rollback restores the previous image but not the schema; every deploy takes a
backup first (newest 7 kept).

## Files on the VM that are not in git

`~/stackcendra/deploy/.env` (mode 600), created when the database was set up:

```
DB_USER=stackcendra
DB_NAME=stackcendra
DB_PASSWORD=...                 # the stackcendra role's password
AUTH_SECRET=...                 # openssl rand -base64 32; changing it signs everyone out
AUTH_URL=http://vanisher.projectyourown.com:8080
INTEGRATION_ENCRYPTION_KEY=...  # openssl rand -base64 32; must match any other
                                # deployment sharing this database
GITHUB_OAUTH_CLIENT_ID=  GITHUB_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_CLIENT_ID=  GOOGLE_OAUTH_CLIENT_SECRET=
GITHUB_INTEGRATION_CLIENT_ID=  GITHUB_INTEGRATION_CLIENT_SECRET=
GITLAB_INTEGRATION_CLIENT_ID=  GITLAB_INTEGRATION_CLIENT_SECRET=
```

After editing it, apply with `docker compose up -d --no-deps web`.

## GitHub configuration

Environment **vm-production** (deployments limited to `main`) holds:

| Secret | Value |
|---|---|
| `VM_HOST` | `vanisher.projectyourown.com` |
| `VM_USER` | `ubuntu` |
| `VM_SSH_KEY` | private half of `github-actions-deploy@stackcendra` in the VM's `~/.ssh/authorized_keys` (no port/agent/X11 forwarding, no pty) |
| `VM_KNOWN_HOSTS` | the VM's SSH host keys, so the runner refuses a different host |

## Day-to-day commands (on the VM, in `~/stackcendra/deploy`)

```bash
docker compose ps                      # status
docker compose logs -f web             # app logs
scripts/backup.sh                      # manual backup -> /data/backups
scripts/migrate.sh --dry-run           # list pending migrations
docker tag stackcendra-web:previous stackcendra-web:current && docker compose up -d --no-deps web   # manual rollback
docker exec -it pg psql -U stackcendra -d stackcendra   # SQL shell
```

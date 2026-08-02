# External Platform Setup

## Purpose

This page tracks every external account, project, and API credential StackCendra needs outside this machine, in the order they actually become necessary. It exists so setup work matches real release work instead of being done speculatively — see the [Phase Delivery Framework](https://github.com/keshav-019/stackcendra/wiki/Phase-Delivery-Framework) and the "unbounded scaffolding" non-goal in [Risks, Non-Goals, and Decision Log](https://github.com/keshav-019/stackcendra/wiki/Risks-Non-Goals-and-Decision-Log).

Do not create accounts or projects from the "Later" tiers until the phase that needs them actually begins. An unused cloud account or API key is not free — it is an audit and credential-hygiene liability.

## How to hand off credentials

- Store every credential as an environment variable in `.env.local` at the repository root. `.env.local` is gitignored (`.gitignore` blocks `.env*` except `.env.example`) and must never be committed.
- `.env.example` in the repository lists every variable name the app expects, with empty values — copy it to `.env.local` and fill it in.
- Prefer editing `.env.local` yourself in your own editor over pasting raw secret values into chat. It is not a hard rule for a local-only dev file, but it keeps secrets out of the conversation transcript. If you do paste a value here, treat it as compromised once the setup step is done and rotate it if the platform allows.
- Client-exposed values (anything prefixed `NEXT_PUBLIC_`) are bundled into the browser JavaScript and are not secret by design — that's normal for things like a public OAuth client ID. Server-only values (no `NEXT_PUBLIC_` prefix) must stay server-side once a backend exists to hold them; none of Tier 1 below has a real backend yet, so treat every value here as dev-only until then.
- Never put an API key or token into a URL, a client-side log, or a wiki page.

## Priority tier: set up now

These unblock turning the current concept screens (`/login`, `/signup`, `/projects/new`'s GitHub connect step, and eventual hosting) into real functionality.

### 1. GitHub OAuth App (sign-in)

Needed for: "Continue with GitHub" on `/login` and `/signup`. This app is identity-only (`read:user user:email`) — it never sees repo access. See section 1c for the separate app that does.

1. Go to GitHub → your avatar → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. Application name: `StackCendra (dev)`.
3. Homepage URL: `http://localhost:8080`.
4. Authorization callback URL: `http://localhost:8080/api/auth/callback/github` (this exact path matters — Auth.js expects it).
5. Register the application. Copy the **Client ID**.
6. Click **Generate a new client secret**. Copy it immediately — GitHub only shows it once.
7. Store as:
   ```
   GITHUB_OAUTH_CLIENT_ID=
   GITHUB_OAUTH_CLIENT_SECRET=
   ```

### 1b. Google OAuth Client

Needed for: activating the "Google" sign-in button on `/login` and `/signup`, which is currently disabled because no credentials exist yet.

1. Go to console.cloud.google.com and create a project (or reuse one — but keep it separate from whatever project ends up holding real GCP resources for Phase 9, same reasoning as the Gemini API key note above).
2. **APIs & Services → OAuth consent screen**: choose **External**, fill in the app name (`StackCendra`), your support email, and developer contact email. For a dev-only app you can leave it in **Testing** publish status — just add your own Google account under **Test users** so you can actually sign in with it.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
4. Application type: **Web application**.
5. Name: `StackCendra (dev)`.
6. Authorized redirect URI: `http://localhost:8080/api/auth/callback/google` (this exact path matters — Auth.js expects it).
7. Click **Create**. Copy the **Client ID** and **Client secret** shown in the dialog.
8. Store as:
   ```
   GOOGLE_OAUTH_CLIENT_ID=
   GOOGLE_OAUTH_CLIENT_SECRET=
   ```
9. Once these are set in `.env.local` and the dev server is restarted, the Google provider is already wired into `src/lib/auth.ts` — only the disabled button in the UI needs flipping to active.

### 1c. GitHub OAuth App (integration)

Needed for: real repo access — the "Connect" button on Settings → Integrations' GitHub row, and the Add Project wizard's repository picker. Separate from the sign-in app in section 1 because classic GitHub OAuth Apps support only one callback URL each, and repo access is deliberately requested only here, never at login (see [D-020](https://github.com/keshav-019/stackcendra/wiki/Risks-Non-Goals-and-Decision-Log) and [ADR 0011](https://github.com/keshav-019/stackcendra/wiki/ADR-0011-GitHub-Repo-Integration)).

1. GitHub → your avatar → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. Application name: `StackCendra Integrations (dev)` — distinct name so it's visually distinguishable from the sign-in app in your GitHub authorized-apps list.
3. Homepage URL: `http://localhost:8080`.
4. Authorization callback URL: `http://localhost:8080/api/integrations/github/callback` (this exact path matters).
5. Register the application, copy the **Client ID**.
6. Click **Generate a new client secret**, copy it immediately.
7. Store as:
   ```
   GITHUB_INTEGRATION_CLIENT_ID=
   GITHUB_INTEGRATION_CLIENT_SECRET=
   ```
8. Also generate a dedicated encryption key for storing the resulting access token (used by `src/lib/crypto.ts`, distinct from `AUTH_SECRET`):
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   Store as:
   ```
   INTEGRATION_ENCRYPTION_KEY=
   ```
9. Apply `db/integrations-schema.sql` to the database if it hasn't been already (creates the `integration_connections` table).

### 1d. GitLab OAuth App (integration)

Needed for: real project access — the "Connect" button on Settings → Integrations' GitLab row, and the Add Project wizard's GitLab repository picker. Unlike GitHub, GitLab isn't a sign-in provider at all yet, so there's only one GitLab OAuth App, not a sign-in/integration split — and GitLab OAuth Apps support multiple redirect URIs in a single app, so there's no callback-URL constraint forcing a split even if that changed later.

1. Go to **gitlab.com/-/user_settings/applications** (self-hosted GitLab: the equivalent page on your instance).
2. Name: `StackCendra Integration (dev)`.
3. Redirect URI: `http://localhost:8080/api/integrations/gitlab/callback` (add a production URI on a new line later if needed — no second app required).
4. Scopes: check only `read_user` and `read_api` (read-only across the API, no write or repo-content access).
5. Leave **Confidential** checked (default) — this is a server-side authorization-code exchange.
6. Click **Save application**. Copy the **Application ID** and **Secret** (shown once).
7. Store as:
   ```
   GITLAB_INTEGRATION_CLIENT_ID=
   GITLAB_INTEGRATION_CLIENT_SECRET=
   ```
8. GitLab access tokens expire (~2 hours) and are refreshed automatically server-side using the refresh token GitLab issues alongside them — see [ADR 0012](https://github.com/keshav-019/stackcendra/wiki/ADR-0012-GitLab-Repo-Integration). This requires `db/integrations-refresh-schema.sql` to be applied in addition to `db/integrations-schema.sql` (adds `refresh_token_encrypted` and `expires_at` columns).
9. Reuses the same `INTEGRATION_ENCRYPTION_KEY` set up for GitHub above — no separate key needed.

### 2. Vercel (web hosting)

Needed for: hosting the Next.js dashboard publicly so it's not only running on your machine.

1. Go to vercel.com and sign up with the GitHub account that owns this repository (this also grants Vercel read access to import the repo — accept only the repository-scoped permission, not organization-wide access, if prompted).
2. Once signed in, don't import the project yet — the repo isn't ready for a production deploy target until we decide what "production" means for a solo-dev portfolio project. Just confirm the account exists and note whether you're on the Hobby (free) plan.
3. No API key needed yet; when we do the actual deploy, Vercel issues a project-scoped token from **Account Settings → Tokens** if we need CLI/CI access. Skip that until then.

### 3. Cloudflare (DNS, Workers, R2)

Needed for: the edge API gateway and object storage described in the hosting architecture.

1. Go to cloudflare.com and create a free account.
2. If you own a domain you want to use for StackCendra, add it as a site in the Cloudflare dashboard (skip this if you don't have one yet — not required to start).
3. For R2: dashboard → **R2** → enable R2 (requires adding a payment method even on the free tier, per Cloudflare's current setup flow, but the free 10 GB-month allowance has no charge). Create a bucket named `stackcendra-artifacts`.
4. Create an API token: **My Profile → API Tokens → Create Token**. Use a scoped template (R2 read/write, or Workers if we're deploying a Worker) rather than the Global API Key.
5. Store as:
   ```
   CLOUDFLARE_ACCOUNT_ID=
   CLOUDFLARE_API_TOKEN=
   CLOUDFLARE_R2_BUCKET=stackcendra-artifacts
   ```

### 4. Neon (PostgreSQL)

Needed for: the first real database, once P0-004/P0-009 begin (organization, user, project tables).

1. Go to neon.tech and sign up (GitHub sign-in is fine).
2. Create a project named `stackcendra-dev`.
3. Neon gives you a connection string immediately on project creation — copy the pooled connection string (not the direct one) for application use.
4. Store as:
   ```
   DATABASE_URL=
   ```
5. Don't create a second "production" branch/database yet — Neon supports branching later when there's an actual deployment to protect.

### 5. AI provider key — Google Gemini (bring-your-own-key)

Needed for: any real AI feature (the AI Assistant panel, AI-suggested fixes) once they stop being mock data.

Chosen over Anthropic for this stage because Gemini has a genuinely ongoing free tier (no expiring trial credit) with no credit card required — see [D-014](https://github.com/keshav-019/stackcendra/wiki/Risks-Non-Goals-and-Decision-Log). Revisit this choice once a paid tier or a specific model capability is actually needed.

1. Go to **aistudio.google.com** and sign in with a Google account.
2. In the left sidebar, click **Get API key**, then **Create API key**.
3. When it asks which Google Cloud project to attach the key to, choose **Create API key in new project** — do not attach it to any project you plan to use for real GCP work later (Phase 9). This keeps it isolated: if that other project ever has billing enabled, this key's free tier disappears with it.
4. Copy the key once it's generated.
5. Never enable billing on this project. That is what keeps the free tier active.
6. Store as:
   ```
   GEMINI_API_KEY=
   ```
7. This follows the product's own "bring your own AI provider key" principle — StackCendra itself should never hold one shared key across all users. Whichever provider is chosen here is a per-developer choice, not an architecture lock-in; the intelligence service is designed to sit behind a provider-neutral abstraction per [System Architecture](https://github.com/keshav-019/stackcendra/wiki/System-Architecture).

## Later tiers: set up only when the phase begins

### Phase 9 — Cloud providers

**AWS** (build this one deep first, per the Roadmap):
1. Create an AWS account if you don't have one; enable MFA on the root user immediately and never use the root user for API access.
2. In **IAM**, create a dedicated user (e.g., `stackcendra-dev`) with a scoped policy — start with read-only access to EC2, CloudWatch, and Secrets Manager rather than `AdministratorAccess`.
3. Generate an access key for that IAM user under **Security credentials**.
4. Store as `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION`.

**GCP:**
1. console.cloud.google.com → create a project `stackcendra-dev`.
2. **IAM & Admin → Service Accounts** → create one with a narrow role (e.g., Viewer to start).
3. Create and download a JSON key for it.
4. Store the file path as `GOOGLE_APPLICATION_CREDENTIALS`, not the key content directly.
5. Keep this project separate from whatever project holds the Gemini API key from Tier 1 — enabling billing here must not affect that key's free tier.

**Azure:**
1. portal.azure.com → create a subscription if needed.
2. **Azure Active Directory → App registrations → New registration** to get a client ID/secret pair (a managed identity if this ever runs inside Azure instead).
3. Store as `AZURE_CLIENT_ID` / `AZURE_CLIENT_SECRET` / `AZURE_TENANT_ID`.

### Phase 8 — Containers & orchestration

- Docker Hub account only if you need to push images somewhere other than a local registry — not required for local Compose/desktop work.
- A Kubernetes cluster (local `kind`/`minikube` for development, no account needed) before any managed cluster.

### Tier 2/3 — Observability, project management, communication

Set these up only once the corresponding integration enters active work (per the [Roadmap](https://github.com/keshav-019/stackcendra/wiki/Roadmap) integration priority table):

| Platform | Where to get a key |
| --- | --- |
| Sentry | sentry.io → project → Settings → Client Keys (DSN) |
| Datadog | app.datadoghq.com → Organization Settings → API Keys |
| Linear | linear.app → Settings → API → Personal API key, or a full OAuth app for multi-user |
| Jira | Atlassian account → Settings → Security → API tokens |
| Slack | api.slack.com/apps → Create New App → Bot Token Scopes |
| PagerDuty | pagerduty.com → Integrations → API Access Keys |

### Phase 12 — LiveKit

Self-host first (LiveKit has a local dev server mode, no account needed) before considering LiveKit Cloud.

## Status

| Platform | Status |
| --- | --- |
| Firebase | Evaluated, rejected — see [D-013](https://github.com/keshav-019/stackcendra/wiki/Risks-Non-Goals-and-Decision-Log) |
| GitHub OAuth App (sign-in) | Created; wired into real sign-in via [ADR 0008](https://github.com/keshav-019/stackcendra/wiki/ADR-0008-GitHub-OAuth-For-Web-Auth) |
| GitHub OAuth App (integration) | Created; wired into a real repo-access connect flow via [ADR 0011](https://github.com/keshav-019/stackcendra/wiki/ADR-0011-GitHub-Repo-Integration) — Settings → Integrations and the Add Project wizard |
| GitLab OAuth App (integration) | Created; wired into a real project-access connect flow via [ADR 0012](https://github.com/keshav-019/stackcendra/wiki/ADR-0012-GitLab-Repo-Integration) — Settings → Integrations and the Add Project wizard |
| Google OAuth Client | Created and wired in; "Continue with Google" is live on `/login` and `/signup` |
| Vercel | Not yet created |
| Cloudflare | Account and R2 credentials created; not yet wired into any app code |
| Neon | Wired in — schema applied (`db/auth-schema.sql`), used for real user/account persistence via [ADR 0010](https://github.com/keshav-019/stackcendra/wiki/ADR-0010-Postgres-User-Persistence) |
| AI provider key (Gemini) | Created; not yet wired into any app code |
| Everything in "Later tiers" | Not started — intentionally |

Update this table as each account is created, and remove or replace a row the moment a decision changes it, per the wiki maintenance habit in [Home](https://github.com/keshav-019/stackcendra/wiki/Home).

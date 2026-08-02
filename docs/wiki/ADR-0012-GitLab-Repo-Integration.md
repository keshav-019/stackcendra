# ADR 0012: GitLab Repo Integration — Single OAuth App, Refreshable Tokens, Shared CI/CD Panel

- **Status:** Accepted
- **Date:** 2026-08-02

## Context

[ADR 0011](https://github.com/keshav-019/stackcendra/wiki/ADR-0011-GitHub-Repo-Integration) wired up real GitHub repo access behind its own OAuth App, separate from GitHub sign-in, and added a "CI/CD activity" panel in Settings → Integrations showing real GitHub Actions workflow runs. The next integration to make real is GitLab, following the same "read-only, connect-when-needed" model — but GitLab differs from GitHub in three ways that shape this decision:

1. GitLab isn't a sign-in provider in this app at all (only GitHub and Google are, and per [D-022](https://github.com/keshav-019/stackcendra/wiki/Risks-Non-Goals-and-Decision-Log) sign-in method is fixed at signup, not linkable). There's no "keep login minimal" scope conflict to resolve, so there's only one GitLab OAuth App to create, not a sign-in/integration split.
2. GitLab OAuth Apps support multiple redirect URIs per application (unlike GitHub's classic OAuth Apps, which support exactly one) — removing the technical reason ADR 0011 needed two GitHub apps in the first place, if it ever came up for GitLab.
3. GitLab's OAuth access tokens expire (~2 hours by default) and must be refreshed with a refresh token. GitHub's classic OAuth App tokens used here do not expire. This is a real functional difference, not a detail: building the integration without refresh support would mean it silently breaks two hours after every connect.

## Decision

**Single OAuth App.** Register one GitLab OAuth Application (`StackCendra Integration (dev)`) scoped to `read_user read_api`, with its own connect/callback pair (`/api/integrations/gitlab/connect` → `/api/integrations/gitlab/callback`), using the same CSRF-state-cookie and `returnTo`-cookie pattern as the GitHub integration flow.

**Token refresh, built in from the start.** `integration_connections` gained two nullable columns (`db/integrations-refresh-schema.sql`): `refresh_token_encrypted` and `expires_at`. Both are populated on the GitLab callback (GitHub connections leave them null — its tokens don't expire). `getAccessToken()` in `src/lib/integrations.ts` checks `expires_at` on every read; if a token is expiring within 30 seconds and a refresh token is on file, it transparently calls GitLab's `oauth/token` refresh grant, persists the new access/refresh token pair, and returns the fresh token — callers never see an expired token or have to think about refresh themselves.

**Shared CI/CD panel, not a duplicate one.** Rather than building a second bespoke UI for GitLab pipelines, `CiCdActivityPanel` in `WorkspaceSections.tsx` was generalized to take a `provider: 'github' | 'gitlab'` prop and a small per-provider endpoint/label config, so one component renders both — each connected provider gets its own panel instance with its own repo/project picker. GitLab pipeline data is normalized server-side (`src/lib/integrations.ts`) into the same `{status, conclusion}` shape GitHub Actions runs use, so the frontend has no provider-specific branching: GitLab's richer status vocabulary (`pending`, `running`, `success`, `failed`, `canceled`, `skipped`, etc.) maps onto GitHub's simpler `status`/`conclusion` split.

**Failure detail is coarser for GitLab than GitHub, honestly.** GitHub Actions exposes individual step-level pass/fail within a job; GitLab's Jobs API does not expose that same step granularity without fetching and parsing each job's trace log (a meaningfully bigger feature, deferred). GitLab failure rows instead show the job's `stage` and its `failure_reason` (e.g. `script_failure`) — less precise than GitHub's "this exact step failed," but real data, not fabricated to look more granular than it is.

**Project path validation, applied to both providers.** While adding `GITLAB_PROJECT_PATH_RE` (which, unlike GitHub's single-level `owner/repo`, must allow GitLab's arbitrarily nested `group/subgroup/project` paths), testing surfaced that both this regex and the existing `GITHUB_REPO_FULL_NAME_RE` would structurally accept a dot-only path segment (e.g. `../..`) because `.` was allowed anywhere in a segment. Not an exploitable issue — the value only ever reaches an outbound provider API call, never a filesystem path — but both regexes were tightened in the same pass to require each segment start with an alphanumeric character or underscore, closing the gap in both providers rather than just the new one.

## Consequences

- Settings → Integrations' GitLab row is now real (live status, live connect/disconnect, "Real" badge) alongside GitHub's; every other integration in that list remains mock UI.
- The Add Project wizard's GitLab step now lists real GitLab projects via `GET /api/integrations/gitlab/repos`, the same way its GitHub step already did — the `mockRemoteRepos` fixture in `src/lib/mock-projects.ts` is now unused by the wizard (left in place as a data fixture with its own test, not deleted, since it's not causing any harm sitting there).
- GitLab's access token being refreshed automatically means a user who connects once stays connected indefinitely (until they explicitly disconnect or revoke the app on GitLab's side) — same practical behavior as GitHub from the user's perspective, despite the different token lifetime underneath.
- The interim-custody tradeoff acknowledged in ADR 0011 (StackCendra's server briefly holds plaintext tokens during exchange/use, ahead of the desktop app's real local-only vault) applies identically here, now for two providers instead of one.

## Alternatives considered

- **Two GitLab OAuth Apps**, mirroring the GitHub sign-in/integration split. Rejected — there's no sign-in use case to keep separate from, and GitLab's multi-redirect-URI support removes the technical constraint that forced the split for GitHub.
- **Skip refresh-token handling, just let the connection expire after 2 hours and prompt reconnect.** Rejected as a real defect masquerading as simplicity — a portfolio feature that silently breaks every two hours is worse than not having it.
- **A separate `GitlabCiCdActivityPanel` component instead of generalizing the existing one.** Rejected — the two panels would have been ~90% identical JSX; the config-object approach keeps one implementation and one place to fix bugs, at the cost of one extra layer of indirection that stayed small enough to be worth it.

## Revisit when

Fetching real trace-log-derived step failures for GitLab becomes valuable enough to justify the extra API calls and log parsing, self-hosted GitLab instance support is needed (currently gitlab.com-only, hardcoded API base URL), or the desktop app's local-only vault arrives and this server-side custody model is reconsidered for both providers at once.

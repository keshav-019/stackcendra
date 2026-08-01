# ADR 0011: Separate GitHub OAuth App for Repo-Scoped Integration Access

- **Status:** Accepted
- **Date:** 2026-08-01

## Context

[ADR 0008](https://github.com/keshav-019/stackcendra/wiki/ADR-0008-GitHub-OAuth-For-Web-Auth) wired up "Sign in with GitHub" using a minimal-scope OAuth App (`read:user user:email`). Turning the Settings → Integrations GitHub row and the Add Project wizard's GitHub step from mock UI into something real requires reading the user's repositories and, eventually, CI/CD run status — access the sign-in scope deliberately does not grant, by explicit user choice (repo access should be requested only when connecting a project, not bundled into login).

Classic GitHub OAuth Apps (the registration type used for sign-in) support exactly one authorization callback URL each. Since the two flows now need different scopes requested at different times, they cannot share the sign-in app's callback.

## Decision

Register a second, separate GitHub OAuth App (`StackCendra Integrations (dev)`) with its own client ID/secret and its own callback route (`/api/integrations/github/callback`), requesting `repo read:user` scope only when the user explicitly clicks "Connect" in Settings or the Add Project wizard.

This flow is implemented independently of Auth.js's own sign-in machinery — a custom `/api/integrations/github/connect` → `/api/integrations/github/callback` pair with its own CSRF `state` cookie and an `isSafeRelativePath`-validated `returnTo` cookie (so the wizard can send the user back to `/projects/new` instead of always to `/settings`) — rather than trying to extend the sign-in provider's scope on demand. Auth.js's adapter only calls `linkAccount`/`createUser` once per (provider, providerAccountId) pair; re-authenticating the same GitHub account with broader scope would not update the already-stored token without custom event handling, so treating this as a genuinely separate integration concern with its own storage was simpler and more correct than fighting that.

The resulting access token is encrypted (AES-256-GCM, `src/lib/crypto.ts`) before being stored in a new `integration_connections` table (`db/integrations-schema.sql`), decrypted server-side only at the moment StackCendra calls the GitHub API on the user's behalf.

## Consequences

- This is an explicit, acknowledged gap against the "local-only vault" language elsewhere in the product plan (Security and Trust Model, the original Settings page copy): for this web-only phase, StackCendra's server does briefly hold the plaintext token during the OAuth exchange and every time it's decrypted for an API call. The Settings page copy has been corrected to say this plainly instead of overclaiming. The real local-only vault arrives with the desktop app (Phase 4); this is a deliberate interim step, not the final architecture.
- Settings → Integrations' GitHub row is now real (live status, live connect/disconnect) while every other integration in that list remains mock UI — the row is labeled "Real" so this isn't ambiguous in the UI itself.
- The Add Project wizard's GitHub step uses real repositories via `GET /api/integrations/github/repos` once connected, falling back to the existing mock repo list for GitLab (still unconnected) and for GitHub before the user has connected.
- No migration tool is chosen yet, so `integrations-schema.sql` is applied by hand, same as `auth-schema.sql` — see the open decision in [Risks, Non-Goals, and Decision Log](https://github.com/keshav-019/stackcendra/wiki/Risks-Non-Goals-and-Decision-Log).

## Alternatives considered

- Extending the sign-in OAuth App's scope and requesting it at login time. Rejected per the user's explicit choice — see the decision log — to keep login minimal and request repo access only when actually connecting a project.
- Migrating to a GitHub App (supports up to 10 callback URLs and per-repository installation scoping, closer to what tools like Vercel/Netlify use). More correct long-term — a user could grant access to specific repositories instead of all of them — but a bigger lift (webhook config, installation flow, a different token model) than this step warranted. Worth revisiting once per-repo scoping actually matters.

## Revisit when

A migration tool is chosen (apply `integrations-schema.sql` through it retroactively), the desktop app's local-only vault exists (this server-side custody model should be reconsidered then), or per-repository access scoping becomes a real requirement (migrate to a GitHub App).

# ADR 0008: Use Auth.js with GitHub OAuth for Initial Web Sign-In

- **Status:** Accepted
- **Date:** 2026-07-30

## Context

`/login` and `/signup` needed real authentication rather than concept-only forms once the GitHub OAuth App from [External Platform Setup](https://github.com/keshav-019/stackcendra/wiki/External-Platform-Setup) was created. [D-013](https://github.com/keshav-019/stackcendra/wiki/Risks-Non-Goals-and-Decision-Log) already rejected Firebase; P0-009 still leaves the eventual production identity provider open, since it must work for both the web dashboard and the Tauri desktop app.

GitHub is already the product's primary Tier 1 source-control integration, so using the same OAuth App for "sign in" and for the "connect a repository" step in the Add Project wizard is a natural, low-overhead starting point rather than a new architectural commitment.

## Decision

Use Auth.js (`next-auth@5`, beta) configured with only the GitHub provider, `session: { strategy: "jwt" }`, and no database adapter. Real sign-in and sign-out are wired into `/login`, `/signup`, and the dashboard's `UserDropdown`; email/password fields remain visual only, since there is no user database behind them yet.

`trustHost: true` is required in this config for local development on a non-default host/port (`localhost:8080`); without it, Auth.js's `assertConfig` rejects the request as an `UntrustedHost` before reaching the provider.

## Consequences

- A user's session exists only as a signed JWT cookie. Nothing is persisted server-side — no `users`, `accounts`, or `sessions` table exists yet. Restarting `AUTH_SECRET` invalidates all sessions.
- The GitHub OAuth access token is not currently retained anywhere (the JWT callback only keeps the GitHub `login`). The Add Project wizard's "list your repositories" step still uses mock data; wiring it to real repositories requires storing that token, which is deferred along with the P0-009 identity skeleton.
- This is not yet the final identity provider decision for Enterprise-edition SSO/SAML (Phase 13) or for the desktop app — it unblocks web sign-in now without closing off those choices.
- `AUTH_SECRET` and the GitHub OAuth client secret live in `.env.local` only, per the credential-handling rules in External Platform Setup.

## Alternatives considered

- Continue deferring all authentication, per the original P0-009 plan. Rejected for now because the user specifically requested working sign-in once the GitHub OAuth App existed, and GitHub OAuth doesn't foreclose the eventual identity-provider decision the way Firebase would have.
- Add a database adapter (Postgres/Neon, already provisioned) immediately for persisted accounts. Deferred to avoid building the full identity skeleton (P0-009) as a side effect of a UI request; JWT-only sessions are sufficient to make the concept screens real.

## Revisit when

P0-009 begins in earnest (real organization/user/device model), when the Add Project wizard needs a real GitHub access token to list repositories, or when Enterprise SSO requirements in Phase 13 are scoped.

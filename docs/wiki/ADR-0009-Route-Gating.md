# ADR 0009: Gate the Dashboard and All Authenticated Routes Behind a Real Session

- **Status:** Accepted — supersedes the "no route gating" decision recorded early in the concept-UI phase
- **Date:** 2026-07-30

## Context

Early in the concept-UI phase, the explicit decision was to leave the dashboard reachable without signing in, since Login/Signup were not wired to a real authentication service yet and gating would have just added friction to reviewing screens. That decision is recorded throughout [Concept UI Screens](https://github.com/keshav-019/stackcendra/wiki/Concept-UI-Screens) and was correct at the time.

Once [ADR 0008](https://github.com/keshav-019/stackcendra/wiki/ADR-0008-GitHub-OAuth-For-Web-Auth) made GitHub sign-in real, leaving every route open regardless of session state stopped making sense — a user landing on the dashboard without having signed in is no longer a placeholder-UI convenience, it is a broken authentication story.

## Decision

Add Next.js middleware (`middleware.ts`) that redirects any unauthenticated request to `/login` (preserving the original destination as a `callbackUrl`), and redirects an already-authenticated visitor away from `/login`/`/signup` back to `/`. Every route except `/login`, `/signup`, `/api/*`, and static assets is now gated.

The middleware uses a separate, edge-safe config (`src/lib/auth.config.ts`) containing only the `authorized` callback and no adapter or providers, rather than the full `src/lib/auth.ts`. This split exists because [ADR 0010](https://github.com/keshav-019/stackcendra/wiki/ADR-0010-Postgres-User-Persistence) adds a Postgres adapter (`pg`, a Node-only TCP client) to the full config, which cannot run in the Edge runtime middleware normally uses. `auth.ts` spreads `authConfig` and extends it with providers, the adapter, and additional callbacks.

## Consequences

- Every new authenticated screen is protected automatically by matching the middleware's route matcher; no per-page gating code is needed.
- The desktop app (once it exists) will need its own session story — this middleware only covers the web shell.
- Local development now requires actually completing a GitHub sign-in to see the dashboard, which is the correct behavior for real auth but means concept-screen review always starts at `/login`.

## Revisit when

A second identity provider or the full P0-009 identity skeleton changes what "authenticated" means (e.g., device-based desktop sessions), or Enterprise SSO requirements in Phase 13 require different gating per route.

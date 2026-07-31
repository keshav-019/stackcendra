# ADR 0010: Persist Users and OAuth Accounts to Postgres via the Official Auth.js Adapter

- **Status:** Accepted
- **Date:** 2026-07-30

## Context

Until now, signing in created only a JWT session cookie — nothing was written anywhere, so no user record survived past the browser session. This is the first real slice of the P0-009 identity skeleton (organization, user, membership, device, project, repository, service, environment models), started deliberately small: persist the user and their linked OAuth account, nothing more yet.

The Neon database provisioned in [External Platform Setup](https://github.com/keshav-019/stackcendra/wiki/External-Platform-Setup) already existed but was unused by the application until this change.

## Decision

Use `@auth/pg-adapter` (the official Auth.js Postgres adapter) with a plain `pg.Pool`, against the schema in `db/auth-schema.sql` (`users`, `accounts`, `sessions`, `verification_token`, applied by hand — no migration tool is chosen yet, see the open decision below). User ids are `UUID` (via `gen_random_uuid()`), not `SERIAL`, because Auth.js's `AdapterUser.id` type is `string` and a serial integer would create a silent numeric/string mismatch.

Critically, the session strategy stays `jwt`, not `database`. Reading the installed `@auth/core` source directly (`lib/actions/callback/handle-login.js`) confirmed that Auth.js calls the adapter's `createUser`/`getUserByAccount`/`linkAccount` to persist users and accounts regardless of session strategy — the `useJwtSession` branch only skips creating a *session* row, since the JWT itself carries the session. This combination (adapter for persistence, JWT for the session token) keeps the session cookie exactly as before, so [ADR 0009](https://github.com/keshav-019/stackcendra/wiki/ADR-0009-Route-Gating)'s Edge-compatible middleware continues to work unmodified — a database session strategy would have required decoding an opaque session token against Postgres from inside Edge middleware, which the `pg` driver cannot do there.

## Consequences

- A real `users` row and `accounts` row are created in Neon the first time someone signs in with GitHub (and, once activated, Google). The `sessions` table exists per the standard schema but is intentionally unused while the session strategy is JWT.
- `session.user.id` is now the real Postgres UUID, not a provider-specific value — this is what future features (projects, integrations, audit events) should key against.
- The schema is applied by hand via `db/auth-schema.sql`; there is still no chosen migration tool (Drizzle, Prisma, etc. remain open, see the decision log), so future schema changes must be applied the same manual way until one is picked.
- `src/lib/db.ts` holds the `pg.Pool` as a `globalThis`-cached singleton specifically to survive Next.js dev-mode hot reload without leaking connections.

## Alternatives considered

- Database session strategy with the adapter fully driving sessions. Rejected because it breaks Edge-compatible middleware (ADR 0009) without also splitting session validation into a Node-runtime-only code path, which is a bigger change than this step warranted.
- Waiting for a migration tool decision before persisting anything. Rejected — the user explicitly asked to start persisting data now; a hand-applied schema file is a reasonable, reversible starting point.

## Revisit when

A migration tool is chosen (apply this schema through it retroactively), or the domain model grows beyond users/accounts (organizations, projects, memberships) enough that hand-written adapter SQL is no longer sufficient.

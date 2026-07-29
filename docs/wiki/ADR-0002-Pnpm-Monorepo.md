# ADR 0002: Use a pnpm Monorepo

- **Status:** Accepted
- **Date:** 2026-07-30

## Context

StackCendra will contain web, desktop, shared TypeScript packages, Rust, Go, Python, infrastructure, fixtures, and generated contracts. The current repository contains npm and Bun lockfiles without a workspace policy.

## Decision

Use a single repository with pnpm workspaces for JavaScript and TypeScript packages. Pin pnpm through Corepack and maintain one `pnpm-lock.yaml`.

Non-JavaScript languages retain their native package managers and version files inside owned directories. Cross-language root scripts orchestrate validation without pretending every ecosystem is an npm package.

## Consequences

- Shared UI and contract packages can evolve atomically with applications.
- Dependency versions and CI behavior are reproducible.
- Existing npm and Bun lockfiles will be removed during the migration.
- Workspace-boundary rules are required to prevent accidental coupling.
- A task orchestrator is not adopted until root scripts and CI needs justify one.

## Alternatives considered

- npm workspaces;
- Bun workspaces;
- multiple repositories from the start;
- Turborepo or Nx as an immediate mandatory layer.

pnpm provides efficient, strict workspace behavior without requiring an additional orchestration framework on day one.

## Revisit when

Repository scale, release independence, access control, or CI performance creates a measured limitation.

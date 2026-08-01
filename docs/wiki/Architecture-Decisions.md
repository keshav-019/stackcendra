# Architecture Decisions

Architecture decision records preserve why the project chose a direction and what would justify changing it.

## Accepted records

- [ADR 0001 — Focus the product on environment failures](https://github.com/keshav-019/stackcendra/wiki/ADR-0001-Product-Wedge)
- [ADR 0002 — Use a pnpm monorepo](https://github.com/keshav-019/stackcendra/wiki/ADR-0002-Pnpm-Monorepo)
- [ADR 0003 — Use Next.js and Tauri with shared UI](https://github.com/keshav-019/stackcendra/wiki/ADR-0003-Nextjs-Tauri-Shared-UI)
- [ADR 0004 — Begin with modular services and PostgreSQL relationships](https://github.com/keshav-019/stackcendra/wiki/ADR-0004-Modular-Architecture-and-PostgreSQL)
- [ADR 0005 — Separate AI from authorization and execution](https://github.com/keshav-019/stackcendra/wiki/ADR-0005-AI-Authorization-Boundary)
- [ADR 0006 — Version Wiki source in the main repository](https://github.com/keshav-019/stackcendra/wiki/ADR-0006-Versioned-Wiki-Source)
- [ADR 0007 — Ship Individual and Enterprise editions on one desktop-first core](https://github.com/keshav-019/stackcendra/wiki/ADR-0007-Two-Edition-Product-Model)
- [ADR 0008 — Use Auth.js with GitHub OAuth for initial web sign-in](https://github.com/keshav-019/stackcendra/wiki/ADR-0008-GitHub-OAuth-For-Web-Auth)
- [ADR 0009 — Gate the dashboard and all authenticated routes behind a real session](https://github.com/keshav-019/stackcendra/wiki/ADR-0009-Route-Gating)
- [ADR 0010 — Persist users and OAuth accounts to Postgres via the official Auth.js adapter](https://github.com/keshav-019/stackcendra/wiki/ADR-0010-Postgres-User-Persistence)
- [ADR 0011 — Separate GitHub OAuth App for repo-scoped integration access](https://github.com/keshav-019/stackcendra/wiki/ADR-0011-GitHub-Repo-Integration)

## Record format

Every ADR includes:

- status;
- date;
- context;
- decision;
- consequences;
- alternatives considered;
- conditions that would justify revisiting the decision.

Accepted records are not edited to hide obsolete assumptions. A later ADR supersedes them and links both directions.

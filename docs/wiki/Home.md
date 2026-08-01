# StackCendra Wiki

StackCendra is an AI-native engineering workspace for preventing environment-related deployment failures and resolving incidents with evidence.

**Tagline:** From local development to verified production recovery—without switching tools.

## Current phase

The project is in **Phase 0: Foundation and product architecture**. The repository currently contains a visual prototype with mocked data. Product behavior, trust boundaries, architecture, development standards, and release gates are being documented before implementation begins.

The complete Phase 0–13 plan is now defined. Later phases are specifications, not claims of implemented behavior.

The web application now runs on a lightweight Next.js App Router shell (App Router, React 19) instead of the original Vite prototype. Concept screens now cover `/login`, `/signup`, the unified dashboard, `/projects`, `/projects/new` (an Add Project wizard with GitHub/GitLab connect and repository selection), `/projects/[id]` (Git status, CI/CD run list, and an AI-suggested-fix panel), and `/settings`/`/profile` (one shared account-and-settings shell with a persistent two-group sub-nav — Personal and Workspace — covering twelve sections, not two disconnected pages). `/login` and `/signup` now have real GitHub **and** Google OAuth sign-in via Auth.js (see [ADR 0008](https://github.com/keshav-019/stackcendra/wiki/ADR-0008-GitHub-OAuth-For-Web-Auth)), with the signed-in user and their linked OAuth account persisted for real in Postgres (see [ADR 0010](https://github.com/keshav-019/stackcendra/wiki/ADR-0010-Postgres-User-Persistence)) while the session itself stays a JWT cookie. Every route except `/login` and `/signup` now requires a real session — visiting the dashboard or any other page unauthenticated redirects to `/login` (see [ADR 0009](https://github.com/keshav-019/stackcendra/wiki/ADR-0009-Route-Gating)), reversing the earlier "no gating" decision now that sign-in is real. Every non-dashboard screen has an explicit "Dashboard" back-link in its header, not just an implicit logo click. A Vitest + Playwright test suite now covers both (44 unit/component tests, 33 E2E tests, all passing) — see [Testing, Quality, and Observability](https://github.com/keshav-019/stackcendra/wiki/Testing-Quality-and-Observability); writing it caught a real remaining hydration bug (locale, not just timezone, must be pinned in `toLocaleTimeString` calls) and several real Playwright/OAuth-testing gotchas worth remembering. GitHub repo access is now real too, deliberately separate from sign-in — see [ADR 0011](https://github.com/keshav-019/stackcendra/wiki/ADR-0011-GitHub-Repo-Integration) — powering the Settings → Integrations GitHub row and the Add Project wizard's repository picker, with the access token encrypted at rest. Everything else remains unwired to a real Git provider or backend; see [Concept UI Screens](https://github.com/keshav-019/stackcendra/wiki/Concept-UI-Screens) for the running inventory and the visual-standard rules. The full pnpm-workspace monorepo, shared contracts, and Tauri shell described in [Phase 0 Execution Backlog](https://github.com/keshav-019/stackcendra/wiki/Phase-0-Execution-Backlog) remain planned, not built.

## Canonical product question

> Why does this application work locally but fail in staging or production?

The first useful versions of StackCendra must answer that question better than a collection of disconnected dashboards.

## Wiki map

### Product

- [Product Vision and Scope](https://github.com/keshav-019/stackcendra/wiki/Product-Vision-and-Scope)
- [Users and Jobs to Be Done](https://github.com/keshav-019/stackcendra/wiki/Users-and-Jobs-to-Be-Done)
- [Product Areas and Information Architecture](https://github.com/keshav-019/stackcendra/wiki/Product-Areas-and-Information-Architecture)
- [Glossary](https://github.com/keshav-019/stackcendra/wiki/Glossary)
- [Flagship Demonstration](https://github.com/keshav-019/stackcendra/wiki/Flagship-Demonstration)
- [Concept UI Screens](https://github.com/keshav-019/stackcendra/wiki/Concept-UI-Screens)

### Planning

- [Phase 0 Foundation](https://github.com/keshav-019/stackcendra/wiki/Phase-0-Foundation)
- [Phase 0 Execution Backlog](https://github.com/keshav-019/stackcendra/wiki/Phase-0-Execution-Backlog)
- [Release 0.1 Project Discovery](https://github.com/keshav-019/stackcendra/wiki/Release-0.1-Project-Discovery)
- [Phase Delivery Framework](https://github.com/keshav-019/stackcendra/wiki/Phase-Delivery-Framework)
- [Roadmap](https://github.com/keshav-019/stackcendra/wiki/Roadmap)
- [Wiki Review Guide](https://github.com/keshav-019/stackcendra/wiki/Wiki-Review-Guide)
- [Risks Non-Goals and Decision Log](https://github.com/keshav-019/stackcendra/wiki/Risks-Non-Goals-and-Decision-Log)

### Capability phases

| Phase | Specification |
| --- | --- |
| 0 | [Foundation and Product Architecture](https://github.com/keshav-019/stackcendra/wiki/Phase-0-Foundation) |
| 1 | [Intelligent Local Project Discovery](https://github.com/keshav-019/stackcendra/wiki/Phase-1-Intelligent-Project-Discovery) |
| 2 | [Local Environment Manager](https://github.com/keshav-019/stackcendra/wiki/Phase-2-Local-Environment-Manager) |
| 3 | [Configuration Intelligence](https://github.com/keshav-019/stackcendra/wiki/Phase-3-Configuration-Intelligence) |
| 4 | [Secure SSH Client and Keychain](https://github.com/keshav-019/stackcendra/wiki/Phase-4-Secure-SSH-and-Keychain) |
| 5 | [Shortcuts, Snippets, and Actions](https://github.com/keshav-019/stackcendra/wiki/Phase-5-Actions-and-Remote-Operations) |
| 6 | [Visual Automation Flows](https://github.com/keshav-019/stackcendra/wiki/Phase-6-Visual-Automation-Flows) |
| 7 | [Git Intelligence and Delivery](https://github.com/keshav-019/stackcendra/wiki/Phase-7-Git-Intelligence-and-Delivery) |
| 8 | [Docker and Kubernetes Operations](https://github.com/keshav-019/stackcendra/wiki/Phase-8-Docker-and-Kubernetes-Operations) |
| 9 | [Multi-Cloud Support](https://github.com/keshav-019/stackcendra/wiki/Phase-9-Multi-Cloud-Support) |
| 10 | [Observability and Incident Intelligence](https://github.com/keshav-019/stackcendra/wiki/Phase-10-Observability-and-Incident-Intelligence) |
| 11 | [Production-to-Local Reproduction](https://github.com/keshav-019/stackcendra/wiki/Phase-11-Production-to-Local-Reproduction) |
| 12 | [Real-Time Collaboration](https://github.com/keshav-019/stackcendra/wiki/Phase-12-Real-Time-Collaboration) |
| 13 | [Governance and Enterprise Readiness](https://github.com/keshav-019/stackcendra/wiki/Phase-13-Governance-and-Enterprise-Readiness) |

### Engineering

- [System Architecture](https://github.com/keshav-019/stackcendra/wiki/System-Architecture)
- [Security and Trust Model](https://github.com/keshav-019/stackcendra/wiki/Security-and-Trust-Model)
- [Data Contracts and Events](https://github.com/keshav-019/stackcendra/wiki/Data-Contracts-and-Events)
- [Local Development Environment](https://github.com/keshav-019/stackcendra/wiki/Local-Development-Environment)
- [Toolchain Setup Record](https://github.com/keshav-019/stackcendra/wiki/Toolchain-Setup-Record)
- [External Platform Setup](https://github.com/keshav-019/stackcendra/wiki/External-Platform-Setup)
- [Testing Quality and Observability](https://github.com/keshav-019/stackcendra/wiki/Testing-Quality-and-Observability)
- [Architecture Decisions](https://github.com/keshav-019/stackcendra/wiki/Architecture-Decisions)

## Phase 0 exit summary

Phase 0 is complete only when:

- the product wedge and release 0.1 scope are unambiguous;
- architecture and security decisions are recorded;
- the repository has a reproducible monorepo foundation;
- required local tools are installed and verified;
- web and desktop shells can identify the same device and project contract;
- CI enforces formatting, static analysis, tests, secret scanning, and dependency checks;
- every runtime unit emits correlated telemetry;
- a contributor can follow the setup guide from a clean machine.

## Current decisions

- Use Node.js 24 LTS for the JavaScript toolchain.
- Use pnpm workspaces as the package and workspace manager for the full monorepo; the current lightweight Next.js shell still uses npm and is migrated to the pnpm workspace during P0-004.
- Migrate the Vite prototype to the Next.js App Router; Next.js remains a React framework. A lightweight App Router shell (routing and build only, no monorepo/contracts/CI) is in place; the full P0-005 scope remains planned.
- Use Tauri 2 with the Rust stable MSVC toolchain for the desktop application.
- Ship two product editions — Individual (free, fully local) and Enterprise (adds team, policy, and audit coordination) — on the same desktop-first core; see [ADR 0007](https://github.com/keshav-019/stackcendra/wiki/ADR-0007-Two-Edition-Product-Model).
- Privileged local capabilities (SSH, filesystem, terminals, Docker, private keys) are desktop-only in both editions and are never exposed as ordinary web/browser APIs, regardless of edition.
- Use Auth.js with GitHub OAuth (JWT session) as a starting point for real web sign-in; this is not yet the final identity-provider decision for Enterprise SSO or the desktop app — see [ADR 0008](https://github.com/keshav-019/stackcendra/wiki/ADR-0008-GitHub-OAuth-For-Web-Auth).
- Every route except `/login` and `/signup` requires a real session, enforced by middleware — see [ADR 0009](https://github.com/keshav-019/stackcendra/wiki/ADR-0009-Route-Gating).
- Persist users and linked OAuth accounts to Postgres via the official Auth.js adapter, while keeping the session token itself a JWT — see [ADR 0010](https://github.com/keshav-019/stackcendra/wiki/ADR-0010-Postgres-User-Persistence).
- Request GitHub repo access only when connecting a project, never bundled into sign-in, using a second, separate GitHub OAuth App with its own encrypted server-side token storage — see [ADR 0011](https://github.com/keshav-019/stackcendra/wiki/ADR-0011-GitHub-Repo-Integration).
- Start the Go control plane as a modular monolith.
- Treat AI as an evidence-producing advisor, never an authorization authority.
- Keep production credentials and raw customer data out of AI prompts and local reproduction bundles.

The decision log and architecture decision records explain the reasoning and consequences behind each choice.

## Wiki maintenance habit

The Wiki is updated in the same pass as the requirement change that caused it, not on a separate cleanup pass. When a product decision, screen concept, or architectural boundary changes during implementation, the relevant page — and this Home page's decision list if the change is significant — is corrected before moving to the next task. A Wiki page describing behavior that no longer matches the repository is treated as a defect, per [Wiki Review Guide](https://github.com/keshav-019/stackcendra/wiki/Wiki-Review-Guide).

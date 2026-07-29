# StackCendra Wiki

StackCendra is an AI-native engineering workspace for preventing environment-related deployment failures and resolving incidents with evidence.

**Tagline:** From local development to verified production recovery—without switching tools.

## Current phase

The project is in **Phase 0: Foundation and product architecture**. The repository currently contains a visual prototype with mocked data. Product behavior, trust boundaries, architecture, development standards, and release gates are being documented before implementation begins.

## Canonical product question

> Why does this application work locally but fail in staging or production?

The first useful versions of StackCendra must answer that question better than a collection of disconnected dashboards.

## Wiki map

### Product

- [Product Vision and Scope](Product-Vision-and-Scope)
- [Users and Jobs to Be Done](Users-and-Jobs-to-Be-Done)
- [Product Areas and Information Architecture](Product-Areas-and-Information-Architecture)
- [Glossary](Glossary)
- [Flagship Demonstration](Flagship-Demonstration)

### Planning

- [Phase 0 Foundation](Phase-0-Foundation)
- [Phase 0 Execution Backlog](Phase-0-Execution-Backlog)
- [Release 0.1 Project Discovery](Release-0.1-Project-Discovery)
- [Roadmap](Roadmap)
- [Risks Non-Goals and Decision Log](Risks-Non-Goals-and-Decision-Log)

### Engineering

- [System Architecture](System-Architecture)
- [Security and Trust Model](Security-and-Trust-Model)
- [Data Contracts and Events](Data-Contracts-and-Events)
- [Local Development Environment](Local-Development-Environment)
- [Toolchain Setup Record](Toolchain-Setup-Record)
- [Testing Quality and Observability](Testing-Quality-and-Observability)
- [Architecture Decisions](Architecture-Decisions)

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
- Use pnpm workspaces as the package and workspace manager.
- Migrate the Vite prototype to the Next.js App Router; Next.js remains a React framework.
- Use Tauri 2 with the Rust stable MSVC toolchain for the desktop application.
- Start the Go control plane as a modular monolith.
- Treat AI as an evidence-producing advisor, never an authorization authority.
- Keep production credentials and raw customer data out of AI prompts and local reproduction bundles.

The decision log and architecture decision records explain the reasoning and consequences behind each choice.

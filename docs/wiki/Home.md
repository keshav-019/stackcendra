# StackCendra Wiki

StackCendra is an AI-native engineering workspace for preventing environment-related deployment failures and resolving incidents with evidence.

**Tagline:** From local development to verified production recovery—without switching tools.

## Current phase

The project is in **Phase 0: Foundation and product architecture**. The repository currently contains a visual prototype with mocked data. Product behavior, trust boundaries, architecture, development standards, and release gates are being documented before implementation begins.

The complete Phase 0–13 plan is now defined. Later phases are specifications, not claims of implemented behavior.

## Canonical product question

> Why does this application work locally but fail in staging or production?

The first useful versions of StackCendra must answer that question better than a collection of disconnected dashboards.

## Wiki map

### Product

- [Product Vision and Scope](Product-Vision-and-Scope.md)
- [Users and Jobs to Be Done](Users-and-Jobs-to-Be-Done.md)
- [Product Areas and Information Architecture](Product-Areas-and-Information-Architecture.md)
- [Glossary](Glossary.md)
- [Flagship Demonstration](Flagship-Demonstration.md)

### Planning

- [Phase 0 Foundation](Phase-0-Foundation.md)
- [Phase 0 Execution Backlog](Phase-0-Execution-Backlog.md)
- [Release 0.1 Project Discovery](Release-0.1-Project-Discovery.md)
- [Phase Delivery Framework](Phase-Delivery-Framework.md)
- [Roadmap](Roadmap.md)
- [Wiki Review Guide](Wiki-Review-Guide.md)
- [Risks Non-Goals and Decision Log](Risks-Non-Goals-and-Decision-Log.md)

### Capability phases

| Phase | Specification |
| --- | --- |
| 0 | [Foundation and Product Architecture](Phase-0-Foundation.md) |
| 1 | [Intelligent Local Project Discovery](Phase-1-Intelligent-Project-Discovery.md) |
| 2 | [Local Environment Manager](Phase-2-Local-Environment-Manager.md) |
| 3 | [Configuration Intelligence](Phase-3-Configuration-Intelligence.md) |
| 4 | [Secure SSH Client and Keychain](Phase-4-Secure-SSH-and-Keychain.md) |
| 5 | [Shortcuts, Snippets, and Actions](Phase-5-Actions-and-Remote-Operations.md) |
| 6 | [Visual Automation Flows](Phase-6-Visual-Automation-Flows.md) |
| 7 | [Git Intelligence and Delivery](Phase-7-Git-Intelligence-and-Delivery.md) |
| 8 | [Docker and Kubernetes Operations](Phase-8-Docker-and-Kubernetes-Operations.md) |
| 9 | [Multi-Cloud Support](Phase-9-Multi-Cloud-Support.md) |
| 10 | [Observability and Incident Intelligence](Phase-10-Observability-and-Incident-Intelligence.md) |
| 11 | [Production-to-Local Reproduction](Phase-11-Production-to-Local-Reproduction.md) |
| 12 | [Real-Time Collaboration](Phase-12-Real-Time-Collaboration.md) |
| 13 | [Governance and Enterprise Readiness](Phase-13-Governance-and-Enterprise-Readiness.md) |

### Engineering

- [System Architecture](System-Architecture.md)
- [Security and Trust Model](Security-and-Trust-Model.md)
- [Data Contracts and Events](Data-Contracts-and-Events.md)
- [Local Development Environment](Local-Development-Environment.md)
- [Toolchain Setup Record](Toolchain-Setup-Record.md)
- [Testing Quality and Observability](Testing-Quality-and-Observability.md)
- [Architecture Decisions](Architecture-Decisions.md)

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

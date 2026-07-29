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

- [Product Vision and Scope](https://github.com/keshav-019/stackcendra/wiki/Product-Vision-and-Scope)
- [Users and Jobs to Be Done](https://github.com/keshav-019/stackcendra/wiki/Users-and-Jobs-to-Be-Done)
- [Product Areas and Information Architecture](https://github.com/keshav-019/stackcendra/wiki/Product-Areas-and-Information-Architecture)
- [Glossary](https://github.com/keshav-019/stackcendra/wiki/Glossary)
- [Flagship Demonstration](https://github.com/keshav-019/stackcendra/wiki/Flagship-Demonstration)

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
- Use pnpm workspaces as the package and workspace manager.
- Migrate the Vite prototype to the Next.js App Router; Next.js remains a React framework.
- Use Tauri 2 with the Rust stable MSVC toolchain for the desktop application.
- Start the Go control plane as a modular monolith.
- Treat AI as an evidence-producing advisor, never an authorization authority.
- Keep production credentials and raw customer data out of AI prompts and local reproduction bundles.

The decision log and architecture decision records explain the reasoning and consequences behind each choice.

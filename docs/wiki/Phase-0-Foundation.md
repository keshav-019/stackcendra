# Phase 0: Foundation and Product Architecture

## Purpose

Phase 0 turns the existing visual prototype and product roadmap into a secure, reproducible engineering foundation. It is a planning and enablement phase, not a feature-expansion phase.

## Phase sequence

Phase 0 proceeds in this order:

1. establish the product contract and non-goals;
2. document architecture, security, data, and quality policies;
3. record decisions and unresolved questions;
4. install and verify the local toolchain;
5. establish the monorepo and shared contracts;
6. migrate the visual prototype to the planned web and desktop shells;
7. add automated quality and telemetry baselines;
8. verify the complete foundation against explicit exit criteria.

Documentation must precede tool installation and repository restructuring so implementation choices can be reviewed against an agreed target.

## Deliverables

### Product foundation

- product vision, positioning, and vocabulary;
- primary users and jobs to be done;
- release 0.1 scope, non-goals, and acceptance tests;
- product information architecture;
- flagship demonstration specification;
- sequenced roadmap and release gates.

### Engineering foundation

- target monorepo structure;
- Next.js web shell;
- Tauri desktop shell using the shared interface;
- shared TypeScript and cross-language contracts;
- organization, user, project, repository, service, environment, device, and audit concepts;
- local development environment;
- continuous integration;
- baseline telemetry and correlation identifiers;
- architecture decision records.

### Security foundation

- trust-boundary diagram;
- threat model;
- capability and command authorization model;
- secret-handling rules;
- audit-event contract;
- dependency, license, secret, and artifact scanning;
- device identity and revocation design.

### Developer-experience foundation

- pinned tool versions and package-manager policy;
- one-command validation workflow;
- fixture and example repository conventions;
- contributor setup documentation;
- issue and pull-request templates later in the phase;
- changelog and release conventions.

## Target repository shape

```text
/
├─ apps/
│  ├─ web/                    # Next.js
│  └─ desktop/                # Tauri shell + shared UI
├─ agents/
│  └─ local-agent-rust/
├─ services/
│  ├─ control-plane-go/
│  ├─ collaboration-nest/
│  └─ intelligence-python/
├─ packages/
│  ├─ ui/
│  ├─ contracts/
│  ├─ schemas/
│  ├─ typescript-sdk/
│  └─ telemetry/
├─ infrastructure/
│  ├─ docker/
│  ├─ kubernetes/
│  └─ terraform/
├─ examples/
│  ├─ discovery-fixtures/
│  ├─ microservices-demo/
│  └─ incident-scenarios/
└─ docs/
   ├─ wiki/
   └─ adr/
```

Directories are introduced when their first owned capability is implemented. Empty service scaffolds are not a Phase 0 success metric.

## Workstreams

### P0.1 — Documentation baseline

Output:

- complete Wiki;
- README linked to the Wiki;
- initial architecture decisions;
- terminology and ownership boundaries.

Gate: another engineer can explain the release 0.1 workflow, safety boundaries, and completion criteria without reading the original long-form brief.

### P0.2 — Machine readiness

Output:

- Node.js 24 LTS;
- pnpm through Corepack;
- Rust stable MSVC through rustup;
- Docker Desktop and Compose v2;
- verified Git, WSL, Visual C++ tools, and WebView2;
- Go and Python policies documented, with runtimes installed before their first active modules.

Gate: all foundation verification commands pass and exact versions are recorded.

### P0.3 — Monorepo foundation

Output:

- pnpm workspace;
- task orchestration selected only if workspace scripts become insufficient;
- shared linting, formatting, and TypeScript configuration;
- dependency-boundary rules;
- deterministic lockfile;
- repository metadata and contribution guidance.

Gate: a clean checkout installs reproducibly and runs validation from the repository root.

### P0.4 — Interface migration

Output:

- Next.js App Router web application;
- reusable UI package;
- Tauri 2 desktop application consuming the shared interface;
- visual prototype preserved where it supports the product wedge;
- later-phase sprint and video concepts removed from primary navigation or explicitly marked as future.

Gate: the same project shell runs in a browser and Tauri without duplicating product components.

### P0.5 — Contracts and identity skeleton

Output:

- versioned public REST conventions;
- internal RPC and event conventions;
- JSON Schema conventions for user-editable configuration;
- device-registration model;
- initial audit-event envelope;
- generated-client strategy.

Gate: representative contracts generate or validate in every active language.

### P0.6 — Quality, security, and observability

Output:

- formatting, linting, type checking, and unit tests;
- secret and dependency scanning;
- SBOM strategy;
- OpenTelemetry initialization;
- trace, request, device, workflow, and audit correlation rules.

Gate: a sample request or desktop command can be traced across its active boundaries without leaking secrets.

## Exit criteria

Phase 0 is complete only when all of the following are true:

- the Wiki and decision records match the implemented foundation;
- the old Lovable identity and build assumptions are removed;
- one package manager and lockfile policy is enforced;
- web and desktop shells start from documented commands;
- security-sensitive capabilities are denied by default;
- a device can be represented and paired in a development-only flow;
- a project record can be created through a contract-backed path;
- active components emit structured logs and correlated traces;
- CI validates every supported runtime and blocks known secret leakage;
- a new contributor can prepare the project from the setup guide;
- release 0.1 can begin without reopening foundational product questions.

## Definition of done for Phase 0 work

A Phase 0 change is done when:

- its decision or requirement is documented;
- implementation and tests agree with the documentation;
- validation can run non-interactively;
- security and telemetry implications are considered;
- rollback or migration consequences are recorded;
- no placeholder claims are presented as working product behavior.

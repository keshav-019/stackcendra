# Risks, Non-Goals, and Decision Log

## Primary risks

### Scope dilution

**Risk:** The platform becomes a collection of shallow replacements for mature tools.

**Response:** Every active capability must support the environment-failure workflow and a current release gate. Sprint management, general chat, and video remain deferred.

### Privilege and credential exposure

**Risk:** Local, SSH, Docker, cloud, and production access create a high-impact attack surface.

**Response:** Local-first credentials, capability-scoped execution, short-lived identity, deterministic policy, explicit approval, redaction, and complete auditability.

### AI overclaiming

**Risk:** Generated diagnoses sound confident without sufficient evidence.

**Response:** Deterministic collection, evidence-linked claims, confidence calibration, contradiction display, and no AI authorization.

### Cross-platform complexity

**Risk:** Windows, Linux, filesystem, terminal, process, and container differences slow delivery.

**Response:** Platform interfaces, shared fixtures, primary Windows and Linux support, CI matrices, and deferred macOS distribution.

### Service sprawl

**Risk:** Multiple languages become résumé-driven deployment complexity.

**Response:** A language enters active use only when it owns a responsibility that cannot be served cleanly by an active component. Go begins as a modular monolith, and Rust may initially combine the Tauri native layer and local agent.

### Toolchain drift

**Risk:** Contributors run incompatible global versions and unbounded container tags.

**Response:** Version files, pinned package manager, frozen lockfiles, container version policy, automated verification, and documented upgrade cadence.

### Unbounded local scanning

**Risk:** Large or malicious repositories cause resource exhaustion or escape the selected root.

**Response:** Canonical paths, symlink policy, exclusions, parser limits, cancellation, incremental indexes, and adversarial fixtures.

### Hosted operating cost

**Risk:** AI inference, telemetry ingestion, workflows, and WebRTC become expensive before the product is validated.

**Response:** Local processing, bring-your-own-provider options, short retention, sampling, customer-hosted runners, and optional video.

### Documentation drift

**Risk:** Wiki promises diverge from implementation.

**Response:** Keep source pages in the main repository, review docs with changes, link decision records, and treat documentation accuracy as a release gate.

### Solo-developer throughput

**Risk:** A 12–18 month roadmap delays demonstrable value.

**Response:** Release small complete outcomes, maintain a single flagship fixture, and defer integrations until a release depends on them.

## Standing non-goals

Until explicitly promoted by a release decision, StackCendra will not:

- replace Jira, Linear, Slack, Teams, or GitHub;
- host general-purpose developer virtual machines;
- build custom multiparty video infrastructure;
- autonomously remediate production;
- store plaintext credentials;
- copy raw production data into local reproductions;
- require a graph database;
- require Kubernetes for development;
- deploy every module separately;
- support every cloud and language simultaneously;
- become a high-volume general log-storage vendor.

## Decision log

| ID | Decision | Status |
| --- | --- | --- |
| D-001 | Focus first on environment-related failure prevention and reproduction | Accepted |
| D-002 | Make project discovery release 0.1 | Accepted |
| D-003 | Use Node.js 24 LTS, not Node.js Current | Accepted |
| D-004 | Use pnpm as the only JavaScript package manager | Accepted |
| D-005 | Migrate Vite routing to the Next.js App Router | Accepted |
| D-006 | Use Tauri 2 and Rust for privileged local capabilities | Accepted |
| D-007 | Start infrastructure control as a Go modular monolith | Accepted |
| D-008 | Use PostgreSQL relationships before a graph database | Accepted |
| D-009 | Separate AI proposals from policy, approval, and execution | Accepted |
| D-010 | Keep versioned Wiki source in the main repository | Accepted |
| D-011 | Defer sprint, task, and video features from primary navigation | Accepted |
| D-012 | Require deterministic discovery without an AI provider | Accepted |

## Open decisions

These questions must be resolved before their dependent work begins:

- authentication provider and self-hosting strategy;
- exact monorepo task orchestrator, if pnpm scripts are insufficient;
- local Rust IPC boundary between the Tauri process and a separate agent;
- database migration tool;
- initial policy engine timing and whether OPA is needed before production automation;
- telemetry storage for the public demonstration;
- hosted AI provider abstraction and local embedding model;
- licensing model for the repository and future commercial components;
- product naming and trademark review beyond the working name StackCendra.

## Review cadence

- Phase and release gates review active risks.
- Security-sensitive architecture changes require a threat-model update.
- Accepted decisions are superseded through a new record rather than silently rewritten.
- Open decisions receive an owner, trigger, and deadline when their dependent work is scheduled.

# Development Roadmap

## Roadmap rule

Each release must complete a user outcome and produce a demonstrable artifact. Dates are forecasts, not promises; gates are based on evidence.

A capability phase is an engineering dependency boundary; a public release is a useful product package. They are not required to map one-to-one. See [Phase Delivery Framework](Phase-Delivery-Framework.md).

## Foundation

### Phase 0 — Foundation and product architecture

Promise: StackCendra has an agreed product contract, secure architecture, reproducible toolchain, monorepo foundation, web and desktop shells, quality gates, and telemetry baseline.

See [Phase 0 Foundation](Phase-0-Foundation.md).

## Public release sequence

| Release | Product promise | Primary capability |
| --- | --- | --- |
| 0.1 | Detect and explain local projects | Read-only project discovery |
| 0.2 | Generate runnable local environments | Docker/Compose proposals and runtime management |
| 0.3 | Understand and compare configuration | Contracts, drift, readiness |
| 0.4 | Securely connect to remote hosts | SSH, keychain, SFTP, tunnels |
| 0.5 | Automate repeatable operations | Versioned Actions |
| 0.6 | Deliver through controlled flows | Durable workflows, gates, rollback |
| 0.7 | Connect changes to delivery | Git and pull-request intelligence |
| 0.8 | Understand runtime topology | Docker and Kubernetes operations |
| 0.9 | Diagnose incidents with evidence | Telemetry correlation and hypotheses |
| 1.0 | Reproduce production failures locally | Sanitized isolated reproduction |
| 1.1 | Resolve incidents collaboratively | Presence, shared notes, approvals |
| 1.2 | Expand infrastructure coverage | Additional cloud providers |
| Later 1.x | Govern enterprise operations | SSO, policy, audit export, retention, and enterprise controls |

## Capability phases

### Phase 1 — Intelligent local project discovery

- trusted directory scanning;
- stack and runtime detection;
- service and dependency mapping;
- evidence and confidence;
- editable project catalog.

Gate: the mixed-language fixture is detected correctly and displayed as an evidence-backed dependency graph.

Full specification: [Phase 1 Intelligent Local Project Discovery](Phase-1-Intelligent-Project-Discovery.md).

### Phase 2 — Local environment manager

- Dockerfile and Compose proposals;
- health checks, networks, and volumes;
- editable previews;
- start, stop, restart, rebuild, logs, and health;
- port conflict ownership and resolution.

Gate: a new developer can run a fixture without installing its databases or service runtimes directly.

Full specification: [Phase 2 Local Environment Manager](Phase-2-Local-Environment-Manager.md).

### Phase 3 — Configuration intelligence

- environment-variable discovery;
- configuration contracts;
- environment comparison;
- drift and unsafe-default detection;
- secret references and deployment readiness.

Gate: a pull request adding a required configuration value is detected before deployment.

Full specification: [Phase 3 Configuration Intelligence](Phase-3-Configuration-Intelligence.md).

### Phase 4 — Secure SSH client and keychain

- host management;
- terminal and SFTP;
- local, remote, and dynamic forwarding;
- Ed25519 keys and OS keychain;
- local-only and automation-vault trust modes.

Gate: a locally generated key can be installed on an authorized VM and used without exposing private key material to the cloud.

Full specification: [Phase 4 Secure SSH and Keychain](Phase-4-Secure-SSH-and-Keychain.md).

### Phase 5 — Actions

- parameterized command definitions;
- target selection and safe previews;
- permission, timeout, retry, and validation rules;
- reusable versioned operations;
- redacted output and audit history.

Gate: a repeatable remote operation executes through an explicitly authorized, auditable path.

Full specification: [Phase 5 Actions and Remote Operations](Phase-5-Actions-and-Remote-Operations.md).

### Phase 6 — Visual automation flows

- directed action graphs;
- conditions, parallelism, approvals, health gates, and rollback;
- Temporal-backed durability;
- canary, rolling, and blue/green strategies.

Gate: a failed deployment safely rolls back and preserves its execution timeline.

Full specification: [Phase 6 Visual Automation Flows](Phase-6-Visual-Automation-Flows.md).

### Phase 7 — Git intelligence and delivery

- repositories, branches, commits, diffs, and pull requests;
- change impact;
- configuration-change detection;
- deployment association;
- GitHub first, followed by GitLab.

Gate: a production deployment can be traced to its reviewed change, artifact, configuration version, and approvers.

Full specification: [Phase 7 Git Intelligence and Delivery](Phase-7-Git-Intelligence-and-Delivery.md).

### Phase 8 — Docker and Kubernetes operations

- topology, health, logs, exec, events, and resource usage;
- Kubernetes workloads and manifests;
- Helm and rollout inspection;
- constrained operational actions.

Gate: unhealthy resources can be connected to the deployment and configuration that created them.

Full specification: [Phase 8 Docker and Kubernetes Operations](Phase-8-Docker-and-Kubernetes-Operations.md).

### Phase 9 — Cloud support

- provider-neutral resource model;
- AWS inventory and telemetry first;
- GCP and Azure adapters later;
- customer-hosted runners for protected networks.

Gate: cloud resources can be inventoried and associated with StackCendra projects without broad persistent credentials.

Full specification: [Phase 9 Multi-Cloud Support](Phase-9-Multi-Cloud-Support.md).

### Phase 10 — Observability and incident intelligence

- OpenTelemetry correlation;
- logs, metrics, and traces;
- anomaly and incident creation;
- evidence planner and ranked hypotheses;
- human-approved remediation.

Gate: a hypothesis connects Git, configuration, deployments, and runtime evidence rather than summarizing log text alone.

Full specification: [Phase 10 Observability and Incident Intelligence](Phase-10-Observability-and-Incident-Intelligence.md).

### Phase 11 — Production-to-local reproduction

- select incident and deployment;
- create isolated Git worktree;
- sanitize configuration;
- generate dependencies and synthetic data;
- replay a representative request;
- verify a proposed fix.

Gate: a production failure is reproduced without raw customer data or production credentials.

Full specification: [Phase 11 Production-to-Local Reproduction](Phase-11-Production-to-Local-Reproduction.md).

### Phase 12 — Real-time collaboration

- incident presence and notifications;
- shared notes, annotations, and command drafts;
- approvals and decision tracking;
- optional LiveKit integration.

Gate: two users can investigate, approve, and document remediation from a shared incident room.

Full specification: [Phase 12 Real-Time Collaboration](Phase-12-Real-Time-Collaboration.md).

### Phase 13 — Governance

- OIDC and enterprise identity;
- environment-specific authorization;
- deterministic policy engine;
- comprehensive audit exports;
- organization-hosted runners and retention controls.

Gate: sensitive operations can be proven to satisfy policy, approval, identity, and evidence requirements.

Full specification: [Phase 13 Governance and Enterprise Readiness](Phase-13-Governance-and-Enterprise-Readiness.md).

## Integration priority

### Tier 1

GitHub, local Git, Docker Engine, Docker Compose, VS Code, PostgreSQL, Redis, AWS EC2, CloudWatch, Secrets Manager, and OpenTelemetry.

### Tier 2

GitLab, Kubernetes, Helm, Terraform, Prometheus, Grafana, Loki, Sentry, GCP, Azure, Linear, and Jira.

### Tier 3

Bitbucket, Datadog, New Relic, Splunk, PagerDuty, Slack, Teams, Argo CD, Flux, Jenkins, CircleCI, Vault, and Pulumi.

An integration enters active work only when a release outcome depends on it.

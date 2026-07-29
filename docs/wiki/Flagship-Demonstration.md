# Flagship Demonstration

## Purpose

The portfolio demonstration proves a complete engineering story rather than presenting disconnected screens. It evolves with each release and remains reproducible in CI and on a demonstration machine.

## Fixture application

The maintained application contains:

- Next.js storefront;
- NestJS checkout service;
- Go inventory service;
- Python recommendation service;
- Java payment mock;
- PostgreSQL;
- Redis;
- Docker Compose;
- Kubernetes manifests;
- OpenTelemetry instrumentation.

The fixture intentionally contains versioned incident scenarios. Every scenario documents its trigger, expected signals, safe remediation, and regression verification.

## Primary scenario

### Missing configuration and latency regression

1. The desktop agent discovers the repository.
2. It identifies application and data services with evidence.
3. StackCendra generates a local environment proposal.
4. Configuration analysis identifies required values.
5. A change introduces `ANALYTICS_DATABASE_URL`.
6. Git analysis associates the requirement with the analytics worker.
7. Production lacks the required configuration reference.
8. Deployment readiness falls and promotion is blocked.
9. The user synchronizes the configuration schema and creates a secret reference.
10. Connectivity and policy checks pass.
11. Deployment progresses through testing and staging.
12. A production canary raises error rate and latency.
13. StackCendra correlates the incident with a timeout change.
14. The system recommends restoring the last validated timeout.
15. Authorized users approve the action.
16. A constrained runner performs the rollback.
17. Health gates verify recovery.
18. StackCendra creates a sanitized local reproduction of the original failure.
19. A regression test and postmortem draft are generated.
20. The complete evidence and approval timeline remains in the audit trail.

## Demonstration evolution

| Release | Demonstrated section |
| --- | --- |
| 0.1 | Repository and service discovery |
| 0.2 | Local environment generation and startup |
| 0.3 | Missing-variable detection and readiness block |
| 0.4 | Authorized connection to a demonstration VM |
| 0.5 | Repeatable remote validation action |
| 0.6 | Health-gated canary and rollback |
| 0.7 | Change and pull-request correlation |
| 0.8 | Runtime topology and health |
| 0.9 | Evidence-backed incident hypothesis |
| 1.0 | Sanitized production-to-local reproduction |
| 1.1 | Collaborative approval and postmortem |

## Evidence requirements

The demonstration must:

- run from a documented clean state;
- use deterministic scenario seeds;
- show source evidence for inferred facts;
- expose uncertainty and conflicting evidence;
- avoid real customer data and production credentials;
- produce a machine-readable result report;
- preserve traces and audit references;
- fail clearly if a prerequisite is missing.

## Portfolio narrative

The demonstration should let a reviewer see:

- a secure Rust desktop and local systems component;
- an advanced Next.js and TypeScript product interface;
- a concurrent Go infrastructure control plane;
- an evidence-driven Python intelligence service;
- cross-language contracts and PostgreSQL data design;
- Docker, Kubernetes, Git, cloud, SSH, and OpenTelemetry integration;
- durable, approval-based automation;
- explicit security and human-control boundaries.

Technologies appear only when they own a necessary responsibility in the scenario.

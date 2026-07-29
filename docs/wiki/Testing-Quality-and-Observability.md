# Testing, Quality, and Observability

## Quality objective

StackCendra must earn trust before it receives privileged access. Tests focus on evidence correctness, boundary enforcement, reproducibility, and safe failure—not only interface snapshots.

## Test layers

### Unit tests

- manifest and configuration parsers;
- confidence and conflict rules;
- path-containment logic;
- redaction;
- policy evaluation;
- schema validation;
- pure workflow decisions.

### Fixture tests

Versioned repositories cover:

- supported frameworks and package managers;
- monorepos and nested repositories;
- malformed and adversarial files;
- symlinks and Windows junctions;
- secrets and high-entropy values;
- large generated directories;
- conflicting runtime declarations;
- platform-specific path behavior.

Each fixture declares expected facts, ignored facts, warnings, and evidence.

### Contract tests

- OpenAPI request and response compatibility;
- Protocol Buffer compatibility;
- event schema evolution;
- generated-client behavior;
- cross-language serialization.

### Integration tests

- Tauri command boundary;
- local agent and UI communication;
- PostgreSQL transactions and outbox;
- Docker provider against disposable resources;
- Git operations against temporary repositories;
- telemetry propagation.

### End-to-end tests

Run the canonical user workflow through the desktop and web surfaces using deterministic fixtures. E2E tests verify behavior, not decorative implementation details.

### Security tests

- authorization denial paths;
- path traversal and symlink escape;
- prompt-injection containment;
- secret redaction;
- malicious archive and manifest handling;
- command and parameter tampering;
- replay and expired capability tokens;
- tenant isolation;
- dependency and artifact provenance.

### Performance and resilience tests

- large-repository scanning;
- incremental rescans;
- cancellation;
- parser time and memory limits;
- dropped connections and retry behavior;
- duplicate events;
- unavailable AI or provider services;
- runner interruption and workflow resumption.

## Continuous integration gates

Every pull request must eventually enforce:

- formatting;
- linting;
- type checking;
- unit and fixture tests;
- contract compatibility;
- secret scanning;
- dependency vulnerability review;
- license policy;
- build provenance and SBOM generation for releases.

Expensive platform or integration suites run selectively or on scheduled workflows with visible status.

## Definition of done

A capability is complete when:

- requirements and non-goals are documented;
- success and failure paths are tested;
- permissions and data classification are reviewed;
- structured logs, metrics, and traces exist;
- user-visible errors explain recovery;
- the demonstration fixture exercises the capability;
- documentation matches current behavior;
- rollback or compatibility impact is recorded.

## Observability baseline

Use OpenTelemetry across active runtime units.

### Traces

Trace:

- API requests;
- desktop commands;
- scans and detector stages;
- provider operations;
- workflow activities;
- evidence collection;
- AI requests with content excluded by default.

### Metrics

Initial metrics:

- scan duration and files considered;
- detector facts, conflicts, and failures;
- cancellation latency;
- redaction counts;
- API latency and error rate;
- outbox lag;
- workflow retries;
- authorization denials;
- AI request latency, cost class, and evidence count.

Metrics must not use high-cardinality user, path, repository, or secret values as labels.

### Logs

Logs are structured and include safe correlation identifiers. Raw file contents, environment values, credentials, command output containing secrets, and customer payloads are excluded or redacted.

## Service objectives

Formal SLOs begin when a hosted beta has representative use. Before then, every release records:

- correctness targets;
- performance targets and benchmark hardware;
- resource limits;
- supported failure behavior;
- known constraints.

## Release evidence

A release candidate includes:

- validation results;
- dependency and security reports;
- relevant benchmark comparison;
- generated SBOM;
- migration notes;
- demonstration result;
- known limitations;
- rollback instructions.

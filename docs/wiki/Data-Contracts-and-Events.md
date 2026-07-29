# Data, Contracts, and Events

## Data strategy

PostgreSQL is the initial system of record. Resource relationships are represented relationally until measured graph traversal requirements justify a separate graph database.

## Core entities

Identity and tenancy:

- Organization
- User
- Team
- Membership
- Role
- Device
- Runner
- ServiceAccount

Engineering model:

- Project
- Repository
- Service
- Environment
- RuntimeRequirement
- ToolRequirement
- PortRequirement
- Dependency
- Scan
- Evidence
- UserCorrection

Configuration:

- ConfigurationContract
- ConfigurationVariable
- ConfigurationVersion
- SecretReference
- ValidationResult
- DriftFinding

Operations:

- Host
- CredentialMetadata
- Container
- Cluster
- CloudResource
- Action
- ActionVersion
- Flow
- FlowVersion
- FlowRun
- Deployment
- Approval
- Incident
- Hypothesis
- Remediation
- AuditEvent

## Relationship graph

Initial generic relationship tables:

```text
resource_node
resource_edge
```

Representative edges:

```text
Repository CONTAINS Service
Service REQUIRES ConfigurationVariable
Service DEPENDS_ON Service
Environment PROVIDES ConfigurationVersion
Commit INTRODUCES ConfigurationVariable
Deployment USES ConfigurationVersion
Container RUNS Deployment
Incident AFFECTS Service
ConfigurationChange PRECEDES Incident
Actor APPROVES Deployment
Evidence SUPPORTS Hypothesis
```

Domain tables remain the authoritative source for transactional behavior. Generic nodes and edges support exploration and correlation without hiding important constraints in an untyped graph.

## Contract allocation

| Contract type | Use |
| --- | --- |
| OpenAPI | Public and product-facing REST APIs |
| Protocol Buffers | Cross-language internal RPC |
| JSON Schema | User-editable configuration and action definitions |
| CloudEvents-inspired envelope | Asynchronous event metadata |
| Language-native types | Internal implementation details only |

Generated clients are committed only when deterministic generation and review value outweigh repository noise.

## Event envelope

```json
{
  "specversion": "1.0",
  "id": "opaque-event-id",
  "type": "project.detected.v1",
  "source": "stackcendra.local-agent",
  "subject": "projects/opaque-project-id",
  "time": "RFC3339 timestamp",
  "datacontenttype": "application/json",
  "correlationid": "opaque-correlation-id",
  "traceparent": "W3C trace context",
  "tenantid": "opaque-organization-id",
  "data": {}
}
```

Names are illustrative until schemas are implemented. Payload versions are explicit and evolve independently from application releases.

## Initial events

- `project.detected`
- `project.scan.completed`
- `configuration.requirement.discovered`
- `configuration.drift.detected`
- `deployment.started`
- `deployment.completed`
- `container.unhealthy`
- `incident.created`
- `hypothesis.generated`
- `approval.requested`
- `remediation.executed`

Events describe completed facts in past tense. Requests and commands use separate contracts.

## Delivery strategy

1. Write product state and an outbox row in the same PostgreSQL transaction.
2. Publish outbox rows asynchronously.
3. Consumers use idempotency keys and persist checkpoints.
4. Failed delivery is retried with bounded backoff and observable dead-letter handling.
5. Event payloads contain identifiers and safe metadata, not credentials or large artifacts.

Redis Streams is sufficient for early consumers. NATS JetStream is considered when replay, fan-out, throughput, or operational isolation requirements are demonstrated.

## Discovery data provenance

Detected facts distinguish:

- **observed:** parsed directly from a source;
- **inferred:** derived deterministically from multiple observations;
- **hypothesized:** proposed by AI or heuristic analysis;
- **confirmed:** accepted by a user;
- **corrected:** replaced by an attributable user decision;
- **external:** reported by a provider API.

Every fact records its detector or provider version, observation time, confidence where applicable, and evidence references.

## Schema evolution

- Schemas use semantic meaning rather than storage layout.
- Additive changes are preferred.
- Breaking changes require a new major contract version.
- Consumers are tested against current and supported previous versions.
- Database migrations are forward-tested and have rollback or roll-forward procedures.
- Sensitive fields are classified at schema definition time.
- Retention and deletion behavior is attached to data classifications.

## Data classification

| Class | Examples | Handling |
| --- | --- | --- |
| Public | Product documentation | No special restriction |
| Internal | Project names, non-secret metadata | Tenant-scoped access |
| Sensitive | Repository evidence, host metadata, logs | Encryption, minimization, retention |
| Secret | Tokens, passwords, private keys | Vault only; never ordinary tables, logs, or events |
| Regulated | Customer or personal data | Avoid collection; explicit policy and retention if unavoidable |

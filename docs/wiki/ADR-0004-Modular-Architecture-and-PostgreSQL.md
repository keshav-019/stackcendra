# ADR 0004: Begin with Modular Services and PostgreSQL Relationships

- **Status:** Accepted
- **Date:** 2026-07-30

## Context

The target architecture assigns responsibilities to several languages and describes a rich relationship graph. Premature microservices and a dedicated graph database would add deployment, consistency, and operational cost before product behavior is validated.

## Decision

Treat responsibility boundaries as code ownership boundaries before they become independent deployment units.

- The Go control plane begins as a modular monolith.
- The Rust Tauri layer and local agent may initially share a process.
- Python and NestJS services are introduced when their first required workflows begin.
- PostgreSQL stores transactional state and typed resource relationships.
- A transactional outbox publishes early integration events.

## Consequences

- Local development remains feasible on one machine.
- Transactions and migrations are easier to reason about.
- Module APIs and data ownership must still be explicit.
- Services can separate later without redesigning core contracts.
- Graph traversal is implemented relationally until profiling demonstrates a bottleneck.

## Alternatives considered

- One microservice for every roadmap module.
- A TypeScript-only backend.
- Neo4j as an initial system of record.
- A distributed event platform before real consumers exist.

## Revisit when

Measured scaling, release isolation, security isolation, team ownership, or graph traversal requirements exceed the modular design.

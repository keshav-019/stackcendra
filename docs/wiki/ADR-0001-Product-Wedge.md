# ADR 0001: Focus the Product on Environment Failures

- **Status:** Accepted
- **Date:** 2026-07-30

## Context

The long-term roadmap includes local development, configuration, Git, deployment, infrastructure, observability, incidents, collaboration, and governance. Marketing all of these simultaneously would make StackCendra appear unfocused and invite comparison with mature tools in every category.

## Decision

The product wedge is:

> Detect, reproduce, and resolve environment-related failures across local development and production.

Release 0.1 delivers read-only intelligent project discovery. Later capabilities are prioritized by how directly they strengthen the same workflow.

## Consequences

- Project discovery, configuration, environment generation, and reproduction receive priority.
- General sprint, task, messaging, and video features are deferred.
- Success is measured through complete failure-prevention and recovery scenarios.
- Integrations are selected by workflow need rather than ecosystem breadth.

## Alternatives considered

- A broad unified DevOps dashboard.
- A collaboration-first engineering workspace.
- An AI chat interface over existing operational tools.

These alternatives do not provide a sufficiently sharp initial reason to adopt the product.

## Revisit when

The core workflow has repeat usage and evidence shows an adjacent capability is necessary for retention or completion.

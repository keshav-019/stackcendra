# ADR 0005: Separate AI from Authorization and Execution

- **Status:** Accepted
- **Date:** 2026-07-30

## Context

StackCendra will analyze untrusted repositories and telemetry while proposing operations against sensitive environments. Model output is probabilistic and vulnerable to misleading evidence and prompt injection.

## Decision

AI may plan evidence collection, summarize, generate hypotheses, and draft actions. It cannot authorize commands, retrieve unrestricted credentials, or invoke production runners directly.

Execution requires:

1. a versioned action;
2. deterministic parameter validation;
3. policy evaluation;
4. required human approvals;
5. a short-lived capability for a constrained runner;
6. audit recording and health verification.

## Consequences

- AI remains useful without becoming a security principal.
- More deterministic contracts and policy work are required.
- User interfaces must distinguish hypotheses from observed facts.
- Evidence collection and prompt construction require strict minimization and redaction.
- Fully autonomous production remediation is outside the product's safety model.

## Alternatives considered

- Give an agent unrestricted shell access.
- Rely on prompt instructions for safety.
- Allow the AI service to retrieve production credentials.

These alternatives cannot provide reliable authorization or resistance to untrusted input.

## Revisit when

This invariant is not expected to be removed. Specific low-risk automation may reduce approval friction only when deterministic policy and bounded effects make it safe.

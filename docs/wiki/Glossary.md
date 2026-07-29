# Glossary

This vocabulary is normative for product documentation and contracts. New terms should not duplicate an existing concept with different wording.

## Product and tenancy

- **Organization:** The top-level tenant and policy boundary.
- **Project:** A user-defined engineering boundary containing repositories, services, environments, resources, and incidents.
- **Repository:** A Git or filesystem source root inspected by StackCendra.
- **Service:** A runnable or deployable unit, such as an API, worker, frontend, or database dependency.
- **Environment:** A named runtime context such as local, testing, staging, production, or disaster recovery.

## Discovery and evidence

- **Scan:** A bounded, read-only inspection of a trusted directory at a particular point in time.
- **Detector:** A deterministic, versioned component that emits facts from supported evidence.
- **Fact:** A normalized statement about a project, service, requirement, resource, or runtime.
- **Evidence:** A minimal reference supporting a fact or hypothesis, including provenance and observation time.
- **Observed fact:** A fact parsed directly from an authoritative source.
- **Inferred fact:** A fact derived deterministically from one or more observations.
- **Hypothesis:** A provisional explanation that may be generated heuristically or by AI and requires validation.
- **Confidence:** A calibrated measure of support for an inference or hypothesis. Confidence is not authorization.
- **User correction:** An attributable decision that replaces or qualifies a detected result.

## Configuration

- **Configuration contract:** A versioned schema describing the names, types, constraints, secrecy, defaults, and validations required by a service.
- **Configuration version:** An immutable instance of a configuration contract and its environment-specific references.
- **Secret reference:** An opaque pointer to protected credential material. It is not the secret value.
- **Drift:** An unintended or unvalidated difference between expected and observed environment state.
- **Readiness score:** A summarized deployment assessment derived from explicit blocking findings and warnings. It never overrides a blocker.

## Automation and delivery

- **Action:** A versioned, parameterized operation with defined permissions, targets, validation, and audit behavior.
- **Flow:** A durable graph of actions, conditions, approvals, health gates, retries, and rollback behavior.
- **Runner:** A constrained execution component authorized to perform a specific action against a specific target.
- **Capability:** A short-lived, signed authorization granting a narrowly defined operation.
- **Deployment:** A traceable promotion of versioned code, artifact, and configuration state to an environment.
- **Approval:** An attributable decision satisfying a named policy requirement for a specific immutable operation.

## Operations and incidents

- **Resource:** A host, container, cluster, cloud object, database, or other operational dependency.
- **Telemetry:** Structured logs, metrics, and traces describing runtime behavior.
- **Incident:** A time-bounded investigation connecting symptoms, affected resources, evidence, hypotheses, actions, and recovery.
- **Remediation:** A proposed or executed change intended to resolve an incident.
- **Recovery verification:** Deterministic checks demonstrating that health has returned to an accepted state.
- **Reproduction bundle:** A sanitized, isolated set of code, configuration structure, synthetic data, dependencies, and representative inputs used to recreate a failure locally.

## Security and governance

- **Local-only vault:** A credential mode in which decryption occurs only on the user's device and cannot support unattended cloud-initiated sessions.
- **Automation vault:** A credential mode allowing narrowly authorized runner decryption through envelope encryption and complete auditing.
- **Policy:** A deterministic rule governing whether an operation is permitted and which approvals or safeguards it requires.
- **Audit event:** An immutable security-relevant record of an actor, target, operation, decision, result, and correlation context.
- **Trusted root:** A user-approved filesystem directory that bounds a discovery operation.
- **Customer-hosted runner:** A runner deployed within a customer-controlled network and connected outward to the control plane.

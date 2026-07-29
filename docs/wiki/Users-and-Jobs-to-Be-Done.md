# Users and Jobs to Be Done

## Primary personas

### Application engineer

Needs to understand and run an unfamiliar repository without manually discovering every runtime, database, port, or environment variable.

**Job:** When I clone or inherit a project, help me understand what it needs and produce a trustworthy local setup so I can contribute without days of trial and error.

### DevOps or platform engineer

Owns delivery and environment consistency across several projects with limited time and incomplete documentation.

**Job:** Before a change is promoted, show me whether its configuration and runtime assumptions match the target environment and block unsafe differences.

### Incident responder

Must connect a production symptom to code, configuration, infrastructure, and deployment history.

**Job:** During an incident, rank likely causes by evidence, propose safe remediation, and preserve a complete timeline.

### Agency or small-team operator

Maintains many deployments without a dedicated SRE platform.

**Job:** Give me a consistent inventory and safe operating workflow across projects and virtual machines without requiring enterprise infrastructure.

## Canonical journey

1. Select a trusted directory.
2. Review requested scan boundaries.
3. Inspect detected repositories and services.
4. Correct or confirm low-confidence results.
5. Generate a configuration contract and local environment proposal.
6. Start and observe services.
7. compare local, staging, and production metadata.
8. validate a deployment against policy and health gates.
9. correlate a failure with code, configuration, and telemetry.
10. create an isolated, sanitized reproduction.
11. verify a fix and generate prevention artifacts.

## Release 0.1 journey

Release 0.1 implements only steps 1–4:

```text
Choose directory
  → approve scan boundary
  → discover repositories
  → classify services
  → infer tools, ports, and dependencies
  → show evidence and confidence
  → accept or correct the project map
```

## Safety expectations

Users must always be able to answer:

- Which directory is being scanned?
- Which files were inspected?
- What fact was inferred from each file?
- Did StackCendra execute anything?
- Did any data leave the machine?
- What will change if I accept this proposal?

Release 0.1 performs read-only discovery. It does not install dependencies, execute project scripts, start containers, open network connections to discovered services, or upload repository content.

## Experience requirements

- Results remain useful when AI providers are unavailable.
- Deterministic scanners produce the foundational facts.
- AI may explain or organize evidence but cannot silently replace it.
- Every inferred fact includes confidence, evidence, and correction controls.
- Rescans are incremental and preserve confirmed user corrections where valid.
- Large repositories expose progress, cancellation, exclusions, and resource limits.

# Product Areas and Information Architecture

## Navigation model

StackCendra is organized by engineering outcome rather than underlying technology.

```text
StackCendra
├─ Home
│  ├─ Overview
│  ├─ Projects
│  ├─ Environments
│  ├─ Incidents
│  └─ Global assistant
├─ Develop
│  ├─ Project discovery
│  ├─ Local environments
│  ├─ Terminals
│  ├─ IDE integration
│  └─ Collaborative debugging
├─ Configure
│  ├─ Configuration contracts
│  ├─ Environment comparison
│  ├─ Secret references
│  ├─ Drift detection
│  └─ Deployment readiness
├─ Connect
│  ├─ SSH hosts
│  ├─ Keychain
│  ├─ SFTP
│  ├─ Port forwarding
│  └─ Remote sessions
├─ Automate
│  ├─ Actions
│  ├─ Flows
│  ├─ Approval gates
│  ├─ Deployment strategies
│  └─ Rollbacks
├─ Operate
│  ├─ Docker
│  ├─ Kubernetes
│  ├─ Cloud resources
│  ├─ Logs, metrics, and traces
│  └─ Infrastructure health
├─ Resolve
│  ├─ Incidents
│  ├─ Root-cause hypotheses
│  ├─ Local reproduction
│  ├─ Remediation
│  └─ Postmortems
└─ Govern
   ├─ Teams and roles
   ├─ Policies
   ├─ Approvals
   ├─ Audit trail
   └─ Security reporting
```

## Progressive disclosure

The complete information architecture describes the destination, not the first navigation bar.

Release 0.1 exposes:

- Projects;
- project discovery;
- detected repositories and services;
- runtimes, tools, ports, and dependencies;
- evidence and scan history;
- settings for trusted roots and exclusions.

Empty future areas are not shown as functional product. Roadmap previews belong in documentation or an explicitly labeled preview surface.

## Core objects

### Project

A user-defined engineering boundary containing one or more repositories and services.

### Repository

A Git or filesystem source root with detected manifests, languages, and infrastructure files.

### Service

A runnable or deployable unit inferred from source evidence and confirmed by a user.

### Environment

A named runtime context such as local, testing, staging, production, or disaster recovery.

### Configuration contract

A versioned description of the values, types, constraints, secrecy, and validation requirements needed by a service.

### Resource

A host, container, cluster, database, cloud object, or other operational dependency.

### Action

A versioned, parameterized operation with explicit inputs, permissions, validation, and audit behavior.

### Flow

A durable graph of actions, gates, conditions, retries, and rollback behavior.

### Deployment

A traceable promotion of a versioned artifact and configuration state to an environment.

### Incident

A time-bounded operational investigation connecting symptoms, evidence, hypotheses, actions, and recovery verification.

## Interface principles

- Show evidence adjacent to inferred facts.
- Distinguish observed, inferred, user-confirmed, and externally reported state.
- Never use color as the only status signal.
- Make environment and execution target visible before every privileged action.
- Show pending changes before execution.
- Prefer two-dimensional, inspectable graphs over decorative 3D views.
- Keep AI explanations interruptible, attributable, and correctable.
- Preserve keyboard navigation and dense expert workflows without making onboarding depend on memorized shortcuts.

## Existing prototype treatment

Useful concepts to preserve:

- unified operational workspace;
- Git and Docker visualizations;
- debugging-session framing;
- command and AI assistance surfaces;
- notifications and mode-aware navigation.

Concepts to defer from primary navigation:

- sprint planning;
- general task management;
- built-in video calling;
- broad team-presence features;
- decorative Git visualizations.

Those features can return only after the core environment and incident workflow is validated.

# ADR 0007: Ship Individual and Enterprise Editions on One Desktop-First Core

- **Status:** Accepted
- **Date:** 2026-07-30

## Context

StackCendra will be offered to companies, not only used privately. No company evaluating a tool that touches source code, SSH credentials, cloud accounts, and production telemetry will accept storing that material on a vendor-controlled server. The trust model in [Security and Trust Model](https://github.com/keshav-019/stackcendra/wiki/Security-and-Trust-Model) already requires local-only credential handling; this decision makes that requirement a packaging boundary, not only an internal implementation detail.

At the same time, teams need shared projects, roles, approvals, and audit trails that a single-user local application cannot provide alone.

## Decision

Ship two editions from the same desktop-first core rather than two separate products:

- **Individual edition** — a free, fully local desktop application (Tauri). No organization, billing, approval workflow, or mandatory cloud account. The user supplies their own AI provider key if they want AI features. Useful entirely offline except for explicitly initiated integrations (GitHub, cloud providers, AI).
- **Enterprise edition** — adds organization membership, team roles, policy and approval gates, audit export, SSO, and organization-hosted runners. It coordinates shared state (projects, policies, approvals, audit) through the cloud control plane, but it does not change where private keys, decrypted secrets, or raw production data live.

Both editions run the same Rust local agent and the same credential vault model described in the Security and Trust Model. The cloud control plane, when used, stores metadata, ciphertext, and coordination state only — never plaintext private keys or unredacted production data, regardless of edition.

## Consequences

- The web dashboard remains a legitimate, fully functional surface for account, team, and policy management, but privileged local operations (SSH, filesystem, terminals, Docker) are only ever available through the desktop application.
- Signup must let a user choose their edition; the choice determines whether organization-scoped fields (organization name, invited members) appear, not which trust guarantees apply.
- Pricing, licensing, and enterprise procurement concerns (SSO, audit retention, data residency) attach to the Enterprise edition; they do not gate the Individual edition's core local capability.
- Desktop distribution (Tauri installers) becomes a release-blocking concern earlier than a cloud-only product would require.
- Documentation and UI copy must consistently state that credentials and sensitive data never leave the user's device, in both editions.

## Alternatives considered

- A single free/paid tier distinguished only by feature flags on a cloud-hosted product. Rejected: implies the vendor could technically access customer credentials, which contradicts the trust model and the target buyer's procurement expectations.
- Enterprise-only product with no free individual edition. Rejected: the individual edition is the fastest path to a credible public demonstration and portfolio artifact, and it seeds adoption that Enterprise sales depends on.

## Revisit when

Real enterprise procurement conversations reveal requirements (e.g., mandatory cloud-hosted execution for compliance) that conflict with the local-only credential guarantee, or the Individual edition's scope needs sharper limits to protect Enterprise conversion.

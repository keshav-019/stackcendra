# Security and Trust Model

## Security objective

StackCendra observes and eventually changes developer machines and production infrastructure. Security is therefore a product capability and a release gate, not a later hardening exercise.

This trust model applies identically to both product editions defined in [ADR 0007](https://github.com/keshav-019/stackcendra/wiki/ADR-0007-Two-Edition-Product-Model). The Enterprise edition adds organization membership, policy, approvals, and audit coordination through the cloud control plane; it does not relax the requirement that private keys and decrypted secrets remain on the user's device. A company evaluating StackCendra should be able to verify that no edition requires trusting the vendor with credential material.

## Golden execution rule

```text
AI proposes
  → user reviews
  → deterministic policy validates
  → an authorized constrained runner executes
  → audit records the action
  → health checks verify the outcome
```

No component may collapse these stages into an unrestricted AI-to-shell path.

## Trust boundaries

### Desktop device

Trusted for:

- user-approved local filesystem access;
- local-only credential decryption;
- OS keychain integration;
- interactive terminal and SSH operations;
- signing device-originated requests.

Not automatically trusted for:

- organization-wide administration;
- unattended production automation;
- exporting credential material.

### Cloud control plane

Trusted for:

- product metadata;
- workflow coordination;
- policy and approval state;
- encrypted artifact references;
- audit indexing.

It should not possess plaintext local-only private keys.

### Automation runner

Temporarily trusted for:

- a narrowly scoped target;
- a versioned action;
- short-lived authorization;
- the minimum referenced credentials;
- a bounded execution window.

It must not accept arbitrary unsanctioned commands from the AI service.

### Intelligence service

Untrusted for authorization.

It receives only approved, minimized evidence and returns hypotheses, explanations, and draft actions. Its output is treated as untrusted input to deterministic validation.

### Customer infrastructure

A protected execution target. Customer-hosted runners use outbound control connections and do not require public inbound SSH.

## Security invariants

- Private keys are never stored or transmitted as plaintext.
- Passwords, tokens, private keys, and secret values are never written to ordinary logs.
- Secret values do not enter standard AI prompts.
- Credential APIs return references and metadata, not secret material.
- SSH host-key changes are never accepted silently.
- Production execution requires explicit environment context.
- Every privileged action is versioned, attributable, reviewable, and auditable.
- Default permissions deny access.
- Device and runner credentials are short-lived or revocable.
- User-visible previews distinguish reads from writes and destructive operations.
- Local discovery never executes repository code.

## Capability model

Privileged operations require a capability token bound to:

- actor;
- device or runner;
- organization and project;
- environment;
- target resource;
- action version;
- permitted parameters;
- issue and expiry times;
- correlation and approval references;
- replay protection.

Signatures prove origin; they do not replace authorization.

## Credential modes

### Local-only vault

- encryption and decryption occur on the device;
- master material is protected by the OS keychain;
- cloud synchronization, if enabled, contains ciphertext only;
- the backend cannot initiate unattended sessions.

### Automation vault

- envelope encryption separates data-encryption and key-encryption keys;
- decryption occurs only within an authorized runner context;
- access uses short-lived identity and policy checks;
- every access produces an audit event;
- plaintext is not exposed through ordinary APIs.

The two modes remain visibly distinct so users understand whether unattended execution is possible.

## Threats and controls

| Threat | Required controls |
| --- | --- |
| Malicious repository files | No code execution during scan, parser limits, path canonicalization, sandboxed parsers where justified |
| Symlink or junction escape | Resolve paths and enforce trusted-root containment |
| Prompt injection in source/logs | Treat evidence as untrusted data, isolate instructions, deterministic tool policy |
| Secret leakage | Structured redaction, entropy/pattern scanning, minimal evidence, no raw prompt inclusion |
| Runner takeover | Short-lived identity, outbound connection, capability scoping, revocation, isolation |
| SSH interception | Known-host verification, explicit fingerprint changes, modern algorithms |
| Cross-tenant access | Tenant-scoped queries, authorization tests, opaque identifiers, audit |
| Replay of approved commands | Nonces, expiry, action-version binding, idempotency keys |
| Supply-chain compromise | Lockfiles, signatures/checksums, dependency review, SBOM, provenance |
| Audit tampering | Append-oriented records, integrity protection, restricted access, external export |
| Destructive user error | Preview, policy, typed confirmation where appropriate, backup and rollback gates |

## Secret redaction

Redaction is applied:

1. at collection boundaries;
2. before persistence;
3. before telemetry export;
4. before AI evidence preparation;
5. before user-shareable reports.

Redaction must preserve structure useful for diagnosis, such as protocol, host class, value presence, and validation outcome, without preserving secret literals.

## Audit event requirements

Every security-relevant event includes:

- actor and authentication context;
- device or runner;
- organization, project, and environment;
- action and target;
- credential reference, never credential value;
- requested and effective parameters after redaction;
- policy and approval decisions;
- outcome and verification;
- timestamp, trace ID, and correlation ID.

## Release gates

No release containing privileged access ships without:

- threat-model update;
- negative authorization tests;
- redaction tests;
- dependency and secret scanning;
- recovery and revocation procedure;
- audit coverage;
- documented data retention;
- safe failure behavior.

# Wiki Review Guide

## Purpose

Use this page to review and correct the plan before feature implementation begins. The most valuable corrections change the product contract, sequence, trust boundary, or proof of success—not only wording.

## Recommended review order

1. [Product Vision and Scope](https://github.com/keshav-019/stackcendra/wiki/Product-Vision-and-Scope)
2. [Users and Jobs to Be Done](https://github.com/keshav-019/stackcendra/wiki/Users-and-Jobs-to-Be-Done)
3. [Phase Delivery Framework](https://github.com/keshav-019/stackcendra/wiki/Phase-Delivery-Framework)
4. [Roadmap](https://github.com/keshav-019/stackcendra/wiki/Roadmap)
5. Phases 0–3, which define the product wedge
6. [Security and Trust Model](https://github.com/keshav-019/stackcendra/wiki/Security-and-Trust-Model)
7. Phases 4–13
8. [Flagship Demonstration](https://github.com/keshav-019/stackcendra/wiki/Flagship-Demonstration)
9. [Risks Non-Goals and Decision Log](https://github.com/keshav-019/stackcendra/wiki/Risks-Non-Goals-and-Decision-Log)

## Decisions most worth correcting now

### 1. Release 0.1 boundary

Current recommendation: release 0.1 proves read-only discovery; release 0.2 owns full local-environment generation. A constrained “run this maintained fixture” demo may appear in 0.1, but it must not turn 0.1 into an unbounded generator.

Review question: should the first public promise be “detect and explain” or “detect and run”? The second is more compelling but materially larger and riskier.

### 2. Primary supported desktop platforms

The current plan requires Windows and Linux parity for core discovery behavior. macOS support is not yet an explicit first-release gate.

Review question: is Windows-first acceptable, or must the public release support Windows, Linux, and macOS together?

### 3. Cloud sequence

Current recommendation: build AWS deeply, use it in the incident workflow, then add GCP and Azure. “Multi-cloud” is not declared complete merely because three shallow inventory screens exist.

Review question: does portfolio or market access justify a different first provider?

### 4. Credential modes

Current recommendation: clearly separate a device-only vault from an automation vault. Interactive SSH access never silently becomes unattended automation access.

Review question: should encrypted synchronization of local-only ciphertext ship initially, or should the first keychain be strictly device-local?

### 5. Hosted versus customer-run execution

Current recommendation: local work runs on the desktop, protected production work defaults to a customer-hosted outbound runner, and hosted ephemeral runners serve lower-risk environments.

Review question: what operational burden and onboarding friction are acceptable for the first beta?

### 6. Incident intelligence timing

The original phase order places multi-cloud before incident intelligence. The release strategy may deliver AWS depth and incident intelligence before broad GCP and Azure support.

Review question: should Phase 9 be split into “AWS integration” and “multi-cloud expansion” to reflect this more clearly?

### 7. Collaboration scope

Current recommendation: shared evidence, notes, drafts, and approvals precede optional LiveKit calls and recording.

Review question: is live video truly differentiating, or should it remain an integration-only demonstration?

### 8. Enterprise scope

Current recommendation: authorization and audit foundations begin in Phase 0, while SAML, SCIM, legal hold, and compliance packaging wait for proven demand.

Review question: is any target buyer blocked without an earlier enterprise identity capability?

## Page-level checklist

For each phase, ask:

- Is the outcome a user result rather than a technology milestone?
- Are hard dependencies explicit and correct?
- Does the user journey include consent, uncertainty, failure, cancellation, and recovery?
- Is the system of record identified?
- Are viewing, proposing, approving, and executing distinct?
- Can every important fact link to evidence?
- Are secret values, customer data, and credentials kept out of unsafe boundaries?
- Are data ownership, versions, events, and retention clear?
- Do tests include malicious and partial-failure cases?
- Is the exit gate demonstrable and falsifiable?
- Are non-goals strong enough to prevent scope creep?
- Does the handoff provide stable inputs to the next phase?

## Consistency checklist

- A concept uses the same name across product, architecture, data, and phase pages.
- Public release promises do not exceed phase exit gates.
- Every integration has an owner, permission model, failure mode, and reconciliation plan.
- AI output is labeled as proposal or hypothesis and cites evidence.
- Every remote mutation uses an Action or flow.
- Every sensitive operation produces a policy decision and audit record.
- The flagship demonstration uses only capabilities planned by that release.
- Current status never presents a mock interface as implemented behavior.

## Correction format

Record a proposed correction with:

```text
Page:
Section:
Current statement:
Proposed statement:
Reason:
User impact:
Architecture or security impact:
Roadmap impact:
Acceptance-test change:
ADR required: yes/no
```

## Correction priority

| Priority | Meaning | Example |
| --- | --- | --- |
| P0 | Trust or product contradiction | AI can execute despite the authorization rule |
| P1 | Scope or sequence changes materially | Release 0.1 must generate and run environments |
| P2 | Important ambiguity or missing test | Port-conflict recovery lacks an acceptance case |
| P3 | Editorial improvement | Terminology or navigation cleanup |

## Review outcome

The Wiki is ready to govern implementation when:

- P0 and P1 corrections are resolved;
- release 0.1 has one unambiguous promise;
- Phase 0 and Phase 1 exit gates are accepted;
- trust boundaries and credential modes are accepted;
- the phase/release distinction is understood;
- open decisions have owners and a decision deadline.

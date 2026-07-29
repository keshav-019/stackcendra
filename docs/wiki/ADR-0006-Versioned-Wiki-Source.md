# ADR 0006: Version Wiki Source in the Main Repository

- **Status:** Accepted
- **Date:** 2026-07-30

## Context

GitHub Wiki uses a separate Git repository. Product and architecture documentation can drift from implementation if it is reviewed and changed separately from the source repository.

## Decision

Keep the canonical Markdown source under `docs/wiki` in the StackCendra repository and publish the same pages to GitHub Wiki.

The README links to both the hosted Wiki and local source. Documentation changes accompany the code or decision they describe.

## Consequences

- Pull requests can review documentation with implementation.
- The project retains documentation history if Wiki settings change.
- Publishing requires a small synchronization step.
- Direct edits in the hosted Wiki should be reconciled back into `docs/wiki`.

## Alternatives considered

- Maintain documentation only in GitHub Wiki.
- Maintain only a large README.
- Use an external documentation platform immediately.

## Revisit when

Documentation volume or publishing requirements justify a dedicated documentation site and automated publishing pipeline.

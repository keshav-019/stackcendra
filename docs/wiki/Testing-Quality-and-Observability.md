# Testing, Quality, and Observability

## Current implementation (web shell)

Most of this page describes the target testing strategy for the full multi-language platform once P0-011 (CI, supply chain, and security baseline) begins. This section instead records what is actually running today, against the Next.js web shell only.

### Unit and component tests — Vitest

- Config: `vitest.config.ts` (jsdom environment, `@` path alias matching `tsconfig.json`, v8 coverage) and `vitest.setup.ts` (jest-dom matchers, a `ResizeObserver` stub for Radix UI, and default mocks for `next/navigation` and `next-auth/react`).
- Convention: colocated `*.test.ts`/`*.test.tsx` files next to the source they test, not a mirrored test tree.
- Run with `npm run test` (single run), `npm run test:watch`, or `npm run test:coverage`.
- Current coverage: `cn()` class-merging behavior, mock-data integrity for projects and integrations (unique ids, cross-references between AI fixes and CI runs, confidence bounds), `settings-sections.ts` structure, the `Logo`/`LogoMark` component, the Signup edition-selector toggle, the Team Call live/empty-state toggle, `src/lib/crypto.ts`'s encrypt/decrypt round-trip (including that tampering with a ciphertext throws rather than silently returning garbage), and `src/lib/integrations.ts`'s GitHub/GitLab API response mapping (workflow runs, GitLab's richer pipeline-status vocabulary collapsing onto the shared `{status, conclusion}` shape, job-failure extraction) and both providers' repo/project-path validators.

### End-to-end tests — Playwright

- Config: `playwright.config.ts` — targets `http://localhost:8080`, auto-starts `npm run dev` as the `webServer` if one isn't already running, Chromium only for now.
- Run with `npm run test:e2e` (headless) or `npm run test:e2e:ui` (interactive).
- **Authenticated E2E tests cannot use real GitHub/Google sign-in** — that would mean automating a third-party consent screen with a live test account, which is out of scope. Instead, `e2e/auth-helper.ts` mints a valid Auth.js session JWT (`next-auth/jwt`'s `encode`, signed with the same `AUTH_SECRET` the dev server uses) and injects it as a cookie before the test navigates. This exercises session gating and authenticated-UI rendering correctly, but the synthetic user it represents is never written to Postgres and it does not cover the real OAuth handshake itself — that is verified manually (see [ADR 0008](https://github.com/keshav-019/stackcendra/wiki/ADR-0008-GitHub-OAuth-For-Web-Auth) and [ADR 0010](https://github.com/keshav-019/stackcendra/wiki/ADR-0010-Postgres-User-Persistence)) by confirming the redirect reaches the real provider consent screen with the correct client ID.
- Coverage: unauthenticated route gating (every protected route redirects to `/login` with the right `callbackUrl`, per [ADR 0009](https://github.com/keshav-019/stackcendra/wiki/ADR-0009-Route-Gating)), both OAuth buttons on `/login` and `/signup` reaching the real provider domain, authenticated dashboard rendering and tab switching, the "Dashboard" back-link from every non-dashboard screen, and the shared account/settings shell being reachable and section-switchable from both `/profile` and `/settings`.
- A dedicated test (`authenticated-dashboard.spec.ts`) asserts zero browser console errors on initial load specifically as a hydration-regression guard — see the note below.

### A real bug this suite caught immediately

Writing the E2E tab-switching test caught a genuine hydration bug that had survived the earlier hydration fix: `AIAssistant`'s seeded message timestamps used `toLocaleTimeString([], {...})`, and even after pinning `timeZone: 'UTC'`, the *locale* was still left to the runtime default — Node (server) and Chromium (client) resolved that default differently, rendering `02:23 PM` server-side and `02:23 pm` client-side. React's hydration-mismatch recovery discarded and regenerated a large enough part of the tree that click handling on the (unrelated, sibling) dashboard tabs broke transiently. The fix pins both the timezone and the locale explicitly (`toLocaleTimeString('en-US', { timeZone: 'UTC', ... })`). The wiki maintenance habit applies here too: the earlier hydration-safety rule in [Concept UI Screens](https://github.com/keshav-019/stackcendra/wiki/Concept-UI-Screens) only mentioned timezone, not locale — it now covers both.

### Lessons from testing real OAuth redirects (GitHub integration connect flow)

Adding E2E coverage for the GitHub repo-access connect flow (see [ADR 0011](https://github.com/keshav-019/stackcendra/wiki/ADR-0011-GitHub-Repo-Integration)) surfaced three genuine Playwright gotchas, each worth remembering rather than re-discovering:

1. **Letting the browser fully navigate to a real OAuth provider is unreliable.** Both GitHub and Google intermittently interfere with automated/headless sign-in navigation even when the constructed URL is verified correct by direct inspection. The fix that stuck: verify URL construction at the API level instead of the UI level — either read the `Location` header of our own server's redirect response directly (`page.request.get(url, { maxRedirects: 0 })`), or, for Auth.js's own sign-in endpoints, replicate what `next-auth/react`'s `signIn()` does under the hood (fetch a CSRF token, `POST /api/auth/signin/:provider` with the `X-Auth-Return-Redirect: 1` header) to get the authorize URL back as JSON without the browser ever navigating anywhere. `page.route()`-based interception-and-abort was tried first and abandoned: GitHub's own redirect chain from `/login/oauth/authorize` to `/login` isn't reliably visible to it for this navigation pattern.
2. **`page.waitForRequest('**/some/path')` is a strict suffix match against the full URL, query string included.** A request to `/api/auth/signin/google?` (an empty but present query string) does not match a glob pattern with no trailing wildcard. Prefer a predicate — `page.waitForRequest((req) => req.url().includes('/api/auth/signin/google'))` — over a glob string when the exact query string isn't guaranteed.
3. **A click can silently no-op if it lands before React finishes hydrating.** The button is visible and "actionable" by Playwright's own actionability checks well before its `onClick` handler is attached in an SSR/hydration app. `await page.waitForLoadState('networkidle')` after `page.goto()` and before the first interaction closed this gap in practice.

The same three lessons applied directly to `gitlab-integration.spec.ts` when GitLab access was added ([ADR 0012](https://github.com/keshav-019/stackcendra/wiki/ADR-0012-GitLab-Repo-Integration)) — no new gotchas needed, which is itself a small sign the earlier fixes generalize rather than being GitHub-specific accidents. One genuine new find while writing that suite's unit tests: `GITLAB_PROJECT_PATH_RE`'s "reject a path-traversal-shaped value" test initially failed, because the regex (needing to allow GitLab's multi-segment `group/subgroup/project` paths, unlike GitHub's fixed two-segment `owner/repo`) permitted a segment composed entirely of dots (e.g. `..`). Not exploitable — the value only ever reaches an outbound provider API call, never a filesystem — but the test caught a real correctness gap in both the new GitLab regex and the existing GitHub one, and both were tightened in the same pass (see [ADR 0012](https://github.com/keshav-019/stackcendra/wiki/ADR-0012-GitLab-Repo-Integration)).

### Known gaps

- No CI workflow runs these yet (still local-only); wiring GitHub Actions to run `npm run test` and `npm run test:e2e` on every PR is part of P0-011, not done.
- Playwright only runs Chromium; Firefox/WebKit projects are easy to add later but weren't necessary to catch real bugs yet.
- No visual regression testing.
- One E2E test (`github-integration.spec.ts`'s direct status-endpoint check) has been observed to fail with a Postgres `ETIMEDOUT` specifically when the full 30-test suite runs at full parallelism, while passing consistently in isolation and via every other test that reaches the same endpoint indirectly through a page load in the same run. This points to Neon free-tier connection handling under peak concurrent load from parallel workers, not an application defect — `src/lib/db.ts`'s `connectionTimeoutMillis` was widened accordingly, and `playwright.config.ts` gives local runs one retry. Running E2E against a production build (`next build && next start`) instead of `next dev` would also remove on-demand route compilation as a contributing factor, if this resurfaces.

## Quality objective

StackCendra must earn trust before it receives privileged access. Tests focus on evidence correctness, boundary enforcement, reproducibility, and safe failure—not only interface snapshots.

## Test layers

### Unit tests

- manifest and configuration parsers;
- confidence and conflict rules;
- path-containment logic;
- redaction;
- policy evaluation;
- schema validation;
- pure workflow decisions.

### Fixture tests

Versioned repositories cover:

- supported frameworks and package managers;
- monorepos and nested repositories;
- malformed and adversarial files;
- symlinks and Windows junctions;
- secrets and high-entropy values;
- large generated directories;
- conflicting runtime declarations;
- platform-specific path behavior.

Each fixture declares expected facts, ignored facts, warnings, and evidence.

### Contract tests

- OpenAPI request and response compatibility;
- Protocol Buffer compatibility;
- event schema evolution;
- generated-client behavior;
- cross-language serialization.

### Integration tests

- Tauri command boundary;
- local agent and UI communication;
- PostgreSQL transactions and outbox;
- Docker provider against disposable resources;
- Git operations against temporary repositories;
- telemetry propagation.

### End-to-end tests

Run the canonical user workflow through the desktop and web surfaces using deterministic fixtures. E2E tests verify behavior, not decorative implementation details.

### Security tests

- authorization denial paths;
- path traversal and symlink escape;
- prompt-injection containment;
- secret redaction;
- malicious archive and manifest handling;
- command and parameter tampering;
- replay and expired capability tokens;
- tenant isolation;
- dependency and artifact provenance.

### Performance and resilience tests

- large-repository scanning;
- incremental rescans;
- cancellation;
- parser time and memory limits;
- dropped connections and retry behavior;
- duplicate events;
- unavailable AI or provider services;
- runner interruption and workflow resumption.

## Continuous integration gates

Every pull request must eventually enforce:

- formatting;
- linting;
- type checking;
- unit and fixture tests;
- contract compatibility;
- secret scanning;
- dependency vulnerability review;
- license policy;
- build provenance and SBOM generation for releases.

Expensive platform or integration suites run selectively or on scheduled workflows with visible status.

## Definition of done

A capability is complete when:

- requirements and non-goals are documented;
- success and failure paths are tested;
- permissions and data classification are reviewed;
- structured logs, metrics, and traces exist;
- user-visible errors explain recovery;
- the demonstration fixture exercises the capability;
- documentation matches current behavior;
- rollback or compatibility impact is recorded.

## Observability baseline

Use OpenTelemetry across active runtime units.

### Traces

Trace:

- API requests;
- desktop commands;
- scans and detector stages;
- provider operations;
- workflow activities;
- evidence collection;
- AI requests with content excluded by default.

### Metrics

Initial metrics:

- scan duration and files considered;
- detector facts, conflicts, and failures;
- cancellation latency;
- redaction counts;
- API latency and error rate;
- outbox lag;
- workflow retries;
- authorization denials;
- AI request latency, cost class, and evidence count.

Metrics must not use high-cardinality user, path, repository, or secret values as labels.

### Logs

Logs are structured and include safe correlation identifiers. Raw file contents, environment values, credentials, command output containing secrets, and customer payloads are excluded or redacted.

## Service objectives

Formal SLOs begin when a hosted beta has representative use. Before then, every release records:

- correctness targets;
- performance targets and benchmark hardware;
- resource limits;
- supported failure behavior;
- known constraints.

## Release evidence

A release candidate includes:

- validation results;
- dependency and security reports;
- relevant benchmark comparison;
- generated SBOM;
- migration notes;
- demonstration result;
- known limitations;
- rollback instructions.

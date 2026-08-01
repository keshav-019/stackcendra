# Concept UI Screens

## Purpose

The repository is building a visual concept prototype ahead of backend implementation, screen by screen, following the [Product Areas and Information Architecture](https://github.com/keshav-019/stackcendra/wiki/Product-Areas-and-Information-Architecture) and the [capability phases](https://github.com/keshav-019/stackcendra/wiki/Roadmap). This page tracks what exists as a concept screen, what visual language it follows, and what remains.

No screen listed here is connected to a real backend, authentication provider, or privileged local capability unless explicitly stated. Concept screens exist to validate product direction before implementation.

## Visual standard

Screens follow the style established by the original prototype and carried into the Next.js shell:

- dark base (`bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`);
- glassmorphism surfaces (`bg-white/5` / `bg-black/20` with `backdrop-blur`);
- `gradient-ai` badge and `gradient-text` wordmark for brand moments;
- status communicated with color and text together, never color alone, per the interface principles in Product Areas;
- shadcn/ui + Radix primitives from `src/components/ui`, Tailwind tokens from `tailwind.config.ts` and `app/globals.css`.

Changes to this visual standard are deliberate design decisions, not incidental drift, and should be called out explicitly when they happen.

Two additions to the standard, made after early UI review:

- **No default browser or Radix scrollbar chrome.** Every scrollable region uses the auto-hiding, brand-gradient scrollbar defined globally in `app/globals.css` and in the shared `ScrollBar` component (`src/components/ui/scroll-area.tsx`), or hides its scrollbar entirely with the `.scrollbar-hide` utility when the region is a single-row list (for example, the BottomDock's AI Suggests row). Plain flat gray scrollbar pills are treated as a defect.
- **Fixed chrome must never cover scrollable content.** The BottomDock has a fixed, known height (`4.5rem`); the layout beneath it (`UnifiedDashboard`, `Sidebar`) reserves exactly that height rather than padding individual scroll regions defensively.
- **Real brand mark, not a text badge.** The placeholder `bg-gradient-ai` square with the literal text "AI" has been replaced everywhere by a real SVG mark (`src/components/Logo.tsx`, favicon at `app/icon.svg`): a stack of three bars under a small accent spark, using the same gradient. Any new header or auth-adjacent screen should import `LogoMark`/`Logo` rather than re-inventing a badge.
- **Every non-dashboard screen must have an explicit way back.** `ProjectPageShell` (used by `/projects`, `/projects/new`, `/projects/[id]`, and the account/settings shell) now always prepends a "Dashboard" breadcrumb crumb with a back arrow and a real `href="/"` — not just an implicit logo click. Relying on the brand mark alone as the only way back is treated as a defect.
- **No `Date.now()`/`Math.random()`/locale-dependent formatting in a component's initial render state.** These evaluate at both the server-render pass and the client hydration pass, at two different real moments, and reliably produce React hydration mismatches. Fixed demo timestamps use explicit UTC ISO strings (`'...Z'`) and format with **both** an explicit `timeZone: 'UTC'` **and** an explicit locale (e.g. `toLocaleTimeString('en-US', { timeZone: 'UTC', ... })`) — timezone alone is not enough, since the runtime's default locale can differ between Node (server) and the browser (client) too, e.g. rendering `02:23 PM` vs `02:23 pm`. `AIAssistant`'s seeded messages are the reference example; this exact gap was caught by the Playwright suite, see [Testing, Quality, and Observability](https://github.com/keshav-019/stackcendra/wiki/Testing-Quality-and-Observability).

## Status legend

- **Concept** — a designed, navigable screen with representative mock data.
- **Placeholder** — route or affordance exists but content is not yet designed.
- **Not started** — described in the roadmap, no screen yet.

## Screen inventory

| Area | Screen | Status | Notes |
| --- | --- | --- | --- |
| Auth | `/login` | Concept + real GitHub/Google sign-in | Both "Continue with GitHub" and "Continue with Google" are real (Auth.js, JWT session, Postgres-persisted user) per [ADR 0008](https://github.com/keshav-019/stackcendra/wiki/ADR-0008-GitHub-OAuth-For-Web-Auth) and [ADR 0010](https://github.com/keshav-019/stackcendra/wiki/ADR-0010-Postgres-User-Persistence). Email/password fields remain visual only — no password backend exists yet. Edition-agnostic. The only public route, along with `/signup`, per [ADR 0009](https://github.com/keshav-019/stackcendra/wiki/ADR-0009-Route-Gating). |
| Auth | `/signup` | Concept + real GitHub/Google sign-in | Same real GitHub/Google sign-in as `/login`. The manual form and the Individual vs Enterprise edition selector per [ADR 0007](https://github.com/keshav-019/stackcendra/wiki/ADR-0007-Two-Edition-Product-Model) remain visual only — neither persists anywhere yet. |
| Home | Unified dashboard (`/`) | Concept + real session display | Carried over from the original prototype; not yet re-cut into the Home / Develop / Configure / Connect / Automate / Operate / Resolve / Govern navigation model. Sprint and My Tasks tabs have been redesigned (see below); other tabs (Debug Session, Git Tree, Containers, Team Call) retain their original structure. `UserDropdown` now shows the real signed-in GitHub name/avatar when a session exists (via `useSession()`), and "Log out" calls a real `signOut()`. This route (and every other route except `/login`/`/signup`) now requires a real session — visiting it unauthenticated redirects to `/login`, per [ADR 0009](https://github.com/keshav-019/stackcendra/wiki/ADR-0009-Route-Gating). |
| Home | `/projects` (Projects list) | Concept | Grid of tracked projects with provider badge (GitHub/GitLab/local-only), branch, and an at-a-glance attention state (uncommitted files, commits behind origin, CI failures). Links to project detail. |
| Home | `/projects/new` (Add Project wizard) | Concept + real GitHub repo picker | Multi-step flow: basics (name, local path) → source (local-only / GitHub / GitLab) → connect → review. GitLab's connect step is still a concept OAuth handoff. GitHub's is real: "Continue with GitHub" starts the actual repo-access connect flow from [ADR 0011](https://github.com/keshav-019/stackcendra/wiki/ADR-0011-GitHub-Repo-Integration) (or, if already connected, immediately lists real repositories via `GET /api/integrations/github/repos`). Nothing scans a real filesystem yet, and creating the project still only navigates to a mock detail page. |
| Home | `/projects/[id]` (Project detail) | Concept | Previews capability that will eventually come from multiple phases: Git status (uncommitted files, ahead/behind origin) previews [Phase 1](https://github.com/keshav-019/stackcendra/wiki/Phase-1-Intelligent-Project-Discovery); CI/CD run list previews [Phase 7](https://github.com/keshav-019/stackcendra/wiki/Phase-7-Git-Intelligence-and-Delivery); the AI-suggested-fix panel (root cause, ranked evidence, confidence, diff, Apply Fix) previews [Phase 10](https://github.com/keshav-019/stackcendra/wiki/Phase-10-Observability-and-Incident-Intelligence). Applying a fix only sets local UI state — no code, commit, or deployment is touched, consistent with the golden execution rule in the Security and Trust Model. |
| Home | `/settings` and `/profile` | Concept + real session/sign-out/GitHub | Both routes render the same `AccountSettingsShell` (`src/components/settings/AccountSettingsShell.tsx`) — a persistent left sub-nav with two groups, Personal (Account, Security, Notifications, Appearance, Sessions & devices, Danger zone) and Workspace (General, Integrations, Team & members, API keys & tokens, Audit log, Plan & billing) — switching sections client-side with no page reload. `/profile` opens on Account, `/settings` opens on Integrations; either route reaches every section. Integrations lists every Tier 1–3 entry from the [Roadmap](https://github.com/keshav-019/stackcendra/wiki/Roadmap) priority table; every row except GitHub is still a connect/disconnect toggle that only changes local UI state. GitHub's row is real and labeled "Real" in the UI — live connected status, a real Connect link (starts the [ADR 0011](https://github.com/keshav-019/stackcendra/wiki/ADR-0011-GitHub-Repo-Integration) flow), and a real Disconnect. Security shows the real signed-in provider (GitHub or Google) and its real connected-accounts state; Danger zone's "Sign out" calls real `signOut()`. Everything else (Team, API keys, Audit log, General, Billing) is representative mock content, not wired to a backend. |
| Develop | Project discovery | Not started | Release 0.1 primary surface; see [Phase 1](https://github.com/keshav-019/stackcendra/wiki/Phase-1-Intelligent-Project-Discovery). The Projects list and Add Project wizard above are early concept previews, not the real discovery engine. |
| Develop | Local environments | Not started | See [Phase 2](https://github.com/keshav-019/stackcendra/wiki/Phase-2-Local-Environment-Manager). |
| Configure | Configuration contracts and drift | Not started | See [Phase 3](https://github.com/keshav-019/stackcendra/wiki/Phase-3-Configuration-Intelligence). |
| Connect | SSH hosts and keychain | Not started | See [Phase 4](https://github.com/keshav-019/stackcendra/wiki/Phase-4-Secure-SSH-and-Keychain). Desktop-only; must never be reachable from the web shell. |
| Automate | Actions and Flows | Not started | See [Phase 5](https://github.com/keshav-019/stackcendra/wiki/Phase-5-Actions-and-Remote-Operations) and [Phase 6](https://github.com/keshav-019/stackcendra/wiki/Phase-6-Visual-Automation-Flows). |
| Operate | Docker / Kubernetes / cloud topology | Concept (partial) | The dashboard's Containers tab now marks "Deploy All" as desktop-only and states it scans `docker-compose.yml` files, but the topology view itself is still the original placeholder visualization pending a real design direction from the user. Kubernetes and cloud topology remain not started; see [Phase 8](https://github.com/keshav-019/stackcendra/wiki/Phase-8-Docker-and-Kubernetes-Operations) and [Phase 9](https://github.com/keshav-019/stackcendra/wiki/Phase-9-Multi-Cloud-Support). |
| Resolve | Incidents and root-cause hypotheses | Not started | See [Phase 10](https://github.com/keshav-019/stackcendra/wiki/Phase-10-Observability-and-Incident-Intelligence) and [Phase 11](https://github.com/keshav-019/stackcendra/wiki/Phase-11-Production-to-Local-Reproduction). The AI-suggested-fix panel on `/projects/[id]` is the first concept preview of this area. |
| Govern | Teams, policies, audit | Not started | See [Phase 13](https://github.com/keshav-019/stackcendra/wiki/Phase-13-Governance-and-Enterprise-Readiness); Enterprise edition only. |

## Redesigned screens

- **Sprint (dashboard tab):** rebuilt as a Jira-style board — issue keys, type icons (story/bug/task), priority-colored left border, story points, assignee avatar, three columns (To Do / In Progress / Done). Replaces the earlier plain card-list layout.
- **My Tasks (dashboard tab):** rebuilt as a Google-Tasks-style checklist — circular completion toggle, grouped by Today / This week / Later / Completed (collapsed by default), inline "Add a task" row, star for priority. Replaces the earlier heavy per-task card with progress bars.
- **Team Call (dashboard tab):** the live call UI (participant tiles, speaker view, controls) is now gated behind a call-state toggle. Default state is "no call in progress" with a "Start Instant Call" empty state; the original live-call UI is preserved and appears only when a call is active. Scheduled Calls remains visible in both states.

## Working process

1. New screens are proposed and built against the visual standard above, using representative mock data clearly distinguishable from live product state.
2. When a screen's concept changes based on feedback, the change is implemented and this table is updated in the same pass — an outdated row here is treated as a defect.
3. Screens move from Concept toward real implementation only when their capability phase begins real engineering work, per the [Phase Delivery Framework](https://github.com/keshav-019/stackcendra/wiki/Phase-Delivery-Framework).

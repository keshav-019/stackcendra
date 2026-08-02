# ADR 0013: Provider Mode Switching — a Real GitHub/GitLab-Scoped Dashboard View

- **Status:** Accepted
- **Date:** 2026-08-02

## Context

By this point GitHub and GitLab were both really connected (ADR-0011, ADR-0012) — real OAuth, real repo/project access, real CI/CD data — but that real access only surfaced in one place: the Settings → Integrations page, sitting alongside twenty mock integration rows. The dashboard itself (`UnifiedDashboard`) remained entirely mock: Debug Session, Git Tree, Containers, Sprint, and Team Call all rendered fabricated data regardless of what was actually connected. The user found the Settings-page-only surfacing underwhelming and asked for the dashboard to become provider-aware: pick a connected provider from the user menu, and the dashboard switches into a scoped view showing that provider's real Git activity, CI/CD runs, and issues — while Team Call and My Tasks stay identical in every mode.

Three scope questions were resolved with the user before implementation (not guessed):

1. **Repo/project scoping** — a picker lives inside each provider mode itself (same data source as the Add Project wizard), rather than making the still-mock "Projects" concept real. Smaller, ships faster, doesn't block on a bigger unrelated redesign.
2. **Which tabs are provider-scoped** — Git Tree, Sprint, Team Call, My Tasks. Debug Session and Containers stay unified-mode-only; they aren't Git-provider concepts.
3. **GitLab write access** — GitHub-only issue creation this phase. GitLab mode is real but read-only (branches, commits, MRs, pipelines, issues), since the GitLab OAuth App is currently scoped to `read_api` only and expanding it would mean asking the user to reconnect right after they'd just connected.

## Decision

**Mode is a URL query parameter, not client-only state.** `/?mode=github` and `/?mode=gitlab` switch `UnifiedDashboard` into a provider-scoped view; no param (or an unrecognized value) falls back to the existing unified dashboard unchanged. This makes a mode bookmarkable/shareable and needed no new state-management library — `useSearchParams()` already used elsewhere in this app for the same reason (Settings' OAuth-callback toasts).

**The "Open ▸" menu is a real submenu, not a modal or a new page.** `UserDropdown` gained a `DropdownMenuSub` ("Open" with the expand chevron) listing only providers that are actually connected (checked via the same `/api/integrations/{provider}/status` calls Settings already makes), plus an always-present "Unified (local)" entry. This directly matches the requested affordance: click the user icon, see "Open ▸", expand it, pick a connected provider.

**`ProviderModeShell` is one component for both providers, not two.** It fetches the repo/project list, renders a picker, and renders four tabs (Git, Sprint, Team Call, My Tasks) — the last two literally reuse the same `VideoCallInterface`/`MyTasks` component instances the unified dashboard uses, which is what makes them "universal" rather than a duplicated look-alike.

**Real Git data is read-only for both providers**, bundled into one `repo-overview` endpoint per provider (branches + commits + open PRs/MRs in a single response) to keep round trips down, reusing the already-built CI/CD run endpoints from ADR-0011/0012 for the same tab.

**Sprint issues split real (GitHub) and local (StackCendra) by design, per the user's own instruction: "the issue would reflect onto github as well but the sprint details would be stored in our app only."** Creating an issue in GitHub mode's Sprint board does two things: a real `POST` to GitHub's Issues API (covered by the `repo` scope already granted — no reconnect needed), and a row in a new local-only table, `sprint_items` (`db/sprint-items-schema.sql`), holding only the column/story-points metadata GitHub's API has no concept of. Moving a card between columns only ever touches `sprint_items`; it never touches the GitHub issue's actual open/closed state. GitLab's Sprint tab has no local table at all — it's a live, read-only list of GitLab issues grouped by `opened`/`closed`, consistent with the read-only decision above.

**My Tasks cross-tagging wires the one real loop the user described, not a general sync engine.** `MyTasks`'s task list was lifted from component-local state up to `UnifiedDashboard` (passed down as props to both `MyTasks` and `ProviderSprintBoard`, in both the unified and provider-mode render paths) so the two can share it. When `ProviderSprintBoard` creates a real GitHub issue, it also pushes a matching entry into that shared list with a `source: {provider, repoFullName, issueNumber, issueHtmlUrl}` field, rendered in `MyTasks` as a colored, clickable provider tag that navigates back into the right mode (`onOpenSource` → `router.push('/?mode=github')`). **This is explicitly not** a background system that pulls in every GitHub/GitLab issue ever assigned to the user across every connected repo — that would be a materially bigger feature (polling, webhook or cron-based sync across arbitrarily many repos) and was not what was asked for. My Tasks otherwise remains the same local mock list it always was.

## Consequences

- `RunStatusBadge` (the small status-icon-plus-label piece used by the CI/CD run list) was extracted from `WorkspaceSections.tsx` into its own `src/components/RunStatusBadge.tsx` so the Settings panel and the new Git tab render CI/CD status identically without copy-pasting the same switch statement — the only refactor touched in this pass; `CiCdActivityPanel` itself in Settings was left alone to avoid risking the already-shipped, tested panel for a UI slot that now has two small consumers instead of one.
- `GitTreeVisualization` (the original mock Git Tree tab) is untouched and still renders in the unified dashboard's own Git Tree tab, since there's no repo context there to make it real. The new `RealGitTree` component is a separate, provider-mode-only piece — not a retrofit of the mock one.
- AI is explicitly not wired into any of this yet — the user named it as a future integration ("at that moment when we integrate the AI, the AI would actually know...") — this ADR covers only the real-data plumbing the AI would eventually consume.

## Alternatives considered

- **Making "Projects" real** (a Project as a persisted provider+repo record) instead of an in-mode repo picker. Rejected for this pass — bigger, touches the existing mock Projects list/detail pages, and the picker approach ships the actually-requested feature faster without foreclosing a later real-Projects effort.
- **A second, GitLab-specific Sprint board component.** Rejected — `ProviderSprintBoard` branches internally by provider instead, since the read-only GitLab view and the writable GitHub view share almost nothing beyond the outer card, and one file keeps the two variants next to each other for comparison.
- **Client-only mode state** (React state, no URL param). Rejected — loses bookmarkability/shareability and the back button for negligible implementation savings.

## Revisit when

"Projects" becomes real (this mode's repo picker would then likely become "pick from your Projects" instead of "pick from all your repos"), GitLab write access is added (its Sprint tab would gain the same create/move flow GitHub's has), or the My Tasks cross-tagging is extended into a real per-user issue-assignment sync — each is a natural, larger follow-on to a piece deliberately kept small here.

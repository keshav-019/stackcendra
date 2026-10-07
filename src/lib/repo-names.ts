// Repository identifier formats, shared by server code and client forms
// (kept free of server-only imports so client components can use them).
// See src/lib/integrations.ts for why dot-only segments are rejected.

// GitHub: exactly "owner/repo".
export const GITHUB_REPO_FULL_NAME_RE = /^[A-Za-z0-9_][A-Za-z0-9_.-]*\/[A-Za-z0-9_][A-Za-z0-9_.-]*$/;

// GitLab: "namespace/project", where the namespace may nest subgroups.
export const GITLAB_PROJECT_PATH_RE = /^[A-Za-z0-9_][A-Za-z0-9_.-]*(\/[A-Za-z0-9_][A-Za-z0-9_.-]*)+$/;

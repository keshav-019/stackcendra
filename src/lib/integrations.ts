import { pool } from '@/lib/db';
import { encrypt, decrypt } from '@/lib/crypto';

export interface IntegrationConnection {
  provider: string;
  providerAccountLogin: string | null;
  connectedAt: string;
}

export async function getConnection(userId: string, provider: string): Promise<IntegrationConnection | null> {
  const result = await pool.query(
    `select provider, provider_account_login, connected_at
     from integration_connections
     where user_id = $1 and provider = $2`,
    [userId, provider]
  );
  if (result.rowCount === 0) return null;
  const row = result.rows[0];
  return {
    provider: row.provider,
    providerAccountLogin: row.provider_account_login,
    connectedAt: row.connected_at,
  };
}

// GitLab's OAuth access tokens expire (~2h) and must be refreshed with a
// refresh token, unlike GitHub's non-expiring classic OAuth App tokens.
// When a stored token is expired (or close to it) and a refresh token is
// on file, this transparently refreshes it and persists the new pair
// before returning -- callers never see an expired token.
async function getAccessToken(userId: string, provider: string): Promise<string | null> {
  const result = await pool.query(
    `select access_token_encrypted, refresh_token_encrypted, expires_at
     from integration_connections where user_id = $1 and provider = $2`,
    [userId, provider]
  );
  if (result.rowCount === 0) return null;
  const row = result.rows[0];
  const expiresAt: Date | null = row.expires_at;
  const isExpiring = expiresAt !== null && expiresAt.getTime() <= Date.now() + 30_000;

  if (isExpiring && row.refresh_token_encrypted && provider === 'gitlab') {
    const refreshed = await refreshGitlabToken(decrypt(row.refresh_token_encrypted));
    await updateTokens(userId, provider, refreshed);
    return refreshed.accessToken;
  }

  return decrypt(row.access_token_encrypted);
}

async function updateTokens(
  userId: string,
  provider: string,
  tokens: { accessToken: string; refreshToken: string | null; expiresAt: Date | null }
): Promise<void> {
  await pool.query(
    `update integration_connections
     set access_token_encrypted = $1, refresh_token_encrypted = $2, expires_at = $3
     where user_id = $4 and provider = $5`,
    [
      encrypt(tokens.accessToken),
      tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
      tokens.expiresAt,
      userId,
      provider,
    ]
  );
}

export async function saveConnection(params: {
  userId: string;
  provider: string;
  accessToken: string;
  providerAccountLogin: string;
  scope: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
}): Promise<void> {
  const encrypted = encrypt(params.accessToken);
  const encryptedRefresh = params.refreshToken ? encrypt(params.refreshToken) : null;
  await pool.query(
    `insert into integration_connections
       (user_id, provider, provider_account_login, access_token_encrypted, scope, refresh_token_encrypted, expires_at)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (user_id, provider)
     do update set provider_account_login = excluded.provider_account_login,
                   access_token_encrypted = excluded.access_token_encrypted,
                   scope = excluded.scope,
                   refresh_token_encrypted = excluded.refresh_token_encrypted,
                   expires_at = excluded.expires_at,
                   connected_at = now()`,
    [
      params.userId,
      params.provider,
      params.providerAccountLogin,
      encrypted,
      params.scope,
      encryptedRefresh,
      params.expiresAt ?? null,
    ]
  );
}

export async function deleteConnection(userId: string, provider: string): Promise<void> {
  await pool.query(`delete from integration_connections where user_id = $1 and provider = $2`, [userId, provider]);
}

export interface GithubRepo {
  fullName: string;
  private: boolean;
  updatedAt: string;
  defaultBranch: string;
}

export async function fetchGithubUser(accessToken: string): Promise<{ login: string }> {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'stackcendra',
    },
  });
  if (!res.ok) throw new Error(`GitHub /user failed: ${res.status}`);
  const data = await res.json();
  return { login: data.login };
}

export async function fetchGithubRepos(accessToken: string): Promise<GithubRepo[]> {
  const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=25', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'stackcendra',
    },
  });
  if (!res.ok) throw new Error(`GitHub /user/repos failed: ${res.status}`);
  const data = await res.json();
  return data.map((repo: { full_name: string; private: boolean; updated_at: string; default_branch: string }) => ({
    fullName: repo.full_name,
    private: repo.private,
    updatedAt: repo.updated_at,
    defaultBranch: repo.default_branch,
  }));
}

export async function getGithubRepos(userId: string): Promise<GithubRepo[]> {
  const accessToken = await getAccessToken(userId, 'github');
  if (!accessToken) throw new Error('GitHub is not connected for this user');
  return fetchGithubRepos(accessToken);
}

export interface GithubWorkflowRun {
  id: number;
  name: string;
  displayTitle: string;
  status: string;
  conclusion: string | null;
  headBranch: string;
  headSha: string;
  event: string;
  actorLogin: string | null;
  runNumber: number;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface GithubJobFailure {
  jobName: string;
  stepName: string | null;
  conclusion: string | null;
}

// Each segment must start with an alphanumeric/underscore character so a
// segment can never be composed only of dots (e.g. "..") -- structurally
// harmless here since the value only ever reaches an outbound GitHub API
// call, never a filesystem path, but rejecting it outright is clearer than
// relying on that.
export const GITHUB_REPO_FULL_NAME_RE = /^[A-Za-z0-9_][A-Za-z0-9_.-]*\/[A-Za-z0-9_][A-Za-z0-9_.-]*$/;

export async function fetchGithubWorkflowRuns(accessToken: string, repoFullName: string): Promise<GithubWorkflowRun[]> {
  const res = await fetch(`https://api.github.com/repos/${repoFullName}/actions/runs?per_page=15`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'stackcendra',
    },
  });
  if (!res.ok) throw new Error(`GitHub actions/runs failed: ${res.status}`);
  const data = await res.json();
  return (data.workflow_runs ?? []).map(
    (run: {
      id: number;
      name: string | null;
      display_title: string;
      status: string;
      conclusion: string | null;
      head_branch: string;
      head_sha: string;
      event: string;
      actor: { login: string } | null;
      run_number: number;
      html_url: string;
      created_at: string;
      updated_at: string;
    }) => ({
      id: run.id,
      name: run.name ?? run.display_title,
      displayTitle: run.display_title,
      status: run.status,
      conclusion: run.conclusion,
      headBranch: run.head_branch,
      headSha: run.head_sha,
      event: run.event,
      actorLogin: run.actor?.login ?? null,
      runNumber: run.run_number,
      htmlUrl: run.html_url,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
    })
  );
}

export async function fetchGithubRunFailures(
  accessToken: string,
  repoFullName: string,
  runId: number
): Promise<GithubJobFailure[]> {
  const res = await fetch(`https://api.github.com/repos/${repoFullName}/actions/runs/${runId}/jobs`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'stackcendra',
    },
  });
  if (!res.ok) throw new Error(`GitHub actions run jobs failed: ${res.status}`);
  const data = await res.json();
  const failures: GithubJobFailure[] = [];
  for (const job of data.jobs ?? []) {
    if (job.conclusion !== 'failure') continue;
    const failedStep = (job.steps ?? []).find((step: { conclusion: string | null }) => step.conclusion === 'failure');
    failures.push({
      jobName: job.name,
      stepName: failedStep?.name ?? null,
      conclusion: job.conclusion,
    });
  }
  return failures;
}

export async function getGithubWorkflowRuns(userId: string, repoFullName: string): Promise<GithubWorkflowRun[]> {
  if (!GITHUB_REPO_FULL_NAME_RE.test(repoFullName)) throw new Error('Invalid repository name');
  const accessToken = await getAccessToken(userId, 'github');
  if (!accessToken) throw new Error('GitHub is not connected for this user');
  return fetchGithubWorkflowRuns(accessToken, repoFullName);
}

export async function getGithubRunFailures(userId: string, repoFullName: string, runId: number): Promise<GithubJobFailure[]> {
  if (!GITHUB_REPO_FULL_NAME_RE.test(repoFullName)) throw new Error('Invalid repository name');
  const accessToken = await getAccessToken(userId, 'github');
  if (!accessToken) throw new Error('GitHub is not connected for this user');
  return fetchGithubRunFailures(accessToken, repoFullName, runId);
}

// -- GitLab -----------------------------------------------------------
//
// GitLab projects can be nested under groups/subgroups (group/sub/project),
// unlike GitHub's single-level owner/repo, so the path validator allows
// two or more segments. The GitLab API accepts a URL-encoded full path as
// the :id path parameter for a project, so no separate numeric ID lookup
// is needed.

export type PipelineRun = GithubWorkflowRun;
export type PipelineJobFailure = GithubJobFailure;

export interface GitlabProject {
  fullName: string;
  private: boolean;
  updatedAt: string;
  defaultBranch: string;
}

export const GITLAB_PROJECT_PATH_RE = /^[A-Za-z0-9_][A-Za-z0-9_.-]*(\/[A-Za-z0-9_][A-Za-z0-9_.-]*)+$/;

async function refreshGitlabToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string | null; expiresAt: Date | null }> {
  const clientId = process.env.GITLAB_INTEGRATION_CLIENT_ID;
  const clientSecret = process.env.GITLAB_INTEGRATION_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('GitLab integration is not configured');

  const res = await fetch('https://gitlab.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) throw new Error(`GitLab token refresh failed: ${res.status}`);
  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
  };
}

export async function fetchGitlabUser(accessToken: string): Promise<{ username: string }> {
  const res = await fetch('https://gitlab.com/api/v4/user', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`GitLab /user failed: ${res.status}`);
  const data = await res.json();
  return { username: data.username };
}

export async function fetchGitlabProjects(accessToken: string): Promise<GitlabProject[]> {
  const res = await fetch('https://gitlab.com/api/v4/projects?membership=true&order_by=updated_at&per_page=25', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`GitLab /projects failed: ${res.status}`);
  const data = await res.json();
  return data.map(
    (project: { path_with_namespace: string; visibility: string; last_activity_at: string; default_branch: string | null }) => ({
      fullName: project.path_with_namespace,
      private: project.visibility !== 'public',
      updatedAt: project.last_activity_at,
      defaultBranch: project.default_branch ?? 'main',
    })
  );
}

export async function getGitlabProjects(userId: string): Promise<GitlabProject[]> {
  const accessToken = await getAccessToken(userId, 'gitlab');
  if (!accessToken) throw new Error('GitLab is not connected for this user');
  return fetchGitlabProjects(accessToken);
}

function mapGitlabPipelineStatus(status: string): { status: string; conclusion: string | null } {
  switch (status) {
    case 'created':
    case 'waiting_for_resource':
    case 'preparing':
    case 'pending':
    case 'scheduled':
      return { status: 'queued', conclusion: null };
    case 'running':
      return { status: 'in_progress', conclusion: null };
    case 'success':
      return { status: 'completed', conclusion: 'success' };
    case 'failed':
      return { status: 'completed', conclusion: 'failure' };
    case 'canceled':
      return { status: 'completed', conclusion: 'cancelled' };
    case 'skipped':
      return { status: 'completed', conclusion: 'skipped' };
    default:
      return { status: 'completed', conclusion: status };
  }
}

export async function fetchGitlabPipelines(accessToken: string, projectPath: string): Promise<PipelineRun[]> {
  const res = await fetch(
    `https://gitlab.com/api/v4/projects/${encodeURIComponent(projectPath)}/pipelines?per_page=15&order_by=updated_at`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`GitLab pipelines failed: ${res.status}`);
  const data = await res.json();
  return data.map(
    (p: {
      id: number;
      iid: number;
      status: string;
      ref: string;
      sha: string;
      source: string;
      user: { username: string } | null;
      web_url: string;
      created_at: string;
      updated_at: string;
    }) => {
      const { status, conclusion } = mapGitlabPipelineStatus(p.status);
      return {
        id: p.id,
        name: `Pipeline #${p.iid}`,
        displayTitle: `${p.ref} (${p.source})`,
        status,
        conclusion,
        headBranch: p.ref,
        headSha: p.sha?.slice(0, 7) ?? '',
        event: p.source,
        actorLogin: p.user?.username ?? null,
        runNumber: p.iid,
        htmlUrl: p.web_url,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    }
  );
}

export async function fetchGitlabPipelineFailures(
  accessToken: string,
  projectPath: string,
  pipelineId: number
): Promise<PipelineJobFailure[]> {
  const res = await fetch(
    `https://gitlab.com/api/v4/projects/${encodeURIComponent(projectPath)}/pipelines/${pipelineId}/jobs?per_page=100`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`GitLab pipeline jobs failed: ${res.status}`);
  const data = await res.json();
  const failures: PipelineJobFailure[] = [];
  for (const job of data) {
    if (job.status !== 'failed') continue;
    failures.push({
      jobName: job.name,
      stepName: job.stage ?? null,
      conclusion: job.failure_reason ?? job.status,
    });
  }
  return failures;
}

export async function getGitlabPipelines(userId: string, projectPath: string): Promise<PipelineRun[]> {
  if (!GITLAB_PROJECT_PATH_RE.test(projectPath)) throw new Error('Invalid project path');
  const accessToken = await getAccessToken(userId, 'gitlab');
  if (!accessToken) throw new Error('GitLab is not connected for this user');
  return fetchGitlabPipelines(accessToken, projectPath);
}

export async function getGitlabPipelineFailures(
  userId: string,
  projectPath: string,
  pipelineId: number
): Promise<PipelineJobFailure[]> {
  if (!GITLAB_PROJECT_PATH_RE.test(projectPath)) throw new Error('Invalid project path');
  const accessToken = await getAccessToken(userId, 'gitlab');
  if (!accessToken) throw new Error('GitLab is not connected for this user');
  return fetchGitlabPipelineFailures(accessToken, projectPath, pipelineId);
}

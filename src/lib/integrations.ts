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

async function getAccessToken(userId: string, provider: string): Promise<string | null> {
  const result = await pool.query(
    `select access_token_encrypted from integration_connections where user_id = $1 and provider = $2`,
    [userId, provider]
  );
  if (result.rowCount === 0) return null;
  return decrypt(result.rows[0].access_token_encrypted);
}

export async function saveConnection(params: {
  userId: string;
  provider: string;
  accessToken: string;
  providerAccountLogin: string;
  scope: string;
}): Promise<void> {
  const encrypted = encrypt(params.accessToken);
  await pool.query(
    `insert into integration_connections (user_id, provider, provider_account_login, access_token_encrypted, scope)
     values ($1, $2, $3, $4, $5)
     on conflict (user_id, provider)
     do update set provider_account_login = excluded.provider_account_login,
                   access_token_encrypted = excluded.access_token_encrypted,
                   scope = excluded.scope,
                   connected_at = now()`,
    [params.userId, params.provider, params.providerAccountLogin, encrypted, params.scope]
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

export const GITHUB_REPO_FULL_NAME_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

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

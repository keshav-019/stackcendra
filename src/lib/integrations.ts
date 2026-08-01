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

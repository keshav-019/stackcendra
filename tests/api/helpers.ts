import { randomUUID } from 'node:crypto';
import { vi } from 'vitest';
import { auth } from '@/lib/auth';
import { pool } from '@/lib/db';

/** Empties every user-owned table (all of them cascade from users). */
export async function resetDatabase() {
  await pool.query('truncate users cascade');
}

export async function createUser(name = 'Test User'): Promise<string> {
  const id = randomUUID();
  await pool.query('insert into users (id, name, email) values ($1, $2, $3)', [id, name, `${id}@example.com`]);
  return id;
}

/** Makes auth() return a session for this user on subsequent calls. */
export function signIn(userId: string) {
  vi.mocked(auth as unknown as () => Promise<unknown>).mockResolvedValue({
    user: { id: userId, name: 'Test User', email: `${userId}@example.com` },
    expires: new Date(Date.now() + 3_600_000).toISOString(),
  });
}

export function signOut() {
  vi.mocked(auth as unknown as () => Promise<unknown>).mockResolvedValue(null);
}

/** Records an integration connection, as the OAuth callback would. */
export async function connectProvider(userId: string, provider: 'github' | 'gitlab') {
  await pool.query(
    `insert into integration_connections (user_id, provider, provider_account_login, access_token_encrypted, scope)
     values ($1, $2, 'octocat', 'not-a-real-token', 'repo')`,
    [userId, provider]
  );
}

export function jsonRequest(path: string, method: string, body?: unknown): Request {
  return new Request(`http://localhost${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
}

/** The second argument Next.js passes to a dynamic route handler. */
export function routeContext<T extends Record<string, string>>(params: T) {
  return { params: Promise.resolve(params) };
}

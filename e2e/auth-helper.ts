import type { BrowserContext } from '@playwright/test';
import { encode } from 'next-auth/jwt';

const SESSION_COOKIE_NAME = 'authjs.session-token';

/**
 * Mints a valid Auth.js session JWT signed with the same AUTH_SECRET the dev
 * server uses, and injects it as a cookie. This is the only practical way to
 * exercise authenticated routes in E2E tests: signing in for real would mean
 * automating a third-party consent screen (GitHub/Google) with a live test
 * account, which is out of scope here. The user this cookie represents is
 * synthetic and is never written to Postgres -- fine for exercising session
 * gating and authenticated-UI rendering, but this does not cover the real
 * OAuth handshake itself (verified manually instead, see ADR 0008/0010).
 */
export async function signInAs(
  context: BrowserContext,
  user: { id: string; name: string; email: string; provider?: string } = {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Test User',
    email: 'test.user@example.com',
    provider: 'github',
  },
  baseURL = 'http://localhost:8080'
) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not set -- copy .env.example to .env.local first');
  }

  const token = await encode({
    secret,
    salt: SESSION_COOKIE_NAME,
    token: {
      sub: user.id,
      name: user.name,
      email: user.email,
      picture: null,
      provider: user.provider,
    },
  });

  const url = new URL(baseURL);
  await context.addCookies([
    {
      name: SESSION_COOKIE_NAME,
      value: token,
      domain: url.hostname,
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}

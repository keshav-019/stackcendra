import { test, expect, type Page } from '@playwright/test';

/**
 * Replicates what next-auth/react's client-side signIn() does under the
 * hood (fetch a CSRF token, POST to /api/auth/signin/:provider) via a
 * direct API call, returning the provider authorize URL Auth.js
 * constructed. This is the reliable way to assert the URL is correct:
 * letting a real browser navigate all the way to github.com/google.com
 * proved flaky in practice (both providers detect and interfere with
 * automated/headless sign-in attempts), even though the constructed URL
 * was always correct when inspected directly.
 */
async function getProviderAuthorizeUrl(page: Page, provider: string): Promise<string> {
  const csrfRes = await page.request.get('/api/auth/csrf');
  const { csrfToken } = await csrfRes.json();
  // Without this header Auth.js performs a real 302 redirect instead of
  // returning { url } as JSON -- next-auth/react's signIn() sets it
  // internally so the client can read the destination without the
  // browser actually navigating there.
  const signinRes = await page.request.post(`/api/auth/signin/${provider}`, {
    headers: { 'X-Auth-Return-Redirect': '1' },
    form: { csrfToken, callbackUrl: '/' },
  });
  const body = await signinRes.json();
  return body.url;
}

test.describe('Login page', () => {
  test('the GitHub button calls signIn("github")', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const [request] = await Promise.all([
      page.waitForRequest((req) => req.url().includes('/api/auth/signin/github')),
      page.getByRole('button', { name: 'GitHub' }).click(),
    ]);
    expect(request.method()).toBe('POST');
  });

  test('the Google button calls signIn("google")', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const [request] = await Promise.all([
      page.waitForRequest((req) => req.url().includes('/api/auth/signin/google')),
      page.getByRole('button', { name: 'Google' }).click(),
    ]);
    expect(request.method()).toBe('POST');
  });

  test('links to the signup page', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Create an account' }).click();
    await expect(page).toHaveURL('/signup');
  });
});

test.describe('Signup page', () => {
  test('the GitHub button calls signIn("github")', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    const [request] = await Promise.all([
      page.waitForRequest((req) => req.url().includes('/api/auth/signin/github')),
      page.getByRole('button', { name: 'GitHub' }).click(),
    ]);
    expect(request.method()).toBe('POST');
  });

  test('the Google button calls signIn("google")', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    const [request] = await Promise.all([
      page.waitForRequest((req) => req.url().includes('/api/auth/signin/google')),
      page.getByRole('button', { name: 'Google' }).click(),
    ]);
    expect(request.method()).toBe('POST');
  });

  test('selecting Enterprise reveals the organization field', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByLabel('Organization name')).not.toBeVisible();
    await page.getByText('Enterprise', { exact: true }).click();
    await expect(page.getByLabel('Organization name')).toBeVisible();
  });

  test('links back to the login page', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/login');
  });
});

test.describe('OAuth URL construction (API-level, no third-party navigation)', () => {
  test('GitHub sign-in constructs the correct authorize URL', async ({ page }) => {
    const url = await getProviderAuthorizeUrl(page, 'github');
    expect(url).toContain('github.com/login/oauth/authorize');
    expect(url).toContain(`client_id=${process.env.GITHUB_OAUTH_CLIENT_ID}`);
  });

  test('Google sign-in constructs the correct authorize URL', async ({ page }) => {
    const url = await getProviderAuthorizeUrl(page, 'google');
    expect(url).toContain('accounts.google.com');
    expect(url).toContain(`client_id=${process.env.GOOGLE_OAUTH_CLIENT_ID}`);
  });
});

test.describe('Sign-in feedback', () => {
  test('a failed sign-in sent back by Auth.js is explained on /login', async ({ page }) => {
    await page.goto('/login?error=AccessDenied');
    await expect(page.locator('p[role=alert]')).toHaveText(
      'Sign-in was cancelled or access was denied.'
    );
  });

  test('Auth.js errors land on /login, not the default error page', async ({ page }) => {
    const res = await page.request.get('/api/auth/error?error=Configuration', { maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect(res.headers()['location']).toContain('/login?error=Configuration');
  });

  test('submitting the email/password form explains it is unavailable and stays put', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Email').fill('someone@example.com');
    await page.getByLabel('Password').fill('hunter22');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page.locator('p[role=alert]')).toHaveText(
      "Email and password sign-in isn't available yet. Continue with GitHub or Google instead."
    );
    await expect(page).toHaveURL('/login');
  });

  test('the configured providers are enabled', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'GitHub' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Google' })).toBeEnabled();
  });
});

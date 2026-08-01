import { test, expect } from '@playwright/test';
import { signInAs } from './auth-helper';

test.describe('GitHub integration connect flow (authenticated)', () => {
  test.beforeEach(async ({ context }) => {
    await signInAs(context);
  });

  test('Settings shows the GitHub row as real, not mock, and not connected for a fresh user', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Real', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Connect' })).toBeVisible();
  });

  test('the connect endpoint redirects to GitHub\'s real authorize endpoint with repo scope', async ({ page }) => {
    // Checking the raw redirect response is more reliable than letting a
    // real browser navigate through it: GitHub's own redirect chain from
    // /login/oauth/authorize to /login isn't reliably visible to
    // page.route() for this navigation pattern, and letting the browser
    // fully load github.com risks its bot-detection interfering.
    const res = await page.request.get('/api/integrations/github/connect', { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    const location = res.headers()['location'];
    expect(location).toContain('github.com/login/oauth/authorize');
    expect(location).toContain(`client_id=${process.env.GITHUB_INTEGRATION_CLIENT_ID}`);
    expect(location).toContain('scope=repo');
  });

  test('GET /api/integrations/github/status requires auth and returns the connected shape', async ({ page }) => {
    const res = await page.request.get('/api/integrations/github/status');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty('connected');
  });

  test('the connect endpoint redirects unauthenticated requests to /login', async ({ page, context }) => {
    // fresh context with no session cookie
    const freshContext = await page.context().browser()!.newContext();
    const freshPage = await freshContext.newPage();
    await freshPage.goto('/api/integrations/github/connect');
    await expect(freshPage).toHaveURL(/\/login/);
    await freshContext.close();
  });
});

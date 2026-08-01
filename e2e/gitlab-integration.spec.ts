import { test, expect } from '@playwright/test';
import { signInAs } from './auth-helper';

test.describe('GitLab integration connect flow (authenticated)', () => {
  test.beforeEach(async ({ context }) => {
    await signInAs(context);
  });

  test('Settings shows both GitHub and GitLab rows as real, not mock, for a fresh user', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Real', { exact: true })).toHaveCount(2);
    await expect(page.getByText('GitLab', { exact: true })).toBeVisible();
  });

  test("the connect endpoint redirects to GitLab's real authorize endpoint with read_api scope", async ({ page }) => {
    // Checking the raw redirect response is more reliable than letting a
    // real browser navigate through it -- same reasoning as the GitHub
    // integration spec (see github-integration.spec.ts).
    const res = await page.request.get('/api/integrations/gitlab/connect', { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    const location = res.headers()['location'];
    expect(location).toContain('gitlab.com/oauth/authorize');
    expect(location).toContain(`client_id=${process.env.GITLAB_INTEGRATION_CLIENT_ID}`);
    expect(location).toContain('scope=read_user+read_api');
  });

  test('GET /api/integrations/gitlab/status requires auth and returns the connected shape', async ({ page }) => {
    const res = await page.request.get('/api/integrations/gitlab/status');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty('connected');
  });

  test('the connect endpoint redirects unauthenticated requests to /login', async ({ page }) => {
    const freshContext = await page.context().browser()!.newContext();
    const freshPage = await freshContext.newPage();
    await freshPage.goto('/api/integrations/gitlab/connect');
    await expect(freshPage).toHaveURL(/\/login/);
    await freshContext.close();
  });
});

test.describe('CI/CD activity (GitLab pipelines) endpoints', () => {
  test.beforeEach(async ({ context }) => {
    await signInAs(context);
  });

  test('GET /api/integrations/gitlab/pipelines requires a project query parameter', async ({ page }) => {
    const res = await page.request.get('/api/integrations/gitlab/pipelines');
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/project/i);
  });

  test('GET /api/integrations/gitlab/pipelines rejects a malformed project path without ever calling GitLab', async ({ page }) => {
    const res = await page.request.get('/api/integrations/gitlab/pipelines?project=' + encodeURIComponent('../../etc/passwd'));
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });

  test('GET /api/integrations/gitlab/pipelines/:id/jobs rejects a non-numeric pipeline id', async ({ page }) => {
    const res = await page.request.get('/api/integrations/gitlab/pipelines/not-a-number/jobs?project=acme-corp/demo');
    expect(res.status()).toBe(400);
  });

  test('GET /api/integrations/gitlab/pipelines/:id/jobs requires a project query parameter', async ({ page }) => {
    const res = await page.request.get('/api/integrations/gitlab/pipelines/42/jobs');
    expect(res.status()).toBe(400);
  });

  test('both endpoints redirect unauthenticated requests away from returning data', async ({ page }) => {
    const freshContext = await page.context().browser()!.newContext();
    const runsRes = await freshContext.request.get('/api/integrations/gitlab/pipelines?project=acme-corp/demo');
    expect(runsRes.status()).toBe(401);
    const jobsRes = await freshContext.request.get('/api/integrations/gitlab/pipelines/42/jobs?project=acme-corp/demo');
    expect(jobsRes.status()).toBe(401);
    await freshContext.close();
  });
});

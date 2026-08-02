import { test, expect } from '@playwright/test';
import { signInAs } from './auth-helper';

test.describe('Repo overview endpoints (authenticated)', () => {
  test.beforeEach(async ({ context }) => {
    await signInAs(context);
  });

  test('GET /api/integrations/github/repo-overview requires a repo query parameter', async ({ page }) => {
    const res = await page.request.get('/api/integrations/github/repo-overview');
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/repo/i);
  });

  test('GET /api/integrations/github/repo-overview rejects a malformed repo name', async ({ page }) => {
    const res = await page.request.get(
      '/api/integrations/github/repo-overview?repo=' + encodeURIComponent('../../etc/passwd')
    );
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });

  test('GET /api/integrations/gitlab/repo-overview requires a project query parameter', async ({ page }) => {
    const res = await page.request.get('/api/integrations/gitlab/repo-overview');
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/project/i);
  });

  test('GET /api/integrations/gitlab/repo-overview rejects a malformed project path', async ({ page }) => {
    const res = await page.request.get(
      '/api/integrations/gitlab/repo-overview?project=' + encodeURIComponent('../../etc/passwd')
    );
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });

  test('both repo-overview endpoints redirect unauthenticated requests away from returning data', async ({ page }) => {
    const freshContext = await page.context().browser()!.newContext();
    const githubRes = await freshContext.request.get('/api/integrations/github/repo-overview?repo=octocat/hello-world');
    expect(githubRes.status()).toBe(401);
    const gitlabRes = await freshContext.request.get('/api/integrations/gitlab/repo-overview?project=acme-corp/demo');
    expect(gitlabRes.status()).toBe(401);
    await freshContext.close();
  });
});

test.describe('Sprint issue endpoints (authenticated)', () => {
  test.beforeEach(async ({ context }) => {
    await signInAs(context);
  });

  test('GET /api/integrations/github/issues requires a repo query parameter', async ({ page }) => {
    const res = await page.request.get('/api/integrations/github/issues');
    expect(res.status()).toBe(400);
  });

  test('GET /api/integrations/github/issues returns an empty list for a repo with no sprint items yet', async ({ page }) => {
    const res = await page.request.get('/api/integrations/github/issues?repo=octocat/hello-world');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.items).toEqual([]);
  });

  test('POST /api/integrations/github/issues requires repo and title', async ({ page }) => {
    const res = await page.request.post('/api/integrations/github/issues', { data: { repo: 'octocat/hello-world' } });
    expect(res.status()).toBe(400);
  });

  test('POST /api/integrations/github/issues fails cleanly when GitHub is not connected for this user', async ({ page }) => {
    const res = await page.request.post('/api/integrations/github/issues', {
      data: { repo: 'octocat/hello-world', title: 'Test issue' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/not connected/i);
  });

  test('PATCH /api/integrations/github/issues/:id rejects a malformed id', async ({ page }) => {
    const res = await page.request.patch('/api/integrations/github/issues/not-a-uuid', {
      data: { columnStatus: 'done' },
    });
    expect(res.status()).toBe(400);
  });

  test('PATCH /api/integrations/github/issues/:id returns 404 for a well-formed but nonexistent id', async ({ page }) => {
    const res = await page.request.patch('/api/integrations/github/issues/00000000-0000-4000-8000-000000000099', {
      data: { columnStatus: 'done' },
    });
    expect(res.status()).toBe(404);
  });

  test('PATCH /api/integrations/github/issues/:id with closeIssue also returns 404 for a nonexistent id', async ({ page }) => {
    const res = await page.request.patch('/api/integrations/github/issues/00000000-0000-4000-8000-000000000099', {
      data: { closeIssue: true, comment: 'Closing.' },
    });
    expect(res.status()).toBe(404);
  });

  test('GET /api/integrations/gitlab/issues requires a project query parameter', async ({ page }) => {
    const res = await page.request.get('/api/integrations/gitlab/issues');
    expect(res.status()).toBe(400);
  });

  test('POST /api/integrations/gitlab/issues requires project and title', async ({ page }) => {
    const res = await page.request.post('/api/integrations/gitlab/issues', { data: { project: 'acme-corp/demo' } });
    expect(res.status()).toBe(400);
  });

  test('POST /api/integrations/gitlab/issues fails cleanly when GitLab is not connected for this user', async ({ page }) => {
    const res = await page.request.post('/api/integrations/gitlab/issues', {
      data: { project: 'acme-corp/demo', title: 'Test issue' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/not connected/i);
  });

  test('PATCH /api/integrations/gitlab/issues/:id rejects a malformed id', async ({ page }) => {
    const res = await page.request.patch('/api/integrations/gitlab/issues/not-a-uuid', { data: { columnStatus: 'done' } });
    expect(res.status()).toBe(400);
  });

  test('PATCH /api/integrations/gitlab/issues/:id returns 404 for a well-formed but nonexistent id', async ({ page }) => {
    const res = await page.request.patch('/api/integrations/gitlab/issues/00000000-0000-4000-8000-000000000099', {
      data: { columnStatus: 'done' },
    });
    expect(res.status()).toBe(404);
  });

  test('all sprint/issue endpoints redirect unauthenticated requests away from returning data', async ({ page }) => {
    const freshContext = await page.context().browser()!.newContext();
    const getRes = await freshContext.request.get('/api/integrations/github/issues?repo=octocat/hello-world');
    expect(getRes.status()).toBe(401);
    const postRes = await freshContext.request.post('/api/integrations/github/issues', {
      data: { repo: 'octocat/hello-world', title: 'x' },
    });
    expect(postRes.status()).toBe(401);
    const patchRes = await freshContext.request.patch('/api/integrations/github/issues/00000000-0000-4000-8000-000000000099', {
      data: { columnStatus: 'done' },
    });
    expect(patchRes.status()).toBe(401);
    const gitlabGetRes = await freshContext.request.get('/api/integrations/gitlab/issues?project=acme-corp/demo');
    expect(gitlabGetRes.status()).toBe(401);
    const gitlabPostRes = await freshContext.request.post('/api/integrations/gitlab/issues', {
      data: { project: 'acme-corp/demo', title: 'x' },
    });
    expect(gitlabPostRes.status()).toBe(401);
    const gitlabPatchRes = await freshContext.request.patch('/api/integrations/gitlab/issues/00000000-0000-4000-8000-000000000099', {
      data: { columnStatus: 'done' },
    });
    expect(gitlabPatchRes.status()).toBe(401);
    await freshContext.close();
  });
});

test.describe('Mode switching UI (authenticated)', () => {
  test.beforeEach(async ({ context }) => {
    await signInAs(context);
  });

  test('the Open submenu offers Unified even when no provider is connected', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'TU', exact: true }).click();
    await page.getByText('Open', { exact: true }).click();
    await expect(page.getByText('Unified (local)', { exact: true })).toBeVisible();
  });

  test('?mode=github renders GitHub mode shell instead of the default tabs', async ({ page }) => {
    await page.goto('/?mode=github');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('GitHub mode', { exact: true })).toBeVisible();
  });

  test('?mode=gitlab renders GitLab mode shell instead of the default tabs', async ({ page }) => {
    await page.goto('/?mode=gitlab');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('GitLab mode', { exact: true })).toBeVisible();
  });

  test('an unrecognized mode value falls back to the default unified dashboard', async ({ page }) => {
    await page.goto('/?mode=bogus');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Debug Session', { exact: true })).toBeVisible();
  });
});

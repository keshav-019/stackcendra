import { test, expect, type Page } from '@playwright/test';
import { signInAs } from './auth-helper';
import { closeTestDb, createTestUser, testDb, type TestUser } from './db';

test.afterAll(async () => {
  await closeTestDb();
});

const PROJECT_URL = /\/projects\/[0-9a-f-]{36}$/;

async function addLocalProject(page: Page, name: string, localPath = '/home/dev/code/payments', description = '') {
  await page.goto('/projects/new');
  await page.getByLabel('Project name').fill(name);
  await page.getByLabel('Local path').fill(localPath);
  if (description) await page.getByLabel('Description (optional)').fill(description);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  // "Local only" is the default source.
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Create Project', exact: true }).click();
}

test.describe('Projects (authenticated)', () => {
  // Every test signs in as its own fresh user, so the specs can run in
  // parallel against one database without seeing each other's projects.
  let user: TestUser;

  test.beforeEach(async ({ context }) => {
    user = await createTestUser();
    await signInAs(context, user);
  });

  test('a new user sees the empty state with a way to add a project', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByRole('heading', { name: 'No projects yet' })).toBeVisible();
    await page.getByRole('link', { name: 'Add your first project' }).click();
    await expect(page).toHaveURL('/projects/new');
  });

  test('creating a project through the wizard persists it and opens its page', async ({ page }) => {
    await addLocalProject(page, 'Payments API', '/home/dev/code/payments', 'Checkout and refunds');

    await expect(page).toHaveURL(PROJECT_URL);
    await expect(page.getByRole('heading', { level: 1, name: 'Payments API' })).toBeVisible();
    await expect(page.getByText('/home/dev/code/payments')).toBeVisible();
    await expect(page.getByText('Checkout and refunds')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Local-only project' })).toBeVisible();

    // Survives a reload, i.e. it really is stored.
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Payments API' })).toBeVisible();

    await page.goto('/projects');
    const list = page.getByRole('list', { name: 'Projects' });
    await expect(list.getByRole('link')).toHaveCount(1);
    await list.getByRole('link', { name: /Payments API/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Payments API' })).toBeVisible();
  });

  test('the wizard cannot advance without a name and local path', async ({ page }) => {
    await page.goto('/projects/new');
    const next = page.getByRole('button', { name: 'Next', exact: true });
    await expect(next).toBeDisabled();
    await page.getByLabel('Project name').fill('Only a name');
    await expect(next).toBeDisabled();
    await page.getByLabel('Local path').fill('/tmp/x');
    await expect(next).toBeEnabled();
  });

  test('a duplicate name is refused with a clear message', async ({ page }) => {
    await addLocalProject(page, 'Inventory');
    await expect(page.getByRole('heading', { level: 1, name: 'Inventory' })).toBeVisible();

    await addLocalProject(page, 'inventory');
    // Scoped to <main>: Next.js also renders a (route announcer) alert.
    await expect(page.getByRole('main').getByRole('alert')).toHaveText('You already have a project named "inventory"');
    await expect(page).toHaveURL('/projects/new');
  });

  test('editing a project updates its page and the list', async ({ page }) => {
    await addLocalProject(page, 'Old Name');
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit project' });
    await dialog.getByLabel('Project name').fill('New Name');
    await dialog.getByLabel('Description').fill('Now with a description');
    await dialog.getByRole('button', { name: 'Save changes' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByRole('heading', { level: 1, name: 'New Name' })).toBeVisible();
    await expect(page.getByText('Now with a description')).toBeVisible();

    await page.goto('/projects');
    await expect(page.getByRole('list', { name: 'Projects' })).toContainText('New Name');
    await expect(page.getByRole('list', { name: 'Projects' })).not.toContainText('Old Name');
  });

  test('deleting a project asks for confirmation, then removes it', async ({ page }) => {
    await addLocalProject(page, 'Short Lived');
    await expect(page).toHaveURL(PROJECT_URL);
    const url = page.url();

    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Short Lived' })).toBeVisible();

    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete project' }).click();
    await expect(page).toHaveURL('/projects');
    await expect(page.getByRole('heading', { name: 'No projects yet' })).toBeVisible();

    const res = await page.goto(url);
    expect(res?.status()).toBe(404);
  });

  test('the dashboard sidebar lists real projects', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'No projects yet. Add one →' })).toBeVisible();

    await addLocalProject(page, 'Sidebar Project');
    await page.goto('/');
    await page.getByRole('link', { name: /Sidebar Project/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Sidebar Project' })).toBeVisible();
  });

  test("another user's project is a 404, not a leak", async ({ page, browser }) => {
    await addLocalProject(page, 'Private Project');
    await expect(page).toHaveURL(PROJECT_URL);
    const url = page.url();

    const otherContext = await browser.newContext();
    await signInAs(otherContext, await createTestUser('Someone Else'));
    const otherPage = await otherContext.newPage();
    const res = await otherPage.goto(url);
    expect(res?.status()).toBe(404);
    await expect(otherPage.getByText('Private Project')).toHaveCount(0);
    await otherContext.close();
  });

  test('unknown and malformed project ids are a 404', async ({ page }) => {
    expect((await page.goto('/projects/00000000-0000-4000-8000-0000000000ff'))?.status()).toBe(404);
    expect((await page.goto('/projects/not-a-uuid'))?.status()).toBe(404);
  });

  test('a GitHub-linked project shows its repository panel', async ({ page }) => {
    await testDb().query(
      `insert into integration_connections (user_id, provider, provider_account_login, access_token_encrypted, scope)
       values ($1, 'github', 'octocat', 'not-a-real-token', 'repo')`,
      [user.id]
    );
    const res = await page.request.post('/api/projects', {
      data: { name: 'Hello World', localPath: '/code/hello', provider: 'github', repoFullName: 'octocat/hello-world', defaultBranch: 'main' },
    });
    expect(res.status()).toBe(201);
    const { project } = await res.json();

    await page.goto(`/projects/${project.id}`);
    await expect(page.getByRole('heading', { level: 1, name: 'Hello World' })).toBeVisible();
    await expect(page.getByText('octocat/hello-world')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Local-only project' })).toHaveCount(0);
  });
});

test.describe('Projects API (unauthenticated)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('every projects endpoint answers 401 without a session', async ({ playwright, baseURL }) => {
    const api = await playwright.request.newContext({ baseURL });
    const id = '00000000-0000-4000-8000-000000000001';
    expect((await api.get('/api/projects')).status()).toBe(401);
    expect((await api.post('/api/projects', { data: { name: 'x', localPath: '/x' } })).status()).toBe(401);
    expect((await api.get(`/api/projects/${id}`)).status()).toBe(401);
    expect((await api.patch(`/api/projects/${id}`, { data: { name: 'x' } })).status()).toBe(401);
    expect((await api.delete(`/api/projects/${id}`)).status()).toBe(401);
    await api.dispose();
  });

  test('/projects redirects to sign-in', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/login\?callbackUrl=.*projects/);
    await context.close();
  });

  test('the health endpoint is public and reports the database', async ({ playwright, baseURL }) => {
    const api = await playwright.request.newContext({ baseURL });
    const res = await api.get('/api/health');
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok', database: 'ok' });
    await api.dispose();
  });
});

import { test, expect } from '@playwright/test';
import { signInAs } from './auth-helper';

test.describe('Cross-page navigation (authenticated)', () => {
  test.beforeEach(async ({ context }) => {
    await signInAs(context);
  });

  test('the "Dashboard" back-link on /settings returns to the dashboard', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await expect(page).toHaveURL('/');
  });

  test('the "Dashboard" back-link on /profile returns to the dashboard', async ({ page }) => {
    await page.goto('/profile');
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await expect(page).toHaveURL('/');
  });

  test('the "Dashboard" back-link on /projects returns to the dashboard', async ({ page }) => {
    await page.goto('/projects');
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await expect(page).toHaveURL('/');
  });

  test('/settings opens on the Integrations section, /profile opens on Account', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Integrations' })).toBeVisible();

    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Account', exact: true })).toBeVisible();
  });

  test('switching sections in the account shell does not reload the page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Account', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Security' }).click();
    await expect(page.getByRole('heading', { name: 'Sign-in method', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Plan & billing' }).click();
    await expect(page.getByRole('heading', { name: 'Plan & billing' })).toBeVisible();
  });

  test('the same account shell is reachable from both /profile and /settings', async ({ page }) => {
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Integrations' }).click();
    await expect(page.getByRole('heading', { name: 'Integrations' })).toBeVisible();

    await page.goto('/settings');
    await page.getByRole('button', { name: 'Account' }).click();
    await expect(page.getByRole('heading', { name: 'Account', exact: true })).toBeVisible();
  });
});

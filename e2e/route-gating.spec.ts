import { test, expect } from '@playwright/test';

test.describe('Route gating (unauthenticated)', () => {
  test('visiting the dashboard redirects to /login with a callbackUrl', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login\?callbackUrl=/);
  });

  test('visiting /settings redirects to /login with the right callbackUrl', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login\?callbackUrl=.*settings/);
  });

  test('visiting /profile redirects to /login with the right callbackUrl', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login\?callbackUrl=.*profile/);
  });

  test('visiting a project detail route redirects to /login', async ({ page }) => {
    await page.goto('/projects/ecommerce-api');
    await expect(page).toHaveURL(/\/login\?callbackUrl=/);
  });

  test('/login itself is reachable without a session', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to StackCendra' })).toBeVisible();
  });

  test('/signup itself is reachable without a session', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveURL('/signup');
    await expect(page.getByRole('heading', { name: 'Create your StackCendra account' })).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test('the GitHub button starts a real OAuth redirect to github.com', async ({ page }) => {
    await page.goto('/login');
    await Promise.all([
      page.waitForURL(/github\.com/, { timeout: 15_000 }),
      page.getByRole('button', { name: 'GitHub' }).click(),
    ]);
    expect(page.url()).toContain('github.com');
  });

  test('the Google button starts a real OAuth redirect to accounts.google.com', async ({ page }) => {
    await page.goto('/login');
    await Promise.all([
      page.waitForURL(/accounts\.google\.com/, { timeout: 15_000 }),
      page.getByRole('button', { name: 'Google' }).click(),
    ]);
    expect(page.url()).toContain('accounts.google.com');
  });

  test('links to the signup page', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Create an account' }).click();
    await expect(page).toHaveURL('/signup');
  });
});

test.describe('Signup page', () => {
  test('the GitHub button starts a real OAuth redirect to github.com', async ({ page }) => {
    await page.goto('/signup');
    await Promise.all([
      page.waitForURL(/github\.com/, { timeout: 15_000 }),
      page.getByRole('button', { name: 'GitHub' }).click(),
    ]);
    expect(page.url()).toContain('github.com');
  });

  test('the Google button starts a real OAuth redirect to accounts.google.com', async ({ page }) => {
    await page.goto('/signup');
    await Promise.all([
      page.waitForURL(/accounts\.google\.com/, { timeout: 15_000 }),
      page.getByRole('button', { name: 'Google' }).click(),
    ]);
    expect(page.url()).toContain('accounts.google.com');
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

import { test, expect } from '@playwright/test';
import { signInAs } from './auth-helper';

test.describe('Dashboard (authenticated)', () => {
  test.beforeEach(async ({ context }) => {
    await signInAs(context);
  });

  test('loads the dashboard instead of redirecting to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'StackCendra' })).toBeVisible();
  });

  test('the user dropdown shows the signed-in user, not the placeholder', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'TU', exact: true }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('test.user@example.com')).toBeVisible();
  });

  test('emits no console errors on initial load (hydration regression guard)', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });

  test('dashboard tabs switch content', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Git Tree' }).click();
    await expect(page.getByRole('tab', { name: 'Git Tree' })).toHaveAttribute('data-state', 'active');

    await page.getByRole('tab', { name: 'Containers' }).click();
    await expect(page.getByRole('tab', { name: 'Containers' })).toHaveAttribute('data-state', 'active');
  });

  test('Team Call tab defaults to the empty state, not a live call', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Team Call' }).click();
    await expect(page.getByText('No call in progress')).toBeVisible();
  });
});

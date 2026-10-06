import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import { TEST_DATABASE_URL } from './tests/test-db.mjs';

loadEnv({ path: '.env.local', quiet: true });

// Its own port and database, so a running `npm run dev` (8080, dev DB) is
// never reused by mistake and test data never lands in the dev database.
const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;
process.env.E2E_BASE_URL = baseURL;

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // A handful of tests hit real GitHub/Google OAuth endpoints to verify
  // this app constructs the correct redirect. Those occasionally flake
  // under high local parallelism (contention hitting a live third party,
  // not app behavior) -- one retry absorbs that without masking a real
  // regression, since a genuine bug fails consistently, not once.
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // CI tests the production build (`npm run build` runs first there).
    command: process.env.CI ? `npx next start -p ${PORT}` : `npx next dev -p ${PORT}`,
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      AUTH_URL: baseURL,
      // The connect-flow specs only check the redirect URL the app builds,
      // so placeholder client ids are enough when real ones aren't set.
      GITHUB_INTEGRATION_CLIENT_ID: process.env.GITHUB_INTEGRATION_CLIENT_ID || 'e2e-github-client-id',
      GITLAB_INTEGRATION_CLIENT_ID: process.env.GITLAB_INTEGRATION_CLIENT_ID || 'e2e-gitlab-client-id',
    },
  },
});

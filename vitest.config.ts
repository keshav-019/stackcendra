import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { TEST_DATABASE_URL } from './tests/test-db.mjs';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'e2e/**',
        '**/*.config.ts',
        'src/components/ui/**',
        '.next/**',
      ],
    },
    projects: [
      {
        // Components and pure logic, in jsdom. No database.
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          css: true,
          include: ['src/**/*.test.{ts,tsx}', 'app/**/*.test.{ts,tsx}'],
        },
      },
      {
        // Route handlers called directly against a real Postgres database,
        // with only the Auth.js session mocked. Files run one at a time
        // because they share that database.
        extends: true,
        test: {
          name: 'api',
          environment: 'node',
          include: ['tests/api/**/*.test.ts'],
          globalSetup: ['./tests/api/global-setup.ts'],
          setupFiles: ['./tests/api/setup.ts'],
          env: { DATABASE_URL: TEST_DATABASE_URL },
          fileParallelism: false,
        },
      },
    ],
  },
});

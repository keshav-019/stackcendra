import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: true,
    exclude: ['**/node_modules/**', '**/e2e/**', '**/.next/**'],
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
  },
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
});

import { execFileSync } from 'node:child_process';
import { TEST_DATABASE_URL } from '../test-db.mjs';

// Bring the test database up to the current schema once per run, using the
// same migration runner as every other environment.
export default function setup() {
  try {
    execFileSync(process.execPath, ['scripts/migrate.mjs'], {
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: 'inherit',
    });
  } catch {
    throw new Error(
      `API tests need the test database (${TEST_DATABASE_URL}). Start it with \`npm run db:up\` (Docker must be running).`
    );
  }
}

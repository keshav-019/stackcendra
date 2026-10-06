import { execFileSync } from 'node:child_process';
import { TEST_DATABASE_URL } from '../test-db.mjs';

// Bring the test database up to the current schema once per run, using the
// same migration runner as every other environment.
export default function setup() {
  execFileSync(process.execPath, ['scripts/migrate.mjs'], {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit',
  });
}

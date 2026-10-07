import { execFileSync } from 'node:child_process';
import { TEST_DATABASE_URL } from '../tests/test-db.mjs';
import { closeTestDb, testDb } from './db';
import { DEFAULT_TEST_USER } from './auth-helper';

// Fresh schema and data for every run: migrate, wipe, then insert the
// shared synthetic user that signInAs() defaults to.
export default async function globalSetup() {
  try {
    execFileSync(process.execPath, ['scripts/migrate.mjs'], {
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: 'inherit',
    });
  } catch {
    throw new Error(
      `E2E tests need the test database (${TEST_DATABASE_URL}). Start it with \`npm run db:up\` (Docker must be running).`
    );
  }
  const db = testDb();
  await db.query('truncate users cascade');
  await db.query('insert into users (id, name, email) values ($1, $2, $3)', [
    DEFAULT_TEST_USER.id,
    DEFAULT_TEST_USER.name,
    DEFAULT_TEST_USER.email,
  ]);
  await closeTestDb();
}

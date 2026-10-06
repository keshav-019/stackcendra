import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { TEST_DATABASE_URL } from '../tests/test-db.mjs';

// Direct access to the test database the E2E server uses, for seeding
// users (signInAs only mints a cookie; it never writes a user row).
let pool: pg.Pool | undefined;

export function testDb(): pg.Pool {
  pool ??= new pg.Pool({ connectionString: TEST_DATABASE_URL, max: 2 });
  return pool;
}

/** Closes the pool; a later testDb() call opens a new one. */
export async function closeTestDb() {
  const current = pool;
  pool = undefined;
  await current?.end();
}

export interface TestUser {
  id: string;
  name: string;
  email: string;
}

/** Inserts a fresh user so each test gets its own isolated data. */
export async function createTestUser(name = 'Test User'): Promise<TestUser> {
  const id = randomUUID();
  const email = `${id}@example.com`;
  await testDb().query('insert into users (id, name, email) values ($1, $2, $3)', [id, name, email]);
  return { id, name, email };
}

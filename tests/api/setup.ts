import { afterAll, beforeEach, vi } from 'vitest';
import { pool } from '@/lib/db';
import { resetDatabase } from './helpers';

// Route handlers read the session through @/lib/auth; tests choose the
// signed-in user per request with signIn()/signOut() from ./helpers.
vi.mock('@/lib/auth', () => ({ auth: vi.fn(async () => null) }));

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});

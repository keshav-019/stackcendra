// Postgres database owned by the automated tests (Vitest API tests and
// Playwright). They truncate it freely, so it must never be a real one.
// Locally `npm run db:up` starts it; CI provides a service container.
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgres://stackcendra@localhost:5433/stackcendra_test';

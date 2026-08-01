import { Pool } from 'pg';

declare global {
  var _pgPool: Pool | undefined;
}

export const pool =
  globalThis._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon's free-tier compute auto-suspends after inactivity; the first
    // connection after a suspend wakes it up, which has been observed to
    // take several seconds -- longer still if the dev server is also busy
    // compiling routes on demand under parallel load (see the E2E test
    // suite notes in docs/wiki/Testing-Quality-and-Observability.md). The
    // pg default connection timeout is too tight for that, so it's
    // widened here rather than treated as a real outage.
    connectionTimeoutMillis: 20_000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis._pgPool = pool;
}

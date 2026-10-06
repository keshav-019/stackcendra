import { Pool } from 'pg';

declare global {
  var _pgPool: Pool | undefined;
}

// Production Postgres (the `pg` container on the VM) only accepts TLS.
// Inside the VM's Docker network the CA comes from NODE_EXTRA_CA_CERTS and
// DATABASE_URL carries sslmode=verify-full. Hosts that can't mount a file
// (e.g. Vercel) instead set DATABASE_CA_CERT to the PEM text of that CA and
// leave sslmode out of the URL -- pg lets a URL sslmode override this
// `ssl` option, so the two must not be combined.
const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, '\n');

export const pool =
  globalThis._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: ca ? { ca } : undefined,
    connectionTimeoutMillis: 20_000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis._pgPool = pool;
}

#!/usr/bin/env node
// Applies every db/migrations/NNNN_*.sql not yet recorded in
// migrations.schema_migrations, oldest first. Each file runs in its own
// transaction together with its bookkeeping row, so a failing migration
// leaves nothing behind and exits non-zero.
//
// One runner for every environment: `npm run db:migrate` locally and in CI,
// and on the VM inside the app image (deploy/scripts/deploy.sh).
//
// Usage: node scripts/migrate.mjs [--dry-run]
//   DATABASE_URL selects the database (plus PGPASSWORD / DATABASE_CA_CERT,
//   the same way src/lib/db.ts reads them). MIGRATIONS_DIR overrides
//   the migrations directory.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const dryRun = process.argv.includes('--dry-run');
const dir =
  process.env.MIGRATIONS_DIR ??
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'db', 'migrations');

if (!process.env.DATABASE_URL) {
  console.error('migrate: DATABASE_URL is not set');
  process.exit(1);
}

const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, '\n');
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: ca ? { ca } : undefined,
});

async function main() {
  await client.connect();
  await client.query('set client_min_messages = warning');
  await client.query(`
    create schema if not exists migrations;
    create table if not exists migrations.schema_migrations (
      version text primary key,
      name text not null,
      applied_at timestamptz not null default now()
    );
  `);
  const { rows } = await client.query('select version from migrations.schema_migrations');
  const applied = new Set(rows.map((r) => r.version));

  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  let pending = 0;
  for (const name of files) {
    const version = name.split('_')[0];
    if (!/^\d+$/.test(version)) {
      console.warn(`migrate: skipping ${name} (no numeric version prefix)`);
      continue;
    }
    if (applied.has(version)) continue;
    pending++;
    if (dryRun) {
      console.log(`migrate: would apply ${name}`);
      continue;
    }
    console.log(`migrate: applying ${name}`);
    const sql = await readFile(path.join(dir, name), 'utf8');
    try {
      await client.query('begin');
      await client.query(sql);
      await client.query('insert into migrations.schema_migrations (version, name) values ($1, $2)', [
        version,
        name,
      ]);
      await client.query('commit');
    } catch (err) {
      await client.query('rollback');
      throw new Error(`${name}: ${err.message}`);
    }
  }

  if (pending === 0) console.log('migrate: database is up to date');
  else if (dryRun) console.log(`migrate: ${pending} pending (dry run, nothing applied)`);
  else console.log(`migrate: applied ${pending} migration(s)`);
}

main()
  .catch((err) => {
    console.error(`migrate: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => client.end());

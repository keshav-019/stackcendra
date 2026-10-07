import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Liveness + database reachability, used by the container health check and
// the deploy workflow. Unauthenticated on purpose (middleware skips /api);
// it reveals nothing beyond "up" or "database unreachable".
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await pool.query('select 1');
    return NextResponse.json({ status: 'ok', database: 'ok' });
  } catch {
    return NextResponse.json({ status: 'error', database: 'unreachable' }, { status: 503 });
  }
}

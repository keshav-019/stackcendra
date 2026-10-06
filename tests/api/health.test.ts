import { describe, expect, it, vi } from 'vitest';
import { GET } from '@/../app/api/health/route';
import { pool } from '@/lib/db';

describe('GET /api/health', () => {
  it('reports ok when the database answers', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok', database: 'ok' });
  });

  it('reports 503 without leaking the error when the database is unreachable', async () => {
    const spy = vi.spyOn(pool, 'query').mockRejectedValueOnce(new Error('connect ECONNREFUSED 10.0.0.5:5432'));
    const res = await GET();
    spy.mockRestore();
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ status: 'error', database: 'unreachable' });
  });
});

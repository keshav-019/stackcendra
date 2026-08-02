import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteConnection } from '@/lib/integrations';

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  await deleteConnection(session.user.id, 'github');
  return NextResponse.json({ ok: true });
}

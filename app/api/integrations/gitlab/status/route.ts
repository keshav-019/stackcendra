import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConnection } from '@/lib/integrations';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const connection = await getConnection(session.user.id, 'gitlab');
  return NextResponse.json({
    connected: !!connection,
    login: connection?.providerAccountLogin ?? null,
    connectedAt: connection?.connectedAt ?? null,
  });
}

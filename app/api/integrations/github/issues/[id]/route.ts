import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateSprintItemColumn } from '@/lib/sprint';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid sprint item id' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const columnStatus = body?.columnStatus;
  if (typeof columnStatus !== 'string') {
    return NextResponse.json({ error: 'columnStatus is required' }, { status: 400 });
  }

  try {
    const item = await updateSprintItemColumn(session.user.id, id, columnStatus);
    if (!item) {
      return NextResponse.json({ error: 'Sprint item not found' }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update sprint item';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

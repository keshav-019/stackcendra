import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGitlabProjects } from '@/lib/integrations';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  try {
    const repos = await getGitlabProjects(session.user.id);
    return NextResponse.json({ repos });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch projects';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

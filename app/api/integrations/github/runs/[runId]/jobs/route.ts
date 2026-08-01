import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGithubRunFailures } from '@/lib/integrations';

export async function GET(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const { runId } = await params;
  const parsedRunId = Number(runId);
  if (!Number.isInteger(parsedRunId)) {
    return NextResponse.json({ error: 'Invalid run id' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const repo = searchParams.get('repo');
  if (!repo) {
    return NextResponse.json({ error: 'repo query parameter is required' }, { status: 400 });
  }

  try {
    const failures = await getGithubRunFailures(session.user.id, repo, parsedRunId);
    return NextResponse.json({ failures });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch run failure details';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

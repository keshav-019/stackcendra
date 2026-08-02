import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGithubWorkflowRuns } from '@/lib/integrations';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const repo = searchParams.get('repo');
  if (!repo) {
    return NextResponse.json({ error: 'repo query parameter is required' }, { status: 400 });
  }

  try {
    const runs = await getGithubWorkflowRuns(session.user.id, repo);
    return NextResponse.json({ runs });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch workflow runs';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

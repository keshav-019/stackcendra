import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGitlabIssues } from '@/lib/integrations';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const project = searchParams.get('project');
  if (!project) {
    return NextResponse.json({ error: 'project query parameter is required' }, { status: 400 });
  }

  try {
    const issues = await getGitlabIssues(session.user.id, project);
    return NextResponse.json({ issues });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch issues';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

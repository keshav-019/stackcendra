import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createGitlabIssue } from '@/lib/integrations';
import { saveSprintItem, getSprintItems } from '@/lib/sprint';

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

  const items = await getSprintItems(session.user.id, 'gitlab', project);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const project = body?.project;
  const title = body?.title;
  const description = body?.body;
  const storyPoints = body?.storyPoints;

  if (typeof project !== 'string' || typeof title !== 'string') {
    return NextResponse.json({ error: 'project and title are required' }, { status: 400 });
  }

  try {
    const issue = await createGitlabIssue(session.user.id, project, { title, description });
    const item = await saveSprintItem({
      userId: session.user.id,
      provider: 'gitlab',
      repoFullName: project,
      issueNumber: issue.iid,
      issueHtmlUrl: issue.htmlUrl,
      title: issue.title,
      storyPoints: typeof storyPoints === 'number' ? storyPoints : null,
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create issue';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

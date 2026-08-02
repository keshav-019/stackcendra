import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createGithubIssue } from '@/lib/integrations';
import { saveSprintItem, getSprintItems } from '@/lib/sprint';

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

  const items = await getSprintItems(session.user.id, 'github', repo);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const repo = body?.repo;
  const title = body?.title;
  const description = body?.body;
  const storyPoints = body?.storyPoints;

  if (typeof repo !== 'string' || typeof title !== 'string') {
    return NextResponse.json({ error: 'repo and title are required' }, { status: 400 });
  }

  try {
    const issue = await createGithubIssue(session.user.id, repo, { title, body: description });
    const item = await saveSprintItem({
      userId: session.user.id,
      provider: 'github',
      repoFullName: repo,
      issueNumber: issue.number,
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

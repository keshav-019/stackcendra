import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getConnection } from '@/lib/integrations';
import { createProjectSchema, firstIssue } from '@/lib/project-schema';
import { createProject, listProjects, ProjectNameTakenError } from '@/lib/projects';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const projects = await listProjects(session.user.id);
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createProjectSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  // A linked project is only useful through the user's own integration
  // connection, so refuse to link a provider they haven't connected.
  const input = parsed.data;
  if (input.provider !== 'none' && !(await getConnection(session.user.id, input.provider))) {
    const label = input.provider === 'github' ? 'GitHub' : 'GitLab';
    return NextResponse.json({ error: `Connect ${label} before linking a repository` }, { status: 400 });
  }

  try {
    const project = await createProject(session.user.id, input);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof ProjectNameTakenError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}

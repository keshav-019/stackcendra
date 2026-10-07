import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { firstIssue, updateProjectSchema } from '@/lib/project-schema';
import { deleteProject, getProject, ProjectNameTakenError, updateProject } from '@/lib/projects';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Context = { params: Promise<{ id: string }> };

// Shared preamble: a session and a well-formed id. Another user's project
// answers 404, exactly like a missing one, so ids can't be probed.
async function authorize(context: Context) {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'unauthenticated' }, { status: 401 }) };
  }
  const { id } = await context.params;
  if (!UUID_RE.test(id)) {
    return { error: NextResponse.json({ error: 'Invalid project id' }, { status: 400 }) };
  }
  return { userId: session.user.id, id };
}

const notFound = () => NextResponse.json({ error: 'Project not found' }, { status: 404 });

export async function GET(_request: Request, context: Context) {
  const result = await authorize(context);
  if ('error' in result) return result.error;

  const project = await getProject(result.userId, result.id);
  return project ? NextResponse.json({ project }) : notFound();
}

export async function PATCH(request: Request, context: Context) {
  const result = await authorize(context);
  if ('error' in result) return result.error;

  const body = await request.json().catch(() => null);
  const parsed = updateProjectSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: firstIssue(parsed.error) }, { status: 400 });
  }

  try {
    const project = await updateProject(result.userId, result.id, parsed.data);
    return project ? NextResponse.json({ project }) : notFound();
  } catch (error) {
    if (error instanceof ProjectNameTakenError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, context: Context) {
  const result = await authorize(context);
  if ('error' in result) return result.error;

  const deleted = await deleteProject(result.userId, result.id);
  return deleted ? new NextResponse(null, { status: 204 }) : notFound();
}

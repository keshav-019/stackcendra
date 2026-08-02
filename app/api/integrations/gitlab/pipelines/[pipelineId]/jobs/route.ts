import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGitlabPipelineFailures } from '@/lib/integrations';

export async function GET(request: Request, { params }: { params: Promise<{ pipelineId: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const { pipelineId } = await params;
  const parsedPipelineId = Number(pipelineId);
  if (!Number.isInteger(parsedPipelineId)) {
    return NextResponse.json({ error: 'Invalid pipeline id' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const project = searchParams.get('project');
  if (!project) {
    return NextResponse.json({ error: 'project query parameter is required' }, { status: 400 });
  }

  try {
    const failures = await getGitlabPipelineFailures(session.user.id, project, parsedPipelineId);
    return NextResponse.json({ failures });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch pipeline failure details';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

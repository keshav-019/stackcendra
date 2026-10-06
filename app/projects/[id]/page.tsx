import { notFound, redirect } from 'next/navigation';
import { ProjectPageShell } from '@/components/projects/ProjectPageShell';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { auth } from '@/lib/auth';
import { getProject } from '@/lib/projects';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/projects/${encodeURIComponent(id)}`);

  const project = UUID_RE.test(id) ? await getProject(session.user.id, id) : null;
  if (!project) notFound();

  return (
    <ProjectPageShell breadcrumb={[{ label: 'Projects', href: '/projects' }, { label: project.name }]}>
      <ProjectDetail project={project} />
    </ProjectPageShell>
  );
}

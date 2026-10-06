import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProjectPageShell } from '@/components/projects/ProjectPageShell';
import { formatProjectDate, providerIcon, providerLabel } from '@/components/projects/provider-meta';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { listProjects } from '@/lib/projects';
import { FolderOpen, GitCommitHorizontal, Plus } from 'lucide-react';

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/projects');
  const projects = await listProjects(session.user.id);

  return (
    <ProjectPageShell
      breadcrumb={[{ label: 'Projects' }]}
      actions={
        <Button asChild className="bg-gradient-ai hover:opacity-90">
          <Link href="/projects/new">
            <Plus size={16} className="mr-1" />
            Add Project
          </Link>
        </Button>
      }
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Projects</h1>
        <p className="text-sm text-gray-400">
          Every project you track in StackCendra. Linked GitHub and GitLab projects show live branches, pull requests and CI/CD runs.
        </p>
      </div>

      {projects.length === 0 ? (
        <Card className="bg-black/20 border-white/10 p-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <FolderOpen size={22} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">No projects yet</h2>
          <p className="text-sm text-gray-400 mb-5 max-w-sm">
            Add a project to start tracking it. You can link a GitHub repository or GitLab project, or keep it local-only.
          </p>
          <Button asChild className="bg-gradient-ai hover:opacity-90">
            <Link href="/projects/new">
              <Plus size={16} className="mr-1" />
              Add your first project
            </Link>
          </Button>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Projects">
          {projects.map((project) => {
            const Icon = providerIcon[project.provider];
            return (
              <li key={project.id}>
                <Link href={`/projects/${project.id}`} className="block h-full">
                  <Card className="bg-black/20 border-white/10 p-5 hover:border-white/30 hover:bg-white/5 transition-colors h-full">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <h3 className="text-md font-semibold text-white truncate">{project.name}</h3>
                        {project.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{project.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="border-white/20 text-gray-300 flex items-center gap-1 flex-shrink-0">
                        <Icon size={12} />
                        {providerLabel[project.provider]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 min-w-0">
                      <GitCommitHorizontal size={12} className="flex-shrink-0" />
                      <span className="truncate font-mono">{project.repoFullName ?? project.localPath}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Added {formatProjectDate(project.createdAt)}</p>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </ProjectPageShell>
  );
}

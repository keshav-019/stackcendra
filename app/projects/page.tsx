import Link from 'next/link';
import { ProjectPageShell } from '@/components/projects/ProjectPageShell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockProjects } from '@/lib/mock-projects';
import { Github, Gitlab, HardDrive, Plus, GitCommitHorizontal, AlertTriangle } from 'lucide-react';

const providerIcon = { github: Github, gitlab: Gitlab, none: HardDrive } as const;
const providerLabel = { github: 'GitHub', gitlab: 'GitLab', none: 'Local only' } as const;

export default function ProjectsPage() {
  return (
    <ProjectPageShell
      breadcrumb={[{ label: 'Projects' }]}
      actions={
        <Link href="/projects/new">
          <Button className="bg-gradient-ai hover:opacity-90">
            <Plus size={16} className="mr-1" />
            Add Project
          </Button>
        </Link>
      }
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Projects</h1>
        <p className="text-sm text-gray-400">
          Every project StackCendra is tracking, with its Git status and CI/CD health at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockProjects.map((project) => {
          const Icon = providerIcon[project.provider];
          const failedRuns = project.ciRuns.filter((r) => r.status === 'failed').length;
          const needsAttention = failedRuns > 0 || project.commitsBehindOrigin > 0 || project.uncommittedFiles > 0;

          return (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="bg-black/20 border-white/10 p-5 hover:border-white/30 hover:bg-white/5 transition-colors h-full">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-md font-semibold text-white">{project.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{project.description}</p>
                  </div>
                  <Badge variant="outline" className="border-white/20 text-gray-300 flex items-center gap-1 flex-shrink-0">
                    <Icon size={12} />
                    {providerLabel[project.provider]}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <GitCommitHorizontal size={12} />
                  <span>{project.branch}</span>
                  {project.repoFullName && <span className="text-gray-600">· {project.repoFullName}</span>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {project.uncommittedFiles > 0 && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">
                        {project.uncommittedFiles} uncommitted
                      </Badge>
                    )}
                    {project.commitsBehindOrigin > 0 && (
                      <Badge className="bg-orange-500/20 text-orange-300 text-xs">
                        {project.commitsBehindOrigin} behind origin
                      </Badge>
                    )}
                    {failedRuns > 0 && (
                      <Badge className="bg-red-500/20 text-red-300 text-xs">
                        {failedRuns} CI failure{failedRuns > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {!needsAttention && (
                      <Badge className="bg-green-500/20 text-green-300 text-xs">All clear</Badge>
                    )}
                  </div>
                  {needsAttention && <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0" />}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </ProjectPageShell>
  );
}

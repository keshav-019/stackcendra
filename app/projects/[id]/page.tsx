"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ProjectPageShell } from '@/components/projects/ProjectPageShell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { mockProjects } from '@/lib/mock-projects';
import {
  Github,
  Gitlab,
  HardDrive,
  GitCommitHorizontal,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileWarning,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

const providerIcon = { github: Github, gitlab: Gitlab, none: HardDrive } as const;
const providerLabel = { github: 'GitHub', gitlab: 'GitLab', none: 'Local only' } as const;

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [expandedFix, setExpandedFix] = useState<string | null>(null);
  const [appliedFixes, setAppliedFixes] = useState<Set<string>>(new Set());

  const project =
    mockProjects.find((p) => p.id === params.id) ?? {
      ...mockProjects[0],
      id: params.id,
      name: params.id
        .split('-')
        .map((w) => w[0]?.toUpperCase() + w.slice(1))
        .join(' '),
      description: 'Newly added project — discovery has not run yet.',
      uncommittedFiles: 0,
      commitsAheadOfOrigin: 0,
      commitsBehindOrigin: 0,
      ciRuns: [],
      aiFixes: [],
    };

  const Icon = providerIcon[project.provider];
  const hasGitAttention = project.uncommittedFiles > 0 || project.commitsBehindOrigin > 0 || project.commitsAheadOfOrigin > 0;

  return (
    <ProjectPageShell breadcrumb={[{ label: 'Projects', href: '/projects' }, { label: project.name }]}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <Badge variant="outline" className="border-white/20 text-gray-300 flex items-center gap-1">
              <Icon size={12} />
              {providerLabel[project.provider]}
            </Badge>
          </div>
          <p className="text-sm text-gray-400">{project.description}</p>
        </div>
        {project.repoFullName && (
          <Badge variant="outline" className="border-white/20 text-gray-400 flex-shrink-0">
            {project.repoFullName}
          </Badge>
        )}
      </div>

      {/* Git status */}
      <Card className="bg-black/20 border-white/10 p-5 mb-4">
        <h2 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
          <GitCommitHorizontal size={18} className="text-green-400" />
          Git status
        </h2>

        <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
          <span className="font-mono bg-white/5 px-2 py-0.5 rounded">{project.branch}</span>
          <span className="text-gray-500">·</span>
          <span className="text-gray-400">{project.lastCommitMessage}</span>
        </div>

        {!hasGitAttention && (
          <Alert className="bg-green-500/10 border-green-500/20">
            <CheckCircle2 className="text-green-400" size={16} />
            <AlertTitle className="text-green-300">Up to date</AlertTitle>
            <AlertDescription className="text-gray-400">
              No uncommitted changes, and in sync with origin.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          {project.uncommittedFiles > 0 && (
            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <FileWarning className="text-yellow-400" size={16} />
              <AlertTitle className="text-yellow-300">{project.uncommittedFiles} uncommitted files</AlertTitle>
              <AlertDescription className="text-gray-400">
                Local working tree has changes that haven't been committed yet.
              </AlertDescription>
            </Alert>
          )}
          {project.commitsBehindOrigin > 0 && (
            <Alert className="bg-orange-500/10 border-orange-500/20">
              <ArrowDownToLine className="text-orange-400" size={16} />
              <AlertTitle className="text-orange-300">
                {project.commitsBehindOrigin} commit{project.commitsBehindOrigin > 1 ? 's' : ''} behind origin/{project.branch}
              </AlertTitle>
              <AlertDescription className="text-gray-400">
                Pull the latest changes before deploying to avoid overwriting teammates' work.
              </AlertDescription>
            </Alert>
          )}
          {project.commitsAheadOfOrigin > 0 && (
            <Alert className="bg-blue-500/10 border-blue-500/20">
              <ArrowUpFromLine className="text-blue-400" size={16} />
              <AlertTitle className="text-blue-300">
                {project.commitsAheadOfOrigin} commit{project.commitsAheadOfOrigin > 1 ? 's' : ''} ahead of origin/{project.branch}
              </AlertTitle>
              <AlertDescription className="text-gray-400">Push when you're ready to share this work.</AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* CI/CD status */}
      <Card className="bg-black/20 border-white/10 p-5 mb-4">
        <h2 className="text-md font-semibold text-white mb-3">CI/CD status</h2>
        {project.ciRuns.length === 0 ? (
          <p className="text-sm text-gray-500">
            {project.provider === 'none'
              ? 'Connect a GitHub or GitLab remote to see workflow runs here.'
              : 'No workflow runs detected yet.'}
          </p>
        ) : (
          <div className="space-y-2">
            {project.ciRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  {run.status === 'success' && <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />}
                  {run.status === 'failed' && <XCircle size={18} className="text-red-400 flex-shrink-0" />}
                  {run.status === 'running' && <Loader2 size={18} className="text-blue-400 flex-shrink-0 animate-spin" />}
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{run.workflow}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {run.commitSha} · {run.commitMessage} · {run.triggeredBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-500 hidden sm:inline">{run.duration}</span>
                  <span className="text-xs text-gray-500">{run.timestamp}</span>
                  {run.status === 'failed' && project.aiFixes.some((f) => f.runId === run.id) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-ai-primary/40 text-ai-accent text-xs h-7"
                      onClick={() => setExpandedFix(run.id)}
                    >
                      <Sparkles size={12} className="mr-1" />
                      AI Fix
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* AI suggested fixes */}
      {project.aiFixes.length > 0 && (
        <div className="space-y-4">
          {project.aiFixes.map((fix) => {
            const isOpen = expandedFix === fix.runId;
            const applied = appliedFixes.has(fix.id);
            return (
              <Card key={fix.id} className="bg-gradient-ai/10 border-ai-primary/20 p-5">
                <button
                  type="button"
                  onClick={() => setExpandedFix(isOpen ? null : fix.runId)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h2 className="text-md font-semibold text-white flex items-center gap-2">
                    <Sparkles size={18} className="text-ai-accent" />
                    AI suggested fix
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-ai-primary/20 text-ai-primary text-xs">{fix.confidence}% confidence</Badge>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-white mb-1">{fix.title}</p>
                      <p className="text-sm text-gray-300">{fix.rootCause}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Evidence</p>
                      <ul className="space-y-1.5">
                        {fix.evidence.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs text-gray-400">
                            <span className="text-ai-accent mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Proposed diff · {fix.filesChanged.join(', ')}
                        </p>
                        <Badge
                          className={`text-xs ${
                            fix.risk === 'Low'
                              ? 'bg-green-500/20 text-green-300'
                              : fix.risk === 'Medium'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {fix.risk} risk
                        </Badge>
                      </div>
                      <div className="code-block p-3 rounded-lg overflow-x-auto">
                        <pre className="text-xs text-gray-100 whitespace-pre">{fix.diff}</pre>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        disabled={applied}
                        onClick={() => setAppliedFixes((prev) => new Set(prev).add(fix.id))}
                        className="bg-gradient-ai hover:opacity-90 disabled:opacity-60"
                      >
                        {applied ? (
                          <>
                            <CheckCircle2 size={14} className="mr-1" />
                            Applied locally
                          </>
                        ) : (
                          'Apply Fix'
                        )}
                      </Button>
                      <Button size="sm" variant="outline" className="border-white/20 text-white">
                        Open in editor
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-400">
                        Dismiss
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      AI proposes; nothing is committed or pushed automatically — you review and apply changes yourself.
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </ProjectPageShell>
  );
}

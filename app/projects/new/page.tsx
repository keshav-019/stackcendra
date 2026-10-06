"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectPageShell } from '@/components/projects/ProjectPageShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PROJECT_NAME_MAX, type ProjectProvider } from '@/lib/project-schema';
import { Github, Gitlab, HardDrive, Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

interface RemoteRepo {
  fullName: string;
  private: boolean;
  updatedAt: string;
  defaultBranch: string;
}

type RealSource = 'github' | 'gitlab';

function isRealSource(source: ProjectProvider): source is RealSource {
  return source === 'github' || source === 'gitlab';
}

const steps = ['Basics', 'Source', 'Connect', 'Review'] as const;

const sourceOptions: { id: ProjectProvider; icon: React.ElementType; title: string; description: string }[] = [
  { id: 'none', icon: HardDrive, title: 'Local only', description: 'Discover the project on this machine. No Git remote required.' },
  { id: 'github', icon: Github, title: 'GitHub', description: 'Connect a GitHub repository to track CI/CD and pull requests.' },
  { id: 'gitlab', icon: Gitlab, title: 'GitLab', description: 'Connect a GitLab project to track pipelines and merge requests.' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState<ProjectProvider>('none');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [providerConnected, setProviderConnected] = useState<Record<RealSource, boolean>>({
    github: false,
    gitlab: false,
  });
  const [realRepos, setRealRepos] = useState<RemoteRepo[] | null>(null);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    (['github', 'gitlab'] as const).forEach((provider) => {
      fetch(`/api/integrations/${provider}/status`)
        .then((res) => (res.ok ? res.json() : { connected: false }))
        .then((data) => setProviderConnected((prev) => ({ ...prev, [provider]: !!data.connected })))
        .catch(() => setProviderConnected((prev) => ({ ...prev, [provider]: false })));
    });
  }, []);

  const needsConnection = source !== 'none';
  const effectiveSteps = needsConnection ? steps : (steps.filter((s) => s !== 'Connect') as unknown as typeof steps);

  const canAdvance =
    (step === 0 && name.trim().length > 0 && localPath.trim().length > 0) ||
    (step === 1) ||
    (step === 2 && (!needsConnection || (connected && !!selectedRepo))) ||
    step === effectiveSteps.length - 1;

  const loadRealRepos = async (provider: RealSource) => {
    setConnecting(true);
    setRepoError(null);
    try {
      const res = await fetch(`/api/integrations/${provider}/repos`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load repositories');
      setRealRepos(data.repos);
      setConnected(true);
    } catch (err) {
      setRepoError(err instanceof Error ? err.message : 'Failed to load repositories');
    } finally {
      setConnecting(false);
    }
  };

  const handleConnect = () => {
    if (!isRealSource(source)) return;
    if (providerConnected[source]) {
      loadRealRepos(source);
    } else {
      window.location.href = `/api/integrations/${source}/connect?returnTo=/projects/new`;
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          localPath,
          provider: source,
          repoFullName: needsConnection ? selectedRepo : null,
          defaultBranch: needsConnection
            ? (realRepos?.find((repo) => repo.fullName === selectedRepo)?.defaultBranch ?? null)
            : null,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? 'Failed to create project');
      router.push(`/projects/${data.project.id}`);
      router.refresh();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create project');
      setCreating(false);
    }
  };

  const goNext = () => {
    if (step === effectiveSteps.length - 1) {
      handleCreate();
      return;
    }
    setStep((s) => Math.min(s + 1, effectiveSteps.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <ProjectPageShell breadcrumb={[{ label: 'Projects', href: '/projects' }, { label: 'Add Project' }]}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">Add a project</h1>
        <p className="text-sm text-gray-400 mb-6">
          Track a project and, optionally, link the GitHub repository or GitLab project it lives in.
        </p>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {effectiveSteps.map((label, index) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border',
                    index < step && 'bg-ai-primary border-ai-primary text-white',
                    index === step && 'border-ai-primary text-ai-primary',
                    index > step && 'border-white/20 text-gray-500'
                  )}
                >
                  {index < step ? <Check size={14} /> : index + 1}
                </div>
                <span className={cn('text-xs mt-1.5', index <= step ? 'text-white' : 'text-gray-500')}>{label}</span>
              </div>
              {index < effectiveSteps.length - 1 && (
                <div className={cn('flex-1 h-px mx-2', index < step ? 'bg-ai-primary' : 'bg-white/10')} />
              )}
            </React.Fragment>
          ))}
        </div>

        <Card className="bg-black/20 border-white/10 p-6">
          {/* Step: Basics */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name" className="text-gray-300">Project name</Label>
                <Input
                  id="project-name"
                  maxLength={PROJECT_NAME_MAX}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E-Commerce API"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-path" className="text-gray-300">Local path</Label>
                <Input
                  id="project-path"
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  placeholder="C:\Users\you\code\ecommerce-api"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500">The directory StackCendra will scan for services, runtimes, and configuration.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-description" className="text-gray-300">Description (optional)</Label>
                <Textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this project do?"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
          )}

          {/* Step: Source */}
          {step === 1 && (
            <div className="space-y-3">
              <Label className="text-gray-300">Where does this project's code live?</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sourceOptions.map((option) => {
                  const Icon = option.icon;
                  const active = source === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSource(option.id);
                        setConnected(false);
                        setSelectedRepo(null);
                        setRealRepos(null);
                        setRepoError(null);
                      }}
                      className={cn(
                        'text-left rounded-lg border p-4 transition-colors',
                        active ? 'border-ai-primary bg-ai-primary/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-md bg-gradient-ai flex items-center justify-center">
                          <Icon size={16} className="text-white" />
                        </div>
                        {active && (
                          <div className="w-5 h-5 rounded-full bg-ai-primary flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-white">{option.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step: Connect */}
          {step === 2 && needsConnection && (
            <div className="space-y-4">
              {!connected ? (
                <div className="flex flex-col items-center text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-gradient-ai flex items-center justify-center mb-4">
                    {source === 'github' ? <Github size={24} className="text-white" /> : <Gitlab size={24} className="text-white" />}
                  </div>
                  <h3 className="text-md font-semibold text-white mb-1">
                    Connect your {source === 'github' ? 'GitHub' : 'GitLab'} account
                  </h3>
                  <p className="text-sm text-gray-400 mb-5 max-w-sm">
                    {source === 'github'
                      ? 'This is real: you’ll authorize StackCendra to read your repositories on github.com, then pick one below.'
                      : 'This is real: you’ll authorize StackCendra to read your projects on gitlab.com, then pick one below.'}
                  </p>
                  {repoError && <p className="text-sm text-red-400 mb-3">{repoError}</p>}
                  <Button onClick={handleConnect} disabled={connecting} className="bg-gradient-ai hover:opacity-90">
                    {connecting ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>Continue with {source === 'github' ? 'GitHub' : 'GitLab'}</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Select a repository</Label>
                    <Badge className="bg-green-500/20 text-green-300 text-xs">Connected · real repositories</Badge>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {(realRepos ?? []).map((repo) => (
                      <button
                        key={repo.fullName}
                        type="button"
                        onClick={() => setSelectedRepo(repo.fullName)}
                        className={cn(
                          'w-full text-left flex items-center justify-between p-3 rounded-lg border transition-colors',
                          selectedRepo === repo.fullName
                            ? 'border-ai-primary bg-ai-primary/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        )}
                      >
                        <div>
                          <p className="text-sm text-white font-medium">{repo.fullName}</p>
                          <p className="text-xs text-gray-500">
                            Updated {new Date(repo.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-white/20 text-gray-400 text-xs">
                          {repo.private ? 'Private' : 'Public'}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step: Review */}
          {step === effectiveSteps.length - 1 && (
            <div className="space-y-4">
              <Label className="text-gray-300">Review</Label>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Name</span>
                  <span className="text-white font-medium">{name || 'Untitled project'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Local path</span>
                  <span className="text-white font-mono text-xs">{localPath || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Source</span>
                  <span className="text-white font-medium capitalize">{source === 'none' ? 'Local only' : source}</span>
                </div>
                {needsConnection && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Repository</span>
                    <span className="text-white font-medium">{selectedRepo || '—'}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {needsConnection
                  ? 'The project page will show live branches, pull requests and CI/CD runs for this repository.'
                  : 'Local paths are recorded now; scanning them needs the desktop agent, which is not available yet.'}
              </p>
              {createError && <p role="alert" className="text-sm text-red-400">{createError}</p>}
            </div>
          )}

          <div className="flex justify-between mt-6 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={goBack} disabled={step === 0} className="border-white/20 text-white disabled:opacity-30">
              <ArrowLeft size={16} className="mr-1" />
              Back
            </Button>
            <Button onClick={goNext} disabled={!canAdvance || creating} className="bg-gradient-ai hover:opacity-90 disabled:opacity-40">
              {creating && <Loader2 size={16} className="mr-1 animate-spin" />}
              {step === effectiveSteps.length - 1 ? 'Create Project' : 'Next'}
              {step !== effectiveSteps.length - 1 && <ArrowRight size={16} className="ml-1" />}
            </Button>
          </div>
        </Card>
      </div>
    </ProjectPageShell>
  );
}

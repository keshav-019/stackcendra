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
import { mockRemoteRepos, GitProvider } from '@/lib/mock-projects';
import { Github, Gitlab, HardDrive, Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

interface RemoteRepo {
  fullName: string;
  private: boolean;
  updatedAt: string;
  defaultBranch: string;
}

const steps = ['Basics', 'Source', 'Connect', 'Review'] as const;

const sourceOptions: { id: GitProvider; icon: React.ElementType; title: string; description: string }[] = [
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
  const [source, setSource] = useState<GitProvider>('none');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [githubConnected, setGithubConnected] = useState(false);
  const [realRepos, setRealRepos] = useState<RemoteRepo[] | null>(null);
  const [repoError, setRepoError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/integrations/github/status')
      .then((res) => (res.ok ? res.json() : { connected: false }))
      .then((data) => setGithubConnected(!!data.connected))
      .catch(() => setGithubConnected(false));
  }, []);

  const needsConnection = source !== 'none';
  const effectiveSteps = needsConnection ? steps : (steps.filter((s) => s !== 'Connect') as unknown as typeof steps);

  const canAdvance =
    (step === 0 && name.trim().length > 0 && localPath.trim().length > 0) ||
    (step === 1) ||
    (step === 2 && (!needsConnection || (connected && !!selectedRepo))) ||
    step === effectiveSteps.length - 1;

  const loadRealRepos = async () => {
    setConnecting(true);
    setRepoError(null);
    try {
      const res = await fetch('/api/integrations/github/repos');
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
    if (source === 'github') {
      if (githubConnected) {
        loadRealRepos();
      } else {
        window.location.href = '/api/integrations/github/connect?returnTo=/projects/new';
      }
      return;
    }
    // GitLab isn't wired up yet -- concept-only handoff.
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 1200);
  };

  const handleCreate = () => {
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-') || 'new-project';
    router.push(`/projects/${slug}`);
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
          Concept UI — nothing here scans a real filesystem or calls a real Git provider yet.
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
                <Label className="text-gray-300">Project name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E-Commerce API"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Local path</Label>
                <Input
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  placeholder="C:\Users\you\code\ecommerce-api"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500">The directory StackCendra will scan for services, runtimes, and configuration.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Description (optional)</Label>
                <Textarea
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
                      : 'StackCendra needs read access to repository metadata, commits, and CI/CD status. This is still a concept screen for GitLab — no real OAuth handoff yet.'}
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
                    <Badge className="bg-green-500/20 text-green-300 text-xs">
                      {source === 'github' && realRepos ? 'Connected · real repositories' : 'Connected'}
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {(source === 'github' && realRepos ? realRepos : mockRemoteRepos[source]).map((repo) => (
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
                            Updated {'updatedAt' in repo ? new Date(repo.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : repo.updated}
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
                Creating the project will take you to its detail view with concept CI/CD status and AI-suggested fixes.
              </p>
            </div>
          )}

          <div className="flex justify-between mt-6 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={goBack} disabled={step === 0} className="border-white/20 text-white disabled:opacity-30">
              <ArrowLeft size={16} className="mr-1" />
              Back
            </Button>
            <Button onClick={goNext} disabled={!canAdvance} className="bg-gradient-ai hover:opacity-90 disabled:opacity-40">
              {step === effectiveSteps.length - 1 ? 'Create Project' : 'Next'}
              {step !== effectiveSteps.length - 1 && <ArrowRight size={16} className="ml-1" />}
            </Button>
          </div>
        </Card>
      </div>
    </ProjectPageShell>
  );
}

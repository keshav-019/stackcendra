"use client";

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { GitBranch, Calendar, Users, Loader2, Github, Gitlab } from 'lucide-react';
import { RealGitTree } from '@/components/modes/RealGitTree';
import { ProviderSprintBoard, CreatedSprintTask } from '@/components/modes/ProviderSprintBoard';
import { VideoCallInterface } from '@/components/VideoCallInterface';
import { MyTasks, Task, TaskSource } from '@/components/MyTasks';

type RealProvider = 'github' | 'gitlab';

interface RepoOption {
  fullName: string;
  private: boolean;
  updatedAt: string;
  defaultBranch: string;
}

const PROVIDER_META: Record<RealProvider, { label: string; icon: React.ElementType; itemLabel: string }> = {
  github: { label: 'GitHub mode', icon: Github, itemLabel: 'repository' },
  gitlab: { label: 'GitLab mode', icon: Gitlab, itemLabel: 'project' },
};

interface ProviderModeShellProps {
  provider: RealProvider;
  isManagerMode: boolean;
  tasks: Task[];
  onTasksChange: (updater: (prev: Task[]) => Task[]) => void;
  onOpenSource?: (source: TaskSource) => void;
}

export const ProviderModeShell: React.FC<ProviderModeShellProps> = ({
  provider,
  isManagerMode,
  tasks,
  onTasksChange,
  onOpenSource,
}) => {
  const [repos, setRepos] = useState<RepoOption[] | null>(null);
  const [reposError, setReposError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [activeTab, setActiveTab] = useState('git');

  useEffect(() => {
    setRepos(null);
    setSelectedRepo('');
    (async () => {
      try {
        const res = await fetch(`/api/integrations/${provider}/repos`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `Failed to load ${PROVIDER_META[provider].itemLabel}s`);
        setRepos(data.repos);
        if (data.repos.length > 0) setSelectedRepo(data.repos[0].fullName);
      } catch (error) {
        setReposError(error instanceof Error ? error.message : `Failed to load ${PROVIDER_META[provider].itemLabel}s`);
      }
    })();
  }, [provider]);

  const meta = PROVIDER_META[provider];
  const Icon = meta.icon;

  const handleTaskCreated = (created: CreatedSprintTask) => {
    onTasksChange((prev) => [
      {
        id: Date.now(),
        title: created.title,
        notes: '',
        group: 'Today',
        done: false,
        starred: false,
        tags: [],
        source: {
          provider: created.provider,
          repoFullName: created.repoFullName,
          issueNumber: created.issueNumber,
          issueHtmlUrl: created.issueHtmlUrl,
        },
      },
      ...prev,
    ]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Icon size={16} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white">{meta.label}</h2>
        </div>
        {repos && repos.length > 0 && (
          <Select value={selectedRepo} onValueChange={setSelectedRepo}>
            <SelectTrigger className="w-72 h-9 bg-white/5 border-white/10 text-white text-sm">
              <SelectValue placeholder={`Select a ${meta.itemLabel}`} />
            </SelectTrigger>
            <SelectContent>
              {repos.map((repo) => (
                <SelectItem key={repo.fullName} value={repo.fullName}>
                  {repo.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {reposError && (
        <Card className="bg-black/20 border-white/10 p-4">
          <p className="text-sm text-red-400">{reposError}</p>
        </Card>
      )}

      {!reposError && repos === null && (
        <p className="text-sm text-gray-500 flex items-center gap-1.5">
          <Loader2 size={14} className="animate-spin" /> Loading {meta.itemLabel}s...
        </p>
      )}

      {!reposError && repos !== null && repos.length === 0 && (
        <Card className="bg-black/20 border-white/10 p-6 text-center">
          <p className="text-sm text-gray-400">
            No {meta.itemLabel}s found for the connected {provider === 'github' ? 'GitHub' : 'GitLab'} account.
          </p>
        </Card>
      )}

      {!reposError && repos !== null && repos.length > 0 && selectedRepo && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 mb-4 bg-black/20 flex-shrink-0">
            <TabsTrigger value="git" className="flex items-center gap-2">
              <GitBranch size={16} />
              Git
            </TabsTrigger>
            <TabsTrigger value="sprint" className="flex items-center gap-2">
              <Calendar size={16} />
              Sprint
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Users size={16} />
              Team Call
            </TabsTrigger>
            <TabsTrigger value="mytasks" className="flex items-center gap-2">
              <Users size={16} />
              My Tasks
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="git" className="h-full">
              <div className="h-full overflow-y-auto pr-2 pb-6">
                <RealGitTree provider={provider} repo={selectedRepo} />
              </div>
            </TabsContent>

            <TabsContent value="sprint" className="h-full">
              <div className="h-full overflow-y-auto pr-2 pb-6">
                <ProviderSprintBoard provider={provider} repo={selectedRepo} onTaskCreated={handleTaskCreated} />
              </div>
            </TabsContent>

            <TabsContent value="video" className="h-full">
              <div className="h-full overflow-y-auto pr-2 pb-6">
                <VideoCallInterface isManagerMode={isManagerMode} />
              </div>
            </TabsContent>

            <TabsContent value="mytasks" className="h-full">
              <div className="h-full overflow-y-auto pr-2 pb-6">
                <MyTasks tasks={tasks} onTasksChange={onTasksChange} onOpenSource={onOpenSource} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
};

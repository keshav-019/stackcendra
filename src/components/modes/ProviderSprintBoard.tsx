"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ExternalLink, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

type RealProvider = 'github' | 'gitlab';

interface SprintItem {
  id: string;
  provider: string;
  repoFullName: string;
  issueNumber: number;
  issueHtmlUrl: string;
  title: string;
  columnStatus: string;
  storyPoints: number | null;
  createdAt: string;
}

interface GitlabIssue {
  iid: number;
  title: string;
  state: string;
  htmlUrl: string;
  authorLogin: string | null;
}

export interface CreatedSprintTask {
  provider: RealProvider;
  repoFullName: string;
  issueNumber: number;
  issueHtmlUrl: string;
  title: string;
}

const COLUMNS: { status: string; title: string; color: string }[] = [
  { status: 'todo', title: 'To Do', color: 'bg-gray-400' },
  { status: 'inprogress', title: 'In Progress', color: 'bg-blue-500' },
  { status: 'done', title: 'Done', color: 'bg-green-500' },
];

export const ProviderSprintBoard: React.FC<{
  provider: RealProvider;
  repo: string;
  onTaskCreated?: (task: CreatedSprintTask) => void;
}> = ({ provider, repo, onTaskCreated }) => {
  if (provider === 'gitlab') {
    return <GitlabIssuesReadOnly repo={repo} />;
  }
  return <GithubSprintBoard repo={repo} onTaskCreated={onTaskCreated} />;
};

const GithubSprintBoard: React.FC<{ repo: string; onTaskCreated?: (task: CreatedSprintTask) => void }> = ({
  repo,
  onTaskCreated,
}) => {
  const [items, setItems] = useState<SprintItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [storyPoints, setStoryPoints] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadItems = async () => {
    if (!repo) return;
    try {
      const res = await fetch(`/api/integrations/github/issues?repo=${encodeURIComponent(repo)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load sprint items');
      setItems(data.items);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load sprint items');
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo]);

  const createIssue = async () => {
    if (!title.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/integrations/github/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo,
          title,
          body,
          storyPoints: storyPoints ? Number(storyPoints) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create issue');
      setItems((prev) => [data.item, ...(prev ?? [])]);
      onTaskCreated?.({
        provider: 'github',
        repoFullName: repo,
        issueNumber: data.item.issueNumber,
        issueHtmlUrl: data.item.issueHtmlUrl,
        title: data.item.title,
      });
      setTitle('');
      setBody('');
      setStoryPoints('');
      setShowForm(false);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create issue');
    } finally {
      setCreating(false);
    }
  };

  const moveItem = async (item: SprintItem, columnStatus: string) => {
    setItems((prev) => (prev ?? []).map((i) => (i.id === item.id ? { ...i, columnStatus } : i)));
    try {
      const res = await fetch(`/api/integrations/github/issues/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      loadItems();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-black/20 border-white/10 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Issues created here are real GitHub issues on <span className="text-gray-300">{repo}</span>. Column and
            story points are local to StackCendra only.
          </p>
          <Button size="sm" onClick={() => setShowForm((v) => !v)} className="bg-gradient-ai flex-shrink-0">
            <Plus size={14} className="mr-1" />
            Create Issue
          </Button>
        </div>

        {showForm && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
            <Input
              placeholder="Issue title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <Textarea
              placeholder="Description..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Story points"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                className="bg-white/5 border-white/10 text-white w-32"
              />
              <Button onClick={createIssue} disabled={creating} className="bg-gradient-ai">
                {creating ? <Loader2 size={14} className="animate-spin" /> : 'Create'}
              </Button>
            </div>
            {createError && <p className="text-xs text-red-400">{createError}</p>}
          </div>
        )}
      </Card>

      {loadError && <p className="text-xs text-red-400">{loadError}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((column) => {
          const columnItems = (items ?? []).filter((i) => i.columnStatus === column.status);
          return (
            <div key={column.status} className="bg-black/20 border border-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${column.color}`} />
                  {column.title}
                </h4>
                <Badge className="bg-white/10 text-gray-300 text-xs">{columnItems.length}</Badge>
              </div>
              <div className="space-y-2">
                {columnItems.map((item) => (
                  <Card key={item.id} className="p-3 bg-white/5 border border-white/10">
                    <p className="text-sm text-white mb-2 leading-snug">{item.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500 font-mono">#{item.issueNumber}</span>
                        {item.storyPoints !== null && (
                          <Badge className="bg-white/10 text-gray-300 text-[10px] px-1.5">{item.storyPoints} pts</Badge>
                        )}
                      </div>
                      <a
                        href={item.issueHtmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {column.status === 'todo' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveItem(item, 'inprogress')}
                          className="h-6 px-2 text-[11px] border-white/20 text-white"
                        >
                          Start <ArrowRight size={11} className="ml-1" />
                        </Button>
                      )}
                      {column.status === 'inprogress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveItem(item, 'done')}
                          className="h-6 px-2 text-[11px] border-white/20 text-white"
                        >
                          Done <CheckCircle2 size={11} className="ml-1" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
                {columnItems.length === 0 && <p className="text-xs text-gray-600 text-center py-4">No issues</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GitlabIssuesReadOnly: React.FC<{ repo: string }> = ({ repo }) => {
  const [issues, setIssues] = useState<GitlabIssue[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!repo) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(`/api/integrations/gitlab/issues?project=${encodeURIComponent(repo)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load issues');
        setIssues(data.issues);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load issues');
      } finally {
        setLoading(false);
      }
    })();
  }, [repo]);

  const columns: { state: string; title: string; color: string }[] = [
    { state: 'opened', title: 'Open', color: 'bg-blue-500' },
    { state: 'closed', title: 'Closed', color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-black/20 border-white/10 p-4">
        <p className="text-xs text-gray-400">
          GitLab issues on <span className="text-gray-300">{repo}</span> are read-only here for now — StackCendra
          doesn't have write access to your GitLab projects yet.
        </p>
      </Card>

      {loading && (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <Loader2 size={12} className="animate-spin" /> Loading...
        </p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {columns.map((column) => {
          const columnIssues = (issues ?? []).filter((i) => i.state === column.state);
          return (
            <div key={column.state} className="bg-black/20 border border-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${column.color}`} />
                  {column.title}
                </h4>
                <Badge className="bg-white/10 text-gray-300 text-xs">{columnIssues.length}</Badge>
              </div>
              <div className="space-y-2">
                {columnIssues.map((issue) => (
                  <a
                    key={issue.iid}
                    href={issue.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <p className="text-sm text-white mb-1">{issue.title}</p>
                    <p className="text-xs text-gray-500">
                      #{issue.iid} {issue.authorLogin && `· ${issue.authorLogin}`}
                    </p>
                  </a>
                ))}
                {columnIssues.length === 0 && <p className="text-xs text-gray-600 text-center py-4">No issues</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

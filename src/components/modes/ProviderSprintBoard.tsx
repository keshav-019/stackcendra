"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ExternalLink, Loader2, ArrowRight, CheckCircle2, X } from 'lucide-react';

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
  closed: boolean;
  createdAt: string;
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

interface ProviderConfig {
  issuesEndpoint: (repo: string) => string;
  createEndpoint: string;
  itemEndpoint: (id: string) => string;
  repoBodyKey: 'repo' | 'project';
  issueNoun: string;
  itemNoun: string;
}

const PROVIDER_CONFIG: Record<RealProvider, ProviderConfig> = {
  github: {
    issuesEndpoint: (repo) => `/api/integrations/github/issues?repo=${encodeURIComponent(repo)}`,
    createEndpoint: '/api/integrations/github/issues',
    itemEndpoint: (id) => `/api/integrations/github/issues/${id}`,
    repoBodyKey: 'repo',
    issueNoun: 'GitHub issues',
    itemNoun: 'repository',
  },
  gitlab: {
    issuesEndpoint: (repo) => `/api/integrations/gitlab/issues?project=${encodeURIComponent(repo)}`,
    createEndpoint: '/api/integrations/gitlab/issues',
    itemEndpoint: (id) => `/api/integrations/gitlab/issues/${id}`,
    repoBodyKey: 'project',
    issueNoun: 'GitLab issues',
    itemNoun: 'project',
  },
};

export const ProviderSprintBoard: React.FC<{
  provider: RealProvider;
  repo: string;
  onTaskCreated?: (task: CreatedSprintTask) => void;
}> = ({ provider, repo, onTaskCreated }) => {
  const config = PROVIDER_CONFIG[provider];
  const [items, setItems] = useState<SprintItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [storyPoints, setStoryPoints] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [closingItemId, setClosingItemId] = useState<string | null>(null);
  const [closeComment, setCloseComment] = useState('');
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  const loadItems = async () => {
    if (!repo) return;
    try {
      const res = await fetch(config.issuesEndpoint(repo));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load sprint items');
      setItems(data.items);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load sprint items');
    }
  };

  useEffect(() => {
    setItems(null);
    setLoadError(null);
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, repo]);

  const createIssue = async () => {
    if (!title.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch(config.createEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [config.repoBodyKey]: repo,
          title,
          body,
          storyPoints: storyPoints ? Number(storyPoints) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create issue');
      setItems((prev) => [data.item, ...(prev ?? [])]);
      onTaskCreated?.({
        provider,
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
      const res = await fetch(config.itemEndpoint(item.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      loadItems();
    }
  };

  const closeItem = async (item: SprintItem) => {
    setClosing(true);
    setCloseError(null);
    try {
      const res = await fetch(config.itemEndpoint(item.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closeIssue: true, comment: closeComment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to close issue');
      setItems((prev) => (prev ?? []).map((i) => (i.id === item.id ? data.item : i)));
      setClosingItemId(null);
      setCloseComment('');
    } catch (error) {
      setCloseError(error instanceof Error ? error.message : 'Failed to close issue');
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-black/20 border-white/10 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Issues created here are real {config.issueNoun} on <span className="text-gray-300">{repo}</span>. Column
            and story points are local to StackCendra only.
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
                        {item.closed && <Badge className="bg-green-500/20 text-green-300 text-[10px] px-1.5">Closed</Badge>}
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
                    {!item.closed && (
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setClosingItemId(closingItemId === item.id ? null : item.id);
                            setCloseComment('');
                            setCloseError(null);
                          }}
                          className="h-6 px-2 text-[11px] border-white/20 text-white"
                        >
                          {closingItemId === item.id ? <X size={11} /> : 'Close'}
                        </Button>
                      </div>
                    )}
                    {closingItemId === item.id && (
                      <div className="mt-2 pt-2 border-t border-white/10 space-y-2">
                        <Textarea
                          placeholder="Comment to add before closing (optional)..."
                          value={closeComment}
                          onChange={(e) => setCloseComment(e.target.value)}
                          className="bg-white/5 border-white/10 text-white text-xs min-h-16"
                        />
                        <Button
                          size="sm"
                          onClick={() => closeItem(item)}
                          disabled={closing}
                          className="h-7 px-2 text-[11px] bg-gradient-ai"
                        >
                          {closing ? <Loader2 size={12} className="animate-spin" /> : 'Close issue'}
                        </Button>
                        {closeError && <p className="text-xs text-red-400">{closeError}</p>}
                      </div>
                    )}
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

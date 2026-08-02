"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RunStatusBadge } from '@/components/RunStatusBadge';
import { GitBranch, GitPullRequest, ExternalLink, Loader2, GitCommit } from 'lucide-react';

type RealProvider = 'github' | 'gitlab';

interface Branch {
  name: string;
  sha: string;
  protected: boolean;
}

interface Commit {
  sha: string;
  message: string;
  authorName: string;
  authorLogin?: string | null;
  date: string;
  htmlUrl: string;
}

interface Change {
  number: number;
  title: string;
  authorLogin: string | null;
  htmlUrl: string;
  createdAt: string;
  branch: string;
}

interface Run {
  id: number;
  displayTitle: string;
  status: string;
  conclusion: string | null;
  headBranch: string;
  runNumber: number;
  htmlUrl: string;
}

const PROVIDER_LABEL: Record<RealProvider, { changesLabel: string; ciLabel: string }> = {
  github: { changesLabel: 'Open pull requests', ciLabel: 'GitHub Actions' },
  gitlab: { changesLabel: 'Open merge requests', ciLabel: 'GitLab Pipelines' },
};

function overviewUrl(provider: RealProvider, repo: string) {
  const param = provider === 'github' ? 'repo' : 'project';
  return `/api/integrations/${provider}/repo-overview?${param}=${encodeURIComponent(repo)}`;
}

function runsUrl(provider: RealProvider, repo: string) {
  return provider === 'github'
    ? `/api/integrations/github/runs?repo=${encodeURIComponent(repo)}`
    : `/api/integrations/gitlab/pipelines?project=${encodeURIComponent(repo)}`;
}

export const RealGitTree: React.FC<{ provider: RealProvider; repo: string }> = ({ provider, repo }) => {
  const [branches, setBranches] = useState<Branch[] | null>(null);
  const [commits, setCommits] = useState<Commit[] | null>(null);
  const [changes, setChanges] = useState<Change[] | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  const [runs, setRuns] = useState<Run[] | null>(null);
  const [runsError, setRunsError] = useState<string | null>(null);
  const [runsLoading, setRunsLoading] = useState(false);

  useEffect(() => {
    if (!repo) return;
    setOverviewLoading(true);
    setOverviewError(null);
    (async () => {
      try {
        const res = await fetch(overviewUrl(provider, repo));
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load repository overview');
        setBranches(data.branches);
        setCommits(data.commits);
        setChanges(
          provider === 'github'
            ? data.pullRequests.map((p: { number: number; title: string; authorLogin: string | null; htmlUrl: string; createdAt: string; headRef: string }) => ({
                number: p.number,
                title: p.title,
                authorLogin: p.authorLogin,
                htmlUrl: p.htmlUrl,
                createdAt: p.createdAt,
                branch: p.headRef,
              }))
            : data.mergeRequests.map((m: { iid: number; title: string; authorLogin: string | null; htmlUrl: string; createdAt: string; sourceBranch: string }) => ({
                number: m.iid,
                title: m.title,
                authorLogin: m.authorLogin,
                htmlUrl: m.htmlUrl,
                createdAt: m.createdAt,
                branch: m.sourceBranch,
              }))
        );
      } catch (error) {
        setOverviewError(error instanceof Error ? error.message : 'Failed to load repository overview');
      } finally {
        setOverviewLoading(false);
      }
    })();
  }, [provider, repo]);

  useEffect(() => {
    if (!repo) return;
    setRunsLoading(true);
    setRunsError(null);
    (async () => {
      try {
        const res = await fetch(runsUrl(provider, repo));
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load CI/CD runs');
        setRuns(data.runs);
      } catch (error) {
        setRunsError(error instanceof Error ? error.message : 'Failed to load CI/CD runs');
      } finally {
        setRunsLoading(false);
      }
    })();
  }, [provider, repo]);

  const labels = PROVIDER_LABEL[provider];

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <GitBranch size={16} className="text-pink-400" />
          Branches
        </h3>
        {overviewLoading && (
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin" /> Loading...
          </p>
        )}
        {overviewError && <p className="text-xs text-red-400">{overviewError}</p>}
        {!overviewLoading && !overviewError && branches && (
          <div className="space-y-2">
            {branches.map((b) => (
              <div key={b.name} className="flex items-center justify-between p-2.5 rounded-lg border border-white/10 bg-white/5">
                <div className="flex items-center gap-2 min-w-0">
                  <GitBranch size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-white truncate">{b.name}</span>
                  {b.protected && <Badge className="bg-green-500/20 text-green-300 text-[10px]">protected</Badge>}
                </div>
                <span className="text-xs text-gray-500 font-mono flex-shrink-0">{b.sha.slice(0, 7)}</span>
              </div>
            ))}
            {branches.length === 0 && <p className="text-xs text-gray-500">No branches found.</p>}
          </div>
        )}
      </Card>

      <Card className="bg-black/20 border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <GitCommit size={16} className="text-blue-400" />
          Recent commits
        </h3>
        {!overviewLoading && !overviewError && commits && (
          <div className="space-y-2">
            {commits.map((c) => (
              <div key={c.sha} className="p-3 border border-white/10 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-xs bg-white/10 px-2 py-0.5 rounded text-blue-300">{c.sha.slice(0, 7)}</code>
                  <a href={c.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white">
                    <ExternalLink size={12} />
                  </a>
                </div>
                <p className="text-sm text-white truncate">{c.message.split('\n')[0]}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {c.authorLogin ?? c.authorName} · {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
            {commits.length === 0 && <p className="text-xs text-gray-500">No commits found.</p>}
          </div>
        )}
      </Card>

      <Card className="bg-black/20 border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <GitPullRequest size={16} className="text-purple-400" />
          {labels.changesLabel}
        </h3>
        {!overviewLoading && !overviewError && changes && (
          <div className="space-y-2">
            {changes.map((c) => (
              <a
                key={c.number}
                href={c.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">
                    #{c.number} {c.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {c.branch} {c.authorLogin && `· by ${c.authorLogin}`}
                  </p>
                </div>
                <ExternalLink size={14} className="text-gray-500 flex-shrink-0" />
              </a>
            ))}
            {changes.length === 0 && <p className="text-xs text-gray-500">Nothing open right now.</p>}
          </div>
        )}
      </Card>

      <Card className="bg-black/20 border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">{labels.ciLabel}</h3>
        {runsLoading && (
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin" /> Loading...
          </p>
        )}
        {runsError && <p className="text-xs text-red-400">{runsError}</p>}
        {!runsLoading && !runsError && runs && (
          <div className="space-y-2">
            {runs.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg border border-white/10 bg-white/5">
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{r.displayTitle}</p>
                  <p className="text-xs text-gray-500">
                    {r.headBranch} · #{r.runNumber}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <RunStatusBadge status={r.status} conclusion={r.conclusion} />
                  <a href={r.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white">
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
            {runs.length === 0 && <p className="text-xs text-gray-500">No recent runs found.</p>}
          </div>
        )}
      </Card>
    </div>
  );
};

"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockIntegrations, integrationCategories, IntegrationTier } from '@/lib/mock-integrations';
import {
  ShieldCheck,
  Search,
  User,
  Building2,
  Check,
  Plus,
  KeyRound,
  Copy,
  Trash2,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  CircleDashed,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Workflow,
} from 'lucide-react';

export type Edition = 'individual' | 'enterprise';

interface EditionProps {
  edition: Edition;
  onEditionChange: (edition: Edition) => void;
}

export const GeneralSection: React.FC<{ edition: Edition }> = ({ edition }) => (
  <Card className="bg-black/20 border-white/10 p-6">
    <h2 className="text-lg font-semibold text-white mb-1">General</h2>
    <p className="text-sm text-gray-400 mb-6">Workspace-level defaults.</p>
    {edition === 'enterprise' ? (
      <div className="space-y-4 max-w-sm">
        <div className="space-y-2">
          <Label className="text-gray-300">Workspace name</Label>
          <Input defaultValue="Acme Corp" className="bg-white/5 border-white/10 text-white" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Default project visibility</p>
            <p className="text-xs text-gray-500">New projects default to private within the organization.</p>
          </div>
          <Badge variant="outline" className="border-white/20 text-gray-300 text-xs">Private</Badge>
        </div>
      </div>
    ) : (
      <p className="text-sm text-gray-500">
        Workspace-level settings apply to the Enterprise edition. You're on the Individual edition — nothing to
        configure here. See <span className="text-gray-300">Plan &amp; billing</span> to switch.
      </p>
    )}
  </Card>
);

const tierLabel: Record<IntegrationTier, string> = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' };
const tierClass: Record<IntegrationTier, string> = {
  1: 'bg-green-500/20 text-green-300',
  2: 'bg-blue-500/20 text-blue-300',
  3: 'bg-gray-500/20 text-gray-300',
};

type RealProvider = 'github' | 'gitlab';

interface ProviderStatus {
  connected: boolean;
  login: string | null;
}

interface RealRepoOption {
  fullName: string;
  private: boolean;
  updatedAt: string;
  defaultBranch: string;
}

interface WorkflowRun {
  id: number;
  name: string;
  displayTitle: string;
  status: string;
  conclusion: string | null;
  headBranch: string;
  headSha: string;
  event: string;
  actorLogin: string | null;
  runNumber: number;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface JobFailure {
  jobName: string;
  stepName: string | null;
  conclusion: string | null;
}

const RunStatusBadge: React.FC<{ status: string; conclusion: string | null }> = ({ status, conclusion }) => {
  if (status !== 'completed') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-300">
        <Loader2 size={14} className="animate-spin" />
        {status === 'queued' ? 'Queued' : 'Running'}
      </span>
    );
  }
  if (conclusion === 'success') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-300">
        <CheckCircle2 size={14} />
        Success
      </span>
    );
  }
  if (conclusion === 'failure') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-300">
        <XCircle size={14} />
        Failed
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400">
      <CircleDashed size={14} />
      {conclusion ?? 'Unknown'}
    </span>
  );
};

interface CiProviderConfig {
  label: string;
  itemLabel: string;
  reposEndpoint: string;
  runsEndpoint: (value: string) => string;
  jobsEndpoint: (runId: number, value: string) => string;
  repoPlaceholder: string;
  emptyReposMessage: string;
  emptyRunsMessage: string;
}

const CI_PROVIDER_CONFIG: Record<RealProvider, CiProviderConfig> = {
  github: {
    label: 'GitHub Actions',
    itemLabel: 'repository',
    reposEndpoint: '/api/integrations/github/repos',
    runsEndpoint: (repo) => `/api/integrations/github/runs?repo=${encodeURIComponent(repo)}`,
    jobsEndpoint: (runId, repo) => `/api/integrations/github/runs/${runId}/jobs?repo=${encodeURIComponent(repo)}`,
    repoPlaceholder: 'Select a repository',
    emptyReposMessage: 'No repositories found for the connected GitHub account.',
    emptyRunsMessage: 'No GitHub Actions workflow runs found for this repository.',
  },
  gitlab: {
    label: 'GitLab Pipelines',
    itemLabel: 'project',
    reposEndpoint: '/api/integrations/gitlab/repos',
    runsEndpoint: (project) => `/api/integrations/gitlab/pipelines?project=${encodeURIComponent(project)}`,
    jobsEndpoint: (pipelineId, project) =>
      `/api/integrations/gitlab/pipelines/${pipelineId}/jobs?project=${encodeURIComponent(project)}`,
    repoPlaceholder: 'Select a project',
    emptyReposMessage: 'No projects found for the connected GitLab account.',
    emptyRunsMessage: 'No GitLab pipelines found for this project.',
  },
};

const CiCdActivityPanel: React.FC<{ provider: RealProvider; login: string | null }> = ({ provider, login }) => {
  const config = CI_PROVIDER_CONFIG[provider];
  const [repos, setRepos] = useState<RealRepoOption[] | null>(null);
  const [reposError, setReposError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [runs, setRuns] = useState<WorkflowRun[] | null>(null);
  const [runsError, setRunsError] = useState<string | null>(null);
  const [runsLoading, setRunsLoading] = useState(false);
  const [expandedRunId, setExpandedRunId] = useState<number | null>(null);
  const [failuresByRun, setFailuresByRun] = useState<Record<number, JobFailure[] | 'loading' | 'error'>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(config.reposEndpoint);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `Failed to load ${config.itemLabel}s`);
        setRepos(data.repos);
        if (data.repos.length > 0) setSelectedRepo(data.repos[0].fullName);
      } catch (error) {
        setReposError(error instanceof Error ? error.message : `Failed to load ${config.itemLabel}s`);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  useEffect(() => {
    if (!selectedRepo) return;
    setRunsLoading(true);
    setRunsError(null);
    setExpandedRunId(null);
    (async () => {
      try {
        const res = await fetch(config.runsEndpoint(selectedRepo));
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load runs');
        setRuns(data.runs);
      } catch (error) {
        setRunsError(error instanceof Error ? error.message : 'Failed to load runs');
        setRuns(null);
      } finally {
        setRunsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepo]);

  const toggleFailureDetails = async (run: WorkflowRun) => {
    if (expandedRunId === run.id) {
      setExpandedRunId(null);
      return;
    }
    setExpandedRunId(run.id);
    if (failuresByRun[run.id]) return;
    setFailuresByRun((prev) => ({ ...prev, [run.id]: 'loading' }));
    try {
      const res = await fetch(config.jobsEndpoint(run.id, selectedRepo));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load failure details');
      setFailuresByRun((prev) => ({ ...prev, [run.id]: data.failures }));
    } catch {
      setFailuresByRun((prev) => ({ ...prev, [run.id]: 'error' }));
    }
  };

  return (
    <Card className="bg-black/20 border-white/10 p-4 mb-6">
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Workflow size={16} className="text-gray-300" />
          <h3 className="text-sm font-semibold text-white">CI/CD activity</h3>
          {login && <span className="text-xs text-gray-500">via {login}'s {config.label}</span>}
        </div>
        {repos && repos.length > 0 && (
          <Select value={selectedRepo} onValueChange={setSelectedRepo}>
            <SelectTrigger className="w-64 h-8 bg-white/5 border-white/10 text-white text-xs">
              <SelectValue placeholder={config.repoPlaceholder} />
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

      {reposError && <p className="text-xs text-red-400">{reposError}</p>}

      {!reposError && repos && repos.length === 0 && <p className="text-xs text-gray-500">{config.emptyReposMessage}</p>}

      {repos && repos.length > 0 && (
        <>
          {runsLoading && (
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" /> Loading runs...
            </p>
          )}
          {runsError && <p className="text-xs text-red-400">{runsError}</p>}
          {!runsLoading && !runsError && runs && runs.length === 0 && (
            <p className="text-xs text-gray-500">{config.emptyRunsMessage}</p>
          )}
          {!runsLoading && !runsError && runs && runs.length > 0 && (
            <div className="space-y-2">
              {runs.map((run) => {
                const failures = failuresByRun[run.id];
                const isExpanded = expandedRunId === run.id;
                return (
                  <div key={run.id} className="rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{run.displayTitle}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <GitBranch size={12} />
                            {run.headBranch}
                          </span>
                          <span>#{run.runNumber}</span>
                          <span>{run.event}</span>
                          {run.actorLogin && <span>by {run.actorLogin}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <RunStatusBadge status={run.status} conclusion={run.conclusion} />
                        {run.conclusion === 'failure' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleFailureDetails(run)}
                            className="h-7 px-2 text-xs text-red-300 hover:text-red-200"
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            Error
                          </Button>
                        )}
                        <Button asChild size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400">
                          <a href={run.htmlUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={14} />
                          </a>
                        </Button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-white/10 px-3 py-2">
                        {failures === 'loading' && (
                          <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Loader2 size={12} className="animate-spin" /> Loading failure details...
                          </p>
                        )}
                        {failures === 'error' && <p className="text-xs text-red-400">Failed to load failure details.</p>}
                        {Array.isArray(failures) && failures.length === 0 && (
                          <p className="text-xs text-gray-500">No failed jobs found for this run.</p>
                        )}
                        {Array.isArray(failures) &&
                          failures.map((failure, index) => (
                            <p key={index} className="text-xs text-red-300">
                              {failure.jobName}
                              {failure.stepName ? ` -- step "${failure.stepName}" failed` : ' failed'}
                            </p>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Card>
  );
};

const REAL_PROVIDERS: { id: RealProvider; label: string }[] = [
  { id: 'github', label: 'GitHub' },
  { id: 'gitlab', label: 'GitLab' },
];

const RealIntegrationRow: React.FC<{
  integration: (typeof mockIntegrations)[number];
  connected: boolean;
  login: string | null;
  busy: boolean;
  connectHref: string;
  onDisconnect: () => void;
}> = ({ integration, connected, login, busy, connectHref, onDisconnect }) => {
  const Icon = integration.icon;
  return (
    <Card className="bg-black/20 border-white/10 p-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <Icon size={16} className="text-gray-300" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white truncate">{integration.name}</p>
            <Badge className={`text-[10px] px-1.5 ${tierClass[integration.tier]}`}>{tierLabel[integration.tier]}</Badge>
            <Badge className="text-[10px] px-1.5 bg-ai-primary/20 text-ai-primary">Real</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{connected ? `Connected as ${login}` : integration.description}</p>
        </div>
      </div>
      {connected ? (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={onDisconnect}
          className="border-white/20 text-white flex-shrink-0"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : 'Disconnect'}
        </Button>
      ) : (
        <Button asChild size="sm" className="bg-gradient-ai hover:opacity-90 flex-shrink-0">
          <a href={connectHref}>Connect</a>
        </Button>
      )}
    </Card>
  );
};

export const IntegrationsSection = () => {
  const [connections, setConnections] = useState<Record<string, boolean>>(
    Object.fromEntries(
      mockIntegrations.filter((i) => i.id !== 'github' && i.id !== 'gitlab').map((i) => [i.id, i.connected])
    )
  );
  const [query, setQuery] = useState('');
  const [realStatus, setRealStatus] = useState<Record<RealProvider, ProviderStatus | null>>({
    github: null,
    gitlab: null,
  });
  const [realBusy, setRealBusy] = useState<Record<RealProvider, boolean>>({ github: false, gitlab: false });
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const loadRealStatus = async (provider: RealProvider) => {
    const res = await fetch(`/api/integrations/${provider}/status`);
    if (res.ok) {
      const data = await res.json();
      setRealStatus((prev) => ({ ...prev, [provider]: data }));
    }
  };

  useEffect(() => {
    REAL_PROVIDERS.forEach((p) => loadRealStatus(p.id));
  }, []);

  useEffect(() => {
    for (const p of REAL_PROVIDERS) {
      if (searchParams.get(`${p.id}_connected`)) {
        toast.success(`${p.label} connected`);
        router.replace(pathname);
        loadRealStatus(p.id);
      } else if (searchParams.get(`${p.id}_error`)) {
        toast.error(`${p.label} connection failed: ${searchParams.get(`${p.id}_error`)}`);
        router.replace(pathname);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const disconnectProvider = async (provider: RealProvider, label: string) => {
    setRealBusy((prev) => ({ ...prev, [provider]: true }));
    try {
      const res = await fetch(`/api/integrations/${provider}/disconnect`, { method: 'POST' });
      if (res.ok) {
        toast.success(`${label} disconnected`);
        await loadRealStatus(provider);
      } else {
        toast.error(`Failed to disconnect ${label}`);
      }
    } finally {
      setRealBusy((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const toggleConnection = (id: string) => {
    setConnections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = mockIntegrations.filter(
    (i) =>
      i.name.toLowerCase().includes(query.toLowerCase()) ||
      i.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <Card className="bg-black/20 border-white/10 p-4 mb-6 flex items-start gap-3">
        <ShieldCheck size={20} className="text-ai-success flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-white">How access tokens are stored today</p>
          <p className="text-xs text-gray-400 mt-0.5">
            GitHub and GitLab are real: each access token is encrypted (AES-256-GCM) before it's stored, and only
            decrypted server-side when StackCendra needs to call that provider's API on your behalf (GitLab's tokens
            also auto-refresh before they expire). This is an interim step for the web-only phase, not the
            local-only vault described elsewhere in the product plan — that model (credentials encrypted and
            decrypted only on your device) arrives with the desktop app. Every other integration below is still
            mock UI.
          </p>
        </div>
      </Card>

      {REAL_PROVIDERS.map(
        (p) => realStatus[p.id]?.connected && <CiCdActivityPanel key={p.id} provider={p.id} login={realStatus[p.id]?.login ?? null} />
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Integrations</h2>
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search integrations..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-9"
          />
        </div>
      </div>

      <div className="space-y-6">
        {integrationCategories.map((category) => {
          const items = filtered.filter((i) => i.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">{category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((integration) => {
                  const Icon = integration.icon;

                  if (integration.id === 'github' || integration.id === 'gitlab') {
                    const provider = integration.id as RealProvider;
                    const label = provider === 'github' ? 'GitHub' : 'GitLab';
                    const status = realStatus[provider];
                    return (
                      <RealIntegrationRow
                        key={provider}
                        integration={integration}
                        connected={!!status?.connected}
                        login={status?.login ?? null}
                        busy={realBusy[provider]}
                        connectHref={`/api/integrations/${provider}/connect`}
                        onDisconnect={() => disconnectProvider(provider, label)}
                      />
                    );
                  }

                  const connected = connections[integration.id];
                  return (
                    <Card key={integration.id} className="bg-black/20 border-white/10 p-4 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          <Icon size={16} className="text-gray-300" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white truncate">{integration.name}</p>
                            <Badge className={`text-[10px] px-1.5 ${tierClass[integration.tier]}`}>
                              {tierLabel[integration.tier]}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{integration.description}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={connected ? 'outline' : 'default'}
                        onClick={() => toggleConnection(integration.id)}
                        className={connected ? 'border-white/20 text-white flex-shrink-0' : 'bg-gradient-ai hover:opacity-90 flex-shrink-0'}
                      >
                        {connected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TeamSection: React.FC<{ edition: Edition }> = ({ edition }) => {
  const members = [
    { name: 'John Doe', role: 'Owner', initials: 'JD' },
    { name: 'Sarah Chen', role: 'Admin', initials: 'SC' },
    { name: 'Mike Rodriguez', role: 'Member', initials: 'MR' },
  ];

  if (edition !== 'enterprise') {
    return (
      <Card className="bg-black/20 border-white/10 p-10 flex flex-col items-center text-center">
        <Users size={28} className="text-gray-500 mb-3" />
        <h2 className="text-lg font-semibold text-white mb-1">Team management is part of Enterprise</h2>
        <p className="text-sm text-gray-400 max-w-sm mb-4">
          Invite teammates, assign roles, and manage approvals once you switch to the Enterprise edition.
        </p>
        <Button disabled className="bg-gradient-ai opacity-60">Upgrade to Enterprise</Button>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Team & members</h2>
        <Button size="sm" disabled className="bg-gradient-ai opacity-60">
          <Plus size={14} className="mr-1" />
          Invite member
        </Button>
      </div>
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.name} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-ai text-white text-xs">{member.initials}</AvatarFallback>
              </Avatar>
              <p className="text-sm text-white">{member.name}</p>
            </div>
            <Badge variant="outline" className="border-white/20 text-gray-300 text-xs">{member.role}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const ApiKeysSection = () => {
  const tokens = [
    { name: 'Local dev CLI', created: '2026-06-12', lastUsed: '2 hours ago', masked: 'sc_live_••••••••3f9a' },
    { name: 'CI pipeline', created: '2026-05-30', lastUsed: '1 day ago', masked: 'sc_live_••••••••81be' },
  ];

  return (
    <Card className="bg-black/20 border-white/10 p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-white">API keys & tokens</h2>
        <Button size="sm" disabled className="bg-gradient-ai opacity-60">
          <Plus size={14} className="mr-1" />
          Generate new token
        </Button>
      </div>
      <p className="text-sm text-gray-400 mb-4">Personal access tokens for the StackCendra API. Not wired up yet.</p>
      <div className="space-y-2">
        {tokens.map((token) => (
          <div key={token.name} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <KeyRound size={16} className="text-gray-400" />
              <div>
                <p className="text-sm text-white">{token.name}</p>
                <p className="text-xs text-gray-500 font-mono">{token.masked}</p>
                <p className="text-xs text-gray-600 mt-0.5">Created {token.created} · Last used {token.lastUsed}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" disabled className="text-gray-500">
                <Copy size={14} />
              </Button>
              <Button size="sm" variant="ghost" disabled className="text-red-400/50">
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const AuditLogSection: React.FC<{ edition: Edition }> = ({ edition }) => {
  const events = [
    { actor: 'John Doe', action: 'Signed in via GitHub', time: '10 minutes ago' },
    { actor: 'John Doe', action: 'Connected the PostgreSQL integration', time: '2 hours ago' },
    { actor: 'John Doe', action: 'Created project "E-Commerce API"', time: '1 day ago' },
  ];

  return (
    <Card className="bg-black/20 border-white/10 p-6">
      <h2 className="text-lg font-semibold text-white mb-1">Audit log</h2>
      <p className="text-sm text-gray-400 mb-4">
        {edition === 'enterprise'
          ? 'Recent account and security-relevant events.'
          : 'A basic personal log. Full audit trail, retention controls, and export ship with Enterprise governance (Phase 13).'}
      </p>
      <div className="space-y-2">
        {events.map((event, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
            <div>
              <p className="text-sm text-white">{event.action}</p>
              <p className="text-xs text-gray-500">{event.actor}</p>
            </div>
            <span className="text-xs text-gray-500">{event.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const BillingSection: React.FC<EditionProps> = ({ edition, onEditionChange }) => {
  const editions: { id: Edition; icon: React.ElementType; title: string; description: string; points: string[] }[] = [
    {
      id: 'individual',
      icon: User,
      title: 'Individual',
      description: 'Free, fully local desktop app for one developer.',
      points: ['Runs entirely on your machine', 'No org, billing, or approvals', 'Bring your own AI provider key'],
    },
    {
      id: 'enterprise',
      icon: Building2,
      title: 'Enterprise',
      description: 'Team roles, policy, approvals, and audit trail.',
      points: ['Shared projects, roles, and approvals', 'Policy engine and audit trail', 'SSO and organization-hosted runners'],
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Plan & billing</h2>
        <p className="text-sm text-gray-400 mb-4">
          Both editions share the same local-only credential vault.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {editions.map((option) => {
            const Icon = option.icon;
            const active = edition === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onEditionChange(option.id)}
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
                <p className="text-xs text-gray-400 mt-1 mb-2">{option.description}</p>
                <ul className="space-y-1">
                  {option.points.map((point) => (
                    <li key={point} className="text-xs text-gray-500 flex items-start gap-1.5">
                      <span className="text-ai-success mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="bg-black/20 border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Current plan</h2>
        {edition === 'individual' ? (
          <p className="text-sm text-gray-400">Individual — free forever. No payment method on file.</p>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Enterprise — 12 seats · pricing shown at checkout.</p>
            <Button variant="outline" disabled className="border-white/10 text-gray-500">
              Manage billing
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

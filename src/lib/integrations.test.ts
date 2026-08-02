import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  fetchGithubWorkflowRuns,
  fetchGithubRunFailures,
  GITHUB_REPO_FULL_NAME_RE,
  fetchGitlabProjects,
  fetchGitlabPipelines,
  fetchGitlabPipelineFailures,
  GITLAB_PROJECT_PATH_RE,
  fetchGithubRepoOverview,
  fetchGitlabRepoOverview,
  fetchCreateGithubIssue,
  fetchGitlabIssues,
  fetchAddGithubIssueComment,
  fetchCloseGithubIssue,
  fetchCreateGitlabIssue,
  fetchAddGitlabIssueComment,
  fetchCloseGitlabIssue,
} from './integrations';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchGithubWorkflowRuns', () => {
  it('maps the GitHub API response into camelCase workflow runs', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        workflow_runs: [
          {
            id: 42,
            name: 'CI',
            display_title: 'Fix flaky test',
            status: 'completed',
            conclusion: 'success',
            head_branch: 'main',
            head_sha: 'abc1234',
            event: 'push',
            actor: { login: 'octocat' },
            run_number: 7,
            html_url: 'https://github.com/octocat/hello-world/actions/runs/42',
            created_at: '2026-07-30T10:00:00Z',
            updated_at: '2026-07-30T10:05:00Z',
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const runs = await fetchGithubWorkflowRuns('token123', 'octocat/hello-world');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/repos/octocat/hello-world/actions/runs?per_page=15',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token123' }) })
    );
    expect(runs).toEqual([
      {
        id: 42,
        name: 'CI',
        displayTitle: 'Fix flaky test',
        status: 'completed',
        conclusion: 'success',
        headBranch: 'main',
        headSha: 'abc1234',
        event: 'push',
        actorLogin: 'octocat',
        runNumber: 7,
        htmlUrl: 'https://github.com/octocat/hello-world/actions/runs/42',
        createdAt: '2026-07-30T10:00:00Z',
        updatedAt: '2026-07-30T10:05:00Z',
      },
    ]);
  });

  it('throws when the GitHub API responds with a non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(fetchGithubWorkflowRuns('token123', 'octocat/hello-world')).rejects.toThrow(/404/);
  });
});

describe('fetchGithubRunFailures', () => {
  it('returns only failed jobs with their failing step name', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        jobs: [
          {
            name: 'build',
            conclusion: 'success',
            steps: [{ name: 'Install deps', conclusion: 'success' }],
          },
          {
            name: 'test',
            conclusion: 'failure',
            steps: [
              { name: 'Install deps', conclusion: 'success' },
              { name: 'Run tests', conclusion: 'failure' },
            ],
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const failures = await fetchGithubRunFailures('token123', 'octocat/hello-world', 42);

    expect(failures).toEqual([{ jobName: 'test', stepName: 'Run tests', conclusion: 'failure' }]);
  });

  it('reports a null step name when no individual step is marked as failed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ jobs: [{ name: 'deploy', conclusion: 'failure', steps: [] }] }),
      })
    );

    const failures = await fetchGithubRunFailures('token123', 'octocat/hello-world', 42);
    expect(failures).toEqual([{ jobName: 'deploy', stepName: null, conclusion: 'failure' }]);
  });
});

describe('GITHUB_REPO_FULL_NAME_RE', () => {
  it('accepts well-formed owner/repo slugs', () => {
    expect(GITHUB_REPO_FULL_NAME_RE.test('octocat/hello-world')).toBe(true);
    expect(GITHUB_REPO_FULL_NAME_RE.test('my-org_1/repo.name')).toBe(true);
  });

  it('rejects anything that is not a single owner/repo pair', () => {
    expect(GITHUB_REPO_FULL_NAME_RE.test('../../etc/passwd')).toBe(false);
    expect(GITHUB_REPO_FULL_NAME_RE.test('octocat/hello/world')).toBe(false);
    expect(GITHUB_REPO_FULL_NAME_RE.test('no-slash-here')).toBe(false);
    expect(GITHUB_REPO_FULL_NAME_RE.test('octocat/hello world')).toBe(false);
  });

  it('rejects a dot-only segment even when the slash count matches (e.g. "../..")', () => {
    expect(GITHUB_REPO_FULL_NAME_RE.test('../..')).toBe(false);
  });
});

describe('fetchGitlabProjects', () => {
  it('maps the GitLab API response into camelCase projects', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          path_with_namespace: 'acme-corp/analytics-dashboard',
          visibility: 'private',
          last_activity_at: '2026-07-30T10:00:00Z',
          default_branch: 'main',
        },
        {
          path_with_namespace: 'acme-corp/public-docs',
          visibility: 'public',
          last_activity_at: '2026-07-29T10:00:00Z',
          default_branch: null,
        },
      ],
    });
    vi.stubGlobal('fetch', fetchMock);

    const projects = await fetchGitlabProjects('token123');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://gitlab.com/api/v4/projects?membership=true&order_by=updated_at&per_page=25',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token123' }) })
    );
    expect(projects).toEqual([
      { fullName: 'acme-corp/analytics-dashboard', private: true, updatedAt: '2026-07-30T10:00:00Z', defaultBranch: 'main' },
      { fullName: 'acme-corp/public-docs', private: false, updatedAt: '2026-07-29T10:00:00Z', defaultBranch: 'main' },
    ]);
  });

  it('throws when the GitLab API responds with a non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    await expect(fetchGitlabProjects('token123')).rejects.toThrow(/401/);
  });
});

describe('fetchGitlabPipelines', () => {
  it('maps GitLab pipeline statuses onto the shared {status, conclusion} shape', async () => {
    const makePipeline = (overrides: Partial<Record<string, unknown>>) => ({
      id: 1,
      iid: 10,
      status: 'success',
      ref: 'main',
      sha: 'abcdef1234567',
      source: 'push',
      user: { username: 'octocat' },
      web_url: 'https://gitlab.com/acme-corp/demo/-/pipelines/1',
      created_at: '2026-07-30T10:00:00Z',
      updated_at: '2026-07-30T10:05:00Z',
      ...overrides,
    });

    const cases: [string, { status: string; conclusion: string | null }][] = [
      ['pending', { status: 'queued', conclusion: null }],
      ['running', { status: 'in_progress', conclusion: null }],
      ['success', { status: 'completed', conclusion: 'success' }],
      ['failed', { status: 'completed', conclusion: 'failure' }],
      ['canceled', { status: 'completed', conclusion: 'cancelled' }],
      ['skipped', { status: 'completed', conclusion: 'skipped' }],
    ];

    for (const [gitlabStatus, expected] of cases) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [makePipeline({ status: gitlabStatus })] }));
      const runs = await fetchGitlabPipelines('token123', 'acme-corp/demo');
      expect(runs[0].status).toBe(expected.status);
      expect(runs[0].conclusion).toBe(expected.conclusion);
      vi.unstubAllGlobals();
    }
  });

  it('maps the rest of the pipeline fields and URL-encodes the project path', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 1,
          iid: 10,
          status: 'success',
          ref: 'main',
          sha: 'abcdef1234567',
          source: 'push',
          user: { username: 'octocat' },
          web_url: 'https://gitlab.com/acme-corp/demo/-/pipelines/1',
          created_at: '2026-07-30T10:00:00Z',
          updated_at: '2026-07-30T10:05:00Z',
        },
      ],
    });
    vi.stubGlobal('fetch', fetchMock);

    const runs = await fetchGitlabPipelines('token123', 'acme-corp/demo');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://gitlab.com/api/v4/projects/acme-corp%2Fdemo/pipelines?per_page=15&order_by=updated_at',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token123' }) })
    );
    expect(runs).toEqual([
      {
        id: 1,
        name: 'Pipeline #10',
        displayTitle: 'main (push)',
        status: 'completed',
        conclusion: 'success',
        headBranch: 'main',
        headSha: 'abcdef1',
        event: 'push',
        actorLogin: 'octocat',
        runNumber: 10,
        htmlUrl: 'https://gitlab.com/acme-corp/demo/-/pipelines/1',
        createdAt: '2026-07-30T10:00:00Z',
        updatedAt: '2026-07-30T10:05:00Z',
      },
    ]);
  });
});

describe('fetchGitlabPipelineFailures', () => {
  it('returns only failed jobs, using the stage as the step name and failure_reason as the conclusion', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { name: 'build', stage: 'build', status: 'success' },
        { name: 'test', stage: 'test', status: 'failed', failure_reason: 'script_failure' },
      ],
    });
    vi.stubGlobal('fetch', fetchMock);

    const failures = await fetchGitlabPipelineFailures('token123', 'acme-corp/demo', 1);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://gitlab.com/api/v4/projects/acme-corp%2Fdemo/pipelines/1/jobs?per_page=100',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token123' }) })
    );
    expect(failures).toEqual([{ jobName: 'test', stepName: 'test', conclusion: 'script_failure' }]);
  });
});

describe('fetchGithubRepoOverview', () => {
  it('bundles branches, commits, and pull requests into one normalized object', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/branches')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ name: 'main', commit: { sha: 'abc1234567' }, protected: true }],
        });
      }
      if (url.includes('/commits')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              sha: 'def5678',
              commit: { message: 'Fix bug\n\nDetails', author: { name: 'Jane Doe', date: '2026-07-30T10:00:00Z' } },
              author: { login: 'janedoe' },
              html_url: 'https://github.com/octocat/hello-world/commit/def5678',
            },
          ],
        });
      }
      if (url.includes('/pulls')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              number: 5,
              title: 'Add feature',
              user: { login: 'octocat' },
              html_url: 'https://github.com/octocat/hello-world/pull/5',
              head: { ref: 'feature/x' },
              base: { ref: 'main' },
              created_at: '2026-07-29T10:00:00Z',
            },
          ],
        });
      }
      throw new Error('unexpected url: ' + url);
    });
    vi.stubGlobal('fetch', fetchMock);

    const overview = await fetchGithubRepoOverview('token123', 'octocat/hello-world');

    expect(overview.branches).toEqual([{ name: 'main', sha: 'abc1234567', protected: true }]);
    expect(overview.commits).toEqual([
      {
        sha: 'def5678',
        message: 'Fix bug\n\nDetails',
        authorLogin: 'janedoe',
        authorName: 'Jane Doe',
        date: '2026-07-30T10:00:00Z',
        htmlUrl: 'https://github.com/octocat/hello-world/commit/def5678',
      },
    ]);
    expect(overview.pullRequests).toEqual([
      {
        number: 5,
        title: 'Add feature',
        authorLogin: 'octocat',
        htmlUrl: 'https://github.com/octocat/hello-world/pull/5',
        headRef: 'feature/x',
        baseRef: 'main',
        createdAt: '2026-07-29T10:00:00Z',
      },
    ]);
  });

  it('throws when any of the three underlying calls fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.includes('/branches')) return Promise.resolve({ ok: false, status: 404 });
        return Promise.resolve({ ok: true, json: async () => [] });
      })
    );
    await expect(fetchGithubRepoOverview('token123', 'octocat/hello-world')).rejects.toThrow(/404/);
  });
});

describe('fetchGitlabRepoOverview', () => {
  it('bundles branches, commits, and merge requests into one normalized object', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/repository/branches')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ name: 'main', commit: { id: 'abc1234567' }, protected: true }],
        });
      }
      if (url.includes('/repository/commits')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              id: 'def5678',
              title: 'Fix bug',
              author_name: 'Jane Doe',
              authored_date: '2026-07-30T10:00:00Z',
              web_url: 'https://gitlab.com/acme-corp/demo/-/commit/def5678',
            },
          ],
        });
      }
      if (url.includes('/merge_requests')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              iid: 5,
              title: 'Add feature',
              author: { username: 'octocat' },
              web_url: 'https://gitlab.com/acme-corp/demo/-/merge_requests/5',
              source_branch: 'feature/x',
              target_branch: 'main',
              created_at: '2026-07-29T10:00:00Z',
            },
          ],
        });
      }
      throw new Error('unexpected url: ' + url);
    });
    vi.stubGlobal('fetch', fetchMock);

    const overview = await fetchGitlabRepoOverview('token123', 'acme-corp/demo');

    expect(overview.branches).toEqual([{ name: 'main', sha: 'abc1234567', protected: true }]);
    expect(overview.commits).toEqual([
      {
        sha: 'def5678',
        message: 'Fix bug',
        authorName: 'Jane Doe',
        date: '2026-07-30T10:00:00Z',
        htmlUrl: 'https://gitlab.com/acme-corp/demo/-/commit/def5678',
      },
    ]);
    expect(overview.mergeRequests).toEqual([
      {
        iid: 5,
        title: 'Add feature',
        authorLogin: 'octocat',
        htmlUrl: 'https://gitlab.com/acme-corp/demo/-/merge_requests/5',
        sourceBranch: 'feature/x',
        targetBranch: 'main',
        createdAt: '2026-07-29T10:00:00Z',
      },
    ]);
  });
});

describe('fetchCreateGithubIssue', () => {
  it('posts to the issues endpoint and maps the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ number: 12, title: 'Bug', html_url: 'https://github.com/octocat/hello-world/issues/12' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const issue = await fetchCreateGithubIssue('token123', 'octocat/hello-world', { title: 'Bug', body: 'Details' });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/repos/octocat/hello-world/issues',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Bug', body: 'Details' }),
      })
    );
    expect(issue).toEqual({ number: 12, title: 'Bug', htmlUrl: 'https://github.com/octocat/hello-world/issues/12' });
  });

  it('throws when GitHub responds with a non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 422 }));
    await expect(fetchCreateGithubIssue('token123', 'octocat/hello-world', { title: 'x' })).rejects.toThrow(/422/);
  });
});

describe('fetchGitlabIssues', () => {
  it('maps GitLab issues into camelCase', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          iid: 3,
          title: 'Bug',
          state: 'opened',
          web_url: 'https://gitlab.com/acme-corp/demo/-/issues/3',
          author: { username: 'octocat' },
          created_at: '2026-07-30T10:00:00Z',
        },
      ],
    });
    vi.stubGlobal('fetch', fetchMock);

    const issues = await fetchGitlabIssues('token123', 'acme-corp/demo');

    expect(issues).toEqual([
      {
        iid: 3,
        title: 'Bug',
        state: 'opened',
        htmlUrl: 'https://gitlab.com/acme-corp/demo/-/issues/3',
        authorLogin: 'octocat',
        createdAt: '2026-07-30T10:00:00Z',
      },
    ]);
  });
});

describe('fetchAddGithubIssueComment', () => {
  it('posts the comment body to the issue comments endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await fetchAddGithubIssueComment('token123', 'octocat/hello-world', 2, 'Closing this out.');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/repos/octocat/hello-world/issues/2/comments',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ body: 'Closing this out.' }),
      })
    );
  });

  it('throws when GitHub responds with a non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(fetchAddGithubIssueComment('token123', 'octocat/hello-world', 2, 'x')).rejects.toThrow(/404/);
  });
});

describe('fetchCloseGithubIssue', () => {
  it('PATCHes the issue with state closed', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await fetchCloseGithubIssue('token123', 'octocat/hello-world', 2);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/repos/octocat/hello-world/issues/2',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ state: 'closed' }),
      })
    );
  });

  it('throws when GitHub responds with a non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(fetchCloseGithubIssue('token123', 'octocat/hello-world', 2)).rejects.toThrow(/404/);
  });
});

describe('fetchCreateGitlabIssue', () => {
  it('posts to the project issues endpoint and maps the response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ iid: 4, title: 'Bug', web_url: 'https://gitlab.com/acme-corp/demo/-/issues/4' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const issue = await fetchCreateGitlabIssue('token123', 'acme-corp/demo', { title: 'Bug', description: 'Details' });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://gitlab.com/api/v4/projects/acme-corp%2Fdemo/issues',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Bug', description: 'Details' }),
      })
    );
    expect(issue).toEqual({ iid: 4, title: 'Bug', htmlUrl: 'https://gitlab.com/acme-corp/demo/-/issues/4' });
  });

  it('throws when GitLab responds with a non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    await expect(fetchCreateGitlabIssue('token123', 'acme-corp/demo', { title: 'x' })).rejects.toThrow(/403/);
  });
});

describe('fetchAddGitlabIssueComment', () => {
  it('posts the comment body to the issue notes endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await fetchAddGitlabIssueComment('token123', 'acme-corp/demo', 4, 'Closing this out.');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://gitlab.com/api/v4/projects/acme-corp%2Fdemo/issues/4/notes',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ body: 'Closing this out.' }),
      })
    );
  });
});

describe('fetchCloseGitlabIssue', () => {
  it('PUTs the issue with a close state event', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await fetchCloseGitlabIssue('token123', 'acme-corp/demo', 4);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://gitlab.com/api/v4/projects/acme-corp%2Fdemo/issues/4',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ state_event: 'close' }),
      })
    );
  });

  it('throws when GitLab responds with a non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(fetchCloseGitlabIssue('token123', 'acme-corp/demo', 4)).rejects.toThrow(/404/);
  });
});

describe('GITLAB_PROJECT_PATH_RE', () => {
  it('accepts single- and multi-level project paths (GitLab allows nested groups)', () => {
    expect(GITLAB_PROJECT_PATH_RE.test('acme-corp/demo')).toBe(true);
    expect(GITLAB_PROJECT_PATH_RE.test('acme-corp/platform/demo')).toBe(true);
  });

  it('rejects anything without at least one slash or with unsafe characters', () => {
    expect(GITLAB_PROJECT_PATH_RE.test('../../etc/passwd')).toBe(false);
    expect(GITLAB_PROJECT_PATH_RE.test('no-slash-here')).toBe(false);
    expect(GITLAB_PROJECT_PATH_RE.test('acme-corp/demo project')).toBe(false);
  });
});

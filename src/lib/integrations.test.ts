import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchGithubWorkflowRuns, fetchGithubRunFailures, GITHUB_REPO_FULL_NAME_RE } from './integrations';

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
});

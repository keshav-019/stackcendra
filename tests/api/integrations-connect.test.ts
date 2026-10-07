import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET as githubConnect } from '@/../app/api/integrations/github/connect/route';
import { GET as gitlabConnect } from '@/../app/api/integrations/gitlab/connect/route';
import { createUser, signIn } from './helpers';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe.each([
  ['github', githubConnect, 'GITHUB_INTEGRATION_CLIENT_ID'],
  ['gitlab', gitlabConnect, 'GITLAB_INTEGRATION_CLIENT_ID'],
] as const)('GET /api/integrations/%s/connect without an OAuth app', (provider, connect, envName) => {
  it('sends the user back to the page they came from with a not_configured error', async () => {
    vi.stubEnv(envName, '');
    signIn(await createUser());
    const res = await connect(
      new Request(`http://localhost/api/integrations/${provider}/connect?returnTo=/projects/new`)
    );
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(`http://localhost/projects/new?${provider}_error=not_configured`);
  });

  it('falls back to /settings for an unsafe returnTo', async () => {
    vi.stubEnv(envName, '');
    signIn(await createUser());
    const res = await connect(
      new Request(`http://localhost/api/integrations/${provider}/connect?returnTo=//evil.example`)
    );
    expect(res.headers.get('location')).toBe(`http://localhost/settings?${provider}_error=not_configured`);
  });
});

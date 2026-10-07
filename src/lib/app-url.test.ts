import { afterEach, describe, expect, it, vi } from 'vitest';
import { appUrl } from '@/lib/app-url';

afterEach(() => {
  vi.unstubAllEnvs();
});

// What the standalone server hands a route handler on the VM.
const boundRequest = (headers: Record<string, string> = {}) =>
  new Request('http://0.0.0.0:8080/api/integrations/github/connect', { headers });

describe('appUrl', () => {
  it('uses the configured public origin over the bind address', () => {
    vi.stubEnv('AUTH_URL', 'http://vanisher.projectyourown.com:8080');
    expect(appUrl('/login', boundRequest({ host: 'ignored.example' })).toString()).toBe(
      'http://vanisher.projectyourown.com:8080/login'
    );
  });

  it('falls back to forwarded headers from a proxy', () => {
    vi.stubEnv('AUTH_URL', '');
    const url = appUrl('/settings?x=1', boundRequest({ 'x-forwarded-host': 'stackcendra.com', 'x-forwarded-proto': 'https' }));
    expect(url.toString()).toBe('https://stackcendra.com/settings?x=1');
  });

  it('falls back to the Host header', () => {
    vi.stubEnv('AUTH_URL', '');
    expect(appUrl('/login', boundRequest({ host: 'localhost:3100' })).toString()).toBe('http://localhost:3100/login');
  });

  it('uses request.url when nothing else is known', () => {
    vi.stubEnv('AUTH_URL', '');
    expect(appUrl('/login', boundRequest()).toString()).toBe('http://0.0.0.0:8080/login');
  });
});

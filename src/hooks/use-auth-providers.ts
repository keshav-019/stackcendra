import { useEffect, useState } from 'react';

export type OAuthProviderId = 'github' | 'google';

/**
 * Which sign-in providers this server has credentials for (Auth.js's
 * /api/auth/providers lists only the registered ones; see src/lib/auth.ts).
 * null until known; if the lookup fails, every provider is assumed
 * available rather than blocking sign-in.
 */
export function useAuthProviders(): Set<OAuthProviderId> | null {
  const [providers, setProviders] = useState<Set<OAuthProviderId> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/providers')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: Record<string, unknown> | null) => {
        if (!cancelled) setProviders(new Set(Object.keys(data ?? {}) as OAuthProviderId[]));
      })
      .catch(() => {
        if (!cancelled) setProviders(new Set(['github', 'google']));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return providers;
}

export const NO_PROVIDERS_MESSAGE =
  "Sign-in isn't set up on this server yet: no GitHub or Google OAuth app is configured.";

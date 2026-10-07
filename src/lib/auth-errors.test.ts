import { describe, expect, it } from 'vitest';
import { authErrorMessage, integrationErrorMessage } from '@/lib/auth-errors';

describe('authErrorMessage', () => {
  it('returns nothing without an error code', () => {
    expect(authErrorMessage(null)).toBeNull();
    expect(authErrorMessage('')).toBeNull();
  });

  it('explains known Auth.js codes', () => {
    expect(authErrorMessage('Configuration')).toMatch(/isn't set up on this server/);
    expect(authErrorMessage('OAuthAccountNotLinked')).toMatch(/provider you signed up with/);
  });

  it('falls back to a generic message for unknown codes, never echoing them', () => {
    expect(authErrorMessage('<script>')).toBe('Sign-in failed. Please try again.');
  });
});

describe('integrationErrorMessage', () => {
  it('explains a provider that is not configured', () => {
    expect(integrationErrorMessage('GitHub', 'not_configured')).toBe(
      "GitHub isn't set up on this server yet (no OAuth app configured)."
    );
  });

  it('includes unknown codes for debugging', () => {
    expect(integrationErrorMessage('GitLab', 'token_exchange_failed')).toBe(
      'GitLab connection failed (token_exchange_failed). Please try again.'
    );
  });
});

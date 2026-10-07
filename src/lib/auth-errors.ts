// Human-readable messages for the `?error=` codes Auth.js appends when it
// sends a failed sign-in back to /login (pages.error in auth.config.ts).
// Codes: https://authjs.dev/reference/core/errors
const MESSAGES: Record<string, string> = {
  Configuration: "That sign-in provider isn't set up on this server yet. Try the other one, or ask the administrator.",
  AccessDenied: 'Sign-in was cancelled or access was denied.',
  OAuthAccountNotLinked:
    'This email already belongs to an account that signs in another way. Use the provider you signed up with.',
  Verification: 'That sign-in link has expired or was already used.',
};

export const EMAIL_PASSWORD_UNAVAILABLE =
  "Email and password sign-in isn't available yet. Continue with GitHub or Google instead.";

export function authErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  return MESSAGES[code] ?? 'Sign-in failed. Please try again.';
}

// Same for the `?{provider}_error=` codes the integration connect flow uses.
export function integrationErrorMessage(label: string, code: string): string {
  switch (code) {
    case 'not_configured':
      return `${label} isn't set up on this server yet (no OAuth app configured).`;
    case 'access_denied':
      return `${label} authorization was cancelled.`;
    case 'invalid_state':
      return `${label} connection expired or was tampered with. Please try again.`;
    default:
      return `${label} connection failed (${code}). Please try again.`;
  }
}

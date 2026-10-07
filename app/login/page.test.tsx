import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page';

afterEach(() => {
  window.history.replaceState(null, '', '/');
  // Only fetch is restored: vitest.setup.ts's global stubs must stay.
  vi.restoreAllMocks();
});

function serveProviders(providers: Record<string, unknown>) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify(providers), { status: 200 }));
}

describe('LoginPage', () => {
  it('shows no notice on a normal visit', () => {
    window.history.replaceState(null, '', '/login');
    render(<LoginPage />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('explains a failed sign-in that Auth.js sent back with ?error=', async () => {
    window.history.replaceState(null, '', '/login?error=Configuration');
    render(<LoginPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent("That sign-in provider isn't set up on this server yet");
  });

  it('explains that email/password sign-in is unavailable instead of looping back to /login', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByRole('alert')).toHaveTextContent("Email and password sign-in isn't available yet");
  });

  it('disables a provider the server has no credentials for', async () => {
    serveProviders({ github: { id: 'github' } });
    render(<LoginPage />);
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Google' })).toBeDisabled());
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('says so when no sign-in provider is configured at all', async () => {
    serveProviders({});
    render(<LoginPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent("Sign-in isn't set up on this server yet");
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Google' })).toBeDisabled();
  });

  it('keeps both providers usable if the provider list cannot be loaded', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('nope', { status: 500 }));
    render(<LoginPage />);
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByRole('button', { name: 'GitHub' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Google' })).toBeEnabled();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from './page';

describe('SignupPage', () => {
  it('defaults to the Individual edition with no organization field', () => {
    render(<SignupPage />);
    expect(screen.queryByLabelText('Organization name')).not.toBeInTheDocument();
  });

  it('reveals the organization field when Enterprise is selected', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.click(screen.getByText('Enterprise'));

    expect(screen.getByLabelText('Organization name')).toBeInTheDocument();
  });

  it('hides the organization field again when switching back to Individual', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    await user.click(screen.getByText('Enterprise'));
    expect(screen.getByLabelText('Organization name')).toBeInTheDocument();

    await user.click(screen.getByText('Individual'));
    expect(screen.queryByLabelText('Organization name')).not.toBeInTheDocument();
  });

  it('renders both real OAuth sign-up buttons', () => {
    render(<SignupPage />);
    expect(screen.getByRole('button', { name: /GitHub/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google/i })).toBeInTheDocument();
  });

  it('explains that email/password sign-up is unavailable instead of silently doing nothing', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByRole('alert')).toHaveTextContent("Email and password sign-in isn't available yet");
  });
});

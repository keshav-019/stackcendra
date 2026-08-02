import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoCallInterface } from './VideoCallInterface';

describe('VideoCallInterface', () => {
  it('shows the "no call in progress" empty state by default', () => {
    render(<VideoCallInterface isManagerMode={false} />);
    expect(screen.getByText('No call in progress')).toBeInTheDocument();
    expect(screen.getByText('Start a call with your team')).toBeInTheDocument();
    expect(screen.queryByText('Team Debug Session')).not.toBeInTheDocument();
  });

  it('reveals the live call UI when the state toggle is switched on', async () => {
    const user = userEvent.setup();
    render(<VideoCallInterface isManagerMode={false} />);

    await user.click(screen.getByRole('switch'));

    expect(screen.getByText('Team Debug Session is live')).toBeInTheDocument();
    expect(screen.getByText('Team Debug Session')).toBeInTheDocument();
    expect(screen.queryByText('Start a call with your team')).not.toBeInTheDocument();
  });

  it('reveals the live call UI via the "Start Instant Call" button too', async () => {
    const user = userEvent.setup();
    render(<VideoCallInterface isManagerMode={false} />);

    await user.click(screen.getByRole('button', { name: /Start Instant Call/i }));

    expect(screen.getByText('Team Debug Session is live')).toBeInTheDocument();
  });

  it('ending the call returns to the empty state', async () => {
    const user = userEvent.setup();
    render(<VideoCallInterface isManagerMode={false} />);

    await user.click(screen.getByRole('switch'));
    expect(screen.getByText('Team Debug Session')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /End Call/i }));

    expect(screen.getByText('No call in progress')).toBeInTheDocument();
  });

  it('shows manager-only meeting controls only in manager mode', () => {
    const { rerender } = render(<VideoCallInterface isManagerMode={false} />);
    expect(screen.queryByText(/Manager: Meeting Controls/i)).not.toBeInTheDocument();

    rerender(<VideoCallInterface isManagerMode={true} />);
    expect(screen.getByText(/Manager: Meeting Controls/i)).toBeInTheDocument();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import type { Project } from '@/lib/project-schema';

const push = vi.fn();
const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }));

const project: Project = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Payments API',
  description: 'Checkout and refunds',
  localPath: '/code/payments',
  provider: 'none',
  repoFullName: null,
  defaultBranch: null,
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-01T12:00:00.000Z',
};

const fetchMock = vi.fn();
const realFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = fetchMock;
});

afterEach(() => {
  fetchMock.mockReset();
  push.mockReset();
  refresh.mockReset();
  globalThis.fetch = realFetch;
});

describe('ProjectDetail', () => {
  it('shows the project and explains local-only projects', () => {
    render(<ProjectDetail project={project} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Payments API' })).toBeInTheDocument();
    expect(screen.getByText('/code/payments')).toBeInTheDocument();
    expect(screen.getByText('Oct 1, 2026')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Local-only project' })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('saves edits through PATCH and shows the new name', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ project: { ...project, name: 'Billing API' } }), { status: 200 })
    );
    render(<ProjectDetail project={project} />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const nameInput = screen.getByLabelText('Project name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Billing API');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Billing API' })).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/projects/${project.id}`,
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ name: 'Billing API', description: project.description, localPath: project.localPath }) })
    );
    expect(refresh).toHaveBeenCalled();
  });

  it('shows the server error and keeps the dialog open when saving fails', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: 'You already have a project named "Taken"' }), { status: 409 })
    );
    render(<ProjectDetail project={project} />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByLabelText('Project name'));
    await user.type(screen.getByLabelText('Project name'), 'Taken');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('You already have a project named "Taken"');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Payments API', hidden: true })).toBeInTheDocument();
  });

  it('disables saving when the name is blank', async () => {
    const user = userEvent.setup();
    render(<ProjectDetail project={project} />);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByLabelText('Project name'));
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('deletes only after confirmation, then returns to the list', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    render(<ProjectDetail project={project} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete Payments API?');

    await user.click(screen.getByRole('button', { name: 'Delete project' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/projects'));
    expect(fetchMock).toHaveBeenCalledWith(`/api/projects/${project.id}`, { method: 'DELETE' });
  });

  it('cancelling the delete confirmation does nothing', async () => {
    const user = userEvent.setup();
    render(<ProjectDetail project={project} />);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});

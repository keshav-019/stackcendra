import { describe, expect, it } from 'vitest';
import { GET as listRoute, POST as createRoute } from '@/../app/api/projects/route';
import { DELETE as deleteRoute, GET as getRoute, PATCH as patchRoute } from '@/../app/api/projects/[id]/route';
import { pool } from '@/lib/db';
import { connectProvider, createUser, jsonRequest, routeContext, signIn, signOut } from './helpers';

const localProject = { name: 'Payments API', localPath: '/code/payments', description: 'Checkout and refunds' };

async function create(body: unknown) {
  return createRoute(jsonRequest('/api/projects', 'POST', body));
}

async function createOk(body: unknown = localProject) {
  const res = await create(body);
  expect(res.status).toBe(201);
  return (await res.json()).project;
}

const MISSING_ID = '00000000-0000-4000-8000-00000000abcd';

describe('GET /api/projects', () => {
  it('rejects unauthenticated requests', async () => {
    signOut();
    const res = await listRoute();
    expect(res.status).toBe(401);
  });

  it('returns an empty list for a new user', async () => {
    signIn(await createUser());
    const res = await listRoute();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ projects: [] });
  });

  it("lists only the signed-in user's projects, newest first", async () => {
    const alice = await createUser('Alice');
    const bob = await createUser('Bob');
    signIn(alice);
    await createOk({ ...localProject, name: 'First' });
    await createOk({ ...localProject, name: 'Second' });
    signIn(bob);
    await createOk({ ...localProject, name: 'Bob project' });

    signIn(alice);
    const { projects } = await (await listRoute()).json();
    expect(projects.map((p: { name: string }) => p.name)).toEqual(['Second', 'First']);
  });
});

describe('POST /api/projects', () => {
  it('rejects unauthenticated requests without writing anything', async () => {
    signOut();
    const res = await create(localProject);
    expect(res.status).toBe(401);
    const { rows } = await pool.query('select count(*)::int as n from projects');
    expect(rows[0].n).toBe(0);
  });

  it('creates a local-only project with trimmed fields and defaults', async () => {
    signIn(await createUser());
    const project = await createOk({ name: '  Payments API  ', localPath: ' /code/payments ' });
    expect(project).toMatchObject({
      name: 'Payments API',
      localPath: '/code/payments',
      description: '',
      provider: 'none',
      repoFullName: null,
      defaultBranch: null,
    });
    expect(project.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(Date.parse(project.createdAt)).not.toBeNaN();
  });

  it.each([
    ['malformed JSON', '{not json', 'Name is required'],
    ['a missing name', { localPath: '/x' }, 'Name is required'],
    ['a blank name', { name: '   ', localPath: '/x' }, 'Name is required'],
    ['a too-long name', { name: 'x'.repeat(101), localPath: '/x' }, 'Name must be at most 100 characters'],
    ['a missing local path', { name: 'A' }, 'Local path is required'],
    ['an unknown field', { ...localProject, owner: 'someone-else' }, 'Unrecognized key(s) in object: \'owner\''],
    ['an unknown provider', { ...localProject, provider: 'bitbucket' }, undefined],
    ['a repo on a local-only project', { ...localProject, repoFullName: 'a/b' }, 'A local-only project cannot have a repository'],
    ['a linked project without a repo', { ...localProject, provider: 'github' }, 'Choose a repository to link'],
    ['a malformed GitHub repo', { ...localProject, provider: 'github', repoFullName: 'a/b/c' }, 'Invalid repository name'],
    ['a malformed GitLab path', { ...localProject, provider: 'gitlab', repoFullName: 'no-namespace' }, 'Invalid repository name'],
  ])('rejects %s with 400', async (_label, body, message) => {
    signIn(await createUser());
    const res = await create(body);
    expect(res.status).toBe(400);
    const data = await res.json();
    if (message) expect(data.error).toBe(message);
    else expect(typeof data.error).toBe('string');
  });

  it('refuses to link a provider the user has not connected', async () => {
    signIn(await createUser());
    const res = await create({ ...localProject, provider: 'github', repoFullName: 'octocat/hello-world' });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Connect GitHub before linking a repository');
  });

  it('links a GitHub repository when GitHub is connected', async () => {
    const user = await createUser();
    await connectProvider(user, 'github');
    signIn(user);
    const project = await createOk({
      ...localProject,
      provider: 'github',
      repoFullName: 'octocat/hello-world',
      defaultBranch: 'main',
    });
    expect(project).toMatchObject({ provider: 'github', repoFullName: 'octocat/hello-world', defaultBranch: 'main' });
  });

  it('links a nested GitLab project path when GitLab is connected', async () => {
    const user = await createUser();
    await connectProvider(user, 'gitlab');
    signIn(user);
    const project = await createOk({ ...localProject, provider: 'gitlab', repoFullName: 'group/sub/project' });
    expect(project).toMatchObject({ provider: 'gitlab', repoFullName: 'group/sub/project', defaultBranch: null });
  });

  it('rejects a duplicate name for the same user, ignoring case', async () => {
    signIn(await createUser());
    await createOk({ ...localProject, name: 'Payments API' });
    const res = await create({ ...localProject, name: 'payments api' });
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe('You already have a project named "payments api"');
  });

  it('allows the same name for different users', async () => {
    signIn(await createUser());
    await createOk();
    signIn(await createUser());
    await createOk();
  });
});

describe('GET /api/projects/:id', () => {
  it('rejects unauthenticated requests', async () => {
    signOut();
    const res = await getRoute(jsonRequest(`/api/projects/${MISSING_ID}`, 'GET'), routeContext({ id: MISSING_ID }));
    expect(res.status).toBe(401);
  });

  it('rejects a malformed id', async () => {
    signIn(await createUser());
    const res = await getRoute(jsonRequest('/api/projects/nope', 'GET'), routeContext({ id: 'nope' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 for a missing project', async () => {
    signIn(await createUser());
    const res = await getRoute(jsonRequest(`/api/projects/${MISSING_ID}`, 'GET'), routeContext({ id: MISSING_ID }));
    expect(res.status).toBe(404);
  });

  it("returns 404 for another user's project, not 403", async () => {
    signIn(await createUser());
    const { id } = await createOk();
    signIn(await createUser());
    const res = await getRoute(jsonRequest(`/api/projects/${id}`, 'GET'), routeContext({ id }));
    expect(res.status).toBe(404);
  });

  it('returns the project', async () => {
    signIn(await createUser());
    const created = await createOk();
    const res = await getRoute(jsonRequest(`/api/projects/${created.id}`, 'GET'), routeContext({ id: created.id }));
    expect(res.status).toBe(200);
    expect((await res.json()).project).toEqual(created);
  });
});

describe('PATCH /api/projects/:id', () => {
  const patch = (id: string, body: unknown) =>
    patchRoute(jsonRequest(`/api/projects/${id}`, 'PATCH', body), routeContext({ id }));

  it('rejects unauthenticated requests', async () => {
    signOut();
    expect((await patch(MISSING_ID, { name: 'x' })).status).toBe(401);
  });

  it('updates only the given fields and bumps updatedAt', async () => {
    signIn(await createUser());
    const created = await createOk();
    const res = await patch(created.id, { name: 'Renamed', description: '  New text ' });
    expect(res.status).toBe(200);
    const { project } = await res.json();
    expect(project).toMatchObject({ name: 'Renamed', description: 'New text', localPath: created.localPath });
    expect(Date.parse(project.updatedAt)).toBeGreaterThanOrEqual(Date.parse(created.updatedAt));
  });

  it('allows clearing the description', async () => {
    signIn(await createUser());
    const created = await createOk();
    const { project } = await (await patch(created.id, { description: '' })).json();
    expect(project.description).toBe('');
  });

  it.each([
    ['an empty body', {}, 'Nothing to update'],
    ['a blank name', { name: ' ' }, 'Name is required'],
    ['a provider change', { provider: 'github' }, "Unrecognized key(s) in object: 'provider'"],
    ['a repo change', { repoFullName: 'a/b' }, "Unrecognized key(s) in object: 'repoFullName'"],
  ])('rejects %s with 400', async (_label, body, message) => {
    signIn(await createUser());
    const created = await createOk();
    const res = await patch(created.id, body);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe(message);
  });

  it('rejects renaming onto another of your projects', async () => {
    signIn(await createUser());
    await createOk({ ...localProject, name: 'Taken' });
    const other = await createOk({ ...localProject, name: 'Other' });
    const res = await patch(other.id, { name: 'TAKEN' });
    expect(res.status).toBe(409);
  });

  it("cannot modify another user's project", async () => {
    signIn(await createUser());
    const created = await createOk();
    signIn(await createUser());
    expect((await patch(created.id, { name: 'Hijacked' })).status).toBe(404);
    const { rows } = await pool.query('select name from projects where id = $1', [created.id]);
    expect(rows[0].name).toBe(localProject.name);
  });
});

describe('DELETE /api/projects/:id', () => {
  const remove = (id: string) => deleteRoute(jsonRequest(`/api/projects/${id}`, 'DELETE'), routeContext({ id }));

  it('rejects unauthenticated requests', async () => {
    signOut();
    expect((await remove(MISSING_ID)).status).toBe(401);
  });

  it('deletes the project, then reports it missing', async () => {
    signIn(await createUser());
    const created = await createOk();
    const res = await remove(created.id);
    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
    expect((await remove(created.id)).status).toBe(404);
  });

  it("cannot delete another user's project", async () => {
    signIn(await createUser());
    const created = await createOk();
    signIn(await createUser());
    expect((await remove(created.id)).status).toBe(404);
    const { rows } = await pool.query('select count(*)::int as n from projects where id = $1', [created.id]);
    expect(rows[0].n).toBe(1);
  });

  it("removes a user's projects when the user is deleted", async () => {
    const user = await createUser();
    signIn(user);
    await createOk();
    await pool.query('delete from users where id = $1', [user]);
    const { rows } = await pool.query('select count(*)::int as n from projects');
    expect(rows[0].n).toBe(0);
  });
});

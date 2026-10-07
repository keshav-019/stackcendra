import { describe, expect, it } from 'vitest';
import { createProjectSchema, firstIssue, updateProjectSchema } from '@/lib/project-schema';

const base = { name: 'Payments API', localPath: '/code/payments' };

describe('createProjectSchema', () => {
  it('fills defaults for a local-only project', () => {
    expect(createProjectSchema.parse(base)).toEqual({
      ...base,
      description: '',
      provider: 'none',
      repoFullName: null,
      defaultBranch: null,
    });
  });

  it('drops a default branch sent for a local-only project', () => {
    expect(createProjectSchema.parse({ ...base, defaultBranch: 'main' }).defaultBranch).toBeNull();
  });

  it('accepts a null repo for a local-only project (what the wizard sends)', () => {
    expect(createProjectSchema.safeParse({ ...base, repoFullName: null }).success).toBe(true);
  });

  it.each([
    ['github', 'octocat/hello-world', true],
    ['github', 'octocat/hello.world-2', true],
    ['github', 'octocat', false],
    ['github', 'a/b/c', false],
    ['github', '../etc', false],
    ['gitlab', 'group/project', true],
    ['gitlab', 'group/sub/sub2/project', true],
    ['gitlab', 'project', false],
    ['gitlab', 'group//project', false],
  ] as const)('%s repo %s valid=%s', (provider, repoFullName, valid) => {
    expect(createProjectSchema.safeParse({ ...base, provider, repoFullName }).success).toBe(valid);
  });

  it('caps the name at 100 characters after trimming', () => {
    expect(createProjectSchema.safeParse({ ...base, name: ` ${'x'.repeat(100)} ` }).success).toBe(true);
    expect(createProjectSchema.safeParse({ ...base, name: 'x'.repeat(101) }).success).toBe(false);
  });

  it('reports a readable first issue', () => {
    const result = createProjectSchema.safeParse({ localPath: '/x' });
    expect(result.success).toBe(false);
    if (!result.success) expect(firstIssue(result.error)).toBe('Name is required');
  });
});

describe('updateProjectSchema', () => {
  it('accepts a partial update', () => {
    expect(updateProjectSchema.parse({ description: ' hi ' })).toEqual({ description: 'hi' });
  });

  it('rejects an empty update', () => {
    expect(updateProjectSchema.safeParse({}).success).toBe(false);
  });

  it('does not allow changing the linked repository', () => {
    expect(updateProjectSchema.safeParse({ repoFullName: 'a/b' }).success).toBe(false);
  });
});

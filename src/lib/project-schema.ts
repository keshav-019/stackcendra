import { z } from 'zod';
import { GITHUB_REPO_FULL_NAME_RE, GITLAB_PROJECT_PATH_RE } from '@/lib/repo-names';

// Shapes and validation for projects, shared by the API routes and the
// client forms. No server-only imports here.

export const PROJECT_PROVIDERS = ['none', 'github', 'gitlab'] as const;
export type ProjectProvider = (typeof PROJECT_PROVIDERS)[number];

export interface Project {
  id: string;
  name: string;
  description: string;
  localPath: string;
  provider: ProjectProvider;
  repoFullName: string | null;
  defaultBranch: string | null;
  createdAt: string;
  updatedAt: string;
}

export const PROJECT_NAME_MAX = 100;

const name = z
  .string({ required_error: 'Name is required', invalid_type_error: 'Name must be text' })
  .trim()
  .min(1, 'Name is required')
  .max(PROJECT_NAME_MAX, `Name must be at most ${PROJECT_NAME_MAX} characters`);
const description = z.string().trim().max(2000, 'Description must be at most 2000 characters');
const localPath = z
  .string({ required_error: 'Local path is required', invalid_type_error: 'Local path must be text' })
  .trim()
  .min(1, 'Local path is required')
  .max(1000, 'Local path must be at most 1000 characters');

export const createProjectSchema = z
  .object({
    name,
    description: description.default(''),
    localPath,
    provider: z.enum(PROJECT_PROVIDERS).default('none'),
    repoFullName: z.string().trim().nullish(),
    defaultBranch: z.string().trim().min(1).max(255).nullish(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.provider === 'none') {
      if (value.repoFullName) {
        ctx.addIssue({ code: 'custom', path: ['repoFullName'], message: 'A local-only project cannot have a repository' });
      }
      return;
    }
    const pattern = value.provider === 'github' ? GITHUB_REPO_FULL_NAME_RE : GITLAB_PROJECT_PATH_RE;
    if (!value.repoFullName) {
      ctx.addIssue({ code: 'custom', path: ['repoFullName'], message: 'Choose a repository to link' });
    } else if (!pattern.test(value.repoFullName)) {
      ctx.addIssue({ code: 'custom', path: ['repoFullName'], message: 'Invalid repository name' });
    }
  })
  .transform((value) => ({
    ...value,
    repoFullName: value.provider === 'none' ? null : (value.repoFullName ?? null),
    defaultBranch: value.provider === 'none' ? null : (value.defaultBranch ?? null),
  }));

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// The linked repository is fixed at creation; only these fields can change.
export const updateProjectSchema = z
  .object({ name, description, localPath })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Nothing to update');

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/** First validation message, for a single-line API error. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid request';
}

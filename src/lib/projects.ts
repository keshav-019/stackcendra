import { pool } from '@/lib/db';
import type { CreateProjectInput, Project, ProjectProvider, UpdateProjectInput } from '@/lib/project-schema';

export class ProjectNameTakenError extends Error {
  constructor(name: string) {
    super(`You already have a project named "${name}"`);
    this.name = 'ProjectNameTakenError';
  }
}

interface ProjectRow {
  id: string;
  name: string;
  description: string;
  local_path: string;
  provider: ProjectProvider;
  repo_full_name: string | null;
  default_branch: string | null;
  created_at: Date;
  updated_at: Date;
}

const SELECT_COLUMNS =
  'id, name, description, local_path, provider, repo_full_name, default_branch, created_at, updated_at';

function mapRow(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    localPath: row.local_path,
    provider: row.provider,
    repoFullName: row.repo_full_name,
    defaultBranch: row.default_branch,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === '23505';
}

export async function listProjects(userId: string): Promise<Project[]> {
  const result = await pool.query<ProjectRow>(
    `select ${SELECT_COLUMNS} from projects where user_id = $1 order by created_at desc, id`,
    [userId]
  );
  return result.rows.map(mapRow);
}

/** Returns null both when the project doesn't exist and when it belongs to someone else. */
export async function getProject(userId: string, id: string): Promise<Project | null> {
  const result = await pool.query<ProjectRow>(
    `select ${SELECT_COLUMNS} from projects where user_id = $1 and id = $2`,
    [userId, id]
  );
  return result.rowCount === 0 ? null : mapRow(result.rows[0]);
}

export async function createProject(userId: string, input: CreateProjectInput): Promise<Project> {
  try {
    const result = await pool.query<ProjectRow>(
      `insert into projects (user_id, name, description, local_path, provider, repo_full_name, default_branch)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning ${SELECT_COLUMNS}`,
      [
        userId,
        input.name,
        input.description,
        input.localPath,
        input.provider,
        input.repoFullName,
        input.defaultBranch,
      ]
    );
    return mapRow(result.rows[0]);
  } catch (error) {
    if (isUniqueViolation(error)) throw new ProjectNameTakenError(input.name);
    throw error;
  }
}

export async function updateProject(userId: string, id: string, input: UpdateProjectInput): Promise<Project | null> {
  try {
    const result = await pool.query<ProjectRow>(
      `update projects set
         name = coalesce($3, name),
         description = coalesce($4, description),
         local_path = coalesce($5, local_path),
         updated_at = now()
       where user_id = $1 and id = $2
       returning ${SELECT_COLUMNS}`,
      [userId, id, input.name ?? null, input.description ?? null, input.localPath ?? null]
    );
    return result.rowCount === 0 ? null : mapRow(result.rows[0]);
  } catch (error) {
    if (isUniqueViolation(error) && input.name) throw new ProjectNameTakenError(input.name);
    throw error;
  }
}

/** Returns whether a project was deleted (false if missing or not the user's). */
export async function deleteProject(userId: string, id: string): Promise<boolean> {
  const result = await pool.query('delete from projects where user_id = $1 and id = $2', [userId, id]);
  return (result.rowCount ?? 0) > 0;
}

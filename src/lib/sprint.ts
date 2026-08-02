import { pool } from '@/lib/db';

export interface SprintItem {
  id: string;
  provider: string;
  repoFullName: string;
  issueNumber: number;
  issueHtmlUrl: string;
  title: string;
  columnStatus: string;
  storyPoints: number | null;
  closed: boolean;
  createdAt: string;
}

export const SPRINT_COLUMNS = ['todo', 'inprogress', 'done'] as const;

interface SprintItemRow {
  id: string;
  provider: string;
  repo_full_name: string;
  issue_number: number;
  issue_html_url: string;
  title: string;
  column_status: string;
  story_points: number | null;
  closed: boolean;
  created_at: string;
}

function mapRow(row: SprintItemRow): SprintItem {
  return {
    id: row.id,
    provider: row.provider,
    repoFullName: row.repo_full_name,
    issueNumber: row.issue_number,
    issueHtmlUrl: row.issue_html_url,
    title: row.title,
    columnStatus: row.column_status,
    storyPoints: row.story_points,
    closed: row.closed,
    createdAt: row.created_at,
  };
}

const SELECT_COLUMNS =
  'id, provider, repo_full_name, issue_number, issue_html_url, title, column_status, story_points, closed, created_at';

export async function getSprintItem(userId: string, id: string): Promise<SprintItem | null> {
  const result = await pool.query(
    `select ${SELECT_COLUMNS} from sprint_items where id = $1 and user_id = $2`,
    [id, userId]
  );
  if (result.rowCount === 0) return null;
  return mapRow(result.rows[0]);
}

export async function markSprintItemClosed(userId: string, id: string): Promise<SprintItem | null> {
  const result = await pool.query(
    `update sprint_items set closed = true, column_status = 'done' where id = $1 and user_id = $2
     returning ${SELECT_COLUMNS}`,
    [id, userId]
  );
  if (result.rowCount === 0) return null;
  return mapRow(result.rows[0]);
}

export async function saveSprintItem(params: {
  userId: string;
  provider: string;
  repoFullName: string;
  issueNumber: number;
  issueHtmlUrl: string;
  title: string;
  storyPoints?: number | null;
}): Promise<SprintItem> {
  const result = await pool.query(
    `insert into sprint_items (user_id, provider, repo_full_name, issue_number, issue_html_url, title, story_points)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning ${SELECT_COLUMNS}`,
    [
      params.userId,
      params.provider,
      params.repoFullName,
      params.issueNumber,
      params.issueHtmlUrl,
      params.title,
      params.storyPoints ?? null,
    ]
  );
  return mapRow(result.rows[0]);
}

export async function getSprintItems(userId: string, provider: string, repoFullName: string): Promise<SprintItem[]> {
  const result = await pool.query(
    `select ${SELECT_COLUMNS} from sprint_items
     where user_id = $1 and provider = $2 and repo_full_name = $3
     order by created_at desc`,
    [userId, provider, repoFullName]
  );
  return result.rows.map(mapRow);
}

export async function updateSprintItemColumn(
  userId: string,
  id: string,
  columnStatus: string
): Promise<SprintItem | null> {
  if (!SPRINT_COLUMNS.includes(columnStatus as (typeof SPRINT_COLUMNS)[number])) {
    throw new Error('Invalid column status');
  }
  const result = await pool.query(
    `update sprint_items set column_status = $1 where id = $2 and user_id = $3
     returning ${SELECT_COLUMNS}`,
    [columnStatus, id, userId]
  );
  if (result.rowCount === 0) return null;
  return mapRow(result.rows[0]);
}

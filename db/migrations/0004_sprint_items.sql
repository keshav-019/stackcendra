-- Local sprint metadata for issues created through StackCendra's Sprint
-- board in a provider mode (see ADR-0013). The issue itself (title, body,
-- open/closed state) lives on the real provider -- only the local-only
-- board concerns (column, story points) are stored here, keyed to the
-- real issue by (provider, repo_full_name, issue_number).

CREATE TABLE IF NOT EXISTS sprint_items
(
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(255) NOT NULL,
  repo_full_name VARCHAR(255) NOT NULL,
  issue_number INTEGER NOT NULL,
  issue_html_url TEXT NOT NULL,
  title TEXT NOT NULL,
  column_status VARCHAR(50) NOT NULL DEFAULT 'todo',
  story_points INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, provider, repo_full_name, issue_number)
);

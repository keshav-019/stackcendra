-- Projects a user tracks in StackCendra. A project is either local-only
-- (no remote) or linked to one GitHub repository / GitLab project, whose
-- live status is read through that user's integration connection
-- (integration_connections) -- nothing about the remote is copied here
-- beyond its identifier and default branch at link time.

CREATE TABLE IF NOT EXISTS projects
(
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  local_path TEXT NOT NULL,
  provider VARCHAR(20) NOT NULL DEFAULT 'none',
  repo_full_name VARCHAR(255),
  default_branch VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT projects_provider_check CHECK (provider IN ('none', 'github', 'gitlab')),
  -- A linked project always names its repo; a local-only one never does.
  CONSTRAINT projects_repo_matches_provider CHECK (
    (provider = 'none' AND repo_full_name IS NULL)
    OR (provider <> 'none' AND repo_full_name IS NOT NULL)
  )
);

-- Names are unique per user, ignoring case ("API" and "api" collide).
CREATE UNIQUE INDEX IF NOT EXISTS projects_user_name_key ON projects (user_id, lower(name));
CREATE INDEX IF NOT EXISTS projects_user_created_idx ON projects (user_id, created_at DESC);

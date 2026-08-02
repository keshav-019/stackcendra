-- GitLab's OAuth access tokens expire (~2 hours) and must be refreshed
-- with a refresh token, unlike GitHub's non-expiring classic OAuth App
-- tokens. These columns are nullable and only populated for providers
-- that need them; GitHub connections leave both null.
--
-- No migration tool is chosen yet (see the open decision in
-- docs/wiki/Risks-Non-Goals-and-Decision-Log.md) -- this file is the
-- source of truth to re-run by hand until one is.

ALTER TABLE integration_connections
  ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

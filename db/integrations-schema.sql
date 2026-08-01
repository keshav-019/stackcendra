-- Third-party integration connections (distinct from the Auth.js
-- users/accounts tables in auth-schema.sql). One row per user per
-- provider. access_token_encrypted holds an AES-256-GCM ciphertext
-- (see src/lib/crypto.ts), never a plaintext token.
--
-- No migration tool is chosen yet (see the open decision in
-- docs/wiki/Risks-Non-Goals-and-Decision-Log.md) -- this file is the
-- source of truth to re-run by hand until one is.

CREATE TABLE IF NOT EXISTS integration_connections
(
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(255) NOT NULL,
  provider_account_login VARCHAR(255),
  access_token_encrypted TEXT NOT NULL,
  scope TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (user_id, provider)
);

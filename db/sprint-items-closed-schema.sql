-- Tracks whether a sprint item's real provider issue has been closed
-- through StackCendra, kept separate from column_status (which is a
-- purely local board position, not the real issue state) per the
-- local/remote data split in ADR-0013.

ALTER TABLE sprint_items
  ADD COLUMN IF NOT EXISTS closed BOOLEAN NOT NULL DEFAULT false;

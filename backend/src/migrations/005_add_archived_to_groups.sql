-- Migration 005: Add archived field to groups table
-- This allows group creators to archive groups, preventing further modifications

ALTER TABLE groups
ADD COLUMN archived BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for filtering archived groups efficiently
CREATE INDEX idx_groups_archived ON groups(archived);

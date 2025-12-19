-- Migration: Add language preference to users
-- Version: 008
-- Date: 2025-12-19
-- Description: Adds preferred_language column to users table for i18n email support

-- Add preferred_language column with default 'es'
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'es';

-- Create index for language queries
CREATE INDEX IF NOT EXISTS idx_users_preferred_language ON users(preferred_language);

-- Update existing users to have 'es' as default language if NULL
UPDATE users SET preferred_language = 'es' WHERE preferred_language IS NULL;

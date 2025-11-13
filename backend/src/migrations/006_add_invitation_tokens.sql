-- Migration: add invitation tokens
-- Version: 006
-- Date: 2025-11-13

-- Add your SQL statements here
-- Each migration is automatically wrapped in a transaction
-- Do NOT include BEGIN or COMMIT statements

-- Create invitation_tokens table for magic link invitations
CREATE TABLE IF NOT EXISTS invitation_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  grupo_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  invited_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_grupo FOREIGN KEY (grupo_id) REFERENCES groups(id),
  CONSTRAINT fk_invited_by FOREIGN KEY (invited_by) REFERENCES users(id)
);

-- Create index on token for fast lookups
CREATE INDEX idx_invitation_tokens_token ON invitation_tokens(token);

-- Create index on email for checking existing invitations
CREATE INDEX idx_invitation_tokens_email ON invitation_tokens(email);

-- Create index on grupo_id for listing invitations per group
CREATE INDEX idx_invitation_tokens_grupo_id ON invitation_tokens(grupo_id);

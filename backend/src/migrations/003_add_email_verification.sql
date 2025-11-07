-- Add email verification fields to users table
ALTER TABLE users
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN email_verification_token VARCHAR(255),
ADD COLUMN email_verification_expires TIMESTAMP;

-- Users with OAuth (Google/Meta) should have email_verified = TRUE
UPDATE users SET email_verified = TRUE WHERE google_id IS NOT NULL OR meta_id IS NOT NULL;

-- Add column to track last event notification date
ALTER TABLE memberships
ADD COLUMN last_event_notification_sent DATE;

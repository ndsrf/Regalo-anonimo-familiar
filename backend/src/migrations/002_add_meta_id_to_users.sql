-- Migration: Add meta_id column to users table for Meta/Instagram OAuth
-- Version: 002
-- Date: 2025-11-06

-- Add meta_id column to support Meta/Instagram OAuth login
ALTER TABLE users ADD COLUMN meta_id VARCHAR(255);

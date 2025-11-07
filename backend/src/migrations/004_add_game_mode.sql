-- Add game mode support for Secret Santa (Amigo Invisible)

-- Create enum for game modes
CREATE TYPE game_mode AS ENUM ('Lista de Deseos Anónimos', 'Amigo Invisible');

-- Add game_mode column to groups table with default
ALTER TABLE groups
ADD COLUMN game_mode game_mode DEFAULT 'Lista de Deseos Anónimos' NOT NULL,
ADD COLUMN pairings_done BOOLEAN DEFAULT FALSE;

-- Create table for Secret Santa pairings
CREATE TABLE secret_santa_pairings (
    id SERIAL PRIMARY KEY,
    grupo_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    giver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grupo_id, giver_id),
    UNIQUE(grupo_id, receiver_id)
);

-- Index for faster lookups
CREATE INDEX idx_secret_santa_pairings_grupo ON secret_santa_pairings(grupo_id);
CREATE INDEX idx_secret_santa_pairings_giver ON secret_santa_pairings(giver_id);

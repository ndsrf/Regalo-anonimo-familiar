-- Secret Wishlist Database Schema

-- Drop tables if exist (for clean setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS gifts CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS celebration_type;

-- Create enum for celebration types
CREATE TYPE celebration_type AS ENUM ('Navidad', 'Reyes Magos', 'Boda', 'Cumpleaños', 'Otro');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(255),
    nombre VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups table
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    nombre_grupo VARCHAR(255) NOT NULL,
    tipo_celebracion celebration_type NOT NULL,
    fecha_inicio DATE NOT NULL,
    codigo_url VARCHAR(50) UNIQUE NOT NULL,
    creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups by codigo_url
CREATE INDEX idx_groups_codigo_url ON groups(codigo_url);

-- Memberships table (pivot table)
CREATE TABLE memberships (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grupo_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, grupo_id)
);

-- Gifts table
CREATE TABLE gifts (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    url TEXT,
    image_url TEXT,
    solicitante_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grupo_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    comprador_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    fecha_compra TIMESTAMP,
    is_deleted_by_solicitante BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for gifts
CREATE INDEX idx_gifts_grupo_id ON gifts(grupo_id);
CREATE INDEX idx_gifts_solicitante_id ON gifts(solicitante_id);
CREATE INDEX idx_gifts_comprador_id ON gifts(comprador_id);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    target_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    grupo_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    original_gift_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster unread notifications lookup
CREATE INDEX idx_notifications_target_user_read ON notifications(target_user_id, is_read);

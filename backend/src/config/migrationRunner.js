import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database Migration Runner
 *
 * This module handles database schema versioning and migrations.
 * Migrations are SQL files stored in src/migrations/ with numeric prefixes (e.g., 001_initial_schema.sql)
 *
 * The system tracks which migrations have been applied in a schema_migrations table.
 */

/**
 * Create the schema_migrations table if it doesn't exist
 */
async function createMigrationsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      version VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(createTableQuery);
  console.log('✓ Schema migrations table ready');
}

/**
 * Get list of migrations that have already been applied
 */
async function getAppliedMigrations() {
  const result = await pool.query(
    'SELECT version FROM schema_migrations ORDER BY version ASC'
  );
  return result.rows.map(row => row.version);
}

/**
 * Get list of migration files from the migrations directory
 */
function getMigrationFiles() {
  // Determine migrations path based on environment
  const migrationsPath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../migrations')
    : path.join(__dirname, '../migrations');

  if (!fs.existsSync(migrationsPath)) {
    console.warn(`⚠ Migrations directory not found: ${migrationsPath}`);
    return [];
  }

  const files = fs.readdirSync(migrationsPath)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort to ensure migrations run in order

  return files.map(file => {
    // Extract version (e.g., "001" from "001_initial_schema.sql")
    const match = file.match(/^(\d+)_(.+)\.sql$/);
    if (!match) {
      console.warn(`⚠ Skipping file with invalid format: ${file}`);
      return null;
    }

    return {
      version: match[1],
      name: match[2],
      filename: file,
      filepath: path.join(migrationsPath, file)
    };
  }).filter(Boolean); // Remove null entries
}

/**
 * Apply a single migration
 */
async function applyMigration(migration) {
  const sql = fs.readFileSync(migration.filepath, 'utf8');

  // Execute migration in a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Run the migration SQL
    await client.query(sql);

    // Record the migration as applied
    await client.query(
      'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
      [migration.version, migration.name]
    );

    await client.query('COMMIT');
    console.log(`✓ Applied migration ${migration.version}_${migration.name}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Run all pending migrations
 */
export async function runMigrations() {
  try {
    console.log('🔄 Starting database migration check...');

    // Ensure migrations tracking table exists
    await createMigrationsTable();

    // Get applied and available migrations
    const appliedMigrations = await getAppliedMigrations();
    const availableMigrations = getMigrationFiles();

    if (availableMigrations.length === 0) {
      console.log('⚠ No migration files found');
      return;
    }

    // Find pending migrations
    const pendingMigrations = availableMigrations.filter(
      migration => !appliedMigrations.includes(migration.version)
    );

    if (pendingMigrations.length === 0) {
      console.log('✓ Database schema is up to date');
      console.log(`  Current version: ${appliedMigrations[appliedMigrations.length - 1] || 'none'}`);
      return;
    }

    // Apply pending migrations
    console.log(`📦 Found ${pendingMigrations.length} pending migration(s)`);
    for (const migration of pendingMigrations) {
      await applyMigration(migration);
    }

    console.log('✅ All migrations completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Get current database schema version
 */
export async function getCurrentVersion() {
  try {
    const result = await pool.query(
      'SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1'
    );
    return result.rows[0]?.version || null;
  } catch (error) {
    // Table might not exist yet
    return null;
  }
}

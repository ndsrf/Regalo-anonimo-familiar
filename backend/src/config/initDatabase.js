import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
  try {
    console.log('Checking database schema...');

    // Check if users table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `;

    const result = await pool.query(checkTableQuery);
    const tableExists = result.rows[0].exists;

    if (!tableExists) {
      console.log('Users table does not exist. Initializing database schema...');

      // Read and execute the init.sql file
      const initSqlPath = path.join(__dirname, '../../../database/init.sql');
      const initSql = fs.readFileSync(initSqlPath, 'utf8');

      await pool.query(initSql);

      console.log('Database schema initialized successfully!');
    } else {
      console.log('Database schema already exists.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

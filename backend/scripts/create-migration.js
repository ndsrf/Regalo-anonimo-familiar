#!/usr/bin/env node

/**
 * Migration Generator Script
 *
 * Usage: npm run migration:create <description>
 * Example: npm run migration:create add_user_preferences
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, '../src/migrations');

function getNextVersion() {
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql') && !file.startsWith('_'))
    .sort();

  if (files.length === 0) {
    return '001';
  }

  const lastFile = files[files.length - 1];
  const match = lastFile.match(/^(\d+)_/);

  if (!match) {
    console.error('❌ Could not determine version from existing migrations');
    process.exit(1);
  }

  const lastVersion = parseInt(match[1], 10);
  const nextVersion = lastVersion + 1;

  return String(nextVersion).padStart(3, '0');
}

function createMigration(description) {
  if (!description) {
    console.error('❌ Error: Migration description is required');
    console.log('\nUsage: npm run migration:create <description>');
    console.log('Example: npm run migration:create add_user_preferences');
    process.exit(1);
  }

  // Convert description to snake_case if it isn't already
  const snakeDescription = description
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  const version = getNextVersion();
  const filename = `${version}_${snakeDescription}.sql`;
  const filepath = path.join(migrationsDir, filename);

  if (fs.existsSync(filepath)) {
    console.error(`❌ Error: Migration file already exists: ${filename}`);
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0];
  const content = `-- Migration: ${snakeDescription.replace(/_/g, ' ')}
-- Version: ${version}
-- Date: ${today}

-- Add your SQL statements here
-- Each migration is automatically wrapped in a transaction
-- Do NOT include BEGIN or COMMIT statements

`;

  fs.writeFileSync(filepath, content, 'utf8');

  console.log('✅ Migration created successfully!');
  console.log(`📄 File: ${filename}`);
  console.log(`📂 Location: ${filepath}`);
  console.log('\n📝 Next steps:');
  console.log(`   1. Edit ${filename}`);
  console.log('   2. Add your SQL statements');
  console.log('   3. Test locally');
  console.log('   4. Commit and deploy');
}

// Get description from command line arguments
const description = process.argv[2];
createMigration(description);

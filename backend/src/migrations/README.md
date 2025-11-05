# Database Migrations

This directory contains database migration files for the Secret Wishlist application.

## How Migrations Work

The migration system automatically runs when the backend starts up. It:
1. Creates a `schema_migrations` table to track which migrations have been applied
2. Scans this directory for migration files (`.sql` files)
3. Runs any migrations that haven't been applied yet, in order
4. Records each successful migration in the `schema_migrations` table

## Migration File Naming Convention

Migration files must follow this naming pattern:

```
<version>_<description>.sql
```

Where:
- `<version>`: A 3-digit number (001, 002, 003, etc.)
- `<description>`: A snake_case description of what the migration does

**Examples:**
- `001_initial_schema.sql`
- `002_add_user_preferences.sql`
- `003_add_gift_images.sql`

## Creating a New Migration

1. **Determine the next version number** by looking at existing migration files
2. **Create a new file** with the appropriate version and description
3. **Write your SQL** - can include any valid PostgreSQL commands
4. **Test locally** before committing

### Template for New Migrations

```sql
-- Migration: <Brief description>
-- Version: <version number>
-- Date: <YYYY-MM-DD>

-- Add your SQL statements here
-- Example:

-- Add a new column to users table
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';

-- Create an index for better performance
CREATE INDEX idx_users_preferences ON users USING GIN (preferences);

-- Add a comment explaining the change
COMMENT ON COLUMN users.preferences IS 'User preferences stored as JSON';
```

## Best Practices

### DO:
- ✅ Use transactions implicitly (the migration runner wraps each migration in a transaction)
- ✅ Add comments explaining complex changes
- ✅ Test migrations on a local database first
- ✅ Keep migrations focused on a single logical change
- ✅ Use `IF NOT EXISTS` clauses when creating tables/indexes to make migrations idempotent
- ✅ Include both schema changes and necessary data migrations in the same file

### DON'T:
- ❌ Don't modify existing migration files after they've been deployed
- ❌ Don't skip version numbers
- ❌ Don't include `BEGIN` or `COMMIT` (migrations are automatically wrapped in transactions)
- ❌ Don't put multiple unrelated changes in one migration
- ❌ Don't use database-specific features without documentation

## Migration Examples

### Adding a New Table

```sql
-- Migration: Add user sessions table
-- Version: 004
-- Date: 2025-11-05

CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
```

### Adding Columns

```sql
-- Migration: Add avatar URL to users
-- Version: 005
-- Date: 2025-11-05

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
```

### Modifying Data

```sql
-- Migration: Set default celebration type for existing groups
-- Version: 006
-- Date: 2025-11-05

UPDATE groups
SET tipo_celebracion = 'Otro'
WHERE tipo_celebracion IS NULL;
```

### Creating Indexes

```sql
-- Migration: Add performance indexes
-- Version: 007
-- Date: 2025-11-05

CREATE INDEX IF NOT EXISTS idx_gifts_created_at ON gifts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
```

## Checking Migration Status

The backend logs migration information on startup:

```
🔄 Starting database migration check...
✓ Schema migrations table ready
📦 Found 2 pending migration(s)
✓ Applied migration 002_add_user_preferences
✓ Applied migration 003_add_gift_images
✅ All migrations completed successfully
📊 Database schema version: 003
🚀 Server running on port 5000
```

If all migrations are up to date:

```
🔄 Starting database migration check...
✓ Schema migrations table ready
✓ Database schema is up to date
  Current version: 003
📊 Database schema version: 003
🚀 Server running on port 5000
```

## Troubleshooting

### Migration Failed

If a migration fails:
1. The transaction is rolled back automatically
2. The migration is NOT recorded in `schema_migrations`
3. The backend will fail to start
4. Fix the SQL error in the migration file
5. Restart the backend (it will retry the failed migration)

### Skipped Migration

If you accidentally skipped a version number (e.g., went from 002 to 004):
- Create the missing migration file (003)
- The system will run migrations in order: 003, then 004

### Manual Migration Check

To manually check which migrations have been applied:

```sql
SELECT * FROM schema_migrations ORDER BY version ASC;
```

## Rollback Strategy

This migration system runs migrations forward only. If you need to undo changes:

1. **Option A**: Create a new migration that reverses the changes
   ```sql
   -- Migration: Remove user preferences column
   -- Version: 008

   ALTER TABLE users DROP COLUMN IF EXISTS preferences;
   ```

2. **Option B**: Restore from database backup (production)

3. **Option C**: Manually run SQL to reverse changes (development only)

## Production Deployment

When deploying to production:
1. Ensure all migration files are committed to git
2. The backend will automatically run pending migrations on startup
3. Monitor the logs to confirm successful migration
4. If a migration fails, the backend won't start, preventing requests to an inconsistent database

## Local Development

During development, you can:
- Reset your entire database and let migrations rebuild it
- Create new migrations for schema changes
- Test migrations before committing

To reset your local database:
```bash
# Stop containers
docker compose down

# Remove the database volume
docker volume rm regalo-anonimo-familiar_postgres_data

# Start fresh (migrations will run automatically)
docker compose up -d
```

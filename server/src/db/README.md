# OneShot Database Migration System

## Overview

This directory contains the migration system for the OneShot application database. Due to issues with Drizzle's standard migration system producing "undefined.sql" errors, we've implemented a custom solution that reliably handles migrations.

## Available Migration Scripts

| Script | Description |
| ------ | ----------- |
| `npm run migrate:direct` | **Recommended**: Runs our custom migration system that directly executes SQL migrations |
| `npm run migrate:validate` | Validates the migration state by checking table structure and consistency |
| `npm run migrate:rebuild` | Rebuilds the migration tracking table to fix type mismatches |
| `npm run migrate:rebuild-and-validate` | Rebuilds and then validates the migration system in one step |
| `npm run migrate` | Attempts standard Drizzle migration (may fail with undefined.sql error) |

## Migration Workflow

1. **Create Migration Files**
   - Create SQL migration files in the `migrations` directory
   - Use sequential naming like `0001_migration_name.sql`, `0002_another_migration.sql`

2. **Update Journal**
   - Add your migration to the `migrations/meta/_journal.json` file
   - Increment the `idx` and update the `hash` to match your file name (without .sql)

3. **Apply Migrations**
   - Run `npm run migrate:direct` to apply pending migrations
   - This will execute SQL statements and update the tracking table

## Troubleshooting

### "undefined.sql" Error

This error occurs due to a type mismatch in the migration tracking table. To fix:

1. Run `npm run migrate:validate` to identify issues
2. Run `npm run migrate:rebuild` to rebuild the tracking table
3. Run `npm run migrate:direct` to apply any pending migrations

### Migration Table Details

The `drizzle.__drizzle_migrations` table tracks applied migrations with these columns:

- `id`: Auto-incrementing serial ID (primary key)
- `hash`: The migration identifier matching the filename (e.g., "0001_initial")
- `created_at`: Timestamp stored as BIGINT (not string) to avoid type mismatches

## Implementation Files

- `custom-migrate.ts`: Implements direct SQL migration application
- `rebuild-migration-state.ts`: Rebuilds the migration tracking table
- `validate-migrations.ts`: Validates the migration state
- `debug-migrate.ts`: Debugging tool to diagnose migration issues
- `migrate.ts`: Standard Drizzle migration (may fail with certain Drizzle versions)

## Best Practices

1. Always use `npm run migrate:direct` for applying migrations
2. Run migrations in development before deploying to production
3. Test migrations on a copy of production data before applying to production
4. Add transactions to your migration scripts for safety 
# Drizzle Migration Workflow Guide

This guide documents the migration workflow for the OneShot Recruiting Platform, which uses Drizzle ORM for database management. The migration system has been enhanced to ensure reliable operation across development environments.

## Migration System Components

### Core Files

1. **Schema Definition**
   - `src/db/schema.ts` - Main schema file defining tables and relationships
   - `src/db/schema/*.ts` - Additional schema files (e.g., users.ts)

2. **Migration Scripts**
   - `src/db/migrate.ts` - Standard migration script that applies pending migrations
   - `src/db/validate-migrations.ts` - Validates migration state and catches common issues
   - `src/db/rebuild-migration-state.ts` - Repairs the migration tracking table when needed
   - `src/db/test-migration-workflow.ts` - Tests the entire migration workflow
   - `src/db/migration-verification.ts` - Full verification script for migration health

3. **Migration Artifacts**
   - `migrations/*.sql` - Generated SQL migration files
   - `migrations/meta/_journal.json` - Metadata tracking all migrations
   - `drizzle.__drizzle_migrations` - Database table tracking applied migrations

## Standard Workflow

The standard migration workflow follows these steps:

1. **Make schema changes**
   - Edit `src/db/schema.ts` or other schema files to add/modify tables, columns, etc.

2. **Generate migrations**
   ```bash
   npm run migrate:generate
   ```
   This uses Drizzle Kit to analyze schema changes and generate SQL migration files

3. **Apply migrations**
   ```bash
   npm run migrate
   ```
   This runs the standard migrate.ts script to apply pending migrations

4. **Verify success**
   ```bash
   npm run migrate:validate
   ```
   This checks that all migrations are properly tracked and consistent

## Validation & Troubleshooting

### Validation Tool

The validation tool (`migrate:validate`) checks:
- Migration table structure
- Consistency between journal and database
- Migration file existence
- Enum type consistency

```bash
npm run migrate:validate
```

The output will show a comprehensive report of the migration state:
- ✅ Successful checks
- ❌ Issues that need attention
- 💡 Recommendations for fixing issues

### Common Issues and Solutions

1. **"No file migrations/undefined.sql found" Error**
   - **Cause**: Type mismatch in the migration tracking table
   - **Solution**: Run the rebuild script:
     ```bash
     npm run migrate:rebuild
     ```

2. **Enum Mismatch Errors**
   - **Cause**: Enum types in database don't match schema definition
   - **Solution**: Create a new migration to update the enum:
     ```bash
     # After updating the enum in schema.ts:
     npm run migrate:generate
     npm run migrate
     ```

3. **Missing Migration Files**
   - **Cause**: Migration files were deleted but still referenced in journal
   - **Solution**: Restore the missing files or rebuild from a clean state

## Recovery & Testing

### Rebuilding the Migration State

If the migration system is in an inconsistent state, you can rebuild it:

```bash
npm run migrate:rebuild
```

This script:
- Creates a backup of the existing migration table
- Drops and recreates only the migration tracking table (not user data)
- Recreates the table with the correct column types
- Repopulates it from the journal file

### Testing the Full Workflow

To test that the entire migration workflow is working correctly:

```bash
npm run migrate:test-workflow
```

This script:
1. Adds a test field to the schema
2. Generates a migration
3. Applies the migration
4. Verifies the field was added to the database
5. Restores the original schema

## Best Practices

1. **Always validate after schema changes**
   ```bash
   npm run migrate:validate
   ```

2. **Backup migration metadata before major changes**
   - The system automatically creates backups during rebuilds
   - Consider manual backups of migrations/meta/ before major operations

3. **Test in a development environment first**
   - Use a development database before applying to production
   - Verify migrations work correctly with test data

4. **Keep enums in sync**
   - Ensure enum types in schema match database definitions
   - Be careful when renaming or removing enum values
   - Consider using migration helpers for enum updates

5. **Monitor migration performance**
   - Large migrations may require transaction management
   - Consider breaking very large schema changes into smaller migrations

By following this guide, you should be able to maintain a reliable migration workflow for the OneShot Recruiting Platform. 
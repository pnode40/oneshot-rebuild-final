# Drizzle Migration Workflow

## Standard Workflow

1. **Modify Schema**: Update your `src/db/schema.ts` file with your schema changes
   
2. **Generate Migration**: Run:
   ```bash
   npm run generate
   ```
   This will create a new migration file in the `migrations` folder

3. **Apply Migration**: Run:
   ```bash
   npm run migrate
   ```
   This will apply all pending migrations to the database

4. **Verify**: The migration will be tracked in the `drizzle.__drizzle_migrations` table

## Troubleshooting

If you encounter issues:

1. **Clean Up Migration Tracking**:
   ```bash
   node clean-migration-tracking.js
   ```
   This removes migration tracking entries for non-existent files

2. **Mark All Migrations as Applied**:
   ```bash
   node mark-migrations-applied.js
   ```
   This marks all existing migration files as applied in the database

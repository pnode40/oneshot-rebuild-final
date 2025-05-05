/**
 * Drizzle ORM Standard Migration System
 * 
 * This file provides a clean implementation of the standard Drizzle migration process.
 * It deliberately avoids automatic fixes or complex diagnostics to maintain predictability.
 * 
 * If migration failures occur due to table structure or inconsistencies:
 * - Run `npm run migrate:validate` to diagnose issues
 * - Run `npm run migrate:rebuild` to rebuild the migration tracking table
 * 
 * Usage:
 * - For normal operation: npm run migrate
 * - To validate migration state: npm run migrate:validate
 * - To rebuild migration table: npm run migrate:rebuild
 * - To rebuild and validate: npm run migrate:rebuild-and-validate
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config(); // Load .env file

/**
 * Standard Drizzle migration function
 */
async function runStandardMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('🔴 DATABASE_URL environment variable is required');
    process.exit(1);
  }

  // Create postgres client for the migration
  const migrationClient = postgres(databaseUrl, {
     max: 1,
     ssl: databaseUrl.includes('sslmode=require') ? 'require' : undefined
  });

  try {
    const migrationsFolder = path.resolve(process.cwd(), './migrations');
    console.log(`🚀 Running Drizzle migrations from ${migrationsFolder}...`);
    const db = drizzle(migrationClient);

    // Run the standard Drizzle migration
    await migrate(db, { migrationsFolder, migrationsTable: 'drizzle.__drizzle_migrations' });
    console.log('✅ Migration process completed successfully.');
  } catch (error: any) {
    console.error('❌ Migration error:', error);
    
    // Provide helpful guidance based on error type
    if (error.message && error.message.includes('undefined.sql')) {
      console.error('\n🔍 DIAGNOSIS: This appears to be the "undefined.sql" error in Drizzle ORM.');
      console.error('This typically occurs when the migration tracking table is out of sync with the actual migrations.');
      console.error('There may be a type mismatch issue with the created_at column.');
    }
    
    console.error('\n💡 RECOMMENDED STEPS:');
    console.error('1. Run npm run migrate:validate to diagnose issues');
    console.error('2. Run npm run migrate:rebuild to fix the migration table structure');
    console.error('3. Run npm run migrate again after rebuilding the table');
    console.error('\nFor more information, check the documentation in the migration files.');
    
    process.exit(1);
  } finally {
    console.log('🔌 Closing migration client connection...');
    await migrationClient.end();
    console.log('🚪 Migration client connection closed.');
  }
}

runStandardMigrations();
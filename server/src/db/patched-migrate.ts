import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config(); // Load .env file

/**
 * Custom patched migration function to handle the "undefined.sql" error
 * NOTE: This is not the final solution, but a workaround to identify the root cause
 */
async function runPatchedMigration() {
  // Create a patched version of the migrate function that ignores undefined.sql
  let patchedMigrateFn;
  try {
    // Try to locate the migrate.js file to patch it
    const modulesDir = path.resolve(process.cwd(), 'node_modules');
    
    console.log('🔍 Looking for drizzle-orm migrator module...');
    
    // Let's create our own implementation based on what we've seen from the error
    patchedMigrateFn = async (db: any, { migrationsFolder }: { migrationsFolder: string }) => {
      // Based on the error, we know it's trying to access migration files
      console.log(`📝 Running patched migrate function using folder: ${migrationsFolder}`);
      
      // First get all SQL files we have
      const migrationFiles = fs.readdirSync(migrationsFolder)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      console.log(`📝 Found migration files: ${migrationFiles.join(', ')}`);
      
      // Now get which migrations are already applied
      let appliedMigrations: string[] = [];
      try {
        const result = await db.execute(`SELECT * FROM drizzle.__drizzle_migrations ORDER BY id`);
        appliedMigrations = result.rows.map((row: any) => row.hash);
        console.log(`📝 Already applied migrations: ${appliedMigrations.join(', ')}`);
      } catch (e) {
        console.log('📝 No applied migrations found in database yet');
        
        // Create the migrations table if it doesn't exist
        await db.execute(`
          CREATE SCHEMA IF NOT EXISTS drizzle;
          CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
            id SERIAL PRIMARY KEY,
            hash TEXT NOT NULL,
            created_at BIGINT NOT NULL
          );
        `);
      }
      
      // Look for migrations to apply
      const pendingMigrations = migrationFiles
        .map(file => file.replace('.sql', ''))
        .filter(name => !appliedMigrations.includes(name));
        
      if (pendingMigrations.length === 0) {
        console.log('✅ No migrations to apply. Database schema is up to date.');
        return;
      }
      
      console.log(`📝 Pending migrations to apply: ${pendingMigrations.join(', ')}`);
      
      // Apply each pending migration
      for (const migration of pendingMigrations) {
        const migrationFile = path.join(migrationsFolder, `${migration}.sql`);
        if (!fs.existsSync(migrationFile)) {
          throw new Error(`Migration file ${migrationFile} does not exist`);
        }
        
        console.log(`📝 Applying migration: ${migration}`);
        
        // Read and execute the SQL file
        const sql = fs.readFileSync(migrationFile, 'utf8');
        
        try {
          // Execute the entire SQL file as a single statement
          // This handles PL/pgSQL DO blocks correctly
          await db.execute(sql);
        } catch (e) {
          console.error(`Error executing migration: ${migration}`);
          throw e;
        }
        
        // Mark as applied
        const timestamp = Math.floor(Date.now() / 1000);
        await db.execute(`
          INSERT INTO drizzle.__drizzle_migrations (hash, created_at) 
          VALUES ('${migration}', ${timestamp})
        `);
        
        console.log(`✅ Applied migration: ${migration}`);
      }
      
      console.log('✅ All migrations applied successfully');
    };
    
    console.log('🔧 Successfully patched migrate function!');
  } catch (e) {
    console.error('❌ Failed to patch migrate function:', e);
    process.exit(1);
  }

  // Regular setup
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('🔴 DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const migrationClient = postgres(databaseUrl, {
     max: 1,
     ssl: databaseUrl.includes('sslmode=require') ? 'require' : undefined
  });

  try {
    const migrationsFolder = path.resolve(process.cwd(), './migrations');
    
    // Use the drizzle wrapper but with our patched migrate function
    console.log(`🚀 Running patched migrations from ${migrationsFolder}...`);
    const db = drizzle(migrationClient);
    
    // Call our patched migrate function instead
    await patchedMigrateFn(db, { migrationsFolder });
    
    console.log('✅ Migration process completed successfully with patched function');
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runPatchedMigration(); 
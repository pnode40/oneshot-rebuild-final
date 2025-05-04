import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function runMigrations() {
  // Create postgres client for migrations
  const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
  const queryClient = postgres(process.env.DATABASE_URL!, { max: 1 });
  
  try {
    console.log('Running migrations...');
    
    // 1. Clean up tracking table, removing any malformed entries
    console.log('Checking migration tracking table for consistency...');
    const schemaExists = await queryClient`
      SELECT EXISTS(
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = 'drizzle'
      ) as exists
    `;
    
    if (schemaExists[0]?.exists) {
      const tableExists = await queryClient`
        SELECT EXISTS(
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
        ) as exists
      `;
      
      if (tableExists[0]?.exists) {
        // Check what migrations are recorded
        const migrations = await queryClient`
          SELECT hash FROM drizzle.__drizzle_migrations
        `;
        
        console.log('Currently tracked migrations:', migrations.map(m => m.hash));
        
        // Clean up any malformed entries
        const malformedMigrations = migrations
          .filter(m => m.hash.includes('.sql') || !m.hash.includes('_'))
          .map(m => m.hash);
        
        if (malformedMigrations.length > 0) {
          console.log('Found malformed migration entries. Cleaning up tracking table...');
          for (const hash of malformedMigrations) {
            await queryClient`
              DELETE FROM drizzle.__drizzle_migrations WHERE hash = ${hash}
            `;
            console.log(`Removed malformed migration: ${hash}`);
          }
        }
      }
    }
    
    // 2. Check if the user_role enum exists
    const enumExists = await queryClient`
      SELECT EXISTS(
        SELECT 1 FROM pg_type WHERE typname = 'user_role'
      ) as exists
    `;
    
    if (enumExists[0]?.exists) {
      console.log('user_role enum already exists in the database');
      
      // If the enum exists, we need to make sure it's tracked in the migrations table
      if (schemaExists[0]?.exists) {
        const firstMigrationTracked = await queryClient`
          SELECT EXISTS(
            SELECT 1 FROM drizzle.__drizzle_migrations 
            WHERE hash = '0000_red_karma'
          ) as exists
        `;
        
        if (!firstMigrationTracked[0]?.exists) {
          console.log('First migration not tracked, recording it as applied...');
          const timestamp = Math.floor(Date.now() / 1000);
          
          await queryClient`
            INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
            VALUES ('0000_red_karma', ${timestamp})
          `;
          console.log('First migration now tracked');
        }
      }
      
      // 3. Run only the second migration (0001_abnormal_yellowjacket.sql)
      // Create a temp directory with only the second migration
      const tempDir = path.join(process.cwd(), '_temp_migrations');
      
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      
      // Copy only the second migration file to temp dir
      const secondMigrationPath = path.join(process.cwd(), 'migrations', '0001_abnormal_yellowjacket.sql');
      if (fs.existsSync(secondMigrationPath)) {
        fs.copyFileSync(
          secondMigrationPath, 
          path.join(tempDir, '0001_abnormal_yellowjacket.sql')
        );
        
        console.log('Running only the second migration from temp directory...');
        const db = drizzle(migrationClient);
        await migrate(db, { migrationsFolder: './_temp_migrations' });
        
        // Clean up temp directory
        fs.unlinkSync(path.join(tempDir, '0001_abnormal_yellowjacket.sql'));
        fs.rmdirSync(tempDir);
      } else {
        console.log('Second migration file not found, skipping execution');
      }
    } else {
      // If the enum doesn't exist, run the migrations normally
      console.log('user_role enum does not exist, running all migrations...');
      const db = drizzle(migrationClient);
      await migrate(db, { migrationsFolder: './migrations' });
    }
    
    // 4. Handle any additional migrations (e.g., 0002_test_migration.sql)
    const additionalMigrations = fs.readdirSync(path.join(process.cwd(), 'migrations'))
      .filter(file => file.endsWith('.sql'))
      .filter(file => !file.startsWith('0000_') && !file.startsWith('0001_'));
    
    if (additionalMigrations.length > 0) {
      console.log('Processing additional migrations:', additionalMigrations);
      
      // Create a temp dir for these migrations
      const tempDir = path.join(process.cwd(), '_temp_migrations');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      
      // Copy additional migrations to temp dir
      for (const file of additionalMigrations) {
        fs.copyFileSync(
          path.join(process.cwd(), 'migrations', file),
          path.join(tempDir, file)
        );
      }
      
      // Run migrations from temp dir
      console.log('Running additional migrations...');
      const db = drizzle(migrationClient);
      await migrate(db, { migrationsFolder: './_temp_migrations' });
      
      // Clean up
      for (const file of additionalMigrations) {
        fs.unlinkSync(path.join(tempDir, file));
      }
      fs.rmdirSync(tempDir);
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the database connections
    await migrationClient.end();
    await queryClient.end();
    process.exit(0);
  }
}

// Run migrations
runMigrations(); 
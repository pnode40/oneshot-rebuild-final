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

async function verifyMigrations() {
  // Create postgres client for migrations
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  
  try {
    console.log('Verifying database migration status...');
    
    // Get list of SQL migration files (excluding backups)
    const migrationsDir = path.resolve(process.cwd(), './migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && !file.endsWith('.bak'))
      .map(file => file.replace('.sql', ''))
      .sort();
      
    console.log(`Found ${migrationFiles.length} migration files:`, migrationFiles);
    
    // Check database for tracked migrations
    const result = await client`
      SELECT hash FROM drizzle.__drizzle_migrations ORDER BY hash
    `;
    
    const trackedMigrations = result.map(row => row.hash);
    console.log(`Found ${trackedMigrations.length} tracked migrations in database:`, trackedMigrations);
    
    // Check if all migrations are tracked
    const missingMigrations = migrationFiles.filter(hash => !trackedMigrations.includes(hash));
    const extraMigrations = trackedMigrations.filter(hash => !migrationFiles.includes(hash));
    
    if (missingMigrations.length === 0 && extraMigrations.length === 0) {
      console.log('✅ All migrations are properly tracked in the database');
      console.log('The migration system is synchronized');
    } else {
      if (missingMigrations.length > 0) {
        console.log('⚠️ Some migrations are not tracked in the database:', missingMigrations);
        console.log('Run node mark-migrations-applied.js to mark them as applied');
      }
      
      if (extraMigrations.length > 0) {
        console.log('⚠️ Some tracked migrations have no corresponding files:', extraMigrations);
        console.log('Run node clean-migration-tracking.js to clean up the database');
      }
    }
    
    console.log('Migration verification completed successfully');
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await client.end();
    process.exit(0);
  }
}

// Run migration verification
verifyMigrations(); 
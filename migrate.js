// Standard JavaScript migration script for Drizzle
const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');
require('dotenv').config();
const path = require('path');

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function runMigrations() {
  // Create postgres client for migrations
  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  
  try {
    // Resolve migrations folder path relative to project root
    const migrationsFolder = path.resolve(process.cwd(), './migrations');
    console.log(`Running standard Drizzle migrations from ${migrationsFolder}...`);
    
    // Initialize drizzle and run migrations
    const db = drizzle(migrationClient);
    await migrate(db, { migrationsFolder });
    
    console.log('Migration process completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await migrationClient.end();
    process.exit(0);
  }
}

// Run migrations
runMigrations(); 
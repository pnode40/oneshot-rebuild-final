/**
 * Migration Reset Verification Script
 * 
 * This script verifies that the migration tracking table is empty
 * and no migration files exist.
 */

const { Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

async function verifyReset() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('🔴 DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('\n🔍 MIGRATION RESET VERIFICATION');
  console.log('===============================');
  
  // Check migration files
  console.log('\n📂 Checking for SQL migration files...');
  const migrationsDir = path.resolve(process.cwd(), './migrations');
  
  if (fs.existsSync(migrationsDir)) {
    const sqlFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'));
    
    if (sqlFiles.length === 0) {
      console.log('✅ No SQL migration files found - good!');
    } else {
      console.error(`❌ Found ${sqlFiles.length} SQL migration files that should be deleted:`);
      sqlFiles.forEach(file => console.error(`   - ${file}`));
    }
  } else {
    console.error('❌ Migrations directory not found');
  }
  
  // Check journal file
  console.log('\n📂 Checking for journal file...');
  const journalPath = path.resolve(process.cwd(), './migrations/meta/_journal.json');
  
  if (fs.existsSync(journalPath)) {
    console.error('❌ Journal file still exists and should be deleted');
  } else {
    console.log('✅ Journal file has been removed - good!');
  }
  
  // Check database migration table
  console.log('\n📊 Checking migration table in database...');
  const client = new Client({ connectionString: databaseUrl });
  
  try {
    await client.connect();
    
    // Check if migrations table exists
    const { rows: tableExists } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'drizzle' 
        AND table_name = '__drizzle_migrations'
      ) as exists
    `);
    
    if (!tableExists[0].exists) {
      console.error('❌ Migration table does not exist in database');
    } else {
      // Check if table is empty
      const { rows: migrationCount } = await client.query(`
        SELECT COUNT(*) as count FROM drizzle.__drizzle_migrations
      `);
      
      if (parseInt(migrationCount[0].count) === 0) {
        console.log('✅ Migration table exists and is empty - good!');
      } else {
        console.error(`❌ Migration table contains ${migrationCount[0].count} rows - should be empty`);
      }
    }
    
    // Check if slug column exists in profiles table
    console.log('\n📊 Verifying schema state (slug column)...');
    const { rows: slugExists } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'slug'
      ) as exists
    `);
    
    if (slugExists[0].exists) {
      console.log('✅ Slug column exists in profiles table - schema maintained');
    } else {
      console.error('❌ Slug column not found in profiles table - schema may be lost');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await client.end();
  }
  
  console.log('\n===============================');
  console.log('Migration reset verification complete!');
}

verifyReset(); 
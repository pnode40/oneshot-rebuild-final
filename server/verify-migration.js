/**
 * Migration verification script
 */

const { Client } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function verifyMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('🔴 DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('📊 Connecting to database...');
  const client = new Client({ connectionString: databaseUrl });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check if the slug column exists
    console.log('🔍 Checking for slug column in profiles table...');
    const { rows } = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'slug'
    `);
    
    if (rows.length === 0) {
      console.error('❌ Slug column was not found in profiles table');
      process.exit(1);
    }
    
    console.log('✅ Slug column found in profiles table:');
    console.log('📋 Column details:');
    console.table(rows[0]);
    
    // Check for uniqueness constraint
    console.log('🔍 Checking for uniqueness constraint...');
    const { rows: constraints } = await client.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND constraint_type = 'UNIQUE'
    `);
    
    console.log('📋 Constraints:');
    console.table(constraints);
    
    // Check for index
    console.log('🔍 Checking for index on slug column...');
    const { rows: indices } = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'profiles'
        AND indexname = 'profiles_slug_idx'
    `);
    
    if (indices.length === 0) {
      console.warn('⚠️ Index "profiles_slug_idx" was not found');
    } else {
      console.log('✅ Index found:');
      console.table(indices);
    }
    
    console.log('✅ Migration verification complete');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

verifyMigration(); 
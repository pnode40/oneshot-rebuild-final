/**
 * Drizzle ORM Migration Table Rebuild Script
 * 
 * This script addresses the type mismatch issue in the drizzle.__drizzle_migrations table
 * where created_at is defined as BIGINT but contained string values, causing "undefined.sql" errors.
 * 
 * The script:
 * 1. Creates a backup of the existing migration table
 * 2. Drops the existing table
 * 3. Creates a fresh table with the correct column types
 * 4. Populates it from the migration journal file
 * 
 * After running this script, the standard Drizzle migrate() function should work correctly.
 */

import { Client } from 'pg';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function rebuildMigrationState() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('🔴 DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  
  try {
    console.log('🔄 Starting migration table rebuild process...');
    
    // Read journal to get proper ordering and metadata
    const journalPath = path.resolve(process.cwd(), './migrations/meta/_journal.json');
    if (!fs.existsSync(journalPath)) {
      console.error('🔴 Journal file not found at:', journalPath);
      process.exit(1);
    }
    
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
    const entries = journal.entries;
    
    console.log(`📋 Found ${entries.length} migrations in journal file`);
    
    // Backup existing table if it exists
    const { rows: tableExists } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'drizzle' 
        AND table_name = '__drizzle_migrations'
      ) as exists
    `);
    
    if (tableExists[0].exists) {
      console.log('📦 Creating backup of migration table...');
      await client.query('CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations_backup AS SELECT * FROM drizzle.__drizzle_migrations');
      
      // Check data in the existing table
      const { rows: existingMigrations } = await client.query('SELECT * FROM drizzle.__drizzle_migrations ORDER BY id');
      console.log(`📊 Found ${existingMigrations.length} migrations in existing table`);
      
      // Examine the created_at column type
      const { rows: columnInfo } = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'drizzle' 
        AND table_name = '__drizzle_migrations'
        AND column_name = 'created_at'
      `);
      
      console.log(`📊 Current created_at column type: ${columnInfo[0]?.data_type || 'unknown'}`);
      
      console.log('🗑️ Dropping existing migration table...');
      await client.query('DROP TABLE drizzle.__drizzle_migrations');
    } else {
      // Create drizzle schema if it doesn't exist
      console.log('🏗️ Creating drizzle schema as it does not exist yet...');
      await client.query('CREATE SCHEMA IF NOT EXISTS drizzle');
    }
    
    // Create fresh migration table with proper types
    console.log('🏗️ Creating fresh migration table with correct types...');
    await client.query(`
      CREATE TABLE drizzle.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT NOT NULL
      )
    `);
    
    // Insert migrations in the proper order with correct types
    console.log('📥 Populating migration table from journal...');
    for (const entry of entries) {
      // Use current timestamp for simplicity, cast to bigint
      const timestamp = Date.now();
      
      await client.query(`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES ($1, $2)
      `, [entry.hash, timestamp]);
      
      console.log(`✅ Added migration: ${entry.hash} with timestamp: ${timestamp}`);
    }
    
    // Verify result
    const { rows: migrations } = await client.query('SELECT * FROM drizzle.__drizzle_migrations ORDER BY id');
    console.log('\n✅ Migration table rebuilt successfully with:');
    migrations.forEach(m => {
      console.log(`- ID: ${m.id}, Hash: ${m.hash}, Created At: ${m.created_at} (${typeof m.created_at})`);
    });
    
    console.log('\n🔍 Verifying created_at column type...');
    const { rows: verifyColumnType } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'drizzle' 
      AND table_name = '__drizzle_migrations'
      AND column_name = 'created_at'
    `);
    
    console.log(`📊 New created_at column type: ${verifyColumnType[0]?.data_type || 'unknown'}`);
    
    console.log('\n🚀 Migration table rebuild complete. You should now be able to run standard Drizzle migrations successfully.');
    
  } catch (error) {
    console.error('🔴 Error rebuilding migration state:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Allow importing this file without running it immediately
if (require.main === module) {
  rebuildMigrationState()
    .then(() => console.log('✅ Rebuild process completed'))
    .catch(err => {
      console.error('🔴 Rebuild process failed:', err);
      process.exit(1);
    });
}

export { rebuildMigrationState }; 
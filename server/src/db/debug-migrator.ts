import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Client } from 'pg';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

/**
 * This script investigates the root cause of the "undefined.sql" error by
 * tracing exactly what data the Drizzle migrator is working with
 */
async function debugMigrator() {
  // Create a direct client for detailed database inspection
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log('Connected to database for debugging');
    
    // 1. Check the migrations in the filesystem
    const migrationsFolder = path.resolve(process.cwd(), './migrations');
    const migrationFiles = fs.readdirSync(migrationsFolder)
      .filter(file => file.endsWith('.sql'))
      .map(file => file.replace('.sql', ''))
      .sort();
    
    console.log(`\n🔍 Migration files in filesystem:`, migrationFiles);
    
    // 2. Verify journal.json
    const journalPath = path.join(migrationsFolder, 'meta', '_journal.json');
    let journalExists = fs.existsSync(journalPath);
    
    if (journalExists) {
      const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
      console.log(`\n🔍 Journal entries:`, journal.entries.map((e: { hash: string }) => e.hash));
    } else {
      console.log('❌ Journal file does not exist');
    }
    
    // 3. Check database migration tracking
    const { rows: migrationRows } = await client.query(
      'SELECT id, hash, created_at, created_at::text as created_at_text FROM drizzle.__drizzle_migrations ORDER BY id'
    );
    
    console.log('\n🔍 Database tracking entries:');
    migrationRows.forEach(row => {
      console.log(`  - ID: ${row.id}, Hash: "${row.hash}", Created At: ${row.created_at} (${row.created_at_text})`);
    });
    
    // 4. Check for possible NULL values or invalid types
    console.log('\n🔍 Type inspection of tracking table values:');
    migrationRows.forEach(row => {
      console.log(`  - ID: ${row.id}, Hash type: ${typeof row.hash}, Created At type: ${typeof row.created_at}`);
      
      if (row.hash === null || row.hash === undefined) {
        console.log(`    ❌ WARNING: NULL or undefined hash value found!`);
      }
      
      if (row.created_at === null || row.created_at === undefined) {
        console.log(`    ❌ WARNING: NULL or undefined created_at value found!`);
      }
    });
    
    // 5. Look for any rows with irregular data
    console.log('\n🔍 Checking for irregular rows:');
    const { rows: irregularRows } = await client.query(
      "SELECT * FROM drizzle.__drizzle_migrations WHERE hash IS NULL OR hash = '' OR hash LIKE 'undefined%'"
    );
    
    if (irregularRows.length > 0) {
      console.log(`  ❌ Found ${irregularRows.length} irregular rows!`, irregularRows);
    } else {
      console.log('  ✅ No irregular rows found');
    }
    
    // 6. Check table structure
    const { rows: columnInfo } = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
    `);
    
    console.log('\n🔍 Migration table structure:');
    columnInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}, Nullable: ${col.is_nullable}, Default: ${col.column_default || 'none'}`);
    });
    
    // 7. Inspect indexes
    const { rows: indexInfo } = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'drizzle' AND tablename = '__drizzle_migrations'
    `);
    
    console.log('\n🔍 Indexes on migration table:');
    if (indexInfo.length === 0) {
      console.log('  No indexes found (except primary key)');
    } else {
      indexInfo.forEach(idx => {
        console.log(`  - ${idx.indexname}: ${idx.indexdef}`);
      });
    }
    
    console.log('\n🔍 Debug information collection complete');
    
  } catch (error) {
    console.error('Error during debug:', error);
  } finally {
    await client.end();
  }
}

debugMigrator().then(() => {
  console.log('\nDebug script execution complete');
}); 
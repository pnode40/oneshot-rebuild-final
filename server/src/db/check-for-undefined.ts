import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

/**
 * This script looks specifically for any NULL or undefined values 
 * that might be causing the "undefined.sql" error
 */
async function checkForUndefined() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log('Connected to database to look for undefined values');

    // 1. Check for NULL values in the migrations table
    const { rows: nullCheck } = await client.query(`
      SELECT * FROM drizzle.__drizzle_migrations 
      WHERE hash IS NULL OR created_at IS NULL
    `);
    
    if (nullCheck.length > 0) {
      console.log('❌ Found NULL values in the migrations table:', nullCheck);
    } else {
      console.log('✅ No NULL values found in the migrations table');
    }
    
    // 2. Check for empty strings
    const { rows: emptyCheck } = await client.query(`
      SELECT * FROM drizzle.__drizzle_migrations 
      WHERE hash = ''
    `);
    
    if (emptyCheck.length > 0) {
      console.log('❌ Found empty strings in the migrations table:', emptyCheck);
    } else {
      console.log('✅ No empty strings found in the migrations table');
    }
    
    // 3. Check for whitespace-only values
    const { rows: whitespaceCheck } = await client.query(`
      SELECT * FROM drizzle.__drizzle_migrations 
      WHERE TRIM(hash) = ''
    `);
    
    if (whitespaceCheck.length > 0) {
      console.log('❌ Found whitespace-only values in the migrations table:', whitespaceCheck);
    } else {
      console.log('✅ No whitespace-only values found in the migrations table');
    }
    
    // 4. Check for "undefined" literal string
    const { rows: undefinedCheck } = await client.query(`
      SELECT * FROM drizzle.__drizzle_migrations 
      WHERE hash = 'undefined' OR hash LIKE '%undefined%'
    `);
    
    if (undefinedCheck.length > 0) {
      console.log('❌ Found "undefined" literal string in the migrations table:', undefinedCheck);
    } else {
      console.log('✅ No "undefined" literal strings found in the migrations table');
    }
    
    // 5. Check for any migrations without .sql files
    const migrationsFolder = path.resolve(process.cwd(), './migrations');
    const { rows: allMigrations } = await client.query(`
      SELECT * FROM drizzle.__drizzle_migrations
    `);
    
    console.log('\nChecking if all database migrations have corresponding .sql files:');
    
    const missingFiles = [];
    for (const migration of allMigrations) {
      const sqlFile = path.join(migrationsFolder, `${migration.hash}.sql`);
      if (!fs.existsSync(sqlFile)) {
        missingFiles.push(migration);
        console.log(`❌ Migration with hash "${migration.hash}" has no SQL file`);
      }
    }
    
    if (missingFiles.length === 0) {
      console.log('✅ All migrations in the database have corresponding .sql files');
    }
    
    // 6. Check for IDs with gaps
    const { rows: idCheck } = await client.query(`
      SELECT id, lead(id) OVER (ORDER BY id) - id AS gap
      FROM drizzle.__drizzle_migrations
      ORDER BY id
    `);
    
    const gapsFound = idCheck.filter(row => row.gap !== null && row.gap > 1);
    
    if (gapsFound.length > 0) {
      console.log('\n❌ Found gaps in the ID sequence:');
      gapsFound.forEach(gap => {
        console.log(`   - Gap of ${gap.gap - 1} after ID ${gap.id}`);
      });
    } else {
      console.log('\n✅ No gaps found in the ID sequence');
    }
    
    // 7. Look for additional meta_schema table that might conflict
    try {
      const { rows: metaSchema } = await client.query(`
        SELECT * FROM drizzle.meta_schema LIMIT 1
      `);
      
      console.log('\n⚠️ Found drizzle.meta_schema table with data:', metaSchema.length > 0);
    } catch (e) {
      console.log('\n✅ No drizzle.meta_schema table found (expected)');
    }
    
    // 8. Drizzle default table name check (sometimes it uses "__drizzle" instead of "__drizzle_migrations")
    try {
      const { rows: legacyTable } = await client.query(`
        SELECT * FROM drizzle.__drizzle LIMIT 1
      `);
      
      console.log('\n⚠️ Found legacy drizzle.__drizzle table with data:', legacyTable.length > 0);
    } catch (e) {
      console.log('\n✅ No legacy drizzle.__drizzle table found (expected)');
    }
    
    console.log('\nCheck complete! See above for any issues found.');
  } catch (error) {
    console.error('Error checking for undefined values:', error);
  } finally {
    await client.end();
  }
}

checkForUndefined(); 
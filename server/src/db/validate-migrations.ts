/**
 * Drizzle ORM Migration Validation Utility
 * 
 * This utility performs validation checks on the migration system to ensure:
 * 1. The migration table has the correct structure
 * 2. The migrations in the database match those in the journal file
 * 3. All migration files are accounted for
 * 
 * Used to verify the health of the migration system and diagnose issues
 */

import { Client } from 'pg';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Define interfaces for the journal and migrations
interface JournalEntry {
  hash: string;
  [key: string]: any;
}

interface Journal {
  entries: JournalEntry[];
  [key: string]: any;
}

interface DbMigration {
  id: number;
  hash: string;
  created_at: string | number;
  [key: string]: any;
}

/**
 * Validates the migration state by checking:
 * - Migration table structure
 * - Consistency between DB and journal
 * - Migration file existence
 */
async function validateMigrationState() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('🔴 DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  
  let isValid = true;
  const issues: string[] = [];
  
  try {
    console.log('🔍 Starting migration validation...');
    
    // Check 1: Verify drizzle schema and migrations table exist
    const { rows: tableExists } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'drizzle' 
        AND table_name = '__drizzle_migrations'
      ) as exists
    `);
    
    if (!tableExists[0].exists) {
      isValid = false;
      issues.push('Migration table does not exist');
      console.error('❌ Migration table does not exist');
      return { isValid, issues };
    }
    
    // Check 2: Verify table structure
    const { rows: columns } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'drizzle' 
      AND table_name = '__drizzle_migrations'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Migration table structure:');
    columns.forEach(col => console.log(`- ${col.column_name}: ${col.data_type}`));
    
    // Verify expected columns and types
    const requiredColumns = [
      { name: 'id', type: 'integer' },
      { name: 'hash', type: 'text' },
      { name: 'created_at', type: 'bigint' }
    ];
    
    for (const required of requiredColumns) {
      const column = columns.find(c => c.column_name === required.name);
      if (!column) {
        isValid = false;
        issues.push(`Missing required column: ${required.name}`);
        console.error(`❌ Missing required column: ${required.name}`);
      } else if (!column.data_type.includes(required.type)) {
        isValid = false;
        issues.push(`Column ${required.name} has incorrect type: ${column.data_type}, expected: ${required.type}`);
        console.error(`❌ Column ${required.name} has incorrect type: ${column.data_type}, expected: ${required.type}`);
      }
    }
    
    // Check 3: Read journal file
    const journalPath = path.resolve(process.cwd(), './migrations/meta/_journal.json');
    if (!fs.existsSync(journalPath)) {
      isValid = false;
      issues.push(`Journal file not found at: ${journalPath}`);
      console.error(`❌ Journal file not found at: ${journalPath}`);
      return { isValid, issues };
    }
    
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8')) as Journal;
    const journalEntries = journal.entries;
    
    // Check 4: Get migrations from DB
    const { rows: dbMigrations } = await client.query<DbMigration>('SELECT * FROM drizzle.__drizzle_migrations ORDER BY id');
    
    console.log(`📋 Found ${journalEntries.length} migrations in journal and ${dbMigrations.length} in database`);
    
    // Check 5: Verify all journal entries exist in DB
    const dbHashes = dbMigrations.map(m => m.hash);
    const missingInDb = journalEntries.filter((entry: JournalEntry) => !dbHashes.includes(entry.hash));
    
    if (missingInDb.length > 0) {
      isValid = false;
      issues.push(`${missingInDb.length} migrations in journal but missing in database: ${missingInDb.map((m: JournalEntry) => m.hash).join(', ')}`);
      console.error(`❌ Found ${missingInDb.length} migrations in journal but missing in database: ${missingInDb.map((m: JournalEntry) => m.hash).join(', ')}`);
    }
    
    // Check 6: Verify all DB entries exist in journal
    const journalHashes = journalEntries.map((entry: JournalEntry) => entry.hash);
    const missingInJournal = dbMigrations.filter(m => !journalHashes.includes(m.hash));
    
    if (missingInJournal.length > 0) {
      isValid = false;
      issues.push(`${missingInJournal.length} migrations in database but missing in journal: ${missingInJournal.map(m => m.hash).join(', ')}`);
      console.error(`❌ Found ${missingInJournal.length} migrations in database but missing in journal: ${missingInJournal.map(m => m.hash).join(', ')}`);
    }
    
    // Check 7: Verify all migration files exist
    const migrationsDir = path.resolve(process.cwd(), './migrations');
    let migrationFiles: string[] = [];
    
    if (fs.existsSync(migrationsDir)) {
      migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .map(file => file.replace('.sql', ''));
    } else {
      isValid = false;
      issues.push(`Migrations directory not found at: ${migrationsDir}`);
      console.error(`❌ Migrations directory not found at: ${migrationsDir}`);
      return { isValid, issues };
    }
    
    // Check for journal entries with missing files
    const missingFiles = journalEntries.filter((entry: JournalEntry) => !migrationFiles.includes(entry.hash));
    
    if (missingFiles.length > 0) {
      isValid = false;
      issues.push(`${missingFiles.length} migrations in journal but missing SQL files: ${missingFiles.map((m: JournalEntry) => m.hash).join(', ')}`);
      console.error(`❌ Found ${missingFiles.length} migrations in journal but missing SQL files: ${missingFiles.map((m: JournalEntry) => m.hash).join(', ')}`);
    }
    
    // Final validation result
    if (isValid) {
      console.log('✅ Migration validation passed! All checks successful.');
    } else {
      console.error(`❌ Migration validation failed with ${issues.length} issues.`);
    }
    
    return { isValid, issues };
    
  } catch (error: unknown) {
    console.error('🔴 Error validating migration state:', error);
    issues.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    return { isValid: false, issues };
  } finally {
    await client.end();
  }
}

// Allow importing this file without running it immediately
if (require.main === module) {
  validateMigrationState()
    .then(result => {
      console.log('Validation complete with result:', result);
      if (!result.isValid) {
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('🔴 Validation process failed:', err);
      process.exit(1);
    });
}

export { validateMigrationState }; 
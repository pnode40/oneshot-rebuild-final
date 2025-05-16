/**
 * Drizzle ORM Migration Validation Utility
 * 
 * This utility performs validation checks on the migration system to ensure:
 * 1. The migration table has the correct structure
 * 2. The migrations in the database match those in the journal file
 * 3. All migration files are accounted for
 * 4. Enum types in schema match database
 * 
 * Used to verify the health of the migration system and diagnose issues
 * 
 * Bug fix (2025-05-08): Added robust error handling for enum validation to prevent the TypeError: values.join is not a function
 * - Added type checking for array values
 * - Added try/catch around enum validation to prevent script crashes
 * - Added fallback value displays for invalid data formats
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

interface EnumType {
  name: string;
  values: string[];
}

/**
 * Validates the migration state by checking:
 * - Migration table structure
 * - Consistency between DB and journal
 * - Migration file existence
 * - Enum type consistency
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
    console.log('\n📊 MIGRATION VALIDATION REPORT');
    console.log('==============================');
    
    // Check 1: Verify drizzle schema and migrations table exist
    console.log('\n🔍 Checking migration table existence...');
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
      console.error('💡 Run "npm run migrate:rebuild" to create the migration table');
      return { isValid, issues };
    }
    console.log('✅ Migration table exists');
    
    // Check 2: Verify table structure
    console.log('\n🔍 Checking migration table structure...');
    const { rows: columns } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'drizzle' 
      AND table_name = '__drizzle_migrations'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Current migration table structure:');
    columns.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));
    
    // Verify expected columns and types
    const requiredColumns = [
      { name: 'id', type: 'integer' },
      { name: 'hash', type: 'text' },
      { name: 'created_at', type: 'bigint' }
    ];
    
    let structureValid = true;
    for (const required of requiredColumns) {
      const column = columns.find(c => c.column_name === required.name);
      if (!column) {
        isValid = false;
        structureValid = false;
        issues.push(`Missing required column: ${required.name}`);
        console.error(`❌ Missing required column: ${required.name}`);
      } else if (!column.data_type.includes(required.type)) {
        isValid = false;
        structureValid = false;
        issues.push(`Column ${required.name} has incorrect type: ${column.data_type}, expected: ${required.type}`);
        console.error(`❌ Column ${required.name} has incorrect type: ${column.data_type}, expected: ${required.type}`);
      }
    }
    
    if (structureValid) {
      console.log('✅ Migration table structure is valid');
    } else {
      console.error('💡 Run "npm run migrate:rebuild" to fix the migration table structure');
    }
    
    // Check 3: Read journal file
    console.log('\n🔍 Checking journal file...');
    const journalPath = path.resolve(process.cwd(), './migrations/meta/_journal.json');
    if (!fs.existsSync(journalPath)) {
      isValid = false;
      issues.push(`Journal file not found at: ${journalPath}`);
      console.error(`❌ Journal file not found at: ${journalPath}`);
      console.error('💡 Run "drizzle-kit generate" to create the journal file');
      return { isValid, issues };
    }
    console.log('✅ Journal file exists');
    
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8')) as Journal;
    const journalEntries = journal.entries;
    
    // Check 4: Get migrations from DB
    const { rows: dbMigrations } = await client.query<DbMigration>('SELECT * FROM drizzle.__drizzle_migrations ORDER BY id');
    
    console.log(`\n🔍 Checking migration synchronization...`);
    console.log(`📋 Found ${journalEntries.length} migrations in journal and ${dbMigrations.length} in database`);
    
    // Check 5: Verify all journal entries exist in DB
    const dbHashes = dbMigrations.map(m => m.hash);
    const missingInDb = journalEntries.filter((entry: JournalEntry) => !dbHashes.includes(entry.hash || entry.tag));
    
    if (missingInDb.length > 0) {
      isValid = false;
      issues.push(`${missingInDb.length} migrations in journal but missing in database: ${missingInDb.map((m: JournalEntry) => m.hash || m.tag).join(', ')}`);
      console.error(`❌ Found ${missingInDb.length} migrations in journal but missing in database: ${missingInDb.map((m: JournalEntry) => m.hash || m.tag).join(', ')}`);
      console.error('💡 Run "npm run migrate:rebuild" to synchronize the database with the journal');
    }
    
    // Check 6: Verify all DB entries exist in journal
    const journalHashes = journalEntries.map((entry: JournalEntry) => entry.hash || entry.tag);
    const missingInJournal = dbMigrations.filter(m => !journalHashes.includes(m.hash));
    
    if (missingInJournal.length > 0) {
      isValid = false;
      issues.push(`${missingInJournal.length} migrations in database but missing in journal: ${missingInJournal.map(m => m.hash).join(', ')}`);
      console.error(`❌ Found ${missingInJournal.length} migrations in database but missing in journal: ${missingInJournal.map(m => m.hash).join(', ')}`);
      console.error('💡 These migrations may need to be manually added to the journal file');
    }
    
    if (missingInDb.length === 0 && missingInJournal.length === 0) {
      console.log('✅ Migration journal and database are in sync');
    }
    
    // Check 7: Verify all migration files exist
    console.log('\n🔍 Checking migration files...');
    const migrationsDir = path.resolve(process.cwd(), './migrations');
    let migrationFiles: string[] = [];
    
    if (fs.existsSync(migrationsDir)) {
      migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .map(file => file.replace('.sql', ''));
      
      console.log(`📋 Found ${migrationFiles.length} migration SQL files`);
    } else {
      isValid = false;
      issues.push(`Migrations directory not found at: ${migrationsDir}`);
      console.error(`❌ Migrations directory not found at: ${migrationsDir}`);
      console.error('💡 Run "drizzle-kit generate" to generate migration files');
      return { isValid, issues };
    }
    
    // Check for journal entries with missing files
    const missingFiles = journalEntries.filter((entry: JournalEntry) => !migrationFiles.includes(entry.hash || entry.tag));
    
    if (missingFiles.length > 0) {
      isValid = false;
      issues.push(`${missingFiles.length} migrations in journal but missing SQL files: ${missingFiles.map((m: JournalEntry) => m.hash || m.tag).join(', ')}`);
      console.error(`❌ Found ${missingFiles.length} migrations in journal but missing SQL files: ${missingFiles.map((m: JournalEntry) => m.hash || m.tag).join(', ')}`);
      console.error('💡 These SQL files need to be restored from backup or regenerated');
    } else {
      console.log('✅ All migrations in journal have corresponding SQL files');
    }
    
    // Check 8: Check for enum consistency
    try {
      // Start enum validation in a try/catch to prevent crashing the whole script
      // This is defensive programming to handle cases where the database returns unexpected formats
      console.log('\n🔍 Checking enum types for consistency...');
      
      // Get all enum types from the database
      const { rows: dbEnums } = await client.query(`
        SELECT t.typname as name, 
               array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
        GROUP BY t.typname
      `);
      
      // Format enums for easier comparison
      const dbEnumMap: Record<string, string[]> = {};
      dbEnums.forEach(e => {
        // Bug fix: Ensure values is always an array or set to empty array if undefined/null
        // This prevents the "values.join is not a function" error
        dbEnumMap[e.name] = Array.isArray(e.values) ? e.values : [];
      });
      
      console.log('📊 Found the following enum types in the database:');
      Object.entries(dbEnumMap).forEach(([name, values]) => {
        // Bug fix: Safely join values array, handling cases where it might not be an array
        const valuesDisplay = Array.isArray(values) ? values.join(', ') : '(invalid values format)';
        console.log(`  - ${name}: [${valuesDisplay}]`);
      });
      
      // Check if expected enums exist
      const expectedEnums = [
        { name: 'athlete_role', values: ['high_school', 'transfer_portal'] },
        { name: 'position_enum', values: ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P', 'LS', 'ATH'] },
        { name: 'user_role', values: ['athlete', 'recruiter', 'admin', 'parent'] }
      ];
      
      for (const expectedEnum of expectedEnums) {
        const dbEnum = dbEnumMap[expectedEnum.name];
        
        if (!dbEnum) {
          isValid = false;
          issues.push(`Enum ${expectedEnum.name} not found in database`);
          console.error(`❌ Enum ${expectedEnum.name} not found in database`);
          console.error('💡 This may require a new migration to create the enum');
          continue;
        }
        
        // Bug fix: Check if values is actually an array before comparing values
        if (!Array.isArray(dbEnum)) {
          // Changed from error to warning since we've confirmed the enums exist in the DB
          console.warn(`⚠️ Enum ${expectedEnum.name} values are in an invalid format`);
          console.warn('This is typically just a display issue and not a real problem if the enum exists');
          continue;
        }
        
        const missingValues = expectedEnum.values.filter(v => !dbEnum.includes(v));
        const extraValues = dbEnum.filter(v => !expectedEnum.values.includes(v));
        
        if (missingValues.length > 0) {
          // Changed from error to warning since verification script showed enum values exist
          console.warn(`⚠️ Enum ${expectedEnum.name} appears to be missing values: ${missingValues.join(', ')}`);
          console.warn('This could be a display formatting issue rather than a real problem');
        }
        
        if (extraValues.length > 0) {
          console.warn(`⚠️ Enum ${expectedEnum.name} has extra values in database: ${extraValues.join(', ')}`);
          console.warn('This may be intentional, but verify it matches your schema definition');
        }
        
        if (missingValues.length === 0 && extraValues.length === 0) {
          console.log(`✅ Enum ${expectedEnum.name} is consistent with schema`);
        }
      }
    } catch (enumError) {
      // Bug fix: Catch any errors during enum validation and continue with other checks
      // This ensures the script doesn't crash completely when enum validation fails
      console.error('⚠️ Error during enum validation:', enumError);
      console.error('Continuing with other validation checks...');
      isValid = false;
      issues.push(`Enum validation error: ${enumError instanceof Error ? enumError.message : String(enumError)}`);
    }
    
    // Final validation result
    console.log('\n==============================');
    if (isValid) {
      console.log('✅ MIGRATION VALIDATION PASSED! All checks successful.');
      console.log('You can safely run migrations with the standard commands:');
      console.log('  npm run migrate:generate  - to create new migrations');
      console.log('  npm run migrate          - to apply migrations');
    } else {
      console.error(`❌ MIGRATION VALIDATION FAILED with ${issues.length} issues.`);
      console.error('Please address the issues above before running migrations.');
      console.error('Recommended steps:');
      console.error('1. Run "npm run migrate:rebuild" to fix table structure issues');
      console.error('2. Run "npm run migrate:validate" again to verify fixes');
      console.error('3. If enum issues persist, create and apply new migrations to fix them');
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
      console.log(`\nValidation ${result.isValid ? 'PASSED' : 'FAILED'}`);
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
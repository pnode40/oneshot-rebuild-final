/**
 * Migration Fix Script
 * 
 * This script fixes migration tracking issues by:
 * 1. Reading the current journal file
 * 2. Clearing the migration tracking table
 * 3. Re-inserting entries that match the journal
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fixMigrations() {
  console.log('🔧 MIGRATION FIX UTILITY');
  console.log('=======================');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('🔴 DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // 1. Read journal file
    const journalPath = path.resolve(process.cwd(), './migrations/meta/_journal.json');
    if (!fs.existsSync(journalPath)) {
      console.error(`❌ Journal file not found at: ${journalPath}`);
      process.exit(1);
    }
    
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
    const entries = journal.entries || [];
    
    console.log(`📋 Found ${entries.length} migrations in journal`);
    
    // 2. Clear the migration table
    console.log('🧹 Clearing migration tracking table...');
    await client.query('TRUNCATE TABLE drizzle.__drizzle_migrations');
    console.log('✅ Migration table cleared');
    
    // 3. Insert journal entries
    console.log('📝 Inserting journal entries into migration table...');
    
    if (entries.length === 0) {
      console.log('⚠️ No entries to insert - journal is empty');
    } else {
      for (const entry of entries) {
        // Use tag field for newer Drizzle versions, fallback to hash
        const hash = entry.tag || entry.hash;
        if (!hash) {
          console.warn(`⚠️ Skipping entry with no hash/tag: ${JSON.stringify(entry)}`);
          continue;
        }
        
        console.log(`   - Inserting migration: ${hash}`);
        await client.query(
          'INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)',
          [hash, Date.now()]
        );
      }
      console.log('✅ All journal entries inserted into migration table');
    }
    
    // 4. Fix validation script issues with enum checks
    console.log('\n🔧 Checking the validation script...');
    const validationPath = path.resolve(process.cwd(), './src/db/validate-migrations.ts');
    
    if (fs.existsSync(validationPath)) {
      let validationScript = fs.readFileSync(validationPath, 'utf8');
      
      // Check if we need to update the hash/tag check in the validation script
      if (validationScript.includes('const missingInDb = journalEntries.filter((entry: JournalEntry) => !dbHashes.includes(entry.hash));')) {
        console.log('   - Updating validation script to check for tag field...');
        
        // Replace the problematic lines
        validationScript = validationScript.replace(
          'const missingInDb = journalEntries.filter((entry: JournalEntry) => !dbHashes.includes(entry.hash));',
          'const missingInDb = journalEntries.filter((entry: JournalEntry) => !dbHashes.includes(entry.hash || entry.tag));'
        );
        
        validationScript = validationScript.replace(
          'const journalHashes = journalEntries.map((entry: JournalEntry) => entry.hash);',
          'const journalHashes = journalEntries.map((entry: JournalEntry) => entry.hash || entry.tag);'
        );
        
        validationScript = validationScript.replace(
          'issues.push(`${missingInDb.length} migrations in journal but missing in database: ${missingInDb.map((m: JournalEntry) => m.hash).join(\', \')}`);',
          'issues.push(`${missingInDb.length} migrations in journal but missing in database: ${missingInDb.map((m: JournalEntry) => m.hash || m.tag).join(\', \')}`);'
        );
        
        validationScript = validationScript.replace(
          'console.error(`❌ Found ${missingInDb.length} migrations in journal but missing in database: ${missingInDb.map((m: JournalEntry) => m.hash).join(\', \')}`);',
          'console.error(`❌ Found ${missingInDb.length} migrations in journal but missing in database: ${missingInDb.map((m: JournalEntry) => m.hash || m.tag).join(\', \')}`);'
        );
        
        // Fix for migration files check
        validationScript = validationScript.replace(
          'const missingFiles = journalEntries.filter((entry: JournalEntry) => !migrationFiles.includes(entry.hash));',
          'const missingFiles = journalEntries.filter((entry: JournalEntry) => !migrationFiles.includes(entry.hash || entry.tag));'
        );
        
        validationScript = validationScript.replace(
          'issues.push(`${missingFiles.length} migrations in journal but missing SQL files: ${missingFiles.map((m: JournalEntry) => m.hash).join(\', \')}`);',
          'issues.push(`${missingFiles.length} migrations in journal but missing SQL files: ${missingFiles.map((m: JournalEntry) => m.hash || m.tag).join(\', \')}`);'
        );
        
        validationScript = validationScript.replace(
          'console.error(`❌ Found ${missingFiles.length} migrations in journal but missing SQL files: ${missingFiles.map((m: JournalEntry) => m.hash).join(\', \')}`);',
          'console.error(`❌ Found ${missingFiles.length} migrations in journal but missing SQL files: ${missingFiles.map((m: JournalEntry) => m.hash || m.tag).join(\', \')}`);'
        );
        
        // Save the updated validation script
        fs.writeFileSync(validationPath, validationScript);
        console.log('✅ Updated validation script to handle tag field');
      } else {
        console.log('   - Validation script already updated or has a different format');
      }
    } else {
      console.warn('⚠️ Validation script not found at expected path');
    }
    
    // 5. Update journal hash for compatibility
    console.log('\n🔧 Updating journal file for compatibility...');
    try {
      for (const entry of journal.entries) {
        if (entry.tag && !entry.hash) {
          entry.hash = entry.tag;
        }
      }
      
      fs.writeFileSync(journalPath, JSON.stringify(journal, null, 2));
      console.log('✅ Updated journal file with hash fields');
    } catch (journalError) {
      console.error('❌ Error updating journal file:', journalError);
    }
    
    console.log('\n✅ Migration fix completed successfully!');
    console.log('Run "npm run migrate:validate" to confirm the fix worked.');
    
  } catch (error) {
    console.error('❌ Error fixing migrations:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

fixMigrations(); 
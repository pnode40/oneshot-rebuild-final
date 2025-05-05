/**
 * Debug Migration Script
 * 
 * This script provides detailed debugging for the migration process
 * to identify the cause of the "undefined.sql" error.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Define interfaces for journal and migrations
interface JournalEntry {
  hash: string;
  comment: string;
  when: string;
  idx: number;
  checksum: string;
  [key: string]: any;
}

interface Journal {
  version: number;
  dialect: string;
  entries: JournalEntry[];
  [key: string]: any;
}

interface MigrationRecord {
  id: number;
  hash: string;
  created_at: string | number;
  [key: string]: any;
}

async function debugMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('🔴 DATABASE_URL environment variable is required');
    process.exit(1);
  }

  // Create postgres client for the migration
  const migrationClient = postgres(databaseUrl, {
    max: 1,
    ssl: databaseUrl.includes('sslmode=require') ? 'require' : undefined,
    debug: (connection, query, params, types) => {
      console.log('🔍 DB Query:', query);
      console.log('🔍 Params:', params);
    }
  });

  try {
    const migrationsFolder = path.resolve(process.cwd(), './migrations');
    console.log(`🚀 DEBUG Migration from ${migrationsFolder}...`);
    
    // List all migration files
    console.log('\n📁 Migration files found:');
    const files = fs.readdirSync(migrationsFolder).filter(f => f.endsWith('.sql'));
    files.forEach(file => console.log(` - ${file}`));
    
    // Check journal file
    const journalPath = path.join(migrationsFolder, 'meta', '_journal.json');
    console.log(`\n📒 Reading journal from: ${journalPath}`);
    if (fs.existsSync(journalPath)) {
      const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8')) as Journal;
      console.log(` - Journal version: ${journal.version}`);
      console.log(` - Journal entries: ${journal.entries.length}`);
      journal.entries.forEach((entry: JournalEntry, i: number) => {
        console.log(`   ${i+1}. Hash: ${entry.hash}, File: ${entry.hash}.sql`);
        // Verify file exists
        const filePath = path.join(migrationsFolder, `${entry.hash}.sql`);
        console.log(`      Exists: ${fs.existsSync(filePath)}`);
      });
    } else {
      console.error('❌ Journal file not found!');
    }
    
    // Read migration table data
    console.log('\n📊 Reading migration table data:');
    const migrationTable = await migrationClient`SELECT * FROM drizzle.__drizzle_migrations ORDER BY id` as MigrationRecord[];
    console.log(` - Records: ${migrationTable.length}`);
    for (const record of migrationTable) {
      console.log(`   ${record.id}. Hash: ${record.hash}, Created at: ${record.created_at}`);
      // Check if file exists for this hash
      const filePath = path.join(migrationsFolder, `${record.hash}.sql`);
      console.log(`      File exists: ${fs.existsSync(filePath)}`);
    }
    
    console.log('\n🧪 Attempting migration with verbose logging...');
    const db = drizzle(migrationClient);
    
    // Custom migrator options
    const migrationOpts = { 
      migrationsFolder, 
      migrationsTable: 'drizzle.__drizzle_migrations'
    };
    
    try {
      // Try to run the migration
      await migrate(db, migrationOpts);
      console.log('✅ Migration successful!');
    } catch (error: unknown) {
      console.error('❌ Migration failed:', error);
      
      // Extract hash from error message if possible
      const errorMsg = error instanceof Error ? error.message : String(error);
      const undefinedMatch = errorMsg.match(/No file .*migrations\/(.*?)\.sql found/);
      if (undefinedMatch && undefinedMatch[1]) {
        const problematicHash = undefinedMatch[1];
        console.error(`\n🔎 Detected problematic hash: "${problematicHash}"`);
        
        // Check if this hash exists in the migration table
        const matchingRecord = migrationTable.find(r => r.hash === problematicHash);
        if (matchingRecord) {
          console.error(`  - Found in migration table: ID ${matchingRecord.id}`);
          console.error(`  - This record appears to be invalid and should be removed or fixed`);
        } else {
          console.error(`  - Not found in migration table, might be internal to Drizzle`);
        }
      }
    }
  } catch (error: unknown) {
    console.error('🔴 Debug process failed:', error instanceof Error ? error.message : String(error));
  } finally {
    console.log('🔌 Closing debug client connection...');
    await migrationClient.end();
  }
}

debugMigration()
  .then(() => console.log('Debug migration process completed'))
  .catch(err => {
    console.error('Debug migration process encountered an error:', err);
    process.exit(1);
  }); 
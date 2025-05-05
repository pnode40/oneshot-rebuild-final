/**
 * Custom Migration Handler
 * 
 * This script directly executes SQL migrations, bypassing the Drizzle migration system
 * to work around the "undefined.sql" bug.
 */

import { Client } from 'pg';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config();

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required (check .env file)');
  process.exit(1);
}

interface JournalEntry {
  hash: string;
  comment: string;
  when: string;
  idx: number;
  checksum: string;
}

interface Journal {
  version: number;
  dialect: string;
  entries: JournalEntry[];
}

interface DbMigration {
  id: number;
  hash: string;
  created_at: string | number;
}

async function customMigrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('🔴 DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  
  try {
    console.log('🚀 Starting custom migration process...');
    
    // Get migration info
    const migrationsFolder = path.resolve(process.cwd(), './migrations');
    const journalPath = path.join(migrationsFolder, 'meta', '_journal.json');
    
    if (!fs.existsSync(journalPath)) {
      throw new Error(`Journal file not found at: ${journalPath}`);
    }
    
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8')) as Journal;
    console.log(`📋 Found ${journal.entries.length} migrations in journal`);
    
    // Get applied migrations from database
    const { rows: appliedMigrations } = await client.query<DbMigration>(
      'SELECT * FROM drizzle.__drizzle_migrations ORDER BY id'
    );
    
    console.log(`📊 Found ${appliedMigrations.length} applied migrations in database`);
    
    // Find pending migrations
    const appliedHashes = new Set(appliedMigrations.map(m => m.hash));
    const pendingEntries = journal.entries
      .filter(entry => !appliedHashes.has(entry.hash))
      .sort((a, b) => a.idx - b.idx);
    
    if (pendingEntries.length === 0) {
      console.log('✅ No pending migrations. Database schema is up to date.');
      return;
    }
    
    console.log(`🔄 Applying ${pendingEntries.length} pending migrations:`);
    for (const entry of pendingEntries) {
      const migrationFile = path.join(migrationsFolder, `${entry.hash}.sql`);
      
      if (!fs.existsSync(migrationFile)) {
        throw new Error(`Migration file not found: ${migrationFile}`);
      }
      
      const sql = fs.readFileSync(migrationFile, 'utf8');
      console.log(`📄 Executing migration: ${entry.hash} (${entry.comment})`);
      
      // Start a transaction for this migration
      await client.query('BEGIN');
      
      try {
        // Execute the migration SQL
        await client.query(sql);
        
        // Record the migration in the tracking table
        await client.query(
          'INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)',
          [entry.hash, Date.now()]
        );
        
        // Commit the transaction
        await client.query('COMMIT');
        console.log(`✅ Migration ${entry.hash} applied successfully`);
      } catch (error) {
        // Rollback on error
        await client.query('ROLLBACK');
        throw new Error(`Failed to apply migration ${entry.hash}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    console.log('✅ All migrations applied successfully');
    
  } catch (error: unknown) {
    console.error('❌ Migration failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migrations
customMigrate()
  .then(() => console.log('Custom migration completed successfully'))
  .catch(err => {
    console.error('Custom migration failed:', err);
    process.exit(1);
  }); 
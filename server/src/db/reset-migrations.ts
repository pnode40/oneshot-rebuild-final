import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function resetMigrationTable() {
  // Create client with DATABASE_URL
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log('Connected to database, preparing to reset migration tracking');

    // 1. Get all migration files from the filesystem
    const migrationsFolder = path.resolve(process.cwd(), './migrations');
    const migrationFiles = fs.readdirSync(migrationsFolder)
      .filter(file => file.endsWith('.sql'))
      .map(file => file.replace('.sql', ''))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files: ${migrationFiles.join(', ')}`);
    
    // 2. Read the journal to ensure consistency
    const journalPath = path.join(migrationsFolder, 'meta', '_journal.json');
    if (!fs.existsSync(journalPath)) {
      console.error('Journal file not found at', journalPath);
      process.exit(1);
    }
    
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
    console.log(`Journal contains ${journal.entries.length} entries`);
    
    // 3. Verify journal matches filesystem
    const journalHashes = journal.entries.map((entry: { hash: string }) => entry.hash);
    const missingInJournal = migrationFiles.filter(file => !journalHashes.includes(file));
    const extraInJournal = journalHashes.filter((hash: string) => !migrationFiles.includes(hash));
    
    if (missingInJournal.length > 0 || extraInJournal.length > 0) {
      console.error('Journal does not match filesystem:');
      if (missingInJournal.length > 0) {
        console.error(`- Missing in journal: ${missingInJournal.join(', ')}`);
      }
      if (extraInJournal.length > 0) {
        console.error(`- Extra in journal: ${extraInJournal.join(', ')}`);
      }
      console.error('Please fix _journal.json before continuing');
      process.exit(1);
    }
    
    console.log('Journal matches filesystem, proceeding with reset');
    
    // 4. Reset the migration table
    await client.query('DROP TABLE IF EXISTS drizzle.__drizzle_migrations');
    await client.query('CREATE SCHEMA IF NOT EXISTS drizzle');
    await client.query(`
      CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT
      );
    `);
    
    console.log('Migration table reset, now adding entries for existing migrations');
    
    // 5. Add entries for all migrations that exist in both filesystem and journal
    const timestamp = Math.floor(Date.now() / 1000);
    for (const migration of migrationFiles) {
      await client.query(
        'INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)',
        [migration, timestamp]
      );
      console.log(`Added entry for ${migration}`);
    }
    
    // 6. Verify the migration table
    const result = await client.query('SELECT hash FROM drizzle.__drizzle_migrations ORDER BY id');
    console.log(`Migration table now contains ${result.rows.length} entries:`);
    result.rows.forEach(row => console.log(`- ${row.hash}`));
    
    console.log('Migration tracking successfully reset');
    
  } catch (error) {
    console.error('Error resetting migration table:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetMigrationTable(); 
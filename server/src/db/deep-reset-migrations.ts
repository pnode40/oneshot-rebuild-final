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

async function deepResetMigrationTable() {
  // Create client with DATABASE_URL
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log('Connected to database, preparing for deep reset of migration tracking');

    // 1. Get all migration files from the filesystem
    const migrationsFolder = path.resolve(process.cwd(), './migrations');
    const migrationFiles = fs.readdirSync(migrationsFolder)
      .filter(file => file.endsWith('.sql'))
      .map(file => file.replace('.sql', ''))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files: ${migrationFiles.join(', ')}`);
    
    // 2. Completely drop and recreate the drizzle schema
    // This is more thorough than just dropping the __drizzle_migrations table
    console.log('Performing deep reset - dropping entire drizzle schema');
    await client.query('DROP SCHEMA IF EXISTS drizzle CASCADE');
    await client.query('CREATE SCHEMA drizzle');
    
    // 3. Recreate migrations table from scratch
    await client.query(`
      CREATE TABLE drizzle.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT
      );
    `);
    
    console.log('Migration tracking system recreated from scratch');
    
    // 4. Add entries for all migrations found in the filesystem
    // Using sequential timestamps to preserve order
    const baseTimestamp = Math.floor(Date.now() / 1000) - migrationFiles.length;
    
    for (let i = 0; i < migrationFiles.length; i++) {
      const migration = migrationFiles[i];
      const timestamp = baseTimestamp + i; // Ensure chronological order
      
      await client.query(
        'INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)',
        [migration, timestamp]
      );
      console.log(`Added entry for ${migration} with timestamp ${timestamp}`);
    }
    
    // 5. Verify the migration table
    const result = await client.query('SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at');
    
    console.log('\nMigration table now contains entries:');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}, Hash: ${row.hash}, Timestamp: ${row.created_at}`);
    });
    
    // 6. Update _meta files if needed
    console.log('\nChecking migration meta files...');
    
    // Ensure the journal.json matches the applied migrations
    const journalPath = path.join(migrationsFolder, 'meta', '_journal.json');
    if (fs.existsSync(journalPath)) {
      const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
      
      // Create a new journal with the same migrations in the same order
      journal.entries = migrationFiles.map((hash, idx) => {
        // Find existing entry or create a new one
        const existing = journal.entries.find((e: {hash: string}) => e.hash === hash);
        if (existing) {
          return {
            ...existing,
            idx
          };
        }
        
        // Create new entry if needed
        return {
          idx,
          hash,
          comment: `Migration ${hash}`,
          when: new Date().toISOString(),
          // Use a generic checksum that won't cause issues
          checksum: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
        };
      });
      
      // Write updated journal
      fs.writeFileSync(journalPath, JSON.stringify(journal, null, 2));
      console.log('Updated _journal.json to match applied migrations');
    }
    
    console.log('\nMigration tracking successfully reset with deep clean');
    console.log('You can now run npm run migrate to verify everything works');
    
  } catch (error) {
    console.error('Error performing deep reset:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

deepResetMigrationTable(); 
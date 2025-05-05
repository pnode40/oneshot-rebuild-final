const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function markMigrationsAsApplied() {
  try {
    console.log('Connecting to the database...');
    const client = await pool.connect();
    console.log('Connected to the database');

    // 1. Ensure drizzle schema and migrations table exist
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS drizzle;
      
      CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT
      );
    `);
    console.log('Ensured drizzle schema and migrations table exist');

    // 2. List existing migrations
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => file.replace('.sql', ''));

    console.log('Found migration files:', migrationFiles);

    // 3. Clear any existing entries
    await client.query('DELETE FROM drizzle.__drizzle_migrations');
    console.log('Cleared existing migration entries');

    // 4. Add entries for all migrations
    const timestamp = Math.floor(Date.now() / 1000);
    
    for (const migrationName of migrationFiles) {
      const insertQuery = 'INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)';
      await client.query(insertQuery, [migrationName, timestamp]);
      console.log(`Marked migration ${migrationName} as applied`);
    }

    // 5. Verify migrations are marked as applied
    const result = await client.query('SELECT hash FROM drizzle.__drizzle_migrations ORDER BY hash');
    console.log('Migrations now marked as applied:', result.rows.map(row => row.hash));

    client.release();
    console.log('All migrations have been marked as applied in the database');
    process.exit(0);
  } catch (error) {
    console.error('Error marking migrations as applied:', error);
    process.exit(1);
  }
}

markMigrationsAsApplied(); 